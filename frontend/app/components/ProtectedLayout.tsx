'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/app/components/Sidebar';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-midnight-blue overflow-hidden text-slate-300">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative ml-64 p-8 bg-midnight-blue custom-scrollbar">
                {/* Background ambient accents for premium feel */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="fixed bottom-0 left-64 w-[500px] h-[500px] bg-champagne-gold/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
