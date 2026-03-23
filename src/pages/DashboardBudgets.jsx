// Dashboard Budgets Page

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import {
    Wallet, Plus, Sparkles, Utensils, Settings2,
    CheckCircle2, Loader2, Car, Smartphone,
    ShoppingBag, CreditCard, Coffee, Zap, TrendingUp, Trash2
} from 'lucide-react';
import { dataService } from "../services/dataService";
import AddBudgetForm from "../components/addBudgetForm";

const icon_map = { Utensils, Car, Smartphone, ShoppingBag, Wallet, CreditCard, Coffee, Zap, TrendingUp };

const DashboardBudgets = ({ session }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('loading');
    const [incomeInput, setIncomeInput] = useState("");
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
            console.error("Failed to load budgets:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchBudgets(); }, [userId]);

    const totalAllocated = budgets.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + (Number(curr.spent) || 0), 0);
    const utilisationPercent = totalAllocated > 0 ? Math.min((totalSpent / totalAllocated) * 100, 100) : 0;

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this budget category?")) return;
        await dataService.deleteBudget(id, userId);
        fetchBudgets();
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Manage Budgets</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Storage: <span className={storageMode === 'cloud' ? 'text-white' : 'text-white'}>{storageMode}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsSmartMode(!isSmartMode)} className={`flex items-center gap-2 px-6 py-3 font-black rounded-xl transition-all text-xs shadow-lg ${isSmartMode ? "bg-white text-black" : "bg-background-secondary text-white hover:scale-105"}`}>
                            <Sparkles size={18} /> {isSmartMode ? "Exit Smart" : "Smart Setup"}
                        </button>
                        <button onClick={() => { setEditingBudget(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <Plus size={18} /> New Budget
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoading ? (
                                    <div className="col-span-2 py-20 flex justify-center text-accent-main"><Loader2 className="animate-spin" size={32} /></div>
                                ) : budgets.map((budget) => {
                                    const Icon = icon_map[budget.category?.icon] || Wallet;
                                    const cardSpent = Number(budget.spent) || 0;
                                    const cardLimit = Number(budget.amount) || 0;
                                    const cardPercent = cardLimit > 0 ? Math.min((cardSpent / cardLimit) * 100, 100) : 0;

                                    return (
                                        <div key={budget.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-accent-main"><Icon size={24} /></div>
                                                    <div>
                                                        <h3 className="text-white font-bold">{budget.category?.name || 'Category'}</h3>
                                                        <p className="text-[10px] text-gray-500 uppercase font-black">Limit: £{cardLimit.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {/* FIXED: Action button visibility */}
                                                    <button onClick={() => { setEditingBudget(budget); setIsFormOpen(true); }} className="p-2 text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white rounded-lg transition-all"><Settings2 size={16} /></button>
                                                    <button onClick={() => handleDelete(budget.id)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase">
                                                    <span className="text-gray-500">Spent: £{cardSpent.toFixed(2)}</span>
                                                    <span className={cardPercent > 90 ? 'text-red-400' : 'text-accent-main'}>{cardPercent.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                                                    <div className={`h-full transition-all duration-700 ${cardPercent > 90 ? 'bg-red-500' : 'bg-accent-main'}`} style={{ width: `${cardPercent}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                            <div className="flex items-center gap-2 text-gray-400"><CheckCircle2 size={20} className="text-accent-main" /><h2 className="text-sm font-black uppercase tracking-widest text-white">Budget Health</h2></div>
                            <div className="text-center py-4">
                                <p className="text-4xl font-black text-white">£{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase mt-1">Total Monthly Allowance</p>
                            </div>
                            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                <div className="bg-accent-main h-full transition-all duration-1000" style={{ width: `${utilisationPercent}%` }}></div>
                            </div>
                            <p className="text-[10px] text-center text-gray-500 font-bold uppercase">Utilisation: {utilisationPercent.toFixed(0)}%</p>
                        </div>
                    </section>
                </div>
            </main>

            {/* ADDED: Missing form component */}
            {isFormOpen && (
                <AddBudgetForm 
                    isOpen={isFormOpen} 
                    onClose={() => { setIsFormOpen(false); setEditingBudget(null); }} 
                    userId={userId} 
                    onSuccess={fetchBudgets}
                    editingBudget={editingBudget} 
                />
            )}
        </div>
    );
};

export default DashboardBudgets;