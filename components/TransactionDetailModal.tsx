'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    X,
    Calendar,
    Tag,
    CreditCard,
    MapPin,
    Building2,
    Home,
    ArrowUpRight,
    ArrowDownLeft,
    MessageSquare,
    FileText,
    Clock,
    Eye,
    RefreshCw,
} from 'lucide-react';
import { DateTooltip } from './DateTooltip';

const CATEGORY_STYLES: Record<string, string> = {
    food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    groceries: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    shopping: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    entertainment: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    transportation: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    bills: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    rent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    salary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    transfer: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    health: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    education: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    insurance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    subscriptions: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    gifts: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
    freelancing: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    childcare: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

function getCategoryStyle(category: string): string {
    return CATEGORY_STYLES[category?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

interface TransactionDetailModalProps {
    readonly isOpen: boolean;
    readonly transaction: Record<string, unknown> | null;
    readonly onClose: () => void;
}

export function TransactionDetailModal({
    isOpen,
    transaction: txn,
    onClose,
}: TransactionDetailModalProps) {
    const router = useRouter();

    if (!txn) return null;

    const transaction = txn as any;
    const isIncome = transaction.type === 'income';
    const isCredit = transaction.type === 'credit';

    const handleViewInvoice = () => {
        router.push(`/invoice/${transaction.code}`);
        onClose();
    };

    const handleSetAsRecurring = () => {
        const params = new URLSearchParams({
            prefill: 'true',
            title: String(transaction.description || transaction.receiver || ''),
            amount: String(Math.abs(Number(transaction.amount))),
            category: String(transaction.category || 'bills'),
        });
        router.push(`/dashboard/reminders?${params.toString()}`);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[999]"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md max-h-[calc(100vh-2rem)] bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div
                                className={`p-6 bg-gradient-to-r ${isIncome || isCredit
                                    ? 'from-success to-success-dark'
                                    : 'from-danger to-danger-dark'
                                    } text-white flex items-start justify-between flex-shrink-0`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        {isIncome || isCredit ? (
                                            <ArrowDownLeft className="w-6 h-6" />
                                        ) : (
                                            <ArrowUpRight className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg truncate">
                                            {String(transaction.description || transaction.receiver || 'Transaction')}
                                        </h2>
                                        <p className="text-sm opacity-90">
                                            {String(transaction.source || (isIncome ? 'Income' : 'Expense'))}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/80 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="overflow-y-auto flex-1 flex flex-col">
                                {/* Amount */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg flex-shrink-0">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Amount</p>
                                    <p
                                        className={`text-4xl font-bold font-display ${isIncome || isCredit ? 'text-success' : 'text-danger'
                                            }`}
                                    >
                                        {isIncome || isCredit ? '+' : '-'}₹{Math.abs(Number(transaction.amount)).toFixed(2)}
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div className="p-6 space-y-4">
                                {/* Date */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                                        <p className="font-semibold">
                                            {transaction.date ? (
                                                <DateTooltip dateInput={transaction.date}>
                                                    {new Date(transaction.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </DateTooltip>
                                            ) : (
                                                <DateTooltip dateInput={transaction.createdAt || transaction.receivedAt}>
                                                    {new Date(
                                                        transaction.createdAt || transaction.receivedAt
                                                    ).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </DateTooltip>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Category */}
                                {transaction.category && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                                            <Tag className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getCategoryStyle(transaction.category)}`}>
                                                    {transaction.category}
                                                </span>
                                                {transaction.personalizedCategory && transaction.personalizedCategory !== transaction.category && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                        {transaction.personalizedCategory}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Method */}
                                {transaction.source && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Payment Method
                                            </p>
                                            <p className="font-semibold">{transaction.source}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Merchant/Receiver */}
                                {transaction.receiver && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Merchant</p>
                                            <p className="font-semibold">{transaction.receiver}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                {(transaction.city || transaction.address) && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-pink-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                                            <p className="font-semibold">{transaction.city || transaction.address}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Account */}
                                {transaction.account && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                                            <Home className="w-5 h-5 text-cyan-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Account</p>
                                            <p className="font-semibold font-mono">{transaction.account}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Reference Number */}
                                {transaction.ref_number && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Reference</p>
                                            <p className="font-semibold font-mono text-sm">{transaction.ref_number}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Split Transaction Details */}
                                {transaction.isSplitTransaction && transaction.split && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Split Details</p>
                                            <div className="space-y-2">
                                                {transaction.split.map((member: any) => (
                                                    <div key={member.phone || member.$id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-semibold text-sm">{member.name}</p>
                                                            <p className="text-sm font-bold text-purple-600">
                                                                ₹{Math.abs(member.amount || 0).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {member.split === 'percentage' ? `${member.value}%` : 'Fixed amount'}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Intent/Notes */}
                                {(transaction.intent || transaction.notes) && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                                            <p className="font-semibold text-sm">
                                                {transaction.intent || transaction.notes}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        Created{' '}
                                        <DateTooltip dateInput={transaction.createdAt || new Date()}>
                                            {new Date(transaction.createdAt || new Date()).toLocaleDateString()}{' '}
                                            at{' '}
                                            {new Date(transaction.createdAt || new Date()).toLocaleTimeString(
                                                'en-US',
                                                { hour: '2-digit', minute: '2-digit' }
                                            )}
                                        </DateTooltip>
                                    </span>
                                </div>
                            </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-dark-bg space-y-2 flex-shrink-0">
                                <button
                                    onClick={handleViewInvoice}
                                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Invoice
                                </button>
                                {!(isIncome || isCredit) && (
                                    <button
                                        onClick={handleSetAsRecurring}
                                        className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Set as Recurring
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
