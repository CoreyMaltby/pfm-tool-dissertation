/** Dashboard Insights Page
 * Template-based chart builder and export functionality.
 */

import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import {
    BarChart3, PieChart, TrendingUp, Download,
    Plus, Filter, FileJson, FileSpreadsheet, Zap
} from 'lucide-react';

const DashboardInsights = () => {
    // TODO: State for custom chart builder
    const [selectedTemplate, setSelectedTemplate] = useState("Spending Trend");

    const templates = [
        { name: "Spending Trend", icon: TrendingUp },
        { name: "Category Mix", icon: PieChart },
        { name: "Budget Variance", icon: BarChart3 },
    ];

    const handleExport = (format) => {
        alert(`Preparing ${selectedTemplate} for export as ${format}...`);
        // TODO: Integration with jsPDF or ExcelJS
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Financial Insights</h1>
                    </div>

                    <div className="flex gap-3">
                        {/* Export Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white text-background-tertiary font-black rounded-xl transition-all text-xs shadow-lg">
                                <Download size={18} /> Export Data
                            </button>
                            {/* Export Functions */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-background-secondary border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10 overflow-hidden">
                                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2">
                                    <FileSpreadsheet size={14} className="text-accent-main" /> Export as PDF
                                </button>
                                <button onClick={() => handleExport('CSV')} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2">
                                    <FileJson size={14} className="text-accent-main" /> Export as CSV
                                </button>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-xs border border-white/10">
                            <Plus size={18} /> Create Custom Chart
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Template Selection Sidebar */}
                    <section className="bg-background-secondary rounded-3xl p-6 border border-white/5 space-y-6">
                        <div className="flex items-center gap-2 text-accent-main px-2">
                            <Filter size={18} />
                            <h2 className="text-sm font-black uppercase tracking-widest">Templates</h2>
                        </div>
                        <nav className="space-y-2">
                            {templates.map((temp) => (
                                <button
                                    key={temp.name}
                                    onClick={() => setSelectedTemplate(temp.name)}
                                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold transition-all ${selectedTemplate === temp.name
                                            ? "bg-accent-main text-white shadow-lg"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <temp.icon size={16} />
                                    {temp.name}
                                </button>
                            ))}
                        </nav>
                    </section>

                    {/* Main Chart Stage */}
                    <section className="lg:col-span-3 space-y-8">
                        {/* Dynamic Chart Area */}
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 h-[500px] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedTemplate}</h2>
                                    <p className="text-xs text-gray-500 font-medium">Dynamic visualization of your financial flow</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] bg-accent-main/10 text-accent-main px-2 py-1 rounded-md font-black uppercase">Live Data</span>
                                </div>
                            </div>

                            {/* TODO: Recharts/ChartJS Integration */}
                            <div className="flex-1 mt-8 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                {selectedTemplate} Visualization Stage
                            </div>
                        </div>

                        {/* Automated Insight Nudge */}
                        <div className="bg-background-secondary rounded-3xl p-6 border border-white/5 flex items-center gap-6">
                            <div className="w-12 h-12 bg-accent-main/10 rounded-2xl flex items-center justify-center text-accent-main shrink-0">
                                <Zap size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Automated Insight</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Based on your <strong>{selectedTemplate}</strong>, you could save an additional <strong>£45.00</strong> this month by reducing non-essential subscriptions detected in your transactions.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardInsights;