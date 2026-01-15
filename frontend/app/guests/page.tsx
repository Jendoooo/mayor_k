'use client';

import { useState, useEffect } from 'react';
import api, { Guest } from '@/app/lib/api';
import GuestHistoryModal from '../components/GuestHistoryModal';
import { Eye } from 'lucide-react';

export default function GuestsPage() {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

    useEffect(() => {
        console.log('[Guests] Fetching guests from API...');
        api.getGuests()
            .then(response => {
                console.log('[Guests] API Response:', response);
                console.log('[Guests] Results array:', response.results);
                console.log('[Guests] Results length:', response.results?.length);
                setGuests(response.results || []);
            })
            .catch(err => {
                console.error('[Guests] API Error:', err);
            })
            .finally(() => {
                console.log('[Guests] Loading complete');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="p-xl text-center">Loading guests...</div>;
    }

    const filteredGuests = guests.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone.includes(searchTerm)
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Guests</h1>
                    <p className="text-secondary">Directory of past and present guests</p>
                </div>
                <button className="btn btn-primary">
                    + Add Guest
                </button>
            </div>

            <div className="card">
                <div className="mb-md">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ maxWidth: '400px' }}
                    />
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Total Stays</th>
                                <th>Total Spent</th>
                                <th>Last Visit</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGuests.map((guest) => (
                                <tr key={guest.id}>
                                    <td className="font-bold">{guest.name}</td>
                                    <td>{guest.phone}</td>
                                    <td>{guest.total_stays}</td>
                                    <td>₦{parseFloat(guest.total_spent).toLocaleString()}</td>
                                    <td className="text-sm text-secondary">
                                        {guest.last_visit
                                            ? new Date(guest.last_visit).toLocaleDateString()
                                            : <span className="italic opacity-50">Never</span>
                                        }
                                    </td>
                                    <td>
                                        {guest.is_blocked ? (
                                            <span className="badge badge-rejected">Blocked</span>
                                        ) : (
                                            <span className="badge badge-approved">Active</span>
                                        )}
                                    </td>
                                    <td className="text-sm text-secondary">{guest.notes}</td>
                                    <td>
                                        <button
                                            className="btn btn-outline btn-sm flex items-center gap-xs"
                                            onClick={() => setSelectedGuest(guest)}
                                        >
                                            <Eye size={14} />
                                            History
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedGuest && (
                <GuestHistoryModal
                    guestId={selectedGuest.id}
                    guestName={selectedGuest.name}
                    onClose={() => setSelectedGuest(null)}
                />
            )}
        </div>
    );
}
