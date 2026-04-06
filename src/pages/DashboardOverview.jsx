/** Dashboard Overview Component
 * Integrated with Hybrid Storage Routing (Cloud vs Private Vault)
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import LearningTip from "../components/LearningTip";
import {
    PieChart, Plus, ChevronRight, BarChart3,
    Clock, ArrowUpRight, Wallet, Loader2
} from 'lucide-react';
import { useLiveQuery } from "dexie-react-hooks";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { db } from "../lib/db";
import { dataService } from "../services/dataService";

const category_colours = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

const TransactionList = ({ transactions, loading }) => {
    if (loading) return <div className="p-10 text-center text-gray-500 text-xs font-bold animate-pulse">Fetching records...</div>;
    if (!transactions || transactions.length === 0) return <div className="p-10 text-center text-gray-500 text-xs font-bold uppercase">No Recent Activity</div>;

    return (
        <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent-main font-bold">
                            {tx.category?.name?.charAt(0) || <Clock size={16} />}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{tx.description || 'Transaction'}</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">
                                {tx.category?.name || 'Uncategorized'} • {tx.merchant?.name || 'General'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`font-black text-sm ${tx.amount < 0 ? 'text-white' : 'text-accent-main'}`}>
                            {tx.amount < 0 ? `-£${Math.abs(tx.amount).toFixed(2)}` : `+£${tx.amount.toFixed(2)}`}
                        </p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const BudgetCard = ({ budget }) => {
    const limit = Number(budget.limit_amount) || 0;
    const spent = Number(budget.spent) || 0;
    const percent = Math.min((spent / limit) * 100, 100);
    const remaining = limit - spent;

    return (
        <Link to={`/dashboard/budgets`} className="block p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:bg-white/10 transition-colors group">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-main/10 rounded-xl flex items-center justify-center text-accent-main font-bold">
                        {budget.category?.name?.charAt(0) || <PieChart size={20} />}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{budget.category?.name || 'Budget'}</p>
                        <p className="text-gray-500 text-[10px] font-bold">£{spent.toFixed(0)} of £{limit}</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
            </div>
            <div className="space-y-1.5">
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-main transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase">
                    <span>{Math.round(percent)}% Used</span>
                    <span className={remaining < 0 ? 'text-red-400' : ''}>
                        {remaining < 0 ? `£${Math.abs(remaining).toFixed(0)} Over` : `£${remaining.toFixed(0)} Left`}
                    </span>
                </div>
            </div>
        </Link>
    );
};

// Main Page
const DashboardOverview = ({ session }) => {
    const [storageMode, setStorageMode] = useState('loading');
    const [cloudData, setCloudData] = useState({ transactions: [], budgets: [], accounts: [] });
    const userId = session?.user?.id;

    // Local Queries
    const localTransactions = useLiveQuery(() => userId ? db.transactions.where('user_id').equals(userId).reverse().limit(10).toArray() : [], [userId]);
    const localBudgets = useLiveQuery(() => userId ? db.budgets.where('user_id').equals(userId).toArray() : [], [userId]);
    const localAccounts = useLiveQuery(() => userId ? db.accounts.where('user_id').equals(userId).toArray() : [], [userId]);

    const refreshData = async () => {
        if (!userId) return;
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);

            if (mode === 'cloud') {
                const [txs, budg, accs] = await Promise.all([
                    dataService.fetchRecentTransactions(userId),
                    dataService.fetchBudgets(userId),
                    dataService.fetchAccounts(userId)
                ]);
                setCloudData({ transactions: txs, budgets: budg, accounts: accs });
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        refreshData();
    }, [userId]);


    // Transaction, Budgets, Accounts Logic
    const transactions = storageMode === 'cloud' ? cloudData.transactions : (localTransactions || []);
    const budgets = storageMode === 'cloud' ? cloudData.budgets : (localBudgets || []);
    const accounts = storageMode === 'cloud' ? cloudData.accounts : (localAccounts || []);
    const isLoading = storageMode === 'loading';

    const totalBalance = useMemo(() => {
        if (!accounts) return 0;
        return accounts.reduce((acc, accnt) => acc + (Number(accnt.current_balance) || 0), 0);
    }, [accounts]);

    const safeToSpend = useMemo(() => {
        if (!budgets || !budgets.length) return 0;
        const totalLimit = budgets.reduce((acc, b) => acc + (Number(b.limit_amount) || 0), 0);
        const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0);
        const remaining = totalLimit - totalSpent;

        const now = new Date();
        const today = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - today + 1;

        return Math.max(0, remaining / daysLeft);
    }, [budgets]);

    // Charts Logic
    const trendData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const groups = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const dateKey = new Date(t.created_at).toISOString().split('T')[0];
            acc[dateKey] = (acc[dateKey] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
        return Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(dateKey => ({
            date: new Date(dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            amount: groups[dateKey]
        })).slice(-7);
    }, [transactions]);

    const categoryData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];
        const groups = transactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const name = t.category?.name || "Other";
            acc[name] = (acc[name] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
        return Object.keys(groups).map((name, index) => ({
            name, value: groups[name], fill: category_colours[index % category_colours.length]
        })).sort((a, b) => b.value - a.value).slice(0, 6);
    }, [transactions]);

    const varianceData = useMemo(() => {
        if (!budgets || budgets.length === 0) return [];
        return budgets.slice(0, 5).map(b => ({
            name: b.category?.name || "Budget",
            Allocated: Number(b.limit_amount) || 0,
            Actual: Number(b.spent) || 0,
        }));
    }, [budgets]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar session={session} />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">Bank Accounts</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Storage: <span className={storageMode === 'cloud' ? 'text-white' : 'text-white'}>{storageMode}</span>
                        </p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none text-right bg-background-secondary px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl transition-all hover:border-white/10">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest flex items-center justify-end gap-1 mb-1">
                                <Wallet size={12} className="text-accent-main" /> Total Balance
                            </p>
                            <p className="text-2xl font-black text-white tracking-tight">
                                £{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="flex-1 md:flex-none text-right bg-background-secondary px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl transition-all hover:border-white/10">
                            <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Safe to Spend</p>
                            <p className="text-2xl font-black text-accent-main tracking-tight">
                                £{safeToSpend.toFixed(2)} <span className="text-[10px] text-gray-500">/ day</span>
                            </p>
                        </div>
                    </div>
                </header>

                {/* Learning Tip */}
                <section>
                    <LearningTip />
                </section>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Budget Spend */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 shadow-2xl">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 text-accent-main"><BarChart3 size={16} /> Budget Performance</h2>
                        <div className="h-80 w-full min-h-0 relative">
                            {isLoading ? <div className="h-full flex items-center justify-center text-gray-500 text-[10px] font-bold uppercase tracking-widest">Syncing...</div> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData.length > 0 ? trendData : varianceData} margin={{ left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                                        <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} name="Spent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>

                    {/* Expense Chart */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 shadow-2xl">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2 text-accent-main"><PieChart size={16} /> Expense Breakdown</h2>
                        <div className="h-80 w-full min-h-0 relative">
                            {isLoading ? <div className="h-full flex items-center justify-center text-gray-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">Syncing...</div> : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePie>
                                        <Pie
                                            data={categoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%" cy="45%"
                                            innerRadius={0}
                                            outerRadius={100}
                                            stroke="#121212"
                                            strokeWidth={3}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {categoryData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }} />
                                        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }} />
                                    </RePie>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                            <div className="flex items-center gap-4">
                                <Link to="/dashboard/transactions" className="p-2 bg-accent-main/10 text-accent-main rounded-lg hover:bg-accent-main hover:text-white transition-all">
                                    <Plus size={16} />
                                </Link>
                                <Link to="/dashboard/transactions" className="text-[10px] font-black text-accent-main flex items-center gap-1 uppercase tracking-widest hover:text-white transition-colors">
                                    History <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                        <TransactionList transactions={transactions} loading={isLoading} />
                    </section>

                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Budgets</h2>
                            <Link to="/dashboard/budgets" className="p-2 bg-accent-main/10 text-accent-main rounded-lg hover:bg-accent-main hover:text-white transition-all"><Plus size={16} /></Link>
                        </div>
                        <div className="space-y-4">
                            {budgets.length > 0 ? budgets.map(b => <BudgetCard key={b.id} budget={b} />) : <p className="text-center text-gray-600 py-10 text-xs font-bold uppercase">No Active Budgets</p>}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardOverview;