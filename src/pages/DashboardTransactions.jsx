/** * Dashboard Transactions Page
 * Supports manual entry and bulk CSV/XLSX imports.
 */

import React, { useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { Plus, Upload, Search, Download, MoreHorizontal, Utensils, Car, Smartphone, ShoppingBag, Wallet, Home, CreditCard } from 'lucide-react';

const DashboardTransactions = () => {
    const [filterRange, setFilterRange] = useState('Month');

    // TODO: Import categories and transactions from database
    // Sample category data
    const categoryStyles = {
        Groceries: { icon: Utensils, color: "text-accent-main", bg: "bg-accent-main/10", border: "border-accent-main/20" },
        Transport: { icon: Car, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
        Streaming: { icon: Smartphone, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        Shopping: { icon: ShoppingBag, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
        Housing: { icon: Home, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
        Default: { icon: Wallet, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" }
    };


    // Sample transactions data
    const [transactions, setTransactions] = useState([
        { id: 1, date: "12/03/2026", merchant: "Tesco Express", amount: 14.50, category: "Groceries", account: "Current Account" },
        { id: 2, date: "11/03/2026", merchant: "Shell Petrol", amount: 65.00, category: "Transport", account: "Credit Card" },
        { id: 3, date: "10/03/2026", merchant: "Netflix", amount: 10.99, category: "Streaming", account: "Current Account" },
        { id: 4, date: "09/03/2026", merchant: "Amazon", amount: 24.99, category: "Shopping", account: "Credit Card" },
    ]);

     // TODO: csv/xlsx parsing
    const handleFileUpload = () => {
        alert("Upload logic triggered. Please select a .csv or .xlsx file.");
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />

            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white">Transactions</h1>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleFileUpload}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-background-tertiary font-black rounded-xl hover:bg-opacity-90 transition-all text-xs shadow-lg"
                        >
                            <Upload size={18} /> Upload CSV / XLSX
                        </button>

                        {/* TODO: Add Transaction form */}
                        <button className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl shadow-2xl hover:scale-105 transition-all text-xs border border-white/10">
                            <Plus size={18} /> Add Transaction
                        </button>
                    </div>
                </header>

                {/* Transactions table */}
                <section className="bg-background-secondary rounded-3xl shadow-2xl border border-white/5 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 bg-black/10 border-b border-gray-700 flex flex-col lg:flex-row justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            {/* TODO: Implement live search filtering logic */}
                            <input
                                type="text"
                                placeholder="Search merchant, category, or account..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-accent-main outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-black/20 p-1 rounded-xl flex gap-1">
                                {['Week', 'Month', 'Year'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setFilterRange(range)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterRange === range
                                            ? "bg-accent-main text-white shadow-lg"
                                            : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                            {/* TODO: Implement Export to CSV/PDF logic */}
                            <button className="p-3 bg-white/5 text-gray-400 rounded-xl hover:text-white transition-colors border border-white/5">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Spreadsheet View */}
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
                                {transactions.map((tx) => {
                                    const style = categoryStyles[tx.category] || categoryStyles.Default;
                                    const CategoryIcon = style.icon;

                                    return (
                                        <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors group">
                                            <td className="px-8 py-6 text-sm text-gray-400 font-medium whitespace-nowrap">
                                                {tx.date}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-white group-hover:text-accent-main transition-colors">
                                                    {tx.merchant}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold whitespace-nowrap">
                                                    <CreditCard size={14} className="opacity-50" />
                                                    {tx.account}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.color} text-[10px] font-black uppercase tracking-wider whitespace-nowrap`}>
                                                    <CategoryIcon size={12} />
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right whitespace-nowrap">
                                                <span className="text-sm font-black text-white">
                                                    -£{tx.amount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {/* TODO: 'Edit' and 'Delete' transaction logic */}
                                                <button className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer*/}
                    <div className="p-6 bg-black/10 border-t border-gray-700 flex justify-between items-center">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {transactions.length} Records found
                        </p>
                        <div className="flex gap-4">
                            {/* TODO: Implement page counter */}
                            <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors disabled:opacity-30" disabled>Previous</button>
                            <button className="text-[10px] font-black uppercase text-accent-main hover:text-white transition-colors">Next Page</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardTransactions;