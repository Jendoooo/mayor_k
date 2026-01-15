'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/app/components/StatCard';
import api, { StakeholderDashboard as StakeholderData } from '@/app/lib/api';
import {
    Banknote,
    CreditCard,
    TrendingUp,
    TrendingDown,
    Percent,
    AlertTriangle,
    CheckCircle,
    LineChart,
    AlertCircle,
    Clock
} from 'lucide-react';

export default function StakeholderDashboard() {
    const [data, setData] = useState<StakeholderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.getStakeholderDashboard();
                setData(response);
            } catch (error) {
                console.error('Failed to fetch stakeholder data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return <div className="text-secondary">Failed to load data.</div>;

    return (
        <div>
            <h1 className="mb-md">Financial Overview</h1>
            <p className="text-secondary mb-xl">Key performance metrics and financial health.</p>

            {/* Top Level Key Metrics */}
            <div className="grid grid-cols-4 gap-md mb-xl">
                <StatCard
                    label="Today's Revenue"
                    value={`₦${parseFloat(data.total_revenue_today).toLocaleString()}`}
                    icon={<Banknote size={24} />}
                    accent="success"
                />
                <StatCard
                    label="Today's Expenses"
                    value={`₦${parseFloat(data.total_expenses_today).toLocaleString()}`}
                    icon={<CreditCard size={24} />}
                    accent="warning"
                />
                <StatCard
                    label="Net Income (Today)"
                    value={`₦${parseFloat(data.net_revenue_today).toLocaleString()}`}
                    icon={<TrendingUp size={24} />}
                    accent={parseFloat(data.net_revenue_today) >= 0 ? 'success' : 'danger'}
                />
                <StatCard
                    label="Occupancy Rate"
                    value={`${data.occupancy_rate_today}%`}
                    icon={<Percent size={24} />}
                    accent="info"
                />
            </div>

            <div className="grid grid-cols-2 gap-xl mb-xl">
                {/* Revenue Breakdown */}
                <div className="card">
                    <h3 className="mb-md flex items-center gap-sm">
                        <LineChart size={20} className="text-success" />
                        Revenue Breakdown
                    </h3>
                    <div className="space-y-md">
                        <div className="flex justify-between items-center py-sm border-b border-color-border">
                            <span className="text-secondary">Today</span>
                            <span className="font-bold text-success font-mono">₦{parseFloat(data.total_revenue_today).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-sm border-b border-color-border">
                            <span className="text-secondary">This Week</span>
                            <span className="font-bold text-success font-mono">₦{parseFloat(data.total_revenue_week).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-sm">
                            <span className="text-secondary">This Month</span>
                            <span className="font-bold text-success font-mono">₦{parseFloat(data.total_revenue_month).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Expenses Breakdown */}
                <div className="card">
                    <h3 className="mb-md flex items-center gap-sm">
                        <TrendingDown size={20} className="text-danger" />
                        Expenses Breakdown
                    </h3>
                    <div className="space-y-md">
                        <div className="flex justify-between items-center py-sm border-b border-color-border">
                            <span className="text-secondary">Today</span>
                            <span className="font-bold text-danger font-mono">₦{parseFloat(data.total_expenses_today).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-sm border-b border-color-border">
                            <span className="text-secondary">This Week</span>
                            <span className="font-bold text-danger font-mono">₦{parseFloat(data.total_expenses_week).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-sm">
                            <span className="text-secondary">This Month</span>
                            <span className="font-bold text-danger font-mono">₦{parseFloat(data.total_expenses_month).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Anomalies & Alerts */}
            {data.anomalies.length > 0 && (
                <div className="card border-l-4 border-l-danger">
                    <div className="flex items-center gap-md mb-md">
                        <AlertTriangle size={24} className="text-danger" />
                        <h3 className="text-danger">Attention Needed</h3>
                    </div>
                    <div className="space-y-sm">
                        {data.anomalies.map((anomaly, idx) => (
                            <div key={idx} className="p-sm bg-bg-secondary rounded border border-border">
                                <div className="font-bold flex items-center gap-xs">
                                    <AlertCircle size={16} className="text-warning" />
                                    {anomaly.type.replace('_', ' ')}
                                </div>
                                <div className="text-sm mt-xs">{anomaly.message}</div>
                                <div className="text-xs text-secondary mt-xs flex items-center gap-xs">
                                    <Clock size={12} />
                                    {anomaly.date}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {data.anomalies.length === 0 && (
                <div className="card bg-bg-secondary flex flex-col items-center justify-center py-xl text-secondary border border-dashed border-border-light">
                    <CheckCircle size={48} className="text-success mb-md opacity-50" />
                    <p>No anomalies detected. Operations running smoothly.</p>
                </div>
            )}
        </div>
    );
}
