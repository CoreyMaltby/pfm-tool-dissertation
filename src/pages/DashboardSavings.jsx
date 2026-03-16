// Dashboard Savings Page


import React from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Plus, Target, TrendingUp, PiggyBank } from 'lucide-react';

const DashboardSavings = () => {
    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-10 space-y-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Savings Goals</h1>
                    </div>

                    <div className="flex gap-3">
                        {/* Add to Savings Button 
                        TODO: Add Links*/}
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl hover:scale-105 transition-all text-xs border border-white/10"
                        >
                            <PiggyBank size={18} /> Add to Savings
                        </button>

                        {/* Add New Goal Button
                        TODO: Add Links */}
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl hover:scale-105 transition-all text-xs border border-white/10"
                        >
                            <Plus size={18} /> Add New Goal
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Goal Card - TODO: Map from Database */}
                    <section className="lg:col-span-2 bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="text-accent-main" size={24} />
                            <h2 className="text-xl font-bold text-white">Active Goals</h2>
                        </div>

                        <div
                            className="p-20 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-[10px]"
                        >
                            Goal Progress Bars Visualized Here
                        </div>
                    </section>

                    {/* Savings Insight Card */}
                    <section className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-accent-main" size={24} />
                            <h2 className="text-xl font-bold text-white">Savings Rate</h2>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                            <p className="text-4xl font-black text-white">%</p>
                            <p className="text-[14px] text-gray-500 font-black uppercase tracking-tighter mt-2">
                                Of income saved this month
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardSavings;