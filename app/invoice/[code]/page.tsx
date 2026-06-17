'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useProtectedPage } from '@/lib/useProtectedPage';
import {
  ArrowLeft,
  Download,
  Printer,
  Users,
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { Invoice, SplitGroup } from '@/types';
import { DateTooltip } from '@/components/DateTooltip';

interface TransactionResponse {
  transaction: Invoice;
  splitGroup?: SplitGroup | null;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  useProtectedPage();
  const code = params.code as string;
  const [transaction, setTransaction] = useState<Invoice | null>(null);
  const [splitGroup, setSplitGroup] = useState<SplitGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await axios.get(`/api/transactions/${code}`);
        setTransaction(response.data.transaction);
        if (response.data.splitGroup) {
          setSplitGroup(response.data.splitGroup);
        }
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setError('Failed to load transaction');
        }
        console.error('Error fetching transaction:', err);
      } finally {
        setLoading(false);
      }
    };

    if (code && !authLoading) {
      fetchTransaction();
    }
  }, [code, authLoading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg px-4 sm:px-6 md:px-12 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
          <div className="card p-4 sm:p-6 md:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{error || 'Transaction not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === 'income';
  const isCredit = transaction.type === 'credit';
  const transactionDate = new Date(transaction.date || (transaction.createdAt as any));
  const invoiceNumber = transaction._id?.substring(0, 8).toUpperCase() || 'N/A';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('invoice-content');
    if (element) {
      // Simple approach: open print dialog which can be saved as PDF
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
              title="Print invoice"
            >
              <Printer className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm"
              title="Download as PDF"
            >
              <Download className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          id="invoice-content"
          className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-12"
        >
          {/* Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-4 sm:pb-6 md:pb-8 mb-4 sm:mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Transaction Record</p>
              </div>
              <div className="w-full sm:w-auto sm:text-right">
                <div className={`inline-block px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                  isIncome || isCredit
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger'
                } font-semibold`}>
                  {isIncome ? 'INCOME' : isCredit ? 'CREDIT' : 'EXPENSE'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-8">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Invoice Number
                </p>
                <p className="text-base sm:text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {invoiceNumber}
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Date
                </p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  <DateTooltip dateInput={transactionDate}>
                    {transactionDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </DateTooltip>
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
            {/* From/To */}
            <div>
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2 sm:mb-3">
                {isIncome ? 'Received From' : 'Transaction From'}
              </p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {transaction.source || (isIncome ? 'Income Source' : 'Personal Account')}
              </p>
              {transaction.receiver && (
                <>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 sm:mt-3">To:</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{transaction.receiver}</p>
                </>
              )}
            </div>

            {/* Amount */}
            <div className="sm:text-right">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2 sm:mb-3">
                Amount
              </p>
              <p className={`text-2xl sm:text-3xl md:text-4xl font-bold font-display ${
                isIncome || isCredit ? 'text-success' : 'text-danger'
              }`}>
                {isIncome || isCredit ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 sm:py-6 md:py-8 mb-4 sm:mb-6 md:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {/* Description */}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Description
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                  {transaction.description}
                </p>
              </div>

              {/* Category */}
              {transaction.category && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Category
                  </p>
                  <div className="inline-block px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-semibold text-blue-700 dark:text-blue-400 capitalize text-sm">
                      {transaction.category}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {transaction.source && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Payment Method
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                    {transaction.source}
                  </p>
                </div>
              )}

              {/* Location */}
              {transaction.city && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Location
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                    {transaction.city}
                  </p>
                </div>
              )}

              {/* Account */}
              {transaction.account && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Account
                  </p>
                  <p className="text-sm sm:text-base font-mono font-semibold text-gray-900 dark:text-white break-all">
                    {transaction.account}
                  </p>
                </div>
              )}

              {/* Reference Number */}
              {transaction.ref_number && (
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                    Reference Number
                  </p>
                  <p className="text-sm sm:text-base font-mono font-semibold text-gray-900 dark:text-white break-all">
                    {transaction.ref_number}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Split Details */}
          {transaction.split && transaction.split.length > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Split Details
                </p>
              </div>
              {splitGroup && (
                <Link href={`/split-groups/${splitGroup._id}`}>
                  <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 cursor-pointer transition">
                    <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200">
                      {splitGroup.name}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      Created <DateTooltip dateInput={splitGroup.createdAt || ''}>{new Date(splitGroup.createdAt || '').toLocaleDateString()}</DateTooltip>
                    </p>
                  </div>
                </Link>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Person
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Split
                      </th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.split.map((splitItem) => (
                      <tr
                        key={splitItem.$id || splitItem.name}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <p className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {splitItem.name}
                          </p>
                          {splitItem.phone && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {splitItem.phone}
                            </p>
                          )}
                        </td>
                        <td className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white text-xs sm:text-sm">
                          {splitItem.value}
                          {splitItem.split === 'percentage' ? '%' : ''}
                        </td>
                        <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">
                          ₹{splitItem.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {(transaction.note || transaction.intent) && (
            <div className="mb-4 sm:mb-6 md:mb-8">
              <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2 sm:mb-3">
                Notes
              </p>
              <div className="bg-gray-50 dark:bg-dark-bg p-3 sm:p-4 md:p-5 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed text-sm sm:text-base">
                  {transaction.note || transaction.intent}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6 md:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
              Invoice generated on{' '}
              <DateTooltip dateInput={new Date()}>
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </DateTooltip>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              This is an electronic invoice record from TrackTok
            </p>
          </div>

          {/* Print Styles */}
          <style jsx>{`
            @media print {
              body {
                background: white;
              }
              #invoice-content {
                box-shadow: none;
                border: none;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
