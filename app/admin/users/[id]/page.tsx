'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, X } from 'lucide-react';

interface UserDetail {
  _id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles?: any[];
  collection?: string;
  code?: string;
  createdAt: string;
  gender?: string;
  dateOfBirth?: string;
  upiId?: string;
}

interface Stats {
  transactionCount: number;
  totalSpent: number;
  totalReceived: number;
  splitGroups: number;
  reminders: number;
}

interface Transaction {
  _id: string;
  amount: number;
  description?: string;
  category?: string;
  type: string;
  date?: string;
  createdAt: string;
}

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/users/${id}`);
      setUser(res.data.user);
      setStats(res.data.stats);
      setTransactions(res.data.recentTransactions || []);
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      displayName: user.displayName || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    });
    setEditModal(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/users/${id}`, editForm);
      setEditModal(false);
      fetchUser();
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setSaving(false);
    }
  };

  const getName = (u: UserDetail) =>
    u.displayName || [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';

  const getInitial = (u: UserDetail) => {
    const name = getName(u);
    return name !== '—' ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-400">User not found</p>
        <Link href="/admin/users" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <button
          onClick={openEdit}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Edit User
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
            {getInitial(user)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{getName(user)}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mt-4 text-sm">
              <div>
                <span className="text-gray-400 dark:text-gray-500">Phone</span>
                <p className="text-gray-900 dark:text-white">{user.phoneNumber || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">UPI ID</span>
                <p className="text-gray-900 dark:text-white">{user.upiId || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Gender</span>
                <p className="text-gray-900 dark:text-white capitalize">{user.gender || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Date of Birth</span>
                <p className="text-gray-900 dark:text-white">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Collection</span>
                <p className="text-gray-900 dark:text-white">{user.collection || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Code</span>
                <p className="text-gray-900 dark:text-white font-mono">{user.code || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 dark:text-gray-500">Member Since</span>
                <p className="text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Transactions', value: stats.transactionCount.toLocaleString('en-IN') },
            { label: 'Total Spent', value: formatINR(stats.totalSpent) },
            { label: 'Total Received', value: formatINR(stats.totalReceived) },
            { label: 'Split Groups', value: stats.splitGroups.toLocaleString('en-IN') },
            { label: 'Reminders', value: stats.reminders.toLocaleString('en-IN') },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{tx.description || '—'}</td>
                    <td
                      className={`px-4 py-3 text-right font-medium whitespace-nowrap ${
                        tx.type === 'debit'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {tx.type === 'debit' ? '- ' : '+ '}
                      {formatINR(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">
                      {tx.category || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              {([
                ['displayName', 'Display Name'],
                ['firstName', 'First Name'],
                ['lastName', 'Last Name'],
                ['email', 'Email'],
                ['phoneNumber', 'Phone Number'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                  </label>
                  <input
                    type={key === 'email' ? 'email' : 'text'}
                    value={editForm[key]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
