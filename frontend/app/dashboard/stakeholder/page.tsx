'use client';

import { useState } from 'react';
import StatCard from '@/app/components/StatCard';
import { StakeholderDashboard, Anomaly } from '@/app/lib/api';

// Mock data (will be replaced by API)
const mockData: StakeholderDashboard = {
    total_revenue_today: '156000',
    total_revenue_week: '850000',
    total_revenue_month: '3200000',
    total_expenses_today: '45000',
    total_expenses_week: '210000',
    total_expenses_month: '950000',
    net_revenue_today: '111000',
    net_revenue_week: '640000',
    net_revenue_month: '2250000',
    occupancy_rate_today: 16.7,
    avg_occupancy_week: 45.2,
    anomalies: [
        {
            type: 'EXPENSE',
            message: 'High diesel consumption reported yesterday (500L vs avg 200L)',
            date: '2026-01-14',
            ref: 'EXP-001',
        },
        {
            type: 'DISCOUNT',
            message: 'Unusual number of high discounts (5 bookings > 20% off)',
            date: '2026-01-15',
        }
    ]
};

export default function StakeholderDashboardPage() {
    const [data] = useState<StakeholderDashboard>(mockData);

    const formatCurrency = (amount: string) => `₦${parseFloat(amount).toLocaleString()}`;

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Stakeholder Overview</h1>
                    <p className="text-secondary">Financial summary and anomaly detection</p>
                </div>
                <div className="badge badge-maintenance">
                    Read-Only Mode
                </div>
            </div>

            {/* High-Level Stats */}
            <h3 className="mb-md">Revenues</h3>
            <div className="grid grid-cols-3 gap-md mb-lg">
                <StatCard
                    value={formatCurrency(data.total_revenue_today)}
                    label="Today's Revenue"
                    accent="primary"
                    change={{ value: '+12%', positive: true }}
                />
                <StatCard
                    value={formatCurrency(data.total_revenue_week)}
                    label="This Week"
                    accent="info"
                />
                <StatCard
                    value={formatCurrency(data.total_revenue_month)}
                    label="This Month"
                    accent="success"
                />
            </div>

            <h3 className="mb-md">Expenses</h3>
            <div className="grid grid-cols-3 gap-md mb-lg">
                <StatCard
                    value={formatCurrency(data.total_expenses_today)}
                    label="Today's Expenses"
                    accent="warning"
                />
                <StatCard
                    value={formatCurrency(data.total_expenses_week)}
                    label="This Week"
                    accent="warning"
                />
                <StatCard
                    value={formatCurrency(data.total_expenses_month)}
                    label="This Month"
                    accent="warning"
                />
            </div>

            <div className="grid grid-cols-2 gap-lg">
                {/* Net Profit */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Net Profit Analysis</h3>
                    </div>
                    <div className="flex flex-col gap-lg">
                        <div className="flex justify-between items-end border-b pb-md" style={{ borderColor: 'var(--color-border)' }}>
                            <span className="text-secondary">Today Net</span>
                            <span className="text-2xl font-bold text-success">
                                {formatCurrency(data.net_revenue_today)}
                            </span>
                        </div>
                        <div className="flex justify-between items-end border-b pb-md" style={{ borderColor: 'var(--color-border)' }}>
                            <span className="text-secondary">Weekly Net</span>
                            <span className="text-2xl font-bold text-success">
                                {formatCurrency(data.net_revenue_week)}
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-secondary">Monthly Net</span>
                            <span className="text-2xl font-bold text-success">
                                {formatCurrency(data.net_revenue_month)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Anomalies & Alerts */}
                <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
                    <div className="card-header">
                        <h3 className="card-title text-danger">⚠️ Anomalies Detected</h3>
                    </div>
                    <div className="flex flex-col gap-md">
                        {data.anomalies.map((anomaly, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid var(--color-danger)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-md)',
                                }}
                            >
                                <div className="flex justify-between mb-xs">
                                    <span className="font-bold text-danger">{anomaly.type} ALERT</span>
                                    <span className="text-xs text-secondary">{anomaly.date}</span>
                                </div>
                                <p className="text-sm">{anomaly.message}</p>
                            </div>
                        ))}
                        {data.anomalies.length === 0 && (
                            <p className="text-secondary text-center py-lg">No anomalies detected.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
