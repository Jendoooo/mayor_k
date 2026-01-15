'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import api, { WorkShift } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

interface EndShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: WorkShift;
    onSuccess: () => void;
}

export default function EndShiftModal({ isOpen, onClose, shift, onSuccess }: EndShiftModalProps) {
    const [closingBalance, setClosingBalance] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.endShift(shift.id, {
                closing_balance: parseFloat(closingBalance) || 0,
                notes
            });
            toast.success('Shift closed successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Failed to close shift:', error);
            toast.error(error?.message || 'Failed to close shift');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                {/* Click outside to close (optional, maybe force close?) */}
                <div className="absolute inset-0" onClick={onClose}></div>

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10"
                >
                    <div className="bg-slate-900 p-6">
                        <div className="flex items-center gap-3 text-white mb-2">
                            <LogOut className="text-red-400" />
                            <h2 className="text-xl font-bold font-serif">End Shift</h2>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Verify your cash-in-hand before closing.
                        </p>

                        {/* Summary */}
                        <div className="mt-4 p-3 bg-slate-800 rounded-lg flex justify-between items-center">
                            <div className="text-xs text-slate-400 uppercase tracking-widest">Started At</div>
                            <div className="text-sm font-mono text-white">
                                {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Closing Cash Balance (₦)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="100"
                                    value={closingBalance}
                                    onChange={(e) => setClosingBalance(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xl font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                                    placeholder="0.00"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Notes / Discrepancies
                            </label>
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:border-red-500 transition-all resize-none"
                                placeholder="Explain any shortages or overages..."
                            ></textarea>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !closingBalance}
                                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Close Shift'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
