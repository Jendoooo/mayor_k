'use client';

import { useState, useEffect } from 'react';
import api, { Product, Vendor } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    product?: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSubmit, product }: ProductModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        category_name: 'Drinks', // Default
        price: '',
        quantity: '0',
        low_stock_threshold: '5',
        preferred_vendor: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category_name: product.category_name || 'Drinks',
                price: product.price,
                quantity: product.quantity.toString(),
                low_stock_threshold: product.low_stock_threshold.toString(),
                preferred_vendor: product.preferred_vendor || ''
            });
        } else {
            setFormData({
                name: '',
                category_name: 'Drinks',
                price: '',
                quantity: '0',
                low_stock_threshold: '5',
                preferred_vendor: ''
            });
        }
    }, [product, isOpen]);

    const fetchVendors = async () => {
        try {
            const res = await api.getVendors();
            setVendors(res.results);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Setup Category - for now we just use hardcoded categories or text
            // In a real app we'd fetch categories. 
            // Since backend expects category ID, we might need adjustments
            // For MVP, lets assume backend handles or we just send fields it accepts

            // Backend expects category ID. 
            // I'll update backend or API to handle category creation/lookup if needed.
            // For now, let's just make products without category or auto-assign a default one in backend if missing

            const payload = {
                name: formData.name,
                price: formData.price, // Keep as string or valid number representation
                quantity: parseInt(formData.quantity.toString()),
                low_stock_threshold: parseInt(formData.low_stock_threshold.toString()),
                preferred_vendor: formData.preferred_vendor || undefined,
                // category: ... (omitted for now, backend allows null)
            };

            if (product) {
                await api.updateProduct(product.id, payload);
                toast.success('Product updated');
            } else {
                await api.createProduct(payload);
                toast.success('Product created');
            }
            onSubmit();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-scaleIn">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Product Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            placeholder="e.g. Coke 50cl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Preferred Vendor</label>
                        <select
                            value={formData.preferred_vendor}
                            onChange={(e) => setFormData({ ...formData, preferred_vendor: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Vendor...</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Price (₦)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Current Stock</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Low Stock Warning At</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.low_stock_threshold}
                            onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                            className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
