/** * Dashboard Transactions Page 
 * Supports manual entry, universal search, date filtering, and record management.
 */

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import {
    Plus, Upload, Search, Calendar, FilterX, MoreHorizontal,
    Utensils, Car, Smartphone, ShoppingBag, Wallet,
    Home, CreditCard, Coffee, Zap, TrendingUp, Loader2, Edit2, Trash2
} from 'lucide-react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { dataService } from "../services/dataService";
import AddTransactionForm from "../components/AddTransactionForm";
import CSVUploadForm from "../components/CSVUploadForm";
import ContextualTip from "../components/ContextualTips";

const ICON_MAP = { Utensils, Car, Smartphone, ShoppingBag, Wallet, Home, CreditCard, Coffee, Zap, TrendingUp };

const DashboardTransactions = ({ session }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);

    const [storageMode, setStorageMode] = useState('loading');
    const [cloudTransactions, setCloudTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    const [selectedMonth, setSelectedMonth] = useState("All");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const userId = session?.user?.id;

    const months = [
        { val: "01", label: "January" }, { val: "02", label: "February" }, { val: "03", label: "March" },
        { val: "04", label: "April" }, { val: "05", label: "May" }, { val: "06", label: "June" },
        { val: "07", label: "July" }, { val: "08", label: "August" }, { val: "09", label: "September" },
        { val: "10", label: "October" }, { val: "11", label: "November" }, { val: "12", label: "December" }
    ];
    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

    const localTransactions = useLiveQuery(async () => {
        if (!userId) return [];
        const txs = await db.transactions.where('user_id').equals(userId).reverse().toArray();
        return await Promise.all(txs.map(async (tx) => {
            const [category, merchant, account] = await Promise.all([
                db.categories.get(tx.category_id),
                db.merchants.get(tx.merchant_id),
                db.accounts.get(tx.account_id)
            ]);
            return { ...tx, category, merchant, account };
        }));
    }, [userId]);

    const fetchTransactions = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);
            if (mode === 'cloud') {
                const data = await dataService.fetchAllTransactions(userId);
                setCloudTransactions(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, [userId]);

    const transactions = storageMode === 'cloud' ? cloudTransactions : (localTransactions || []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit'
        });
    };

    const filteredTransactions = transactions.filter(tx => {
        const date = new Date(tx.created_at);
        const txMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const txYear = date.getFullYear().toString();
        const query = searchTerm.toLowerCase();
        const matchesSearch = tx.merchant?.name?.toLowerCase().includes(query) || tx.description?.toLowerCase().includes(query) || tx.category?.name?.toLowerCase().includes(query);
        const matchesMonth = selectedMonth === "All" || txMonth === selectedMonth;
        const matchesYear = selectedYear === "All" || txYear === selectedYear;
        return matchesSearch && matchesMonth && matchesYear;
    });

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedMonth, selectedYear]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (tx) => {
        setEditingTransaction(tx);
        setIsFormOpen(true);
        setActiveMenu(null);
    };

    const handleDelete = async () => {
        if (!deletingTransaction) return;
        try {
            await dataService.deleteTransaction(deletingTransaction, userId);
            setDeletingTransaction(null);
            fetchTransactions();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete transaction.");
        }
    };

    const getCategoryStyle = (categoryName) => {
        const styles = {
            Groceries: { color: "text-accent-main", bg: "bg-accent-main/10", border: "border-accent-main/20" },
            Transport: { color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
            Shopping: { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
            Housing: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
            Income: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
            Default: { color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" }
        };
        return styles[categoryName] || styles.Default;
    };

    return (
        <div className="flex flex-col md:flex-row bg-background-tertiary min-h-screen overflow-x-hidden">
            <DashboardSidebar session={session} />

            <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Transactions</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Storage Mode: <span className="text-accent-main">{storageMode}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsCSVUploadOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl text-xs hover:scale-105 transition-all"><Upload size={16} /> Import CSV</button>
                        <button onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 text-xs hover:scale-105 transition-all"><Plus size={16} /> Add Entry</button>
                    </div>
                </header>

                <ContextualTip category={["Other", "Security"]} />

                <section className="bg-background-secondary rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                    {/* Responsive Toolbar */}
                    <div className="p-6 bg-black/10 border-b border-gray-700 flex flex-col xl:flex-row gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-accent-main transition-all" 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            <div className="flex flex-1 items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-1 w-full">
                                <Calendar size={14} className="text-gray-500" />
                                <select className="flex-1 bg-transparent text-[10px] font-black text-white outline-none py-2 uppercase cursor-pointer" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                    <option value="All" className="bg-black">All Months</option>
                                    {months.map(m => <option key={m.val} value={m.val} className="bg-black">{m.label}</option>)}
                                </select>
                                <div className="w-[1px] h-4 bg-white/10 mx-2 hidden sm:block" />
                                <select className="flex-1 bg-transparent text-[10px] font-black text-white outline-none py-2 uppercase cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                    {years.map(y => <option key={y} value={y} className="bg-black">{y}</option>)}
                                </select>
                            </div>
                            {(selectedMonth !== "All" || searchTerm !== "") && (
                                <button onClick={() => { setSelectedMonth("All"); setSearchTerm(""); }} className="w-full sm:w-auto p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                                    <FilterX size={18} /> <span className="sm:hidden text-[10px] font-black uppercase">Clear Filters</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Responsive Table Wrapper */}
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[850px]">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-700 bg-black/20">
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Merchant</th>
                                    <th className="px-8 py-5">Account</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5 text-right">Amount</th>
                                    <th className="px-8 py-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin text-accent-main mx-auto" size={32} /></td></tr>
                                ) : currentTransactions.length === 0 ? (
                                    <tr><td colSpan="6" className="py-20 text-center text-gray-600 font-bold uppercase text-xs tracking-widest">No records found</td></tr>
                                ) : currentTransactions.map((tx) => {
                                    const style = getCategoryStyle(tx.category?.name);
                                    const CategoryIcon = ICON_MAP[tx.category?.icon] || Wallet;
                                    return (
                                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6 text-sm text-gray-400">{formatDate(tx.created_at)}</td>
                                            <td className="px-8 py-6">
                                                <div className="font-bold text-white group-hover:text-accent-main transition-colors">{tx.merchant?.name || 'General'}</div>
                                                <div className="text-[10px] text-gray-500 italic max-w-[150px] truncate">{tx.description}</div>
                                            </td>
                                            <td className="px-8 py-6 text-[10px] font-black uppercase text-gray-400">{tx.account?.name || 'Main Account'}</td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${style.bg} ${style.border} ${style.color}`}>
                                                    <CategoryIcon size={12} /> {tx.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className={`px-8 py-6 text-right font-black ${tx.amount < 0 ? 'text-white' : 'text-accent-main'}`}>
                                                {tx.amount < 0 ? `-£${Math.abs(tx.amount).toFixed(2)}` : `+£${tx.amount.toFixed(2)}`}
                                            </td>
                                            <td className="px-8 py-6 text-center relative">
                                                <button
                                                    onClick={() => setActiveMenu(activeMenu === tx.id ? null : tx.id)}
                                                    className="p-2 text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white rounded-lg transition-all border border-white/5"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenu === tx.id && (
                                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 z-50 bg-background-secondary border border-white/10 rounded-xl shadow-2xl py-2 w-32 animate-in fade-in zoom-in duration-200">
                                                        <button onClick={() => handleEdit(tx)} className="w-full px-4 py-2 text-left text-xs font-bold text-gray-300 hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                                                            <Edit2 size={12} className="text-accent-main" /> Edit
                                                        </button>
                                                        <button onClick={() => { setDeletingTransaction(tx); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-500/5 flex items-center gap-2">
                                                            <Trash2 size={12} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Responsive Pagination */}
                    <div className="p-6 bg-black/10 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTransactions.length)} of {filteredTransactions.length}
                        </p>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="text-[10px] font-black uppercase text-accent-main disabled:opacity-20 hover:text-white transition-colors">Previous</button>
                            <span className="text-[10px] font-black text-accent-main bg-accent-main/10 px-4 py-2 rounded-lg">Page {currentPage} / {totalPages || 1}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="text-[10px] font-black uppercase text-accent-main disabled:opacity-20 hover:text-white transition-colors">Next</button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Modals & Forms */}
            {deletingTransaction && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-[2rem] p-8 w-full max-w-sm space-y-6 text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto"><Trash2 size={32} /></div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Remove Record?</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">This action is permanent and will revert any associated balance changes.</p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setDeletingTransaction(null)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-red-500/20 transition-all">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <AddTransactionForm
                    isOpen={isFormOpen}
                    onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
                    userId={userId}
                    onSuccess={fetchTransactions}
                    editingTransaction={editingTransaction}
                />
            )}

            <CSVUploadForm
                isOpen={isCSVUploadOpen}
                onClose={() => setIsCSVUploadOpen(false)}
                userId={userId}
                onSuccess={(count) => {
                    fetchTransactions();
                    alert(`Successfully imported ${count} transactions!`);
                }}
            />
        </div>
    );
};

export default DashboardTransactions;