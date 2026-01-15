'use client';

import { useState, useEffect } from 'react';
import { RoomGrid, RoomLegend } from '@/app/components/RoomCard';
import QuickBookModal from '@/app/components/QuickBookModal';
import api, { Room, QuickBookData } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterState, setFilterState] = useState<string>('');
    const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const response = await api.getRooms();
            setRooms(response.results);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRooms = rooms.filter(r => {
        if (filterState && r.current_state !== filterState) return false;
        if (selectedFloor && r.floor !== selectedFloor) return false;
        return true;
    });

    const handleMarkClean = async (room: Room) => {
        if (!confirm(`Mark Room ${room.room_number} as clean?`)) return;
        try {
            await api.markRoomClean(room.id);
            fetchRooms(); // Refresh to show new state
            setSelectedRoom(null);
        } catch (error) {
            console.error('Failed to mark clean:', error);
            alert('Failed to update room status');
        }
    };

    const handleMarkMaintenance = async (room: Room) => {
        const notes = prompt('Enter maintenance notes (reason):');
        if (notes === null) return; // Cancelled

        try {
            await api.markRoomMaintenance(room.id, notes);
            fetchRooms();
            setSelectedRoom(null);
        } catch (error) {
            console.error('Failed to mark maintenance:', error);
            alert('Failed to update room status');
        }
    };

    const handleQuickBookSubmit = async (data: QuickBookData) => {
        try {
            await api.quickBook(data);
            setIsQuickBookOpen(false);
            setSelectedRoom(null);
            fetchRooms();
            toast.success('Booking created successfully!');
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error(error?.message || 'Failed to create booking. Please check available rooms.');
        }
    };

    const openQuickBook = (room: Room) => {
        setSelectedRoom(room);
        setIsQuickBookOpen(true);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

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
                <div className="flex gap-md items-center flex-wrap">
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
            {selectedRoom && !isQuickBookOpen && (
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
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => openQuickBook(selectedRoom)}
                                    >
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

            <QuickBookModal
                isOpen={isQuickBookOpen}
                onClose={() => {
                    setIsQuickBookOpen(false);
                    setSelectedRoom(null);
                }}
                availableRooms={rooms.filter(r => r.current_state === 'AVAILABLE')}
                selectedRoom={selectedRoom || undefined}
                onSubmit={handleQuickBookSubmit}
            />
        </div>
    );
}
