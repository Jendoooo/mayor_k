'use client';

import { useState, useEffect, useMemo } from 'react';
import { Room, QuickBookData, Guest } from '@/app/lib/api';
import { X, User, Phone, Home, Clock, CreditCard, FileText, Loader2, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableRooms: Room[];
    onSubmit: (data: QuickBookData) => Promise<void>;
    selectedRoom?: Room;
}

export default function QuickBookModal({
    isOpen,
    onClose,
    availableRooms,
    onSubmit,
    selectedRoom
}: QuickBookModalProps) {
    const [loading, setLoading] = useState(false);
    const [existingGuest, setExistingGuest] = useState<Guest | null>(null);
    const [formData, setFormData] = useState<{
        guest_name: string;
        guest_phone: string;
        room_id: string;
        stay_type: 'SHORT_REST' | 'OVERNIGHT' | 'LODGE';
        num_nights: number;
        num_guests: number;
        payment_method: 'CASH' | 'TRANSFER' | 'POS' | 'PAYSTACK' | 'SPLIT';
        amount_paid: string; // Use string for better input control
        notes: string;
    }>({
        guest_name: '',
        guest_phone: '',
        room_id: selectedRoom?.id || '',
        stay_type: 'OVERNIGHT',
        num_nights: 1,
        num_guests: 1,
        payment_method: 'CASH',
        amount_paid: '',
        notes: '',
    });

    // Reset form when modal opens with a selected room
    useEffect(() => {
        if (isOpen && selectedRoom) {
            setFormData(prev => ({ ...prev, room_id: selectedRoom.id }));
        }
    }, [isOpen, selectedRoom]);

    // Auto-search for existing guest when phone is entered
    useEffect(() => {
        const phone = formData.guest_phone.trim();
        if (phone.length >= 10) {
            fetch(`http://localhost:8000/api/v1/guests/`, {
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    const match = data.results?.find((g: Guest) => g.phone === phone);
                    if (match) {
                        setExistingGuest(match);
                        setFormData(prev => ({ ...prev, guest_name: match.name }));
                    } else {
                        setExistingGuest(null);
                    }
                })
                .catch(err => console.error(err));
        } else {
            setExistingGuest(null);
        }
    }, [formData.guest_phone]);

    // Calculate total price dynamically
    const selectedRoomDetails = useMemo(() =>
        availableRooms.find(r => r.id === formData.room_id),
        [availableRooms, formData.room_id]
    );

    const totalAmount = useMemo(() => {
        if (!selectedRoomDetails) return 0;

        const baseRate = formData.stay_type === 'SHORT_REST'
            ? parseFloat(selectedRoomDetails.short_rest_rate || '0')
            : parseFloat(selectedRoomDetails.overnight_rate || '0');

        // For LODGE, multiply by nights
        if (formData.stay_type === 'LODGE') {
            return baseRate * formData.num_nights;
        }
        return baseRate;
    }, [selectedRoomDetails, formData.stay_type, formData.num_nights]);

    // Auto-fill amount paid when room or stay type changes
    useEffect(() => {
        if (totalAmount > 0 && formData.amount_paid === '') {
            setFormData(prev => ({ ...prev, amount_paid: totalAmount.toString() }));
        }
    }, [totalAmount]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSubmit({
                ...formData,
                amount_paid: parseFloat(formData.amount_paid) || 0
            });
            // Reset form on success
            setFormData({
                guest_name: '',
                guest_phone: '',
                room_id: '',
                stay_type: 'OVERNIGHT',
                num_nights: 1,
                num_guests: 1,
                payment_method: 'CASH',
                amount_paid: '',
                notes: '',
            });
            setExistingGuest(null);
            onClose();
        } catch (error) {
            console.error('Booking error:', error);
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = [
        { value: 'CASH', label: 'Cash', icon: '💵' },
        { value: 'TRANSFER', label: 'Transfer', icon: '🏦' },
        { value: 'POS', label: 'POS', icon: '💳' },
        { value: 'SPLIT', label: 'Split', icon: '✂️' },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-champagne-gold/20 to-transparent border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-champagne-gold/20 rounded-xl">
                                    <Zap className="text-champagne-gold" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white font-serif">Quick Check-In</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Instant booking for walk-in guests</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Guest Info Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <User size={14} /> Guest Information
                                </h3>
                                {existingGuest && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                                        <RefreshCw size={12} />
                                        Returning Guest ({existingGuest.total_stays} stays)
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Guest name"
                                        value={formData.guest_name}
                                        onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                                        required
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-champagne-gold/50 focus:ring-1 focus:ring-champagne-gold/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone *</label>
                                    <input
                                        type="tel"
                                        placeholder="08012345678"
                                        value={formData.guest_phone}
                                        onChange={e => setFormData({ ...formData, guest_phone: e.target.value })}
                                        required
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-champagne-gold/50 focus:ring-1 focus:ring-champagne-gold/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Room Selection */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-2">
                                <Home size={12} /> Room *
                            </label>
                            <select
                                value={formData.room_id}
                                onChange={e => setFormData({ ...formData, room_id: e.target.value, amount_paid: '' })}
                                required
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50 appearance-none cursor-pointer"
                            >
                                <option value="">Select a room...</option>
                                {availableRooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        Room {room.room_number} • {room.room_type_name} • ₦{parseFloat(room.overnight_rate || '0').toLocaleString()}/night
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stay Type & Duration */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-2">
                                    <Clock size={12} /> Stay Type *
                                </label>
                                <select
                                    value={formData.stay_type}
                                    onChange={e => setFormData({
                                        ...formData,
                                        stay_type: e.target.value as 'SHORT_REST' | 'OVERNIGHT' | 'LODGE',
                                        amount_paid: '' // Reset amount when stay type changes
                                    })}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50 appearance-none cursor-pointer"
                                >
                                    <option value="SHORT_REST">Short Rest (2-4 hrs)</option>
                                    <option value="OVERNIGHT">Overnight</option>
                                    <option value="LODGE">Lodge (Multi-night)</option>
                                </select>
                            </div>

                            {/* Only show nights for LODGE stay type */}
                            {formData.stay_type === 'LODGE' && (
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Nights</label>
                                    <input
                                        type="number"
                                        min={2}
                                        value={formData.num_nights}
                                        onChange={e => setFormData({
                                            ...formData,
                                            num_nights: parseInt(e.target.value) || 2,
                                            amount_paid: '' // Reset amount when nights change
                                        })}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-champagne-gold/50"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment Section */}
                        <div className="bg-slate-800/30 rounded-2xl p-5 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard size={14} /> Payment
                                </h3>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">Total Due</div>
                                    <div className="text-2xl font-bold text-champagne-gold font-mono">
                                        ₦{totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_method: method.value as any })}
                                        className={`p-3 rounded-xl text-center transition-all border ${formData.payment_method === method.value
                                                ? 'bg-champagne-gold/20 border-champagne-gold/50 text-champagne-gold'
                                                : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                            }`}
                                    >
                                        <div className="text-lg mb-1">{method.icon}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider">{method.label}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Amount Paid */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Amount Received (₦) *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.amount_paid}
                                        onChange={e => {
                                            // Only allow numbers
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setFormData({ ...formData, amount_paid: value });
                                        }}
                                        placeholder={totalAmount.toString()}
                                        required
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-champagne-gold/50"
                                    />
                                </div>
                                {/* Balance indicator */}
                                {formData.amount_paid && parseFloat(formData.amount_paid) < totalAmount && (
                                    <p className="text-xs text-red-400 mt-1.5">
                                        ⚠️ Balance: ₦{(totalAmount - parseFloat(formData.amount_paid)).toLocaleString()}
                                    </p>
                                )}
                                {formData.amount_paid && parseFloat(formData.amount_paid) > totalAmount && (
                                    <p className="text-xs text-emerald-400 mt-1.5">
                                        💵 Change: ₦{(parseFloat(formData.amount_paid) - totalAmount).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-2">
                                <FileText size={12} /> Notes (optional)
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Special requests, DND, late checkout..."
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-champagne-gold/50 resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 px-6 rounded-xl border border-white/10 text-slate-400 font-medium hover:bg-white/5 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.room_id || !formData.guest_name || !formData.amount_paid}
                                className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        Complete Check-In
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
