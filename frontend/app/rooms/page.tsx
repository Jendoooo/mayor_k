'use client';

import { useState } from 'react';
import { RoomGrid, RoomLegend } from '@/app/components/RoomCard';
import { Room } from '@/app/lib/api';

// Mock data - same as dashboard
const mockRooms: Room[] = [
    { id: '1', room_number: '101', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '2', room_number: '102', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '3', room_number: '103', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '4', room_number: '104', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '5', room_number: '105', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '6', room_number: '106', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '7', room_number: '107', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '8', room_number: '108', room_type: '1', room_type_name: 'Standard', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '9', room_number: '109', room_type: '2', room_type_name: 'Deluxe', floor: 1, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '10', room_number: '110', room_type: '2', room_type_name: 'Deluxe', floor: 1, current_state: 'MAINTENANCE', state_display: 'Maintenance', notes: 'AC repair', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '11', room_number: '201', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '12', room_number: '202', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '13', room_number: '203', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '14', room_number: '204', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '15', room_number: '205', room_type: '1', room_type_name: 'Standard', floor: 2, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '16', room_number: '206', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '17', room_number: '207', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '18', room_number: '208', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '19', room_number: '209', room_type: '2', room_type_name: 'Deluxe', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '20', room_number: '210', room_type: '3', room_type_name: 'VIP Suite', floor: 2, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
    { id: '21', room_number: '301', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '22', room_number: '302', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '23', room_number: '303', room_type: '1', room_type_name: 'Standard', floor: 3, current_state: 'DIRTY', state_display: 'Dirty', notes: '', is_active: true, is_available: false, overnight_rate: '12000', short_rest_rate: '5000' },
    { id: '24', room_number: '304', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '25', room_number: '305', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '26', room_number: '306', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'OCCUPIED', state_display: 'Occupied', notes: '', is_active: true, is_available: false, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '27', room_number: '307', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '28', room_number: '308', room_type: '2', room_type_name: 'Deluxe', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '18000', short_rest_rate: '8000' },
    { id: '29', room_number: '309', room_type: '3', room_type_name: 'VIP Suite', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
    { id: '30', room_number: '310', room_type: '3', room_type_name: 'VIP Suite', floor: 3, current_state: 'AVAILABLE', state_display: 'Available', notes: '', is_active: true, is_available: true, overnight_rate: '30000', short_rest_rate: '12000' },
];

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>(mockRooms);
    const [filterState, setFilterState] = useState<string>('');
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const filteredRooms = rooms.filter(r => {
        if (filterState && r.current_state !== filterState) return false;
        if (selectedFloor && r.floor !== selectedFloor) return false;
        return true;
    });

    const handleMarkClean = async (room: Room) => {
        // TODO: API call
        setRooms(rooms.map(r =>
            r.id === room.id ? { ...r, current_state: 'AVAILABLE' as const, state_display: 'Available', is_available: true } : r
        ));
        setSelectedRoom(null);
    };

    const handleMarkMaintenance = async (room: Room) => {
        // TODO: API call
        setRooms(rooms.map(r =>
            r.id === room.id ? { ...r, current_state: 'MAINTENANCE' as const, state_display: 'Maintenance', is_available: false } : r
        ));
        setSelectedRoom(null);
    };

    const roomsByFloor = [1, 2, 3].map(floor => ({
        floor,
        rooms: filteredRooms.filter(r => r.floor === floor),
    }));

    const stats = {
        total: rooms.length,
        available: rooms.filter(r => r.current_state === 'AVAILABLE').length,
        occupied: rooms.filter(r => r.current_state === 'OCCUPIED').length,
        dirty: rooms.filter(r => r.current_state === 'DIRTY').length,
        maintenance: rooms.filter(r => r.current_state === 'MAINTENANCE').length,
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Rooms</h1>
                    <p className="text-secondary">Manage room status and availability</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="flex gap-md items-center">
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>Filter:</span>

                    {/* State Filter */}
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                    >
                        <option value="">All States</option>
                        <option value="AVAILABLE">Available ({stats.available})</option>
                        <option value="OCCUPIED">Occupied ({stats.occupied})</option>
                        <option value="DIRTY">Dirty ({stats.dirty})</option>
                        <option value="MAINTENANCE">Maintenance ({stats.maintenance})</option>
                    </select>

                    {/* Floor Filter */}
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={selectedFloor || ''}
                        onChange={(e) => setSelectedFloor(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">All Floors</option>
                        <option value="1">Floor 1</option>
                        <option value="2">Floor 2</option>
                        <option value="3">Floor 3</option>
                    </select>

                    <div style={{ marginLeft: 'auto' }}>
                        <RoomLegend />
                    </div>
                </div>
            </div>

            {/* Rooms by Floor */}
            {roomsByFloor.map(({ floor, rooms: floorRooms }) => (
                floorRooms.length > 0 && (
                    <div key={floor} className="card mb-lg">
                        <div className="card-header">
                            <h3 className="card-title">Floor {floor}</h3>
                            <span className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                                {floorRooms.length} rooms
                            </span>
                        </div>
                        <RoomGrid
                            rooms={floorRooms}
                            onRoomClick={(room) => setSelectedRoom(room)}
                        />
                    </div>
                )
            ))}

            {/* Room Detail Modal */}
            {selectedRoom && (
                <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Room {selectedRoom.room_number}</h2>
                            <button className="modal-close" onClick={() => setSelectedRoom(null)}>×</button>
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="grid grid-cols-2 gap-md">
                                <div>
                                    <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Type</div>
                                    <div style={{ fontWeight: 500 }}>{selectedRoom.room_type_name}</div>
                                </div>
                                <div>
                                    <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Floor</div>
                                    <div style={{ fontWeight: 500 }}>Floor {selectedRoom.floor}</div>
                                </div>
                                <div>
                                    <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Status</div>
                                    <span className={`badge badge-${selectedRoom.current_state.toLowerCase()}`}>
                                        {selectedRoom.state_display}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-secondary" style={{ fontSize: 'var(--text-sm)' }}>Rate</div>
                                    <div style={{ fontWeight: 500 }}>₦{parseFloat(selectedRoom.overnight_rate || '0').toLocaleString()}/night</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions based on state */}
                        <div className="flex flex-col gap-md">
                            {selectedRoom.current_state === 'DIRTY' && (
                                <button
                                    className="btn btn-success w-full"
                                    onClick={() => handleMarkClean(selectedRoom)}
                                >
                                    ✓ Mark as Clean
                                </button>
                            )}
                            {selectedRoom.current_state === 'AVAILABLE' && (
                                <>
                                    <button className="btn btn-primary w-full">
                                        ⚡ Quick Book This Room
                                    </button>
                                    <button
                                        className="btn btn-outline w-full"
                                        onClick={() => handleMarkMaintenance(selectedRoom)}
                                    >
                                        🔧 Mark Under Maintenance
                                    </button>
                                </>
                            )}
                            {selectedRoom.current_state === 'MAINTENANCE' && (
                                <button
                                    className="btn btn-success w-full"
                                    onClick={() => handleMarkClean(selectedRoom)}
                                >
                                    ✓ Mark as Available
                                </button>
                            )}
                            {selectedRoom.current_state === 'OCCUPIED' && (
                                <button className="btn btn-warning w-full">
                                    🚪 View Booking Details
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
