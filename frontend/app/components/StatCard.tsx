'use client';

interface StatCardProps {
    value: string | number;
    label: string;
    accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    change?: {
        value: string;
        positive: boolean;
    };
    icon?: React.ReactNode;
}

const accentColors = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
};

export default function StatCard({ value, label, accent = 'primary', change, icon }: StatCardProps) {
    return (
        <div
            className="stat-card"
            style={{ '--stat-accent': accentColors[accent] } as React.CSSProperties}
        >
            <div className="flex justify-between items-center">
                <div>
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                    {change && (
                        <div className={`stat-change ${change.positive ? '' : 'negative'}`}>
                            {change.positive ? '↑' : '↓'} {change.value}
                        </div>
                    )}
                </div>
                {icon && (
                    <div style={{ opacity: 0.5 }}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}
