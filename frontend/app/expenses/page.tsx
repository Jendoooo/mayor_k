'use client';

import { useState, useEffect } from 'react';
import api, { Expense } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import LogExpenseModal from '@/app/components/LogExpenseModal';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import PromptModal from '@/app/components/PromptModal';
import { exportToCSV } from '@/app/lib/utils';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; expense: Expense | null; action: 'approve' | 'reject' | null }>({ isOpen: false, expense: null, action: null });
    const [promptModal, setPromptModal] = useState<{ isOpen: boolean; expense: Expense | null; onSubmit: ((value: string) => void) | null }>({ isOpen: false, expense: null, onSubmit: null });

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setIsLoading(true);
        try {
            const response = await api.getExpenses();
            setExpenses(response.results);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (expense: Expense) => {
        setConfirmModal({
            isOpen: true,
            expense,
            action: 'approve'
        });
    };

    const handleReject = async (expense: Expense) => {
        setPromptModal({
            isOpen: true,
            expense,
            onSubmit: async (reason: string) => {
                try {
                    await api.rejectExpense(expense.id, reason);
                    fetchExpenses();
                    setPromptModal({ isOpen: false, expense: null, onSubmit: null });
                    toast.success(`Expense ${expense.expense_ref} rejected`);
                } catch (error) {
                    console.error('Failed to reject:', error);
                    toast.error('Failed to reject expense');
                }
            }
        });
    };

    const executeApprove = async () => {
        if (!confirmModal.expense) return;
        try {
            await api.approveExpense(confirmModal.expense.id);
            fetchExpenses();
            setConfirmModal({ isOpen: false, expense: null, action: null });
            toast.success(`Expense ${confirmModal.expense.expense_ref} approved`);
        } catch (error) {
            console.error('Failed to approve:', error);
            toast.error('Failed to approve expense');
        }
    };

    const canApprove = user?.role === 'MANAGER' || user?.role === 'ADMIN';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleExport = () => {
        const dataToExport = expenses.map(exp => ({
            "Ref": exp.expense_ref,
            "Category": exp.category_name,
            "Description": exp.description,
            "Vendor": exp.vendor_name || '-',
            "Amount": exp.amount,
            "Status": exp.status_display,
            "Logged By": exp.logged_by_name,
            "Date": exp.expense_date
        }));
        exportToCSV(dataToExport, `expenses_export_${new Date().toISOString().split('T')[0]}`);
        toast.success("Expenses exported successfully");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Expenses</h1>
                    <p className="text-secondary">Track operational costs and approvals</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="btn btn-outline flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                    <button
                        className="btn btn-warning"
                        onClick={() => setIsLogModalOpen(true)}
                    >
                        + Log Expense
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    {expenses.length === 0 ? (
                        <div className="text-center py-xl text-secondary">
                            No expenses found.
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ref</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Logged By</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td className="font-mono text-sm">{exp.expense_ref}</td>
                                        <td>{exp.category_name}</td>
                                        <td>{exp.description}</td>
                                        <td className="text-sm">{exp.vendor_name || '-'}</td>
                                        <td className="font-bold">₦{parseFloat(exp.amount).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${exp.status === 'APPROVED' ? 'badge-approved' :
                                                exp.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                                                }`}>
                                                {exp.status_display}
                                            </span>
                                        </td>
                                        <td className="text-sm">{exp.logged_by_name}</td>
                                        <td className="text-sm">{exp.expense_date}</td>
                                        <td>
                                            {exp.status === 'PENDING' && canApprove && (
                                                <div className="flex gap-sm">
                                                    <button
                                                        className="btn btn-success"
                                                        style={{ padding: '4px 8px' }}
                                                        onClick={() => handleApprove(exp)}
                                                        title="Approve"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        style={{ padding: '4px 8px' }}
                                                        onClick={() => handleReject(exp)}
                                                        title="Reject"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <LogExpenseModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSubmit={fetchExpenses}
            />

            {/* Confirmation Modal for Approve */}
            {confirmModal.isOpen && confirmModal.expense && (
                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ isOpen: false, expense: null, action: null })}
                    onConfirm={executeApprove}
                    title={`Approve Expense ${confirmModal.expense.expense_ref}?`}
                    message={`Amount: ₦${parseFloat(confirmModal.expense.amount).toLocaleString()}`}
                    confirmText="Approve"
                    variant="info"
                />
            )}

            {/* Prompt Modal for Rejection Reason */}
            {promptModal.isOpen && promptModal.expense && (
                <PromptModal
                    isOpen={promptModal.isOpen}
                    onClose={() => setPromptModal({ isOpen: false, expense: null, onSubmit: null })}
                    onSubmit={(value) => promptModal.onSubmit?.(value)}
                    title="Reject Expense"
                    message={`Enter rejection reason for ${promptModal.expense.expense_ref}:`}
                    placeholder="Enter rejection reason..."
                    submitText="Reject"
                />
            )}
        </div>
    );
}
