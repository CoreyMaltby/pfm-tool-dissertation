/** Dashboard Overview Component
 *  TODO: Integrate with backend for real-time data synchronization.
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import { TrendingUp, PieChart, Home, Car, ShoppingBag, Utensils, Plus, ChevronRight, BarChart3, Clock, ArrowUpRight } from 'lucide-react';

// Sub Componenets

// Graph Container
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
            /* TODO: Graph integration */
            <div className="text-white font-bold">Chart Data Visualized Here</div>
        )}
    </div>
);

// Transaction Table
const TransactionList = ({ transactions }) => {
    // TODO: Implement dynamic transaction fetching from database
    if (!transactions || transactions.length === 0) {
        return <div className="p-10 text-center text-gray-500 text-xs font-bold uppercase">No Recent Activity</div>;
    }

    return (
        <div className="space-y-3">
            {transactions.map((tx) => (
                /* TODO: Link to specific transaction detail page */
                <Link
                    key={tx.id}
                    to={`/dashboard/transactions/${tx.id}`}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-accent-main font-bold text-xs group-hover:bg-accent-main group-hover:text-white transition-all">
                            {tx.category_icon || <Clock size={16} />}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">{tx.merchant}</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">{tx.category}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-black text-sm">-£{tx.amount.toFixed(2)}</p>
                        <p className="text-[9px] text-gray-600 font-bold uppercase">{tx.date}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
};

// Budget Overview Component
const BudgetCard = ({ budget }) => {
    // TODO: Connect to budget tracking database
    const Icon = budget.icon || Home;
    const percent = Math.min((budget.spent / budget.limit) * 100, 100);
    const remaining = budget.limit - budget.spent;

    return (
        /* TODO: Link to budget page */
        <Link
            to={`/dashboard/budgets/${budget.id}`}
            className="block p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3 hover:bg-white/10 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${budget.color} bg-opacity-20 rounded-xl flex items-center justify-center ${budget.color.replace('bg-', 'text-')}`}>
                        <Icon size={20} />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{budget.name}</p>
                        <p className="text-gray-500 text-[10px] font-bold">£{budget.spent} of £{budget.limit}</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-1.5">
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${budget.color} transition-all duration-1000`}
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
const DashboardOverview = () => {
    const [chartMode, setChartMode] = useState('spend');

    // Sample Data
    const [budgets, setBudgets] = useState([
        { id: 1, name: "Housing", icon: Home, spent: 850, limit: 1200, color: "bg-blue-500" },
        { id: 2, name: "Transport", icon: Car, spent: 120, limit: 300, color: "bg-purple-500" },
        { id: 3, name: "Groceries", icon: Utensils, spent: 240, limit: 400, color: "bg-accent-main" },
        { id: 4, name: "Shopping", icon: ShoppingBag, spent: 150, limit: 200, color: "bg-yellow-500" },
    ]);

    const [transactions, setTransactions] = useState([
        { id: 1, merchant: "Tesco", category: "Groceries", amount: 42.50, date: "Today", category_icon: <Utensils size={16} /> },
        { id: 2, merchant: "Shell", category: "Transport", amount: 65.00, date: "Yesterday", category_icon: <Car size={16} /> },
        { id: 3, merchant: "Amazon", category: "Shopping", amount: 12.99, date: "08 March", category_icon: <ShoppingBag size={16} /> },
    ]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white leading-tight">Overview</h1>
                    </div>
                    <div className="hidden md:block text-right bg-black/10 px-6 py-3 rounded-2xl border border-white/5">
                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Safe to Spend</p>
                        {/* TODO: Safe To Spend Data Import & Logic Integration */}
                        <p className="text-2xl font-black text-accent-main">£ <span className="text-xs text-white/40">/ day</span></p>
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
                            {/* Link to Full Transactions History page */}
                            <Link to="/dashboard/transactions" className="text-[10px] font-black uppercase tracking-widest text-accent-main hover:text-white transition-colors flex items-center gap-1">
                                Full History <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <TransactionList transactions={transactions} />
                    </section>

                    {/* Budgets Column */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Budget Overview</h2>
                            {/* Link to Add/Manage Budgets page */}
                            <Link to="/dashboard/budgets" className="p-2 bg-accent-main/10 text-accent-main rounded-lg hover:bg-accent-main hover:text-white transition-all">
                                <Plus size={16} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {budgets.map((b) => (
                                <BudgetCard key={b.id} budget={b} />
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardOverview;