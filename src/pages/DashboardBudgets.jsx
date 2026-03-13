/** Dashboard Budgets Page
 * Allows for manual budget creation and "Smart Budget" automation.
 */

import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Wallet, Plus, Sparkles, Home, Utensils, Settings2, CheckCircle2, Info } from 'lucide-react';

const DashboardBudgets = () => {
    // State to toggle the "Smart Budget" configuration view
    // TODO: Backend logic
    const [isSmartMode, setIsSmartMode] = useState(false);

    // Mock data for existing budgets
    const [manualBudgets, setManualBudgets] = useState([
        { id: 1, name: "Rent & Bills", icon: Home, amount: 1200, color: "text-blue-400" },
        { id: 2, name: "Groceries", icon: Utensils, amount: 400, color: "text-accent-main" },
    ]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Manage Budgets</h1>
                    </div>

                    <div className="flex gap-3">
                        {/* Smart Budget Toggle */}
                        <button
                            onClick={() => setIsSmartMode(!isSmartMode)}
                            className={`flex items-center gap-2 px-6 py-3 font-black rounded-xl transition-all text-xs shadow-lg ${isSmartMode
                                ? "bg-white text-background-tertiary"
                                : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                                }`}
                        >
                            <Sparkles size={18} /> {isSmartMode ? "Exit Smart Setup" : "Smart Budget Setup"}
                        </button>

                        <button className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-xs border border-white/10">
                            <Plus size={18} /> New Category
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Active Budgets List */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Wallet className="text-accent-main" />
                                    <h2 className="text-xl font-bold text-white">Active Categories</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {manualBudgets.length} Categories Defined
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {manualBudgets.map((budget) => {
                                    const Icon = budget.icon;
                                    return (
                                        <div key={budget.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${budget.color}`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold">{budget.name}</h3>
                                                    <p className="text-xs text-gray-500">Monthly Limit: £{budget.amount}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                                <Settings2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                                {/* Empty State / Add Placeholder */}
                                <button className="p-6 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:border-white/10 transition-all group">
                                    <Plus size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Add Category</span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Smart Budget / Settings */}
                    <section className="space-y-8">
                        {isSmartMode ? (
                            <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 text-accent-main">
                                    <Sparkles size={20} />
                                    <h2 className="text-sm font-black uppercase tracking-widest">Smart Config</h2>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Input your monthly net income and we'll distribute it using the 50/30/20 rule adjusted for your goals.
                                </p>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-500 uppercase">Net Monthly Income</label>
                                        <input type="number" placeholder="£ 0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-accent-main outline-none" />
                                    </div>
                                    <button className="w-full py-4 bg-accent-main text-white font-black rounded-xl text-xs shadow-lg hover:scale-105 transition-all">
                                        Generate Smart Budget
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <CheckCircle2 size={20} className="text-accent-main" />
                                    <h2 className="text-sm font-black uppercase tracking-widest">Budget Health</h2>
                                </div>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-black text-white">£1,600</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mt-1">Total Monthly Allocation</p>
                                </div>
                                {/* TODO: Integration with Income Data */}
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-accent-main h-full w-[70%]"></div>
                                </div>
                                <p className="text-[10px] text-center text-gray-500 font-bold">70% of Income Allocated</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardBudgets;