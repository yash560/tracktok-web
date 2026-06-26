'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface AuditLog {
  _id: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'settings_change';
  entity: 'expense' | 'budget' | 'reminder' | 'split_group' | 'profile';
  entityId: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  login: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  settings_change: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const limit = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, action, entity, startDate, endDate },
      });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [page, action, entity, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => { setPage(1); }, [action, entity, startDate, endDate]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Audit Logs</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{total} total</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <select
          value={action}
          onChange={e => setAction(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="settings_change">Settings Change</option>
        </select>
        <select
          value={entity}
          onChange={e => setEntity(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Entities</option>
          <option value="expense">Expense</option>
          <option value="budget">Budget</option>
          <option value="reminder">Reminder</option>
          <option value="split_group">Split Group</option>
          <option value="profile">Profile</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Entity ID</th>
              <th className="px-4 py-3 font-medium">User ID</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No logs found</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log._id} className="group">
                  <td colSpan={6} className="p-0">
                    <div
                      onClick={() => setExpanded(expanded === log._id ? null : log._id)}
                      className="grid grid-cols-6 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                    >
                      <div className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </div>
                      <div className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || actionColors.login}`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="px-4 py-3 text-gray-600 dark:text-gray-400">{log.entity}</div>
                      <div className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono truncate">{log.entityId}</div>
                      <div className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono truncate">{log.userId}</div>
                      <div className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs font-mono">{log.ip}</div>
                    </div>
                    {expanded === log._id && (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Details</p>
                        <pre className="text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
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
