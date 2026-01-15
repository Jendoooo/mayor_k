"use client";

import { useState, useEffect } from "react";
import { api, User } from "../../lib/api";
import { Plus, Search, Shield, User as UserIcon, Loader2, Ban, CheckCircle, RefreshCw, MoreHorizontal, Users, ShieldAlert, Activity, Download } from "lucide-react";
import UserManagementModal from "../../components/UserManagementModal";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { exportToCSV } from "../../lib/utils";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await api.getUsers();
            const userList = (data as any).results ? (data as any).results : (Array.isArray(data) ? data : []);
            setUsers(userList);
        } catch (err: any) {
            toast.error("Failed to load users: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (user: User) => {
        const action = user.is_active ? "suspend" : "activate";
        const confirmMsg = user.is_active
            ? "Suspending this user will immediately block their access. Continue?"
            : "Activate this user account?";

        if (!window.confirm(confirmMsg)) return;

        try {
            await api.activateUser(user.id, !user.is_active);
            toast.success(`User ${action}ed successfully`);
            fetchUsers();
        } catch (err: any) {
            toast.error("Failed to update status");
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role_display?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'MANAGER': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'STAKEHOLDER': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        }
    };

    // Stats calculation
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const suspendedUsers = users.filter(u => !u.is_active).length;

    const handleExport = () => {
        const dataToExport = filteredUsers.map(user => ({
            "Full Name": user.full_name,
            "Username": user.username,
            "Role": user.role,
            "Status": user.is_active ? "Active" : "Suspended",
            "Last Login": user.last_login ? new Date(user.last_login).toLocaleString() : "Never",
            "Phone": user.phone || "N/A",
            "Email": user.email || "N/A"
        }));
        exportToCSV(dataToExport, "staff_list");
        toast.success("Export started");
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-bold font-heading text-white tracking-tight">Team Management</h1>
                    <p className="text-slate-400 mt-2 text-lg">Control access protocols and staff roles.</p>
                </div>
                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExport}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold border border-white/10 flex items-center gap-2 transition-all"
                    >
                        <Download size={20} />
                        Export
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddUser}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
                    >
                        <Plus size={20} />
                        Add Staff Member
                    </motion.button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Total Staff</p>
                        <h3 className="text-2xl font-bold text-white">{totalUsers}</h3>
                    </div>
                </div>
                <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Active Accounts</p>
                        <h3 className="text-2xl font-bold text-white">{activeUsers}</h3>
                    </div>
                </div>
                <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center gap-4 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium">Suspended</p>
                        <h3 className="text-2xl font-bold text-white">{suspendedUsers}</h3>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-800/30 backdrop-blur-xl p-1 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 max-w-xl shadow-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, username or role..."
                        className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:ring-0 text-lg outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Grid/Table */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-400 border-b border-white/5 text-sm uppercase tracking-wider">
                                <th className="px-8 py-6 font-semibold">User Profile</th>
                                <th className="px-8 py-6 font-semibold">Role & Access</th>
                                <th className="px-8 py-6 font-semibold">Status</th>
                                <th className="px-8 py-6 font-semibold">Last Active</th>
                                <th className="px-8 py-6 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="animate-spin text-blue-500" size={40} />
                                                <p className="text-lg">Loading team matrix...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                            <UserIcon className="mx-auto mb-4 opacity-20" size={64} />
                                            <p className="text-xl">No team members found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors group cursor-default"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg ${user.is_active ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white' : 'bg-slate-800 text-slate-500 grayscale'
                                                        }`}>
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className={`font-semibold text-lg ${user.is_active ? 'text-white' : 'text-slate-500'}`}>
                                                            {user.full_name}
                                                        </div>
                                                        <div className="text-sm text-slate-400 font-mono tracking-wide opacity-70">
                                                            @{user.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide border ${getRoleStyle(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {user.is_active ? (
                                                    <div className="flex items-center gap-2 text-emerald-400">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                                        <span className="text-sm font-medium">Active</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-rose-400">
                                                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                                                        <span className="text-sm font-medium">Suspended</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="text-sm text-slate-400">
                                                    {user.last_login ? (
                                                        <span title={new Date(user.last_login).toLocaleString()}>
                                                            {new Date(user.last_login).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 italic">Never logged in</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors"
                                                        title="Edit Profile"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`p-2.5 rounded-xl transition-colors ${user.is_active
                                                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                                                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                                                            }`}
                                                        title={user.is_active ? "Suspend Access" : "Restore Access"}
                                                    >
                                                        {user.is_active ? <Ban size={18} /> : <CheckCircle size={18} />}
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <UserManagementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
                user={selectedUser}
                nextId={users.length + 1}
            />
        </div>
    );
}
