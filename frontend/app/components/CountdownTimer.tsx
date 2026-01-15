'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownProps {
    targetDate: string;
    onExpire?: () => void;
}

export default function CountdownTimer({ targetDate, onExpire }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, isOverdue: boolean } | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isOverdue: true });
                if (onExpire) onExpire();
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds, isOverdue: false });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return <span>Loading...</span>;

    if (timeLeft.isOverdue) {
        return (
            <div className="flex items-center gap-1 text-red-400 font-bold animate-pulse text-[10px]">
                <AlertTriangle size={10} />
                <span>OVERDUE</span>
            </div>
        );
    }

    // Color logic
    // < 30 mins: Red/Orange
    // < 1 hour: Yellow
    // > 1 hour: Green
    let colorClass = "text-emerald-400";
    if (timeLeft.hours === 0 && timeLeft.minutes < 30) {
        colorClass = "text-red-400 font-bold";
    } else if (timeLeft.hours === 0) {
        colorClass = "text-amber-400 font-bold";
    }

    return (
        <div className={`flex items-center gap-1 font-mono text-[10px] ${colorClass}`}>
            <Clock size={10} />
            <span>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
            </span>
        </div>
    );
}
