// Dashboard Budgets Page

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import {
    Wallet, Plus, Sparkles, Home, Utensils, Settings2,
    CheckCircle2, Info, Loader2, Car, Smartphone,
    ShoppingBag, CreditCard, Coffee, Zap, TrendingUp
} from 'lucide-react';
import { dataService } from "../services/dataService";

const icon_map = {
    Utensils, Car, Smartphone, ShoppingBag,
    Wallet, Home, CreditCard, Coffee, Zap, TrendingUp
};

const DashboardBudgets = ({ session }) => {
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('loading');
    const userId = session?.user?.id;

    const fetchBudgets = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);

            const data = await dataService.fetchBudgets(userId);
            setBudgets(data || []);
        } catch (error) {
            console.error("Failed to load budgets: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, [userId]);

    const totalAllocated = budgets.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + (Number(curr.spent) || 0), 0);

    const utilisationPercent = totalAllocated > 0
        ? Math.min((totalSpent / totalAllocated) * 100, 100)
        : 0;

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">Manage Budgets</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Mode: <span className={storageMode === 'cloud' ? 'text-accent-main' : 'text-green-400'}>{storageMode}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsSmartMode(!isSmartMode)}
                            className={`flex items-center gap-2 px-6 py-3 font-black rounded-xl transition-all text-xs shadow-lg ${isSmartMode ? "bg-white text-background-tertiary" : "bg-white/10 text-white border border-white/20 hover:bg-white/20"}`}
                        >
                            <Sparkles size={18} /> {isSmartMode ? "Exit Smart Setup" : "Smart Budget Setup"}
                        </button>

                        <button className="flex items-center gap-2 px-6 py-3 bg-accent-main text-white font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-xs">
                            <Plus size={18} /> New Category
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Wallet className="text-accent-main" />
                                    <h2 className="text-xl font-bold text-white">Active Categories</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {budgets.length} Categories Defined
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoading ? (
                                    <div className="col-span-2 py-20 flex justify-center text-accent-main">
                                        <Loader2 className="animate-spin" size={32} />
                                    </div>
                                ) : budgets.length === 0 ? (
                                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <p className="text-gray-500 text-xs font-black uppercase tracking-widest">No budgets found. Start by adding one!</p>
                                    </div>
                                ) : budgets.map((budget) => {
                                    const Icon = icon_map[budget.category?.icon] || Wallet;
                                    const cardSpent = Number(budget.spent) || 0;
                                    const cardLimit = Number(budget.amount) || 0;
                                    const cardPercent = cardLimit > 0 ? Math.min((cardSpent / cardLimit) * 100, 100) : 0;

                                    return (
                                        <div key={budget.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-accent-main">
                                                        <Icon size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-bold">{budget.category?.name || 'Category'}</h3>
                                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Limit: £{cardLimit.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                                    <Settings2 size={18} />
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase">
                                                    <span className="text-gray-500">Spent: £{cardSpent.toFixed(2)}</span>
                                                    <span className={cardPercent > 90 ? 'text-red-400' : 'text-accent-main'}>
                                                        {cardPercent.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-700 ${cardPercent > 90 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-accent-main shadow-[0_0_8px_rgba(30,255,188,0.3)]'}`}
                                                        style={{ width: `${cardPercent}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        {!isSmartMode && (
                            <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <CheckCircle2 size={20} className="text-accent-main" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Budget Health</h2>
                                </div>
                                <div className="text-center py-4">
                                    <p className="text-4xl font-black text-white">£{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">Total Monthly Allowance</p>
                                </div>
                                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-accent-main h-full transition-all duration-1000" 
                                        style={{ width: `${utilisationPercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-tighter">
                                    Total Utilisation: {utilisationPercent.toFixed(0)}%
                                </p>
                            </div>
                        )}

                        {isSmartMode && (
                            <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center gap-2 text-accent-main">
                                    <Sparkles size={20} />
                                    <h2 className="text-sm font-black uppercase tracking-widest">Smart Config</h2>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed font-medium">Input your monthly net income to auto-distribute budgets.</p>
                                <div className="space-y-4">
                                    <input type="number" placeholder="£ Monthly Income" className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-accent-main outline-none" />
                                    <button className="w-full py-4 bg-accent-main text-white font-black rounded-xl text-xs shadow-lg hover:scale-[1.02] transition-all">Generate Smart Budget</button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardBudgets;