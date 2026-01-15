'use client';

import { useState } from 'react';
import api, { Room } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';
import PromptModal from './PromptModal';

interface RoomActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | undefined;
    onUpdate: () => void; // Trigger refresh
}

export default function RoomActionModal({ isOpen, onClose, room, onUpdate }: RoomActionModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [auditNote, setAuditNote] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: (() => void) | null; title: string; message: string; variant?: 'danger' | 'warning' | 'info' }>({ isOpen: false, action: null, title: '', message: '', variant: 'info' });
    const [promptModal, setPromptModal] = useState<{ isOpen: boolean; onSubmit: ((value: string) => void) | null; title: string; message: string; placeholder?: string }>({ isOpen: false, onSubmit: null, title: '', message: '' });

    if (!isOpen || !room) return null;

    const handleMarkClean = async () => {
        setConfirmModal({
            isOpen: true,
            action: async () => {
                setIsLoading(true);
                try {
                    await api.markRoomClean(room.id);
                    onUpdate();
                    onClose();
                    setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
                    toast.success(`Room ${room.room_number} marked as clean`);
                } catch (error) {
                    console.error('Failed to mark clean', error);
                    toast.error('Failed to update room status');
                } finally {
                    setIsLoading(false);
                }
            },
            title: `Mark Room ${room.room_number} as Clean?`,
            message: 'This will change the room status to Available.',
            variant: 'info'
        });
    };

    const handleMarkMaintenance = async () => {
        setPromptModal({
            isOpen: true,
            onSubmit: async (reason: string) => {
                setIsLoading(true);
                try {
                    await api.markRoomMaintenance(room.id, reason);
                    onUpdate();
                    onClose();
                    setPromptModal({ isOpen: false, onSubmit: null, title: '', message: '' });
                    toast.success(`Room ${room.room_number} marked under maintenance`);
                } catch (error) {
                    console.error('Failed to mark maintenance', error);
                    toast.error('Failed to update room status');
                } finally {
                    setIsLoading(false);
                }
            },
            title: 'Mark Room Under Maintenance',
            message: `Enter maintenance reason for Room ${room.room_number}:`,
            placeholder: 'Enter maintenance reason...'
        });
    };

    const handleExtendBooking = async (type: 'NIGHTS' | 'SHORT_TO_OVERNIGHT', units: number) => {
        setIsLoading(true);
        try {
            if (room.current_booking_id) {
                await api.extendBooking(room.current_booking_id, type, units);
                toast.success('Extension successful! Please collect payment.');
                onUpdate();
                onClose();
                setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
                setPromptModal({ isOpen: false, onSubmit: null, title: '', message: '' });
            }
        } catch (error) {
            console.error('Extension failed', error);
            toast.error('Failed to extend booking');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setConfirmModal({
            isOpen: true,
            action: async () => {
                setIsLoading(true);
                try {
                    if (room.current_booking_id) {
                        await api.checkOut(room.current_booking_id);
                        toast.success('Check-out successful');
                        onUpdate();
                        onClose();
                        setConfirmModal({ isOpen: false, action: null, title: '', message: '' });
                    }
                } catch (error) {
                    console.error('Failed to check out', error);
                    toast.error('Failed to check out');
                } finally {
                    setIsLoading(false);
                }
            },
            title: `Check out Room ${room.room_number}?`,
            message: 'This will mark the room as dirty and complete the booking.',
            variant: 'warning'
        });
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
                                            setPromptModal({
                                                isOpen: true,
                                                onSubmit: async (input: string) => {
                                                    const parsedUnits = parseInt(input);
                                                    if (isNaN(parsedUnits) || parsedUnits < 1) {
                                                        toast.error("Invalid number of nights");
                                                        return;
                                                    }
                                                    units = parsedUnits;
                                                    await handleExtendBooking(type, units);
                                                },
                                                title: 'Extend Stay',
                                                message: 'How many nights to extend?',
                                                placeholder: 'Enter number of nights...'
                                            });
                                            return;
                                        } else {
                                            setConfirmModal({
                                                isOpen: true,
                                                action: async () => {
                                                    await handleExtendBooking(type, units);
                                                },
                                                title: 'Upgrade to Overnight?',
                                                message: 'This will charge the difference between Short Rest and Overnight rates.',
                                                variant: 'info'
                                            });
                                            return;
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
                                onClick={handleCheckOut}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : '👋 Check Out Guest'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ isOpen: false, action: null, title: '', message: '' })}
                    onConfirm={() => confirmModal.action?.()}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    variant={confirmModal.variant || 'info'}
                    isLoading={isLoading}
                />
            )}

            {/* Prompt Modal */}
            {promptModal.isOpen && (
                <PromptModal
                    isOpen={promptModal.isOpen}
                    onClose={() => setPromptModal({ isOpen: false, onSubmit: null, title: '', message: '' })}
                    onSubmit={(value) => promptModal.onSubmit?.(value)}
                    title={promptModal.title}
                    message={promptModal.message}
                    placeholder={promptModal.placeholder}
                />
            )}
        </div>
    );
}
