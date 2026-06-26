'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Reminder {
  _id: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  frequency: string;
  enabled: boolean;
  lastNotified: string | null;
  cronJobId: string | null;
  createdAt: string;
}

const fmt = (v: number) => new Intl.NumberFormat('en-IN').format(v);

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '-';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [frequency, setFrequency] = useState('');
  const [enabled, setEnabled] = useState('');

  const limit = 20;

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get('/api/admin/reminders', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, frequency, enabled },
      });
      setReminders(data.reminders);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [page, frequency, enabled]);

  useEffect(() => { fetchReminders(); }, [fetchReminders]);

  useEffect(() => { setPage(1); }, [frequency, enabled]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reminders</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} total</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Frequencies</option>
          <option value="once">Once</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <select
          value={enabled}
          onChange={e => setEnabled(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All</option>
          <option value="yes">Enabled</option>
          <option value="no">Disabled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Frequency</th>
              <th className="px-4 py-3 font-medium">Enabled</th>
              <th className="px-4 py-3 font-medium">Last Notified</th>
              <th className="px-4 py-3 font-medium">Has Cron</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : reminders.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No reminders found</td></tr>
            ) : (
              reminders.map(r => (
                <tr key={r._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">₹{fmt(r.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.category}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {new Date(r.dueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {r.frequency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${r.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{r.enabled ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{timeAgo(r.lastNotified)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${r.cronJobId ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      {r.cronJobId ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {pages}</span>
        <button
          onClick={() => setPage(p => Math.min(pages, p + 1))}
          disabled={page >= pages}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
