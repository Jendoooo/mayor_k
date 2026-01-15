'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/app/components/StatCard';
import { RoomGrid, RoomLegend } from '@/app/components/RoomCard';
import QuickBookModal from '@/app/components/QuickBookModal';
import { Room, DashboardStats, Booking, QuickBookData } from '@/app/lib/api';

// Mock data for development (will be replaced with API calls)
const mockStats: DashboardStats = {
    total_rooms: 30,
    available_rooms: 22,
    occupied_rooms: 5,
    dirty_rooms: 3,
    today_bookings: 8,
    today_revenue: '156000',
    today_checkouts: 4,
    pending_expenses: 2,
    occupancy_rate: 16.7,
};

const mockRooms: Room[] = [
    // Floor 1 - Standard rooms
    { id: '1', room_number: '101', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '2', room_number: '102', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '3', room_number: '103', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '4', room_number: '104', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '5', room_number: '105', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '6', room_number: '106', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '7', room_number: '107', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '8', room_number: '108', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '9', room_number: '109', room_type: '2', room_type_name: 'Deluxe', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '10', room_number: '110', room_type: '2', room_type_name: 'Deluxe', floor: 1, current_state: 'MAINTENANCE', state_display: 'Maintenance', notes: 'AC repair', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    // Floor 2
    { id: '11', room_number: '201', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '12', room_number: '202', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '13', room_number: '203', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '14', room_number: '204', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '15', room_number: '205', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '16', room_number: '206', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '17', room_number: '207', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '18', room_number: '208', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '19', room_number: '209', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '20', room_number: '210', room_type: '3', room_type_name: 'VIP Suite', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
    // Floor 3
    { id: '21', room_number: '301', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '22', room_number: '302', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '23', room_number: '303', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '24', room_number: '304', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '25', room_number: '305', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '26', room_number: '306', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '27', room_number: '307', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '28', room_number: '308', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '29', room_number: '309', room_type: '3', room_type_name: 'VIP Suite', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
    { id: '30', room_number: '310', room_type: '3', room_type_name: 'VIP Suite', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
];

const mockTodayBookings: Booking[] = [
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
        status: 'CHECKED_IN',
        status_display: 'Checked In',
        source: 'WALK_IN',
        check_in_date: '2026-01-15',
        check_in_time: '16:00',
        expected_checkout: '2026-01-15T20:00:00',
        actual_checkout: null,
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
        created_at: '2026-01-15T16:00:00',
    },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>(mockStats);
    const [rooms, setRooms] = useState<Room[]>(mockRooms);
    const [todayBookings, setTodayBookings] = useState<Booking[]>(mockTodayBookings);
    const [showQuickBook, setShowQuickBook] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();

    const availableRooms = rooms.filter(r => r.is_available);

    const handleQuickBook = async (data: QuickBookData) => {
        // TODO: Replace with actual API call
        console.log('Creating booking:', data);
        // Simulate success
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowQuickBook(false);
        alert('Booking created successfully!');
    };

    const handleRoomClick = (room: Room) => {
        if (room.is_available) {
            setSelectedRoom(room);
            setShowQuickBook(true);
        } else {
            // Show room details
            alert(`Room ${room.room_number} is ${room.state_display}`);
        }
    };

    const formatCurrency = (amount: string) => {
        return `₦${parseFloat(amount).toLocaleString()}`;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Dashboard</h1>
                    <p className="text-secondary">Welcome back! Here&apos;s what&apos;s happening today.</p>
                </div>
                <button
                    className="btn btn-quick-book"
                    onClick={() => {
                        setSelectedRoom(undefined);
                        setShowQuickBook(true);
                    }}
                >
                    ⚡ Quick Book
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-md mb-lg">
                <StatCard
                    value={stats.available_rooms}
                    label="Available Rooms"
                    accent="success"
                    icon={
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                        </svg>
                    }
                />
                <StatCard
                    value={stats.occupied_rooms}
                    label="Occupied"
                    accent="warning"
                    icon={
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    }
                />
                <StatCard
                    value={formatCurrency(stats.today_revenue)}
                    label="Today's Revenue"
                    accent="primary"
                    icon={
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    value={`${stats.occupancy_rate}%`}
                    label="Occupancy Rate"
                    accent="info"
                    icon={
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    }
                />
            </div>

            {/* Rooms Overview */}
            <div className="card mb-lg">
                <div className="card-header">
                    <h3 className="card-title">Rooms Overview</h3>
                    <div className="flex gap-sm">
                        <span className="badge badge-available">{stats.available_rooms} Available</span>
                        <span className="badge badge-occupied">{stats.occupied_rooms} Occupied</span>
                        <span className="badge badge-dirty">{stats.dirty_rooms} Dirty</span>
                    </div>
                </div>
                <RoomLegend />
                <RoomGrid rooms={rooms} onRoomClick={handleRoomClick} />
            </div>

            {/* Today's Activity */}
            <div className="grid grid-cols-2 gap-lg">
                {/* Today's Bookings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Today&apos;s Bookings</h3>
                        <span className="badge badge-available">{todayBookings.length} Active</span>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Guest</th>
                                    <th>Room</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{booking.guest_name}</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                                {booking.booking_ref}
                                            </div>
                                        </td>
                                        <td>{booking.room_number}</td>
                                        <td>{booking.stay_type_display}</td>
                                        <td>
                                            <span className={`badge ${booking.status === 'CHECKED_IN' ? 'badge-occupied' :
                                                    booking.status === 'CONFIRMED' ? 'badge-available' :
                                                        'badge-pending'
                                                }`}>
                                                {booking.status_display}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions & Alerts */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Quick Actions</h3>
                    </div>
                    <div className="flex flex-col gap-md">
                        <button className="btn btn-outline w-full" style={{ justifyContent: 'flex-start' }}>
                            🧹 Mark Rooms Clean ({stats.dirty_rooms} pending)
                        </button>
                        <button className="btn btn-outline w-full" style={{ justifyContent: 'flex-start' }}>
                            📋 Pending Checkouts ({stats.today_checkouts})
                        </button>
                        <button className="btn btn-outline w-full" style={{ justifyContent: 'flex-start' }}>
                            💰 Approve Expenses ({stats.pending_expenses} pending)
                        </button>
                        <button className="btn btn-outline w-full" style={{ justifyContent: 'flex-start' }}>
                            📊 View Reports
                        </button>
                    </div>

                    {/* Alerts */}
                    <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
                        <h4 style={{ marginBottom: 'var(--space-md)' }}>Alerts</h4>
                        <div style={{
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid var(--color-warning)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            ⚠️ Room 110 has been under maintenance for 3 days
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Book Modal */}
            <QuickBookModal
                isOpen={showQuickBook}
                onClose={() => setShowQuickBook(false)}
                availableRooms={availableRooms}
                onSubmit={handleQuickBook}
                selectedRoom={selectedRoom}
            />
        </div>
    );
}
