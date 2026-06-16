'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Printer,
  Send,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { SplitGroup, Invoice } from '@/types';
import Link from 'next/link';

interface SplitGroupResponse {
  splitGroup: SplitGroup;
  expenses: Invoice[];
}

interface Settlement {
  memberName: string;
  memberPhone: string;
  amount: number;
  type: 'owes' | 'owed'; // owes = current user owes them, owed = they owe current user
}

function calculateSettlements(expenses: Invoice[], userPhone: string): Settlement[] {
  // Track net balance between each pair: positive = owed to payer, negative = owes payer
  const netBalances: { [key: string]: { amount: number; payerName: string; debtorName: string } } = {};

  expenses.forEach((expense) => {
    if (!expense.split || expense.split.length === 0) return;

    // Find who paid
    const payer = expense.split.find((s: any) => s.owner === true);
    if (!payer) return;

    const payerPhone = payer.phone;
    const payerName = payer.name;
    const isPayment = expense.category === 'payment' || expense.personalizedCategory === 'payment';

    // Calculate how much each person owes to the payer
    expense.split.forEach((split: any) => {
      if (split.phone === payerPhone) return; // Skip the payer

      const debtorPhone = split.phone;
      const debtorName = split.name;
      const amount = split.amount || 0;

      if (amount === 0) return; // Skip zero amounts

      if (isPayment) {
        // Payment: payer is paying the debtor, reduce debtor's debt to payer
        const key = `${payerPhone}|${debtorPhone}`; // Payer owes debtor
        const reverseKey = `${debtorPhone}|${payerPhone}`; // Debtor owes payer

        // Reduce the original debt
        if (netBalances[reverseKey]) {
          netBalances[reverseKey].amount -= amount;
          if (netBalances[reverseKey].amount <= 0) {
            delete netBalances[reverseKey];
          }
        }
      } else {
        // Normal expense: debtor owes payer
        const key = `${debtorPhone}|${payerPhone}`;
        const reverseKey = `${payerPhone}|${debtorPhone}`;

        if (!netBalances[key]) {
          netBalances[key] = { amount: 0, payerName, debtorName };
        }
        netBalances[key].amount += amount;

        // If there's a reverse debt, net it out
        if (netBalances[reverseKey]) {
          netBalances[reverseKey].amount -= amount;
          if (netBalances[reverseKey].amount <= 0) {
            delete netBalances[reverseKey];
          }
        }
      }
    });
  });

  // Convert to Settlement array for current user
  const settlements: Settlement[] = [];
  Object.entries(netBalances).forEach(([key, value]) => {
    const [debtorPhone, creditorPhone] = key.split('|');
    const { amount, debtorName, payerName } = value;

    if (amount <= 0) return; // Skip non-positive balances

    if (debtorPhone === userPhone) {
      // Current user owes someone
      settlements.push({
        memberName: payerName,
        memberPhone: creditorPhone,
        amount,
        type: 'owes',
      });
    } else if (creditorPhone === userPhone) {
      // Someone owes current user
      settlements.push({
        memberName: debtorName,
        memberPhone: debtorPhone,
        amount,
        type: 'owed',
      });
    }
  });

  return settlements;
}

interface PaymentState {
  isOpen: boolean;
  memberName: string;
  memberPhone: string;
  totalAmount: number;
  paymentAmount: string;
  isProcessing: boolean;
}

