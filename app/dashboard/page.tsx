'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Users,
  PiggyBank,
  Trophy,
  Flame,
  Target,
  Mail,
  X,
  Plus,
  ArrowRight,
  AlertTriangle,
  Bell,
  Clock,
  Download,
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
import { formatDateTime } from '@/lib/dateFormatter';
import { useAuth } from '@/components/AuthContext';
import { useCurrency } from '@/components/CurrencyContext';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import { SpendingHeatmap } from '@/components/SpendingHeatmap';
import Link from 'next/link';

const COLORS = ['#2F2E51', '#47468A', '#4DD69B', '#F37373', '#FBA94D', '#FB8C00', '#FBC02D', '#3F51B5', '#D81B60'];

interface DateRange {
  type: 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'last-12-months' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { fmt } = useCurrency();
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

  // Split summary
  const [splitGroups, setSplitGroups] = useState<any[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwing, setTotalOwing] = useState(0);

  // Budget summary
  const [budgets, setBudgets] = useState<any[]>([]);
  const [budgetSpending, setBudgetSpending] = useState<any>({});

  // Monthly digest modal
  const [showDigestModal, setShowDigestModal] = useState(false);
  const [digestData, setDigestData] = useState<any>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [sendingDigest, setSendingDigest] = useState(false);

  // Anomalies
  const [anomalies, setAnomalies] = useState<any[]>([]);

  // Reminders summary
  const [reminders, setReminders] = useState<any[]>([]);

  // Spending streaks
  const [streaks, setStreaks] = useState({
    currentStreak: 0,
    underBudgetDays: 0,
    noSpendDays: 0,
    totalAchievements: 0,
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'n': () => router.push('/dashboard/transactions'),
    '/': () => {
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
      searchInput?.focus();
    },
    'b': () => router.push('/dashboard/budgets'),
    'Escape': () => {
      setShowDigestModal(false);
      setShowTransactionDetail(false);
      setShowDatePicker(false);
    },
  });

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

  useEffect(() => {
    const fetchSplitSummary = async () => {
      try {
        const res = await axios.get('/api/split-groups');
        const groups = res.data.splitGroups || [];
        setSplitGroups(groups);

        const userPhone = (user?.phone || user?.phoneNumber) as string;
        if (!userPhone) return;

        let owed = 0;
        let owing = 0;

        const unsettledGroups = groups.filter((g: any) => !g.settledAt);
        const groupDetails = await Promise.all(
          unsettledGroups.map(async (group: any) => {
            try {
              const groupRes = await axios.get(`/api/split-groups/${group._id}`);
              return groupRes.data;
            } catch {
              return null;
            }
          })
        );

        for (const detail of groupDetails) {
          if (!detail) continue;
          const expenses = detail.expenses || [];
          expenses.forEach((exp: any) => {
            if (!exp.split) return;
            const owner = exp.split.find((s: any) => s.owner);
            if (!owner) return;
            const isPayment = (owner.amount || 0) === 0;
            exp.split.forEach((split: any) => {
              if (split.phone === owner.phone) return;
              const amt = split.amount || 0;
              if (amt === 0) return;
              if (!isPayment) {
                if (split.phone === userPhone) owing += amt;
                else if (owner.phone === userPhone) owed += amt;
              }
            });
          });
        }
        setTotalOwed(owed);
        setTotalOwing(owing);
      } catch {
      }
    };
    if (user) fetchSplitSummary();
  }, [user]);

  // Fetch budget summary
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const now = new Date();
        const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const res = await axios.get(`/api/budgets?month=${month}`);
        setBudgets(res.data.budgets || []);

