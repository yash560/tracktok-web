'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface SplitGroup {
  _id: string;
  name: string;
  owner: string;
  contacts: unknown[];
  expenses: string[];
  settledAt: string | null;
  createdAt: string;
}

export default function SplitGroupsPage() {
  const [groups, setGroups] = useState<SplitGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [settled, setSettled] = useState('');

  const limit = 20;

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get('/api/admin/split-groups', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, search, settled },
      });
      setGroups(data.groups);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [page, search, settled]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  useEffect(() => { setPage(1); }, [search, settled]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Split Groups</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} total</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm flex-1"
        />
        <select
          value={settled}
          onChange={e => setSettled(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="settled">Settled</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Members</th>
              <th className="px-4 py-3 font-medium">Expenses</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No groups found</td></tr>
            ) : (
              groups.map(g => (
                <tr key={g._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{g.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">{g.owner}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{g.contacts.length}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{g.expenses.length}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      g.settledAt
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {g.settledAt ? 'Settled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {new Date(g.createdAt).toLocaleDateString('en-IN')}
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
