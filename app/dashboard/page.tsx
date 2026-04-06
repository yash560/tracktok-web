'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Settings,
  LogOut,
  Menu,
  X,
  MapPin,
  CreditCard,
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
import { useAuth } from '@/components/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import axios from 'axios';

const COLORS = ['#2F2E51', '#47468A', '#4DD69B', '#F37373', '#FBA94D', '#FB8C00', '#FBC02D', '#3F51B5', '#D81B60'];

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, transactionsRes, monthlyRes] = await Promise.all([
          axios.get('/api/analytics'),
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
  }, []);

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
              ${analytics?.balance?.toFixed(2) || '0.00'}
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
              ${analytics?.totalIncome?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">This month</p>
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
              ${analytics?.totalExpense?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">This month</p>
          </div>
        </div>
      </motion.div>

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
                  className={`px-3 py-1 text-sm rounded-lg transition ${
                    timeframe === period
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
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
        </div>

        {/* Spending by Category */}
        <div className="card">
          <h3 className="text-lg font-bold mb-6">Spending by Category</h3>
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
                <span className="font-semibold">${cat.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics?.sourceAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="source" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="amount" fill="#47468A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                    <span className="text-gray-600">${insight.amount.toFixed(2)}</span>
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
              <div className="text-center py-8 text-gray-500">
                No geographic data available
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item} className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition">
              <Filter className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-card/50 transition"
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
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
