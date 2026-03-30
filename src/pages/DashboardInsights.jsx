import React, { useState, useEffect, useMemo } from "react";
import {
    BarChart3, PieChart, TrendingUp, Download, Plus, Filter,
    FileJson, FileSpreadsheet, Zap, Loader2, Info, Activity, Grid3x3, MousePointer2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RePie, Pie, Cell, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import DashboardSidebar from "../components/DashboardSidebar";
import { dataService } from "../services/dataService";

const category_colours = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

const DashboardInsights = ({ session }) => {
    const [selectedTemplate, setSelectedTemplate] = useState("Spending Trend");
    const [transactions, setTransactions] = useState([]);
    const [timeFrame, setTimeFrame] = useState("1Y");
    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = session?.user?.id;

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const [txData, budgetData] = await Promise.all([
                    dataService.fetchAllTransactions(userId),
                    dataService.fetchBudgets(userId)
                ]);
                setTransactions(txData || []);
                setBudgets(budgetData || []);
            } catch (error) {
                console.error("Insights load error: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userId]);

    // THE FILTER ENGINE - Handles date logic
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        let startDate = new Date();

        if (timeFrame === '7d') startDate.setDate(now.getDate() - 7);
        else if (timeFrame === '30d') startDate.setDate(now.getDate() - 30);
        else if (timeFrame === 'MTD') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (timeFrame === '1Y') startDate.setFullYear(now.getFullYear() - 1);

        return transactions.filter(t => new Date(t.created_at) >= startDate);
    }, [transactions, timeFrame]);

    const trendData = useMemo(() => {
        const groups = filteredTransactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                const date = new Date(t.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                acc[date] = (acc[date] || 0) + Math.abs(t.amount);
                return acc;
            }, {});

        return Object.keys(groups).map(date => ({ date, amount: groups[date] }));
    }, [filteredTransactions]);

    const categoryData = useMemo(() => {
        const groups = filteredTransactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                const name = t.category?.name || "Other";
                acc[name] = (acc[name] || 0) + Math.abs(t.amount);
                return acc;
            }, {});

        return Object.keys(groups).map((name, index) => ({
            name,
            value: groups[name],
            fill: category_colours[index % category_colours.length]
        })).sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const varianceData = useMemo(() => {
        return budgets.map(b => ({
            name: b.category?.name || "Budget",
            Allocated: Number(b.limit_amount) || 0,
            Actual: Number(b.spent) || 0,
        }));
    }, [budgets]);

    const heatmapData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map((day) => ({ day, value: 0 }));

        filteredTransactions.filter(t => t.amount < 0).forEach(t => {
            const dayIdx = new Date(t.created_at).getDay();
            if (data[dayIdx]) {
                data[dayIdx].value += Math.abs(t.amount);
            }
        });
        return data;
    }, [filteredTransactions]);

    const templates = [
        { name: "Spending Trend", icon: TrendingUp, desc: "Tracking of daily expenses" },
        { name: "Category Mix", icon: PieChart, desc: "Mix of your spending" },
        { name: "Budget Variance", icon: BarChart3, desc: "Allocated vs. Real-world spend" },
        { name: "Daily Line", icon: Activity, desc: "Raw Spending Changes" },
        { name: "Spending Heatmap", icon: Grid3x3, desc: "Spending by day of week" },
    ];

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">Financial Insights</h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Analytical Intelligence</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/5 shadow-inner">
                            {['7d', '30d', 'MTD', '1Y'].map((t) => (
                                <button key={t} onClick={() => setTimeFrame(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${timeFrame === t ? 'bg-accent-main text-white' : 'text-gray-500 hover:text-white'}`}>{t}</button>
                            ))}
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl transition-all text-xs shadow-lg hover:scale-105 active:scale-95"><Download size={18} /> Export Data</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <section className="space-y-4">
                        <div className="bg-background-secondary rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl">
                            <div className="flex items-center gap-2 text-accent-main px-2"><Filter size={18} /><h2 className="text-[10px] font-black uppercase tracking-widest">Visual Engine</h2></div>
                            <nav className="space-y-2">
                                {templates.map((temp) => (
                                    <button key={temp.name} onClick={() => setSelectedTemplate(temp.name)} className={`w-full flex flex-col items-start gap-1 px-6 py-4 rounded-2xl transition-all ${selectedTemplate === temp.name ? "bg-accent-main text-white shadow-xl scale-[1.02]" : "text-gray-400 hover:bg-white/5"}`}>
                                        <div className="flex items-center gap-3"><temp.icon size={16} /><span className="text-[11px] font-black uppercase tracking-widest">{temp.name}</span></div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Quick Stats Widget */}
                        <div className="bg-background-secondary rounded-3xl p-6 border border-white/10 shadow-xl">
                            <p className="text-accent-main font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Info size={14} /> Quick Stats
                            </p>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[11px] text-white font-bold uppercase tracking-tight">Daily Avg.</span>
                                    <span className="text-sm font-black text-white">£{(trendData.length > 0 ? trendData.reduce((a, b) => a + b.amount, 0) / trendData.length : 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-white font-bold uppercase tracking-tight">Active Days</span>
                                    <span className="text-sm font-black text-accent-main">{trendData.length}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="lg:col-span-3 space-y-8">
                        <div className="bg-background-secondary rounded-[2.5rem] p-10 border border-white/10 h-[550px] flex flex-col shadow-2xl relative">
                            <h2 className="text-2xl font-black text-white mb-10 tracking-tight">{selectedTemplate}</h2>
                            <div className="flex-1 w-full min-h-0 relative">
                                {isLoading ? <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div> : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        {selectedTemplate === "Spending Trend" ? (
                                            <AreaChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} dy={10} />
                                                <YAxis tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `£${v}`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} formatter={(v) => [`£${v}`, 'Spent']} />
                                                <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={4} fill="#22c55e" fillOpacity={0.15} />
                                            </AreaChart>
                                        ) : selectedTemplate === "Daily Line" ? (
                                            <LineChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} />
                                                <YAxis tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `£${v}`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
                                                <Line type="stepAfter" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                            </LineChart>
                                        ) : selectedTemplate === "Category Mix" ? (
                                            <RePie>
                                                <Pie data={categoryData} dataKey="value" cx="50%" cy="45%" outerRadius={110} label={({ name, value }) => `${name}: £${value.toFixed(0)}`} stroke="none">
                                                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                                                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '10px' }} />
                                            </RePie>
                                        ) : (
                                            <BarChart
                                                data={selectedTemplate === "Spending Heatmap" ? heatmapData : varianceData}
                                                layout={selectedTemplate === "Spending Heatmap" ? "vertical" : "horizontal"}
                                                margin={selectedTemplate === "Spending Heatmap" ? { left: 40, right: 40 } : { top: 10 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                {selectedTemplate === "Spending Heatmap" ? (
                                                    <>
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="day" type="category" tick={{ fill: '#fff', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                        <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                                            {heatmapData.map((entry, i) => (
                                                                <Cell key={i} fill={entry.value > 500 ? '#ef4444' : entry.value > 100 ? '#f59e0b' : '#22c55e'} />
                                                            ))}
                                                            <LabelList dataKey="value" position="right" formatter={(v) => `£${v.toFixed(0)}`} style={{ fill: '#fff', fontSize: '10px', fontWeight: 'bold' }} />
                                                        </Bar>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} />
                                                        <YAxis tick={{ fill: '#fff', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `£${val}`} />
                                                        <Bar dataKey="Allocated" fill="#00c3ff" radius={[6, 6, 0, 0]} />
                                                        <Bar dataKey="Actual" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                                        <Legend verticalAlign="top" align="right" />
                                                    </>
                                                )}
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '12px' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
                                            </BarChart>
                                        )}
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Recommendation Card */}
                        <div className="bg-background-secondary border border-white/10 p-8 rounded-[2.5rem] flex items-center gap-8 shadow-2xl relative overflow-hidden group">
                            <div className="w-16 h-16 bg-accent-main/20 rounded-[1.5rem] flex items-center justify-center text-accent-main shrink-0 backdrop-blur-sm">
                                <Zap size={32} />
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                                    Intelligence Insight
                                </h3>
                                <p className="text-white font-bold text-xs leading-relaxed max-w-xl">
                                    {selectedTemplate === "Budget Variance"
                                        ? `Efficiency Score: ${varianceData.length > 0 ? Math.round((varianceData.reduce((a, b) => a + b.Actual, 0) / varianceData.reduce((a, b) => a + (b.Allocated || 1), 0)) * 100) : 0}%. You are managing your allocations effectively.`
                                        : `Spend Velocity: £${(trendData.reduce((a, b) => a + b.amount, 0) / (trendData.length || 1)).toFixed(2)}/day. Your top expense is ${categoryData[0]?.name || 'uncategorized'}.`
                                    }
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