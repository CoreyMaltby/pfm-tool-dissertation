/** Dashboard Overview Component
 * Integrated with Hybrid Storage Routing (Cloud vs Private Vault)
 */

import React, { useState, useEffect, useMemo } from "react";
import { data, Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { TrendingUp, PieChart, Home, Car, ShoppingBag, Utensils, Plus, ChevronRight, BarChart3, Clock, ArrowUpRight } from 'lucide-react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { dataService } from "../services/dataService";

// Sub Components
const GraphContainer = ({ mode, data }) => (
    <div className="h-96 w-full bg-white/5 rounded-3xl flex items-center justify-center border border-dashed border-white/10 relative overflow-hidden transition-all hover:border-white/20">
        {!data ? (
            <div className="flex flex-col items-center gap-2 opacity-40">
                <BarChart3 size={48} className="text-gray-500" />
                <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    Awaiting {mode === 'spend' ? 'Spending' : 'Breakdown'} Data
                </span>
            </div>
        ) : (
            <div className="text-white font-bold">Chart Data Visualized Here</div>
        )}
    </div>
);

const TransactionList = ({ transactions, loading }) => {
    if (loading) return <div className="p-10 text-center text-gray-500 text-xs font-bold animate-pulse">Fetching records...</div>;
    if (!transactions || transactions.length === 0) return <div className="p-10 text-center text-gray-500 text-xs font-bold uppercase">No Recent Activity</div>;

    return (
        <div className="space-y-3">
            {transactions.slice(0, 10).map((tx) => (
                <Link key={tx.id} to={`/dashboard/transactions/${tx.id}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
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
                </Link>
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
        <Link to={`/dashboard/budgets/${budget.id}`} className="block p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:bg-white/10 transition-colors group">
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
    const [chartMode, setChartMode] = useState('spend');
    const [storageMode, setStorageMode] = useState('loading');
    const [cloudData, setCloudData] = useState({ transactions: [], budgets: [] });
    const userId = session?.user?.id;

    // Local Queries
    const localTransactions = useLiveQuery(() => userId ? db.transactions.where('user_id').equals(userId).reverse().limit(10).toArray() : [], [userId]);
    const localBudgets = useLiveQuery(() => userId ? db.budgets.where('user_id').equals(userId).toArray() : [], [userId]);

    const refreshData = async () => {
        if (!userId) return;
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);

            if (mode === 'cloud') {
                const [txs, budg] = await Promise.all([
                    dataService.fetchRecentTransactions(userId),
                    dataService.fetchBudgets(userId)
                ]);
                console.log("Cloud Data Fetched:", { transactions: txs, budgets: budg });
                setCloudData({ transactions: txs, budgets: budg });
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    // Initial load
    useEffect(() => {
        refreshData();
    }, [userId]);

    const transactions = storageMode === 'cloud' ? cloudData.transactions : (localTransactions || []);
    const budgets = storageMode === 'cloud' ? cloudData.budgets : (localBudgets || []);
    const isLoading = storageMode === 'loading';

    const safeToSpend = useMemo(() => {
        if (!budgets.length) return 0;
        const totalLimit = budgets.reduce((acc, b) => acc + (Number(b.limit_amount) || 0), 0);
        const totalSpent = budgets.reduce((acc, b) => acc + (Number(b.spent) || 0), 0);
        const remaining = totalLimit - totalSpent;

        const now = new Date();
        const today = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - today + 1;

        return Math.max(0, remaining / daysLeft);
    }, [budgets]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white leading-tight">Overview</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            Storage: <span className={storageMode === 'cloud' ? 'text-gray-500' : 'text-gray-500 '}>{storageMode}</span>
                        </p>
                    </div>

                    <div className="hidden md:block text-right bg-black/10 px-6 py-3 rounded-2xl border border-white/5">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Safe to Spend</p>
                        <p className="text-2xl font-black text-accent-main">
                            £{safeToSpend.toFixed(2)} <span className="text-xs text-white/40">/ day</span>
                        </p>
                    </div>
                </header>

                {/* Graph Visualization Placeholder */}
                <section className="bg-background-secondary rounded-3xl p-8 border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Analytics</h2>
                        <div className="bg-black/20 p-1 rounded-xl flex">
                            {['spend', 'breakdown'].map(m => (
                                <button key={m} onClick={() => setChartMode(m)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartMode === m ? 'bg-accent-main text-white' : 'text-gray-500'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-64 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                        Chart Integration Pending
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                            <div className="flex items-center gap-4">
                                {/*Link to Transactions Page */}
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

                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
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