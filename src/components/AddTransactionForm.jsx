import React, { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, PoundSterling, CreditCard, Tag, Store, AlignLeft, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { dataService } from "../services/dataService";

const AddTransactionForm = ({ isOpen, onClose, userId, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [merchants, setMerchants] = useState([]);
    
    const [type, setType] = useState('expense');
    const [merchantInput, setMerchantInput] = useState("");

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        account_id: "",
        category_id: "",
    });

    useEffect(() => {
        if (isOpen && userId) {
            const loadOptions = async () => {
                const [accs, cats, mercs] = await Promise.all([
                    dataService.fetchAccounts(userId),
                    dataService.fetchCategories(userId),
                    dataService.fetchMerchants(),
                ]);
                setAccounts(accs);
                setCategories(cats);
                setMerchants(mercs);
            };
            loadOptions();
        }
    }, [isOpen, userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let finalMerchantId = null;

            if (merchantInput.trim() !== "") {
                const existing = merchants.find(m => 
                    m.name.toLowerCase() === merchantInput.toLowerCase()
                );

                if (existing) {
                    finalMerchantId = existing.id;
                } else {
                    const newMerc = await dataService.addMerchant({ name: merchantInput }, userId);
                    finalMerchantId = newMerc.id;
                }
            }

            const amountNum = parseFloat(formData.amount);
            const finalAmount = type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum);

            const transactionData = {
                amount: finalAmount,
                description: formData.description || merchantInput,
                account_id: formData.account_id,
                category_id: formData.category_id,
                merchant_id: finalMerchantId,
                created_at: new Date().toISOString()
            };

            await dataService.saveTransaction(transactionData, userId);
            
            onSuccess();
            onClose();
            setFormData({ amount: "", description: "", account_id: "", category_id: "" });
            setMerchantInput("");
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">
                
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white tracking-tight">Record Transaction</h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Type Toggle */}
                <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                    <button type="button" onClick={() => setType('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500'}`}>
                        <ArrowDownRight size={14} /> Expense
                    </button>
                    <button type="button" onClick={() => setType('income')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'income' ? 'bg-accent-main text-white' : 'text-gray-500'}`}>
                        <ArrowUpRight size={14} /> Income
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Amount & Description */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Amount</label>
                            <input required type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-lg font-black text-white focus:border-accent-main outline-none" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Description</label>
                            <input required className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-accent-main outline-none" placeholder="e.g. Weekly Groceries" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                            <Store size={12} /> Merchant
                        </label>
                        <input 
                            list="merchant-list"
                            placeholder="Type to search or add new..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none transition-all"
                            value={merchantInput}
                            onChange={(e) => setMerchantInput(e.target.value)}
                        />
                        <datalist id="merchant-list">
                            {merchants.map(m => (
                                <option key={m.id} value={m.name} />
                            ))}
                        </datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Account */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Account</label>
                            <div className="relative">
                                <select required className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white appearance-none focus:border-accent-main outline-none" value={formData.account_id} onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}>
                                    <option value="" className="bg-[#1a1a1a]">Select Account</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id} className="bg-[#1a1a1a]">{acc.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                            </div>
                        </div>
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Category</label>
                            <div className="relative">
                                <select required className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white appearance-none focus:border-accent-main outline-none" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                                    <option value="" className="bg-[#1a1a1a]">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-[#1a1a1a]">{cat.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${type === 'expense' ? 'bg-white text-black hover:bg-gray-200' : 'bg-accent-main text-white hover:bg-accent-secondary'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>Confirm {type} <Plus size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionForm;