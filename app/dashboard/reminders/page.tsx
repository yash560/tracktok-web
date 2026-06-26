'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { useProtectedPage } from '@/lib/useProtectedPage';
import { useCurrency } from '@/components/CurrencyContext';
import {
  NotificationModal,
  ConfirmModal,
  NotificationState,
  ConfirmState,
  initialNotification,
  initialConfirm,
} from '@/components/NotificationModal';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = [
  'food', 'shopping', 'bills', 'rent', 'utilities', 'groceries',
  'transportation', 'entertainment', 'health', 'education',
  'subscriptions', 'insurance', 'childcare', 'freelancing', 'other',
];

const FREQUENCIES = [
  { value: 'once', label: 'Once' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface Reminder {
  _id: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  frequency: string;
  enabled: boolean;
}

export default function RemindersPage() {
  useProtectedPage();
  const { fmt } = useCurrency();
  const searchParams = useSearchParams();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('bills');
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [frequency, setFrequency] = useState('monthly');
  const [enabled, setEnabled] = useState(true);

  const fetchReminders = async () => {
    try {
      const res = await axios.get('/api/reminders');
      setReminders(res.data.reminders || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Handle prefill from query params (from "Set as Recurring")
  useEffect(() => {
    if (searchParams.get('prefill') === 'true') {
      setTitle(searchParams.get('title') || '');
      setAmount(searchParams.get('amount') || '');
      setCategory(searchParams.get('category') || 'bills');
      setFrequency('monthly');
      setEnabled(true);
      setDueDate('');
      setEditing(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('bills');
    setDueDate('');
    setReminderTime('09:00');
    setFrequency('monthly');
    setEnabled(true);
    setEditing(null);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setTitle(r.title);
    setAmount(String(r.amount));
    setCategory(r.category);
    const dueParts = r.dueDate?.split('T') || [];
    setDueDate(dueParts[0] || '');
    setReminderTime(dueParts[1]?.substring(0, 5) || '09:00');
    setFrequency(r.frequency);
    setEnabled(r.enabled);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !amount || !dueDate) {
      setNotification({ isOpen: true, type: 'error', title: 'Missing fields', message: 'Fill in title, amount, and due date' });
      return;
    }

    try {
      const dueDateWithTime = `${dueDate}T${reminderTime}:00`;
      if (editing) {
        await axios.put('/api/reminders', {
          id: editing._id,
          title: title.trim(),
          amount: parseFloat(amount),
          category,
          dueDate: dueDateWithTime,
          frequency,
          enabled,
        });
        setNotification({ isOpen: true, type: 'success', title: 'Updated', message: 'Reminder updated' });
      } else {
        await axios.post('/api/reminders', {
          title: title.trim(),
          amount: parseFloat(amount),
          category,
          dueDate: dueDateWithTime,
          frequency,
          enabled,
        });
        setNotification({ isOpen: true, type: 'success', title: 'Created', message: 'Reminder created' });
      }
      resetForm();
      setModalOpen(false);
      fetchReminders();
    } catch {
      setNotification({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to save reminder' });
    }
  };

  const handleDelete = (r: Reminder) => {
    setConfirm({
      isOpen: true,
      title: 'Delete Reminder',
      message: `Delete "${r.title}"?`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/reminders?id=${r._id}`);
          setConfirm(initialConfirm);
          setNotification({ isOpen: true, type: 'success', title: 'Deleted', message: 'Reminder deleted' });
          fetchReminders();
        } catch {
          setNotification({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete' });
        }
      },
    });
  };

  const toggleEnabled = async (r: Reminder) => {
    try {
      await axios.put('/api/reminders', { id: r._id, enabled: !r.enabled });
      fetchReminders();
    } catch {
      // silently fail
    }
  };

  const getDaysUntil = (dateStr: string): number => {
    const due = new Date(dateStr);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getUrgencyClass = (dateStr: string): string => {
    const days = getDaysUntil(dateStr);
    if (days < 0) return 'border-danger/50 bg-danger/5';
    if (days <= 3) return 'border-warning/50 bg-warning/5';
    return 'border-gray-200 dark:border-gray-700';
  };

  const getUrgencyBadge = (dateStr: string) => {
    const days = getDaysUntil(dateStr);
    if (days < 0) return <span className="flex items-center gap-1 text-xs font-bold text-danger"><AlertTriangle className="w-3 h-3" /> {Math.abs(days)}d overdue</span>;
    if (days === 0) return <span className="flex items-center gap-1 text-xs font-bold text-warning"><Clock className="w-3 h-3" /> Due today</span>;
    if (days <= 3) return <span className="flex items-center gap-1 text-xs font-bold text-warning"><Clock className="w-3 h-3" /> In {days}d</span>;
    return <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" /> In {days}d</span>;
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            Bill Reminders
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Never miss a payment due date</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </motion.div>

      {/* Reminders Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
        </div>
      ) : reminders.length > 0 ? (
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((r) => (
            <div
              key={r._id}
              className={`card border-2 transition-all ${getUrgencyClass(r.dueDate)} ${!r.enabled ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base truncate">{r.title}</h3>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{r.category}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                    <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => handleDelete(r)} className="p-1.5 hover:bg-danger/10 rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-danger" />
                  </button>
                </div>
              </div>

              <p className="text-2xl font-bold text-primary mb-3">{fmt(r.amount)}</p>

              <div className="flex items-center justify-between gap-2">
                {getUrgencyBadge(r.dueDate)}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold capitalize flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5" /> {r.frequency}
                  </span>
                  <button
                    onClick={() => toggleEnabled(r)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${r.enabled ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform mt-[3px] ${r.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={item} className="card">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No reminders yet</h3>
            <p className="text-sm text-gray-500 text-center mb-4">Set up reminders for your recurring bills</p>
            <button
              onClick={() => { resetForm(); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Add First Reminder
            </button>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing ? 'Edit Reminder' : 'New Reminder'}</h3>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Netflix, Electricity Bill"
                  className="input-field"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-1.5 text-xs rounded-lg font-medium capitalize transition ${
                        category === cat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFrequency(f.value)}
                      className={`px-2 py-2 text-xs rounded-lg font-semibold transition ${
                        frequency === f.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enabled Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm"
              >
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal notification={notification} onClose={() => setNotification(initialNotification)} />
      <ConfirmModal confirm={confirm} onClose={() => setConfirm(initialConfirm)} />
    </motion.div>
  );
}
