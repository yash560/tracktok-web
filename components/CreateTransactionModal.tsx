'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, Type, MapPin, CreditCard, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  splitGroupId: string;
  groupMembers?: Array<{ name: string; phone: string }>;
  apiBaseUrl?: string;
}

interface SplitMember {
  name: string;
  phone: string;
  value: number;
  amount: number;
  split: 'percentage' | 'amount' | 'share';
}

const CATEGORIES = [
  'food', 'shopping', 'bills', 'salary', 'rent', 'utilities',
  'groceries', 'transportation', 'insurance', 'childcare',
  'subscriptions', 'entertainment', 'health', 'education',
  'freelancing', 'transfer', 'other'
];

const SOURCES = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Wallet'];

export const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  splitGroupId,
  groupMembers = [],
  apiBaseUrl = 'https://webverse.thewebvale.com',
}) => {
  const { user } = useAuth();
  const userCode = (user as any)?.code || 'DEFAULT_USER';
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [stage, setStage] = useState<'input' | 'review'>('input');

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

  const callAIExpenseAPI = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe the transaction');
      return;
    }

    setAiLoading(true);
    try {
      const url = apiBaseUrl ? `${apiBaseUrl}/api/ai/expenses/chat/` : '/api/ai/expenses/chat/';
      const token = process.env.NEXT_PUBLIC_BACKEND_TOKEN;
      const result = await axios.post(url, {
        user_prompt: aiPrompt,
        user_code: userCode,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setParsedData(result.data.data);
      setStage('review');
    } catch (error) {
      const msg = error instanceof Error ? error.message : (error as any).response?.data?.error || 'Failed to process transaction';
      alert(msg);
    } finally {
      setAiLoading(false);
    }
  };

  const resetAI = () => {
    setAiPrompt('');
    setParsedData(null);
    setStage('input');
  };

  useEffect(() => {
    if (!isOpen) {
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
      setContactName('');
      setContactPhone('');
      resetAI();
    }
  }, [isOpen]);

  useEffect(() => {
    if (splitMembers.length > 0) {
      calculateSplitAmounts(splitMembers);
    }
  }, [formData.amount, splitType, splitMembers.length]);

  const handleAddContact = () => {
    if (!contactName || !contactPhone) return;

    const amount = parseFloat(formData.amount);
    const newMember: SplitMember = {
      name: contactName,
      phone: contactPhone,
      value: splitType === 'percentages' ? 0 : splitType === 'shares' ? 1 : 0,
      amount: 0,
      split: splitType === 'percentages' ? 'percentage' : splitType === 'shares' ? 'share' : 'amount',
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
    } else if (splitType === 'amounts') {
      // amounts type: value is the actual amount
      members.forEach(m => {
        m.amount = m.value;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        amount: parseFloat(formData.amount),
        split_group_id: splitGroupId,
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
            name: m.name,
            phone: m.phone,
            contact: m.name,
            value: m.value,
            amount: m.amount,
            split: splitType === 'percentages' ? 'percentage' : splitType === 'shares' ? 'share' : 'amount',
            owner: false,
          })),
        ];
      }

      const response = await axios.post('/api/transactions', payload);

      // Link the transaction to split group by updating the split group's expenses array
      if (response.data.id) {
        await axios.post(`/api/split-groups/${splitGroupId}/expenses`, {
          expenseId: response.data.id,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      alert('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white dark:bg-dark-card w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-dark-bg/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create & Link Transaction
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-4 pb-0 flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'ai'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
          >
            🤖 AI
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
          >
            ✏️ Manual
          </button>
        </div>

        {/* Form */}
        {mode === 'ai' && stage === 'input' && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Examples:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• "add 500 for food today"</li>
                  <li>• "paid 1200 to swiggy yesterday for dinner"</li>
                  <li>• "transfer 5000 to savings account"</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Transaction Description
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g., paid 500 for groceries at dmart today"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={callAIExpenseAPI}
                  disabled={aiLoading}
                  className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {aiLoading ? 'Processing...' : 'Parse with AI'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'ai' && stage === 'review' && parsedData && (
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              {parsedData.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{parsedData.amount}</span>
                </div>
              )}
              {parsedData.type && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">{parsedData.type}</span>
                </div>
              )}
              {parsedData.date && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{parsedData.date}</span>
                </div>
              )}
              {parsedData.receiver && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Receiver:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{parsedData.receiver}</span>
                </div>
              )}
              {parsedData.category && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="font-bold text-gray-900 dark:text-white capitalize">{parsedData.category}</span>
                </div>
              )}
              {parsedData.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Description:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{parsedData.description}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStage('input')}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    description: parsedData.description || parsedData.receiver || aiPrompt,
                    amount: parsedData.amount?.toString() || '',
                    category: parsedData.category || 'food',
                    type: parsedData.type === 'credit' ? 'income' : 'expense',
                    date: parsedData.date || new Date().toISOString().split('T')[0],
                  }));
                  resetAI();
                }}
                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Toggle */}
              <div className="md:col-span-2 flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${formData.type === 'expense'
                    ? 'bg-danger text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${formData.type === 'income'
                    ? 'bg-success text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Income
                </button>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Description</label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="What was this for?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary capitalize"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Source</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-11 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add some details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Split Toggle */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowSplit(!showSplit)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  <Plus className="w-4 h-4" />
                  {showSplit ? 'Remove Split' : 'Add Split'}
                </button>
              </div>

              {/* Split Section */}
              {showSplit && (
                <>
                  {/* Split Type Tabs */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Split Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['evenly', 'amounts', 'shares', 'percentages'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSplitType(type)}
                          className={`px-3 py-2 rounded-lg font-semibold text-sm transition capitalize ${splitType === type
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
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Add Person</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
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
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.phone}</p>
                          </div>

                          {splitType === 'evenly' ? (
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">₹{member.amount.toFixed(2)}</p>
                          ) : splitType === 'percentages' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={member.value}
                                onChange={(e) => handleSplitValueChange(idx, parseFloat(e.target.value))}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={member.value}
                                onChange={(e) => handleSplitValueChange(idx, parseFloat(e.target.value))}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <span className="text-sm text-gray-900 dark:text-white">{splitType === 'shares' ? 'share' : '₹'}</span>
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

              <div className="pt-4 flex gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create & Link'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
