'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, Type, MapPin, CreditCard } from 'lucide-react';
import axios from 'axios';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any; // If provided, we are in edit mode
}

const CATEGORIES = [
  'food', 'shopping', 'bills', 'salary', 'rent', 'utilities', 
  'groceries', 'transportation', 'insurance', 'childcare', 
  'subscriptions', 'entertainment', 'health', 'education', 
  'freelancing', 'transfer', 'other'
];

const SOURCES = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Wallet'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    source: 'Cash',
    city: 'Mumbai',
    notes: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        category: transaction.category,
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
        source: transaction.source || 'Cash',
        city: transaction.city || 'Mumbai',
        notes: transaction.notes || '',
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: 'food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        source: 'Cash',
        city: 'Mumbai',
        notes: '',
      });
    }
  }, [transaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (transaction) {
        await axios.put(`/api/transactions?id=${transaction._id}`, payload);
      } else {
        await axios.post('/api/transactions', payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50">
          <h2 className="text-xl font-bold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Toggle */}
            <div className="md:col-span-2 flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  formData.type === 'expense'
                    ? 'bg-danger text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  formData.type === 'income'
                    ? 'bg-success text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Income
              </button>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field pl-11 capitalize"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-semibold mb-2">Source</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input-field pl-11"
                >
                  {SOURCES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Add some details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
