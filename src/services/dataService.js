import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/db';
import { use } from 'react';
import { defaultExternalConditions } from 'vite';

export const dataService = {
    // Storage Preferences
    async getStorageMode(userId) {
        const { data } = await supabase.from('profiles').select('storage_mode').eq('id', userId).single();
        return data?.storage_mode || 'local';
    },

    async updateStorageMode(userId, newMode) {
        const { error } = await supabase.from('profiles').update({ storage_mode: newMode }).eq('id', userId);
        if (error) throw error;
        return newMode
    },

    // Data Migration
    async migrateLocalToCloud(userId) {
        const [txs, budg, goals, accs] = await Promise.all([
            db.transactions.where('user_id').equals(userId).toArray(),
            db.budgets.where('user_id').equals(userId).toArray(),
            db.savings_goals.where('user_id').equals(userId).toArray(),
            db.accounts.where('user_id').equals(userId).toArray()
        ]);

        await Promise.all([
            txs.length > 0 && supabase.from('transactions').upsert(txs),
            budg.length > 0 && supabase.from('budgets').upsert(budg),
            goals.length > 0 && supabase.from('savings_goals').upsert(goals),
            accs.length > 0 && supabase.from('accounts').upsert(accs)
        ]);

        await this.updateStorageMode(userId, 'cloud');

        await Promise.all([
            db.transactions.where('user_id').equals(userId).delete(),
            db.budgets.where('user_id').equals(userId).delete(),
            db.savings_goals.where('user_id').equals(userId).delete(),
            db.accounts.where('user_id').equals(userId).delete()
        ]);
    },

    async migrateCloudToLocal(userId) {
        const [txs, budg, goals, accs] = await Promise.all([
            supabase.from('transactions').select('*, accounts!inner(user_id)').eq('accounts.user_id', userId),
            supabase.from('budgets').select('*').eq('user_id', userId),
            supabase.from('savings_goals').select('*').eq('user_id', userId),
            supabase.from('accounts').select('*').eq('user_id', userId)
        ]);

        await Promise.all([
            txs.data?.length > 0 && db.transactions.bulkAdd(txs.data.map(({ accounts, ...t }) => ({ ...t, user_id: userId }))),
            budg.data?.length > 0 && db.budgets.bulkAdd(budg.data),
            goals.data?.length > 0 && db.savings_goals.bulkAdd(goals.data),
            accs.data?.length > 0 && db.accounts.bulkAdd(accs.data)
        ]);

        await this.updateStorageMode(userId, 'local');
        await Promise.all([
            supabase.from('transactions').delete().in('id', txs.data?.map(t => t.id) || []),
            supabase.from('budgets').delete().eq('user_id', userId),
            supabase.from('savings_goals').delete().eq('user_id', userId),
            supabase.from('accounts').delete().eq('user_id', userId)
        ]);
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
            const txs = await db.transactions.where('user_id').equals(userId).reverse().limit(5).toArray();
            return await Promise.all(txs.map(async (tx) => {
                const category = await db.categories.get(tx.category_id);
                const merchant = await db.merchants.get(tx.merchant_id);
                return { ...tx, category, merchant };
            }));
        }
    },

    async saveTransaction(transaction, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('transactions').insert([{ ...transaction }]).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.transaction.add({ ...transaction, user_id: userId });
            return { ...transaction, id, user_id: userId }
        }
    },

    async deleteTransaction(transactionId, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
            if (error) throw error;
        } else {
            await db.transaction.delete(transactionId);
        }
    },

    async updateTransaction(transaction, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id);
            if (error) throw error;
        } else {
            await db.transactions.put({ ...transaction, user_id: userId });
        }
    },

    // Budgets
    async fetchBudgets(userId) {
        const mode = await this.getStorageMode(userId);

        // Helper to sum up spending for a specific category
        const calculateSpent = (txs, catId) =>
            txs.filter(t => t.category_id === catId && t.amount < 0)
                .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

        if (mode === 'cloud') {
            // Fetch budgets and transactions together to calculate spending
            const [budgetsRes, txsRes] = await Promise.all([
                supabase.from('budgets').select('*, category:categories(name, icon)').eq('user_id', userId),
                supabase.from('transactions').select('amount, category_id, accounts!inner(user_id)').eq('accounts.user_id', userId)
            ]);

            return (budgetsRes.data || []).map(b => ({
                ...b,
                spent: calculateSpent(txsRes.data || [], b.category_id)
            }));
        } else {
            const [budgets, txs] = await Promise.all([
                db.budgets.where('user_id').equals(userId).toArray(),
                db.transactions.where('user_id').equals(userId).toArray()
            ]);

            return await Promise.all(budgets.map(async (b) => {
                const category = await db.categories.get(b.category_id);
                return { ...b, category, spent: calculateSpent(txs, b.category_id) };
            }));
        }
    },

    async saveBudget(budget, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('budgets').upsert({ ...budgets, user_id: userId }).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.budgets.put({ ...budget, user_id: userId });
            return { ...budget, id, user_id: userId };
        }
    },

    async updateBudget(budget, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('budgets').update(budget).eq('id', budget.id).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.budgets.put({ ...budget, user_id: userId });
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

    async saveAccount(account, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { data, error } = await supabase.from('accounts').upsert({ ...account, user_id: userId }).select();
            if (error) throw error;
            return data[0];
        } else {
            const id = await db.accounts.put({ ...account, user_id: userId });
            return { ...account, id, user_id: userId };
        }
    },

    async updateAccount(account, userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            const { error } = await supabase.from('accounts').update(account).eq('id', account.id).eq('user_id', userId);
            if (error) throw error;
        } else {
            await db.accounts.put({ ...account, user_id: userId });
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

    // Categories
    async fetchCategories(userId) {
        const mode = await this.getStorageMode(userId);
        if (mode === 'cloud') {
            // Fetch global (null user_id) and user-specific categories
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
        // Merchants are global for this app's logic
        const { data } = await supabase.from('merchants').select('*');
        return data || [];
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
};