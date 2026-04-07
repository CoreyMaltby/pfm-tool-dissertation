// Dashboard Budgets Page

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import {
    Wallet, Plus, Sparkles, Utensils, Settings2,
    CheckCircle2, Loader2, Car, Smartphone,
    ShoppingBag, CreditCard, Coffee, Zap, TrendingUp,
    Trash2, Brain
} from 'lucide-react';
import { dataService } from "../services/dataService";
import AddBudgetForm from "../components/addBudgetForm";
import ContextualTip from "../components/ContextualTips";

const icon_map = { Utensils, Car, Smartphone, ShoppingBag, Wallet, CreditCard, Coffee, Zap, TrendingUp };

const DashboardBudgets = ({ session }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [isSmartMode, setIsSmartMode] = useState(false);
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('loading');
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [categories, setCategories] = useState([]);
    const userId = session?.user?.id;

    const fetchBudgets = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);
            const [budgetData, categoryData] = await Promise.all([
                dataService.fetchBudgets(userId),
                dataService.fetchCategories(userId)
            ]);
            setBudgets(budgetData);
            setCategories(categoryData);
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

    const loadSmartSuggestions = async () => {
        if (!isSmartMode) return;
        setSuggestionsLoading(true);
        try {
            const data = await dataService.getSmartBudgetSuggestions(userId);
            setSuggestions(data);
        } catch (error) {
            console.error("Smart setup failed:", error);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    useEffect(() => { loadSmartSuggestions(); }, [isSmartMode]);

    const applySmartBudget = async (catId, amount) => {
        setIsApplying(true);
        const existing = budgets.find(b => b.category_id === catId);
        if (existing) {
            await dataService.updateBudget({ ...existing, amount }, userId);
        } else {
            await dataService.saveBudget({ category_id: catId, amount }, userId);
        }
        await fetchBudgets();
        setIsApplying(false);
    };

    const applyAllSmartBudgets = async () => {
        if (suggestions.length === 0) return;
        setIsApplying(true);
        try {
            for (const suggestion of suggestions) {
                const existing = budgets.find(b => b.category_id === suggestion.category_id);
                if (existing) {
                    await dataService.updateBudget({ ...existing, amount: suggestion.suggestedLimit }, userId);
                } else {
                    await dataService.saveBudget({
                        category_id: suggestion.category_id,
                        amount: suggestion.suggestedLimit
                    }, userId);
                }
            }
            await fetchBudgets();
            setIsSmartMode(false);
        } catch (error) {
            console.error("Apply all failed:", error);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar session={session} />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white"> Budgets</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Storage: <span className={storageMode === 'cloud' ? 'text-white' : 'text-white'}>{storageMode}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsSmartMode(!isSmartMode)}
                            className={`flex items-center gap-2 px-6 py-3 font-black rounded-xl transition-all text-xs border ${isSmartMode
                                ? "bg-white text-black border-accent-main"
                                : "bg-white text-black border-white/10 hover:opacity-90"
                                }`}
                        >
                            <Sparkles size={18} /> {isSmartMode ? "Exit Smart" : "Smart Setup"}
                        </button>
                        <button onClick={() => { setEditingBudget(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <Plus size={18} /> New Budget
                        </button>
                    </div>
                </header>

                {/* Smart Budgets */}
                {isSmartMode && (
                    <div className="bg-background-secondary border border-white/5 rounded-[2.5rem] p-8 space-y-8 animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-accent-main/10 rounded-2xl text-accent-main border border-accent-main/20">
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Smart Setup</h2>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                        AI recommendations based on history
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {suggestions.length > 0 && (
                                    <button
                                        disabled={isApplying}
                                        onClick={applyAllSmartBudgets}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl hover:bg-accent-main transition-all transform active:scale-95 shadow-lg shadow-white/5 disabled:opacity-50"
                                    >
                                        {isApplying ? (
                                            <Loader2 className="animate-spin" size={14} />
                                        ) : (
                                            <CheckCircle2 size={14} />
                                        )}
                                        Apply All Suggestions
                                    </button>
                                )}
                                {suggestionsLoading && <Loader2 className="animate-spin text-accent-main" size={20} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.length === 0 && !suggestionsLoading ? (
                                <div className="col-span-full py-10 bg-white/5 rounded-3xl border border-dashed border-white/10 text-center">
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Insufficient data for predictions</p>
                                </div>
                            ) : (
                                suggestions.map(suggestion => {
                                    const category = categories.find(c => c.id === suggestion.category_id) ||
                                        { name: "Activity", icon: "Wallet" };

                                    return (
                                        <div key={suggestion.category_id} className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-accent-main/30 hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-accent-main uppercase mb-1 tracking-widest">{category.name}</p>
                                                <p className="text-2xl font-black text-white">£{suggestion.suggestedLimit}</p>
                                            </div>
                                            <button
                                                disabled={isApplying}
                                                onClick={() => applySmartBudget(suggestion.category_id, suggestion.suggestedLimit)}
                                                className="px-5 py-2 bg-accent-main text-black text-[10px] font-black uppercase rounded-lg hover:scale-105 transition-all transform active:scale-95 disabled:opacity-50 shadow-lg shadow-accent-main/10"
                                            >
                                                {isApplying ? "..." : "Apply"}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                <ContextualTip category="Budgeting" />

                {/* Main */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
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
                        <div className="bg-background-secondary rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
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