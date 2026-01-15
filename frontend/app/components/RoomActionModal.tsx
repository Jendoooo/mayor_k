'use client';

import { useState } from 'react';
import api, { Room } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

interface RoomActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | undefined;
    onUpdate: () => void; // Trigger refresh
}

export default function RoomActionModal({ isOpen, onClose, room, onUpdate }: RoomActionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [auditNote, setAuditNote] = useState('');

    if (!isOpen || !room) return null;

    const handleMarkClean = async () => {
        if (!confirm(`Mark Room ${room.room_number} as CLEAN?`)) return;
        setIsLoading(true);
        try {
            await api.markRoomClean(room.id);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to mark clean', error);
            alert('Failed to update room status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkMaintenance = async () => {
        const reason = prompt("Enter maintenance reason:");
        if (!reason) return;

        setIsLoading(true);
        try {
            await api.markRoomMaintenance(room.id, reason);
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Failed to mark maintenance', error);
            alert('Failed to update room status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Room {room.room_number}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="py-md">
                    <div className="flex justify-between mb-md">
                        <span className="text-secondary">Status</span>
                        <span className={`badge badge-${room.current_state.toLowerCase()}`}>
                            {room.state_display}
                        </span>
                    </div>

                    <div className="flex justify-between mb-md">
                        <span className="text-secondary">Type</span>
                        <span className="font-bold">{room.room_type_name}</span>
                    </div>

                    {room.notes && (
                        <div className="bg-bg-secondary p-sm rounded mb-md text-sm">
                            <strong>Note:</strong> {room.notes}
                        </div>
                    )}

                    <div className="border-t border-color-border my-md"></div>

                    <div className="flex flex-col gap-md">
                        {room.current_state === 'DIRTY' && (
                            <button
                                className="btn btn-success w-full justify-center"
                                onClick={handleMarkClean}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : '✨ Mark as Clean'}
                            </button>
                        )}

                        {room.current_state === 'MAINTENANCE' && (
                            <button
                                className="btn btn-success w-full justify-center"
                                onClick={handleMarkClean} // Re-using mark clean to make it available
                                disabled={isLoading}
                            >
                                {isLoading ? 'Updating...' : '✅ Mark as Repaired / Available'}
                            </button>
                        )}

                        {/* Extend Stay Action */}
                        {(room.current_state === 'OCCUPIED' && room.booking_stay_info) && (
                            <div className="mt-2">
                                <button
                                    className="btn btn-outline w-full justify-center mb-2"
                                    onClick={async () => {
                                        const type = room.booking_stay_info?.stay_type === 'SHORT_REST' ? 'SHORT_TO_OVERNIGHT' : 'NIGHTS';
                                        const promptMsg = type === 'SHORT_TO_OVERNIGHT'
                                            ? "Upgrade Short Rest to Overnight? (Charges difference)"
                                            : "Extend by how many nights?";

                                        let units = 1;
                                        if (type === 'NIGHTS') {
                                            const input = prompt(promptMsg, "1");
                                            if (!input) return;
                                            units = parseInt(input);
                                            if (isNaN(units) || units < 1) return alert("Invalid number of nights");
                                        } else {
                                            if (!confirm(promptMsg)) return;
                                        }

                                        setIsLoading(true);
                                        try {
                                            if (room.current_booking_id) {
                                                await api.extendBooking(room.current_booking_id, type, units);
                                                toast.success('Extension successful! Please collect payment.');
                                                onUpdate();
                                                onClose();
                                            }
                                        } catch (error) {
                                            console.error('Extension failed', error);
                                            toast.error('Failed to extend booking');
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }}
                                    disabled={isLoading}
                                >
                                    {room.booking_stay_info.stay_type === 'SHORT_REST' ? '⬆️ Upgrade to Overnight' : '📅 Extend Stay'}
                                </button>
                            </div>
                        )}

                        {room.current_state === 'AVAILABLE' && (
                            <button
                                className="btn btn-outline-danger w-full justify-center"
                                onClick={handleMarkMaintenance}
                                disabled={isLoading}
                            >
                                🛠️ Mark for Maintenance
                            </button>
                        )}

                        {/* Occupied room actions would typically go to booking details, 
                            but we can add a shortcut here later */}
                        {room.current_state === 'OCCUPIED' && room.current_booking_id && (
                            <button
                                className="btn btn-outline-danger w-full justify-center"
                                onClick={async () => {
                                    if (!confirm(`Check out Room ${room.room_number}?`)) return;
                                    setIsLoading(true);
                                    try {
                                        if (room.current_booking_id) {
                                            await api.checkOut(room.current_booking_id);
                                            toast.success('Check-out successful');
                                            onUpdate();
                                            onClose();
                                        }
                                    } catch (error) {
                                        console.error('Failed to check out', error);
                                        toast.error('Failed to check out');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : '👋 Check Out Guest'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
