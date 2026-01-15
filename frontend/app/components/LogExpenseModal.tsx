'use client';

import { useState, useEffect } from 'react';
import api, { CreateExpenseData, ExpenseCategory } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

interface LogExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void; // Trigger refresh
}

export default function LogExpenseModal({ isOpen, onClose, onSubmit }: LogExpenseModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [formData, setFormData] = useState<CreateExpenseData>({
        category: '',
        description: '',
        amount: 0,
        vendor_name: '',
        expense_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await api.getExpenseCategories();
            setCategories(response.results);
            if (response.results.length > 0) {
                setFormData(prev => ({ ...prev, category: response.results[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.createExpense(formData);
            toast.success('Expense logged successfully!');
            onSubmit();
            onClose();
            // Reset form
            setFormData({
                category: categories[0]?.id || '',
                description: '',
                amount: 0,
                vendor_name: '',
                expense_date: new Date().toISOString().split('T')[0],
            });
        } catch (error: any) {
            console.error('Failed to create expense:', error);
            toast.error(error?.message || 'Failed to log expense.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Log New Expense</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="What was this for?"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Amount (₦) *</label>
                            <input
                                type="number"
                                className="form-input"
                                min={0}
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.expense_date}
                                onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vendor Name (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Who was paid?"
                            value={formData.vendor_name}
                            onChange={e => setFormData({ ...formData, vendor_name: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-md mt-lg">
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Log Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
