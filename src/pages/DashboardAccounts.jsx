import React, { useEffect, useState } from "react";
import DashboardSidebar from "../components/DashboardSidebar";
import { CreditCard, Plus, Landmark, Wallet, Loader2, Settings2, Trash2, TrendingUp, ArrowUpRight, PiggyBank, ArrowRightLeft } from 'lucide-react';
import { dataService } from "../services/dataService";
import AddAccountForm from "../components/addAccountForm";
import TransferFundsForm from "../components/TransferFundsForm";

const TYPE_ICONS = {
    Checking: Landmark,
    Savings: PiggyBank,
    "Credit Card": CreditCard,
    Investment: TrendingUp
};

const DashboardAccounts = ({ session }) => {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [storageMode, setStorageMode] = useState('loading');
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const userId = session?.user?.id;

    const fetchAccounts = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const mode = await dataService.getStorageMode(userId);
            setStorageMode(mode);
            const data = await dataService.fetchAccounts(userId);
            setAccounts(data || []);
        } catch (error) {
            console.error("Failed to load accounts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAccounts(); }, [userId]);

    const totalBalance = accounts.reduce((acc, curr) => acc + (Number(curr.current_balance) || 0), 0);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this account? Transactions will remain but without an account.")) return;
        await dataService.deleteAccount(id, userId);
        fetchAccounts();
    };

    return (
        <div className="flex bg-background-tertiary min-h-screen">
            <DashboardSidebar />
            <main className="flex-1 p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tight">Bank Accounts</h1>
                        <p className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Storage: <span className={storageMode === 'cloud' ? 'text-white' : 'text-white'}>{storageMode}</span>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsTransferOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <ArrowRightLeft size={18} /> Transfer
                        </button>
                        <button onClick={() => { setEditingAccount(null); setIsFormOpen(true); }} className="flex items-center gap-2 px-6 py-3 bg-background-secondary text-white font-black rounded-xl border border-white/10 hover:scale-105 transition-all text-xs shadow-xl">
                            <Plus size={18} /> Add Account
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isLoading ? (
                                    <div className="col-span-2 py-20 flex justify-center text-accent-main"><Loader2 className="animate-spin" size={32} /></div>
                                ) : accounts.map((acc) => {
                                    const Icon = TYPE_ICONS[acc.type] || Wallet;
                                    return (
                                        <div key={acc.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-6 group hover:bg-white/10 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="w-12 h-12 bg-accent-main/10 rounded-xl flex items-center justify-center text-accent-main">
                                                    <Icon size={24} />
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => { setEditingAccount(acc); setIsFormOpen(true); }} className="p-2 text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white rounded-lg transition-all"><Settings2 size={16} /></button>
                                                    <button onClick={() => handleDelete(acc.id)} className="p-2 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg">{acc.name}</h3>
                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{acc.type}</p>
                                                <p className="text-2xl font-black text-white mt-2">£{Number(acc.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="bg-background-secondary rounded-3xl p-8 border border-white/5 space-y-6 shadow-2xl text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <Landmark size={20} className="text-accent-main" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-white">Total Balance</h2>
                            </div>
                            <div className="py-4">
                                <p className="text-5xl font-black text-white">£{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                            <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                <ArrowUpRight size={14} /> View Analytics
                            </button>
                        </div>
                    </section>
                </div>
            </main>
            <AddAccountForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                userId={userId}
                onSuccess={fetchAccounts}
                editingAccount={editingAccount} />

            <TransferFundsForm
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                userId={userId}
                onSuccess={fetchAccounts}
                accounts={accounts}
            />
        </div>
    );
};

export default DashboardAccounts;