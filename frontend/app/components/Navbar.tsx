'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-midnight-blue/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="relative z-50">
                    <div className="flex flex-col items-center">
                        <span className={`font-serif text-2xl md:text-3xl font-bold tracking-widest ${isScrolled ? 'text-white' : 'text-white'
                            }`}>
                            MAYOR K.
                        </span>
                        <span className="text-[0.6rem] uppercase tracking-[0.4em] text-champagne-gold">Guest Palace</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {['Accommodations', 'Dining', 'Experiences', 'Offers'].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm uppercase tracking-widest font-bold text-white/80 hover:text-champagne-gold transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                    <Link
                        href="/bookings/new"
                        className="bg-champagne-gold text-white px-6 py-2 text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-midnight-blue transition-all duration-300"
                    >
                        Book Now
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white z-50 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-0 left-0 right-0 bg-midnight-blue p-8 pt-24 pb-8 border-b border-white/10 md:hidden flex flex-col gap-6 items-center shadow-2xl"
                        >
                            {['Accommodations', 'Dining', 'Experiences', 'Offers'].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg uppercase tracking-widest font-bold text-white/80 hover:text-champagne-gold transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                            <Link
                                href="/bookings/new"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full text-center bg-champagne-gold text-white px-6 py-3 text-sm uppercase tracking-widest font-bold"
                            >
                                Book Now
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
