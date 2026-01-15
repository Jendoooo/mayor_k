'use client';

import { useState } from 'react';
import { Transaction } from '@/app/lib/api';

const mockTransactions: Transaction[] = [
    {
        id: '1',
        transaction_ref: 'TXN-001',
        booking: '1',
        booking_ref: 'MK-260115-A1B2',
        transaction_type: 'PAYMENT',
        type_display: 'Payment',
        payment_method: 'CASH',
        method_display: 'Cash',
        status: 'VERIFIED',
        status_display: 'Verified',
        amount: '12000',
        processed_by_name: 'Ada Receptionist',
        created_at: '2026-01-15T14:35:00',
    },
    {
        id: '2',
        transaction_ref: 'TXN-002',
        booking: '2',
        booking_ref: 'MK-260115-C3D4',
        transaction_type: 'PAYMENT',
        type_display: 'Payment',
        payment_method: 'TRANSFER',
        method_display: 'Bank Transfer',
        status: 'PENDING',
        status_display: 'Pending Verification',
        amount: '5000',
        processed_by_name: 'Ada Receptionist',
        created_at: '2026-01-15T16:05:00',
    }
];

export default function TransactionsPage() {
    const [transactions] = useState(mockTransactions);

    return (
        <div>
            <div className="flex justify-between items-center mb-lg">
                <div>
                    <h1>Transactions</h1>
                    <p className="text-secondary">Financial ledger of payments and refunds</p>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Booking</th>
                                <th>Type</th>
                                <th>Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Processed By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td className="font-mono">{txn.transaction_ref}</td>
                                    <td className="text-sm">{txn.booking_ref}</td>
                                    <td>{txn.type_display}</td>
                                    <td>{txn.method_display}</td>
                                    <td className="font-bold">₦{parseFloat(txn.amount).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${txn.status === 'VERIFIED' ? 'badge-approved' :
                                                txn.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                                            }`}>
                                            {txn.status_display}
                                        </span>
                                    </td>
                                    <td className="text-sm">{txn.processed_by_name}</td>
                                    <td className="text-sm">{new Date(txn.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
