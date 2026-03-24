import React, { useState, useEffect } from "react";
import { X, Loader2, Target, Plus, PiggyBank } from "lucide-react";
import { dataService } from "../services/dataService";

const AddGoalForm = ({ isOpen, onClose, userId, onSuccess, editingGoal }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        target_amount: "",
        current_amount: "0"
    });

    useEffect(() => {
        if (editingGoal && isOpen) {
            setFormData({
                name: editingGoal.name || "",
                target_amount: editingGoal.target_amount?.toString() || "",
                current_amount: editingGoal.current_amount?.toString() || "0"
            });
        } else if (isOpen) {
            setFormData({ name: "", target_amount: "", current_amount: "0" });
        }
    }, [editingGoal, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.target_amount) return;

        setLoading(true);
        try {
            const goalData = {
                name: formData.name,
                target_amount: parseFloat(formData.target_amount),
                current_amount: parseFloat(formData.current_amount || 0),
                user_id: userId,
                is_completed: parseFloat(formData.current_amount) >= parseFloat(formData.target_amount)
            };

            if (editingGoal) {
                goalData.id = editingGoal.id;
                await dataService.updateSavingsGoal(goalData, userId);
            } else {
                await dataService.saveSavingsGoal(goalData, userId);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Savings goal operation failed:", error);
            alert("Failed to save goal. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-2xl animate-in zoom-in duration-300">

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {editingGoal ? "Edit Goal" : "New Savings Goal"}
                    </h2>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                            <Target size={12} /> Goal Name
                        </label>
                        <input
                            required
                            placeholder="e.g. New Car, House Deposit..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Target (£)
                            </label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none"
                                value={formData.target_amount}
                                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">
                                Current (£)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:border-accent-main outline-none"
                                value={formData.current_amount}
                                onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-accent-main text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                            <>{editingGoal ? "Update Goal" : "Create Goal"} <Plus size={18} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddGoalForm;