'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Eye,
  AlertTriangle,
  Download,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { useProtectedPage } from '@/lib/useProtectedPage';
import { useCurrency } from '@/components/CurrencyContext';
import {
  NotificationModal,
  ConfirmModal,
  NotificationState,
  ConfirmState,
  initialNotification,
  initialConfirm,
} from '@/components/NotificationModal';
import { TransactionModal } from '@/components/TransactionModal';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { DateTooltip } from '@/components/DateTooltip';
import { formatDateTime } from '@/lib/dateFormatter';

const CATEGORIES = [
  'all', 'food', 'shopping', 'bills', 'salary', 'rent', 'utilities',
  'groceries', 'transportation', 'insurance', 'childcare',
  'subscriptions', 'entertainment', 'health', 'education',
  'freelancing', 'transfer', 'other'
];

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useProtectedPage();
  const { fmt } = useCurrency();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(searchParams.get('maxAmount') || '');
  const [contact, setContact] = useState('all');
  const [source, setSource] = useState(searchParams.get('source') || 'all');
  const [receiver, setReceiver] = useState(searchParams.get('receiver') || 'all');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(
    !!(searchParams.get('category') || searchParams.get('source') || searchParams.get('receiver') || searchParams.get('type') || searchParams.get('minAmount') || searchParams.get('maxAmount'))
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [anomalyIds, setAnomalyIds] = useState<Set<string>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);
  const [confirmState, setConfirmState] = useState<ConfirmState>(initialConfirm);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await axios.get('/api/analytics/anomalies');
        const ids = new Set<string>((res.data.anomalies || []).map((a: any) => String(a._id)));
        setAnomalyIds(ids);
      } catch {
        // silently fail
      }
    };
    fetchAnomalies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, type, source, receiver]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(category !== 'all' && { category }),
        ...(minAmount && { minAmount }),
        ...(maxAmount && { maxAmount }),
        ...(contact !== 'all' && { contact }),
        ...(source !== 'all' && { source }),
        ...(receiver !== 'all' && { receiver }),
        ...(type !== 'all' && { type }),
      });

      const response = await axios.get(`/api/transactions?${params.toString()}`);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.pagination.pages);
      setTotalCount(response.data.pagination.total || 0);
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch transactions:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, minAmount, maxAmount, contact, source, receiver, type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This cannot be undone.',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/transactions?id=${id}`);
          fetchTransactions();
        } catch {
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: 'Failed to delete transaction',
          });
        }
      },
    });
  };

  const openEditModal = (t: any) => {
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const openDetailModal = (t: any) => {
    setSelectedTransaction(t);
    setShowDetailModal(true);
  };

  const openAddModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const exportCSV = useCallback(() => {
    if (!transactions.length) return;

    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Receiver', 'Source'];
    const rows = transactions.map((t: any) => [
      t.date || '',
      t.type || '',
      t.amount || '',
      t.category || '',
      (t.description || '').replace(/,/g, ' '),
      (t.receiver || '').replace(/,/g, ' '),
      (t.source || '').replace(/,/g, ' '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracktok-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  const handleViewInvoice = (transactionId: string) => {
    router.push(`/invoice/${transactionId}`);
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Transactions</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400">View and manage your financial records</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCSV}
            disabled={!transactions.length}
            className="btn-outline flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 flex-1 sm:flex-auto"
          >
            <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-10 px-3 sm:px-4 text-xs sm:text-sm md:text-base"
            />
            {loading && search !== debouncedSearch && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border rounded-xl transition w-full sm:w-auto ${showFilters ? 'bg-primary text-white border-primary' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50'
              }`}
          >
            <SlidersHorizontal className="w-4 sm:w-5 h-4 sm:h-5" />
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
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field capitalize px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  >
                    <option value="all">All Types</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Min Amount</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Max Amount</label>
                  <input
                    type="number"
                    placeholder="₹∞"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Payment Source</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI, Cash..."
                    value={source === 'all' ? '' : source}
                    onChange={(e) => setSource(e.target.value || 'all')}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. Swiggy, Amazon..."
                    value={receiver === 'all' ? '' : receiver}
                    onChange={(e) => setReceiver(e.target.value || 'all')}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-2">Contact</label>
                  <select
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="input-field px-3 sm:px-4 text-xs sm:text-sm md:text-base"
                  >
                    <option value="all">All Contacts</option>
                    {transactions
                      .filter(t => t.split && t.split.length > 0)
                      .flatMap(t => t.split.map((s: any) => s.name))
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {(category !== 'all' || minAmount || maxAmount || contact !== 'all' || source !== 'all' || receiver !== 'all' || type !== 'all') && (
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => {
                      setCategory('all');
                      setType('all');
                      setMinAmount('');
                      setMaxAmount('');
                      setContact('all');
                      setSource('all');
                      setReceiver('all');
                      router.replace('/dashboard/transactions');
                    }}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="card p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold">{transactions.length} txns</p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Spent</p>
            <p className="text-lg font-bold text-danger">
              {fmt(transactions.filter((t: any) => t.type !== 'income').reduce((s: number, t: any) => s + (t.amount || 0), 0))}
            </p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Received</p>
            <p className="text-lg font-bold text-success">
              {fmt(transactions.filter((t: any) => t.type === 'income').reduce((s: number, t: any) => s + (t.amount || 0), 0))}
            </p>
          </div>
          <div className="card p-3 sm:p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Transaction</p>
            <p className="text-lg font-bold">
              {fmt(Math.round(transactions.reduce((s: number, t: any) => s + (t.amount || 0), 0) / transactions.length))}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-dark-bg/50">
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Transaction</th>
                <th className="hidden sm:table-cell text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Category</th>
                <th className="hidden md:table-cell text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Source / City</th>
                <th className="hidden md:table-cell text-left py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-center py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-3 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                          <div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell py-4 px-6"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" /></td>
                      <td className="hidden md:table-cell py-4 px-6"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" /></td>
                      <td className="hidden md:table-cell py-4 px-6"><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 ml-auto" /></td>
                      <td className="py-4 px-6"><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => openDetailModal(t)}
                    className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/30 transition cursor-pointer"
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                          {t.type === 'income' ? (
                            <ArrowDownLeft className="w-4 sm:w-5 h-4 sm:h-5 text-success" />
                          ) : (
                            <ArrowUpRight className="w-4 sm:w-5 h-4 sm:h-5 text-danger" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                            {t.description}
                            {anomalyIds.has(String(t._id)) && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            )}
                          </span>
                          {t.isSplitTransaction && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full w-fit">
                              Split with {t.split?.filter((s: any) => !s.owner).length || 0} {t.split?.filter((s: any) => !s.owner).length === 1 ? 'person' : 'people'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell py-3 sm:py-4 px-3 sm:px-6">
                      <span className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold capitalize text-gray-600 dark:text-gray-400">
                        {t.category}
                      </span>
                    </td>
                    <td className="hidden md:table-cell py-3 sm:py-4 px-3 sm:px-6">
                      <p className="text-xs sm:text-sm font-medium">{t.source || 'Cash'}</p>
                      <p className="text-xs text-gray-400">{t.city || 'Unknown'}</p>
                    </td>
                    <td className="hidden md:table-cell py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <DateTooltip dateInput={t.createdAt || t.date}>
                        {formatDateTime(t.createdAt || t.date)}
                      </DateTooltip>
                    </td>
                    <td className={`py-3 sm:py-4 px-3 sm:px-6 text-right font-bold text-xs sm:text-sm md:text-lg ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'}{fmt(Math.abs(t.amount))}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewInvoice(t._id); }}
                          className="p-1.5 sm:p-2 hover:bg-blue-500/10 hover:text-blue-600 rounded-lg transition text-gray-400"
                          title="View invoice"
                        >
                          <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(t); }}
                          disabled={t.isSplitTransaction && !t.isOwnTransaction}
                          className={`p-1.5 sm:p-2 rounded-lg transition ${
                            t.isSplitTransaction && !t.isOwnTransaction
                              ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                              : 'hover:bg-primary/10 hover:text-primary text-gray-400'
                          }`}
                          title={t.isSplitTransaction && !t.isOwnTransaction ? 'Cannot edit shared expenses' : 'Edit'}
                        >
                          <Edit2 className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(t._id); }}
                          disabled={t.isSplitTransaction && !t.isOwnTransaction}
                          className={`p-1.5 sm:p-2 rounded-lg transition ${
                            t.isSplitTransaction && !t.isOwnTransaction
                              ? 'text-gray-200 dark:text-gray-700 cursor-not-allowed'
                              : 'hover:bg-danger/10 hover:text-danger text-gray-400'
                          }`}
                          title={t.isSplitTransaction && !t.isOwnTransaction ? 'Cannot delete shared expenses' : 'Delete'}
                        >
                          <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 sm:py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Receipt className="w-10 sm:w-12 h-10 sm:h-12 opacity-20" />
                      <p className="text-sm sm:text-lg font-medium">No transactions found</p>
                      <button onClick={openAddModal} className="text-xs sm:text-sm text-primary font-semibold hover:underline">
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
        <div className="p-3 sm:p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm text-gray-500">
            Page {page} of {totalPages} ({totalCount} transactions)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      <TransactionDetailModal
        isOpen={showDetailModal}
        transaction={selectedTransaction}
        onClose={() => setShowDetailModal(false)}
      />

      <TransactionModal
        isOpen={isModalOpen}
        apiBaseUrl={process.env.NEXT_PUBLIC_BACKEND_API_URL || ''}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
        transaction={selectedTransaction}
      />

      <NotificationModal notification={notification} onClose={() => setNotification(initialNotification)} />
      <ConfirmModal confirm={confirmState} onClose={() => setConfirmState(initialConfirm)} />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  );
}
