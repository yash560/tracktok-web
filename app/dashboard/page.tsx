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
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockData = {
  user: {
    name: 'John Doe',
    email: 'john@example.com',
  },
  balance: 5420.50,
  income: 3500,
  expense: 1256.75,
  accounts: [
    { name: 'Checking', balance: 3420.50 },
    { name: 'Savings', balance: 2000 },
  ],
  transactions: [
    { id: 1, description: 'Grocery Store', amount: -85.50, category: 'Food', date: '2024-04-05', type: 'expense' },
    { id: 2, description: 'Salary Deposit', amount: 3500, category: 'Salary', date: '2024-04-01', type: 'income' },
    { id: 3, description: 'Coffee Shop', amount: -12.50, category: 'Food', date: '2024-04-04', type: 'expense' },
    { id: 4, description: 'Gas Station', amount: -52.00, category: 'Transportation', date: '2024-04-03', type: 'expense' },
    { id: 5, description: 'Restaurant', amount: -95.75, category: 'Dining', date: '2024-04-02', type: 'expense' },
    { id: 6, description: 'Movie Tickets', amount: -25.00, category: 'Entertainment', date: '2024-03-31', type: 'expense' },
  ],
  monthlyData: [
    { month: 'Jan', income: 3500, expense: 1200 },
    { month: 'Feb', income: 3500, expense: 1400 },
    { month: 'Mar', income: 3500, expense: 1150 },
    { month: 'Apr', income: 3500, expense: 1260 },
  ],
  categoryData: [
    { name: 'Food', value: 180, color: '#FB8C00' },
    { name: 'Transport', value: 120, color: '#FBC02D' },
    { name: 'Entertainment', value: 80, color: '#3F51B5' },
    { name: 'Shopping', value: 200, color: '#D81B60' },
    { name: 'Other', value: 100, color: '#616161' },
  ],
};

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

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-xl font-bold font-display text-primary hidden sm:inline">TrackTok</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {mockData.user.name}
            </span>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition text-danger">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
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
                  ${mockData.balance.toFixed(2)}
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
                  ${mockData.income.toFixed(2)}
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
                  ${mockData.expense.toFixed(2)}
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
                  {['month', 'quarter', 'year'].map((period) => (
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
                <LineChart data={mockData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis stroke="#999" />
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
                    data={mockData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {mockData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {mockData.categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600 dark:text-gray-400">{cat.name}</span>
                    </div>
                    <span className="font-semibold">${cat.value}</span>
                  </div>
                ))}
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
                  {mockData.transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
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
                          <span className="font-semibold">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{transaction.category}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-sm">{transaction.date}</td>
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
      </div>
    </div>
  );
}
