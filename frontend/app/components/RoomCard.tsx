'use client';

import { Room } from '@/app/lib/api';
import { User, ShieldAlert, Sparkles, Wrench } from 'lucide-react';

interface RoomCardProps {
    room: Room;
    onClick?: (room: Room) => void;
}

const stateClasses: Record<string, string> = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    DIRTY: 'dirty',
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance',
};

// Map room types to short codes if needed, or use full names
const typeAbbreviations: Record<string, string> = {
    'Standard': 'STD',
    'Deluxe': 'DLX',
    'VIP Suite': 'VIP',
    'Executive': 'EXEC',
};

export default function RoomCard({ room, onClick }: RoomCardProps) {
    const stateClass = stateClasses[room.current_state] || 'available';
    const typeAbbr = typeAbbreviations[room.room_type_name] || room.room_type_name.slice(0, 4).toUpperCase();

    // Determine icon based on state
    const StatusIcon = () => {
        if (room.current_state === 'OCCUPIED') return <User size={16} className="text-warning opacity-50" />;
        if (room.current_state === 'DIRTY') return <Sparkles size={16} className="text-danger opacity-50" />;
        if (room.current_state === 'MAINTENANCE') return <Wrench size={16} className="text-maintenance opacity-50" />;
        return null;
    };

    return (
        <div
            className={`room-card ${stateClass}`}
            onClick={() => onClick?.(room)}
            role="button"
            tabIndex={0}
            title={`${room.room_number} - ${room.room_type_name} (${room.state_display})`}
        >
            <div className="flex flex-col items-center justify-center relative w-full h-full">
                {/* Status Dot */}
                <div className="room-status-dot"></div>

                {/* Optional: Icon indicator in top-left */}
                <div className="absolute top-2 left-2">
                    <StatusIcon />
                </div>

                <div className="room-number mb-1">{room.room_number}</div>
                <div className="room-type px-2 py-0.5 rounded bg-black/20 text-[10px] tracking-wider font-medium">
                    {typeAbbr}
                </div>
            </div>
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
        <div className="room-grid">
            {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onClick={() => onRoomClick?.(room)} />
            ))}
        </div>
    );
}

// Room Legend
export function RoomLegend() {
    const statuses = [
        { label: 'Available', class: 'available' },
        { label: 'Occupied', class: 'occupied' },
        { label: 'Dirty', class: 'dirty' },
        { label: 'Maintenance', class: 'maintenance' },
    ];

    return (
        <div className="flex flex-wrap gap-md mb-lg p-sm bg-bg-secondary rounded-lg border border-border">
            {statuses.map((status) => (
                <div key={status.class} className="flex items-center gap-sm">
                    <div
                        className={`w-3 h-3 rounded-full bg-${status.class === 'dirty' ? 'danger' : status.class === 'occupied' ? 'warning' : status.class === 'maintenance' ? 'maintenance' : 'success'}`}
                        style={{
                            backgroundColor: `var(--status-${status.class})`,
                            boxShadow: `0 0 8px var(--status-${status.class})`
                        }}
                    />
                    <span className="text-sm text-secondary font-medium">
                        {status.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
