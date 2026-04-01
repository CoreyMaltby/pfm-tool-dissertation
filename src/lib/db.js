import Dexie from 'dexie';

export const db = new Dexie('PFMDatabase');

db.version(3).stores({
  profiles: 'id, email',
  accounts: 'id, user_id, name, type',
  transactions: 'id, user_id, account_id, category_id, merchant_id, created_at, synced, updated_at',
  budgets: 'id, user_id, category_id, synced, updated_at',
  savings_goals: 'id, user_id, name, synced, updated_at',
  categories: 'id, user_id, name',
  merchants: 'id, name, default_cat_id',
  notifications: 'id, user_id, created_at'
});

// Helper to clear all local data
export const clearLocalData = async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
};