import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataService } from './dataService';
import { supabase } from '../lib/supabaseClient';
import { db } from '../lib/db';

const createSupabaseMock = (returnData = null, returnError = null) => {
  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    in: vi.fn(() => chain),
    or: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve({ data: returnData, error: returnError })),
    then: vi.fn((onFulfilled) => Promise.resolve({ data: returnData, error: returnError }).then(onFulfilled)),
  };
  return chain;
};

const createDbChain = () => {
  const chain = {
    where: vi.fn(() => chain),
    equals: vi.fn(() => chain),
    anyOf: vi.fn(() => chain),
    filter: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    lt: vi.fn(() => chain),
    reverse: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    toArray: vi.fn(),
  };
  return chain;
};

vi.mock('../lib/supabaseClient', () => ({
  supabase: { from: vi.fn(), auth: { signOut: vi.fn() } }
}));

vi.mock('../lib/db', () => {
  const createChain = () => ({
    where: vi.fn(function () { return this; }),
    equals: vi.fn(function () { return this; }),
    anyOf: vi.fn(function () { return this; }),
    filter: vi.fn(function () { return this; }),
    gte: vi.fn(function () { return this; }),
    lt: vi.fn(function () { return this; }),
    reverse: vi.fn(function () { return this; }),
    limit: vi.fn(function () { return this; }),
    delete: vi.fn(function () { return this; }),
    toArray: vi.fn(),
  });

  const categories = createChain();
  categories.get = vi.fn();

  const merchants = createChain();
  merchants.add = vi.fn();
  merchants.get = vi.fn();

  return {
    db: {
      transactions: { ...createChain(), modify: vi.fn(), put: vi.fn(), bulkAdd: vi.fn(), bulkPut: vi.fn(), delete: vi.fn(), add: vi.fn(), get: vi.fn() },
      budgets: { ...createChain(), add: vi.fn(), delete: vi.fn(), bulkPut: vi.fn(), put: vi.fn() },
      accounts: { ...createChain(), bulkPut: vi.fn(), delete: vi.fn(), get: vi.fn(), update: vi.fn(), add: vi.fn() },
      savings_goals: { ...createChain(), bulkPut: vi.fn(), delete: vi.fn(), get: vi.fn(), update: vi.fn(), put: vi.fn() },
      categories,
      merchants,
      notifications: { ...createChain(), add: vi.fn(), delete: vi.fn(), modify: vi.fn() },
      profiles: { update: vi.fn() }
    }
  };
});

