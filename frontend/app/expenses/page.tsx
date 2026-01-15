'use client';

import { useState } from 'react';
import { Expense } from '@/app/lib/api';

const mockExpenses: Expense[] = [
    {
        id: '1',
        expense_ref: 'EXP-001',
        category: '1',
        category_name: 'Diesel',
        description: '50 Liters for Generator',
        amount: '45000',
        vendor_name: 'Total Station Epe',
        status: 'APPROVED',
        status_display: 'Approved',
        logged_by_name: 'Ada Receptionist',
        approved_by_name: 'Manager One',
        expense_date: '2026-01-15',
        created_at: '2026-01-15T09:00:00',
    },
    {
        id: '2',
        expense_ref: 'EXP-002',
        category: '2',
        category_name: 'Maintenance',
        description: 'Plumbing repair Room 104',
        amount: '5000',
        vendor_name: 'Local Plumber',
        status: 'PENDING',
        status_display: 'Pending Approval',
        logged_by_name: 'Ada Receptionist',
        approved_by_name: null,
        expense_date: '2026-01-15',
        created_at: '2026-01-15T11:30:00',
    }
];

export default function ExpensesPage() {
    const [expenses] = useState(mockExpenses);

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Expenses</h1>
                    <p className="text-secondary">Track operational costs and approvals</p>
                </div>
                <button className="btn btn-warning">
                    + Log Expense
                </button>
            </div>

            <div className="card">
                <div className="table-container">
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
                                    <td className="text-sm">{exp.vendor_name}</td>
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
                                        {exp.status === 'PENDING' && (
                                            <div className="flex gap-sm">
                                                <button className="btn btn-success" style={{ padding: '4px 8px' }}>✓</button>
                                                <button className="btn btn-danger" style={{ padding: '4px 8px' }}>✕</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
