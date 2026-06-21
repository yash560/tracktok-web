'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useProtectedPage } from '@/lib/useProtectedPage';
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  Printer,
  Send,
  TrendingDown,
  TrendingUp,
  Edit2,
  X,
  Search,
  Download,
  Zap,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Share2,
  FileText,
  MessageCircle,
  Loader2,
  Trash2,
  CircleCheck,
  CircleX,
  ArrowUpDown,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import axios from 'axios';
import { SplitGroup, Invoice } from '@/types';
import Link from 'next/link';
import { DateTooltip } from '@/components/DateTooltip';
import {
  NotificationModal,
  ConfirmModal,
  NotificationState,
  ConfirmState,
  initialNotification,
  initialConfirm,
} from '@/components/NotificationModal';
import { useCurrency } from '@/components/CurrencyContext';
import { TransactionModal } from '@/components/TransactionModal';

interface SplitGroupResponse {
  splitGroup: SplitGroup;
  expenses: Invoice[];
}

interface Settlement {
  memberName: string;
  memberPhone: string;
  amount: number;
  type: 'owes' | 'owed';
}

interface SimplifiedDebt {
  from: string;
  fromPhone: string;
  to: string;
  toPhone: string;
  amount: number;
}

const CHART_COLORS = ['#2F2E51', '#47468A', '#4DD69B', '#F37373', '#FBA94D', '#FB8C00', '#FBC02D', '#3F51B5', '#D81B60', '#00838F'];

function calculateSettlements(expenses: Invoice[], userPhone: string): Settlement[] {
  const netBalances: { [key: string]: { amount: number; debtorName: string; creditorName: string } } = {};

  expenses.forEach((expense) => {
    if (!expense.split || expense.split.length === 0) return;

    const owner = expense.split.find((s: any) => s.owner === true);
    if (!owner) return;

    const ownerPhone = owner.phone;
    const ownerAmount = owner.amount || 0;
    const isPayment = ownerAmount === 0;

    expense.split.forEach((split: any) => {
      if (split.phone === ownerPhone) return;
      if (split.paidAt) return;

      const otherPhone = split.phone;
      const otherAmount = split.amount || 0;

      if (otherAmount === 0) return;

      if (isPayment) {
        const reverseKey = `${ownerPhone}|${otherPhone}`;
        if (netBalances[reverseKey]) {
          netBalances[reverseKey].amount -= otherAmount;
          if (netBalances[reverseKey].amount <= 0) {
            delete netBalances[reverseKey];
          }
        }
      } else {
        const key = `${otherPhone}|${ownerPhone}`;
        if (!netBalances[key]) {
          netBalances[key] = { amount: 0, debtorName: split.name, creditorName: owner.name };
        }
        netBalances[key].amount += otherAmount;
      }
    });
  });

  const settlements: Settlement[] = [];
  Object.entries(netBalances).forEach(([key, value]) => {
    const [debtorPhone, creditorPhone] = key.split('|');
    const { amount, debtorName, creditorName } = value;

    if (amount <= 0) return;

    if (debtorPhone === userPhone) {
      settlements.push({ memberName: creditorName, memberPhone: creditorPhone, amount, type: 'owes' });
    } else if (creditorPhone === userPhone) {
      settlements.push({ memberName: debtorName, memberPhone: debtorPhone, amount, type: 'owed' });
    }
  });

  return settlements;
}