describe('dataService test plan', () => {
  const userId = 'user-abc';

  beforeEach(() => {
    vi.resetAllMocks();
    dataService._summaryInProcess = false;
    dataService._monthlySummaryInProcess = false;
    if (typeof globalThis.navigator === 'undefined') {
      Object.defineProperty(globalThis, 'navigator', {
        value: { onLine: true },
        configurable: true
      });
    } else {
      Object.defineProperty(globalThis.navigator, 'onLine', {
        value: true,
        configurable: true
      });
    }

    supabase.from.mockImplementation(() => createSupabaseMock([], null));
  });

  it('1: getStorageMode Defaulting', async () => {
    supabase.from.mockImplementation(() => createSupabaseMock(null, null));
    expect(await dataService.getStorageMode(userId)).toBe('local');
  });

  it('2: updateStorageMode Persistence', async () => {
    const mock = createSupabaseMock({}, null);
    supabase.from.mockImplementation(() => mock);

    await dataService.updateStorageMode(userId, 'cloud');
    expect(mock.update).toHaveBeenCalledWith(expect.objectContaining({ storage_mode: 'cloud' }));
  });

  it('3: syncOfflineChanges Logic', async () => {
    db.transactions.where().equals().toArray.mockResolvedValue([{ id: 't1', amount: -20, synced: 0, updated_at: '2026-01-01' }]);
    const mock = createSupabaseMock({}, null);
    supabase.from.mockImplementation(() => mock);

    await dataService.syncOfflineChanges(userId);
    expect(mock.upsert).toHaveBeenCalledWith([{ id: 't1', amount: -20 }]);
    expect(db.transactions.modify).toHaveBeenCalledWith({ synced: 1 });
  });

  it('4: migrateLocalToCloud Scrubbing', async () => {
    db.accounts.where().equals().toArray.mockResolvedValue([{ id: 'a1', synced: 0, updated_at: '2026-01-01' }]);
    db.budgets.where().equals().toArray.mockResolvedValue([]);
    db.savings_goals.where().equals().toArray.mockResolvedValue([]);
    db.transactions.where().equals().toArray.mockResolvedValue([]);

    const mock = createSupabaseMock({}, null);
    supabase.from.mockImplementation(() => mock);
    vi.spyOn(dataService, 'updateStorageMode').mockResolvedValue('cloud');

    await dataService.migrateLocalToCloud(userId);
    expect(mock.upsert).toHaveBeenCalledWith([{ id: 'a1' }]);
  });

  it('5: migrateLocalToCloud Atomicity', async () => {
    db.accounts.where().equals().toArray.mockResolvedValue([{ id: 'a1', synced: 0, updated_at: '2026-01-01' }]);
    db.budgets.where().equals().toArray.mockResolvedValue([]);
    db.savings_goals.where().equals().toArray.mockResolvedValue([]);
    db.transactions.where().equals().toArray.mockResolvedValue([]);

    supabase.from.mockImplementation(() => createSupabaseMock(null, { message: 'Fail' }));
    await expect(dataService.migrateLocalToCloud(userId)).rejects.toThrow('Accounts Migration Failed');
  });

  it('6: migrateCloudToLocal Integrity', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'accounts') return createSupabaseMock([{ id: 'a1' }], null);
      return createSupabaseMock([], null);
    });

    await dataService.migrateCloudToLocal(userId);
    expect(db.accounts.bulkPut).toHaveBeenCalledWith([{ id: 'a1', synced: 1 }]);
  });

  it('7: fetchRecentTransactions Cloud', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('cloud');
    const mockData = [{ id: 'tx1', merchant: { name: 'M' }, category: { name: 'C' } }];
    supabase.from.mockImplementation(() => createSupabaseMock(mockData, null));

    const result = await dataService.fetchRecentTransactions(userId);
    expect(result).toEqual(mockData);
  });

  it('8: fetchRecentTransactions Local', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.transactions.where().equals().reverse().limit().toArray.mockResolvedValue([{ id: 'tx1', category_id: 'c1', merchant_id: 'm1' }]);
    db.categories.get.mockResolvedValue({ name: 'Food' });
    db.merchants.get.mockResolvedValue({ name: 'Shop' });

    const result = await dataService.fetchRecentTransactions(userId);
    expect(result[0]).toMatchObject({ category: { name: 'Food' }, merchant: { name: 'Shop' } });
  });

  it('9: saveTransaction Online Cloud', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('cloud');
    Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true });

    const serverRow = { id: 't1', amount: -10 };
    const mock = createSupabaseMock([serverRow], null);
    supabase.from.mockImplementation(() => mock);
    db.transactions.put.mockResolvedValue('t1');

    const result = await dataService.saveTransaction({ amount: -10, account_id: 'a1' }, userId);
    expect(mock.insert).toHaveBeenCalled();
    expect(db.transactions.put).toHaveBeenCalledWith(expect.objectContaining({ synced: 1 }));
    expect(result).toEqual(serverRow);
  });

  it('10: saveTransaction Local/Offline', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    const txId = 'local-1';
    db.transactions.put.mockResolvedValue(txId);

    const result = await dataService.saveTransaction({ amount: 50, account_id: 'a1' }, userId);
    expect(db.transactions.put).toHaveBeenCalledWith(expect.objectContaining({ synced: 1, user_id: userId }));
    expect(result).toEqual(expect.objectContaining({ id: txId }));
  });

  it('11: saveTransaction Side Effects', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.transactions.put.mockResolvedValue('local-2');
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();
    vi.spyOn(dataService, 'checkBudgetThresholds').mockResolvedValue();
    vi.spyOn(dataService, 'checkSpendingFrequency').mockResolvedValue();

    await dataService.saveTransaction({ amount: -50, account_id: 'a1', category_id: 'c1' }, userId);
    expect(dataService.adjustAccountBalance).toHaveBeenCalledWith('a1', -50, userId);
    expect(dataService.checkBudgetThresholds).toHaveBeenCalledWith(userId, 'c1');
    expect(dataService.checkSpendingFrequency).toHaveBeenCalledWith(userId, 'c1');
  });

  it('12: deleteTransaction Logic', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();

    await dataService.deleteTransaction({ id: 't1', amount: -30, account_id: 'a1' }, userId);
    expect(db.transactions.delete).toHaveBeenCalledWith('t1');
    expect(dataService.adjustAccountBalance).toHaveBeenCalledWith('a1', 30, userId);
  });

  it('13: updateTransaction Delta', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    const newTx = { id: 't1', amount: -40, account_id: 'a1' };
    const oldTx = { id: 't1', amount: -20, account_id: 'a1' };
    await dataService.updateTransaction(newTx, oldTx, userId);
    expect(db.transactions.put).toHaveBeenCalledWith({ ...newTx, user_id: userId });
  });

  it('14: importTransactions creates missing entities', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    vi.spyOn(dataService, 'fetchMerchants').mockResolvedValue([]);
    vi.spyOn(dataService, 'fetchAccounts').mockResolvedValue([]);
    vi.spyOn(dataService, 'fetchCategories').mockResolvedValue([{ id: 'c1', name: 'Food' }]);
    vi.spyOn(dataService, 'fetchBudgets').mockResolvedValue([]);
    vi.spyOn(dataService, 'addAccount').mockResolvedValue({ id: 'a1' });
    vi.spyOn(dataService, 'addMerchant').mockResolvedValue({ id: 'm1' });
    vi.spyOn(dataService, 'saveBudget').mockResolvedValue({});
    vi.spyOn(dataService, 'createNotification').mockResolvedValue();
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();

    const count = await dataService.importTransactions(userId, [
      { merchant: 'New Shop', category: 'Food', account: 'My Account', amount: '-30', date: '2026-04-01' }
    ]);

    expect(count).toBe(1);
    expect(dataService.addAccount).toHaveBeenCalled();
    expect(dataService.addMerchant).toHaveBeenCalled();
  });

  it('15: importTransactions Budget Generation', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    vi.spyOn(dataService, 'fetchMerchants').mockResolvedValue([{ id: 'm1', name: 'Store' }]);
    vi.spyOn(dataService, 'fetchAccounts').mockResolvedValue([{ id: 'a1', name: 'Main Account' }]);
    vi.spyOn(dataService, 'fetchCategories').mockResolvedValue([{ id: 'c1', name: 'Food' }]);
    vi.spyOn(dataService, 'fetchBudgets').mockResolvedValue([]);
    vi.spyOn(dataService, 'saveBudget').mockResolvedValue({});
    vi.spyOn(dataService, 'createNotification').mockResolvedValue();
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();

    const count = await dataService.importTransactions(userId, [
      { merchant: 'Store', category: 'Food', account: 'Main Account', amount: '-45', date: '2026-04-01' }
    ]);

    expect(count).toBe(1);
    expect(dataService.saveBudget).toHaveBeenCalled();
    expect(dataService.createNotification).toHaveBeenCalled();
  });

  it('16: fetchBudgets Aggregation', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.budgets.where().equals().toArray.mockResolvedValue([{ category_id: 'c1', limit_amount: 100, id: 'b1' }]);
    db.transactions.where().equals().toArray.mockResolvedValue([{ category_id: 'c1', amount: -40 }]);
    db.categories.get.mockResolvedValue({ name: 'Food' });

    const budgets = await dataService.fetchBudgets(userId);
    expect(budgets[0]).toBeDefined();
    expect(budgets[0].spent).toBe(40);
  });

  it('17: saveBudget Branching', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('cloud');
    const mock = createSupabaseMock([], null);
    supabase.from.mockImplementation(() => mock);

    await dataService.saveBudget({ category_id: 'c1', amount: 50 }, userId);
    expect(supabase.from).toHaveBeenCalledWith('budgets');
  });

  it('18: addToGoal Contribution', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.savings_goals.get.mockResolvedValue({ current_amount: 20, target_amount: 100, name: 'Trip' });
    db.transactions.add.mockResolvedValue('tx1');
    db.savings_goals.update.mockResolvedValue(1);
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();
    vi.spyOn(dataService, 'checkGoalMilestones').mockResolvedValue();

    await dataService.addToGoal({ goalId: 'g1', accountId: 'a1', amount: 30, name: 'Trip' }, userId);
    expect(db.savings_goals.update).toHaveBeenCalled();
    expect(db.transactions.add).toHaveBeenCalled();
    expect(dataService.checkGoalMilestones).toHaveBeenCalled();
  });

  it('19: adjustAccountBalance Logic', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.accounts.get.mockResolvedValue({ id: 'a1', current_balance: 100 });
    db.accounts.update.mockResolvedValue(1);
    vi.spyOn(dataService, 'checkLowBalance').mockResolvedValue();

    await dataService.adjustAccountBalance('a1', -20, userId);
    expect(db.accounts.get).toHaveBeenCalledWith('a1');
    expect(db.accounts.update).toHaveBeenCalledWith('a1', expect.objectContaining({ current_balance: 80 }));
  });

  it('20: transferFunds Logic', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    vi.spyOn(dataService, 'adjustAccountBalance').mockResolvedValue();

    await dataService.transferFunds({ fromAccountId: 'a1', toAccountId: 'a2', amount: 50, fromAccountName: 'A', toAccountName: 'B' }, userId);
    expect(db.transactions.add).toHaveBeenCalledTimes(2);
    expect(dataService.adjustAccountBalance).toHaveBeenCalledTimes(2);
  });

  it('21: createNotification Storage', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    await dataService.createNotification(userId, 'system', 'Test');
    expect(db.notifications.add).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId, type: 'system', message: 'Test' }));
  });

  it('22: cleanupNotifications Task', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.notifications.where().equals().filter().delete.mockResolvedValue(1);
    await dataService.cleanupNotifications(userId);
    expect(db.notifications.delete).toHaveBeenCalled();
  });

  it('23: checkBudgetThresholds Alert', async () => {
    vi.spyOn(dataService, 'fetchBudgets').mockResolvedValue([{ category_id: 'c1', limit_amount: 100, spent: 90, category: { name: 'Test' } }]);
    const noteSpy = vi.spyOn(dataService, 'createNotification').mockResolvedValue();

    await dataService.checkBudgetThresholds(userId, 'c1');
    expect(noteSpy).toHaveBeenCalledWith(userId, 'budget', expect.stringContaining('Budget Alert')); 
  });

  it('24: generateWeeklySummary Throttling', async () => {
    const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    vi.spyOn(dataService, 'fetchProfile').mockResolvedValue({ last_summary_at: recentDate });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await dataService.generateWeeklySummary(userId);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Analytics] Weekly summary not due yet.'), expect.anything());
  });

  it('25: generateWeeklySummary Logic', async () => {
    vi.spyOn(dataService, 'fetchProfile').mockResolvedValue({ last_summary_at: null });
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('cloud');
    const mock = createSupabaseMock([{ amount: 200 }, { amount: -100 }], null);
    supabase.from.mockImplementation(() => mock);
    const noteSpy = vi.spyOn(dataService, 'createNotification').mockResolvedValue();

    await dataService.generateWeeklySummary(userId);
    expect(noteSpy).toHaveBeenCalledWith(userId, 'nudge', expect.stringContaining('surplus'));
  });

  it('26: getSmartBudgetSuggestions', async () => {
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('cloud');
    supabase.from.mockImplementation(() => createSupabaseMock([{ amount: -100, category_id: 'c1', created_at: '2026-04-01' }, { amount: -50, category_id: 'c1', created_at: '2026-04-10' }], null));

    const suggestions = await dataService.getSmartBudgetSuggestions(userId);
    expect(suggestions[0].suggestedLimit).toBeGreaterThan(0);
  });

  it('27: getSavingsStreak Length', async () => {
    vi.spyOn(dataService, 'fetchBudgets').mockResolvedValue([{ limit_amount: 300 }]);
    vi.spyOn(dataService, 'getStorageMode').mockResolvedValue('local');
    db.transactions.where().equals().filter().toArray.mockResolvedValue([
      { amount: -5, created_at: new Date().toISOString() }
    ]);

    const streak = await dataService.getSavingsStreak(userId);
    expect(typeof streak).toBe('number');
  });
});
