'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicNavbar from '@/app/components/PublicNavbar';

function CheckoutForm() {
    const searchParams = useSearchParams();
    const roomType = searchParams.get('type') || 'standard';
    const stayType = searchParams.get('stay') || 'overnight';

    const roomNames: any = { standard: 'Standard Room', deluxe: 'Deluxe Room', vip: 'VIP Suite' };
    const prices: any = {
        standard: { overnight: 12000, short: 5000 },
        deluxe: { overnight: 18000, short: 8000 },
        vip: { overnight: 30000, short: 12000 }
    };

    const price = prices[roomType]?.[stayType] || 0;
    const roomName = roomNames[roomType] || 'Room';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        notes: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Payment integration coming next! This would open Paystack.');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            <PublicNavbar />

            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '120px var(--space-lg) 80px'
            }}>
                <Link href="/book" className="text-secondary text-sm mb-md inline-block">← Back to Rooms</Link>
                <h1 className="mb-lg">Complete Your Booking</h1>

                <div className="card mb-lg">
                    <div className="flex justify-between items-center mb-md pb-md border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div>
                            <h3>{roomName}</h3>
                            <p className="text-secondary text-sm capitalize">{stayType} Stay</p>
                        </div>
                        <div className="text-xl font-bold">₦{price.toLocaleString()}</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                required
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                required
                                type="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input
                                required
                                type="tel"
                                className="form-input"
                                placeholder="08012345678"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Check-in Date</label>
                            <input
                                required
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="btn btn-success w-full btn-lg mt-md">
                            Pay ₦{price.toLocaleString()} Now
                        </button>
                        <p className="text-center text-xs text-secondary mt-sm">
                            Secured by Paystack
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutForm />
        </Suspense>
    );
}
