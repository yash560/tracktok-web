'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingCart,
  Zap,
  Award,
  Percent,
  Layers,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useProtectedPage } from '@/lib/useProtectedPage';
import { TransactionDetailModal } from '@/components/TransactionDetailModal';
import { DateTooltip } from '@/components/DateTooltip';

const COLORS = ['#2F2E51', '#47468A', '#4DD69B', '#F37373', '#FBA94D', '#FB8C00', '#FBC02D', '#3F51B5', '#D81B60'];

interface DateRange {
  type: 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  useProtectedPage();
  const [timeframe, setTimeframe] = useState('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'current-month' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [filterContact, setFilterContact] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Helper function to get date range based on selection
  const getDateRange = (range: DateRange): { start: Date; end: Date } => {
    const now = new Date();
    let start: Date;
    let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    switch (range.type) {
      case 'current-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'last-3-months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'last-6-months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'last-12-months':
        start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      case 'all-time':
        start = new Date(2000, 0, 1);
        break;
      case 'custom':
        start = range.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
        end = range.endDate || now;
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { start, end };
  };

  const handleDateRangeChange = (type: DateRange['type']) => {
    setDateRange({ type });
    setShowDatePicker(false);
  };

  const handleCustomDateSubmit = () => {
    if (customStart && customEnd) {
      setDateRange({
        type: 'custom',
        startDate: new Date(customStart),
        endDate: new Date(customEnd)
      });
      setShowDatePicker(false);
    }
  };

  const handleViewInvoice = (transactionId: string) => {
    router.push(`/invoice/${transactionId}`);
  };

  const getDateRangeLabel = (): string => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentDate = today.getDate();

    switch (dateRange.type) {
      case 'current-month':
        return `1 ${monthStart.toLocaleDateString('en-US', { month: 'short' })} - ${currentDate} ${today.toLocaleDateString('en-US', { month: 'short' })}`;
      case 'last-month': {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        const lastDayOfLastMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
        return `1 - ${lastDayOfLastMonth} ${lastMonth.toLocaleDateString('en-US', { month: 'short' })}`;
      }
      case 'last-3-months':
        return 'Last 3 months';
      case 'last-6-months':
        return 'Last 6 months';
      case 'last-12-months':
        return 'Last 12 months';
      case 'all-time':
        return 'All time';
      case 'custom':
        if (dateRange.startDate && dateRange.endDate) {
          return `${dateRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dateRange.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return 'Custom range';
      default:
        return 'Current month';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { start, end } = getDateRange(dateRange);
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];

        const params = new URLSearchParams();
        params.append('limit', '10');
        if (filterCategory !== 'all') params.append('category', filterCategory);
        if (filterMinAmount) params.append('minAmount', filterMinAmount);
        if (filterMaxAmount) params.append('maxAmount', filterMaxAmount);
        if (filterContact !== 'all') params.append('contact', filterContact);

        const [analyticsRes, transactionsRes, monthlyRes] = await Promise.all([
          axios.get(`/api/analytics?startDate=${startStr}&endDate=${endStr}`),
          axios.get(`/api/transactions?${params.toString()}`),
          axios.get('/api/analytics/monthly'),
        ]);

        setAnalytics(analyticsRes.data);
        setTransactions(transactionsRes.data.transactions);
        setMonthlyTrend(monthlyRes.data.data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Failed to fetch dashboard data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, filterCategory, filterMinAmount, filterMaxAmount, filterContact]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8"
    >
      {/* Date Range Selector */}
      <motion.div variants={item} className="relative">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <Image src="/logo.png" alt="TrackTok Logo" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Track your finances here</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition w-full sm:w-auto"
            >
              <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">{getDateRangeLabel()}</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-full sm:w-64 max-w-xs">
                <div className="p-3 sm:p-4 space-y-2">
                  <button
                    onClick={() => handleDateRangeChange('current-month')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'current-month'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Current Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-month')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'last-month'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-3-months')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'last-3-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-6-months')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'last-6-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-12-months')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'last-12-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 12 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('all-time')}
                    className={`w-full text-left px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg transition ${dateRange.type === 'all-time'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    All Time
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Custom Range</div>
                    <div className="space-y-2 mt-2">
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleCustomDateSubmit}
                        className="w-full px-2 sm:px-3 py-2 bg-primary text-white text-xs sm:text-sm rounded hover:bg-primary-dark transition"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {/* Balance Section */}
      <motion.div variants={item}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Balance */}
          <div className="card bg-gradient-to-br from-primary to-primary-light text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Total Balance</h3>
              <Wallet className="w-6 sm:w-8 h-6 sm:h-8 opacity-80" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold font-display mb-2">
              ₹{analytics?.balance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-white/80 text-xs sm:text-sm">Across all accounts</p>
          </div>

          {/* Income */}
          <div className="card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Income</h3>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6 text-success" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-success font-display">
              ₹{analytics?.totalIncome?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">For selected period</p>
          </div>

          {/* Expense */}
          <div className="card">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Expenses</h3>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 sm:w-6 h-5 sm:h-6 text-danger" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-danger font-display">
              ₹{analytics?.totalExpense?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">For selected period</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Section */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Average Transaction */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Avg. Transaction</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-1 truncate">
                ₹{analytics?.transactionStats?.averageTransaction?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Average of all transactions</p>
        </div>

        {/* Largest Transaction */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Largest Expense</p>
              <p className="text-xl sm:text-2xl font-bold text-danger mt-1 truncate">
                ₹{analytics?.transactionStats?.largestTransaction?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-4 sm:w-5 h-4 sm:h-5 text-danger" />
            </div>
          </div>
          <p className="text-xs text-gray-500">{analytics?.transactionStats?.largestTransactionCategory || 'N/A'}</p>
        </div>

        {/* Total Transactions */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Expenses</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1 truncate">
                {analytics?.transactionStats?.totalExpenses || '0'}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Number of transactions</p>
        </div>

        {/* Top Payment Method */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Top Payment</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1 truncate">
                {analytics?.transactionStats?.topPaymentSource || 'N/A'}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Most used payment method</p>
        </div>
      </motion.div>

      {/* Advanced Metrics Section */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Savings Rate */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Savings Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                {analytics?.transactionStats?.savingsRate?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Percent className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Income vs total amount ({analytics?.totalIncome?.toFixed(0)} of {(analytics?.totalIncome + analytics?.totalExpense)?.toFixed(0)})</p>
        </div>

        {/* Top Category */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Top Category</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1 capitalize truncate">
                {analytics?.transactionStats?.topCategory || 'N/A'}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">₹{analytics?.transactionStats?.topCategoryAmount?.toFixed(0) || '0'} ({analytics?.transactionStats?.topCategoryPercentage?.toFixed(1)}% of spending)</p>
        </div>

        {/* Category Diversity */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Diversity Score</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">
                {analytics?.transactionStats?.categoryDiversity?.toFixed(0) || '0'}%
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Spending across categories</p>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${analytics?.transactionStats?.categoryDiversity || 0}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Merchants Section */}
      {analytics?.transactionStats?.topMerchants && analytics.transactionStats.topMerchants.length > 0 && (
        <motion.div variants={item} className="card">
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Top Merchants</h3>
          <div className="space-y-3 sm:space-y-4">
            {analytics.transactionStats.topMerchants.map((merchant: any, index: number) => (
              <div key={merchant.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-7 sm:w-8 h-7 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center font-semibold text-xs sm:text-sm text-primary flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm truncate">{merchant.name}</p>
                    <p className="text-xs text-gray-500">{merchant.count} transaction{merchant.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm">₹{merchant.amount.toFixed(0)}</p>
                  <div className="w-12 sm:w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${(merchant.amount / (analytics.transactionStats.topMerchants[0]?.amount || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold">Monthly Trend</h3>
            <div className="flex gap-2">
              {['month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition ${timeframe === period
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {monthlyTrend && monthlyTrend.length > 0 ? (
            <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
              <ResponsiveContainer width="100%" height={250} minWidth={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="month" stroke="#999" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#4DD69B" strokeWidth={2} dot={{ fill: '#4DD69B', r: 4 }} />
                  <Line type="monotone" dataKey="expense" stroke="#F37373" strokeWidth={2} dot={{ fill: '#F37373', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                </div>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">No trend data available</p>
                <p className="text-xs text-gray-500 mt-1">Monthly trends will appear after you add transactions</p>
              </div>
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">Spending by Category</h3>
          {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                <ResponsiveContainer width="100%" height={250} minWidth={280}>
                  <PieChart>
                    <Pie
                      data={analytics?.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {analytics?.categoryBreakdown?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 sm:mt-4 space-y-2 h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {analytics?.categoryBreakdown?.map((cat: any, index: number) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize truncate">{cat.category}</span>
                    </div>
                    <span className="font-semibold flex-shrink-0 ml-2">₹{cat.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <ShoppingCart className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                </div>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">No spending data</p>
                <p className="text-xs text-gray-500 mt-1">Add transactions to see category breakdown</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analysis Section (Source & Geographic) */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Source Analysis */}
        <div className="card">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <CreditCard className="w-5 sm:w-6 h-5 sm:h-6 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-bold">Source Analysis</h3>
          </div>
          {analytics?.sourceAnalysis && analytics.sourceAnalysis.length > 0 ? (
            <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
              <ResponsiveContainer width="100%" height={200} minWidth={280}>
                <BarChart data={analytics?.sourceAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="source" stroke="#999" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#47468A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <CreditCard className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                </div>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">No payment source data</p>
                <p className="text-xs text-gray-500 mt-1">Data will appear as you add transactions</p>
              </div>
            </div>
          )}
        </div>

        {/* Geographic Insights */}
        <div className="card">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-bold">Geographic Insights</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {analytics?.geographicInsights?.length > 0 ? (
              analytics.geographicInsights.map((insight: any, index: number) => (
                <div key={insight.city} className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm mb-1 gap-2">
                    <span className="font-semibold truncate">{insight.city}</span>
                    <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">₹{insight.amount.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${insight.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <MapPin className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                  </div>
                  <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">No location data</p>
                  <p className="text-xs text-gray-500 mt-1">Transactions with location will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold">Recent Transactions</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="groceries">Groceries</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health</option>
                  <option value="education">Education</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Min Amount</label>
                <input
                  type="number"
                  placeholder="₹0"
                  value={filterMinAmount}
                  onChange={(e) => setFilterMinAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Max Amount</label>
                <input
                  type="number"
                  placeholder="₹∞"
                  value={filterMaxAmount}
                  onChange={(e) => setFilterMaxAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Contact Filter */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Contact</label>
                <select
                  value={filterContact}
                  onChange={(e) => setFilterContact(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

            {(filterCategory !== 'all' || filterMinAmount || filterMaxAmount || filterContact !== 'all') && (
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setFilterMinAmount('');
                  setFilterMaxAmount('');
                  setFilterContact('all');
                }}
                className="text-xs text-primary hover:underline font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          {transactions && transactions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Category</th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Date</th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="text-center py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((transaction) => (
                  <tr
                    key={transaction._id}
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowTransactionDetail(true);
                    }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-card/50 transition cursor-pointer"
                  >
                    <td className="py-3 sm:py-4 px-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${transaction.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="w-4 sm:w-5 h-4 sm:h-5 text-success" />
                          ) : (
                            <ArrowUpRight className="w-4 sm:w-5 h-4 sm:h-5 text-danger" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs sm:text-sm truncate">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{transaction.source || 'Cash'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 dark:text-gray-400 capitalize text-xs sm:text-sm hidden sm:table-cell">{transaction.category}</td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden md:table-cell">
                      <DateTooltip dateInput={transaction.date}>
                        {new Date(transaction.date).toLocaleDateString()}
                      </DateTooltip>
                    </td>
                    <td className={`py-3 sm:py-4 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(0)}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                      <button
                        onClick={() => handleViewInvoice(transaction.code)}
                        className="p-1.5 sm:p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition text-gray-400"
                        title="View invoice"
                      >
                        <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 sm:mb-4">
                <Wallet className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
              </div>
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">No transactions yet</p>
              <p className="text-xs text-gray-500 mt-1">Your transactions will appear here</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showTransactionDetail}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionDetail(false)}
      />
    </motion.div>
  );
}
