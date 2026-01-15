'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Wifi, Tv, Coffee, Wind } from 'lucide-react';

interface Room {
    id: number;
    title: string;
    description: string;
    price: string;
    image: string;
}

const rooms: Room[] = [
    {
        id: 1,
        title: "Standard Executive",
        description: "Perfect for business travelers, featuring a dedicated workspace and premium bedding.",
        price: "₦35,000",
        image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Royal Suite",
        description: "Expansive luxury with a separate living area, king-sized bed, and panoramic views.",
        price: "₦65,000",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Diplomatic Lodge",
        description: "Our finest accommodation, offering unparalleled privacy, comfort, and exclusive amenities.",
        price: "₦95,000",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"
    }
];

export default function RoomHighlight() {
    return (
        <section className="py-24 bg-white text-slate-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-champagne-gold uppercase tracking-widest text-sm font-bold">Accommodations</span>
                    <h2 className="font-serif text-4xl md:text-5xl mt-3 text-midnight-blue">Stay in Comfort</h2>
                    <div className="w-24 h-1 bg-champagne-gold mx-auto mt-6"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {rooms.map((room, index) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="group cursor-pointer"
                        >
                            <div className="relative h-80 overflow-hidden mb-6 rounded-sm">
                                <Image
                                    src={room.image}
                                    alt={room.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                            </div>

                            <h3 className="font-serif text-2xl text-midnight-blue mb-2 group-hover:text-champagne-gold transition-colors">{room.title}</h3>
                            <p className="text-slate-500 mb-4 line-clamp-2">{room.description}</p>

                            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                                <span className="font-bold text-midnight-blue">{room.price} <span className="text-xs font-normal text-slate-400">/ night</span></span>
                                <span className="text-xs uppercase tracking-wider font-bold text-champagne-gold group-hover:translate-x-1 transition-transform">View Details →</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
