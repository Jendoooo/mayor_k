'use client';

import { useState, useEffect } from 'react';
import api, { Expense } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import LogExpenseModal from '@/app/components/LogExpenseModal';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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
        if (!confirm(`Approve expense ${expense.expense_ref}?`)) return;
        try {
            await api.approveExpense(expense.id);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve expense');
        }
    };

    const handleReject = async (expense: Expense) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await api.rejectExpense(expense.id, reason);
            fetchExpenses();
        } catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject expense');
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

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Expenses</h1>
                    <p className="text-secondary">Track operational costs and approvals</p>
                </div>
                <button
                    className="btn btn-warning"
                    onClick={() => setIsLogModalOpen(true)}
                >
                    + Log Expense
                </button>
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
        </div>
    );
}
