'use client';

import * as React from 'react';
import { Room } from '@/app/lib/api';
import { User, ShieldAlert, Sparkles, Wrench, ClockAlert, Check, X } from 'lucide-react';

interface RoomCardProps {
    room: Room;
    onClick?: (room: Room) => void;
}

const typeAbbreviations: Record<string, string> = {
    'Standard': 'STD',
    'Deluxe': 'DLX',
    'VIP Suite': 'VIP',
    'Executive': 'EXEC',
};

export default function RoomCard({ room, onClick }: RoomCardProps) {
    const typeAbbr = typeAbbreviations[room.room_type_name] || room.room_type_name.slice(0, 4).toUpperCase();

    // Timer Logic
    const [timeLeft, setTimeLeft] = React.useState<string>('');
    const [isOverdue, setIsOverdue] = React.useState(false);

    React.useEffect(() => {
        if (room.current_state !== 'OCCUPIED' || !room.booking_stay_info) {
            setTimeLeft('');
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(room.booking_stay_info!.expected_checkout);
            const diff = end.getTime() - now.getTime();
            const absDiff = Math.abs(diff);

            const hours = Math.floor(absDiff / (1000 * 60 * 60));
            const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

            if (diff < 0) {
                setIsOverdue(true);
                setTimeLeft(`-${hours}h ${minutes}m`);
            } else {
                setIsOverdue(false);
                setTimeLeft(`${hours}h ${minutes}m`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [room]);

    // Styles Configuration
    const getStyles = () => {
        switch (room.current_state) {
            case 'AVAILABLE':
                return {
                    wrap: 'bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-400/50',
                    dot: 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]',
                    icon: null
                };
            case 'OCCUPIED':
                return {
                    wrap: 'bg-blue-600/10 border-blue-500/30 text-blue-300 hover:bg-blue-600/20 hover:border-blue-400/50',
                    dot: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]',
                    icon: <User size={14} className="text-blue-400" />
                };
            case 'DIRTY':
                return {
                    wrap: 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-400/50',
                    dot: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
                    icon: <Sparkles size={14} className="text-red-400" />
                };
            case 'MAINTENANCE':
                return {
                    wrap: 'bg-slate-500/10 border-slate-500/30 text-slate-400 hover:bg-slate-500/20 hover:border-slate-400/50',
                    dot: 'bg-slate-500',
                    icon: <Wrench size={14} className="text-slate-400" />
                };
            default:
                return { wrap: 'bg-slate-800/50 border-white/10 text-white', dot: 'bg-white', icon: null };
        }
    };

    const styles = getStyles();

    return (
        <div
            className={`relative rounded-xl border p-3 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl aspect-square flex flex-col items-center justify-center gap-1 ${styles.wrap} ${isOverdue ? 'animate-pulse ring-2 ring-red-500/50' : ''}`}
            onClick={() => onClick?.(room)}
        >
            {/* Top Bar: Icon + Timer */}
            <div className="absolute top-2 left-2 flex items-center justify-between w-full pr-4 opacity-70">
                {styles.icon && <div>{styles.icon}</div>}

                {room.current_state === 'OCCUPIED' && timeLeft && (
                    <div className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ml-auto ${isOverdue ? 'bg-red-500 text-white' : 'bg-black/30'}`}>
                        {isOverdue && <ClockAlert size={8} />}
                        {timeLeft}
                    </div>
                )}
            </div>

            {/* Room Number */}
            <div className="text-2xl font-bold font-serif tabular-nums tracking-tight">
                {room.room_number}
            </div>

            {/* Status Dot */}
            <div className={`w-1.5 h-1.5 rounded-full mb-1 ${styles.dot}`}></div>

            {/* Bottom Info: Type/Guest */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-center opacity-80 mt-1 max-w-full truncate px-1">
                {room.current_state === 'OCCUPIED' && room.booking_stay_info ? (
                    <span className="truncate">{room.booking_stay_info.guest_name.split(' ')[0]}</span>
                ) : (
                    <span className="truncate">{typeAbbr}</span>
                )}
            </div>
            {room.current_state === 'OCCUPIED' && (
                <div className="text-[8px] opacity-50 uppercase tracking-widest mt-0.5">
                    {room.booking_stay_info?.stay_type === 'SHORT_REST' ? 'Short' : 'Night'}
                </div>
            )}
        </div>
    );
}

// Room Grid Component
interface RoomGridProps {
    rooms: Room[];
    onRoomClick?: (room: Room) => void;
    filterState?: string;
}

export function RoomGrid({ rooms, onRoomClick, filterState }: RoomGridProps) {
    const filteredRooms = filterState
        ? rooms.filter(r => r.current_state === filterState)
        : rooms;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onClick={() => onRoomClick?.(room)} />
            ))}
        </div>
    );
}

// Room Legend
export function RoomLegend() {
    return (
        <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Available</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dirty</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Maint.</span>
            </div>
        </div>
    );
}
