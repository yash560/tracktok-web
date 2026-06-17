'use client';

import { useEffect, useState } from 'react';
import { X, Search, Calendar } from 'lucide-react';
import axios from 'axios';
import { Invoice } from '@/types';
import { DateTooltip } from './DateTooltip';

interface LinkExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  splitGroupId: string;
  groupMembers?: Array<{ name: string; phone: string }>;
}

export const LinkExpenseModal: React.FC<LinkExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  splitGroupId,
  groupMembers = [],
}) => {
  const [expenses, setExpenses] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUnlinkedExpenses();
    }
  }, [isOpen]);

  const fetchUnlinkedExpenses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/split-groups/${splitGroupId}/expenses`);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Failed to fetch unlinked expenses:', error);
      alert('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const memberPhoneSet = new Set(groupMembers.map(m => m.phone?.toLowerCase()));

  const hasOnlyGroupMemberSplits = (expense: Invoice) => {
    if (!expense.split?.length || !groupMembers.length) {
      return false;
    }

    // Check if all non-owner splits are group members
    return expense.split.every(split => {
      // Skip owner (self)
      if (split.owner || split.phone?.toLowerCase() === 'self') {
        return true;
      }
      // All other splits must be group members
      return memberPhoneSet.has(split.phone?.toLowerCase() || '');
    });
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = (exp.description && exp.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const onlyGroupMembers = hasOnlyGroupMemberSplits(exp);

    return matchesSearch && onlyGroupMembers;
  });

  const handleLinkExpense = async () => {
    if (!selectedExpense) return;

    setLinking(true);
    try {
      await axios.post(`/api/split-groups/${splitGroupId}/expenses`, {
        expenseId: selectedExpense,
      });
      onSuccess();
      setSelectedExpense(null);
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Failed to link expense:', error);
      alert('Failed to link expense');
    } finally {
      setLinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Link Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {expenses.length === 0 ? 'No unlinked expenses' : 'No matching expenses'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense._id}
                  onClick={() => setSelectedExpense((expense._id === selectedExpense || !expense._id) ? null : (expense._id || null))}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedExpense === expense._id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {expense.description || 'No description'}
                      </h3>
                      {expense.intent && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 italic">
                          {expense.intent}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {expense.date && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <DateTooltip dateInput={expense.date}>
                              {new Date(expense.date).toLocaleDateString()}
                            </DateTooltip>
                          </div>
                        )}
                        {expense.category && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 text-xs font-medium capitalize">
                            {expense.category}
                          </span>
                        )}
                        {expense.personalizedCategory && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-400 text-xs font-medium">
                            {expense.personalizedCategory}
                          </span>
                        )}
                      </div>
                      {expense.receiver && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-semibold">To:</span> {expense.receiver}
                        </p>
                      )}

                      {/* Transaction details */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                          {expense.source && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Source:</span> {expense.source}
                            </div>
                          )}
                          {expense.account && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Account:</span> {expense.account}
                            </div>
                          )}
                          {expense.receiver && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Receiver:</span> {expense.receiver}
                            </div>
                          )}
                          {expense.city && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Location:</span> {expense.city}
                            </div>
                          )}
                          {expense.intent && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Intent:</span> {expense.intent}
                            </div>
                          )}
                          {expense.personalizedCategory && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Tag:</span> {expense.personalizedCategory}
                            </div>
                          )}
                          {expense.note && expense.note.trim() && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Notes:</span> {expense.note.trim()}
                            </div>
                          )}
                          {expense.ref_number && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">Ref:</span> {expense.ref_number}
                            </div>
                          )}
                          {expense.split && expense.split.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Split with:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {expense.split.map((split) => (
                                  <span
                                    key={split.$id || split.name}
                                    className="text-xs px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                  >
                                    {split.name}: ₹{split.amount.toFixed(2)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-lg font-bold text-danger">
                        ₹{expense.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={linking}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLinkExpense}
            disabled={!selectedExpense || linking}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
          >
            {linking ? 'Linking...' : 'Link Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};
