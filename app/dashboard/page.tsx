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
import { TransactionDetailModal } from '@/components/TransactionDetailModal';

const COLORS = ['#2F2E51', '#47468A', '#4DD69B', '#F37373', '#FBA94D', '#FB8C00', '#FBC02D', '#3F51B5', '#D81B60'];

interface DateRange {
  type: 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export default function DashboardPage() {
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

        const [analyticsRes, transactionsRes, monthlyRes] = await Promise.all([
          axios.get(`/api/analytics?startDate=${startStr}&endDate=${endStr}`),
          axios.get('/api/transactions?limit=10'),
          axios.get('/api/analytics/monthly'),
        ]);

        setAnalytics(analyticsRes.data);
        setTransactions(transactionsRes.data.transactions);
        setMonthlyTrend(monthlyRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

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
      className="space-y-8"
    >
      {/* Date Range Selector */}
      <motion.div variants={item} className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <Image src="/logo.png" alt="TrackTok Logo" width={48} height={48} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track your finances here</p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-medium text-gray-700 dark:text-gray-300">{getDateRangeLabel()}</span>
            </button>

            {showDatePicker && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-64">
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => handleDateRangeChange('current-month')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'current-month'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Current Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-month')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'last-month'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-3-months')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'last-3-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-6-months')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'last-6-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 6 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('last-12-months')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'last-12-months'
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    Last 12 Months
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('all-time')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${dateRange.type === 'all-time'
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
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={handleCustomDateSubmit}
                        className="w-full px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark transition"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Balance */}
          <div className="card bg-gradient-to-br from-primary to-primary-light text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Balance</h3>
              <Wallet className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold font-display mb-2">
              ₹{analytics?.balance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-white/80 text-sm">Across all accounts</p>
          </div>

          {/* Income */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Income</h3>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-3xl font-bold text-success font-display">
              ₹{analytics?.totalIncome?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">For selected period</p>
          </div>

          {/* Expense */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Expenses</h3>
              <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-danger" />
              </div>
            </div>
            <p className="text-3xl font-bold text-danger font-display">
              ₹{analytics?.totalExpense?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">For selected period</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Section */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Transaction */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg. Transaction</p>
              <p className="text-2xl font-bold text-primary mt-1">
                ₹{analytics?.transactionStats?.averageTransaction?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Average of all transactions</p>
        </div>

        {/* Largest Transaction */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Largest Expense</p>
              <p className="text-2xl font-bold text-danger mt-1">
                ₹{analytics?.transactionStats?.largestTransaction?.toFixed(0) || '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-danger" />
            </div>
          </div>
          <p className="text-xs text-gray-500">{analytics?.transactionStats?.largestTransactionCategory || 'N/A'}</p>
        </div>

        {/* Total Transactions */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {analytics?.transactionStats?.totalExpenses || '0'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Number of transactions</p>
        </div>

        {/* Top Payment Method */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Top Payment</p>
              <p className="text-2xl font-bold text-purple-600 mt-1 truncate">
                {analytics?.transactionStats?.topPaymentSource || 'N/A'}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Most used payment method</p>
        </div>
      </motion.div>

      {/* Advanced Metrics Section */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Savings Rate */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Savings Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {analytics?.transactionStats?.savingsRate?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Income vs total amount ({analytics?.totalIncome?.toFixed(0)} of {(analytics?.totalIncome + analytics?.totalExpense)?.toFixed(0)})</p>
        </div>

        {/* Top Category */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Top Category</p>
              <p className="text-2xl font-bold text-orange-600 mt-1 capitalize truncate">
                {analytics?.transactionStats?.topCategory || 'N/A'}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500">₹{analytics?.transactionStats?.topCategoryAmount?.toFixed(0) || '0'} ({analytics?.transactionStats?.topCategoryPercentage?.toFixed(1)}% of spending)</p>
        </div>

        {/* Category Diversity */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Diversity Score</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {analytics?.transactionStats?.categoryDiversity?.toFixed(0) || '0'}%
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600" />
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
          <h3 className="text-lg font-bold mb-6">Top Merchants</h3>
          <div className="space-y-4">
            {analytics.transactionStats.topMerchants.map((merchant: any, index: number) => (
              <div key={merchant.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center font-semibold text-sm text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm truncate">{merchant.name}</p>
                    <p className="text-xs text-gray-500">{merchant.count} transaction{merchant.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{merchant.amount.toFixed(0)}</p>
                  <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
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
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Monthly Trend</h3>
            <div className="flex gap-2">
              {['month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition ${timeframe === period
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="month" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4DD69B" strokeWidth={2} dot={{ fill: '#4DD69B', r: 5 }} />
                <Line type="monotone" dataKey="expense" stroke="#F37373" strokeWidth={2} dot={{ fill: '#F37373', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No trend data available</p>
                <p className="text-sm text-gray-500 mt-1">Monthly trends will appear after you add transactions</p>
              </div>
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="card">
          <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
          {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
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
              <div className="mt-4 space-y-2 h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                {analytics?.categoryBreakdown?.map((cat: any, index: number) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{cat.category}</span>
                    </div>
                    <span className="font-semibold">₹{cat.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No spending data</p>
                <p className="text-sm text-gray-500 mt-1">Add transactions to see category breakdown</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analysis Section (Source & Geographic) */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Analysis */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold">Source Analysis</h3>
          </div>
          {analytics?.sourceAnalysis && analytics.sourceAnalysis.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.sourceAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="source" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip />
                <Bar dataKey="amount" fill="#47468A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">No payment source data</p>
                <p className="text-sm text-gray-500 mt-1">Data will appear as you add transactions</p>
              </div>
            </div>
          )}
        </div>

        {/* Geographic Insights */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold">Geographic Insights</h3>
          </div>
          <div className="space-y-4">
            {analytics?.geographicInsights?.length > 0 ? (
              analytics.geographicInsights.map((insight: any, index: number) => (
                <div key={insight.city} className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{insight.city}</span>
                    <span className="text-gray-600">₹{insight.amount.toFixed(2)}</span>
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
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">No location data</p>
                  <p className="text-sm text-gray-500 mt-1">Transactions with location will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          {transactions && transactions.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Amount</th>
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
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                          {transaction.type === 'income' ? (
                            <ArrowDownLeft className="w-5 h-5 text-success" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-danger" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{transaction.source || 'Cash'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 capitalize">{transaction.category}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className={`py-4 px-4 text-right font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Your transactions will appear here</p>
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
