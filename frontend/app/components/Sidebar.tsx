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
    Settings
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
        href: '/audit-log',
        label: 'Audit Log',
        icon: <FileClock size={20} />,
    },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    return (
        <aside className="sidebar">
            <div className="brand">
                <div className="brand-logo">MK</div>
                <div className="brand-name">Mayor K. Palace</div>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <div className="nav-section">
                    <div className="nav-section-title">Main</div>
                    {mainNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {(user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'STAKEHOLDER') && (
                    <div className="nav-section">
                        <div className="nav-section-title">Finance</div>
                        {financeNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {user.role === 'ADMIN' && (
                    <div className="nav-section">
                        <div className="nav-section-title">Admin</div>
                        {adminNavItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            <div className="mt-auto border-t border-color-border pt-lg">
                <div className="flex items-center gap-md mb-md px-sm">
                    <div className="brand-logo" style={{ width: '36px', height: '36px', fontSize: '14px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}>
                        {user.first_name?.[0] || user.username[0]}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-sm font-semibold truncate">
                            {user.first_name || user.username}
                        </div>
                        <div className="text-xs text-secondary truncate">
                            {user.role_display}
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="nav-link w-full text-danger hover:bg-danger/10"
                    style={{ justifyContent: 'flex-start' }}
                >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
