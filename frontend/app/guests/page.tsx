'use client';

import { useState } from 'react';
import { Guest } from '@/app/lib/api';

// Mock data
const mockGuests: Guest[] = [
    {
        id: '1',
        name: 'Adeola Johnson',
        phone: '08034567890',
        email: 'adeola@example.com',
        notes: 'Likes quiet rooms',
        is_blocked: false,
        total_stays: 5,
        total_spent: '75000',
        created_at: '2025-12-10T10:00:00',
    },
    {
        id: '2',
        name: 'Chukwudi Okonkwo',
        phone: '08098765432',
        email: '',
        notes: '',
        is_blocked: false,
        total_stays: 2,
        total_spent: '10000',
        created_at: '2026-01-05T14:20:00',
    },
];

export default function GuestsPage() {
    const [guests] = useState<Guest[]>(mockGuests);
    const [searchTerm, setSearchTerm] = useState('');

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
                                <th>Status</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGuests.map((guest) => (
                                <tr key={guest.id}>
                                    <td className="font-bold">{guest.name}</td>
                                    <td>{guest.phone}</td>
                                    <td>{guest.total_stays}</td>
                                    <td>₦{parseFloat(guest.total_spent).toLocaleString()}</td>
                                    <td>
                                        {guest.is_blocked ? (
                                            <span className="badge badge-rejected">Blocked</span>
                                        ) : (
                                            <span className="badge badge-approved">Active</span>
                                        )}
                                    </td>
                                    <td className="text-sm text-secondary">{guest.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
