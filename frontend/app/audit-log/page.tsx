'use client';

import { useState, useEffect } from 'react';
import api, { SystemEvent, PaginatedResponse } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FileClock, User, Shield, Calendar, Download } from 'lucide-react';
import { exportToCSV } from '../lib/utils';
import toast from 'react-hot-toast';

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

    const handleExport = () => {
        const dataToExport = events.map(event => ({
            "Event Type": event.event_type,
            "User": event.user_name || 'System',
            "Description": event.description,
            "Date": new Date(event.created_at).toLocaleDateString(),
            "Time": new Date(event.created_at).toLocaleTimeString()
        }));
        exportToCSV(dataToExport, `audit_log_${new Date().toISOString().split('T')[0]}`);
        toast.success("Audit log exported");
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-heading text-white tracking-tight">Audit Log</h1>
                    <p className="text-slate-400 mt-2 text-lg">Track system-wide activities and security events.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold border border-white/10 flex items-center gap-2 transition-all"
                >
                    <Download size={20} />
                    Export Log
                </button>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-400 border-b border-white/5 text-sm uppercase tracking-wider">
                                <th className="px-8 py-6 font-semibold">Event Type</th>
                                <th className="px-8 py-6 font-semibold">User</th>
                                <th className="px-8 py-6 font-semibold">Description</th>
                                <th className="px-8 py-6 font-semibold">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Shield size={16} />
                                            </div>
                                            <span className="font-medium text-slate-200">{event.event_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <User size={16} className="text-slate-500" />
                                            {event.user_name || 'System'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-400">
                                        {event.description}
                                    </td>
                                    <td className="px-8 py-5 text-slate-400 whitespace-nowrap font-mono text-sm">
                                        <div className="flex items-center gap-2">
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
                    <div className="text-center py-20 text-slate-500">
                        <FileClock className="mx-auto mb-4 opacity-20" size={64} />
                        <p className="text-xl">No audit logs found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
