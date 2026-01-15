'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicNavbar from '@/app/components/PublicNavbar';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';

function CheckoutForm() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room');
    const checkInParam = searchParams.get('checkin') || '';
    const checkOutParam = searchParams.get('checkout') || '';
    const guestsParam = searchParams.get('guests') || '1';

    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: checkInParam,
        checkOut: checkOutParam,
        guests: guestsParam,
        notes: ''
    });

    useEffect(() => {
        if (roomId) {
            fetchRoomDetails();
        }
    }, [roomId]);

    const fetchRoomDetails = async () => {
        try {
            const data = await api.getRoom(roomId!);
            setRoom(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load room details.");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!room || !formData.checkIn || !formData.checkOut) return 0;
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        return (nights > 0 ? nights : 1) * parseFloat(room.price || room.room_type.base_rate_overnight);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would create a Pending Booking and initialize Paystack
        toast.success(`Processing payment of ₦${calculateTotal().toLocaleString()}...`);
        // For now, simulate success
        setTimeout(() => alert("Payment logic integration coming next! This would open Paystack."), 1000);
    };

    if (loading) return <div className="min-h-screen bg-warm-white flex items-center justify-center">Loading booking details...</div>;
    if (!room) return <div className="min-h-screen bg-warm-white flex items-center justify-center">Room not found.</div>;

    const total = calculateTotal();

    return (
        <div className="min-h-screen bg-warm-white pb-20">
            {/* We use PublicNavbar if available, or just a header */}
            <div className="bg-midnight-blue text-white py-4 px-6 mb-8">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="font-serif text-xl font-bold">Mayor K.</Link>
                    <Link href="/book" className="text-sm hover:text-champagne-gold transition-colors">Back to Rooms</Link>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="font-serif text-3xl text-midnight-blue mb-8">Complete Your Reservation</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Booking Summary */}
                    <div className="md:col-span-1 order-2 md:order-1">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 sticky top-8 text-slate-800">
                            <h3 className="font-bold text-lg mb-4 text-midnight-blue">Booking Summary</h3>

                            <div className="mb-4">
                                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Room</span>
                                <p className="font-serif text-xl text-midnight-blue font-bold">{room.room_type_name || room.room_type?.name}</p>
                                <p className="text-sm text-slate-600">Room {room.room_number}</p>
                            </div>

                            <div className="border-t border-slate-100 my-4 pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Check In</span>
                                    <span className="font-medium text-slate-900">{formData.checkIn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Check Out</span>
                                    <span className="font-medium text-slate-900">{formData.checkOut}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Guests</span>
                                    <span className="font-medium text-slate-900">{formData.guests}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-100 my-4 pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-500 font-bold">Total Due</span>
                                    <span className="text-2xl font-bold text-champagne-gold">₦{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Guest Details Form */}
                    <div className="md:col-span-2 order-1 md:order-2">
                        <div className="bg-white p-8 rounded-lg shadow-md border border-slate-100 text-slate-800">
                            <h3 className="font-bold text-lg mb-6 text-midnight-blue">Guest Information</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors text-slate-900 bg-transparent"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors text-slate-900 bg-transparent"
                                            placeholder="08012345678"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors text-slate-900 bg-transparent"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors text-slate-900 bg-transparent"
                                            value={formData.checkIn}
                                            onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors text-slate-900 bg-transparent"
                                            value={formData.checkOut}
                                            onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Special Requests (Optional)</label>
                                    <textarea
                                        className="w-full border-b-2 border-slate-200 py-2 focus:border-champagne-gold outline-none transition-colors min-h-[100px] text-slate-900 bg-transparent"
                                        placeholder="Late check-in, extra pillows, etc."
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 mt-4">
                                    Pay ₦{total.toLocaleString()} Now
                                </button>
                                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Secured by Paystack
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-warm-white flex items-center justify-center">Loading...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
