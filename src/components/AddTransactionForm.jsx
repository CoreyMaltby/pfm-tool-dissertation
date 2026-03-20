import React, { useState, useEffect } from 'react';
import { X, Loader2, DessertIcon } from "lucide-react";
import { dataService } from '../services/dataService';
import { data } from 'autoprefixer';

const AddTransactionForm = ({ isOpen, onClose, userId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [merchants, setMerchants] = useState([]);

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        account_id: "",
        category_id: "",
        merchant_id: "",
    });

    useEffect(() => {
        if (isOpen && userId) {
            const loadOptions = async () => {
                const [accounts, categories, merchants] = await Promise.all([
                    dataService.fetchAccounts(userId),
                    dataService.fetchCategories(userId),
                    dataService.fetchMerchants(),
                ]);
                setAccounts(accounts);
                setCategories(categories);
                setMerchants(merchants);
            };
            loadOptions();
        }
    }, [isOpen, userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dataService.saveTransaction({ ...formData, amout: parseFloat(formData.amount), }, userId);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Save failed: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-background-secondary border border-white/10 w-full max-w-md rounded-3xl p-8 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">Add Transaction</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount (£)</label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-accent-main outline-none transition-all"
                            placeholder="0.00"
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Description</label>
                        <input
                            required
                            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-accent-main outline-none transition-all"
                            placeholder="e.g. Weekly Shop"
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Account</label>
                            <select
                                required
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-accent-main outline-none transition-all appearance-none"
                                onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                            >
                                <option value="">Select Account</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Category</label>
                            <select
                                required
                                className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-white font-bold focus:border-accent-main outline-none transition-all appearance-none"
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full bg-accent-main text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-accent-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Record Transaction"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionForm;