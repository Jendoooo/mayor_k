'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PublicNavbar from '@/app/components/PublicNavbar';

function RoomSelection() {
    const searchParams = useSearchParams();
    const preSelectedType = searchParams.get('type');

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
            <PublicNavbar />

            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '120px var(--space-lg) 80px'
            }}>
                <h1 className="text-center mb-md">Select Your Stay</h1>
                <p className="text-center text-secondary mb-xl">Choose standard or short rest booking</p>

                {/* Room Type Card */}
                {[
                    { id: 'standard', name: 'Standard Room', price: 12000, short: 5000, features: ['AC', 'Queen Bed', 'Shower'] },
                    { id: 'deluxe', name: 'Deluxe Room', price: 18000, short: 8000, features: ['AC', 'King Bed', 'Shower', 'Work Desk', 'Fridge'] },
                    { id: 'vip', name: 'VIP Suite', price: 30000, short: 12000, features: ['AC', 'King Bed', 'Bathtub', 'Living Area', 'Smart TV', 'Fridge'] }
                ].map((room) => (
                    <div
                        key={room.id}
                        className={`card mb-lg ${preSelectedType === room.id ? 'border-primary' : ''}`}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 200px',
                            gap: 'var(--space-lg)',
                            alignItems: 'center',
                            border: preSelectedType === room.id ? '2px solid var(--color-primary)' : undefined
                        }}
                    >
                        <div>
                            <h3 className="mb-sm">{room.name}</h3>
                            <div className="flex gap-sm mb-md flex-wrap">
                                {room.features.map(f => (
                                    <span key={f} className="badge badge-unavailable" style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}>
                                        {f}
                                    </span>
                                ))}
                            </div>
                            <p className="text-secondary text-sm">
                                Spacious room designed for comfort and relaxation. Includes complimentary breakfast for overnight stays.
                            </p>
                        </div>

                        <div className="flex flex-col gap-md">
                            <Link
                                href={`/book/checkout?type=${room.id}&stay=overnight`}
                                className="btn btn-primary w-full justify-between"
                            >
                                <span>Overnight</span>
                                <span>₦{room.price.toLocaleString()}</span>
                            </Link>
                            <Link
                                href={`/book/checkout?type=${room.id}&stay=short`}
                                className="btn btn-outline w-full justify-between"
                            >
                                <span>Short Rest</span>
                                <span>₦{room.short.toLocaleString()}</span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function BookPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RoomSelection />
        </Suspense>
    );
}
