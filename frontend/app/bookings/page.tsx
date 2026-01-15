'use client';

import { useState } from 'react';
import { Booking } from '@/app/lib/api';

// Mock data
const mockBookings: Booking[] = [
    {
        id: '1',
        booking_ref: 'MK-260115-A1B2',
        guest: '1',
        guest_name: 'Adeola Johnson',
        guest_phone: '08034567890',
        room: '2',
        room_number: '102',
        room_type: 'Standard',
        stay_type: 'OVERNIGHT',
        stay_type_display: 'Overnight',
        status: 'CHECKED_IN',
        status_display: 'Checked In',
        source: 'WALK_IN',
        check_in_date: '2026-01-15',
        check_in_time: '14:30',
        expected_checkout: '2026-01-16T12:00:00',
        actual_checkout: null,
        num_nights: 1,
        num_guests: 2,
        room_rate: '12000',
        total_amount: '12000',
        amount_paid: '12000',
        balance_due: '0',
        is_fully_paid: true,
        discount_amount: '0',
        discount_reason: '',
        notes: '',
        created_by_name: 'Ada Receptionist',
        created_at: '2026-01-15T14:30:00',
    },
    {
        id: '2',
        booking_ref: 'MK-260115-C3D4',
        guest: '2',
        guest_name: 'Chukwudi Okonkwo',
        guest_phone: '08098765432',
        room: '7',
        room_number: '107',
        room_type: 'Standard',
        stay_type: 'SHORT_REST',
        stay_type_display: 'Short Rest',
        status: 'CHECKED_OUT',
        status_display: 'Checked Out',
        source: 'WALK_IN',
        check_in_date: '2026-01-15',
        check_in_time: '12:00',
        expected_checkout: '2026-01-15T16:00:00',
        actual_checkout: '2026-01-15T16:05:00',
        num_nights: 1,
        num_guests: 1,
        room_rate: '5000',
        total_amount: '5000',
        amount_paid: '5000',
        balance_due: '0',
        is_fully_paid: true,
        discount_amount: '0',
        discount_reason: '',
        notes: '',
        created_by_name: 'Ada Receptionist',
        created_at: '2026-01-15T12:00:00',
    },
];

export default function BookingsPage() {
    const [bookings] = useState<Booking[]>(mockBookings);
    const [filter, setFilter] = useState('ALL');

    const filteredBookings = filter === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filter);

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
                                        <div className="text-secondary text-xs">{booking.check_in_time || '--:--'}</div>
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
                </div>
            </div>
        </div>
    );
}
