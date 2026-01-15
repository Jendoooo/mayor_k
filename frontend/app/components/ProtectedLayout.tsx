'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import api, { WorkShift } from '@/app/lib/api';
import StartShiftModal from '@/app/components/StartShiftModal';
import EndShiftModal from '@/app/components/EndShiftModal';
import { Toaster } from 'react-hot-toast';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Shift State
    const [activeShift, setActiveShift] = useState<WorkShift | null>(null);
    const [loadingShift, setLoadingShift] = useState(true);
    const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);
    const [isEndShiftOpen, setIsEndShiftOpen] = useState(false);

    const fetchShift = async () => {
        if (!user) return;
        try {
            const shift = await api.getCurrentShift();
            setActiveShift(shift);
            // If no shift and user is staff (not Admin/Stakeholder), force start
            if (!shift && user.role !== 'STAKEHOLDER' && user.role !== 'ACCOUNTANT') {
                setIsStartShiftOpen(true);
            } else {
                setIsStartShiftOpen(false);
            }
        } catch (error) {
            console.error("Error fetching shift:", error);
        } finally {
            setLoadingShift(false);
        }
    };

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchShift();
        }
    }, [isLoading, user, router]);

    if (isLoading || (user && loadingShift)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-champagne-gold"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-midnight-blue overflow-hidden text-slate-300">
            <Toaster position="top-right" />

            <Sidebar
                activeShift={activeShift}
                onEndShift={() => setIsEndShiftOpen(true)}
            />

            <main className="flex-1 overflow-y-auto relative ml-64 p-8 bg-midnight-blue custom-scrollbar">
                {/* Background ambient accents for premium feel */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="fixed bottom-0 left-64 w-[500px] h-[500px] bg-champagne-gold/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    {children}
                </div>
            </main>

            {/* Modals */}
            <StartShiftModal
                isOpen={isStartShiftOpen}
                onSuccess={() => {
                    fetchShift();
                    setIsStartShiftOpen(false);
                }}
            />

            {activeShift && (
                <EndShiftModal
                    isOpen={isEndShiftOpen}
                    shift={activeShift}
                    onClose={() => setIsEndShiftOpen(false)}
                    onSuccess={() => {
                        setActiveShift(null);
                        setIsEndShiftOpen(false);
                        setIsStartShiftOpen(true); // Loops back to start default
                        router.push('/dashboard'); // Go home on close
                    }}
                />
            )}
        </div>
    );
}
