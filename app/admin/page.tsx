'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  Receipt,
  TrendingUp,
  PiggyBank,
  Bell,
  Users2,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6'];

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  login: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
};

function formatINR(value: number) {
  return '₹' + new Intl.NumberFormat('en-IN').format(value);
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

interface KPI {
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  totalTransactions: number;
  totalVolume: number;
  totalSplitGroups: number;
  activeSplitGroups: number;
  activeReminders: number;
}

interface DashboardData {
  kpis: KPI;
  charts: {
    dailyTransactions: { _id: string; count: number; volume: number }[];
    categoryBreakdown: { _id: string; count: number; total: number }[];
    userSignups: { _id: string; count: number }[];
  };
  recentActivity: {
    _id: string;
    userId: string;
    action: string;
    entity: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data.</p>
      </div>
    );
  }

  const { kpis, charts, recentActivity } = data;
  const avgPerUser = kpis.totalUsers > 0 ? Math.round(kpis.totalVolume / kpis.totalUsers) : 0;

  const kpiCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: kpis.totalUsers.toLocaleString('en-IN'),
      subtitle: 'All registered users',
    },
    {
      icon: Activity,
      label: 'Active Users',
      value: kpis.activeUsers.toLocaleString('en-IN'),
      subtitle: 'Last 30 days',
    },
    {
      icon: TrendingUp,
      label: 'New This Month',
      value: kpis.newUsersThisMonth.toLocaleString('en-IN'),
      subtitle: 'Signups this month',
    },
    {
      icon: Receipt,
      label: 'Total Transactions',
      value: kpis.totalTransactions.toLocaleString('en-IN'),
      subtitle: 'All time',
    },
    {
      icon: PiggyBank,
      label: 'Total Volume',
      value: formatINR(kpis.totalVolume),
      subtitle: 'Across all users',
    },
    {
      icon: Users2,
      label: 'Split Groups',
      value: `${kpis.activeSplitGroups}/${kpis.totalSplitGroups}`,
      subtitle: 'Active / Total',
    },
    {
      icon: Bell,
      label: 'Active Reminders',
      value: kpis.activeReminders.toLocaleString('en-IN'),
      subtitle: 'Currently active',
    },
    {
      icon: BarChart3,
      label: 'Avg Volume / User',
      value: formatINR(avgPerUser),
      subtitle: 'Per registered user',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform-wide metrics and activity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4"
          >
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
              <card.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Transactions Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Transactions (Last 30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.dailyTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Transactions']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Signups Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Signups by Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.userSignups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                  formatter={(value) => [value, 'Signups']}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Categories by Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryBreakdown}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                  label={({ _id, percent }: any) =>
                    `${_id} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {charts.categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatINR(Number(value)), 'Volume']}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Entity</th>
                <th className="pb-3 font-medium">User ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentActivity.slice(0, 10).map((entry) => (
                <tr key={entry._id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 pr-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {timeAgo(entry.createdAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 pr-4 capitalize">{entry.entity}</td>
                  <td className="py-3 font-mono text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
                    {entry.userId}
                  </td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-gray-500">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
