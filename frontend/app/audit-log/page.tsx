'use client';

import { useState, useEffect } from 'react';
import api, { SystemEvent, PaginatedResponse } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileClock, User, Shield, Calendar } from 'lucide-react';

export default function AuditLogPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        const fetchLogs = async () => {
            try {
                const response = await api.getSystemEvents();
                setEvents(response.results);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-md max-w-5xl">
            <div className="flex items-center gap-md mb-xl">
                <FileClock size={32} className="text-primary" />
                <div>
                    <h1>Audit Log</h1>
                    <p className="text-secondary">Track system-wide activities and security events.</p>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-color-border text-left">
                                <th className="pb-sm font-semibold text-secondary">Event Type</th>
                                <th className="pb-sm font-semibold text-secondary">User</th>
                                <th className="pb-sm font-semibold text-secondary">Description</th>
                                <th className="pb-sm font-semibold text-secondary">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-bg-secondary transition-colors group">
                                    <td className="py-md pr-md">
                                        <div className="flex items-center gap-sm">
                                            <div className={`p-xs rounded-full bg-primary/10 text-primary`}>
                                                <Shield size={14} />
                                            </div>
                                            <span className="font-medium text-sm">{event.event_type}</span>
                                        </div>
                                    </td>
                                    <td className="py-md pr-md">
                                        <div className="flex items-center gap-xs text-sm">
                                            <User size={14} className="text-secondary" />
                                            {event.user_name || 'System'}
                                        </div>
                                    </td>
                                    <td className="py-md pr-md text-sm text-secondary">
                                        {event.description}
                                    </td>
                                    <td className="py-md text-sm text-secondary whitespace-nowrap">
                                        <div className="flex items-center gap-xs">
                                            <Calendar size={14} />
                                            {new Date(event.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {events.length === 0 && (
                    <div className="text-center py-xl text-secondary">
                        No audit logs found.
                    </div>
                )}
            </div>
        </div>
    );
}
