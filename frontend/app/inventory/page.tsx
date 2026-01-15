'use client';

import { useState, useEffect } from 'react';
import api, { Product } from '@/app/lib/api';
import { Package, Plus, Search, AlertTriangle, Edit2, RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProductModal from '@/app/components/ProductModal';
import AuditStockModal from '@/app/components/AuditStockModal';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.getProducts();
            setProducts(response.results);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAudit = (product: Product) => {
        setSelectedProduct(product);
        setIsAuditModalOpen(true);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = products.filter(p => p.is_low_stock).length;
    const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-heading text-white tracking-tight">Inventory</h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage bar stock, prices, and replenishment.</p>
                </div>

                <div className="flex gap-4 items-center">
                    <Link href="/inventory/vendors" className="h-full bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-2xl border border-white/10 flex items-center gap-2 transition-colors font-semibold">
                        <User size={18} className="text-blue-500" />
                        <span>Suppliers</span>
                    </Link>
                    <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-2xl p-4 px-6">
                        <div className="text-secondary text-sm">Total Value</div>
                        <div className="text-xl font-bold text-white">₦{totalValue.toLocaleString()}</div>
                    </div>
                    {lowStockCount > 0 && (
                        <div className="bg-red-500/10 backdrop-blur border border-red-500/20 rounded-2xl p-4 px-6">
                            <div className="text-red-400 text-sm flex items-center gap-1">
                                <AlertTriangle size={14} /> Low Stock Items
                            </div>
                            <div className="text-xl font-bold text-red-400">{lowStockCount}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddProduct}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Add Product
                </motion.button>
            </div>

            {/* Product Table */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-400 border-b border-white/5 text-sm uppercase tracking-wider">
                                <th className="px-8 py-6 font-semibold">Product</th>
                                <th className="px-8 py-6 font-semibold">Price</th>
                                <th className="px-8 py-6 font-semibold">Stock Level</th>
                                <th className="px-8 py-6 font-semibold">Status</th>
                                <th className="px-8 py-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-slate-500">
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20 text-slate-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div>
                                                <div className="font-bold text-white text-lg">{product.name}</div>
                                                <div className="text-sm text-slate-400">{product.category_name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-slate-300">₦{parseFloat(product.price).toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${product.is_low_stock ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${Math.min((product.quantity / (product.low_stock_threshold * 4)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`font-bold ${product.is_low_stock ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {product.quantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {product.is_low_stock ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20">
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAudit(product)}
                                                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-white/5"
                                                    title="Quick Audit / Restock"
                                                >
                                                    <RefreshCw size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors border border-blue-500/20"
                                                    title="Edit Product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={fetchProducts}
                product={selectedProduct}
            />

            {selectedProduct && (
                <AuditStockModal
                    isOpen={isAuditModalOpen}
                    onClose={() => setIsAuditModalOpen(false)}
                    onSubmit={fetchProducts}
                    product={selectedProduct}
                />
            )}
        </div>
    );
}
