/** Dashboard Overview Component
 * Integrated with Hybrid Storage Routing (Cloud vs Private Vault)
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

    if (!transactions || transactions.length === 0) {
        return <div className="p-10 text-center text-gray-500 text-xs font-bold uppercase">No Recent Activity</div>;
    }

    return (
        <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
                <Link
                    key={tx.id}
                    to={`/dashboard/transactions/${tx.id}`}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent-main font-bold text-xs group-hover:bg-accent-main group-hover:text-white transition-all">
                            <Clock size={16} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{tx.description || 'Transaction'}</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Category ID: {tx.category_id?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`font-black text-sm ${tx.amount < 0 ? 'text-white' : 'text-accent-main'}`}>
                            {tx.amount < 0 ? `-£${Math.abs(tx.amount).toFixed(2)}` : `+£${tx.amount.toFixed(2)}`}
                        </p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase">
                            {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

const BudgetCard = ({ budget }) => {
    const percent = Math.min((budget.spent / budget.limit) * 100, 100);
    const remaining = budget.limit - budget.spent;

    return (
        <Link
            to={`/dashboard/budgets/${budget.id}`}
            className="block p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:bg-white/10 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-main/10 rounded-xl flex items-center justify-center text-accent-main">
                        <PieChart size={20} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Budget Group</p>
                        <p className="text-gray-500 text-[10px] font-bold">£{budget.spent} of £{budget.limit}</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-1.5">
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent-main transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                    <span>{Math.round(percent)}% Allocated</span>
                    <span className={remaining < 0 ? 'text-red-400' : ''}>
                        {remaining < 0 ? `Over by £${Math.abs(remaining)}` : `£${remaining} Left`}
                    </span>
                </div>
            </div>
        </Link>
    );
};

// Main Page

const DashboardOverview = ({ session }) => {
    const [chartMode, setChartMode] = useState('spend');
    const [cloudTransactions, setCloudTransactions] = useState([]);
    const [storageMode, setStorageMode] = useState('loading');
    const userId = session?.user?.id;

    // Fetch Local Data
    // This only populates if the user is in 'local' mode.
    const localTransactions = useLiveQuery(() => {
        if (!userId) return [];

        return db.transactions
            .where('user_id')
            .equals(userId)
            .reverse()
            .toArray();
    },
    );

    useEffect(() => {
        const initDashboard = async () => {
            if (!userId) return;

            // Check storage preference
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);

            if (mode === 'cloud') {
                // Fetch from Supabase directly
                const data = await dataService.fetchTransactions(userId);
                setCloudTransactions(data);
            }
        };

        initDashboard();
    }, [userId]);

    // Choose which data source to display
    const transactionsToDisplay = storageMode === 'cloud' ? cloudTransactions : localTransactions;
    const isLoading = storageMode === 'loading';

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white leading-tight">Overview</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            Storage: <span className={storageMode === 'cloud' ? 'text-accent-main' : 'text-green-400'}>{storageMode}</span>
                        </p>
                    </div>
                    <div className="hidden md:block text-right bg-black/10 px-6 py-3 rounded-2xl border border-white/5">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Safe to Spend</p>
                        <p className="text-2xl font-black text-accent-main">
                            £{/* TODO: calculation logic */} 0.00 <span className="text-xs text-white/40">/ day</span>
                        </p>
                    </div>
                </header>

                {/* Graph Visualization */}
                <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-main/10 rounded-xl flex items-center justify-center text-accent-main">
                                {chartMode === 'spend' ? <TrendingUp size={20} /> : <PieChart size={20} />}
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {chartMode === 'spend' ? 'Budget Spend Chart' : 'Expenses Breakdown'}
                            </h2>
                        </div>

                        <div className="bg-black/20 p-1.5 rounded-2xl flex gap-1">
                            {['spend', 'breakdown'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setChartMode(m)}
                                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${chartMode === m ? 'bg-accent-main text-white ' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {m === 'spend' ? 'Spending' : 'Breakdown'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <GraphContainer mode={chartMode} data={null} />
                </section>

                {/* Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Transactions Column */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                            <Link to="/dashboard/transactions" className="text-[10px] font-black uppercase tracking-widest text-accent-main hover:text-white transition-colors flex items-center gap-1">
                                Full History <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <TransactionList transactions={transactionsToDisplay} loading={isLoading} />
                    </section>

                    {/* Budgets Column */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Budget Overview</h2>
                            <Link to="/dashboard/budgets" className="p-2 bg-accent-main/10 text-accent-main rounded-lg hover:bg-accent-main hover:text-white transition-all">
                                <Plus size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <p className="text-gray-500 text-xs font-bold text-center p-10 uppercase">Connect budget data to view progress</p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardOverview;