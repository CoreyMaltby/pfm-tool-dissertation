import React, { useState, useEffect } from "react";
import { X, Loader2, ArrowRightLeft, CreditCard, MoveRight } from "lucide-react";
import { dataService } from "../services/dataService";

const TransferFundsForm = ({ isOpen, onClose, userId, onSuccess, accounts }) => {
    const [loading, setLoading] = useState(false);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fromId || !toId || !amount || fromId === toId) return;

        setLoading(true);
        try {
            const fromAcc = accounts.find(a => a.id === fromId);
            const toAcc = accounts.find(a => a.id === toId);

            await dataService.transferFunds({
                fromAccountId: fromId,
                toAccountId: toId,
                amount: parseFloat(amount),
                fromAccountName: fromAcc.name,
                toAccountName: toAcc.name
            }, userId);

            onSuccess();
            onClose();
            setAmount("");
            setFromId("");
            setToId("");
        } catch (error) {
            console.error("Transfer failed:", error);
            alert("Transfer failed. Please check your balances.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <ArrowRightLeft className="text-accent-main" /> Move Money
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {/* From Account */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">From Account</label>
                            <select 
                                required
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none appearance-none"
                                value={fromId}
                                onChange={(e) => setFromId(e.target.value)}
                            >
                                <option value="">Select Source</option>
                                {accounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name} (£{Number(acc.current_balance).toFixed(2)})</option>
                                ))}
                            </select>
                        </div>

                        {/* To Account */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">To Account</label>
                            <select 
                                required
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none appearance-none"
                                value={toId}
                                onChange={(e) => setToId(e.target.value)}
                            >
                                <option value="">Select Destination</option>
                                {accounts.filter(acc => acc.id !== fromId).map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Transfer Amount (£)</label>
                        <input required type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                    </div>

                    <button disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Confirm Transfer</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransferFundsForm;