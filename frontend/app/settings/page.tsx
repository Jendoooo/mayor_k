'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api, { Product } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { Settings, DollarSign, Bed, Wine, Loader2, Save, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomType {
    id: string;
    name: string;
    description: string;
    base_rate_short_rest: string;
    base_rate_overnight: string;
    base_rate_lodge: string | null;
    capacity: number;
    is_active: boolean;
}

type ActiveTab = 'room-rates' | 'products';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('room-rates');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // Check permission
    const canEdit = user?.role === 'MANAGER' || user?.role === 'ADMIN';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomTypesRes, productsRes] = await Promise.all([
                api.getRoomTypes(),
                api.getProducts().catch(() => ({ results: [] })),
            ]);
            setRoomTypes(roomTypesRes.results || []);
            setProducts(productsRes.results || []);
        } catch (error) {
            console.error('Failed to fetch settings data:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleRoomRateChange = (id: string, field: string, value: string) => {
        setRoomTypes(prev => prev.map(rt =>
            rt.id === id ? { ...rt, [field]: value } : rt
        ));
    };

    const saveRoomType = async (roomType: RoomType) => {
        if (!canEdit) return toast.error('You do not have permission to edit rates');

        setSaving(roomType.id);
        try {
            await api.updateRoomType(roomType.id, {
                base_rate_short_rest: roomType.base_rate_short_rest,
                base_rate_overnight: roomType.base_rate_overnight,
                base_rate_lodge: roomType.base_rate_lodge,
            });
            toast.success(`${roomType.name} rates updated!`);
        } catch (error: any) {
            console.error('Failed to save room type:', error);
            toast.error(error?.message || 'Failed to save rates');
        } finally {
            setSaving(null);
        }
    };

    const handleProductPriceChange = (id: string, value: string) => {
        setProducts(prev => prev.map(p =>
            p.id === id ? { ...p, price: value } : p
        ));
    };

    const saveProduct = async (product: Product) => {
        if (!canEdit) return toast.error('You do not have permission to edit prices');

        setSaving(product.id);
        try {
            await api.updateProduct(product.id, { price: product.price });
            toast.success(`${product.name} price updated!`);
        } catch (error: any) {
            console.error('Failed to save product:', error);
            toast.error(error?.message || 'Failed to save price');
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-champagne-gold" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-3">
                        <Settings className="text-champagne-gold" size={24} />
                        Settings
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage room rates, product prices, and system configurations
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('room-rates')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'room-rates'
                            ? 'bg-champagne-gold text-white shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Bed size={18} />
                        Room Rates
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'products'
                            ? 'bg-champagne-gold text-white shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Wine size={18} />
                        Product Prices
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'room-rates' && (
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 mb-6">
                            <strong>Room Rates</strong>: Set the base rates for each room type. These apply to all rooms of that type.
                        </div>

                        {roomTypes.map((roomType) => (
                            <div
                                key={roomType.id}
                                className="bg-slate-900/50 border border-white/10 rounded-2xl p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{roomType.name}</h3>
                                        <p className="text-sm text-slate-400">{roomType.description || 'No description'}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${roomType.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {roomType.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Short Rest (2-4hrs)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                                            <input
                                                type="number"
                                                value={roomType.base_rate_short_rest}
                                                onChange={(e) => handleRoomRateChange(roomType.id, 'base_rate_short_rest', e.target.value)}
                                                disabled={!canEdit}
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-champagne-gold/50 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Overnight
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                                            <input
                                                type="number"
                                                value={roomType.base_rate_overnight}
                                                onChange={(e) => handleRoomRateChange(roomType.id, 'base_rate_overnight', e.target.value)}
                                                disabled={!canEdit}
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-champagne-gold/50 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Lodge (per night)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                                            <input
                                                type="number"
                                                value={roomType.base_rate_lodge || ''}
                                                onChange={(e) => handleRoomRateChange(roomType.id, 'base_rate_lodge', e.target.value)}
                                                disabled={!canEdit}
                                                placeholder="Same as overnight"
                                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-champagne-gold/50 disabled:opacity-50 placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {canEdit && (
                                    <button
                                        onClick={() => saveRoomType(roomType)}
                                        disabled={saving === roomType.id}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-champagne-gold/20 border border-champagne-gold/30 text-champagne-gold hover:bg-champagne-gold/30 transition-all disabled:opacity-50"
                                    >
                                        {saving === roomType.id ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Save size={16} />
                                        )}
                                        Save {roomType.name} Rates
                                    </button>
                                )}
                            </div>
                        ))}

                        {roomTypes.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                No room types found. Add room types in Django Admin.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300 mb-6">
                            <strong>Product Prices</strong>: Update prices for bar and inventory items sold to guests.
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-slate-900/50 border border-white/10 rounded-2xl">
                                <Wine size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No products found.</p>
                                <p className="text-sm mt-2">Add products via the Inventory page.</p>
                            </div>
                        ) : (
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-800/50">
                                        <tr>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Product</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Category</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Stock</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Price</th>
                                            <th className="text-left px-6 py-3 text-xs font-medium text-slate-400 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-white/5">
                                                <td className="px-6 py-3 font-medium text-white">{product.name}</td>
                                                <td className="px-6 py-3 text-slate-400 text-sm">{product.category_name}</td>
                                                <td className="px-6 py-3 text-slate-400 text-sm">
                                                    {product.quantity} units
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="relative w-32">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₦</span>
                                                        <input
                                                            type="number"
                                                            value={product.price}
                                                            onChange={(e) => handleProductPriceChange(product.id, e.target.value)}
                                                            disabled={!canEdit}
                                                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-white text-sm focus:outline-none focus:border-champagne-gold/50 disabled:opacity-50"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => saveProduct(product)}
                                                            disabled={saving === product.id}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-champagne-gold/20 border border-champagne-gold/30 text-champagne-gold text-sm hover:bg-champagne-gold/30 transition-all disabled:opacity-50"
                                                        >
                                                            {saving === product.id ? (
                                                                <Loader2 className="animate-spin" size={14} />
                                                            ) : (
                                                                <Save size={14} />
                                                            )}
                                                            Save
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {!canEdit && (
                    <div className="mt-6 bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-300">
                        <strong>Read-Only Mode</strong>: Only Managers and Admins can edit prices.
                    </div>
                )}
            </motion.div>
        </div>
    );
}
