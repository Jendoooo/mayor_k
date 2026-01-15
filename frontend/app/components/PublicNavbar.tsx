'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PublicNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav style={{
            background: 'rgba(10, 15, 26, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--color-border)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
        }}>
            <div className="flex justify-between items-center" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'var(--space-md) var(--space-lg)',
            }}>
                {/* Logo */}
                <Link href="/" className="flex items-center gap-md">
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: 'white',
                    }}>
                        MK
                    </div>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Guest Palace</span>
                </Link>

                {/* Desktop Links */}
                <div className="flex gap-lg items-center" style={{ display: 'none' }} id="desktop-menu">
                    <Link href="#rooms" className="text-secondary hover:text-white transition">Rooms</Link>
                    <Link href="#amenities" className="text-secondary hover:text-white transition">Amenities</Link>
                    <Link href="#contact" className="text-secondary hover:text-white transition">Contact</Link>
                    <Link href="/book" className="btn btn-primary">
                        Book Now
                    </Link>
                </div>
            </div>
        </nav>
    );
}
