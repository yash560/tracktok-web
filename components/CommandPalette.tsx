'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Receipt,
  Users,
  User,
  PiggyBank,
  ArrowRight,
  X,
  Clock,
} from 'lucide-react';
import axios from 'axios';

interface SearchResult {
  _id: string;
  path: string;
  [key: string]: unknown;
}

interface SearchResults {
  expenses: SearchResult[];
  splitGroups: SearchResult[];
  contacts: SearchResult[];
  budgets: SearchResult[];
}

const SECTION_CONFIG = [
  { key: 'expenses' as const, label: 'Transactions', icon: Receipt },
  { key: 'splitGroups' as const, label: 'Split Groups', icon: Users },
  { key: 'contacts' as const, label: 'Contacts', icon: User },
  { key: 'budgets' as const, label: 'Budgets', icon: PiggyBank },
];

const RECENT_KEY = 'tracktok_recent_searches';
const MAX_RECENT = 5;

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const recent = getRecent().filter(r => r !== q);
  recent.unshift(q);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  // Build flat list for keyboard nav
  const flatItems = results
    ? SECTION_CONFIG.flatMap(s => (results[s.key] || []).map(r => ({ ...r, section: s.key })))
    : [];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setSelectedIndex(0);
      setRecentSearches(getRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
      setSelectedIndex(0);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const navigate = (path: string) => {
    if (query.trim()) saveRecent(query.trim());
    onClose();
    router.push(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      e.preventDefault();
      navigate(flatItems[selectedIndex].path);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getItemLabel = (item: SearchResult, section: string): { title: string; sub: string } => {
    switch (section) {
      case 'expenses':
        return {
          title: String(item.description || 'Transaction'),
          sub: `${item.type === 'income' ? '+' : '-'}₹${Math.abs(Number(item.amount)).toFixed(0)} · ${item.category || ''}`,
        };
      case 'splitGroups':
        return {
          title: String(item.name || 'Group'),
          sub: item.settledAt ? 'Settled' : 'Active',
        };
      case 'contacts':
        return {
          title: String(item.name || 'Contact'),
          sub: String(item.phone || item.email || ''),
        };
      case 'budgets':
        return {
          title: String(item.category || 'Budget'),
          sub: `₹${Number(item.amount).toFixed(0)} · ${item.month || ''}`,
        };
      default:
        return { title: String(item._id), sub: '' };
    }
  };

  const totalResults = flatItems.length;
  const hasResults = results && totalResults > 0;
  const noResults = results && totalResults === 0 && query.trim().length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cmd-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
      />
      <motion.div
        key="cmd-palette"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-x-0 top-[15%] z-[9999] flex justify-center px-4"
      >
        <div className="w-full max-w-lg bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search transactions, groups, contacts..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults(null); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-gray-200 dark:border-gray-600 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary" />
              </div>
            )}

            {!loading && hasResults && (
              <div className="py-2">
                {SECTION_CONFIG.map((section) => {
                  const items = results[section.key] || [];
                  if (items.length === 0) return null;
                  const Icon = section.icon;
                  return (
                    <div key={section.key}>
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Icon className="w-3 h-3" />
                        {section.label}
                      </div>
                      {items.map((item) => {
                        const globalIdx = flatItems.findIndex(f => f._id === item._id && f.section === section.key);
                        const isSelected = globalIdx === selectedIndex;
                        const { title, sub } = getItemLabel(item, section.key);
                        return (
                          <button
                            key={`${section.key}-${item._id}`}
                            onClick={() => navigate(item.path)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                              isSelected ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{title}</p>
                              {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
                            </div>
                            {isSelected && <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && noResults && (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
              </div>
            )}

            {!loading && !results && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                {recentSearches.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setQuery(r); doSearch(r); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <Clock className="w-4 h-4 text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{r}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-[10px] text-gray-400">
            <span><kbd className="font-mono px-1 py-0.5 border border-gray-200 dark:border-gray-600 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono px-1 py-0.5 border border-gray-200 dark:border-gray-600 rounded">↵</kbd> Open</span>
            <span><kbd className="font-mono px-1 py-0.5 border border-gray-200 dark:border-gray-600 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
