import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/db';

export const dataService = {
    async getStorageMode(userId) {
        const { data } = await supabase.from('profiles').select('storage_mode').eq('id', userId).single();
        return data?.storage_mode || 'local';
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
    }
};