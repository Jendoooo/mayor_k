'use client';

import { motion } from 'framer-motion';
import BookingWidget from './BookingWidget';
import Image from 'next/image';

// Use the generated image or a placeholder if not yet available
// For now, I will use a placeholder path, and we can swap it with the generated one.
// Assuming the generated image will be moved to public folder by the user or I can serve it.
// Actually, I can't serve from brain. I'll use a placeholder URL for valid Next.js Image or I need to instruct user to move it.
// I'll stick to a solid color/gradient fallback for now if no image, but try to structure it for image.

export default function HeroSection() {
    return (
        <section className="relative h-screen min-h-[600px] flex flex-col justify-end pb-20 overflow-hidden">
            {/* Background Image with Zoom Effect */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "easeOut" }}
            >
                {/* 
                  Ideally, this should be the generated image. 
                  Since I cannot move files to 'public' easily without 'run_command' (no move command in write_to_file), 
                  I will use a high-quality Unsplash URL as a robust placeholder that works immediately.
                */}
                <Image
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Hotel Exterior"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center mb-12">
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-champagne-gold text-sm md:text-base tracking-[0.3em] uppercase font-bold mb-4"
                >
                    Welcome to Mayor K. Guest Palace
                </motion.p>

                <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight"
                >
                    Experience Luxury <br />
                    <span className="italic font-light text-white/90">in the Heart of Epe</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-slate-300 max-w-xl mx-auto text-lg mb-8 font-light"
                >
                    Where international standards meet Nigerian hospitality.
                    Unwind in serenity and style.
                </motion.p>
            </div>

            {/* Booking Widget */}
            <BookingWidget />
        </section>
    );
}
