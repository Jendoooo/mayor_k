'use client';

import { useState, useEffect } from 'react';
import api, { Booking } from '@/app/lib/api';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

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

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Bookings</h1>
                    <p className="text-secondary">Manage reservations and check-ins</p>
                </div>
                <button className="btn btn-primary">
                    + New Booking
                </button>
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
                                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>
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
        </div>
    );
}
