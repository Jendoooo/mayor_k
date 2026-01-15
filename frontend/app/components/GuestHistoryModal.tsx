import React from 'react';
import { X } from 'lucide-react';

interface GuestHistoryModalProps {
    guestId: string;
    guestName: string;
    onClose: () => void;
}

interface BookingHistory {
    id: string;
    booking_ref: string;
    room_number: string;
    stay_type_display: string;
    check_in_date: string;
    actual_checkout: string;
    amount_paid: string;
}

export default function GuestHistoryModal({ guestId, guestName, onClose }: GuestHistoryModalProps) {
    const [bookings, setBookings] = React.useState<BookingHistory[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Fetch booking history for this guest
        fetch(`http://localhost:8000/api/v1/bookings/?guest=${guestId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setBookings(data.results || []);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [guestId]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-bg-primary rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
                <div className="flex justify-between items-center p-md border-b border-border bg-bg-secondary/30">
                    <div>
                        <h3 className="text-lg font-bold">Booking History</h3>
                        <p className="text-sm text-secondary">{guestName}</p>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm rounded-full p-1 hover:bg-bg-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-md overflow-y-auto max-h-[60vh]">
                    {isLoading ? (
                        <div className="text-center py-xl text-secondary">Loading history...</div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-xl text-secondary italic">No past bookings</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Room</th>
                                    <th>Type</th>
                                    <th>Check In</th>
                                    <th>Check Out</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td className="font-mono text-xs">{booking.booking_ref}</td>
                                        <td>Room {booking.room_number}</td>
                                        <td className="text-sm">{booking.stay_type_display}</td>
                                        <td className="text-sm">{booking.check_in_date}</td>
                                        <td className="text-sm">
                                            {booking.actual_checkout
                                                ? new Date(booking.actual_checkout).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                        <td className="font-medium">₦{parseFloat(booking.amount_paid).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-md border-t border-border bg-bg-secondary/10 flex justify-end">
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}
