import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
        label?: string; // e.g. "vs yesterday"
    };
}

export default function StatCard({ label, value, icon, accent = 'primary', trend }: StatCardProps) {
    // Map accent colors to CSS variables
    const accentColorMap = {
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
    };

    return (
        <div
            className="stat-card"
            style={{
                '--stat-accent': accentColorMap[accent]
            } as React.CSSProperties}
        >
            <div className="flex justify-between items-start mb-sm">
                <div className="stat-label">{label}</div>
                <div className={`p-xs rounded-full bg-${accent}/10 text-${accent}`}>
                    {icon}
                </div>
            </div>

            <div className="stat-value">{value}</div>

            {trend && (
                <div className={`stat-change ${trend.direction === 'down' ? 'negative' : ''}`}>
                    {trend.direction === 'up' && <ArrowUpRight size={14} />}
                    {trend.direction === 'down' && <ArrowDownRight size={14} />}
                    {trend.direction === 'neutral' && <Minus size={14} />}
                    <span>{trend.value}</span>
                    {trend.label && <span className="text-muted ml-xs text-xs lowercase">{trend.label}</span>}
                </div>
            )}
        </div>
    );
}
