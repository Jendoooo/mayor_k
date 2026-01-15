'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/app/lib/api';
import { toast } from 'react-hot-toast';

interface StartShiftModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export default function StartShiftModal({ isOpen, onSuccess }: StartShiftModalProps) {
    const [openingBalance, setOpeningBalance] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.startShift({ opening_balance: parseFloat(openingBalance) || 0 });
            toast.success('Shift started successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Failed to start shift:', error);
            toast.error(error?.message || 'Failed to start shift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-slate-900 p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-emerald-400" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-serif">Start Your Shift</h2>
                        <p className="text-slate-400 mt-2 text-sm">Please declare the cash opening balance to begin.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Opening Cash (₦)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="100"
                                    value={openingBalance}
                                    onChange={(e) => setOpeningBalance(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Count the physical cash in the drawer carefully.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !openingBalance}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    Start Shift <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
