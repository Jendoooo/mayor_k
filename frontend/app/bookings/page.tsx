'use client';

import { useState, useEffect } from 'react';
import api, { Booking } from '@/app/lib/api';
import BookingDetailModal from '../components/BookingDetailModal';
import { exportToCSV } from '@/app/lib/utils';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await api.getBookings();
            setBookings(response.results);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBookings = filter === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filter);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleExport = () => {
        const dataToExport = filteredBookings.map(booking => ({
            "Reference": booking.booking_ref,
            "Guest Name": booking.guest_name,
            "Room Number": booking.room_number,
            "Type": booking.stay_type_display,
            "Check In": booking.check_in_date,
            "Check Out": booking.actual_checkout || booking.expected_checkout,
            "Status": booking.status_display,
            "Total Amount": booking.total_amount,
            "Balance Due": booking.balance_due,
            "Payment Status": booking.is_fully_paid ? "Paid" : "Pending"
        }));
        exportToCSV(dataToExport, `bookings_export_${filter.toLowerCase()}_${new Date().toISOString().split('T')[0]}`);
        toast.success("Bookings exported successfully");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Bookings</h1>
                    <p className="text-secondary">Manage reservations and check-ins</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button className="btn btn-primary">
                        + New Booking
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="flex gap-md mb-md">
                    <button
                        className={`btn ${filter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('ALL')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === 'CHECKED_IN' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('CHECKED_IN')}
                    >
                        Checked In
                    </button>
                    <button
                        className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('PENDING')}
                    >
                        Pending
                    </button>
                    <button
                        className={`btn ${filter === 'CHECKED_OUT' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter('CHECKED_OUT')}
                    >
                        History
                    </button>
                </div>

                <div className="table-container">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-xl text-secondary">
                            No bookings found.
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Type</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="font-mono">{booking.booking_ref}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{booking.guest_name}</div>
                                            <div className="text-secondary text-xs">{booking.guest_phone}</div>
                                        </td>
                                        <td>Room {booking.room_number}</td>
                                        <td>{booking.stay_type_display}</td>
                                        <td>
                                            <div>{booking.check_in_date}</div>
                                            <div className="text-secondary text-xs">{booking.check_in_time ? booking.check_in_time.substring(0, 5) : '--:--'}</div>
                                        </td>
                                        <td className="text-sm">
                                            {booking.actual_checkout ? (
                                                <div className="text-secondary">
                                                    <div>{new Date(booking.actual_checkout).toLocaleDateString()}</div>
                                                    <div className="text-xs">{new Date(booking.actual_checkout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            ) : (
                                                <span className="text-secondary opacity-50">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${booking.status === 'CHECKED_IN' ? 'badge-occupied' :
                                                booking.status === 'CHECKED_OUT' ? 'badge-available' :
                                                    booking.status === 'CANCELLED' ? 'badge-rejected' :
                                                        'badge-pending'
                                                }`}>
                                                {booking.status_display}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.is_fully_paid ? (
                                                <span className="badge badge-approved">Paid</span>
                                            ) : (
                                                <span className="badge badge-pending">
                                                    Due: ₦{parseFloat(booking.balance_due).toLocaleString()}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '4px 8px', fontSize: '12px' }}
                                                onClick={() => setSelectedBooking(booking)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
}
