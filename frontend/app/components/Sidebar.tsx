'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState, useEffect } from 'react';
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
    Package,
    Wine,
    Shield,
    PlusCircle,
    Sparkles,
    Settings,
    Menu,
    X
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

// Role permission helpers
const canManageRooms = (role: string) => ['RECEPTIONIST', 'HOUSEKEEPING', 'MANAGER', 'ADMIN'].includes(role);
const canMakeBookings = (role: string) => ['RECEPTIONIST', 'MANAGER', 'ADMIN'].includes(role);
const canUsePOS = (role: string) => ['RECEPTIONIST', 'BAR_STAFF', 'MANAGER', 'ADMIN'].includes(role);
const canViewFinance = (role: string) => ['ACCOUNTANT', 'MANAGER', 'STAKEHOLDER', 'ADMIN'].includes(role);
const canSubmitExpense = (role: string) => ['RECEPTIONIST', 'HOUSEKEEPING', 'BAR_STAFF', 'MANAGER', 'ADMIN'].includes(role);
const canManageInventory = (role: string) => ['MANAGER', 'ADMIN'].includes(role);
const isAdmin = (role: string) => role === 'ADMIN';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    if (!user) return null;
    const role = user.role;

    // Define which sections each role can see
    const showRooms = canManageRooms(role);
    const showBookings = canMakeBookings(role);
    const showGuests = canMakeBookings(role);
    const showBarPOS = canUsePOS(role);
    const showInventory = canManageInventory(role);
    const showFinance = canViewFinance(role);
    const showSubmitExpense = canSubmitExpense(role);
    const showAdmin = isAdmin(role);

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-midnight-blue text-white rounded-lg shadow-lg hover:bg-blue-900 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-midnight-blue border-r border-white/10 flex flex-col z-40 text-slate-300 shadow-2xl transition-transform duration-300 ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
            <div className="h-16 flex items-center px-6 border-b border-white/10 bg-midnight-blue/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-champagne-gold to-yellow-600 flex items-center justify-center font-serif font-bold text-white text-sm shadow-md">MK</div>
                    <div className="font-serif font-bold text-white tracking-wide">Mayor K.</div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">

                {/* Main Section - Dashboard is for everyone */}
                <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Main</div>
                    <NavLink href="/dashboard" label="Dashboard" icon={<LayoutDashboard size={20} />} pathname={pathname} />

                    {showRooms && (
                        <NavLink href="/rooms" label="Rooms" icon={<BedDouble size={20} />} pathname={pathname} />
                    )}
                    {showBookings && (
                        <NavLink href="/bookings" label="Bookings" icon={<CalendarDays size={20} />} pathname={pathname} />
                    )}
                    {showGuests && (
                        <NavLink href="/guests" label="Guests" icon={<Users size={20} />} pathname={pathname} />
                    )}
                </div>

                {/* Bar & Service Section */}
                {(showBarPOS || showInventory) && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Bar & Service</div>
                        {showInventory && (
                            <NavLink href="/inventory" label="Inventory" icon={<Package size={20} />} pathname={pathname} />
                        )}
                        {showBarPOS && (
                            <NavLink href="/bar" label="Bar POS" icon={<Wine size={20} />} pathname={pathname} />
                        )}
                    </div>
                )}

                {/* Staff Actions - Submit Expense for eligible staff */}
                {showSubmitExpense && !showFinance && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Staff Actions</div>
                        <NavLink href="/expenses/new" label="Submit Expense" icon={<PlusCircle size={20} />} pathname={pathname} />
                    </div>
                )}

                {/* Finance Section - For those with finance access */}
                {showFinance && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Finance</div>
                        <NavLink href="/transactions" label="Transactions" icon={<Receipt size={20} />} pathname={pathname} />
                        <NavLink href="/expenses" label="Expenses" icon={<CreditCard size={20} />} pathname={pathname} />
                    </div>
                )}

                {/* Admin Section */}
                {showAdmin && (
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-champagne-gold mb-2 opacity-80">Administration</div>
                        <NavLink href="/analytics" label="Analytics" icon={<BarChart3 size={20} />} pathname={pathname} />
                        <NavLink href="/admin/users" label="User Management" icon={<Shield size={20} />} pathname={pathname} />
                        <NavLink href="/audit-log" label="Audit Log" icon={<FileClock size={20} />} pathname={pathname} />
                        <NavLink href="/settings" label="Settings" icon={<Settings size={20} />} pathname={pathname} />
                    </div>
                )}

            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/10 bg-midnight-blue/50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-champagne-gold/20 to-champagne-gold/5 border border-champagne-gold/30 flex items-center justify-center">
                        <span className="text-champagne-gold font-bold text-sm">
                            {user.first_name?.[0] || user.username?.[0] || 'U'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                            {user.first_name || user.username}
                        </div>
                        <div className="text-xs text-champagne-gold/80 flex items-center gap-1">
                            <Sparkles size={10} />
                            {formatRole(user.role)}
                        </div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 hover:border-red-500/40 transition-all"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
        </>
    );
}

// Helper component for nav links
function NavLink({ href, label, icon, pathname }: { href: string; label: string; icon: React.ReactNode; pathname: string }) {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${isActive
                ? 'bg-champagne-gold text-white font-medium shadow-lg'
                : 'hover:bg-white/5 hover:text-white'
                }`}
        >
            <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'}>
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
}

// Format role for display
function formatRole(role: string): string {
    const roleMap: Record<string, string> = {
        'RECEPTIONIST': 'Receptionist',
        'HOUSEKEEPING': 'Housekeeping',
        'BAR_STAFF': 'Bar Staff',
        'ACCOUNTANT': 'Accountant',
        'MANAGER': 'Manager',
        'STAKEHOLDER': 'Stakeholder',
        'ADMIN': 'Administrator',
    };
    return roleMap[role] || role;
}
