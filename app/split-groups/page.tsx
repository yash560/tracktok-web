'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/components/AuthContext';
import { useProtectedPage } from '@/lib/useProtectedPage';
import { useCurrency } from '@/components/CurrencyContext';
import { formatShortDateTime } from '@/lib/dateFormatter';
import {
  Search,
  Filter,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  X,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react';

interface SplitGroupListItem {
  _id: string;
  name: string;
  contacts: { name: string; phone?: string | null }[];
  settledAt?: string | Date | null;
  createdAt?: string | Date;
  totalAmount: number;
  expenseCount: number;
  lastActivity?: string | Date;
}

type StatusFilter = 'all' | 'active' | 'settled';
type SortOrder = 'newest' | 'oldest' | 'amount-high' | 'amount-low' | 'name-az' | 'members-high';

export default function SplitGroupsListPage() {
  useProtectedPage();
  const { token } = useAuth();
  const { fmt } = useCurrency();

  const [groups, setGroups] = useState<SplitGroupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search + filter criteria
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await axios.get('/api/split-groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(response.data.splitGroups || []);
      } catch (err) {
        console.error('Error fetching split groups:', err);
        setError('Failed to load split groups');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [token]);

  const allMembers = useMemo(() => {
    const names = new Set<string>();
    groups.forEach((g) => g.contacts?.forEach((c) => names.add(c.name)));
    return Array.from(names).sort();
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() + 24 * 60 * 60 * 1000 - 1 : null;
    const min = minAmount ? parseFloat(minAmount) : null;
    const max = maxAmount ? parseFloat(maxAmount) : null;

    const filtered = groups.filter((g) => {
      if (q) {
        const nameMatch = g.name?.toLowerCase().includes(q);
        const memberMatch = g.contacts?.some((c) => c.name.toLowerCase().includes(q));
        if (!nameMatch && !memberMatch) return false;
      }

      if (status === 'active' && g.settledAt) return false;
      if (status === 'settled' && !g.settledAt) return false;

      if (memberFilter !== 'all' && !g.contacts?.some((c) => c.name === memberFilter)) return false;

      if (min !== null && g.totalAmount < min) return false;
      if (max !== null && g.totalAmount > max) return false;

      if (from !== null || to !== null) {
        const created = g.createdAt ? new Date(g.createdAt).getTime() : null;
        if (created === null) return false;
        if (from !== null && created < from) return false;
        if (to !== null && created > to) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'members-high':
          return (b.contacts?.length || 0) - (a.contacts?.length || 0);
        default:
          return 0;
      }
    });
  }, [groups, query, status, memberFilter, minAmount, maxAmount, dateFrom, dateTo, sortOrder]);

  const activeFilterCount = [
    status !== 'all',
    memberFilter !== 'all',
    !!minAmount,
    !!maxAmount,
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setStatus('all');
    setMemberFilter('all');
    setMinAmount('');
    setMaxAmount('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            Split Groups
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {groups.length} group{groups.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Global search bar */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by group name or member..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition text-sm font-semibold ${
                showFilters || activeFilterCount > 0
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/20 rounded-full px-1.5 text-xs">{activeFilterCount}</span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="name-az">Name: A-Z</option>
                <option value="members-high">Most members</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-2.5 transition ${viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-2.5 transition ${viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 dark:bg-dark-bg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="settled">Settled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Member
                </label>
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All members</option>
                  {allMembers.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Amount range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="Min"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1.5">
                  Created between
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm font-medium text-danger hover:text-danger/80 transition"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="card p-8 text-center text-gray-600 dark:text-gray-400">{error}</div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-12 text-center">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {groups.length === 0 ? 'No split groups yet' : 'No split groups match your search'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => {
              const isSettled = !!group.settledAt;
              return (
                <Link
                  key={group._id}
                  href={`/split-groups/${group._id}`}
                  className="bg-white dark:bg-dark-card rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg truncate">{group.name}</h2>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        isSettled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {isSettled ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isSettled ? 'Settled' : 'Active'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group.contacts?.map((c) => c.name).join(', ')}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="font-bold text-danger">{fmt(group.totalAmount || 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{group.expenseCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last activity</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {group.lastActivity ? formatShortDateTime(group.lastActivity as any) : '-'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
            {filteredGroups.map((group) => {
              const isSettled = !!group.settledAt;
              return (
                <Link
                  key={group._id}
                  href={`/split-groups/${group._id}`}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2 min-w-0 sm:w-56 flex-shrink-0">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <h2 className="font-bold text-gray-900 dark:text-white truncate">{group.name}</h2>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1 min-w-0">
                    {group.contacts?.map((c) => c.name).join(', ')}
                  </p>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right w-24">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="font-bold text-danger">{fmt(group.totalAmount || 0)}</p>
                    </div>
                    <div className="text-right w-20 hidden sm:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{group.expenseCount}</p>
                    </div>
                    <div className="text-right w-28 hidden md:block">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last activity</p>
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {group.lastActivity ? formatShortDateTime(group.lastActivity as any) : '-'}
                      </p>
                    </div>
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 w-24 justify-center ${
                        isSettled ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {isSettled ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {isSettled ? 'Settled' : 'Active'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
