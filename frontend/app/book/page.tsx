'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import api from '@/app/lib/api';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

function PublicBookingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [checkIn, setCheckIn] = useState(searchParams.get('in') || '');
    const [checkOut, setCheckOut] = useState(searchParams.get('out') || '');
    const [guests, setGuests] = useState(searchParams.get('guests') || '1');

    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (checkIn && checkOut) {
            fetchAvailability();
        }
    }, [checkIn, checkOut]);

    const fetchAvailability = async () => {
        setLoading(true);
        try {
            const availableRooms = await api.getAvailableRooms(checkIn, checkOut);
            setRooms(availableRooms);
        } catch (error) {
            console.error(error);
            toast.error("Could not fetch rooms. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-white pt-24 pb-20">
            <div className="container mx-auto px-4">
                {/* Search Bar */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-12 flex flex-col md:flex-row gap-4 items-end border border-slate-100">
                    <div className="w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none" />
                    </div>
                    <div className="w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guests</label>
                        <select value={guests} onChange={e => setGuests(e.target.value)} className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none">
                            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Guests</option>)}
                        </select>
                    </div>
                    <button
                        onClick={fetchAvailability}
                        className="w-full md:w-auto bg-midnight-blue text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                        Update
                    </button>
                </div>

                <div className="mb-8">
                    <h1 className="font-serif text-3xl md:text-4xl text-midnight-blue mb-2">Select Your Sanctuary</h1>
                    <p className="text-slate-500">{loading ? 'Searching availability...' : `${rooms.length} Rooms Available for your dates`}</p>
                </div>

                {/* Room Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group border border-slate-100"
                            >
                                <div className="h-64 bg-slate-200 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-midnight-blue/10 group-hover:bg-midnight-blue/0 transition-colors" />
                                    <img
                                        src={`https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80`}
                                        alt={room.room_number}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider text-midnight-blue rounded-sm">
                                        {room.room_type_name}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-serif text-xl text-midnight-blue mb-1">{room.room_type_name}</h3>
                                            <span className="text-xs text-slate-400">Room {room.room_number} • Floor {room.floor}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-lg font-bold text-champagne-gold">₦{parseFloat(room.price).toLocaleString()}</span>
                                            <span className="text-xs text-slate-400">/ night</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 text-sm text-slate-500">
                                        <div className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Free Cancellation</div>
                                        <div className="flex items-center gap-2"><Check size={14} className="text-green-500" /> Breakfast Included</div>
                                        <div className="flex items-center gap-2"><Check size={14} className="text-green-500" /> {room.room_type_name} Amenities</div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/book/checkout?room=${room.id}&checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`)}
                                        className="w-full border border-midnight-blue text-midnight-blue py-3 uppercase tracking-widest text-xs font-bold hover:bg-midnight-blue hover:text-white transition-colors flex items-center justify-center gap-2 group-hover:gap-3"
                                    >
                                        Book This Room <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="font-serif text-2xl text-midnight-blue mb-2">No Rooms Available</h3>
                        <p className="text-slate-500">Please try adjusting your dates or contact us directly.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PublicBookingPage() {
    return (
        <main>
            <Navbar />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-warm-white">Loading...</div>}>
                <PublicBookingContent />
            </Suspense>
        </main>
    )
}
