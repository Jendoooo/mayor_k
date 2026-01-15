'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookingWidget() {
    const router = useRouter();
    const [guests, setGuests] = useState(1);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');

    const handleSearch = () => {
        router.push(`/bookings/new?guests=${guests}&in=${checkIn}&out=${checkOut}`);
    };

    return (
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="w-full max-w-5xl mx-auto -mt-16 relative z-30 px-4"
        >
            <div className="bg-white rounded-t-lg shadow-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-4 items-end">

                {/* Check In */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In</label>
                    <div className="relative group">
                        <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-champagne-gold group-hover:text-blue-900 transition-colors" size={20} />
                        <input
                            type="date"
                            className="w-full pl-8 py-2 border-b-2 border-slate-200 outline-none focus:border-champagne-gold text-slate-900 font-medium bg-transparent transition-colors"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                        />
                    </div>
                </div>

                {/* Check Out */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out</label>
                    <div className="relative group">
                        <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-champagne-gold group-hover:text-blue-900 transition-colors" size={20} />
                        <input
                            type="date"
                            className="w-full pl-8 py-2 border-b-2 border-slate-200 outline-none focus:border-champagne-gold text-slate-900 font-medium bg-transparent transition-colors"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                        />
                    </div>
                </div>

                {/* Guests */}
                <div className="w-full md:w-1/4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Guests</label>
                    <div className="relative group">
                        <Users className="absolute left-0 top-1/2 -translate-y-1/2 text-champagne-gold group-hover:text-blue-900 transition-colors" size={20} />
                        <select
                            className="w-full pl-8 py-2 border-b-2 border-slate-200 outline-none focus:border-champagne-gold text-slate-900 font-medium bg-transparent appearance-none cursor-pointer"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="w-full md:w-1/4 bg-champagne-gold hover:bg-yellow-600 text-white font-serif font-bold py-4 px-6 rounded-none uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl translate-y-2 hover:-translate-y-0"
                >
                    Check Availability
                </button>
            </div>
        </motion.div>
    );
}
