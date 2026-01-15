'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import {
    LayoutDashboard,
    BedDouble,
    CalendarDays,
    Users,
    Receipt,
    CreditCard,
    BarChart3,
    FileClock,
    LogOut,
    Utensils,
    Settings,
    Shield,
    Package,
    Wine
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
    },
    {
        href: '/rooms',
        label: 'Rooms',
        icon: <BedDouble size={20} />,
    },
    {
        href: '/bookings',
        label: 'Bookings',
        icon: <CalendarDays size={20} />,
    },
    {
        href: '/guests',
        label: 'Guests',
        icon: <Users size={20} />,
    },
];

const financeNavItems: NavItem[] = [
    {
        href: '/transactions',
        label: 'Transactions',
        icon: <Receipt size={20} />,
    },
    {
        href: '/expenses',
        label: 'Expenses',
        icon: <CreditCard size={20} />,
    },
];

const adminNavItems: NavItem[] = [
    {
        href: '/analytics',
        label: 'Analytics',
        icon: <BarChart3 size={20} />,
    },
    {
        href: '/admin/users',
        label: 'User Management',
        icon: <Shield size={20} />,
    },
    {
        href: '/audit-log',
        label: 'Audit Log',
        icon: <FileClock size={20} />,
    },
];

const inventoryNavItems: NavItem[] = [
    {
        href: '/inventory',
        label: 'Inventory',
        icon: <Package size={20} />,
    },
    {
        href: '/bar',
        label: 'Bar Point of Sale',
        icon: <Wine size={20} />,
    },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-midnight-blue border-r border-white/10 flex flex-col z-40 text-slate-300 shadow-2xl">
            <div className="h-16 flex items-center px-6 border-b border-white/10 bg-midnight-blue/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-champagne-gold to-yellow-600 flex items-center justify-center font-serif font-bold text-white text-sm shadow-md">MK</div>
                    <div className="font-serif font-bold text-white tracking-wide">Mayor K.</div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">

                <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Main</div>
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${pathname === item.href
                                    ? 'bg-champagne-gold text-white font-medium shadow-lg'
                                    : 'hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                                {item.icon}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Bar & Service</div>
                    {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                        <Link
                            href="/inventory"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${pathname === '/inventory'
                                    ? 'bg-champagne-gold text-white font-medium shadow-lg'
                                    : 'hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <span className={pathname === '/inventory' ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                                <Package size={20} />
                            </span>
                            <span>Inventory</span>
                        </Link>
                    )}
                    <Link
                        href="/bar"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${pathname === '/bar'
                                ? 'bg-champagne-gold text-white font-medium shadow-lg'
                                : 'hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <span className={pathname === '/bar' ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                            <Wine size={20} />
                        </span>
                        <span>Bar POS</span>
                    </Link>
                </div>

                {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAKEHOLDER') && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Finance</div>
                        {financeNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${pathname === item.href
                                        ? 'bg-champagne-gold text-white font-medium shadow-lg'
                                        : 'hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className={pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {user.role === 'ADMIN' && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Admin</div>
                        {adminNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${pathname === item.href
                                        ? 'bg-champagne-gold text-white font-medium shadow-lg'
                                        : 'hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className={pathname === item.href ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            <div className="border-t border-white/10 p-4 bg-midnight-blue/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-champagne-gold border border-white/5 font-bold text-lg">
                        {user.first_name?.[0] || user.username[0]}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-semibold truncate text-white">
                            {user.first_name || user.username}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 truncate">
                            {user.role}
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 justify-center px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