// Feature #9: Debt simplification — minimize number of transactions
function simplifyDebts(expenses: Invoice[], contacts: SplitGroup['contacts']): SimplifiedDebt[] {
  const balances: { [phone: string]: { amount: number; name: string } } = {};

  contacts.forEach((c) => {
    if (c.phone) balances[c.phone] = { amount: 0, name: c.name };
  });

  expenses.forEach((expense) => {
    if (!expense.split || expense.split.length === 0) return;
    const owner = expense.split.find((s: any) => s.owner === true);
    if (!owner || !owner.phone) return;

    const isPayment = (owner.amount || 0) === 0;

    expense.split.forEach((split: any) => {
      if (split.phone === owner.phone) return;
      if (split.paidAt) return;
      const amt = split.amount || 0;
      if (amt === 0) return;

      if (isPayment) {
        // Payment reduces debt
        if (balances[owner.phone!]) balances[owner.phone!].amount += amt;
        if (balances[split.phone]) balances[split.phone].amount -= amt;
      } else {
        // Expense: split member owes owner
        if (balances[owner.phone!]) balances[owner.phone!].amount += amt;
        if (balances[split.phone]) balances[split.phone].amount -= amt;
      }
    });
  });

  // Greedy algorithm to minimize transactions
  const debtors: { phone: string; name: string; amount: number }[] = [];
  const creditors: { phone: string; name: string; amount: number }[] = [];

  Object.entries(balances).forEach(([phone, { amount, name }]) => {
    if (amount > 0.01) creditors.push({ phone, name, amount });
    else if (amount < -0.01) debtors.push({ phone, name, amount: Math.abs(amount) });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const simplified: SimplifiedDebt[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount);
    if (transfer > 0.01) {
      simplified.push({
        from: debtors[i].name,
        fromPhone: debtors[i].phone,
        to: creditors[j].name,
        toPhone: creditors[j].phone,
        amount: Math.round(transfer * 100) / 100,
      });
    }
    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return simplified;
}

interface PaymentState {
  isOpen: boolean;
  memberName: string;
  memberPhone: string;
  totalAmount: number;
  paymentAmount: string;
  isProcessing: boolean;
}

interface EditNameState {
  isOpen: boolean;
  newName: string;
  isProcessing: boolean;
}

// Feature #10: Export helpers
function exportToCSV(splitGroup: SplitGroup, expenses: Invoice[], settlements: Settlement[]) {
  const rows: string[][] = [
    ['Split Group Report:', splitGroup.name],
    ['Created:', splitGroup.createdAt ? new Date(splitGroup.createdAt).toLocaleDateString() : ''],
    ['Members:', splitGroup.contacts.map((c) => c.name).join(', ')],
    [],
    ['--- Expenses ---'],
    ['Date', 'Description', 'Category', 'Amount', 'Split Details'],
  ];

  expenses.forEach((exp) => {
    const splitDetails = exp.split?.map((s: any) => `${s.name}: ₹${(s.amount || 0).toFixed(2)}`).join(' | ') || '';
    rows.push([
      exp.date ? new Date(exp.date).toLocaleDateString() : '',
      exp.description,
      exp.category || '',
      `₹${exp.amount.toFixed(2)}`,
      splitDetails,
    ]);
  });

  rows.push([], ['--- Settlements ---'], ['Member', 'Type', 'Amount']);
  settlements.forEach((s) => {
    rows.push([s.memberName, s.type === 'owes' ? 'You owe' : 'Owes you', `₹${s.amount.toFixed(2)}`]);
  });

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${splitGroup.name.replace(/\s+/g, '_')}_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToPDF(splitGroup: SplitGroup, expenses: Invoice[], settlements: Settlement[]) {
  const printWindow = globalThis.open('', '_blank');
  if (!printWindow) return;

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${splitGroup.name} - Report</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { color: #2F2E51; margin-bottom: 4px; }
        h2 { color: #47468A; border-bottom: 2px solid #e5e5e5; padding-bottom: 8px; margin-top: 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        th { background: #f5f5f5; font-weight: 600; font-size: 13px; text-transform: uppercase; }
        td { font-size: 14px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
        .total { font-size: 20px; font-weight: 700; color: #F37373; }
        .owes { color: #FBA94D; } .owed { color: #4DD69B; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>${splitGroup.name}</h1>
      <div class="meta">
        <p>Created: ${splitGroup.createdAt ? new Date(splitGroup.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
        <p>Members: ${splitGroup.contacts.map((c) => c.name).join(', ')}</p>
        <p>Total: <span class="total">₹${totalAmount.toFixed(2)}</span></p>
      </div>

      <h2>Expenses</h2>
      <table>
        <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Split</th></tr></thead>
        <tbody>
          ${expenses.map((exp) => `
            <tr>
              <td>${exp.date ? new Date(exp.date).toLocaleDateString() : ''}</td>
              <td>${exp.description}</td>
              <td>${exp.category || '-'}</td>
              <td>₹${exp.amount.toFixed(2)}</td>
              <td>${exp.split?.map((s: any) => `${s.name}: ₹${(s.amount || 0).toFixed(2)}`).join(', ') || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      ${settlements.length > 0 ? `
        <h2>Settlements</h2>
        <table>
          <thead><tr><th>Member</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            ${settlements.map((s) => `
              <tr>
                <td>${s.memberName}</td>
                <td class="${s.type === 'owes' ? 'owes' : 'owed'}">${s.type === 'owes' ? 'You owe' : 'Owes you'}</td>
                <td>₹${s.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>TrackTok Split Group Report</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

// Feature #8: Generate payment request link
function generatePaymentLink(splitGroupId: string, memberPhone: string, amount: number): string {
  return `${globalThis.location?.origin || ''}/split-groups/${splitGroupId}?pay=${memberPhone}&amount=${amount.toFixed(2)}`;
}


export default function SplitGroupPage() {
  const params = useParams();
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();
  useProtectedPage();
  const id = params.id as string;
  const { fmt } = useCurrency();
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
  const [editNameModal, setEditNameModal] = useState<EditNameState>({
    isOpen: false,
    newName: '',
    isProcessing: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>(initialConfirm);

  const notify = (type: NotificationState['type'], title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
  };

  // Feature #6: Search/filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const [editingSplits, setEditingSplits] = useState<{
    [expenseId: string]: { amounts: number[]; original: number[]; isEditing: boolean; splitMode: 'equal' | 'percentage' | 'amount' | 'shares'; shares?: number[]; editedPctIndexes?: Set<number> };
  }>({});
  const [selectedMember, setSelectedMember] = useState<{
    name: string;
    contactId: string;
    phone?: string | null;
  } | null>(null);
  const [memberDetails, setMemberDetails] = useState<{
    registered: boolean;
    member?: {
      firstName: string;
      lastName: string;
      displayName: string;
      nickname: string;
      email: string;
      phoneNumber: string;
      gender: string;
      dateOfBirth: string;
      avatar: string;
      createdAt: string;
    };
  } | null>(null);
  const [memberDetailsLoading, setMemberDetailsLoading] = useState(false);

  // Feature: Active tab for insights section
  const [activeInsightTab, setActiveInsightTab] = useState<'category' | 'members' | 'timeline' | 'activity'>('category');
  // Feature #9: Show simplified debts toggle
  const [showSimplified, setShowSimplified] = useState(false);
  // Feature #8: Copied link state
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Transaction comments
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [expenseId: string]: any[] }>({});
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState<string | null>(null);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    const fetchSplitGroup = async () => {
      try {
        const response = await axios.get(`/api/split-groups/${id}`);
        setData(response.data);

        if (user?.phone || user?.phoneNumber) {
          const userPhone = (user.phone || user.phoneNumber) as string;
          const calcs = calculateSettlements(response.data.expenses, userPhone);
          const activeSettlements = calcs.filter((s: any) => s.amount > 0);
          setSettlements(activeSettlements);
        }

        // Feature #8: Auto-open payment modal from URL params
        const urlParams = new URLSearchParams(globalThis.location?.search || '');
        const payTo = urlParams.get('pay');
        const payAmount = urlParams.get('amount');
        if (payTo && payAmount) {
          const contact = response.data.splitGroup.contacts.find((c: any) => c.phone === payTo);
          if (contact) {
            setPaymentModal({
              isOpen: true,
              memberName: contact.name,
              memberPhone: payTo,
              totalAmount: parseFloat(payAmount),
              paymentAmount: payAmount,
              isProcessing: false,
            });
          }
        }
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setError('Failed to load split group');
        }
        console.error('Error fetching split group:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && !authLoading && user) {
      fetchSplitGroup();
    } else if (id && !authLoading && !user) {
      setLoading(false);
    }
  }, [id, authLoading, user]);

  useEffect(() => {
    if (!selectedMember?.phone) {
      setMemberDetails(null);
      return;
    }
    setMemberDetailsLoading(true);
    axios
      .get(`/api/members/lookup?phone=${encodeURIComponent(selectedMember.phone)}`)
      .then((res) => setMemberDetails(res.data))
      .catch(() => setMemberDetails(null))
      .finally(() => setMemberDetailsLoading(false));
  }, [selectedMember]);

  // Feature #1: Category breakdown data
  const categoryData = useMemo(() => {
    if (!data?.expenses) return [];
    const cats: { [key: string]: number } = {};
    data.expenses.forEach((exp) => {
      if (exp.source === 'Payment') return;
      const cat = exp.category || 'other';
      cats[cat] = (cats[cat] || 0) + exp.amount;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [data?.expenses]);

  // Feature #2: Member spending data
  const memberSpendingData = useMemo(() => {
    if (!data?.expenses || !data?.splitGroup) return [];
    return data.splitGroup.contacts.map((contact) => {
      let totalSpent = 0;
      let totalOwed = 0;
      data.expenses.forEach((exp) => {
        if (exp.source === 'Payment') return;
        const split = exp.split?.find((s: any) => s.phone === contact.phone || s.name === contact.name);
        if (split) {
          totalSpent += split.amount || 0;
          if (split.owner) totalOwed += exp.amount - (split.amount || 0);
        }
      });
      return {
        name: contact.name.length > 10 ? contact.name.substring(0, 10) + '…' : contact.name,
        fullName: contact.name,
        spent: Math.round(totalSpent * 100) / 100,
        paid: Math.round(totalOwed * 100) / 100,
      };
    });
  }, [data?.expenses, data?.splitGroup]);

  // Feature #3: Balance history timeline
  const balanceTimeline = useMemo(() => {
    if (!data?.expenses || !user) return [];
    const userPhone = (user.phone || user.phoneNumber) as string;
    if (!userPhone) return [];

    const sorted = [...data.expenses]
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    const timeline: { date: string; balance: number; event: string }[] = [];

    sorted.forEach((exp) => {
      const owner = exp.split?.find((s: any) => s.owner === true);
      if (!owner) return;

      exp.split?.forEach((split: any) => {
        if (split.phone === owner.phone) return;
        if (split.paidAt) return;
        const amt = split.amount || 0;
        if (amt === 0) return;

        const isPayment = (owner.amount || 0) === 0;

        if (split.phone === userPhone) {
          // User is in split — they owe
          if (isPayment) {
            runningBalance += amt;
          } else {
            runningBalance -= amt;
          }
        } else if (owner.phone === userPhone) {
          // User is owner — they're owed
          if (isPayment) {
            runningBalance -= amt;
          } else {
            runningBalance += amt;
          }
        }
      });

      timeline.push({
        date: new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: Math.round(runningBalance * 100) / 100,
        event: (() => { const d = exp.description || 'Expense'; return d.length > 20 ? d.substring(0, 20) + '…' : d; })(),
      });
    });

    return timeline;
  }, [data?.expenses, user]);

  // Feature #5: Activity feed
  const activityFeed = useMemo(() => {
    if (!data?.expenses) return [];
    return [...data.expenses]
      .filter((e) => e.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((exp) => {
        const owner = exp.split?.find((s: any) => s.owner === true);
        const isPayment = exp.source === 'Payment';
        return {
          id: exp._id || exp.code,
          date: exp.date,
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          ownerName: owner?.name || 'Unknown',
          isPayment,
          splitMembers: exp.split?.filter((s: any) => !s.owner).map((s: any) => s.name) || [],
        };
      });
  }, [data?.expenses]);

  // Feature #6: Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!data?.expenses) return [];
    const filtered = data.expenses.filter((exp) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!exp.description.toLowerCase().includes(q) && !(exp.category || '').toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
      if (filterMember !== 'all') {
        const hasMember = exp.split?.some((s: any) => s.name === filterMember || s.phone === filterMember);
        if (!hasMember) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'newest': return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        case 'oldest': return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        case 'amount-high': return b.amount - a.amount;
        case 'amount-low': return a.amount - b.amount;
        default: return 0;
      }
    });
  }, [data?.expenses, searchQuery, filterCategory, filterMember, sortOrder]);

  // Feature #9: Simplified debts
  const simplifiedDebts = useMemo(() => {
    if (!data?.expenses || !data?.splitGroup) return [];
    return simplifyDebts(data.expenses, data.splitGroup.contacts);
  }, [data?.expenses, data?.splitGroup]);

  // Unique categories from expenses
  const uniqueCategories = useMemo(() => {
    if (!data?.expenses) return [];
    const cats = new Set(data.expenses.map((e) => e.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [data?.expenses]);

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

  const openEditNameModal = () => {
    setEditNameModal({
      isOpen: true,
      newName: data?.splitGroup.name || '',
      isProcessing: false,
    });
  };

  const closeEditNameModal = () => {
    setEditNameModal({
      isOpen: false,
      newName: '',
      isProcessing: false,
    });
  };

  const handleDeleteGroup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Split Group',
      message: 'Are you sure you want to delete this split group? This cannot be undone.',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await axios.delete(`/api/split-groups/${id}`);
          router.push('/dashboard');
        } catch (err: any) {
          console.error('Error deleting split group:', err);
          const errorMsg = err.response?.data?.message || err.message || 'Failed to delete split group';
          notify('error', 'Delete Failed', errorMsg);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleSendReminders = async () => {
    if (!settlements.some((s) => s.type === 'owed')) {
      notify('info', 'No Reminders Needed', 'No one owes you in this group');
      return;
    }

    setIsSendingReminders(true);
    try {
      const response = await axios.post(`/api/split-groups/${id}/send-reminders`);
      const { sent, total, results } = response.data;
      const skipped = results?.filter((r: any) => r.status === 'skipped').map((r: any) => r.memberName);
      let msg = `Reminders sent to ${sent} of ${total} members.`;
      if (skipped?.length > 0) {
        msg += `\nSkipped (no email): ${skipped.join(', ')}`;
      }
      notify('success', 'Reminders Sent', msg);
    } catch (err: any) {
      console.error('Error sending reminders:', err);
      notify('error', 'Send Failed', err.response?.data?.message || 'Failed to send reminders');
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleSaveName = async () => {
    if (!editNameModal.newName || editNameModal.newName.trim().length === 0) {
      notify('warning', 'Invalid Name', 'Split group name cannot be empty');
      return;
    }

    if (editNameModal.newName === data?.splitGroup.name) {
      closeEditNameModal();
      return;
    }

    setEditNameModal((prev) => ({ ...prev, isProcessing: true }));

    try {
      const response = await axios.patch(
        `/api/split-groups/${id}`,
        { name: editNameModal.newName.trim() }
      );

      if (response.status === 200 && data) {
        setData({
          ...data,
          splitGroup: {
            ...data.splitGroup,
            name: editNameModal.newName.trim(),
          },
        });
        closeEditNameModal();
      }
    } catch (err: any) {
      console.error('Error updating split group name:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update name';
      notify('error', 'Update Failed', errorMsg);
    } finally {
      setEditNameModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Feature #4: Quick settle
  const handleQuickSettle = async (memberName: string, memberPhone: string, amount: number) => {
    try {
      await axios.post(`/api/split-groups/${id}/payment`, {
        receiverPhone: memberPhone,
        amount,
        payerPhone: user?.phone || user?.phoneNumber,
        user_code: (user as any)?._id || '',
      });
      notify('success', 'Payment Recorded', `${fmt(amount)} paid to ${memberName}`);
      setTimeout(() => globalThis.location.reload(), 1500);
    } catch (err: any) {
      console.error('Quick settle error:', err);
      notify('error', 'Payment Failed', err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handlePayment = async () => {
    const amount = Number.parseFloat(paymentModal.paymentAmount);

    if (!paymentModal.paymentAmount || Number.isNaN(amount)) {
      notify('warning', 'Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount <= 0) {
      notify('warning', 'Invalid Amount', 'Amount must be greater than 0');
      return;
    }

    if (amount > paymentModal.totalAmount) {
      notify('warning', 'Amount Too High', `Cannot pay more than ${fmt(paymentModal.totalAmount)} owed`);
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
          user_code: (user as any)?._id || '',
        }
      );

      if (response.status === 200) {
        setPaymentSuccess(`Payment of ${fmt(amount)} initiated to ${paymentModal.memberName}`);
        setTimeout(() => {
          closePaymentModal();
          globalThis.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Payment failed. Try again.';
      notify('error', 'Payment Failed', errorMsg);
    } finally {
      setPaymentModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Comments helpers
  const fetchComments = async (expenseId: string) => {
    setCommentsLoading(expenseId);
    try {
      const res = await axios.get(`/api/comments?expenseId=${expenseId}`);
      setComments((prev) => ({ ...prev, [expenseId]: res.data.comments || [] }));
    } catch {
      // silently fail
    } finally {
      setCommentsLoading(null);
    }
  };

  const toggleComments = (expenseId: string) => {
    if (openComments === expenseId) {
      setOpenComments(null);
    } else {
      setOpenComments(expenseId);
      if (!comments[expenseId]) fetchComments(expenseId);
    }
    setCommentText('');
  };

  const postComment = async (expenseId: string) => {
    if (!commentText.trim()) return;
    setPostingComment(true);
    try {
      await axios.post('/api/comments', {
        expenseId,
        text: commentText.trim(),
        authorName: user?.displayName || user?.name || 'You',
        authorPhone: (user?.phone || user?.phoneNumber) as string,
      });
      setCommentText('');
      fetchComments(expenseId);
    } catch {
      notify('error', 'Error', 'Failed to post comment');
    } finally {
      setPostingComment(false);
    }
  };

  const deleteComment = async (commentId: string, expenseId: string) => {
    try {
      await axios.delete(`/api/comments?id=${commentId}`);
      fetchComments(expenseId);
    } catch {
      notify('error', 'Error', 'Failed to delete comment');
    }
  };

  const handleDeleteExpense = (expenseId: string, expenseDescription: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Expense',
      message: `Delete "${expenseDescription}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/split-groups/${id}/expense/${expenseId}`);
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              expenses: prev.expenses.filter((e) => e._id !== expenseId),
              splitGroup: {
                ...prev.splitGroup,
                expenses: prev.splitGroup.expenses.filter((eid: any) => String(eid) !== expenseId),
              },
            };
          });
          notify('success', 'Deleted', 'Expense deleted successfully');
        } catch (err: any) {
          notify('error', 'Delete Failed', err.response?.data?.message || 'Failed to delete expense');
        }
      },
    });
  };

  const handleMarkMemberPaid = async (expenseId: string, memberPhone: string, currentlyPaid: boolean) => {
    const newPaid = !currentlyPaid;
    try {
      await axios.patch(`/api/split-groups/${id}/expense/${expenseId}/paid`, { paid: newPaid, memberPhone });
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          expenses: prev.expenses.map((e) =>
            e._id === expenseId
              ? {
                  ...e,
                  split: e.split?.map((s: any) =>
                    s.phone === memberPhone
                      ? { ...s, paidAt: newPaid ? new Date().toISOString() : null, paidBy: newPaid ? (user?.phone || user?.phoneNumber) : null }
                      : s
                  ),
                } as any
              : e
          ),
        };
      });
      notify('success', newPaid ? 'Marked Paid' : 'Unmarked', newPaid ? 'Member marked as paid' : 'Member marked as unpaid');
    } catch (err: any) {
      notify('error', 'Failed', err.response?.data?.message || 'Failed to update expense');
    }
  };

  // Feature #8: Copy payment link
  const copyPaymentLink = (memberPhone: string, amount: number) => {
    const link = generatePaymentLink(id, memberPhone, amount);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(memberPhone);
      setTimeout(() => setCopiedLink(null), 2000);
    });
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary hover:text-primary-dark transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2 flex-wrap">
            {!isSettled && (
              <button
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-semibold"
                title="Add Expense"
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
            )}
            {/* Feature #10: Export buttons */}
            <button
              onClick={() => exportToCSV(splitGroup, expenses, settlements)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => exportToPDF(splitGroup, expenses, settlements)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
              title="Export PDF"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => globalThis.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm"
              title="Print"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-8 md:p-12">
          {/* Split Group Header */}
          <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                  <Users className="w-5 sm:w-6 h-5 sm:h-6 text-primary flex-shrink-0" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {splitGroup.name}
                  </h1>
                  <button
                    onClick={openEditNameModal}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="Edit split group name"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </button>
                  {user && (splitGroup.owner === user._id || (user as any).collection === splitGroup.owner) && (
                    <button
                      onClick={handleDeleteGroup}
                      disabled={isDeleting}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-700 rounded-lg transition"
                      title="Delete split group"
                    >
                      <span className="sr-only">Delete split group</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-danger"
                      >
                        <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h5a1 1 0 1 1 0 2h-1v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5H3a1 1 0 1 1 0-2h5Zm1 3a1 1 0 0 0-1 1v11a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v11a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1Z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Split group with {splitGroup.contacts.length} members
                </p>
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`inline-block px-3 sm:px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base ${isSettled
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                    }`}
                >
                  {isSettled ? (
                    <>
                      <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                      SETTLED
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                      ACTIVE
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Created
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  <DateTooltip dateInput={splitGroup.createdAt || ''}>
                    {new Date(splitGroup.createdAt || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </DateTooltip>
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Total Amount
                </p>
                <p className="text-base sm:text-lg font-bold text-danger">{fmt(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="mb-12">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Group Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {splitGroup.contacts.map((contact) => {
                const memberExpenses = expenses.filter(
                  (exp) => exp.split?.some((s) => s.phone === contact.phone || s.name === contact.name)
                );
                const memberTotal = memberExpenses.reduce((sum, exp) => {
                  const split = exp.split?.find((s) => s.phone === contact.phone || s.name === contact.name);
                  return sum + (split?.amount || 0);
                }, 0);
                const memberSettlement = settlements.find(
                  (s) => s.memberPhone === contact.phone || s.memberName === contact.name
                );

                return (
                  <div
                    key={contact.contactId}
                    onClick={() => setSelectedMember(contact)}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{contact.name}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{contact.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {fmt(memberTotal)}
                        </p>
                        {memberSettlement && (
                          <p className={`text-xs mt-1 ${memberSettlement.type === 'owes' ? 'text-warning' : 'text-success'}`}>
                            {memberSettlement.type === 'owes' ? 'You owe' : 'Owes you'} {fmt(memberSettlement.amount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {memberExpenses.length} expense{memberExpenses.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature #1, #2, #3, #5: Insights Section */}
          {expenses.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Insights
              </h2>

              {/* Tab navigation */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: 'category' as const, label: 'Categories', icon: <DollarSign className="w-4 h-4" /> },
                  { key: 'members' as const, label: 'Members', icon: <Users className="w-4 h-4" /> },
                  { key: 'timeline' as const, label: 'Balance', icon: <TrendingUp className="w-4 h-4" /> },
                  { key: 'activity' as const, label: 'Activity', icon: <Clock className="w-4 h-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveInsightTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      activeInsightTab === tab.key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Feature #1: Category Breakdown */}
              {activeInsightTab === 'category' && categoryData.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="w-full lg:w-1/2" style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => fmt(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/2 space-y-2">
                      {categoryData.map((cat, i) => (
                        <div key={cat.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{cat.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{fmt(cat.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Feature #2: Member Spending */}
              {activeInsightTab === 'members' && memberSpendingData.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Spending per Member</h3>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={memberSpendingData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: any, name: any) => [fmt(Number(value)), name === 'spent' ? 'Their Share' : 'Paid For Others']}
                          labelFormatter={(label: any) => {
                            const member = memberSpendingData.find((m) => m.name === label);
                            return member?.fullName || String(label);
                          }}
                        />
                        <Legend />
                        <Bar dataKey="spent" name="Their Share" fill="#2F2E51" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="paid" name="Paid For Others" fill="#4DD69B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Feature #3: Balance Timeline */}
              {activeInsightTab === 'timeline' && balanceTimeline.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Balance Over Time</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Positive = owed to you, Negative = you owe
                  </p>
                  <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={balanceTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: any) => [fmt(Number(value)), 'Balance']}
                          labelFormatter={(_, payload) => {
                            const item = payload?.[0]?.payload;
                            return item ? `${item.date} — ${item.event}` : '';
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="balance"
                          stroke="#2F2E51"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#2F2E51' }}
                          activeDot={{ r: 6 }}
                        />
                        {/* Zero reference line */}
                        <Line
                          type="monotone"
                          dataKey={() => 0}
                          stroke="#e5e5e5"
                          strokeDasharray="5 5"
                          dot={false}
                          strokeWidth={1}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Feature #5: Activity Feed */}
              {activeInsightTab === 'activity' && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Activity Feed</h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-4">
                      {activityFeed.slice(0, 20).map((activity, index) => (
                        <div key={activity.id || index} className="relative pl-10">
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                            activity.isPayment ? 'bg-success' : 'bg-primary'
                          }`} />
                          <div className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {activity.isPayment ? '💸 ' : '🧾 '}
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {activity.isPayment ? 'Payment' : `Paid by ${activity.ownerName}`}
                                  {activity.splitMembers.length > 0 && !activity.isPayment && (
                                    <> · Split with {activity.splitMembers.join(', ')}</>
                                  )}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-sm font-bold ${activity.isPayment ? 'text-success' : 'text-danger'}`}>
                                  {fmt(activity.amount)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            {activity.category && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 text-xs capitalize">
                                {activity.category}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expenses Section with Feature #6: Search & Filter */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Linked Expenses ({expenses.length})
              </h2>
            </div>

            {/* Feature #6: Search and Filters */}
            {expenses.length > 0 && (
              <div className="mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      showFilters
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="appearance-none pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition focus:outline-none focus:border-primary"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="amount-high">Amount: High to Low</option>
                      <option value="amount-low">Amount: Low to High</option>
                    </select>
                    <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {showFilters && (
                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="all">All Categories</option>
                        {uniqueCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Member</label>
                      <select
                        value={filterMember}
                        onChange={(e) => setFilterMember(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="all">All Members</option>
                        {splitGroup.contacts.map((c) => (
                          <option key={c.contactId} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {(filterCategory !== 'all' || filterMember !== 'all' || searchQuery) && (
                      <div className="flex items-end">
                        <button
                          onClick={() => { setFilterCategory('all'); setFilterMember('all'); setSearchQuery(''); }}
                          className="px-3 py-2 text-sm text-primary hover:text-primary-dark font-medium"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {(searchQuery || filterCategory !== 'all' || filterMember !== 'all') && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {filteredExpenses.length} of {expenses.length} expenses
                  </p>
                )}
              </div>
            )}

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  {expenses.length === 0 ? 'No expenses in this split group' : 'No expenses match your filters'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {(showAllExpenses ? filteredExpenses : filteredExpenses.slice(0, 4)).map((expense, expenseIndex) => (
                    <div
                      key={expense._id ?? expenseIndex}
                      className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg mb-2 break-words">
                            {expense.description}
                          </h3>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {expense.date && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Calendar className="w-4 h-4" />
                                <DateTooltip dateInput={expense.date}>
                                  {new Date(expense.date).toLocaleDateString()}
                                </DateTooltip>
                              </div>
                            )}
                            {expense.category && (
                              <div className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-400 text-xs font-medium capitalize flex-shrink-0">
                                {expense.category}
                              </div>
                            )}
                            {expense.source === 'Payment' && (
                              <div className="inline-block px-2 py-1 bg-success/10 rounded text-success text-xs font-medium flex-shrink-0">
                                Payment
                              </div>
                            )}
                          </div>

                          {/* Feature #7: Split breakdown with slider UI */}
                          {expense.split && expense.split.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                                Split:
                              </p>

                              <div className="space-y-2">
                                {(() => {
                                  const expenseId = String(expense._id ?? expenseIndex);
                                  const splitEntries = expense.split ?? [];
                                  const editing = editingSplits[expenseId]?.isEditing;

                                  const amounts =
                                    editingSplits[expenseId]?.amounts ??
                                    splitEntries.map((s: any) => s.amount || 0);

                                  return (
                                    <>
                                      {splitEntries.map((split: any, splitIndex: number) => {
                                        const currentAmount = amounts[splitIndex] || 0;
                                        const percentage = expense.amount > 0 ? (currentAmount / expense.amount) * 100 : 0;

                                        return (
                                          <div key={split.$id || split.name || splitIndex} className="flex items-center gap-2">
                                            {!editing ? (
                                              <div className="flex-1 flex items-center gap-2">
                                                <span className={`text-xs font-medium w-24 truncate ${split.paidAt ? 'text-success line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                                  {split.name}
                                                </span>
                                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 relative">
                                                  <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                      width: `${Math.min(percentage, 100)}%`,
                                                      backgroundColor: split.paidAt ? '#4DD69B' : CHART_COLORS[splitIndex % CHART_COLORS.length],
                                                    }}
                                                  />
                                                </div>
                                                <span className={`text-xs w-20 text-right ${split.paidAt ? 'text-success line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                                                  {fmt(currentAmount)}
                                                </span>
                                                <span className="text-xs text-gray-400 w-12 text-right">
                                                  {percentage.toFixed(0)}%
                                                </span>
                                                {!split.owner && expense.source !== 'Payment' && !isSettled && (
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarkMemberPaid(String(expense._id), split.phone, !!split.paidAt); }}
                                                    className={`flex-shrink-0 p-0.5 rounded transition ${split.paidAt ? 'text-warning hover:bg-warning/10' : 'text-success hover:bg-success/10'}`}
                                                    title={split.paidAt ? `Unmark ${split.name} as paid` : `Mark ${split.name} as paid`}
                                                  >
                                                    {split.paidAt ? <CircleX className="w-4 h-4" /> : <CircleCheck className="w-4 h-4" />}
                                                  </button>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="flex-1 flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-24 truncate">
                                                  {split.name}
                                                </span>
                                                {editingSplits[expenseId]?.splitMode === 'percentage' ? (
                                                  <>
                                                    <input
                                                      type="number"
                                                      step="0.1"
                                                      min="0"
                                                      max="100"
                                                      value={expense.amount > 0 ? Math.round(currentAmount / expense.amount * 1000) / 10 : 0}
                                                      onChange={(e) => {
                                                        const raw = Number.parseFloat(e.target.value || '0');
                                                        const pct = Number.isNaN(raw) ? 0 : Math.min(100, raw);
                                                        const expId = String(expense._id ?? expenseIndex);
                                                        const entries = expense.split ?? [];

                                                        setEditingSplits((prev) => {
                                                          const cur = prev[expId];
                                                          if (!cur) return prev;

                                                          const edited = new Set(cur.editedPctIndexes || []);
                                                          edited.add(splitIndex);

                                                          const newAmounts = [...cur.amounts];
                                                          newAmounts[splitIndex] = Math.round((pct / 100) * expense.amount * 100) / 100;

                                                          const editedPctSum = Array.from(edited).reduce((sum, i) => {
                                                            const p = i === splitIndex ? pct : (expense.amount > 0 ? (newAmounts[i] / expense.amount) * 100 : 0);
                                                            return sum + p;
                                                          }, 0);
                                                          const remainingPct = Math.max(0, 100 - editedPctSum);
                                                          const uneditedIndexes = entries.map((_: any, i: number) => i).filter((i: number) => !edited.has(i));

                                                          if (uneditedIndexes.length > 0) {
                                                            const evenPct = remainingPct / uneditedIndexes.length;
                                                            uneditedIndexes.forEach((i: number) => {
                                                              newAmounts[i] = Math.round((evenPct / 100) * expense.amount * 100) / 100;
                                                            });
                                                            const total = newAmounts.reduce((a, b) => a + b, 0);
                                                            const diff = Math.round((expense.amount - total) * 100) / 100;
                                                            if (Math.abs(diff) >= 0.01) {
                                                              newAmounts[uneditedIndexes[0]] = Math.round((newAmounts[uneditedIndexes[0]] + diff) * 100) / 100;
                                                            }
                                                          }

                                                          return { ...prev, [expId]: { ...cur, amounts: newAmounts, editedPctIndexes: edited } };
                                                        });
                                                      }}
                                                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right"
                                                    />
                                                    <span className="text-xs text-gray-500">%</span>
                                                    <span className="text-xs text-gray-400 w-20 text-right">{fmt(currentAmount)}</span>
                                                  </>
                                                ) : editingSplits[expenseId]?.splitMode === 'shares' ? (
                                                  <>
                                                    <div className="flex items-center gap-1">
                                                      {[1, 2, 3].map((s) => {
                                                        const currentShare = editingSplits[expenseId]?.shares?.[splitIndex] ?? 1;
                                                        return (
                                                          <button
                                                            key={s}
                                                            onClick={() => {
                                                              const expId = String(expense._id ?? expenseIndex);
                                                              setEditingSplits((prev) => {
                                                                const cur = prev[expId];
                                                                if (!cur) return prev;
                                                                const newShares = [...(cur.shares || splitEntries.map(() => 1))];
                                                                newShares[splitIndex] = s;
                                                                const totalShares = newShares.reduce((a, b) => a + b, 0);
                                                                const newAmounts = newShares.map((sh, i) => {
                                                                  if (i === 0) {
                                                                    const others = newShares.slice(1).reduce((sum, si) => sum + Math.floor((si / totalShares) * expense.amount * 100) / 100, 0);
                                                                    return Math.round((expense.amount - others) * 100) / 100;
                                                                  }
                                                                  return Math.floor((sh / totalShares) * expense.amount * 100) / 100;
                                                                });
                                                                return { ...prev, [expId]: { ...cur, shares: newShares, amounts: newAmounts } };
                                                              });
                                                            }}
                                                            className={`w-7 h-7 rounded text-xs font-bold transition ${
                                                              currentShare === s
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                            }`}
                                                          >
                                                            {s}
                                                          </button>
                                                        );
                                                      })}
                                                      <span className="text-xs text-gray-500 ml-1">
                                                        {editingSplits[expenseId]?.shares?.[splitIndex] ?? 1}x
                                                      </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 w-20 text-right">{fmt(currentAmount)}</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 relative">
                                                      <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                          width: `${Math.min(expense.amount > 0 ? (currentAmount / expense.amount) * 100 : 0, 100)}%`,
                                                          backgroundColor: CHART_COLORS[splitIndex % CHART_COLORS.length],
                                                        }}
                                                      />
                                                    </div>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      value={currentAmount}
                                                      onChange={(e) => {
                                                        const val = Number.parseFloat(e.target.value || '0');
                                                        const expId = String(expense._id ?? expenseIndex);
                                                        setEditingSplits((prev) => {
                                                          const cur = prev[expId];
                                                          if (!cur) return prev;
                                                          const newAmounts = [...cur.amounts];
                                                          newAmounts[splitIndex] = Number.isNaN(val) ? 0 : val;
                                                          return { ...prev, [expId]: { ...cur, amounts: newAmounts } };
                                                        });
                                                      }}
                                                      onBlur={(e) => {
                                                        const val = Math.round(Number.parseFloat(e.target.value || '0') * 100) / 100;
                                                        const expId = String(expense._id ?? expenseIndex);
                                                        setEditingSplits((prev) => {
                                                          const cur = prev[expId];
                                                          if (!cur) return prev;
                                                          const newAmounts = [...cur.amounts];
                                                          newAmounts[splitIndex] = Number.isNaN(val) ? 0 : val;
                                                          return { ...prev, [expId]: { ...cur, amounts: newAmounts } };
                                                        });
                                                      }}
                                                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-right"
                                                    />
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}

                                      {/* Split mode selector & total validation */}
                                      {editing && (() => {
                                        const totalAssigned = amounts.reduce((a: number, b: number) => a + (b || 0), 0);
                                        const diff = Math.round((expense.amount - totalAssigned) * 100) / 100;
                                        const currentMode = editingSplits[expenseId]?.splitMode || 'amount';
                                        return (
                                          <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-1.5">
                                              {(['equal', 'shares', 'percentage', 'amount'] as const).map((mode) => (
                                                <button
                                                  key={mode}
                                                  onClick={() => {
                                                    if (mode === 'equal') {
                                                      const count = splitEntries.length;
                                                      const even = Math.floor((expense.amount / count) * 100) / 100;
                                                      const remainder = Math.round((expense.amount - even * count) * 100) / 100;
                                                      const newAmounts = splitEntries.map((_: any, i: number) => i === 0 ? even + remainder : even);
                                                      setEditingSplits((prev) => ({
                                                        ...prev,
                                                        [expenseId]: { ...prev[expenseId], amounts: newAmounts, splitMode: 'equal' },
                                                      }));
                                                    } else if (mode === 'shares') {
                                                      const shares = splitEntries.map(() => 1);
                                                      const totalShares = shares.length;
                                                      const even = Math.floor((expense.amount / totalShares) * 100) / 100;
                                                      const remainder = Math.round((expense.amount - even * totalShares) * 100) / 100;
                                                      const newAmounts = shares.map((_: number, i: number) => i === 0 ? even + remainder : even);
                                                      setEditingSplits((prev) => ({
                                                        ...prev,
                                                        [expenseId]: { ...prev[expenseId], amounts: newAmounts, shares, splitMode: 'shares' },
                                                      }));
                                                    } else {
                                                      setEditingSplits((prev) => ({
                                                        ...prev,
                                                        [expenseId]: { ...prev[expenseId], splitMode: mode, editedPctIndexes: new Set() },
                                                      }));
                                                    }
                                                  }}
                                                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                                                    currentMode === mode
                                                      ? 'bg-primary text-white'
                                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                  }`}
                                                >
                                                  {mode === 'equal' ? '= Equal' : mode === 'shares' ? '⊞ Shares' : mode === 'percentage' ? '% Percent' : '₹ Amount'}
                                                </button>
                                              ))}
                                            </div>
                                            <div className={`text-xs font-medium ${
                                              Math.abs(diff) < 0.01 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-warning'
                                            }`}>
                                              {Math.abs(diff) < 0.01
                                                ? `Total: ${fmt(expense.amount)} ✓`
                                                : diff < 0
                                                  ? `Over by ${fmt(Math.abs(diff))} — total cannot exceed ${fmt(expense.amount)}`
                                                  : `${fmt(diff)} unassigned of ${fmt(expense.amount)}`
                                              }
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* Edit/Save/Cancel controls */}
                                      <div className="flex items-center gap-2 mt-2">
                                        {!editing ? (
                                          <button
                                            onClick={() => {
                                              setEditingSplits((prev) => ({
                                                ...prev,
                                                [expenseId]: {
                                                  amounts: splitEntries.map((s: any) => s.amount || 0),
                                                  original: splitEntries.map((s: any) => s.amount || 0),
                                                  isEditing: true,
                                                  splitMode: 'amount',
                                                },
                                              }));
                                            }}
                                            title="Edit split amounts"
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                          >
                                            <Edit2 className="w-4 h-4 text-primary" />
                                          </button>
                                        ) : (
                                          <>
                                            <button
                                              onClick={async () => {
                                                const updated = editingSplits[expenseId];
                                                if (!updated) return;

                                                const totalAssigned = updated.amounts.reduce((a, b) => a + (b || 0), 0);
                                                if (Math.round(totalAssigned * 100) > Math.round(expense.amount * 100)) {
                                                  notify('warning', 'Invalid Split', `Total (${fmt(totalAssigned)}) exceeds expense amount (${fmt(expense.amount)})`);
                                                  return;
                                                }

                                                try {
                                                  const payload = (expense.split || []).map((s: any, i: number) => ({
                                                    ...s,
                                                    amount: Number.parseFloat((updated.amounts[i] || 0).toFixed(2)),
                                                  }));

                                                  await axios.put(`/api/transactions?id=${expense._id}`, { split: payload });

                                                  setData((prev) => {
                                                    if (!prev) return prev;
                                                    const newExpenses = prev.expenses.map((ex) => {
                                                      if (ex._id === expense._id) return { ...ex, split: payload };
                                                      return ex;
                                                    });
                                                    return { ...prev, expenses: newExpenses };
                                                  });

                                                  setEditingSplits((prev) => ({
                                                    ...prev,
                                                    [expenseId]: { ...prev[expenseId], isEditing: false },
                                                  }));
                                                } catch (err: any) {
                                                  console.error('Failed to save split:', err);
                                                  notify('error', 'Save Failed', err.response?.data?.message || 'Failed to save split amounts');
                                                }
                                              }}
                                              title="Save"
                                              className="text-sm px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => {
                                                setEditingSplits((prev) => ({
                                                  ...prev,
                                                  [expenseId]: {
                                                    ...prev[expenseId],
                                                    isEditing: false,
                                                    amounts: prev[expenseId]?.original ?? [],
                                                    splitMode: 'amount',
                                                  },
                                                }));
                                              }}
                                              title="Cancel"
                                              className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-xl sm:text-2xl font-bold text-danger mb-3">
                            {fmt(expense.amount)}
                          </p>
                          <div className="flex items-center gap-2 justify-end flex-wrap">

                            {!isSettled && user && (
                              (() => {
                                const isExpenseOwner = expense.split?.some((s: any) => s.owner === true && s.phone === (user.phone || user.phoneNumber));
                                const isGrpOwner = splitGroup.owner === user._id || (user as any).collection === splitGroup.owner;
                                return (isExpenseOwner || isGrpOwner) ? (
                                  <button
                                    onClick={() => handleDeleteExpense(String(expense._id), expense.description)}
                                    className="inline-flex items-center gap-1 px-3 py-2 border border-danger/30 text-danger rounded-lg hover:bg-danger/5 transition text-xs sm:text-sm font-medium whitespace-nowrap"
                                    title="Delete expense"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : null;
                              })()
                            )}
                            <button
                              onClick={() => toggleComments(String(expense._id ?? expenseIndex))}
                              className={`inline-flex items-center gap-1 px-3 py-2 border rounded-lg transition text-xs sm:text-sm font-medium whitespace-nowrap ${
                                openComments === String(expense._id ?? expenseIndex)
                                  ? 'border-primary text-primary bg-primary/5'
                                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary'
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              {comments[String(expense._id ?? expenseIndex)]?.length || ''}
                            </button>
                            <Link
                              href={`/invoice/${expense.code || expense._id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-xs sm:text-sm font-medium whitespace-nowrap"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Comments Thread */}
                      {openComments === String(expense._id ?? expenseIndex) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3 flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            Comments
                          </p>

                          {commentsLoading === String(expense._id ?? expenseIndex) ? (
                            <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                            </div>
                          ) : (
                            <>
                              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                                {(comments[String(expense._id ?? expenseIndex)] || []).length === 0 ? (
                                  <p className="text-xs text-gray-400 py-2">No comments yet. Start the conversation!</p>
                                ) : (
                                  (comments[String(expense._id ?? expenseIndex)] || []).map((comment: any) => (
                                    <div key={comment._id} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg">
                                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-primary text-[10px] font-bold">{comment.authorName?.charAt(0)?.toUpperCase() || '?'}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-900 dark:text-white">{comment.authorName}</span>
                                          <span className="text-[10px] text-gray-400">
                                            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{comment.text}</p>
                                      </div>
                                      {comment.userId === (user as any)?._id && (
                                        <button
                                          onClick={() => deleteComment(comment._id, String(expense._id ?? expenseIndex))}
                                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-danger flex-shrink-0"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      postComment(String(expense._id ?? expenseIndex));
                                    }
                                  }}
                                  className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:outline-none focus:border-primary"
                                />
                                <button
                                  onClick={() => postComment(String(expense._id ?? expenseIndex))}
                                  disabled={postingComment || !commentText.trim()}
                                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition disabled:opacity-50"
                                >
                                  {postingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showAllExpenses && filteredExpenses.length > 4 && (
                  <button
                    onClick={() => setShowAllExpenses(true)}
                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm sm:text-base"
                  >
                    View All {filteredExpenses.length} Expenses
                  </button>
                )}

                {showAllExpenses && filteredExpenses.length > 4 && (
                  <button
                    onClick={() => setShowAllExpenses(false)}
                    className="mt-6 w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium text-sm sm:text-base"
                  >
                    Show Less
                  </button>
                )}
              </>
            )}
          </div>

          {/* Settlement Summary Section with Features #4, #8, #9 */}
          <div className="my-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Settlement Status
              </h2>
              {/* Feature #9: Simplify debts toggle */}
              {simplifiedDebts.length > 0 && (
                <button
                  onClick={() => setShowSimplified(!showSimplified)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    showSimplified
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {showSimplified ? 'Show Individual' : 'Simplify Debts'}
                </button>
              )}
            </div>

            {/* Feature #9: Simplified debts view */}
            {showSimplified && simplifiedDebts.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Simplified from multiple debts to {simplifiedDebts.length} transaction{simplifiedDebts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {simplifiedDebts.map((debt, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <span className="text-warning text-sm font-bold">{debt.from.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {debt.from} → {debt.to}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {fmt(debt.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Feature #8: Share payment link */}
                      <button
                        onClick={() => copyPaymentLink(debt.toPhone, debt.amount)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                      >
                        {copiedLink === debt.toPhone ? (
                          <><CheckCircle className="w-3.5 h-3.5 text-success" /> Copied!</>
                        ) : (
                          <><Share2 className="w-3.5 h-3.5" /> Share Link</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {settlements.length === 0 && !isSettled ? (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                    <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">All settled! No pending payments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* You Owe Section */}
                    {settlements.some((s) => s.type === 'owes') && (
                      <div className="p-4 sm:p-6 bg-warning/10 border border-warning/30 rounded-lg">
                        <h3 className="font-semibold text-warning mb-4 flex items-center gap-2 text-sm sm:text-base">
                          <TrendingDown className="w-5 h-5 flex-shrink-0" />
                          You Owe
                        </h3>
                        <div className="space-y-3">
                          {settlements
                            .filter((s) => s.type === 'owes')
                            .map((settlement) => (
                              <div
                                key={`${settlement.memberPhone}-owes`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {settlement.memberName}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {fmt(settlement.amount)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {/* Feature #8: Share payment link */}
                                  <button
                                    onClick={() => copyPaymentLink(settlement.memberPhone, settlement.amount)}
                                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                    title="Copy payment link"
                                  >
                                    {copiedLink === settlement.memberPhone ? (
                                      <><CheckCircle className="w-3.5 h-3.5 text-success" /> Copied</>
                                    ) : (
                                      <><Share2 className="w-3.5 h-3.5" /> Link</>
                                    )}
                                  </button>
                                  {/* Feature #4: Quick settle for amounts under ₹100 */}
                                  {settlement.amount <= 100 && (
                                    <button
                                      onClick={() => {
                                        setConfirmDialog({
                                          isOpen: true,
                                          title: 'Quick Settle',
                                          message: `Pay ${fmt(settlement.amount)} to ${settlement.memberName}?`,
                                          onConfirm: () => handleQuickSettle(settlement.memberName, settlement.memberPhone, settlement.amount),
                                        });
                                      }}
                                      className="flex items-center gap-1 px-3 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition text-xs font-medium"
                                      title="Quick settle"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      Quick
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openPaymentModal(settlement.memberName, settlement.memberPhone, settlement.amount)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Send className="w-4 h-4" />
                                    Pay
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* You Are Owed Section */}
                    {settlements.some((s) => s.type === 'owed') && (
                      <div className="p-4 sm:p-6 bg-success/10 border border-success/30 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-success flex items-center gap-2 text-sm sm:text-base">
                            <TrendingUp className="w-5 h-5 flex-shrink-0" />
                            You Are Owed
                          </h3>
                          <button
                            onClick={handleSendReminders}
                            disabled={isSendingReminders || isSettled}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isSendingReminders ? 'Sending...' : 'Send Reminders'}
                          </button>
                        </div>
                        <div className="space-y-3">
                          {settlements
                            .filter((s) => s.type === 'owed')
                            .map((settlement) => (
                              <div
                                key={`${settlement.memberPhone}-owed`}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-gray-700 rounded-lg"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                                    {settlement.memberName}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Owes {fmt(settlement.amount)}
                                  </p>
                                </div>
                                {/* Feature #8: Share payment request link */}
                                <button
                                  onClick={() => copyPaymentLink(settlement.memberPhone, settlement.amount)}
                                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition flex-shrink-0"
                                  title="Copy payment request link"
                                >
                                  {copiedLink === settlement.memberPhone ? (
                                    <><CheckCircle className="w-3.5 h-3.5 text-success" /> Copied!</>
                                  ) : (
                                    <><Share2 className="w-3.5 h-3.5" /> Request Link</>
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
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
                    Settled on <DateTooltip dateInput={splitGroup.settledAt}>{new Date(splitGroup.settledAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</DateTooltip>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 sm:mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Generated on{' '}
              <DateTooltip dateInput={new Date()}>
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </DateTooltip>
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
                  Total owed: {fmt(paymentModal.totalAmount)}
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
                      Max: {fmt(paymentModal.totalAmount)} | Remaining: {fmt(paymentModal.totalAmount - Number.parseFloat(paymentModal.paymentAmount || '0'))}
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

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {memberDetails?.registered && memberDetails.member?.avatar ? (
                  <img
                    src={memberDetails.member.avatar}
                    alt={selectedMember.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {selectedMember.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {memberDetails?.registered && memberDetails.member?.displayName
                      ? memberDetails.member.displayName
                      : selectedMember.name}
                  </h3>
                  {selectedMember.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedMember.phone}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Contact Info */}
            {memberDetailsLoading ? (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ) : memberDetails?.registered && memberDetails.member ? (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Contact Info
                  <span className="text-xs px-1.5 py-0.5 bg-success/10 text-success rounded font-medium">Registered</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {(memberDetails.member.firstName || memberDetails.member.lastName) && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {[memberDetails.member.firstName, memberDetails.member.lastName].filter(Boolean).join(' ')}
                      </p>
                    </div>
                  )}
                  {memberDetails.member.email && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-900 dark:text-white font-medium truncate">{memberDetails.member.email}</p>
                    </div>
                  )}
                  {memberDetails.member.phoneNumber && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white font-medium">{memberDetails.member.phoneNumber}</p>
                    </div>
                  )}
                  {memberDetails.member.gender && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="text-gray-900 dark:text-white font-medium capitalize">{memberDetails.member.gender}</p>
                    </div>
                  )}
                  {memberDetails.member.dateOfBirth && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(memberDetails.member.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {memberDetails.member.nickname && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nickname</p>
                      <p className="text-gray-900 dark:text-white font-medium">{memberDetails.member.nickname}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Contact Info
                  <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded font-medium">Not Registered</span>
                </h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedMember.name}</p>
                  </div>
                  {selectedMember.phone && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-900 dark:text-white font-medium">{selectedMember.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const memberSettlement = settlements.find(
                (s) => s.memberPhone === selectedMember.phone || s.memberName === selectedMember.name
              );

              return memberSettlement ? (
                <div className={`p-3 rounded-lg ${memberSettlement.type === 'owes' ? 'bg-warning/10 border border-warning/30' : 'bg-success/10 border border-success/30'}`}>
                  <p className={`text-sm font-semibold ${memberSettlement.type === 'owes' ? 'text-warning' : 'text-success'}`}>
                    {memberSettlement.type === 'owes'
                      ? `You owe ${selectedMember.name} ${fmt(memberSettlement.amount)}`
                      : `${selectedMember.name} owes you ${fmt(memberSettlement.amount)}`}
                  </p>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Notification Toast */}
      <NotificationModal
        notification={notification}
        onClose={() => setNotification(initialNotification)}
      />

      {/* Confirm Dialog */}
      <ConfirmModal
        confirm={confirmDialog}
        onClose={() => setConfirmDialog(initialConfirm)}
      />

      {/* Add Expense Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={() => {
          setShowTransactionModal(false);
          globalThis.location.reload();
        }}
        splitGroupId={id}
        splitGroupContacts={splitGroup.contacts}
        splitGroupCustomerId={splitGroup.customer_id}
      />

      {/* Edit Name Modal */}
      {editNameModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Split Group Name
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="group-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={editNameModal.newName}
                  onChange={(e) =>
                    setEditNameModal((prev) => ({
                      ...prev,
                      newName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  placeholder="Enter group name"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditNameModal}
                  disabled={editNameModal.isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveName}
                  disabled={editNameModal.isProcessing}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
                >
                  {editNameModal.isProcessing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
