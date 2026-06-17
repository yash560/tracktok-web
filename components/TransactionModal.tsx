'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, Type, MapPin, CreditCard, Plus, Minus, Users } from 'lucide-react';
import axios from 'axios';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any;
}

interface SplitMember {
  name: string;
  phone: string;
  contact: string;
  value: number;
  amount: number;
  split: 'percentage' | 'amount' | 'share';
  owner?: boolean;
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

  const [showSplit, setShowSplit] = useState(false);
  const [splitType, setSplitType] = useState<'evenly' | 'amounts' | 'shares' | 'percentages'>('evenly');
  const [splitMembers, setSplitMembers] = useState<SplitMember[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

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
      setShowSplit(false);
      setSplitMembers([]);
    }
  }, [transaction, isOpen]);

  useEffect(() => {
    if (splitMembers.length > 0) {
      calculateSplitAmounts(splitMembers);
    }
  }, [formData.amount, splitType, splitMembers.length]);

  if (!isOpen) return null;

  const isSplitTransaction = transaction?.isSplitTransaction && !transaction?.isOwnTransaction;

  const handleAddContact = () => {
    if (!contactName || !contactPhone) return;

    const amount = parseFloat(formData.amount);
    const newMember: SplitMember = {
      name: contactName,
      phone: contactPhone,
      contact: contactName,
      value: splitType === 'percentages' ? 0 : splitType === 'shares' ? 1 : 0,
      amount: 0,
      split: splitType === 'percentages' ? 'percentage' : splitType === 'shares' ? 'share' : 'amount',
      owner: false,
    };

    setSplitMembers([...splitMembers, newMember]);
    setContactName('');
    setContactPhone('');
  };

  const handleRemoveContact = (index: number) => {
    setSplitMembers(splitMembers.filter((_, i) => i !== index));
  };

  const handleSplitValueChange = (index: number, value: number) => {
    const updated = [...splitMembers];
    updated[index].value = value;
    setSplitMembers(updated);
    calculateSplitAmounts(updated);
  };

  const calculateSplitAmounts = (members: SplitMember[]) => {
    const amount = parseFloat(formData.amount) || 0;

    if (splitType === 'evenly') {
      const share = amount / (members.length + 1);
      members.forEach(m => {
        m.amount = parseFloat(share.toFixed(2));
      });
    } else if (splitType === 'percentages') {
      const total = members.reduce((sum, m) => sum + m.value, 0);
      if (total > 0) {
        members.forEach(m => {
          m.amount = parseFloat(((amount * m.value) / total).toFixed(2));
        });
      }
    } else if (splitType === 'shares') {
      const total = members.reduce((sum, m) => sum + m.value, 0);
      if (total > 0) {
        members.forEach(m => {
          m.amount = parseFloat(((amount * m.value) / total).toFixed(2));
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (showSplit && splitMembers.length > 0) {
        const userSplitAmount = parseFloat(formData.amount) - splitMembers.reduce((sum, m) => sum + m.amount, 0);
        payload.split = [
          {
            name: 'You',
            phone: 'self',
            contact: 'me',
            value: splitType === 'percentages' ? 100 - splitMembers.reduce((sum, m) => sum + m.value, 0) : splitType === 'shares' ? 1 : 0,
            amount: userSplitAmount,
            split: splitType === 'percentages' ? 'percentage' : splitType === 'shares' ? 'share' : 'amount',
            owner: true,
          },
          ...splitMembers.map(m => ({
            ...m,
            split: splitType === 'percentages' ? 'percentage' : splitType === 'shares' ? 'share' : 'amount',
          })),
        ];
      }

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white dark:bg-dark-card w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50 flex-shrink-0">
          <h2 className="text-xl font-bold">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSplitTransaction && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800 flex-shrink-0">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              This is a shared expense. Only the original owner can edit it.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Toggle */}
            <div className="md:col-span-2 flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                type="button"
                disabled={isSplitTransaction}
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  formData.type === 'expense'
                    ? 'bg-danger text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isSplitTransaction ? 'cursor-not-allowed' : ''}`}
              >
                Expense
              </button>
              <button
                type="button"
                disabled={isSplitTransaction}
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  formData.type === 'income'
                    ? 'bg-success text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isSplitTransaction ? 'cursor-not-allowed' : ''}`}
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
                  disabled={isSplitTransaction}
                  placeholder="What was this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field pl-11 disabled:opacity-50 disabled:cursor-not-allowed"
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
                rows={2}
                placeholder="Add some details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field resize-none"
              />
            </div>

            {/* Split Toggle */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowSplit(!showSplit)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
              >
                <Users className="w-4 h-4" />
                {showSplit ? 'Remove Split' : 'Add Split'}
              </button>
            </div>

            {/* Split Section */}
            {showSplit && (
              <>
                {/* Split Type Tabs */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Split Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {(['evenly', 'amounts', 'shares', 'percentages'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSplitType(type)}
                        className={`px-3 py-2 rounded-lg font-semibold text-sm transition capitalize ${
                          splitType === type
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Contact */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Add Person</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="input-field flex-1"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddContact}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Split Members */}
                {splitMembers.length > 0 && (
                  <div className="md:col-span-2 space-y-2">
                    {splitMembers.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.phone}</p>
                        </div>

                        {splitType === 'evenly' ? (
                          <p className="font-semibold text-sm">₹{member.amount.toFixed(2)}</p>
                        ) : splitType === 'percentages' ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={member.value}
                              onChange={(e) => handleSplitValueChange(idx, parseFloat(e.target.value))}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-sm font-semibold">%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={member.value}
                              onChange={(e) => handleSplitValueChange(idx, parseFloat(e.target.value))}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                            />
                            <span className="text-sm">{splitType === 'shares' ? 'share' : '₹'}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveContact(idx)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
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
              disabled={loading || isSplitTransaction}
              className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition disabled:opacity-50"
            >
              {isSplitTransaction ? 'View Only' : loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