        if (analytics?.categoryBreakdown) {
          const spending: any = {};
          analytics.categoryBreakdown.forEach((c: any) => {
            spending[c.category] = c.amount;
          });
          setBudgetSpending(spending);
        }
      } catch {
        // silently fail
      }
    };
    fetchBudgets();
  }, [analytics]);

  useEffect(() => {
    Promise.all([
      axios.get('/api/analytics/anomalies').catch(() => ({ data: { anomalies: [] } })),
      axios.get('/api/reminders').catch(() => ({ data: { reminders: [] } })),
    ]).then(([anomaliesRes, remindersRes]) => {
      setAnomalies(anomaliesRes.data.anomalies || []);
      setReminders(remindersRes.data.reminders || []);
    });
  }, []);

  // Calculate streaks from transactions
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    const today = new Date();
    const last30 = new Set<string>();
    let streak = 0;
    let noSpendDays = 0;

    transactions.forEach((t: any) => {
      if (t.type === 'expense' || t.type === 'debit') {
        const d = new Date(t.date).toISOString().split('T')[0];
        last30.add(d);
      }
    });

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (!last30.has(key)) noSpendDays++;
    }

    const budgetCategories = budgets.map((b: any) => b.category);
    let underBudgetDays = 0;
    if (budgets.length > 0) {
      const allUnder = budgets.every((b: any) => (budgetSpending[b.category] || 0) <= b.amount);
      if (allUnder) underBudgetDays = new Date().getDate();
    }

    const achievements = [];
    if (noSpendDays >= 5) achievements.push('5 No-Spend Days');
    if (noSpendDays >= 10) achievements.push('10 No-Spend Days');
    if (underBudgetDays >= 15) achievements.push('Budget Master');
    if (transactions.length >= 50) achievements.push('Tracker Pro');

    setStreaks({
      currentStreak: noSpendDays,
      underBudgetDays,
      noSpendDays,
      totalAchievements: achievements.length,
    });
  }, [transactions, budgets, budgetSpending]);

  // Fetch monthly digest
  const fetchDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await axios.get('/api/digest');
      setDigestData(res.data);
    } catch {
      // silently fail
    } finally {
      setDigestLoading(false);
    }
  };

  const sendDigestEmail = async () => {
    if (!user?.email) return;
    setSendingDigest(true);
    try {
      await axios.post('/api/digest', { email: user.email });
      alert('Digest email sent!');
    } catch {
      alert('Failed to send digest email');
    } finally {
      setSendingDigest(false);
    }
  };

  const budgetAlerts = useMemo(() => {
    if (!budgets.length) return [];
    return budgets
      .map((b: any) => {
        const spent = budgetSpending[b.category] || 0;
        const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        return { ...b, spent, pct };
      })
      .filter((b: any) => b.pct >= 75)
      .sort((a: any, b: any) => b.pct - a.pct);
  }, [budgets, budgetSpending]);

  const exportCSV = useCallback(() => {
    if (!transactions.length) return;

    const headers = ['Date', 'Type', 'Amount', 'Category', 'Description', 'Receiver', 'Source'];
    const rows = transactions.map((t: any) => [
      t.date || '',
      t.type || '',
      t.amount || '',
      t.category || '',
      (t.description || '').replace(/,/g, ' '),
      (t.receiver || '').replace(/,/g, ' '),
      (t.source || '').replace(/,/g, ' '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracktok-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  const dynamicKpis = useMemo(() => {
    const kpis: { id: string; label: string; value: string; sub: string; color: string; icon: string; priority: number }[] = [];

    if (analytics) {
      const income = analytics.totalIncome || 0;
      const expense = analytics.totalExpense || 0;
      const balance = analytics.balance || 0;

      if (income > 0 && expense > 0) {
        const ratio = expense / income;
        kpis.push({
          id: 'burn-rate',
          label: 'Burn Rate',
          value: `${(ratio * 100).toFixed(0)}%`,
          sub: ratio > 1 ? 'Spending more than earning' : ratio > 0.8 ? 'Near limit' : 'Healthy',
          color: ratio > 1 ? 'danger' : ratio > 0.8 ? 'warning' : 'success',
          icon: 'flame',
          priority: ratio > 0.8 ? 95 : 50,
        });
      }

      if (income > 0) {
        const savingsRate = analytics.transactionStats?.savingsRate || 0;
        kpis.push({
          id: 'savings',
          label: 'Savings Rate',
          value: `${savingsRate.toFixed(1)}%`,
          sub: savingsRate >= 20 ? 'Great job!' : savingsRate > 0 ? 'Room to improve' : 'No savings yet',
          color: savingsRate >= 20 ? 'success' : savingsRate > 0 ? 'warning' : 'danger',
          icon: 'piggy',
          priority: 60,
        });
      }

      const avgTx = analytics.transactionStats?.averageTransaction || 0;
      if (avgTx > 0) {
        kpis.push({
          id: 'avg-tx',
          label: 'Avg Transaction',
          value: fmt(avgTx),
          sub: 'Per transaction',
          color: 'primary',
          icon: 'zap',
          priority: 40,
        });
      }

      const topCat = analytics.transactionStats?.topCategory;
      const topCatPct = analytics.transactionStats?.topCategoryPercentage;
      if (topCat && topCat !== 'N/A') {
        kpis.push({
          id: 'top-cat',
          label: 'Top Category',
          value: topCat,
          sub: `${topCatPct?.toFixed(0) || 0}% of spending`,
          color: topCatPct > 50 ? 'warning' : 'primary',
          icon: 'award',
          priority: topCatPct > 40 ? 70 : 35,
        });
      }

      const largest = analytics.transactionStats?.largestTransaction;
      if (largest > 0) {
        kpis.push({
          id: 'largest',
          label: 'Biggest Expense',
          value: fmt(largest),
          sub: analytics.transactionStats?.largestTransactionCategory || '',
          color: 'danger',
          icon: 'trending-up',
          priority: 45,
        });
      }

      const diversity = analytics.transactionStats?.categoryDiversity;
      if (diversity !== undefined) {
        kpis.push({
          id: 'diversity',
          label: 'Diversity',
          value: `${diversity.toFixed(0)}%`,
          sub: diversity > 70 ? 'Well spread' : 'Concentrated',
          color: diversity > 70 ? 'success' : 'warning',
          icon: 'layers',
          priority: 25,
        });
      }

      const totalExpenses = analytics.transactionStats?.totalExpenses;
      if (totalExpenses > 0) {
        const days = Math.max(1, new Date().getDate());
        const dailyAvg = expense / days;
        kpis.push({
          id: 'daily-avg',
          label: 'Daily Average',
          value: fmt(dailyAvg),
          sub: `${totalExpenses} transactions`,
          color: 'primary',
          icon: 'calendar',
          priority: 55,
        });
      }

      const topMerchant = analytics.transactionStats?.topMerchants?.[0];
      if (topMerchant) {
        kpis.push({
          id: 'top-merchant',
          label: 'Top Merchant',
          value: topMerchant.name,
          sub: `${fmt(topMerchant.amount)} · ${topMerchant.count}x`,
          color: 'primary',
          icon: 'shopping',
          priority: 30,
        });
      }

      const geoTop = analytics.geographicInsights?.[0];
      if (geoTop) {
        kpis.push({
          id: 'top-city',
          label: 'Top City',
          value: geoTop.city,
          sub: fmt(geoTop.amount),
          color: 'primary',
          icon: 'map',
          priority: 20,
        });
      }
    }

    if (totalOwed > 0 || totalOwing > 0) {
      const net = totalOwed - totalOwing;
      kpis.push({
        id: 'split-net',
        label: 'Split Balance',
        value: fmt(Math.abs(net)),
        sub: net >= 0 ? 'Owed to you' : 'You owe',
        color: net >= 0 ? 'success' : 'warning',
        icon: 'users',
        priority: 75,
      });
    }

    if (budgets.length > 0) {
      const overBudget = budgets.filter((b: any) => (budgetSpending[b.category] || 0) > b.amount);
      if (overBudget.length > 0) {
        kpis.push({
          id: 'over-budget',
          label: 'Over Budget',
          value: `${overBudget.length}`,
          sub: `of ${budgets.length} categories`,
          color: 'danger',
          icon: 'target',
          priority: 90,
        });
      } else {
        kpis.push({
          id: 'budget-ok',
          label: 'Budget Status',
          value: 'On Track',
          sub: `${budgets.length} budgets set`,
          color: 'success',
          icon: 'target',
          priority: 35,
        });
      }
    }

    if (monthlyTrend.length >= 2) {
      const curr = monthlyTrend[monthlyTrend.length - 1];
      const prev = monthlyTrend[monthlyTrend.length - 2];
      if (prev?.expense > 0) {
        const change = ((curr.expense - prev.expense) / prev.expense) * 100;
        kpis.push({
          id: 'mom-change',
          label: 'vs Last Month',
          value: `${change > 0 ? '+' : ''}${change.toFixed(0)}%`,
          sub: change > 0 ? 'Spending increased' : 'Spending decreased',
          color: change > 10 ? 'danger' : change < -5 ? 'success' : 'primary',
          icon: 'trending',
          priority: 80,
        });
      }
    }

    if (streaks.noSpendDays >= 3) {
      kpis.push({
        id: 'streak',
        label: 'No-Spend Streak',
        value: `${streaks.noSpendDays} days`,
        sub: 'In last 30 days',
        color: 'success',
        icon: 'flame',
        priority: 65,
      });
    }

    return kpis.sort((a, b) => b.priority - a.priority).slice(0, 8);
  }, [analytics, totalOwed, totalOwing, budgets, budgetSpending, monthlyTrend, streaks, fmt]);

  const kpiIconMap: Record<string, React.ReactNode> = {
    flame: <Flame className="w-4 h-4" />,
    piggy: <PiggyBank className="w-4 h-4" />,
    zap: <Zap className="w-4 h-4" />,
    award: <Award className="w-4 h-4" />,
    'trending-up': <TrendingUp className="w-4 h-4" />,
    layers: <Layers className="w-4 h-4" />,
    calendar: <Calendar className="w-4 h-4" />,
    shopping: <ShoppingCart className="w-4 h-4" />,
    map: <MapPin className="w-4 h-4" />,
    users: <Users className="w-4 h-4" />,
    target: <Target className="w-4 h-4" />,
    trending: <TrendingUp className="w-4 h-4" />,
  };

  const kpiColorMap: Record<string, { bg: string; text: string; value: string }> = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', value: 'text-primary' },
    success: { bg: 'bg-success/10', text: 'text-success', value: 'text-success' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', value: 'text-danger' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', value: 'text-warning' },
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="card p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          ))}
        </div>
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
      {/* Anomaly Alert Banner */}
      {anomalies.length > 0 && (
        <motion.div variants={item} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-100 dark:bg-amber-800/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-200">
                {anomalies.length} unusual transaction{anomalies.length > 1 ? 's' : ''} detected
              </h3>
              <div className="mt-1 space-y-0.5">
                {anomalies.slice(0, 3).map((a: any) => (
                  <p key={a._id} className="text-xs text-amber-700 dark:text-amber-300 truncate">
                    {a.description} — {a.anomalyReason}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {budgetAlerts.length > 0 && (
        <motion.div
          variants={item}
          className="card p-4 border-l-4 border-warning"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-sm">Budget Alerts</h3>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map((alert: any) => (
              <div key={alert._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="capitalize">{alert.category}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    alert.pct >= 100 ? 'bg-danger/10 text-danger' :
                    alert.pct >= 90 ? 'bg-danger/10 text-danger' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {Math.round(alert.pct)}%
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {fmt(alert.spent)} / {fmt(alert.amount)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
              {fmt(analytics?.balance || 0)}
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
              {fmt(analytics?.totalIncome || 0)}
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
              {fmt(analytics?.totalExpense || 0)}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">For selected period</p>
          </div>
        </div>
      </motion.div>

      {/* Dynamic KPIs */}
      {dynamicKpis.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Smart Insights
            </h3>
            <span className="text-[10px] text-gray-300 dark:text-gray-600">{dynamicKpis.length} active</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {dynamicKpis.map((kpi, idx) => {
              const c = kpiColorMap[kpi.color] || kpiColorMap.primary;
              return (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                  className="group relative p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center ${c.text}`}>
                      {kpiIconMap[kpi.icon] || <Zap className="w-4 h-4" />}
                    </div>
                  </div>
                  <p className={`text-xl sm:text-2xl font-bold ${c.value} truncate capitalize leading-tight`}>{kpi.value}</p>
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-1.5 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5 truncate">{kpi.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Split Summary + Budget + Streaks + Digest + Reminders Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Split Groups Summary */}
        <Link href={splitGroups.length > 0 ? `/split-groups/${splitGroups[0]._id}` : '#'} className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Split Groups</p>
              <p className="text-lg sm:text-xl font-bold text-primary mt-1">{splitGroups.filter((g: any) => !g.settledAt).length} active</p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
          </div>
          {(totalOwed > 0 || totalOwing > 0) ? (
            <div className="space-y-1">
              {totalOwed > 0 && <p className="text-xs text-success font-medium">{fmt(totalOwed)} owed to you</p>}
              {totalOwing > 0 && <p className="text-xs text-warning font-medium">{fmt(totalOwing)} you owe</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-500">All settled up</p>
          )}
        </Link>

        {/* Budget Progress */}
        <Link href="/dashboard/budgets" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Budgets</p>
              <p className="text-lg sm:text-xl font-bold text-primary mt-1">{budgets.length} set</p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <PiggyBank className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
            </div>
          </div>
          {budgets.length > 0 ? (
            <div className="space-y-1.5">
              {budgets.slice(0, 2).map((b: any) => {
                const spent = budgetSpending[b.category] || 0;
                const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
                return (
                  <div key={b._id}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize text-gray-600 dark:text-gray-400">{b.category}</span>
                      <span className={pct > 100 ? 'text-danger font-medium' : 'text-gray-500'}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
              {budgets.length > 2 && <p className="text-[10px] text-gray-400">+{budgets.length - 2} more</p>}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Set budgets to track limits</p>
          )}
        </Link>

        {/* Spending Streaks */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Streaks</p>
              <p className="text-lg sm:text-xl font-bold text-orange-500 mt-1 flex items-center gap-1">
                <Flame className="w-5 h-5" />
                {streaks.noSpendDays}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 sm:w-5 h-4 sm:h-5 text-orange-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500">No-spend days (last 30)</p>
            {streaks.underBudgetDays > 0 && (
              <p className="text-xs text-success font-medium flex items-center gap-1">
                <Target className="w-3 h-3" /> {streaks.underBudgetDays} days under budget
              </p>
            )}
            {streaks.totalAchievements > 0 && (
              <p className="text-xs text-purple-500 font-medium">{streaks.totalAchievements} achievements</p>
            )}
          </div>
        </div>

        {/* Monthly Digest */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Monthly Digest</p>
              <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">
                {new Date().toLocaleDateString('en-US', { month: 'short' })}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
            </div>
          </div>
          <button
            onClick={() => { setShowDigestModal(true); fetchDigest(); }}
            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
          >
            View & Send Digest
          </button>
        </div>

        {/* Reminders Summary */}
        <Link href="/dashboard/reminders" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Reminders</p>
              <p className="text-lg sm:text-xl font-bold text-amber-600 mt-1">{reminders.filter((r: any) => r.enabled).length} active</p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-amber-600" />
            </div>
          </div>
          {(() => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const overdue = reminders.filter((r: any) => r.enabled && new Date(r.dueDate) < now);
            const upcoming = reminders.filter((r: any) => {
              if (!r.enabled) return false;
              const due = new Date(r.dueDate);
              due.setHours(0, 0, 0, 0);
              const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 3;
            });
            return (
              <div className="space-y-1">
                {overdue.length > 0 && <p className="text-xs text-danger font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {overdue.length} overdue</p>}
                {upcoming.length > 0 && <p className="text-xs text-warning font-medium">{upcoming.length} due soon</p>}
                {overdue.length === 0 && upcoming.length === 0 && <p className="text-xs text-gray-500">All on track</p>}
              </div>
            );
          })()}
        </Link>
      </motion.div>

      {/* Key Metrics Section */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Average Transaction */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Avg. Transaction</p>
              <p className="text-xl sm:text-2xl font-bold text-primary mt-1 truncate">
                {fmt(analytics?.transactionStats?.averageTransaction || 0)}
              </p>
            </div>
            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-gray-500">Average of all transactions</p>
        </div>

        {/* Largest Transaction */}
        <div
          className="card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            const cat = analytics?.transactionStats?.largestTransactionCategory;
            if (cat && cat !== 'N/A') {
              router.push(`/dashboard/transactions?category=${encodeURIComponent(cat)}&type=expense`);
            }
          }}
        >
          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Largest Expense</p>
              <p className="text-xl sm:text-2xl font-bold text-danger mt-1 truncate">
                {fmt(analytics?.transactionStats?.largestTransaction || 0)}
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
        <div
          className="card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            const src = analytics?.transactionStats?.topPaymentSource;
            if (src && src !== 'N/A') {
              router.push(`/dashboard/transactions?source=${encodeURIComponent(src)}`);
            }
          }}
        >
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
          <p className="text-xs text-gray-500">Income vs total amount ({fmt(analytics?.totalIncome || 0)} of {fmt((analytics?.totalIncome || 0) + (analytics?.totalExpense || 0))})</p>
        </div>

        {/* Top Category */}
        <div
          className="card hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => {
            const cat = analytics?.transactionStats?.topCategory;
            if (cat && cat !== 'N/A') {
              router.push(`/dashboard/transactions?category=${encodeURIComponent(cat)}`);
            }
          }}
        >
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
          <p className="text-xs text-gray-500">{fmt(analytics?.transactionStats?.topCategoryAmount || 0)} ({analytics?.transactionStats?.topCategoryPercentage?.toFixed(1)}% of spending)</p>
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
              <div
                key={merchant.name}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/20 rounded-lg p-2 -mx-2 transition"
                onClick={() => router.push(`/dashboard/transactions?receiver=${encodeURIComponent(merchant.name)}`)}
              >
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
                  <p className="font-bold text-xs sm:text-sm">{fmt(merchant.amount)}</p>
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
                  <div
                    key={cat.category}
                    className="flex items-center justify-between text-xs sm:text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/20 rounded px-1 -mx-1 py-0.5 transition"
                    onClick={() => router.push(`/dashboard/transactions?category=${encodeURIComponent(cat.category)}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 capitalize truncate">{cat.category}</span>
                    </div>
                    <span className="font-semibold flex-shrink-0 ml-2">{fmt(cat.amount)}</span>
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

      {/* Spending Heatmap */}
      <motion.div variants={item} className="card">
        <SpendingHeatmap />
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
                  <Bar
                    dataKey="amount"
                    fill="#47468A"
                    radius={[4, 4, 0, 0]}
                    className="cursor-pointer"
                    onClick={(data: any) => {
                      if (data?.source) {
                        router.push(`/dashboard/transactions?source=${encodeURIComponent(data.source)}`);
                      }
                    }}
                  />
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
                    <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">{fmt(insight.amount)}</span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={!transactions.length}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-semibold flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition font-semibold"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
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
                      <DateTooltip dateInput={transaction.createdAt || transaction.date}>
                        {formatDateTime(transaction.createdAt || transaction.date)}
                      </DateTooltip>
                    </td>
                    <td className={`py-3 sm:py-4 px-3 sm:px-4 text-right font-semibold text-xs sm:text-sm ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{fmt(Math.abs(transaction.amount))}
                    </td>
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                      <button
                        onClick={() => handleViewInvoice(transaction._id)}
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
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 sm:w-10 h-8 sm:h-10 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">Welcome to TrackTok!</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Start tracking your finances by adding your first transaction
              </p>
              <button
                onClick={() => router.push('/dashboard/transactions')}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
                Add First Transaction
              </button>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-[10px] text-gray-400">Track Income</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <ShoppingCart className="w-4 h-4 text-danger" />
                  </div>
                  <p className="text-[10px] text-gray-400">Log Expenses</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-1">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-gray-400">Split Bills</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Monthly Digest Modal */}
      {showDigestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Monthly Digest
              </h3>
              <button onClick={() => setShowDigestModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {digestLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-gray-500 mt-3">Generating digest...</p>
              </div>
            ) : digestData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Income</p>
                    <p className="text-lg font-bold text-success">{fmt(digestData.totalIncome || 0)}</p>
                  </div>
                  <div className="p-3 bg-danger/10 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Expenses</p>
                    <p className="text-lg font-bold text-danger">{fmt(digestData.totalExpense || 0)}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Summary</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transactions</span>
                      <span className="font-medium">{digestData.transactionCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Savings Rate</span>
                      <span className="font-medium">{(digestData.savingsRate || 0).toFixed(1)}%</span>
                    </div>
                    {digestData.monthOverMonthChange !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">vs Last Month</span>
                        <span className={`font-medium ${digestData.monthOverMonthChange > 0 ? 'text-danger' : 'text-success'}`}>
                          {digestData.monthOverMonthChange > 0 ? '+' : ''}{digestData.monthOverMonthChange.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {digestData.topCategories?.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Top Categories</p>
                    <div className="space-y-1.5">
                      {digestData.topCategories.map((cat: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="capitalize text-gray-600 dark:text-gray-400">{cat.category}</span>
                          <span className="font-medium">{fmt(cat.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDigestModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={sendDigestEmail}
                    disabled={sendingDigest || !user?.email}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {sendingDigest ? 'Sending...' : 'Email Digest'}
                  </button>
                </div>
                {user?.email && (
                  <p className="text-xs text-gray-400 text-center">Will send to {user.email}</p>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No digest data available</p>
            )}
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showTransactionDetail}
        transaction={selectedTransaction}
        onClose={() => setShowTransactionDetail(false)}
      />
    </motion.div>
  );
}
