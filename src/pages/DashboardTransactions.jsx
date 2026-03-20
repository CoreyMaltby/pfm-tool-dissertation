/** * Dashboard Transactions Page
 * Supports manual entry and bulk CSV/XLSX imports.
 */

import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { 
    Plus, Upload, Search, Download, MoreHorizontal, 
    Utensils, Car, Smartphone, ShoppingBag, Wallet, 
    Home, CreditCard, Coffee, Zap, TrendingUp, Loader2 
} from 'lucide-react';
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { dataService } from "../services/dataService";
import AddTransactionForm from "../components/AddTransactionForm";

const ICON_MAP = {
    Utensils, Car, Smartphone, ShoppingBag,
    Wallet, Home, CreditCard, Coffee, Zap, TrendingUp
};

const DashboardTransactions = ({ session }) => {
    const [filterRange, setFilterRange] = useState('Month');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [storageMode, setStorageMode] = useState('loading');
    const [cloudTransactions, setCloudTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const userId = session?.user?.id;
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- HYDRATED LOCAL QUERY ---
    // This resolves merchant_id and category_id into full objects for Dexie
    const localTransactions = useLiveQuery(async () => {
        if (!userId) return [];
        const txs = await db.transactions.where('user_id').equals(userId).reverse().toArray();
        
        return await Promise.all(txs.map(async (tx) => {
            const [category, merchant] = await Promise.all([
                db.categories.get(tx.category_id),
                db.merchants.get(tx.merchant_id)
            ]);
            return { ...tx, category, merchant };
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
            console.error("Failed to fetch transactions: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [userId]);

    const transactions = storageMode === 'cloud' ? cloudTransactions : (localTransactions || []);

    // --- PAGINATION CALCULATIONS ---
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({top: 0, behavior: 'smooth'});
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
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white leading-tight">Transactions</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                            Storage: <span className={storageMode === 'cloud' ? 'text-accent-main' : 'text-green-400'}>{storageMode}</span>
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-background-tertiary font-black rounded-xl hover:bg-opacity-90 transition-all text-xs shadow-lg">
                            <Upload size={18} /> Upload CSV / XLSX
                        </button>

                        <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-xs border border-white/10">
                            <Plus size={18} /> Add Transaction
                        </button>
                    </div>
                </header>

                <section className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 bg-black/10 border-b border-gray-700 flex flex-col lg:flex-row justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" placeholder="Search transactions..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-accent-main outline-none" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/20 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 border-b border-gray-700">
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Merchant</th>
                                    <th className="px-8 py-5">Account</th>
                                    <th className="px-8 py-5">Category</th>
                                    <th className="px-8 py-5 text-right">Amount</th>
                                    <th className="px-8 py-5 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {isLoading ? (
                                    <tr><td colSpan="6" className="py-20 text-center"><Loader2 className="animate-spin text-accent-main mx-auto" size={32} /></td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="6" className="py-20 text-center text-gray-500 font-bold uppercase text-xs">No records found</td></tr>
                                ) : currentTransactions.map((tx) => {
                                    const style = getCategoryStyle(tx.category?.name);
                                    const CategoryIcon = ICON_MAP[tx.category?.icon] || Wallet;

                                    return (
                                        <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-8 py-6 text-sm text-gray-400 whitespace-nowrap">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6 font-bold text-white group-hover:text-accent-main transition-colors">
                                                {tx.merchant?.name || tx.description}
                                            </td>
                                            <td className="px-8 py-6 text-xs text-gray-400 font-semibold uppercase">
                                                {tx.account?.name || 'Main Account'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.color} text-[10px] font-black uppercase`}>
                                                    <CategoryIcon size={12} />
                                                    {tx.category?.name || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black">
                                                <span className={tx.amount < 0 ? 'text-white' : 'text-accent-main'}>
                                                    {tx.amount < 0 ? `-£${Math.abs(tx.amount).toFixed(2)}` : `+£${tx.amount.toFixed(2)}`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <button className="p-2 text-gray-600 hover:text-white rounded-lg"><MoreHorizontal size={18} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION FOOTER */}
                    <div className="p-6 bg-black/10 border-t border-gray-700 flex justify-between items-center">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, transactions.length)} of {transactions.length} Records
                        </p>
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-[10px] font-black text-accent-main bg-accent-main/10 px-3 py-1 rounded-md">
                                Page {currentPage} of {totalPages || 1}
                            </span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="text-[10px] font-black uppercase text-accent-main hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {isFormOpen && (
                <AddTransactionForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    userId={userId}
                    onSuccess={fetchTransactions}
                />
            )}
        </div>
    );
};

export default DashboardTransactions;