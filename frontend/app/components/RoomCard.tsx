'use client';

import { Room } from '@/app/lib/api';

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

const typeAbbreviations: Record<string, string> = {
    'Standard': 'STD',
    'Deluxe': 'DLX',
    'VIP Suite': 'VIP',
};

export default function RoomCard({ room, onClick }: RoomCardProps) {
    const stateClass = stateClasses[room.current_state] || 'available';
    const typeAbbr = typeAbbreviations[room.room_type_name] || room.room_type_name.slice(0, 3).toUpperCase();

    return (
        <div
            className={`room-card ${stateClass}`}
            onClick={() => onClick?.(room)}
            title={`${room.room_number} - ${room.room_type_name} (${room.state_display})`}
        >
            <div className="room-status-dot"></div>
            <div className="room-number">{room.room_number}</div>
            <div className="room-type">{typeAbbr}</div>
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
                <RoomCard key={room.id} room={room} onClick={onRoomClick} />
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
        <div className="flex gap-lg" style={{ marginBottom: 'var(--space-lg)' }}>
            {statuses.map((status) => (
                <div key={status.class} className="flex items-center gap-sm">
                    <div
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: `var(--status-${status.class})`,
                        }}
                    />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                        {status.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
