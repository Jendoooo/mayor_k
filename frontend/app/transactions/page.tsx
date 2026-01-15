'use client';

import { useState, useEffect } from 'react';
import api, { Transaction } from '@/app/lib/api';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await api.getTransactions();
            setTransactions(response.results);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h1>Transactions</h1>
                    <p className="text-secondary">Financial ledger of payments and refunds</p>
                </div>
            </div>

            <div className="card">
                <div className="table-container">
                    {transactions.length === 0 ? (
                        <div className="text-center py-xl text-secondary">
                            No transactions found.
                        </div>
                    ) : (
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
                                        <td className="text-sm">{txn.booking_ref || '-'}</td>
                                        <td>{txn.type_display}</td>
                                        <td>{txn.method_display}</td>
                                        <td className="font-bold">₦{parseFloat(txn.amount).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${txn.status === 'VERIFIED' || txn.status === 'CONFIRMED' ? 'badge-approved' :
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
                    )}
                </div>
            </div>
        </div>
    );
}
