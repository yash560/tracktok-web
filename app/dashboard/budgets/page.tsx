'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import axios from 'axios';
import { useProtectedPage } from '@/lib/useProtectedPage';
import {
  NotificationModal,
  ConfirmModal,
  NotificationState,
  ConfirmState,
  initialNotification,
  initialConfirm,
} from '@/components/NotificationModal';
import { useCurrency } from '@/components/CurrencyContext';

const CATEGORIES = [
  'food', 'shopping', 'bills', 'rent', 'utilities', 'groceries',
  'transportation', 'entertainment', 'health', 'education',
  'subscriptions', 'insurance', 'childcare', 'freelancing', 'other',
];

interface Budget {
  _id: string;
  category: string;
  amount: number;
  month: string;
}

interface SpendingByCategory {
  [category: string]: number;
}

export default function BudgetsPage() {
  useProtectedPage();
  const { fmt } = useCurrency();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spending, setSpending] = useState<SpendingByCategory>({});
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formCategory, setFormCategory] = useState('food');
  const [formAmount, setFormAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [start, end] = getMonthRange(month);
      const [budgetsRes, analyticsRes] = await Promise.all([
        axios.get(`/api/budgets?month=${month}`),
        axios.get(`/api/analytics?startDate=${start}&endDate=${end}`),
      ]);
      setBudgets(budgetsRes.data.budgets || []);
      const catSpending: SpendingByCategory = {};
      (analyticsRes.data.categoryBreakdown || []).forEach((c: any) => {
        catSpending[c.category] = c.amount;
      });
      setSpending(catSpending);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getMonthRange(m: string): [string, string] {
    const [year, mon] = m.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);
    return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
  }

  const openAdd = () => {
    setEditingBudget(null);
    const usedCategories = budgets.map((b) => b.category);
    const available = CATEGORIES.filter((c) => !usedCategories.includes(c));
    setFormCategory(available[0] || 'food');
    setFormAmount('');
    setModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormCategory(budget.category);
    setFormAmount(budget.amount.toString());
    setModalOpen(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(formAmount);
    if (!formAmount || isNaN(amount) || amount <= 0) {
      setNotification({ isOpen: true, type: 'warning', title: 'Invalid', message: 'Enter a valid amount' });
      return;
    }

    setSaving(true);
    try {
      if (editingBudget) {
        await axios.put('/api/budgets', { id: editingBudget._id, amount });
      } else {
        await axios.post('/api/budgets', { category: formCategory, amount, month });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Failed to save budget',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (budget: Budget) => {
    setConfirm({
      isOpen: true,
      title: 'Delete Budget',
      message: `Remove ${budget.category} budget of ${fmt(budget.amount)}?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/budgets?id=${budget._id}`);
          fetchData();
        } catch {
          setNotification({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete' });
        }
      },
    });
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spending[b.category] || 0), 0);
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const usedCategories = budgets.map((b) => b.category);
  const availableCategories = CATEGORIES.filter((c) => !usedCategories.includes(c));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PiggyBank className="w-7 h-7 text-primary" />
            Budgets
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set spending limits by category</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          />
          <button
            onClick={openAdd}
            disabled={availableCategories.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall Budget Usage</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {fmt(totalSpent)} <span className="text-base font-normal text-gray-500">/ {fmt(totalBudget)}</span>
            </p>
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
            overallPercent > 100 ? 'bg-danger/10 text-danger' :
            overallPercent > 80 ? 'bg-warning/10 text-warning' :
            'bg-success/10 text-success'
          }`}>
            {overallPercent.toFixed(0)}% used
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              overallPercent > 100 ? 'bg-danger' : overallPercent > 80 ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${Math.min(overallPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <div className="card text-center py-12">
          <PiggyBank className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No budgets set for this month</p>
          <p className="text-sm text-gray-500 mt-1">Add budgets to track your spending limits</p>
          <button
            onClick={openAdd}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => {
            const spent = spending[budget.category] || 0;
            const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const remaining = budget.amount - spent;
            const isOver = percent > 100;
            const isWarning = percent > 80 && !isOver;

            return (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card border-l-4 ${
                  isOver ? 'border-l-danger' : isWarning ? 'border-l-warning' : 'border-l-success'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{budget.category}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmt(spent)} of {fmt(budget.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOver && <AlertTriangle className="w-4 h-4 text-danger" />}
                    {!isOver && !isWarning && <CheckCircle className="w-4 h-4 text-success" />}
                    <button onClick={() => openEdit(budget)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(budget)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </button>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOver ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${
                    isOver ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
                  }`}>
                    {percent.toFixed(0)}%
                  </span>
                  <span className={`text-xs ${remaining < 0 ? 'text-danger font-medium' : 'text-gray-500'}`}>
                    {remaining < 0 ? `${fmt(Math.abs(remaining))} over` : `${fmt(remaining)} left`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingBudget ? 'Edit Budget' : 'Add Budget'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm capitalize"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g. 5000"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingBudget ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal notification={notification} onClose={() => setNotification(initialNotification)} />
      <ConfirmModal confirm={confirm} onClose={() => setConfirm(initialConfirm)} />
    </motion.div>
  );
}
