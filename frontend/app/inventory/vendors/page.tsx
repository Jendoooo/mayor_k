'use client';

import { useState, useEffect } from 'react';
import api, { Vendor } from '@/app/lib/api';
import { Plus, Search, MapPin, Phone, User, Edit2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import VendorModal from '@/app/components/VendorModal';
import Link from 'next/link';

export default function VendorListPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response = await api.getVendors();
            setVendors(response.results);
        } catch (error) {
            console.error('Failed to fetch vendors:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedVendor(null);
        setIsModalOpen(true);
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <Link href="/inventory" className="text-slate-400 hover:text-white flex items-center gap-2 mb-2 transition-colors">
                        <ArrowLeft size={16} /> Back to Inventory
                    </Link>
                    <h1 className="text-4xl font-bold font-heading text-white tracking-tight">Suppliers</h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage vendors and supplier contacts.</p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAdd}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all"
                >
                    <Plus size={20} />
                    Add Vendor
                </motion.button>
            </div>

            {/* Vendor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-20 text-slate-500">
                        Loading vendors...
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-slate-500 flex flex-col items-center">
                        <User size={48} className="opacity-20 mb-4" />
                        <p>No vendors found.</p>
                    </div>
                ) : (
                    filteredVendors.map((vendor) => (
                        <motion.div
                            key={vendor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-white/5 rounded-2xl p-6 group hover:border-blue-500/30 transition-all relative"
                        >
                            <button
                                onClick={() => handleEdit(vendor)}
                                className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-600/20 hover:text-blue-400 transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>

                            <h3 className="text-xl font-bold text-white mb-4 pr-10">{vendor.name}</h3>

                            <div className="space-y-3 text-slate-400">
                                {vendor.contact_person && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-blue-500" />
                                        <span>{vendor.contact_person}</span>
                                    </div>
                                )}
                                {vendor.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone size={16} className="text-emerald-500" />
                                        <span>{vendor.phone}</span>
                                    </div>
                                )}
                                {vendor.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-purple-500 shrink-0 mt-1" />
                                        <span className="text-sm">{vendor.address}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <VendorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={fetchVendors}
                vendor={selectedVendor}
            />
        </div>
    );
}
