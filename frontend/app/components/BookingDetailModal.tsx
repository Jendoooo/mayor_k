import React from 'react';
import { Booking } from '@/app/lib/api';
import { X } from 'lucide-react';

interface BookingDetailModalProps {
    booking: Booking | null;
    onClose: () => void;
}

export default function BookingDetailModal({ booking, onClose }: BookingDetailModalProps) {
    if (!booking) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-bg-primary rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex justify-between items-center p-md border-b border-border bg-bg-secondary/30">
                    <h3 className="text-lg font-bold">Booking Details</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm rounded-full p-1 hover:bg-bg-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-md space-y-md">
                    <div className="grid grid-cols-2 gap-md">
                        <div>
                            <label className="text-secondary text-xs uppercase tracking-wider">Reference</label>
                            <div className="font-mono font-medium">{booking.booking_ref}</div>
                        </div>
                        <div>
                            <label className="text-secondary text-xs uppercase tracking-wider">Status</label>
                            <div>
                                <span className={`badge ${booking.status === 'CHECKED_IN' ? 'badge-occupied' :
                                    booking.status === 'CHECKED_OUT' ? 'badge-available' :
                                        'badge-pending'
                                    }`}>
                                    {booking.status_display}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-bg-secondary/30 p-sm rounded-md border border-border">
                        <h4 className="font-medium mb-sm text-sm">Guest Information</h4>
                        <div className="grid grid-cols-2 gap-sm text-sm">
                            <div>
                                <div className="text-secondary text-xs">Name</div>
                                <div>{booking.guest_name}</div>
                            </div>
                            <div>
                                <div className="text-secondary text-xs">Phone</div>
                                <div>{booking.guest_phone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-md text-sm">
                        <div>
                            <label className="text-secondary text-xs">Room</label>
                            <div className="font-medium">Room {booking.room_number}</div>
                        </div>
                        <div>
                            <label className="text-secondary text-xs">Stay Type</label>
                            <div>{booking.stay_type_display}</div>
                        </div>
                        <div>
                            <label className="text-secondary text-xs">Check In</label>
                            <div>{booking.check_in_date} {booking.check_in_time}</div>
                        </div>
                        <div>
                            <label className="text-secondary text-xs">Check Out</label>
                            <div>
                                {booking.actual_checkout
                                    ? new Date(booking.actual_checkout).toLocaleString()
                                    : <span className="text-secondary italic">Expected: {new Date(booking.expected_checkout).toLocaleString()}</span>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="pt-sm border-t border-border mt-sm space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-secondary">Room Charges</span>
                            <span className="font-medium">₦{parseFloat(booking.total_room_charges || booking.total_amount).toLocaleString()}</span>
                        </div>
                        {parseFloat(booking.total_bar_charges) > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-secondary">Bar/Restaurant Orders</span>
                                <span className="font-medium">₦{parseFloat(booking.total_bar_charges).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center font-bold pt-2 border-t border-border border-dashed">
                            <span>Grand Total</span>
                            <span>₦{parseFloat(booking.grand_total || booking.total_amount).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center font-medium text-success pt-2">
                            <span>Amount Paid</span>
                            <span>₦{parseFloat(booking.amount_paid).toLocaleString()}</span>
                        </div>
                        {!booking.is_fully_paid && (
                            <div className="flex justify-between items-center font-bold text-danger text-lg mt-1">
                                <span>Balance Due</span>
                                <span>₦{parseFloat(booking.balance_due).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-md border-t border-border bg-bg-secondary/10 flex justify-end">
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
