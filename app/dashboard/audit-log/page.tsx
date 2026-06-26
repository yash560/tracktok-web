'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Plus,
  Edit2,
  Trash2,
  LogIn,
  Settings,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import axios from 'axios';
import { useProtectedPage } from '@/lib/useProtectedPage';

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  create: { label: 'Created', color: 'text-success bg-success/10', icon: Plus },
  update: { label: 'Updated', color: 'text-blue-600 bg-blue-500/10', icon: Edit2 },
  delete: { label: 'Deleted', color: 'text-danger bg-danger/10', icon: Trash2 },
  login: { label: 'Login', color: 'text-purple-600 bg-purple-500/10', icon: LogIn },
  settings_change: { label: 'Settings', color: 'text-orange-600 bg-orange-500/10', icon: Settings },
};

const ENTITY_LABELS: Record<string, string> = {
  expense: 'Transaction',
  budget: 'Budget',
  reminder: 'Reminder',
  split_group: 'Split Group',
  profile: 'Profile',
};

interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export default function AuditLogPage() {
  useProtectedPage();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', '20');
        if (filterAction !== 'all') params.append('action', filterAction);
        if (filterEntity !== 'all') params.append('entity', filterEntity);

        const res = await axios.get(`/api/audit-log?${params.toString()}`);
        setLogs(res.data.logs || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [page, filterAction, filterEntity]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDetailSummary = (log: AuditLog): string => {
    const d = log.details;
    if (log.action === 'create' && d.description) return String(d.description);
    if (log.action === 'create' && d.category) return String(d.category);
    if (log.action === 'update' && d.after) {
      const after = d.after as Record<string, unknown>;
      const keys = Object.keys(after).filter(k => k !== 'updatedAt');
      if (keys.length > 0) return `Changed: ${keys.join(', ')}`;
    }
    if (log.action === 'delete' && d.description) return String(d.description);
    if (d.title) return String(d.title);
    if (d.name) return String(d.name);
    return '';
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ScrollText className="w-7 h-7 text-primary" />
            Audit Log
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track all changes to your account</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm font-medium"
        >
          <Filter className="w-4 h-4" />
          {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
      </motion.div>

      {/* Filters */}
      {showFilters && (
        <motion.div variants={item} className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Action</label>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Actions</option>
                <option value="create">Created</option>
                <option value="update">Updated</option>
                <option value="delete">Deleted</option>
                <option value="login">Login</option>
                <option value="settings_change">Settings Change</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Entity</label>
              <select
                value={filterEntity}
                onChange={(e) => { setFilterEntity(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Entities</option>
                <option value="expense">Transactions</option>
                <option value="budget">Budgets</option>
                <option value="reminder">Reminders</option>
                <option value="split_group">Split Groups</option>
                <option value="profile">Profile</option>
              </select>
            </div>
          </div>
          {(filterAction !== 'all' || filterEntity !== 'all') && (
            <button
              onClick={() => { setFilterAction('all'); setFilterEntity('all'); setPage(1); }}
              className="text-xs text-primary hover:underline font-semibold mt-3"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div variants={item} className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] || ACTION_LABELS.create;
              const Icon = actionInfo.icon;
              const summary = getDetailSummary(log);
              return (
                <div
                  key={log._id}
                  className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg/30 transition"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${actionInfo.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold uppercase tracking-wider ${actionInfo.color.split(' ')[0]}`}>
                        {actionInfo.label}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {ENTITY_LABELS[log.entity] || log.entity}
                      </span>
                    </div>
                    {summary && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{summary}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ScrollText className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No activity yet</h3>
            <p className="text-sm text-gray-500 text-center">Changes to your account will appear here</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:pointer-events-none transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
