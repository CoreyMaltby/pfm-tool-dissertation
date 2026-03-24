import React, { useState, useEffect } from "react";
import { X, Loader2, CreditCard, Landmark, Wallet, Plus } from "lucide-react";
import { dataService } from "../services/dataService";

const AddAccountForm = ({ isOpen, onClose, userId, onSuccess, editingAccount }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "Checking",
        current_balance: ""
    });

    useEffect(() => {
        if (editingAccount && isOpen) {
            setFormData({
                name: editingAccount.name,
                type: editingAccount.type,
                current_balance: editingAccount.current_balance.toString()
            });
        } else if (isOpen) {
            setFormData({ name: "", type: "Checking", current_balance: "" });
        }
    }, [editingAccount, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAccount) {
                await dataService.updateAccount({ ...formData, id: editingAccount.id }, userId);
            } else {
                await dataService.addAccount(formData, userId);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Account operation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">{editingAccount ? "Edit Account" : "New Account"}</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Account Name</label>
                        <input required placeholder="e.g. Main Bank, Travel Fund" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Type</label>
                            <select className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold text-white outline-none" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Checking">Checking</option>
                                <option value="Savings">Savings</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Investment">Investment</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Balance (£)</label>
                            <input required type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none" value={formData.current_balance} onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })} placeholder="0.00" />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full py-5 bg-accent-main text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>{editingAccount ? "Update Account" : "Create Account"} <Plus size={18} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAccountForm;