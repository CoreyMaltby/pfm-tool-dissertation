import React, { useState, useEffect } from "react";
import { X, Loader2, PiggyBank, CreditCard, Target, Plus } from "lucide-react";
import { dataService } from "../services/dataService";

const AddToSavingsForm = ({ isOpen, onClose, userId, onSuccess, preSelectedGoalId, goals }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState(preSelectedGoalId || "");
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (isOpen && userId) {
            dataService.fetchAccounts(userId).then(setAccounts);
            if (preSelectedGoalId) setSelectedGoalId(preSelectedGoalId);
        }
    }, [isOpen, userId, preSelectedGoalId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGoalId || !selectedAccountId || !amount) return;

        setLoading(true);
        try {
            const goal = goals.find(g => g.id === selectedGoalId);
            await dataService.addToGoal({
                goalId: selectedGoalId,
                accountId: selectedAccountId,
                amount: parseFloat(amount),
                name: goal?.name
            }, userId);

            onSuccess();
            onClose();
            setAmount("");
        } catch (error) {
            console.error("Contribution failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <PiggyBank className="text-accent-main" /> Add Funds
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                            <Target size={12} /> Select Goal
                        </label>
                        <select 
                            required
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none appearance-none"
                            value={selectedGoalId}
                            onChange={(e) => setSelectedGoalId(e.target.value)}
                            disabled={!!preSelectedGoalId}
                        >
                            <option value="">Select a Goal</option>
                            {goals.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">From Account</label>
                            <select 
                                required
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none"
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                            >
                                <option value="">Select Account</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Amount (£)</label>
                            <input required type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Confirm Deposit <Plus size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddToSavingsForm;