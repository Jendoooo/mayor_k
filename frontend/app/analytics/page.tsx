'use client';

import { useState, useEffect } from 'react';
import api, { RoomAnalytics } from '@/app/lib/api'; // Ensure this type matches api.ts
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart3, Clock, TrendingDown } from 'lucide-react';
import StatCard from '@/app/components/StatCard';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<RoomAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const response = await api.getRoomAnalytics();
                setData(response);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return <div className="p-xl text-center">Failed to load analytics.</div>;

    // Prepare data for chart
    const chartData = data.room_dirty_durations.map(item => ({
        name: `Room ${item.room_number}`,
        minutes: Math.round(item.avg_dirty_minutes),
        cleanings: item.total_cleanings
    }));

    return (
        <div className="container mx-auto p-md max-w-6xl">
            <div className="flex items-center gap-md mb-xl">
                <BarChart3 size={32} className="text-primary" />
                <div>
                    <h1>Operational Analytics</h1>
                    <p className="text-secondary">Insights into housekeeping efficiency and room utilization.</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-lg mb-xl">
                <StatCard
                    label="Avg Cleaning Time"
                    value={`${Math.round(data.overall_avg_dirty_minutes)} mins`}
                    icon={<Clock size={24} />}
                    accent="info"
                    trend={{ value: "5%", direction: "down", label: "vs last week" }}
                />
                <StatCard
                    label="Slowest Turnaround"
                    value={data.room_dirty_durations[0]?.room_number || "N/A"}
                    icon={<TrendingDown size={24} />}
                    accent="warning"
                />
            </div>

            <div className="card h-[500px]">
                <h3 className="mb-lg">Room Turnaround Time (Minutes)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                            dataKey="name"
                            stroke="var(--color-text-secondary)"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-bg-elevated)',
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                        <Bar
                            dataKey="minutes"
                            fill="var(--color-primary)"
                            radius={[4, 4, 0, 0]}
                            name="Avg Minutes Dirty"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
