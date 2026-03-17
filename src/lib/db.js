import Dexie from 'dexie';

export const db = new Dexie('PFMDatabase');

// Database Schema
db.version(1).stores({
  profiles: 'id, email',
  accounts: 'id, user_id, name, type',
  transactions: 'id, account_id, category_id, merchant_id, created_at',
  budgets: 'id, user_id, category_id',
  savings_goals: 'id, user_id, name',
  categories: 'id, user_id, name',
  merchants: 'id, name, default_cat_id',
  notifications: 'id, user_id, type, created_at'
});

export const clearLocalData = async () => {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map(table => table.clear()));
  });
};