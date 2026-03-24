import React, { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, PoundSterling, CreditCard, Tag, Store, AlignLeft, Plus, ArrowUpRight, ArrowDownRight, Wallet, Calendar } from "lucide-react";
import { dataService } from "../services/dataService";

const AddTransactionForm = ({ isOpen, onClose, userId, onSuccess, editingTransaction }) => {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [merchants, setMerchants] = useState([]);

    const [type, setType] = useState('expense');
    const [merchantInput, setMerchantInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        account_id: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (editingTransaction && isOpen) {
            setType(editingTransaction.amount < 0 ? 'expense' : 'income');
            setMerchantInput(editingTransaction.merchant?.name || "");
            setCategoryInput(editingTransaction.category?.name || "");
            setFormData({
                amount: Math.abs(editingTransaction.amount).toString(),
                description: editingTransaction.description || "",
                account_id: editingTransaction.account_id,
                date: new Date(editingTransaction.created_at).toISOString().split('T')[0]
            });
        } else if (isOpen) {
            setFormData({
                amount: "",
                description: "",
                account_id: "",
                date: new Date().toISOString().split('T')[0]
            });
            setMerchantInput("");
            setCategoryInput("");
            setType('expense');
        }
    }, [editingTransaction, isOpen]);

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

        if (!formData.account_id || !categoryInput.trim()) {
            alert("Please select an account and provide a category.");
            return;
        }

        setLoading(true);
        try {
            let finalMerchantId = null;
            let finalCategoryId = null;

            if (merchantInput.trim() !== "") {
                const existingMerc = merchants.find(m => m.name.toLowerCase() === merchantInput.toLowerCase());
                if (existingMerc) {
                    finalMerchantId = existingMerc.id;
                } else {
                    const newMerc = await dataService.addMerchant({ name: merchantInput }, userId);
                    finalMerchantId = newMerc.id;
                }
            }

            const existingCat = categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase());
            if (existingCat) {
                finalCategoryId = existingCat.id;
            } else {
                const newCat = await dataService.addCategory({ name: categoryInput, icon: 'Wallet' }, userId);
                finalCategoryId = newCat.id;
            }

            const amountNum = parseFloat(formData.amount);
            const finalAmount = type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum);

            const transactionData = {
                amount: finalAmount,
                description: formData.description || merchantInput || categoryInput,
                account_id: formData.account_id,
                category_id: finalCategoryId,
                merchant_id: finalMerchantId,
                created_at: new Date(formData.date).toISOString()
            };

            if (editingTransaction) {
                transactionData.id = editingTransaction.id;
                const result = await dataService.updateTransaction(transactionData, editingTransaction, userId);
                if (result?.error) throw result.error;
            } else {
                const result = await dataService.saveTransaction(transactionData, userId);
                if (result?.error) throw result.error;
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Operation failed detail:", error.message || error);
            alert(`Save failed: ${error.message || "Check console for details"}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {editingTransaction ? "Update Record" : "Record Transaction"}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* RESTORED: TYPE TOGGLE (Income vs Expense) */}
                <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5">
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            type === 'expense'
                                ? 'bg-red-500 text-white shadow-lg'
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <ArrowDownRight size={14} /> Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            type === 'income'
                                ? 'bg-accent-main text-white shadow-lg'
                                : 'text-gray-500 hover:text-white'
                        }`}
                    >
                        <ArrowUpRight size={14} /> Income
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Amount & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Amount</label>
                            <input required type="number" step="0.01" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2"><Calendar size={12} /> Date</label>
                            <input required type="date" className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none [color-scheme:dark]" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Description</label>
                        <input className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none" placeholder="Notes..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2"><Store size={12} /> Merchant</label>
                        <input list="merchant-list" placeholder="Search/Add..." className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none" value={merchantInput} onChange={(e) => setMerchantInput(e.target.value)} />
                        <datalist id="merchant-list">{merchants.map(m => <option key={m.id} value={m.name} />)}</datalist>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2"><CreditCard size={12} /> Account</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white appearance-none focus:border-accent-main outline-none cursor-pointer"
                                    value={formData.account_id}
                                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id} className="bg-[#1a1a1a]">{acc.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2"><Tag size={12} /> Category</label>
                            <input
                                required
                                list="category-list"
                                placeholder="Search/Add..."
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none"
                                value={categoryInput}
                                onChange={(e) => setCategoryInput(e.target.value)}
                            />
                            <datalist id="category-list">{categories.map(c => <option key={c.id} value={c.name} />)}</datalist>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${type === 'expense' ? 'bg-white text-black hover:bg-gray-200' : 'bg-accent-main text-white hover:bg-accent-secondary'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (editingTransaction ? "Update Transaction" : `Confirm ${type}`)}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionForm;