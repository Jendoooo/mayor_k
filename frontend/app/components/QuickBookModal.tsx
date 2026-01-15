'use client';

import { useState } from 'react';
import { Room, QuickBookData } from '@/app/lib/api';

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
    const [formData, setFormData] = useState<{
        guest_name: string;
        guest_phone: string;
        room_id: string;
        stay_type: 'SHORT_REST' | 'OVERNIGHT' | 'LODGE';
        num_nights: number;
        num_guests: number;
        payment_method: 'CASH' | 'TRANSFER' | 'POS' | 'PAYSTACK' | 'SPLIT';
        amount_paid: number;
        notes: string;
    }>({
        guest_name: '',
        guest_phone: '',
        room_id: selectedRoom?.id || '',
        stay_type: 'OVERNIGHT',
        num_nights: 1,
        num_guests: 1,
        payment_method: 'CASH',
        amount_paid: 0,
        notes: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call the actual API via the onSubmit prop
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedRoomDetails = availableRooms.find(r => r.id === formData.room_id);
    const roomRate = selectedRoomDetails
        ? (formData.stay_type === 'SHORT_REST'
            ? selectedRoomDetails.short_rest_rate
            : selectedRoomDetails.overnight_rate)
        : '0';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">⚡ Quick Book</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Guest Info */}
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        <h4 style={{ marginBottom: 'var(--space-md)' }}>Guest Information</h4>
                        <div className="grid grid-cols-2 gap-md">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Guest name"
                                    value={formData.guest_name}
                                    onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Phone *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="08012345678"
                                    value={formData.guest_phone}
                                    onChange={e => setFormData({ ...formData, guest_phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Room Selection */}
                    <div className="form-group">
                        <label className="form-label">Room *</label>
                        <select
                            className="form-select"
                            value={formData.room_id}
                            onChange={e => setFormData({ ...formData, room_id: e.target.value })}
                            required
                        >
                            <option value="">Select a room</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    Room {room.room_number} - {room.room_type_name} (₦{room.overnight_rate}/night)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stay Type */}
                    <div className="grid grid-cols-2 gap-md">
                        <div className="form-group">
                            <label className="form-label">Stay Type *</label>
                            <select
                                className="form-select"
                                value={formData.stay_type}
                                onChange={e => setFormData({
                                    ...formData,
                                    stay_type: e.target.value as 'SHORT_REST' | 'OVERNIGHT' | 'LODGE'
                                })}
                            >
                                <option value="SHORT_REST">Short Rest (2-4 hrs)</option>
                                <option value="OVERNIGHT">Overnight</option>
                                <option value="LODGE">Lodge (Multi-night)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nights</label>
                            <input
                                type="number"
                                className="form-input"
                                min={1}
                                value={formData.num_nights}
                                onChange={e => setFormData({ ...formData, num_nights: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>

                    {/* Payment */}
                    <div style={{
                        background: 'var(--color-bg-secondary)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)'
                    }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
                            <h4>Payment</h4>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>
                                Total: ₦{parseFloat(String(roomRate || '0')).toLocaleString()}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-md">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Method *</label>
                                <select
                                    className="form-select"
                                    value={formData.payment_method}
                                    onChange={e => setFormData({
                                        ...formData,
                                        payment_method: e.target.value as 'CASH' | 'TRANSFER' | 'POS'
                                    })}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="TRANSFER">Transfer</option>
                                    <option value="POS">POS</option>
                                    <option value="SPLIT">Split Payment</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Amount Paid (₦) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min={0}
                                    value={formData.amount_paid}
                                    onChange={e => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-group">
                        <label className="form-label">Notes (optional)</label>
                        <textarea
                            className="form-input"
                            rows={2}
                            placeholder="Any special requests..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-md">
                        <button
                            type="button"
                            className="btn btn-outline w-full"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner" style={{ width: 16, height: 16 }}></span>
                            ) : (
                                '✓ Complete Booking'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
