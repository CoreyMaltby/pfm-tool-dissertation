// Dashboard Savings Page


import React, { use, useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Plus, Target, TrendingUp, PiggyBank, Loader2, Settings2, Trash2, ReceiptTurkishLiraIcon } from 'lucide-react';
import { dataService } from "../services/dataService";
import AddGoalForm from "../components/addGoalForm";
import AddToSavingsForm from "../components/addToSavingsForm";

const DashboardSavings = ({ session }) => {
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageMode, setStorageMode] = useState('loading');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [preSelectedGoalId, setPreSelectedGoalId] = useState(null);
    const userId = session?.user?.id;

    const fetchGoals = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode)

            const data = await dataService.fetchSavingsGoals(userId);
            setGoals(data || []);
        } catch (error) {
            console.error("Failed to load savings goals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [userId]);

    // Calculations
    const totalSaved = goals.reduce((acc, curr) => acc + (Number(curr.current_amount) || 0), 0);
    const totalTarget = goals.reduce((acc, curr) => acc + (Number(curr.target_amount) || 0), 0);

    const globalProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setIsFormOpen(true);
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm("Are you sure you want to delete this goal")) return;
        try {
            await dataService.deleteSavingsGoal(goalId, userId);
            fetchGoals();
        } catch (error) {
            console.error("Delete goal failed: ", error);
        }
    };

    const handleAddMoney = (goalId = null) => {
        setPreSelectedGoalId(goalId);
        setIsAddMoneyOpen(true);
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar session={session} />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Savings Goals</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Storage: <span className={storageMode === 'cloud' ? 'text-white' : 'text-white'}>{storageMode}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => handleAddMoney()} className="flex items-center gap-2 px-6 py-3 font-black rounded-xl transition-all text-xs shadow-lg bg-background-secondary text-white hover:scale-105">
                            <PiggyBank size={18} /> Add to Savings
                        </button>
                        <button
                            onClick={() => { setEditingGoal(null); setIsFormOpen(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <Plus size={18} /> New Goal
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active goals */}
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Target className="text-accent-main" size={24} />
                                    <h2 className="text-xl font-bold text-white">Active Goals</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    {goals.length} Goals Tracked
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {isLoading ? (
                                    <div className="py-20 flex justify-center text-accent-main">
                                        <Loader2 className="animate-spin" size={32} />
                                    </div>
                                ) : goals.length === 0 ? (
                                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl text-gray-500 text-xs font-black uppercase tracking-widest">
                                        No active goals found.
                                    </div>
                                ) : goals.map((goal) => {
                                    const current = Number(goal.current_amount) || 0;
                                    const target = Number(goal.target_amount) || 0;
                                    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;

                                    return (
                                        <div key={goal.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4 group hover:bg-white/10 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{goal.name || 'Untitled Goal'}</h3>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                        Target: £{target.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleAddMoney(goal.id)} className="p-2 bg-accent-main/10 text-accent-main rounded-lg hover:bg-accent-main hover:text-white transition-all"> <PiggyBank size={16} /> </button>
                                                    <button onClick={() => handleEdit(goal)} className="p-2 text-gray-400 bg-white/5 hover:text-white rounded-lg transition-all"><Settings2 size={16} /></button>
                                                    <button onClick={() => handleDelete(goal.id)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase">
                                                    <span className="text-accent-main">Saved: £{current.toLocaleString()}</span>
                                                    <span className="text-white">{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-accent-main transition-all duration-1000 shadow-[0_0_8px_rgba(30,255,188,0.3)]"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Savings Insight Card */}
                    <section className="space-y-8">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-accent-main" size={24} />
                                <h2 className="text-xl font-bold text-white">Savings Rate</h2>
                            </div>

                            <div className="text-center py-4">
                                <p className="text-4xl font-black text-white">{globalProgress.toFixed(0)}%</p>
                                <p className="text-[10px] text-gray-500 font-black uppercase mt-1 tracking-widest">
                                    Overall Target Completion
                                </p>
                            </div>

                            <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
                                <div
                                    className="bg-accent-main h-full transition-all duration-1000"
                                    style={{ width: `${globalProgress}%` }}
                                ></div>
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Total Saved</span>
                                    <span className="text-xs font-bold text-white">£{totalSaved.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Remaining</span>
                                    <span className="text-xs font-bold text-accent-main">£{(totalTarget - totalSaved).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <AddGoalForm
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setEditingGoal(null); }}
                userId={userId}
                onSuccess={fetchGoals}
                editingGoal={editingGoal}
            />

            <AddToSavingsForm 
                isOpen={isAddMoneyOpen}
                onClose={() => { setIsAddMoneyOpen(false); setPreSelectedGoalId(null); }}
                userId={userId}
                onSuccess={fetchGoals}
                preSelectedGoalId={preSelectedGoalId}
                goals={goals}
            />
        </div>
    );
};

export default DashboardSavings;