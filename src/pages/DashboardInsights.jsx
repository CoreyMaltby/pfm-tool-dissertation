import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    BarChart3, PieChart, TrendingUp, Download, Plus, Filter,
    Zap, Loader2, Info, Activity, Grid3x3, RefreshCcw, FileImage,
    FileJson, TrendingDown, AlertCircle, Target, CheckCircle2
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RePie, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import * as htmlToImage from 'html-to-image';
import DashboardSidebar from "../components/DashboardSidebar";
import { dataService } from "../services/dataService";
import ContextualTip from "../components/ContextualTips";

const category_colours = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

const CreateChartModal = ({ isOpen, onClose, accounts, config, setConfig, onCreate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            {/* Content */}
            <div className="relative bg-background-secondary w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Chart Builder</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <Plus className="rotate-45" size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Select Template Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Visual Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Bar', 'Line', 'Area'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setConfig({ ...config, type })}
                                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${config.type === type ? 'bg-accent-main border-accent-main text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Select Source */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Data Source</label>
                            <select
                                value={config.source}
                                onChange={(e) => setConfig({ ...config, source: e.target.value })}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-accent-main/20 outline-none cursor-pointer"
                            >
                                <option value="all">All Transactions</option>
                                <optgroup label="Specific Accounts">
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">From</label>
                                <input
                                    type="date"
                                    value={config.dateStart}
                                    onChange={(e) => setConfig({ ...config, dateStart: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white color-scheme-dark"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">To</label>
                                <input
                                    type="date"
                                    value={config.dateEnd}
                                    onChange={(e) => setConfig({ ...config, dateEnd: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white color-scheme-dark"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onCreate}
                        className="w-full py-4 bg-accent-main text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent-main/20 hover:scale-[1.02] transition-all"
                    >
                        Generate Custom Insight
                    </button>
                </div>
            </div>
        </div>
    );
};

const DashboardInsights = ({ session }) => {
    const [selectedTemplate, setSelectedTemplate] = useState("Spending Trend");
    const [transactions, setTransactions] = useState([]);
    const [timeFrame, setTimeFrame] = useState("1Y");
    const [budgets, setBudgets] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const chartRef = useRef(null);
    const userId = session?.user?.id;

    const [customConfig, setCustomConfig] = useState({
        type: 'Bar',
        source: 'all',
        dateStart: '',
        dateEnd: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const [txData, budgetData, accData] = await Promise.all([
                    dataService.fetchAllTransactions(userId),
                    dataService.fetchBudgets(userId),
                    dataService.fetchAccounts(userId)

                ]);
                setTransactions(txData || []);
                setBudgets(budgetData || []);
                setAccounts(accData || []);
            } catch (error) {
                console.error("Insights load error: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userId]);

    const filteredTransactions = useMemo(() => {
        let data = transactions;

        // Apply Custom Modal Filters if "Custom View" is active
        if (selectedTemplate === "Custom View") {
            if (customConfig.source !== 'all') {
                data = data.filter(t => t.account_id === customConfig.source);
            }
            if (customConfig.dateStart) {
                data = data.filter(t => new Date(t.created_at) >= new Date(customConfig.dateStart));
            }
            if (customConfig.dateEnd) {
                data = data.filter(t => new Date(t.created_at) <= new Date(customConfig.dateEnd));
            }
            return data;
        }

        const now = new Date();
        let startDate = new Date();
        if (timeFrame === '7d') startDate.setDate(now.getDate() - 7);
        else if (timeFrame === '30d') startDate.setDate(now.getDate() - 30);
        else if (timeFrame === 'MTD') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        else if (timeFrame === '1Y') startDate.setFullYear(now.getFullYear() - 1);

        return data.filter(t => new Date(t.created_at) >= startDate);
    }, [transactions, timeFrame, selectedTemplate, customConfig]);

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
        const groups = filteredTransactions.filter(t => t.amount < 0).reduce((acc, t) => {
            const name = t.category?.name || "Other";
            acc[name] = (acc[name] || 0) + Math.abs(t.amount);
            return acc;
        }, {});
        return Object.keys(groups).map((name, index) => ({
            name, value: groups[name], fill: category_colours[index % category_colours.length]
        })).sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const varianceData = useMemo(() => {
        return budgets.map(b => ({ name: b.category?.name || "Budget", Allocated: Number(b.limit_amount) || 0, Actual: Number(b.spent) || 0 }));
    }, [budgets]);

    const heatmapData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = days.map(day => ({ day, value: 0 }));
        filteredTransactions.filter(t => t.amount < 0).forEach(t => {
            const dayIdx = new Date(t.created_at).getDay();
            if (data[dayIdx]) data[dayIdx].value += Math.abs(t.amount);
        });
        return data;
    }, [filteredTransactions]);

    const handleDownloadPNG = async () => {
        if (!chartRef.current) return;
        try {
            const dataUrl = await htmlToImage.toPng(chartRef.current, {
                backgroundColor: '#121212',
                style: { borderRadius: '2.5rem' },
                cacheBust: true,
            });
            const link = document.createElement('a');
            link.download = `${selectedTemplate.toLowerCase().replace(/\s/g, '_')}_insight.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed: ', error);
        }
    };

    const templates = [
        { name: "Spending Trend", icon: TrendingUp, desc: "Tracking of daily expenses" },
        { name: "Category Mix", icon: PieChart, desc: "Mix of your spending" },
        { name: "Budget Variance", icon: BarChart3, desc: "Allocated vs. Real-world spend" },
        { name: "Daily Line", icon: Activity, desc: "Raw Spending Changes" },
        { name: "Spending Heatmap", icon: Grid3x3, desc: "Spending by day of week" },
    ];

    const insightsCalc = useMemo(() => {
        if (filteredTransactions.length === 0) return [];

        const totalSpending = trendData.reduce((a, b) => a + b.amount, 0);
        const dailyAvg = totalSpending / (trendData.length || 1);
        const topCat = categoryData[0];
        const overBudgets = varianceData.filter(v => v.Actual > v.Allocated).length;
        const largestTx = [...filteredTransactions].sort((a, b) => a.amount - b.amount)[0];

        return [
            {
                title: "Daily Average",
                value: `£${dailyAvg.toFixed(2)}`,
                desc: "What you spend on average each day.",
                icon: TrendingDown,
                color: "text-blue-400"
            },
            {
                title: "Biggest Expenses",
                value: topCat?.name || "None",
                desc: `You spend the most on ${topCat?.name || 'this area'}.`,
                icon: PieChart,
                color: "text-purple-400"
            },
            {
                title: "Budget Status",
                value: overBudgets > 0 ? `${overBudgets} Over Limit` : "All on Track",
                desc: overBudgets > 0 ? "You've spent more than planned." : "You are staying under your limits!",
                icon: overBudgets > 0 ? AlertCircle : CheckCircle2,
                color: overBudgets > 0 ? "text-red-500" : "text-accent-main"
            },
            {
                title: "Largest Spend",
                value: `£${Math.abs(largestTx?.amount || 0).toFixed(0)}`,
                desc: `A one-off cost for ${largestTx?.description?.toLowerCase()}.`,
                icon: Target,
                color: "text-orange-400"
            }
        ];
    }, [trendData, categoryData, varianceData, filteredTransactions]);

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar session={session} />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">Financial Insights</h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Engine: {selectedTemplate === "Custom View" ? "User Defined" : "Standard Template"}</p>
                    </div>
                    <div className="flex gap-3">
                        {selectedTemplate !== "Custom View" && (
                            <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
                                {['7d', '30d', 'MTD', '1Y'].map(t => (
                                    <button key={t} onClick={() => setTimeFrame(t)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${timeFrame === t ? 'bg-accent-main text-white' : 'text-gray-500 hover:text-white'}`}>{t}</button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-accent-secondary text-white font-black rounded-xl text-xs shadow-lg hover:scale-105 active:scale-95"><Plus size={18} /> Create Custom</button>
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl transition-all text-xs shadow-lg">
                                <Download size={18} /> Export Data
                            </button>
                            <div className="absolute top-full right-0 w-56 pt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all z-[100]">
                                <div className="bg-background-secondary border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                                    <button onClick={handleDownloadPNG} className="w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 flex items-center gap-3 border-b border-white/5 transition-colors">
                                        <FileImage size={16} className="text-accent-main" /> Save as Image
                                    </button>
                                    <button className="w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 flex items-center gap-3 transition-colors">
                                        <FileJson size={16} className="text-accent-main" /> Raw CSV Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <ContextualTip category="Financial Planning" />

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
                                {selectedTemplate === "Custom View" && (
                                    <button onClick={() => setSelectedTemplate("Spending Trend")} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 text-white border border-white/10 animate-pulse hover:bg-red-500/20 transition-all">
                                        <RefreshCcw size={16} className="text-accent-main" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Exit Custom View</span>
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* Quick Stats Widget */}
                        <div className="bg-background-secondary rounded-3xl p-6 border border-white/10 shadow-xl">
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Info size={14} className="text-accent-main" /> Snapshot</p>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-[11px] text-gray-400 font-bold uppercase">Average</span>
                                    <span className="text-sm font-black text-white">£{(trendData.length > 0 ? trendData.reduce((a, b) => a + b.amount, 0) / trendData.length : 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] text-gray-400 font-bold uppercase">Filtered Transactions</span>
                                    <span className="text-sm font-black text-accent-main">{filteredTransactions.length}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="lg:col-span-3 space-y-8">
                        <div ref={chartRef} className="bg-background-secondary rounded-[2.5rem] p-10 border border-white/10 h-[550px] flex flex-col shadow-2xl relative">
                            <h2 className="text-2xl font-black text-white mb-10 tracking-tight">{selectedTemplate}</h2>
                            <div className="flex-1 w-full min-h-0 relative">
                                {isLoading ? <div className="h-full flex items-center justify-center text-gray-500 gap-3"><Loader2 className="animate-spin" /></div> : (<ResponsiveContainer width="100%" height="100%">
                                    {selectedTemplate === "Custom View" ? (
                                        customConfig.type === 'Area' ? (
                                            <AreaChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} formatter={(v) => [`£${v.toFixed(2)}`, 'Spent']} />
                                                <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={4} fill="#22c55e" fillOpacity={0.15} />
                                            </AreaChart>
                                        ) : customConfig.type === 'Line' ? (
                                            <LineChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} formatter={(v) => [`£${v.toFixed(2)}`, 'Spent']} />
                                                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                            </LineChart>
                                        ) : (
                                            <BarChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                                                <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} formatter={(v) => [`£${v.toFixed(2)}`, 'Spent']} />
                                                <Bar dataKey="amount" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        )
                                    ) : selectedTemplate === "Spending Trend" ? (
                                        <AreaChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                                            <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={4} fill="#22c55e" fillOpacity={0.15} />
                                        </AreaChart>
                                    ) : selectedTemplate === "Daily Line" ? (
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(v) => `£${v}`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} />
                                            <Line type="stepAfter" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                                        </LineChart>
                                    ) : selectedTemplate === "Category Mix" ? (
                                        <RePie>
                                            <Pie data={categoryData} dataKey="value" cx="50%" cy="45%" outerRadius={120} label={({ name, value }) => `${name}: £${value.toFixed(0)}`} stroke="none">
                                                {categoryData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} />
                                            <Legend verticalAlign="bottom" />
                                        </RePie>
                                    ) : selectedTemplate === "Spending Heatmap" ? (
                                        <BarChart data={heatmapData} layout="vertical" margin={{ left: 40 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="day" type="category" axisLine={false} tickLine={false} tick={{ fill: '#fff', fontWeight: 'bold' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} formatter={(v) => `£${v.toFixed(2)}`} />
                                            <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                                {heatmapData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.value > 500 ? '#ef4444' : entry.value > 100 ? '#f59e0b' : '#22c55e'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    ) : (
                                        <BarChart data={varianceData} barGap={12}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 10 }} />
                                            <YAxis tick={{ fill: '#fff', fontSize: 10 }} tickFormatter={(val) => `£${val}`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                                            <Legend verticalAlign="top" align="right" />
                                            <Bar dataKey="Allocated" fill="#334155" radius={[6, 6, 0, 0]} />
                                            <Bar dataKey="Actual" fill="#22c55e" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Recommendation Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {insightsCalc.map((insight, idx) => (
                                <div key={idx} className="bg-background-secondary border border-white/10 p-6 rounded-[2rem] hover:scale-[1.02] transition-all group relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl bg-white/5 ${insight.color}`}>
                                            <insight.icon size={20} />
                                        </div>
                                        <Zap size={14} className="text-white/10 group-hover:text-accent-main transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{insight.title}</p>
                                        <h3 className="text-xl font-black text-white">{insight.value}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold leading-tight">{insight.desc}</p>
                                    </div>
                                    <div className={`absolute -bottom-4 -right-4 w-12 h-12 blur-2xl opacity-20 bg-current ${insight.color}`}></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Create Card */}
            <CreateChartModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} accounts={accounts} config={customConfig} setConfig={setCustomConfig} onCreate={() => { setSelectedTemplate("Custom View"); setIsModalOpen(false); }} />
        </div>
    );
};

export default DashboardInsights;