export default function SplitGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  const id = params.id as string;
  const [data, setData] = useState<SplitGroupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [paymentModal, setPaymentModal] = useState<PaymentState>({
    isOpen: false,
    memberName: '',
    memberPhone: '',
    totalAmount: 0,
    paymentAmount: '',
    isProcessing: false,
  });
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSplitGroup = async () => {
      try {
        const response = await axios.get(`/api/split-groups/${id}`);
        setData(response.data);

        // Calculate settlements if user has phone
        if (user?.phone || user?.phoneNumber) {
          const userPhone = (user.phone || user.phoneNumber) as string;
          const calcs = calculateSettlements(response.data.expenses, userPhone);

          // Filter out fully settled debts (amount = 0)
          const activeSettlements = calcs.filter((s: any) => s.amount > 0);

          setSettlements(activeSettlements);
        }
      } catch (err) {
        setError('Failed to load split group');
        console.error('Error fetching split group:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && !authLoading && user) {
      fetchSplitGroup();
    }
  }, [id, authLoading, user]);

  const openPaymentModal = (memberName: string, memberPhone: string, amount: number) => {
    setPaymentModal({
      isOpen: true,
      memberName,
      memberPhone,
      totalAmount: amount,
      paymentAmount: amount.toString(),
      isProcessing: false,
    });
  };

  const closePaymentModal = () => {
    setPaymentModal({
      isOpen: false,
      memberName: '',
      memberPhone: '',
      totalAmount: 0,
      paymentAmount: '',
      isProcessing: false,
    });
    setPaymentSuccess(null);
  };

  const handlePayment = async () => {
    const amount = Number.parseFloat(paymentModal.paymentAmount);

    // Validation checks
    if (!paymentModal.paymentAmount || Number.isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    if (amount > paymentModal.totalAmount) {
      alert(`Cannot pay more than ₹${paymentModal.totalAmount.toFixed(2)} owed`);
      return;
    }

    setPaymentModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      const response = await axios.post(
        `/api/split-groups/${id}/payment`,
        {
          receiverPhone: paymentModal.memberPhone,
          amount,
          payerPhone: user?.phone || user?.phoneNumber,
        }
      );

      if (response.status === 200) {
        setPaymentSuccess(`Payment of ₹${amount.toFixed(2)} initiated to ${paymentModal.memberName}`);

        // Refresh settlements after a delay
        setTimeout(() => {
          closePaymentModal();
          globalThis.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Payment failed. Try again.';
      alert(errorMsg);
    } finally {
      setPaymentModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="card p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{error || 'Split group not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const { splitGroup, expenses } = data;
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const isSettled = splitGroup.settledAt !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              title="Print"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8 md:p-12">
          {/* Split Group Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-primary" />
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {splitGroup.name}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Split group with {splitGroup.contacts.length} members
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`inline-block px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                    isSettled
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {isSettled ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      SETTLED
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      ACTIVE
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Created
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(splitGroup.createdAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-danger">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Group Members
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {splitGroup.contacts.map((contact) => (
                <div
                  key={contact.contactId}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                  {contact.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{contact.phone}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Linked Expenses ({expenses.length})
            </h2>
            {expenses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">No expenses in this split group</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                          {expense.description}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {expense.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          )}
                          {expense.category && (
                            <div className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 text-xs font-medium capitalize">
                              {expense.category}
                            </div>
                          )}
                        </div>

                        {/* Split breakdown for this expense */}
                        {expense.split && expense.split.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                              Split:
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

                      <div className="text-right">
                        <p className="text-2xl font-bold text-danger mb-3">
                          ₹{expense.amount.toFixed(2)}
                        </p>
                        <Link
                          href={`/invoice/${expense.code || expense._id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settlement Summary Section */}
          <div className="my-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Settlement Status
            </h2>

            {settlements.length === 0 && !isSettled ? (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">All settled! No pending payments.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* You Owe Section */}
                {settlements.filter((s) => s.type === 'owes').length > 0 && (
                  <div className="p-6 bg-warning/10 border border-warning/30 rounded-lg">
                    <h3 className="font-semibold text-warning mb-4 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      You Owe
                    </h3>
                    <div className="space-y-3">
                      {settlements
                        .filter((s) => s.type === 'owes')
                        .map((settlement) => (
                          <div
                            key={`${settlement.memberPhone}-owes`}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {settlement.memberName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ₹{settlement.amount.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => openPaymentModal(settlement.memberName, settlement.memberPhone, settlement.amount)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              Pay
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* You Are Owed Section */}
                {settlements.filter((s) => s.type === 'owed').length > 0 && (
                  <div className="p-6 bg-success/10 border border-success/30 rounded-lg">
                    <h3 className="font-semibold text-success mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      You Are Owed
                    </h3>
                    <div className="space-y-3">
                      {settlements
                        .filter((s) => s.type === 'owed')
                        .map((settlement) => (
                          <div
                            key={`${settlement.memberPhone}-owed`}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {settlement.memberName}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Owes ₹{settlement.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settlement Info */}
          {isSettled && splitGroup.settledAt && (
            <div className="mt-12 p-6 bg-success/10 border border-success/30 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <p className="font-semibold text-success">This split has been settled</p>
                  <p className="text-sm text-success/80 mt-1">
                    Settled on {new Date(splitGroup.settledAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generated on{' '}
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">TrackTok Split Group</p>
          </div>

          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body {
                background: white;
              }
            }
          `}</style>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-8">
            {paymentSuccess ? (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="font-semibold text-success mb-2">Payment Initiated!</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{paymentSuccess}</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Pay {paymentModal.memberName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Total owed: ₹{paymentModal.totalAmount.toFixed(2)}
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="payment-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Payment Amount
                    </label>
                    <input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={paymentModal.totalAmount}
                      value={paymentModal.paymentAmount}
                      onChange={(e) =>
                        setPaymentModal((prev) => ({
                          ...prev,
                          paymentAmount: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Max: ₹{paymentModal.totalAmount.toFixed(2)} | Remaining: ₹
                      {(paymentModal.totalAmount - Number.parseFloat(paymentModal.paymentAmount || '0')).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closePaymentModal}
                      disabled={paymentModal.isProcessing}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={paymentModal.isProcessing}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
                    >
                      {paymentModal.isProcessing ? 'Processing...' : 'Pay'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
