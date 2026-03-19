import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/db';

export const dataService = {
    // Gets the storage mode
    async getStorageMode(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('storage_mode')
            .eq('id', userId)
            .single();
        return data?.storage_mode || 'local';
    },

    // Save Logic
    async saveTransaction(transaction, userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            // Cloud Storage
            const { error } = await supabase
                .from('transactions')
                .insert([{ ...transaction, user_id: userId }]);
            if (error) throw error;
        } else {
            // Local Storage
            await db.transactions.put({ ...transaction, user_id: userId });
        }
    },

    // Fetch Logic
    async fetchTransactions(userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            return data;
        } else {
            return await db.transactions.where('user_id').equals(userId).toArray();
        }
    },

    // Transactions
    async fetchRecentTransactions(userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
                    *,
                    category:categories(name, icon),
                    merchant:merchants(name)
                    `)
                .order('created_at', { ascending: false })
                .limit(5);
            return data || [];
        } else {
            const txs = await db.transactions.where('user_id').equals(userId).equals(userId).reverse().limit(5).toArray();
            return await Promise.all(txs.map(async (tx) => {
                const category = await db.categories.get(tx.category_id);
                const merchant = await db.merchants.get(tx.merchant_id);
                return { ...tx, category, merchant };
            }));
        }
    },

    // Budgets
    async fetchBudgets(userId) {
        const mode = await this.getStorageMode(userId);

        if (mode === 'cloud') {
            const { data } = await supabase
                .from('budgets')
                .select(`
                *,
                category:categories(name,icon)
                `)
                .eq('user_id', userId);
            return data || [];
        } else {
            const budgets = await db.budgets.where('user_id').equals(userId).toArray();
            return await Promise.all(budgets.map(async (b) => {
                const category = await db.categories.get(b.category_id);
                return { ...b, category };
            }));
        }
    }
}; 