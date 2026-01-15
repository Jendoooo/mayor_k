"use client";

import { useState, useEffect } from "react";
import { User, api } from "../lib/api";
import { X, Loader2, Save, Eye, EyeOff, RefreshCw, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: User | null;
    nextId?: number;
}

export default function UserManagementModal({ isOpen, onClose, onSuccess, user, nextId }: UserManagementModalProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        password: "",
        role: "RECEPTIONIST",
        phone: "",
        email: ""
    });

    // Auto-generate credentials effect
    useEffect(() => {
        if (!user && isOpen) {
            if (formData.first_name && formData.first_name.length >= 3) {
                const prefix = formData.first_name.substring(0, 3).toUpperCase();
                const suffix = nextId ? nextId.toString().padStart(4, '0') : Math.floor(1000 + Math.random() * 9000).toString();
                const newUsername = `${prefix}${suffix}`;

                if (!formData.username || /^[A-Z]{3}\d{4}$/.test(formData.username)) {
                    setFormData(prev => ({
                        ...prev,
                        username: newUsername,
                        password: "password123"
                    }));
                }
            }
        }
    }, [formData.first_name, isOpen, user, nextId]);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                password: "",
                role: user.role,
                phone: user.phone || "",
                email: user.email
            });
        } else {
            setFormData({
                first_name: "",
                last_name: "",
                username: "",
                password: "password123",
                role: "RECEPTIONIST",
                phone: "",
                email: ""
            });
        }
    }, [user, isOpen]);

    const generateNewCredentials = () => {
        if (!formData.first_name || formData.first_name.length < 3) return;
        const prefix = formData.first_name.substring(0, 3).toUpperCase();
        const suffix = nextId ? nextId.toString().padStart(4, '0') : Math.floor(1000 + Math.random() * 9000).toString();
        setFormData(prev => ({
            ...prev,
            username: `${prefix}${suffix}`,
            password: "password123"
        }));
    };

    const copyCredentials = () => {
        const text = `Username: ${formData.username}\nPassword: ${formData.password}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Credentials copied!");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (user) {
                const updateData: any = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    phone: formData.phone,
                    email: formData.email
                };
                if (formData.password) {
                    if (formData.password.length < 6) {
                        toast.error("Password must be at least 6 characters");
                        setLoading(false);
                        return;
                    }
                    updateData.password = formData.password;
                }
                await api.updateUser(user.id, updateData);
                toast.success("Profile updated");
            } else {
                await api.createUser(formData);
                toast.success("Staff member added");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
                                <div>
                                    <h2 className="text-xl font-bold font-heading text-white">
                                        {user ? "Edit Profile" : "New Staff Access"}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {user ? "Update user details and permissions" : "Create a new account for staff"}
                                    </p>
                                </div>
                                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            autoFocus={!user}
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="e.g. Jane"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                            placeholder="e.g. Doe"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!user && (
                                    <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-5 rounded-xl border border-blue-500/20 relative group">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                                <h3 className="text-sm font-bold text-blue-100 uppercase tracking-wide">System Credentials</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={copyCredentials}
                                                    className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                >
                                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                                    {copied ? 'Copied' : 'Copy'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={generateNewCredentials}
                                                    className="text-xs hover:bg-white/5 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                                    title="Regenerate"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50">
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Username</label>
                                                <div className="font-mono text-blue-200 text-lg tracking-wide">{formData.username || '---'}</div>
                                            </div>
                                            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/50">
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Password</label>
                                                <div className="flex justify-between items-center">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        readOnly
                                                        className="bg-transparent border-none p-0 text-blue-200 font-mono text-lg w-full focus:ring-0"
                                                        value={formData.password}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="text-slate-500 hover:text-white p-1"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {user && (
                                    <div className="space-y-4 pt-2 border-t border-white/5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-mono"
                                                    value={formData.username}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                                    placeholder="Keep current"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role Assignment</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="RECEPTIONIST">Receptionist (Bookings & Guests)</option>
                                            <option value="MANAGER">Manager (Approvals & Finance)</option>
                                            <option value="STAKEHOLDER">Stakeholder (View Only)</option>
                                            <option value="ADMIN">Admin (Full Control)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors font-medium"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {user ? "Save Changes" : "Create Account"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
