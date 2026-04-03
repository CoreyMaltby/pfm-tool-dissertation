import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/db';
import { use } from 'react';

export const dataService = {
    _summaryInProcess: false,
    _monthlySumaryInProcess: false,

    // Storage Preferences
    async getStorageMode(userId) {
        const { data } = await supabase.from('profiles').select('storage_mode').eq('id', userId).single();
        return data?.storage_mode || 'local';
    },

    async updateStorageMode(userId, newMode) {
        const { error } = await supabase.from('profiles').update({
            storage_mode: newMode,
            last_synced_at: new Date().toISOString()
        }).eq('id', userId);
        if (error) throw error;
        return newMode;
    },

    async updateLastSynced(userId) {
        await supabase.from('profiles').update({ last_synced_at: new Date().toISOString() }).eq('id', userId);
    },

    async syncOfflineChanges(userId) {
        const offlineTxs = await db.transactions.where('synced').equals(0).toArray();
        if (offlineTxs.length > 0) {
            const { error } = await supabase.from('transactions').upsert(
                offlineTxs.map(({ synced, updated_at, ...tx }) => tx)
            );
            if (!error) {
                await db.transactions.where('id').anyOf(offlineTxs.map(t => t.id)).modify({ synced: 1 });
                await this.updateLastSynced(userId);
                await this.triggerSyncAlert(userId, offlineTxs.length);
            }
        }
    },

    // Data Migration
    async migrateLocalToCloud(userId) {
        // Fetch all local data
        const [accs, budgets, goals, txs] = await Promise.all([
            db.accounts.where('user_id').equals(userId).toArray(),
            db.budgets.where('user_id').equals(userId).toArray(),
            db.savings_goals.where('user_id').equals(userId).toArray(),
            db.transactions.where('user_id').equals(userId).toArray()
        ]);

        // Removes dexie metadata
        const scrub = (data) => data.map(({ synced, updated_at, ...item }) => item);

        try {
            // Accounts
            if (accs.length > 0) {
                const { error } = await supabase.from('accounts').upsert(scrub(accs));
                if (error) throw new Error(`Accounts Migration Failed: ${error.message}`);
            }

            // Budgets & Savings Goals
            if (budgets.length > 0) {
                const { error } = await supabase.from('budgets').upsert(scrub(budgets));
                if (error) throw new Error(`Budgets Migration Failed: ${error.message}`);
            }
            if (goals.length > 0) {
                const { error } = await supabase.from('savings_goals').upsert(scrub(goals));
                if (error) throw new Error(`Savings Goals Migration Failed: ${error.message}`);
            }

            // Transactions
            if (txs.length > 0) {
                const cloudTxs = txs.map(({ user_id, synced, updated_at, ...rest }) => rest);
                const { error } = await supabase.from('transactions').upsert(cloudTxs);
                if (error) throw new Error(`Transactions Migration Failed: ${error.message}`);
            }

            await this.updateStorageMode(userId, 'cloud');

            await Promise.all([
                db.accounts.where('user_id').equals(userId).delete(),
                db.budgets.where('user_id').equals(userId).delete(),
                db.savings_goals.where('user_id').equals(userId).delete(),
                db.transactions.where('user_id').equals(userId).delete()
            ]);
            await this.triggerSyncAlert(userId, txs.length);
            return { success: true };
        } catch (error) {
            console.error("Migration error: ", error);
            // Stops function so local data isnt deleted
            throw error;
        }
    },

    async migrateCloudToLocal(userId) {
        try {
            // Fetch all cloud data
            const [accsRes, budgRes, goalsRes, txsRes] = await Promise.all([
                supabase.from('accounts').select('*').eq('user_id', userId),
                supabase.from('budgets').select('*').eq('user_id', userId),
                supabase.from('savings_goals').select('*').eq('user_id', userId),
                supabase.from('transactions').select('*, accounts!inner(user_id)').eq('accounts.user_id', userId)
            ]);

            if (accsRes.error || budgRes.error || goalsRes.error || txsRes.error) {
                throw new Error("Failed to fetch data from Cloud for migration.");
            }

            const localAccounts = accsRes.data.map(a => ({ ...a, synced: 1 }));
            const localBudgets = budgRes.data.map(b => ({ ...b, synced: 1 }));
            const localGoals = goalsRes.data.map(g => ({ ...g, synced: 1 }));

            const localTransactions = txsRes.data.map(({ accounts, ...t }) => ({
                ...t,
                user_id: userId,
                synced: 1
            }));

            // Overwrites any existing local data
            await Promise.all([
                db.accounts.bulkPut(localAccounts),
                db.budgets.bulkPut(localBudgets),
                db.savings_goals.bulkPut(localGoals),
                db.transactions.bulkPut(localTransactions)
            ]);

            await this.updateStorageMode(userId, 'local');

            if (txsRes.data.length > 0) {
                await supabase.from('transactions')
                    .delete()
                    .in('id', txsRes.data.map(t => t.id));
            }

            await Promise.all([
                supabase.from('budgets').delete().eq('user_id', userId),
                supabase.from('savings_goals').delete().eq('user_id', userId),
                supabase.from('accounts').delete().eq('user_id', userId)
            ]);

            return { success: true };
        } catch (error) {
            console.error("Migration error: ", error);
            // Stops function
            throw error;
        }
    },

    // Transactions
    async fetchRecentTransactions(userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            const { data } = await supabase
                .from('transactions')
                .select(`
                    *,
                    category:categories(name, icon),
                    merchant:merchants(name),
                    accounts!inner(user_id)
                `)
                .eq('accounts.user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            return data || [];
        } else {
            const txs = await db.transactions.where('user_id').equals(userId).reverse().limit(10).toArray();
            return await Promise.all(txs.map(async (tx) => {
                const category = await db.categories.get(tx.category_id);
                const merchant = await db.merchants.get(tx.merchant_id);
                return { ...tx, category, merchant };
            }));
        }
    },

    async saveTransaction(transaction, userId) {
        const mode = await this.getStorageMode(userId);
        let result;

        if (mode === 'cloud' && navigator.onLine) {
            const { data, error } = await supabase.from('transactions').insert([{ ...transaction }]).select();
            if (error) throw error;
            await db.transactions.put({ ...data[0], synced: 1, updated_at: new Date().toISOString() });
            result = data[0];
        } else {
            const txData = {
                ...transaction,
                user_id: userId,
                synced: mode === 'cloud' ? 0 : 1,
                updated_at: new Date().toISOString()
            };
            const id = await db.transactions.put(txData);
            result = { ...txData, id };
        }

        // Updates balance and checks budgets
        if (transaction.amount < 0) {
            await this.adjustAccountBalance(transaction.account_id, transaction.amount, userId);
            await this.checkBudgetThresholds(userId, transaction.category_id);
            await this.checkSpendingFrequency(userId, transaction.category_id);
        }
        return result;
    },

    async deleteTransaction(transaction, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
            if (error) throw error;
        } else {
            await db.transactions.delete(transaction.id);
        }
        // Update Balance
        await this.adjustAccountBalance(transaction.account_id, -transaction.amount, userId);
    },

    async updateTransaction(newTx, oldTx, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('transactions').update(newTx).eq('id', newTx.id);
            if (error) throw error;
        } else {
            await db.transactions.put({ ...newTx, user_id: userId });
        }

        // Update Balance
        const difference = Number(newTx.amount) - Number(oldTx.amount);
        await this.adjustAccountBalance(newTx.account_id, difference, userId);
    },

    async fetchAllTransactions(userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    category:categories(name, icon),
                    merchant:merchants(name),
                    account:accounts(name) 
                    `)
                .eq('accounts.user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } else {
            const txs = await db.transactions.where('user_id').equals(userId).reverse().toArray();
            return await Promise.all(txs.map(async (tx) => {
                const category = await db.categories.get(tx.category_id);
                const merchant = await db.merchants.get(tx.merchant_id);
                return { ...tx, category, merchant };
            }));
        }
    },

    async importTransactions(userId, rawRows) {
        const mode = await this.getStorageMode(userId);

        // Fetch lookup data
        const [categories, accounts] = await Promise.all([
            this.fetchCategories(userId),
            this.fetchAccounts(userId)
        ]);

        const processedTransactions = [];

        for (const row of rawRows) {
            let merchantId;
            const existingMerchants = await this.fetchMerchants();
            const match = existingMerchants.find(m => m.name.toLowerCase() === row.merchant.toLowerCase());
            if (match) {
                merchantId = match.id;
            } else {
                const newMerchant = await this.addMerchant({ name: row.merchant }, userId);
                merchantId = newMerchant.id;
            }

            const cat = categories.find(c => c.name.toLowerCase() === row.category.toLowerCase()) || categories.find(c => c.name === 'General');
            const acc = accounts.find(a => a.name.toLowerCase() === row.account.toLowerCase()) || accounts[0];

            processedTransactions.push({
                user_id: userId,
                amount: parseFloat(row.amount),
                description: row.description || '',
                merchant_id: merchantId,
                category_id: cat?.id,
                account_id: acc?.id,
                created_at: new Date(row.date).toISOString()
            });
        }

        if (mode === 'cloud') {
            const { error } = await supabase.from('transactions').insert(processedTransactions);
            if (error) throw error;
        } else {
            await db.transactions.bulkAdd(processedTransactions.map(tx => ({ ...tx, synced: 1 })));
        }

        for (const tx of processedTransactions) {
            await this.adjustAccountBalance(tx.account_id, tx.amount, userId);
        }
        return processedTransactions.length;
    },

    // Budgets
    async fetchBudgets(userId) {
        const mode = await this.getStorageMode(userId);
        const calculateSpent = (txs, catId) =>
            txs.filter(t => t.category_id === catId && t.amount < 0)
                .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

        if (mode === 'cloud') {
            const [budgetsRes, txsRes] = await Promise.all([
                supabase.from('budgets').select('*, category:categories(name, icon)').eq('user_id', userId),
                supabase.from('transactions').select('amount, category_id, accounts!inner(user_id)').eq('accounts.user_id', userId)
            ]);

            return (budgetsRes.data || []).map(b => ({
                ...b,
                amount: Number(b.limit_amount) || 0,
                spent: calculateSpent(txsRes.data || [], b.category_id)
            }));
        } else {
            const [budgets, txs] = await Promise.all([
                db.budgets.where('user_id').equals(userId).toArray(),
                db.transactions.where('user_id').equals(userId).toArray()
            ]);
            return await Promise.all(budgets.map(async (b) => {
                const category = await db.categories.get(b.category_id);
                return {
                    ...b,
                    category,
                    amount: Number(b.limit_amount) || 0,
                    spent: calculateSpent(txs, b.category_id)
                };
            }));
        }
    },

    async saveBudget(budget, userId) {
        const mode = await this.getStorageMode(userId);

        const payload = {
            user_id: userId,
            category_id: budget.category_id,
            limit_amount: Number(budget.amount),
            is_monthly: true
        };

        if (mode === 'cloud') {
            const { data, error } = await supabase.from('budgets').upsert(payload).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.budgets.put({ ...payload, synced: 1, updated_at: new Date().toISOString() });
            return { ...payload, id };
        }
    },

    async updateBudget(budget, userId) {
        const mode = await this.getStorageMode(userId);

        const payload = {
            category_id: budget.category_id,
            limit_amount: Number(budget.amount),
            user_id: userId
        };

        if (mode === 'cloud') {
            const { error } = await supabase
                .from('budgets')
                .update(payload)
                .eq('id', budget.id)
                .eq('user_id', userId);

            if (error) throw error;
        } else {
            await db.budgets.put({ ...payload, id: budget.id, updated_at: new Date().toISOString() });
        }
    },

    async deleteBudget(budgetId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('budgets').delete().eq('id', budgetId).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.budgets.delete(budgetId);
        }
    },

    // Savings Goals
    async fetchSavingsGoals(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data } = await supabase.from('savings_goals').select('*').eq('user_id', userId);
            return data || [];
        } else {
            return await db.savings_goals.where('user_id').equals(userId).toArray();
        }
    },

    async saveSavingsGoal(goal, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('savings_goals').upsert({ ...goal, user_id: userId }).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.savings_goals.put({ ...goal, user_id: userId });
            return { ...goal, id, user_id: userId };
        }
    },

    async updateSavingsGoal(goal, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('savings_goals').update(goal).eq('id', goal.id).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.savings_goals.put({ ...goal, user_id: userId });
        }
    },

    async deleteSavingsGoal(goalId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('savings_goals').delete().eq('id', goalId).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.savings_goals.delete(goalId);
        }
    },

    async addToGoal(contribution, userId) {
        const { goalId, accountId, amount, name } = contribution;
        const mode = await this.getStorageMode(userId);

        let currentGoal;
        if (mode === 'cloud') {
            const { data } = await supabase.from('savings_goals').select('*').eq('id', goalId).single();
            currentGoal = data;
        } else {
            currentGoal = await db.savings_goals.get(goalId);
        }

        const newAmount = (Number(currentGoal.current_amount) || 0) + Number(amount);

        const transactionData = {
            amount: -Math.abs(amount),
            description: `Savings: ${name}`,
            account_id: accountId,
            created_at: new Date().toISOString()
        };

        if (mode === 'cloud') {
            const [goalUpdate, txInsert] = await Promise.all([
                supabase.from('savings_goals').update({
                    current_amount: newAmount,
                    is_completed: newAmount >= currentGoal.target_amount
                }).eq('id', goalId),
                supabase.from('transactions').insert([transactionData])
            ]);

            if (goalUpdate.error) throw goalUpdate.error;
            if (txInsert.error) throw txInsert.error;
        } else {
            await Promise.all([
                db.savings_goals.update(goalId, {
                    current_amount: newAmount,
                    is_completed: newAmount >= currentGoal.target_amount
                }),
                db.transactions.add({ ...transactionData, user_id: userId, synced: 1 })
            ]);
        }

        await this.adjustAccountBalance(accountId, -amount, userId);
        await this.checkGoalMilestones(userId, goalId);
    },

    // Accounts
    async fetchAccounts(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data } = await supabase.from('accounts').select('*').eq('user_id', userId);
            return data || [];
        } else {
            return await db.accounts.where('user_id').equals(userId).toArray();
        }
    },

    async adjustAccountBalance(accountId, amountChange, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data: account } = await supabase.from('accounts').select('current_balance').eq('id', accountId).single();
            if (account) {
                const newBalance = Number(account.current_balance) + Number(amountChange);
                await supabase.from('accounts').update({ current_balance: newBalance }).eq('id', accountId);
            }
        } else {
            const account = await db.accounts.get(accountId);
            if (account) {
                const newBalance = Number(account.current_balance) + Number(amountChange);
                await db.accounts.update(accountId, { current_balance: newBalance });
            }
        }

        await this.checkLowBalance(userId, accountId);
    },

    async updateAccount(account, userId) {
        const mode = await this.getStorageMode(userId);
        const payload = {
            name: account.name,
            type: account.type,
            current_balance: Number(account.current_balance)
        };

        if (mode === 'cloud') {
            const { error } = await supabase
                .from('accounts')
                .update(payload)
                .eq('id', account.id)
                .eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.accounts.update(account.id, payload);
        }
    },

    async deleteAccount(accountId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('accounts').delete().eq('id', accountId).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.accounts.delete(accountId);
        }
    },

    async addAccount(account, userId) {
        const mode = await this.getStorageMode(userId);
        const payload = {
            ...account,
            user_id: userId,
            current_balance: Number(account.current_balance) || 0,
            created_at: new Date().toISOString()
        };

        if (mode === 'cloud') {
            const { data, error } = await supabase.from('accounts').insert([payload]).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.accounts.add(payload);
            return { ...payload, id };
        }
    },

    async transferFunds(transfer, userId) {
        const { fromAccountId, toAccountId, amount, fromAccountName, toAccountName } = transfer;
        const mode = await this.getStorageMode(userId);

        const data = {
            created_at: new Date().toISOString(),
        };

        const outTransaction = {
            ...data,
            amount: -Math.abs(amount),
            description: `Transfer to ${toAccountName}`,
            account_id: fromAccountId,
        };

        const inTransaction = {
            ...data,
            amount: Math.abs(amount),
            description: `Transfer from ${fromAccountName}`,
            account_id: toAccountId,
        };

        if (mode === 'cloud') {
            const { error: errorOut } = await supabase.from('transactions').insert([outTransaction]);
            if (errorOut) throw errorOut;

            const { error: errorIn } = await supabase.from('transactions').insert([inTransaction]);
            if (errorIn) throw errorIn;
        } else {
            await db.transactions.add({ ...outTransaction, user_id: userId, synced: 1 });
            await db.transactions.add({ ...inTransaction, user_id: userId, synced: 1 });
        }

        await this.adjustAccountBalance(fromAccountId, -Math.abs(amount), userId);
        await this.adjustAccountBalance(toAccountId, Math.abs(amount), userId);
    },

    // Categories
    async fetchCategories(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data } = await supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`);
            return data || [];
        } else {
            return await db.categories.filter(c => c.user_id === userId || c.user_id === null).toArray();
        }
    },

    async addCategory(category, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('categories').insert([{ ...category, user_id: userId }]).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.categories.add({ ...category, user_id: userId });
            return { ...category, id, user_id: userId };
        }
    },

    async updateCategory(category, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('categories').update(category).eq('id', category.id).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.categories.put({ ...category, user_id: userId });
        }
    },

    async deleteCategory(categoryId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('categories').delete().eq('id', categoryId).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.categories.delete(categoryId);
        }
    },

    // Merchants
    async fetchMerchants() {
        const { data } = await supabase.from('merchants').select('*');
        const cloudMerchants = data || [];
        const localMerchants = await db.merchants.toArray();
        return [...cloudMerchants, ...localMerchants];
    },

    async addMerchant(merchant, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('merchants').insert([merchant]).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.merchants.add(merchant);
            return { ...merchant, id };
        }
    },

    async updateMerchant(merchant, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            await supabase.from('merchants').update(merchant).eq('id', merchant.id);
        } else {
            await db.merchants.put(merchant);
        }
    },

    async deleteMerchant(merchantId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            await supabase.from('merchants').delete().eq('id', merchantId);
        } else {
            await db.merchants.delete(merchantId);
        }
    },

    //Profile Management
    async fetchProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, storage_mode, notification_preferences, last_login_at, last_summary_at, last_monthly_summary_at')
            .single();
        if (error) throw error;
        return data;
    },

    async updateProfile(userId, updates) {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        if (error) throw error;
    },

    async deleteAllUserData(userId) {
        const mode = await this.getStorageMode(userId);

        await Promise.all([
            db.accounts.where('user_id').equals(userId).delete(),
            db.transactions.where('user_id').equals(userId).delete(),
            db.budgets.where('user_id').equals(userId).delete(),
            db.savings_goals.where('user_id').equals(userId).delete()
        ]);
        if (mode === 'cloud') {
            await Promise.all([
                supabase.from('transactions').delete().filter('account_id', 'in',
                    supabase.from('accounts').select('id').eq('user_id', userId)),
                supabase.from('budgets').delete().eq('user_id', userId),
                supabase.from('savings_goals').delete().eq('user_id', userId),
                supabase.from('accounts').delete().eq('user_id', userId)
            ]);
        }
    },

    async deleteUserAccount(userId) {
        await Promise.all([
            db.accounts.where('user_id').equals(userId).delete(),
            db.transactions.where('user_id').equals(userId).delete(),
            db.budgets.where('user_id').equals(userId).delete(),
            db.savings_goals.where('user_id').equals(userId).delete()
        ]);

        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;

        await supabase.auth.signOut();
    },

    // Notifications
    async fetchNotifications(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            return data || [];
        } else {
            return await db.notifications
                .where('user_id')
                .equals(userId)
                .reverse()
                .toArray();
        }
    },

    async markAllRead(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
        } else {
            await db.notifications.where('user_id').equals(userId).modify({ is_read: true });
        }
    },

    async deleteNotification(id, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            await supabase.from('notifications').delete().eq('id', id)
        } else {
            await db.notifications.delete(id);
        }
    },

    async createNotification(userId, type, message) {
        const mode = await this.getStorageMode(userId);
        const newNote = {
            id: crypto.randomUUID(),
            user_id: userId,
            type,
            message,
            is_read: false,
            created_at: new Date().toISOString()
        };

        if (mode === 'cloud') {
            await supabase.from('notifications').insert([newNote]);
        } else {
            await db.notifications.add(newNote);
        }
    },

    async updateNotificationPrefs(userId, prefs) {
        const { error } = await supabase
            .from('profiles')
            .update({ notification_preferences: prefs })
            .eq('id', userId);
        if (error) throw error;
    },

    async updateNotificationsOnTransaction(userId, prefs) {
        await supabase.from('profiles').update({ notification_preferences: prefs }).eq('id', userId);
    },

    async cleanupNotifications(userId) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', userId)
                .lt('created_at', thirtyDaysAgo);
        } else {
            await db.notifications
                .where('user_id').equals(userId)
                .filter(n => n.created_at < thirtyDaysAgo)
                .delete();
        }
        console.log("[System] Old notifications cleaned up.");
    },

    // Real-time Logic
    async checkBudgetThresholds(userId, categoryId) {
        const budgets = await this.fetchBudgets(userId);
        const target = budgets.find(b => b.category_id === categoryId);

        if (!target || !target.limit_amount) return;

        const spent = Number(target.spent) || 0;
        const limit = Number(target.limit_amount);
        const percent = (spent / limit) * 100;

        if (percent >= 80) {
            const message = `Budget Alert: You've used ${Math.round(percent)}% of your ${target.category?.name || 'assigned'} budget.`;
            await this.createNotification(userId, 'budget', message);
        }
    },

    async updateLastLogin(userId) {
        const now = new Date();
        const mode = await this.getStorageMode(userId);
        const profile = await this.fetchProfile(userId);

        if (profile?.last_login_at) {
            const lastLogin = new Date(profile.last_login_at);
            const diffTime = Math.abs(now - lastLogin);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            console.log(`[Auth Audit] Last login was ${diffDays} days ago.`);

            if (diffDays >= 3 && profile.notification_preferences?.nudge !== false) {
                console.log("[Auth Audit] Triggering Positive Nudge...");
                await this.createNotification(
                    userId,
                    'nudge',
                    "It's been 3 days! Upload your recent transactions to stay on track."
                );
            }
        }

        // Update the timestamp for the NEXT login check
        if (mode === 'cloud') {
            await supabase.from('profiles').update({ last_login_at: now.toISOString() }).eq('id', userId);
        } else {
            await db.profiles.update(userId, { last_login_at: now.toISOString() });
        }
    },

    async checkGoalMilestones(userId, goalId) {
        const goals = await this.fetchSavingsGoals(userId);
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const percent = (goal.current_amount / goal.target_amount) * 100;

        let milestone = null;
        if (percent >= 100) milestone = "Goal Completed!";
        else if (percent >= 80) milestone = "Almost There! You've reached 80% of your goal.";
        else if (percent >= 50) milestone = "Halfway Point! You've reached 50% of your goal.";

        if (milestone) {
            await this.createNotification(userId, 'nudge', `${milestone} for your "${goal.name}" fund.`);
        }
    },

    async triggerSyncAlert(userId, count) {
        await this.createNotification(
            userId,
            'system',
            `Cloud Sync: ${count} transactions were moved to cloud storage.`
        );
    },

    async checkLowBalance(userId, accountId) {
        const mode = await this.getStorageMode(userId);
        let account;

        if (mode === 'cloud') {
            const { data } = await supabase.from('accounts').select('name, current_balance').eq('id', accountId).single();
            account = data;
        } else {
            account = await db.accounts.get(accountId);
        }

        if (!account) return;

        const threshold = 100;
        if (account.current_balance < threshold && account.current_balance >= 0) {
            await this.createNotification(
                userId,
                'low_balance',
                `Low Balance: Your "${account.name}" account is down to £${account.current_balance.toFixed(2)}`
            );
        }

        else if (account.current_balance < 0) {
            await this.createNotification(
                userId,
                'overdraft',
                `Overdraft Alert: Your "${account.name}" account is overdrawn by £${Math.abs(account.current_balance).toFixed(2)}`
            );
        }
    },

    async generateWeeklySummary(userId) {
        // Prevents multiple summaries
        if (this._summaryInProcess) return;
        this._summaryInProcess = true;

        try {
            const now = new Date();
            const profile = await this.fetchProfile(userId);

            const lastSummary = profile?.last_summary_at ? new Date(profile.last_summary_at) : null;
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

            if (lastSummary && (now - lastSummary) < sevenDaysInMs) {
                console.log("[Analytics] Weekly summary not due yet. Next due in:",
                    Math.ceil((sevenDaysInMs - (now - lastSummary)) / (1000 * 60 * 60)) + " hours");
                return;
            }

            console.log("[Analytics] Summary due! Fetching last 7 days of data...");

            // Fetch transactions from the last 7 days
            const sevenDaysAgo = new Date(now.getTime() - sevenDaysInMs).toISOString();
            const mode = await this.getStorageMode(userId);
            let lastWeekTxs = [];

            // Fetch data
            if (mode === 'cloud') {
                const { data } = await supabase
                    .from('transactions')
                    .select('amount, accounts!inner(user_id)')
                    .eq('accounts.user_id', userId)
                    .gte('created_at', sevenDaysAgo);
                lastWeekTxs = data || [];
            } else {
                lastWeekTxs = await db.transactions
                    .where('user_id').equals(userId)
                    .filter(tx => new Date(tx.created_at) >= new Date(sevenDaysAgo))
                    .toArray();
            }

            // Calculate insights
            const totalSpent = lastWeekTxs
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const totalEarned = lastWeekTxs
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

            const surplus = totalEarned - totalSpent;
            let advice = "";

            if (surplus > 50) {
                const suggestion = (surplus * 0.2).toFixed(2);
                advice = ` You have a £${surplus.toFixed(2)} surplus! Why not move £${suggestion} into your savings goals?`;
            }

            // Update last summary timestamp
            if (mode === 'cloud') {
                await supabase.from('profiles').update({ last_summary_at: now.toISOString() }).eq('id', userId);
            } else {
                await db.profiles.update(userId, { last_summary_at: now.toISOString() });
            }

            // Create notification with insights
            if (lastWeekTxs.length > 0) {
                const message = `Weekly Wrap-up: You spent £${totalSpent.toFixed(2)} and earned £${totalEarned.toFixed(2)}.${advice}`;
                await this.createNotification(userId, 'nudge', message);
            } else {
                await this.createNotification(userId, 'nudge', "Weekly Wrap-up: No transactions recorded this week. Start tracking to see your insights!");
            }

            console.log("[Analytics] Weekly summary successfully generated and timestamped.");
        } catch (err) {
            console.error("[Analytics] Error in summary engine:", err);
        } finally {
            this._summaryInProcess = false;
        }
    },

    async generateMonthlySummary(userId) {
        // Prevents multiple summaries
        if (this._monthlySummaryInProcess) return;
        this._monthlySummaryInProcess = true;

        try {
            const now = new Date();
            const profile = await this.fetchProfile(userId);

            const lastSummary = profile?.last_monthly_summary_at ? new Date(profile.last_monthly_summary_at) : null;
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

            if (lastSummary && (now - lastSummary) < thirtyDaysInMs) {
                console.log("[Analytics] Monthly summary not due yet.");
                return;
            }

            console.log("[Analytics] Monthly Summary due! Aggregating 30 days of data...");

            // Fetch transactions from the last 30 days
            const thirtyDaysAgo = new Date(now.getTime() - thirtyDaysInMs).toISOString();
            const mode = await this.getStorageMode(userId);
            let lastMonthTxs = [];

            // Fetch data
            if (mode === 'cloud') {
                const { data } = await supabase
                    .from('transactions')
                    .select('amount, accounts!inner(user_id)')
                    .eq('accounts.user_id', userId)
                    .gte('created_at', thirtyDaysAgo);
                lastMonthTxs = data || [];
            } else {
                lastMonthTxs = await db.transactions
                    .where('user_id').equals(userId)
                    .filter(tx => new Date(tx.created_at) >= new Date(thirtyDaysAgo))
                    .toArray();
            }

            // Calculate insights
            const totalSpent = lastMonthTxs
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const totalEarned = lastMonthTxs
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

            // Update last summary timestamp
            if (mode === 'cloud') {
                await supabase.from('profiles').update({ last_monthly_summary_at: now.toISOString() }).eq('id', userId);
            } else {
                await db.profiles.update(userId, { last_monthly_summary_at: now.toISOString() });
            }

            // Create notification with insights
            if (lastMonthTxs.length > 0) {
                const message = `Monthly Review: In the last 30 days, you spent £${totalSpent.toFixed(2)} and brought in £${totalEarned.toFixed(2)}.`;
                await this.createNotification(userId, 'nudge', message);
            } else {
                await this.createNotification(userId, 'nudge', "Monthly Review: No activity recorded this month. Let's start building better habits!");
            }

            console.log("[Analytics] Monthly summary successfully generated.");
        } catch (err) {
            console.error("[Analytics] Error in monthly summary engine:", err);
        } finally {
            this._monthlySummaryInProcess = false;
        }
    },

    async checkSpendingFrequency(userId, categoryId) {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
        const mode = await this.getStorageMode(userId);
        let recentTxs = [];

        if (mode === 'cloud') {
            const { data } = await supabase
                .from('transactions')
                .select('amount, category:categories(name)')
                .eq('category_id', categoryId)
                .gte('created_at', twentyFourHoursAgo);
            recentTxs = data || [];
        } else {
            recentTxs = await db.transactions
                .where('category_id').equals(categoryId)
                .filter(tx => new Date(tx.created_at) >= new Date(twentyFourHoursAgo))
                .toArray();
        }

        if (recentTxs.length >= 3) {
            const categoryName = recentTxs[0]?.category?.name || "this category";

            await this.createNotification(
                userId,
                'nudge',
                `Activity Insight: You've recorded ${recentTxs.length} transactions in "${categoryName}" within the last 24 hours`
            );
        }
    }
};

export default dataService;