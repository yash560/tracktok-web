'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Receipt,
} from 'lucide-react';
import axios from 'axios';
import { TransactionModal } from '@/components/TransactionModal';

const CATEGORIES = [
  'all', 'food', 'shopping', 'bills', 'salary', 'rent', 'utilities', 
  'groceries', 'transportation', 'insurance', 'childcare', 
  'subscriptions', 'entertainment', 'health', 'education', 
  'freelancing', 'transfer', 'other'
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(category !== 'all' && { category }),
      });

      const response = await axios.get(`/api/transactions?${params.toString()}`);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      await axios.delete(`/api/transactions?id=${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const openEditModal = (t: any) => {
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage your financial records</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition ${
              showFilters ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field capitalize"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                {/* Future: Add Date Range / Source / City Filters */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Transaction</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Category</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Source / City</th>
                <th className="text-left py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-right py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-center py-4 px-6 text-sm font-bold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                       <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                          {t.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-danger" />
                          )}
                        </div>
                        <span className="font-semibold">{t.description}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold capitalize text-gray-600 dark:text-gray-400">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                        <p className="text-sm font-medium">{t.source || 'Cash'}</p>
                        <p className="text-xs text-gray-400">{t.city || 'Unknown'}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className={`py-4 px-6 text-right font-bold text-lg ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition text-gray-400"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t._id)}
                          className="p-2 hover:bg-danger/10 hover:text-danger rounded-lg transition text-gray-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="w-12 h-12 opacity-20" />
                      <p className="text-lg font-medium">No transactions found</p>
                      <button onClick={openAddModal} className="text-primary font-semibold hover:underline">
                        Add your first transaction
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
        transaction={selectedTransaction}
      />
    </div>
  );
}
