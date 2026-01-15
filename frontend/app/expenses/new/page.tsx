'use client';

import { useState, useEffect } from 'react';
import api from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { PlusCircle, Upload, ArrowLeft, Receipt, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExpenseCategory {
    id: string;
    name: string;
}

export default function SubmitExpensePage() {
    const router = useRouter();
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        vendor_name: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        // Fetch expense categories
        api.getExpenseCategories()
            .then(res => {
                const cats = Array.isArray(res) ? res : (res as any).results || [];
                setCategories(cats);
            })
            .catch(err => {
                console.error('Failed to load categories:', err);
                toast.error('Failed to load expense categories');
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.category || !formData.amount || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.createExpense({
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description,
                vendor_name: formData.vendor_name,
                expense_date: formData.expense_date,
                notes: formData.notes,
            });
            toast.success('Expense submitted for approval!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Failed to submit expense:', error);
            toast.error(error?.message || 'Failed to submit expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                            <Receipt className="text-champagne-gold" size={24} />
                            Submit Expense
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Request reimbursement or log an expense for approval
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-5">

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50 appearance-none cursor-pointer"
                            >
                                <option value="">Select a category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount & Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Amount (₦) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        required
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">
                                    Expense Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.expense_date}
                                    onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                    required
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Description *
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Cleaning supplies from ABC Store"
                                required
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50"
                            />
                        </div>

                        {/* Vendor */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Vendor / Supplier (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.vendor_name}
                                onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                                placeholder="e.g., ABC Supplies Ltd"
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                rows={3}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional details for the approver..."
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50 resize-none"
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                        <strong>Note:</strong> Your expense will be reviewed by a Manager.
                        Expenses over ₦100,000 require Admin approval.
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3.5 px-6 rounded-xl border border-white/10 text-slate-400 font-medium hover:bg-white/5 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-champagne-gold to-yellow-600 text-white font-bold shadow-lg hover:shadow-champagne-gold/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <PlusCircle size={18} />
                                    Submit Expense
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
