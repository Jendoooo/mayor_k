'use client';

import { useState } from 'react';
import api, { Product } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { X, AlertTriangle } from 'lucide-react';

interface AuditStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    product: Product;
}

export default function AuditStockModal({ isOpen, onClose, onSubmit, product }: AuditStockModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [newQuantity, setNewQuantity] = useState(product.quantity.toString());
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.auditStock(product.id, parseInt(newQuantity), reason);
            toast.success('Stock adjusted');
            onSubmit();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to update stock');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const quantityDiff = parseInt(newQuantity || '0') - product.quantity;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Stock Audit: {product.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-200 text-sm flex gap-3">
                        <AlertTriangle className="shrink-0" size={20} />
                        <p>
                            Use this to correct physical stock counts or add new stock.
                            This action will be logged in the Audit Trail.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <div className="text-secondary text-sm mb-1">Current</div>
                            <div className="text-2xl font-bold text-white">{product.quantity}</div>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl text-center">
                            <div className="text-secondary text-sm mb-1">Difference</div>
                            <div className={`text-2xl font-bold ${quantityDiff > 0 ? 'text-green-400' : quantityDiff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                                {quantityDiff > 0 ? '+' : ''}{quantityDiff}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">New Physical Count</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-lg font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Reason for Adjustment</label>
                        <select
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select a reason...</option>
                            <option value="Restock from Supplier">Restock from Supplier</option>
                            <option value="Weekly Audit Adjustment">Weekly Audit Adjustment</option>
                            <option value="Broken/Damaged">Broken/Damaged</option>
                            <option value="Return to Stock">Return to Stock</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !reason}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Confirm Audit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
