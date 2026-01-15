'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/app/components/StatCard';
import RoomCard, { RoomGrid, RoomLegend } from '@/app/components/RoomCard';
import QuickBookModal from '@/app/components/QuickBookModal';
import RoomActionModal from '@/app/components/RoomActionModal';
import api, { DashboardStats, Room, Booking, QuickBookData } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import StakeholderDashboard from '@/app/components/StakeholderDashboard';
import { BedDouble, CalendarDays, Receipt, Users, Camera, Sparkles, Car, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-champagne-gold border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Role-based rendering
    if (user?.role === 'STAKEHOLDER') {
        return <StakeholderDashboard />;
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2">Welcome Back, {user?.first_name || user?.username}</h1>
                    <p className="text-slate-400">Here's what's happening at Mayor K. Palace today.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedRoom(undefined);
                        setIsQuickBookOpen(true);
                    }}
                    className="bg-button-gradient hover:bg-champagne-gold text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-champagne-gold/20 transition-all font-bold tracking-wide flex items-center gap-2"
                >
                    <Activity size={18} /> Quick Check-In
                </button>
            </header>

            {/* Alert Dashboard Widget */}
            {stats?.alerts && stats.alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-900/40 to-red-600/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] translate-x-10 -translate-y-10"></div>
                    <div className="flex items-center gap-3 mb-4 text-red-200 font-bold">
                        <AlertTriangle size={20} className="animate-pulse" />
                        <span>Attention Required ({stats.alerts.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {stats.alerts.map((alert, idx) => (
                            <a
                                key={idx}
                                href={alert.link || '#'}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${alert.severity === 'high' ? 'bg-red-500/20 border-red-500/40 text-red-100 hover:bg-red-500/30' :
                                        alert.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-100 hover:bg-yellow-500/30' :
                                            'bg-blue-500/20 border-blue-500/40 text-blue-100 hover:bg-blue-500/30'
                                    }`}
                            >
                                <span className="font-medium text-sm">{alert.message}</span>
                                <ArrowRight size={14} className="opacity-70" />
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Available Rooms"
                    value={stats?.available_rooms || 0}
                    icon={<BedDouble size={20} />}
                    accent="success"
                    trend={{ value: `${stats?.occupancy_rate}%`, label: "Occupancy" }}
                />
                <StatCard
                    label="Today's Check-ins"
                    value={stats?.today_bookings || 0}
                    icon={<CalendarDays size={20} />}
                    accent="primary"
                />
                <StatCard
                    label="Today's Revenue"
                    value={`₦${parseFloat(stats?.today_revenue || '0').toLocaleString()}`}
                    icon={<Receipt size={20} />}
                    accent="warning"
                />
                <StatCard
                    label="Dirty Rooms"
                    value={stats?.dirty_rooms || 0}
                    icon={<Sparkles size={20} />}
                    accent="danger"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Room Grid Section */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h3 className="text-xl font-bold text-white font-serif">Front Desk Overview</h3>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">{stats?.available_rooms} Available</span>
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">{stats?.occupied_rooms} Occupied</span>
                                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">{stats?.dirty_rooms} Dirty</span>
                            </div>
                        </div>

                        <RoomLegend />
                        <div className="mt-6">
                            <RoomGrid rooms={rooms} onRoomClick={handleRoomClick} />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column: Today's Activity & Quick Actions */}
                <div className="space-y-6">

                    {/* Today's Activity */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 font-serif flex items-center gap-2">
                            <CalendarDays size={18} className="text-champagne-gold" /> Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {bookings.length === 0 ? (
                                <p className="text-slate-500 text-center py-8 text-sm italic">No check-ins today.</p>
                            ) : (
                                bookings.slice(0, 5).map(booking => (
                                    <div key={booking.id} className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
                                                {booking.room_number}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200 text-sm">{booking.guest_name}</div>
                                                <div className="text-xs text-slate-500">{booking.stay_type_display}</div>
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${booking.status === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-300' :
                                                booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-300' :
                                                    'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {booking.status_display}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {bookings.length > 5 && (
                            <button className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest border-t border-white/10">View All</button>
                        )}
                    </div>

                    {/* Quick Services */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6 font-serif flex items-center gap-2">
                            <Sparkles size={18} className="text-champagne-gold" /> Concierge
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-champagne-gold/20 border border-white/10 hover:border-champagne-gold/50 transition-all group">
                                <Camera size={24} className="text-slate-400 group-hover:text-champagne-gold transition-colors" />
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Scan ID</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-champagne-gold/20 border border-white/10 hover:border-champagne-gold/50 transition-all group">
                                <Sparkles size={24} className="text-slate-400 group-hover:text-champagne-gold transition-colors" />
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Housekeeping</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-champagne-gold/20 border border-white/10 hover:border-champagne-gold/50 transition-all group">
                                <Car size={24} className="text-slate-400 group-hover:text-champagne-gold transition-colors" />
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Taxi</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-champagne-gold/20 border border-white/10 hover:border-champagne-gold/50 transition-all group">
                                <AlertTriangle size={24} className="text-slate-400 group-hover:text-champagne-gold transition-colors" />
                                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Report</span>
                            </button>
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
