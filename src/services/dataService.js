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
    }
}; 