'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Calendar, DollarSign, Tag, Type, MapPin, CreditCard, Plus, Minus, Users, Camera, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';

interface SplitGroupContact {
  name: string;
  contactId: string;
  phone?: string | null;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: any;
  apiBaseUrl?: string;
  splitGroupId?: string;
  splitGroupContacts?: SplitGroupContact[];
  splitGroupCustomerId?: string;
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
  apiBaseUrl = 'https://webverse.thewebvale.com',
  splitGroupId,
  splitGroupContacts,
  splitGroupCustomerId,
}) => {
  const { user } = useAuth();
  const userCode = (user as any)?.code || 'DEFAULT_USER';
  const [mode, setMode] = useState<'ai' | 'manual'>(!transaction ? 'ai' : 'manual');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const callAIExpenseAPI = async () => {
    if (!aiPrompt.trim()) {
      alert('Please describe the transaction');
      return;
    }

    setAiLoading(true);
    try {
      const url = apiBaseUrl ? `${apiBaseUrl}/api/ai/expenses/chat/` : '/api/ai/expenses/chat/';
      const token = process.env.NEXT_PUBLIC_BACKEND_TOKEN;
      const userPhone = (user as any)?.phone || (user as any)?.phoneNumber || '';
      const userName = (user as any)?.displayName || (user as any)?.name || 'You';

      const payload: any = {
        user_prompt: aiPrompt,
        user_code: userCode,
      };

      if (splitGroupContacts && splitGroupContacts.length > 0) {
        const totalMembers = splitGroupContacts.length;
        const splitPerMember = 100 / totalMembers;

        payload.context = {
          split: splitGroupContacts.map(c => {
            const isOwner = c.phone === userPhone;
            return {
              contact: isOwner ? 'me' : c.name,
              value: Number.parseFloat(splitPerMember.toFixed(2)),
              split: 'percentage',
              amount: 0,
              name: isOwner ? userName : c.name,
              phone: c.phone || '',
              ...(isOwner && { owner: true }),
              $type: 'lookup',
              $collection: 'user_contacts',
              $id: c.contactId,
              $customer_id: splitGroupCustomerId || 'webverse',
              $label: isOwner ? userName : c.name,
            };
          }),
        };
      }

      const result = await axios.post(url, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const parsed = result.data.data;
      const txPayload: any = {
        description: parsed.description || parsed.receiver || aiPrompt,
        amount: parseFloat(parsed.amount) || 0,
        category: parsed.category || 'food',
        type: parsed.type === 'credit' ? 'income' : 'expense',
        date: parsed.date || new Date().toISOString().split('T')[0],
        source: parsed.source || 'Cash',
        city: parsed.city || 'Mumbai',
        notes: parsed.notes || '',
      };

      if (parsed.split && Array.isArray(parsed.split)) {
        txPayload.split = parsed.split.map((s: any) => {
          if (s.split === 'percentage' && s.value > 0 && !s.amount) {
            return { ...s, amount: Math.round((s.value / 100) * txPayload.amount * 100) / 100 };
          }
          return s;
        });
      } else if (showSplit && splitMembers.length > 0) {
        const userSplitAmount = txPayload.amount - splitMembers.reduce((sum: number, m: SplitMember) => sum + m.amount, 0);
        txPayload.split = [
          {
            name: userName,
            phone: userPhone,
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

      if (splitGroupId) {
        await axios.post(`/api/split-groups/${splitGroupId}/expense`, txPayload);
      } else {
        await axios.post('/api/transactions', txPayload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : (error as any).response?.data?.error || 'Failed to process transaction';
      alert(msg);
    } finally {
      setAiLoading(false);
    }
  };

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
      setMode('manual');
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
      if (splitGroupContacts && splitGroupContacts.length > 0) {
        const userPhone = (user as any)?.phone || (user as any)?.phoneNumber || '';
        const members: SplitMember[] = splitGroupContacts
          .filter(c => c.phone !== userPhone)
          .map(c => ({
            name: c.name,
            phone: c.phone || '',
            contact: c.name,
            value: 0,
            amount: 0,
            split: 'percentage' as const,
            owner: false,
          }));
        setSplitMembers(members);
        setShowSplit(true);
        setSplitType('evenly');
      } else {
        setShowSplit(false);
        setSplitMembers([]);
      }
      setAiPrompt('');
    }
  }, [transaction, isOpen]);

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

  useEffect(() => {
    if (splitMembers.length > 0) {
      const updated = [...splitMembers];
      calculateSplitAmounts(updated);
      setSplitMembers(updated);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        amount: parseFloat(formData.amount),
        ...(receiptImage && { receiptImage }),
      };

      if (showSplit && splitMembers.length > 0) {
        const userPhone = (user as any)?.phone || (user as any)?.phoneNumber || 'self';
        const userName = (user as any)?.displayName || (user as any)?.name || 'You';
        const userSplitAmount = parseFloat(formData.amount) - splitMembers.reduce((sum, m) => sum + m.amount, 0);
        payload.split = [
          {
            name: userName,
            phone: userPhone,
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
      } else if (splitGroupId) {
        await axios.post(`/api/split-groups/${splitGroupId}/expense`, payload);
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

        {!transaction && (
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
        )}

        {!transaction && mode === 'ai' && (
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
                  {aiLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {(transaction || mode === 'manual') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Toggle */}
              <div className="md:col-span-2 flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                  type="button"
                  disabled={isSplitTransaction}
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${formData.type === 'expense'
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
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${formData.type === 'income'
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

              {/* Receipt Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Receipt (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingReceipt(true);
                    try {
                      const formDataUpload = new FormData();
                      formDataUpload.append('file', file);
                      const res = await axios.post('/api/upload', formDataUpload, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setReceiptImage(res.data.url);
                    } catch {
                      alert('Failed to upload receipt');
                    } finally {
                      setUploadingReceipt(false);
                    }
                  }}
                />
                {receiptImage ? (
                  <div className="relative inline-block">
                    <img src={receiptImage} alt="Receipt" className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingReceipt}
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition disabled:opacity-50 w-full justify-center"
                  >
                    {uploadingReceipt ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                    ) : (
                      <><Camera className="w-4 h-4" /> Upload Receipt</>
                    )}
                  </button>
                )}
              </div>

              {/* Split Toggle */}
              {!splitGroupId && (
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
              )}
              {splitGroupId && showSplit && (
                <div className="md:col-span-2">
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Split among group members ({splitMembers.length + 1} people)
                  </p>
                </div>
              )}

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
                  {!splitGroupId && (
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
                  )}

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

                          {!splitGroupId && (
                            <button
                              type="button"
                              onClick={() => handleRemoveContact(idx)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
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
        )}
      </div>
    </div>
  );
};
