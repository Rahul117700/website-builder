"use client";
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { useEffect, useState } from 'react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setError(data.error || 'Failed to fetch transactions');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          View all your billing and transactional history here.
        </p>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading transactions...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">No transactions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 text-black bg-white">Date</th>
                  <th className="text-left py-2 text-black bg-white">Type</th>
                  <th className="text-left py-2 text-black bg-white">Amount</th>
                  <th className="text-left py-2 text-black bg-white">Currency</th>
                  <th className="text-left py-2 text-black bg-white">Status</th>
                  <th className="text-left py-2 text-black bg-white">Reference</th>
                  <th className="text-left py-2 text-black bg-white">Description</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="py-2 text-black bg-white">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-black bg-white">{tx.type}</td>
                    <td className="py-2 text-black bg-white">{tx.amount}</td>
                    <td className="py-2 text-black bg-white">{tx.currency}</td>
                    <td className="py-2 text-black bg-white">{tx.status}</td>
                    <td className="py-2 text-black bg-white">{tx.reference || '-'}</td>
                    <td className="py-2 text-black bg-white">{tx.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
} 