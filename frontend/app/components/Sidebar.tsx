'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/rooms',
        label: 'Rooms',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    {
        href: '/bookings',
        label: 'Bookings',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        href: '/guests',
        label: 'Guests',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
];

const financeNavItems: NavItem[] = [
    {
        href: '/transactions',
        label: 'Transactions',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        href: '/expenses',
        label: 'Expenses',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
        ),
    },
];

const adminNavItems: NavItem[] = [
    {
        href: '/analytics',
        label: 'Analytics',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        href: '/audit-log',
        label: 'Audit Log',
        icon: (
            <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
];

function NavLink({ item }: { item: NavItem }) {
    const pathname = usePathname();
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

    return (
        <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
            {item.icon}
            <span>{item.label}</span>
        </Link>
    );
}

export default function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="brand">
                <div className="brand-logo">MK</div>
                <div>
                    <div className="brand-name">Mayor K.</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        Guest Palace
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Operations</div>
                {mainNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </nav>

            {/* Finance Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Finance</div>
                {financeNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </nav>

            {/* Admin Navigation */}
            <nav className="nav-section">
                <div className="nav-section-title">Reports</div>
                {adminNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </nav>

            {/* User Info at bottom */}
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
                <div className="nav-link" style={{ cursor: 'default' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                    }}>
                        A
                    </div>
                    <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Admin User</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Manager</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
