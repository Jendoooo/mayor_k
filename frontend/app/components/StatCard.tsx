import { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    accent?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    trend?: {
        value: string;
        direction?: 'up' | 'down' | 'neutral';
        label?: string;
    };
}

export default function StatCard({ label, value, icon, accent = 'primary', trend }: StatCardProps) {
    const accents = {
        primary: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
        success: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
        warning: 'from-champagne-gold/20 to-yellow-600/5 text-champagne-gold border-champagne-gold/20',
        danger: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20',
        info: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
    };

    const gradient = accents[accent];

    return (
        <div className={`p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 ${gradient} border-opacity-50`}>
            {/* Ambient Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-30 bg-current pointer-events-none`}></div>

            <div className="relative z-10 flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-medium tracking-wide">{label}</span>
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 text-current shadow-inner`}>
                    {icon}
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white font-serif tracking-tight mb-1">{value}</h3>
                {trend && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`flex items-center font-bold ${trend.direction === 'down' ? 'text-red-400' : 'text-green-400'
                            }`}>
                            {trend.direction === 'up' && <ArrowUpRight size={12} className="mr-0.5" />}
                            {trend.direction === 'down' && <ArrowDownRight size={12} className="mr-0.5" />}
                            {trend.value}
                        </span>
                        {trend.label && <span className="text-slate-500">{trend.label}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
