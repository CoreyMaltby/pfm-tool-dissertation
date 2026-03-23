import React, { useState, useEffect } from "react";
import { X, Loader2, ChevronDown, Tag, Plus, Wallet, EditIcon } from "lucide-react";
import { dataService } from "../services/dataService";
import { data } from "react-router-dom";

const AddBudgetForm = ({ isOpen, onClose, userId, onSuccess, editingBudget }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [amount, setAmount] = useState("");

    useEffect(() => {
        if (editingBudget && isOpen) {
            setCategoryInput(editingBudget.category?.name || "");
            setAmount(editingBudget.amont?.toString() || "");
        } else if (isOpen) {
            setCategoryInput("");
            setAmount("");
        }
    }, [editingBudget, isOpen]);

    useEffect(() => {
        if (isOpen && userId) {
            const loadCategories = async () => {
                const categories = await dataService.fetchCategories(userId);
                setCategories(categories);
            };
            loadCategories();
        }
    }, [isOpen, userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryInput.trim() || !amount) return;

        setLoading(true);
        try {
            let finalCategoryId = null;

            // Find or create category
            const existingCat = categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase());
            if (existingCat) {
                finalCategoryId = existingCat.id;
            } else {
                const newCat = await dataService.addCategory({ name: categoryInput, icon: 'Wallet' }, userId);
                finalCategoryId = newCat.id;
            }

            const budgetData = {
                category_id: finalCategoryId,
                amount: parseFloat(amount),
                user_id: userId
            };

            if (editingBudget) {
                budgetData.id = editingBudget.id;
                await dataService.updateBudget(budgetData, userId);
            } else {
                await dataService.saveBudget(budgetData, userId);
            }

            onSuccess()
            onClose()
        } catch (error) {
            console.error("Budget operation failed: ", error);
            alert("Failed to save budget");
        } finally {
            setLoading(false)
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {editingBudget ? "Adjust Budget" : "New Budget Limit"}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                            <Tag size={12} /> Category Name
                        </label>
                        <input
                            required
                            list="budget-category-list"
                            placeholder="e.g. Groceries, Rent..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none transition-all"
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                        />
                        <datalist id="budget-category-list">
                            {categories.map(c => <option key={c.id} value={c.name} />)}
                        </datalist>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                            Monthly Limit (£)
                        </label>
                        <input
                            required
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-accent-main text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>Save Budget <Plus size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddBudgetForm;