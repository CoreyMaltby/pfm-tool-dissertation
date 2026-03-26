/** Dashboard Insights Page
 * Template-based chart builder and export functionality.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart3, PieChart, TrendingUp, Download, Plus, Filter,
    FileJson, FileSpreadsheet, Zap, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RePie, Pie
} from 'recharts';
import DashboardSidebar from "../components/DashboardSidebar";
import { dataService } from "../services/dataService";

const DashboardInsights = ({ session }) => {
    const [selectedTemplate, setSelectedTemplate] = useState("Spending Trend");
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = session?.user?.id;

    // Fetch data
    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;
            try {
                const data = await dataService.fetchAllTransactions(userId);
                setTransactions(data || []);
            } catch (error) {
                console.error("Insights load error: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userId]);

    // Spending Trend
    const trendData = useMemo(() => {
        const groups = transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                const date = new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                acc[date] = (acc[date] || 0) + Math.abs(t.amount);
                return acc;
            }, {});

        // Convert to sorted array
        return Object.keys(groups).map(date => ({
            date,
            amount: groups[date]
        })).slice(-7)
    }, [transactions])

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
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white leading-tight">Financial Insights</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Analytics Dashboard</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl transition-all text-xs shadow-lg">
                                <Download size={18} /> Export Data
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-background-secondary border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-10 overflow-hidden">
                                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2 font-bold">
                                    <FileSpreadsheet size={14} className="text-accent-main" /> Export as PDF
                                </button>
                                <button onClick={() => handleExport('CSV')} className="w-full px-4 py-3 text-left text-xs text-white hover:bg-white/5 flex items-center gap-2 font-bold">
                                    <FileJson size={14} className="text-accent-main" /> Export as CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Template Sidebar */}
                    <section className="bg-background-secondary rounded-[2.5rem] p-6 border border-white/5 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-2 text-accent-main px-2">
                            <Filter size={18} />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Templates</h2>
                        </div>
                        <nav className="space-y-2">
                            {templates.map((temp) => (
                                <button
                                    key={temp.name}
                                    onClick={() => setSelectedTemplate(temp.name)}
                                    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedTemplate === temp.name
                                        ? "bg-accent-main text-white shadow-xl scale-[1.02]"
                                        : "text-gray-500 hover:bg-white/5 hover:text-white"
                                        }`}
                                >
                                    <temp.icon size={16} />
                                    {temp.name}
                                </button>
                            ))}
                        </nav>
                    </section>

                    {/* Chart Stage */}
                    <section className="lg:col-span-3 space-y-8">
                        <div className="bg-background-secondary rounded-[2.5rem] p-10 border border-white/5 h-[550px] flex flex-col shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">{selectedTemplate}</h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time Visualization</p>
                                </div>
                                <div className="p-3 bg-accent-main/10 rounded-2xl">
                                    <Zap className="text-accent-main" size={20} />
                                </div>
                            </div>

                            <div className="flex-1 w-full min-h-0 relative"> {/* FIXED: Added min-h-0 and relative */}
                                {isLoading ? (
                                    <div className="h-full flex items-center justify-center text-gray-500 gap-3">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Processing Data...</span>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        {selectedTemplate === "Spending Trend" ? (
                                            <AreaChart data={trendData}>
                                                <defs>
                                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                                            </AreaChart>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] border border-dashed border-white/10 rounded-3xl">
                                                {selectedTemplate} Development in Progress
                                            </div>
                                        )}
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default DashboardInsights;