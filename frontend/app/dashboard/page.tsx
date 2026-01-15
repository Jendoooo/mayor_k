'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/app/components/StatCard';
import RoomCard, { RoomGrid, RoomLegend } from '@/app/components/RoomCard';
import QuickBookModal from '@/app/components/QuickBookModal';
import RoomActionModal from '@/app/components/RoomActionModal';
import api, { DashboardStats, Room, Booking, QuickBookData } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import StakeholderDashboard from '@/app/components/StakeholderDashboard';
import { BedDouble, CalendarDays, Receipt, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
    const { user } = useAuth();
    const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
    const [selectedActionRoom, setSelectedActionRoom] = useState<Room | undefined>(undefined);

    useEffect(() => {
        if (user && user.role !== 'STAKEHOLDER') {
            fetchData();
        } else {
            setIsLoading(false); // Stakeholder dashboard handles its own loading
        }
    }, [user]);

    const fetchData = async () => {
        try {
            // Fetch stats, all rooms (for grid), and today's bookings
            const [statsData, roomsData, bookingsData] = await Promise.all([
                api.getDashboardStats(),
                api.getRooms(),
                api.getTodayBookings()
            ]);
            setStats(statsData);
            setRooms(roomsData.results);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoomClick = (room: Room) => {
        if (room.current_state === 'AVAILABLE') {
            setSelectedRoom(room);
            setIsQuickBookOpen(true);
        } else {
            setSelectedActionRoom(room);
        }
    };

    const handleQuickBookSubmit = async (data: QuickBookData) => {
        try {
            await api.quickBook(data);
            setIsQuickBookOpen(false);
            fetchData(); // Refresh data to show new status
            toast.success('Check-in successful!');
        } catch (error: any) {
            console.error('Booking failed:', error);
            const msg = error?.message || 'Failed to check-in. Please try again.';
            toast.error(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Role-based rendering
    if (user?.role === 'STAKEHOLDER') {
        return <StakeholderDashboard />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="mb-xs">Welcome back, {user?.first_name || user?.username || 'Staff'}</h1>
                    <p className="text-secondary">Here's what's happening at Mayor K. Palace today.</p>
                </div>
                <div className="flex gap-md">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setSelectedRoom(undefined);
                            setIsQuickBookOpen(true);
                        }}
                    >
                        ⚡ Quick Book
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-md mb-xl">
                <StatCard
                    label="Available Rooms"
                    value={stats?.available_rooms || 0}
                    icon={<BedDouble size={24} />}
                    accent="success"
                    trend={{ value: "12%", direction: "up", label: "vs last week" }} // Mock trend
                />
                <StatCard
                    label="Today's Check-ins"
                    value={stats?.today_bookings || 0}
                    icon={<CalendarDays size={24} />}
                    accent="primary"
                />
                <StatCard
                    label="Today's Revenue"
                    value={`₦${parseFloat(stats?.today_revenue || '0').toLocaleString()}`}
                    icon={<Receipt size={24} />}
                    accent="info"
                    trend={{ value: "5%", direction: "up" }}
                />
                <StatCard
                    label="Dirty Rooms"
                    value={stats?.dirty_rooms || 0}
                    icon={<Users size={24} />} // Using Users as a proxy for housekeeping? Or maybe SprayCan/Trash
                    accent="warning"
                />
            </div>

            <div className="grid grid-cols-3 gap-xl">
                {/* Room Grid Section */}
                <div className="col-span-2 card">
                    <div className="flex justify-between items-center mb-lg">
                        <h3>Rooms Overview</h3>
                        <div className="flex gap-sm">
                            <span className="badge badge-available">{stats?.available_rooms} Available</span>
                            <span className="badge badge-occupied">{stats?.occupied_rooms} Occupied</span>
                            <span className="badge badge-dirty">{stats?.dirty_rooms} Dirty</span>
                        </div>
                    </div>

                    <RoomLegend />
                    <RoomGrid rooms={rooms} onRoomClick={handleRoomClick} />
                </div>

                {/* Today's Activity */}
                <div className="flex flex-col gap-lg">
                    <div className="card">
                        <h3 className="mb-md">Today's Bookings</h3>
                        <div className="flex flex-col gap-md">
                            {bookings.length === 0 ? (
                                <p className="text-secondary text-center py-md text-sm">No bookings for today yet.</p>
                            ) : (
                                bookings.map(booking => (
                                    <div key={booking.id} className="flex justify-between items-center p-sm rounded bg-elevated border hover:border-primary cursor-pointer transition-colors">
                                        <div>
                                            <div className="font-bold text-sm">{booking.guest_name}</div>
                                            <div className="text-xs text-secondary">Room {booking.room_number} • {booking.stay_type_display}</div>
                                        </div>
                                        <div className={`badge badge-${booking.status === 'CHECKED_IN' ? 'occupied' :
                                            booking.status === 'CONFIRMED' ? 'success' : 'pending'
                                            } text-xs`}>
                                            {booking.status_display}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {bookings.length > 0 && (
                            <button className="btn btn-outline w-full mt-md text-sm">View All Bookings</button>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="mb-md">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-sm">
                            <button className="btn btn-outline text-sm justify-center py-sm">📷 Scan ID</button>
                            <button className="btn btn-outline text-sm justify-center py-sm">🧹 Mark Clean</button>
                            <button className="btn btn-outline text-sm justify-center py-sm">🚕 Order Taxi</button>
                            <button className="btn btn-outline text-sm justify-center py-sm">⚠️ Report Issue</button>
                        </div>
                    </div>
                </div>
            </div>

            <RoomActionModal
                isOpen={!!selectedActionRoom}
                onClose={() => setSelectedActionRoom(undefined)}
                room={selectedActionRoom}
                onUpdate={fetchData}
            />

            <QuickBookModal
                isOpen={isQuickBookOpen}
                onClose={() => setIsQuickBookOpen(false)}
                availableRooms={rooms.filter(r => r.current_state === 'AVAILABLE')}
                selectedRoom={selectedRoom}
                onSubmit={handleQuickBookSubmit}
            />
        </div>
    );
}
