'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

interface CronJob {
  _id: string;
  name: string;
  status: string;
  cronExpression: string;
  baseUrl: string;
  endpoint: string;
  lastExecutedAt: string | null;
  lastResult: string;
  nextFireAt: string | null;
  sourceReferenceId?: string;
}

interface SettingField {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'multi-number';
  options?: { label: string; value: string }[];
  defaultValue: any;
  description?: string;
  min?: number;
  max?: number;
}

interface MarketingCron {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultCronExpression: string;
  cronDescription: string;
  settingsFields: SettingField[];
  enabled: boolean;
  cronJobId: string | null;
  cronExpression: string;
  settings: Record<string, any>;
  lastUpdated: string | null;
}

interface UserOption {
  _id: string;
  email: string;
  displayName?: string;
  firstName?: string;
}

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  reengagement: { label: 'Re-engagement & Churn Prevention', icon: '🔄', color: 'border-orange-200 dark:border-orange-800' },
  lifecycle: { label: 'Milestone & Lifecycle', icon: '🎯', color: 'border-blue-200 dark:border-blue-800' },
  social: { label: 'Social & Viral Growth', icon: '🚀', color: 'border-green-200 dark:border-green-800' },
  smart: { label: 'Predictive & Smart', icon: '🧠', color: 'border-purple-200 dark:border-purple-800' },
};

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

function getToken(): string {
  return localStorage.getItem('auth_token') || '';
}

function resolveLastResult(lastResult: any): string {
  if (typeof lastResult === 'object' && lastResult !== null) {
    return lastResult.success ? 'success' : 'fail';
  }
  return lastResult || '';
}

function SettingsPanel({
  cron,
  onSave,
  saving,
}: {
  cron: MarketingCron;
  onSave: (cronId: string, cronExpression: string, settings: Record<string, any>) => void;
  saving: boolean;
}) {
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(cron.settings);
  const [localCron, setLocalCron] = useState(cron.cronExpression);

  useEffect(() => {
    setLocalSettings(cron.settings);
    setLocalCron(cron.cronExpression);
  }, [cron.settings, cron.cronExpression]);

  const updateField = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cron Expression</label>
          <input
            type="text"
            value={localCron}
            onChange={e => setLocalCron(e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-400">{cron.cronDescription}</p>
        </div>

        {cron.settingsFields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
            {field.type === 'number' && (
              <input
                type="number"
                value={localSettings[field.key] ?? field.defaultValue}
                min={field.min}
                max={field.max}
                onChange={e => updateField(field.key, Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            {field.type === 'text' && (
              <input
                type="text"
                value={localSettings[field.key] ?? field.defaultValue}
                onChange={e => updateField(field.key, e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            {field.type === 'select' && (
              <select
                value={localSettings[field.key] ?? field.defaultValue}
                onChange={e => updateField(field.key, e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {field.type === 'multi-number' && (
              <input
                type="text"
                value={(localSettings[field.key] ?? field.defaultValue).join(', ')}
                onChange={e => {
                  const nums = e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
                  updateField(field.key, nums);
                }}
                placeholder="e.g. 14, 30, 60"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            )}
            {field.description && (
              <p className="mt-1 text-xs text-gray-400">{field.description}</p>
            )}
          </div>
        ))}

        <button
          onClick={() => onSave(cron.id, localCron, localSettings)}
          disabled={saving}
          className="mt-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function UserMultiSelect({
  users,
  loading,
  selected,
  onChange,
}: {
  users: UserOption[];
  loading: boolean;
  selected: string[];
  onChange: (userIds: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q)
    );
  });

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(u => selected.includes(u._id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(filtered.map(u => u._id));
      onChange(selected.filter(id => !filteredIds.has(id)));
    } else {
      const newIds = new Set([...selected, ...filtered.map(u => u._id)]);
      onChange(Array.from(newIds));
    }
  };

  return (
    <div ref={ref} className="relative flex-1">
      <div
        onClick={() => setOpen(true)}
        className="w-full min-h-[34px] px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-text flex flex-wrap gap-1 items-center"
      >
        {selected.length > 0 && !open && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selected.length} user{selected.length !== 1 ? 's' : ''} selected
          </span>
        )}
        {open && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={loading ? 'Loading...' : 'Search by name or email...'}
            autoFocus
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          />
        )}
        {!open && selected.length === 0 && (
          <span className="text-xs text-gray-400">{loading ? 'Loading...' : 'Select users...'}</span>
        )}
      </div>
      {selected.length > 0 && !open && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange([]); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
        >
          ✕
        </button>
      )}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-lg">
          <button
            onClick={toggleAll}
            className="w-full text-left px-3 py-2 text-sm font-semibold border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400 flex items-center gap-2"
          >
            <span className={`inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] ${
              allFilteredSelected
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'border-gray-300 dark:border-gray-500'
            }`}>
              {allFilteredSelected && '✓'}
            </span>
            {search ? `Select all matching (${filtered.length})` : `Select all (${users.length})`}
          </button>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No users found</div>
          ) : (
            filtered.slice(0, 50).map(u => {
              const isSelected = selected.includes(u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => toggle(u._id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                    isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 dark:border-gray-500'
                  }`}>
                    {isSelected && '✓'}
                  </span>
                  <span className="font-medium truncate">{u.displayName || u.firstName || u.email}</span>
                  <span className="ml-auto text-xs text-gray-400 shrink-0">{u.email}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SendEmailPanel({
  cronId,
  users,
  loadingUsers,
}: {
  cronId: string;
  users: UserOption[];
  loadingUsers: boolean;
}) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendEmails = async () => {
    if (selectedUsers.length === 0) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await axios.post('/api/admin/marketing-crons/test', {
        cronId,
        userIds: selectedUsers,
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setResult({ success: data.success, message: data.message });
    } catch (e: any) {
      setResult({ success: false, message: e.response?.data?.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Send Email</p>
      <div className="flex gap-2 items-start">
        <UserMultiSelect
          users={users}
          loading={loadingUsers}
          selected={selectedUsers}
          onChange={setSelectedUsers}
        />
        <button
          onClick={sendEmails}
          disabled={selectedUsers.length === 0 || sending}
          className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {sending ? 'Sending...' : `Send${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`}
        </button>
      </div>
      {result && (
        <p className={`mt-2 text-xs ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {result.message}
        </p>
      )}
    </div>
  );
}

function MarketingCronCard({
  cron,
  users,
  loadingUsers,
  onToggle,
  onSaveSettings,
  toggling,
  saving,
}: {
  cron: MarketingCron;
  users: UserOption[];
  loadingUsers: boolean;
  onToggle: (cronId: string, enabled: boolean) => void;
  onSaveSettings: (cronId: string, cronExpression: string, settings: Record<string, any>) => void;
  toggling: string | null;
  saving: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{cron.name}</h4>
            {cron.enabled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{cron.description}</p>
          {cron.enabled && (
            <div className="mt-2 flex gap-4">
              <p className="text-[11px] text-gray-400">
                Cron: <span className="font-mono text-gray-600 dark:text-gray-300">{cron.cronExpression}</span>
              </p>
              {cron.lastUpdated && (
                <p className="text-[11px] text-gray-400">
                  Updated: <span className="text-gray-600 dark:text-gray-300">{timeAgo(cron.lastUpdated)}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
          >
            {expanded ? 'Collapse' : 'Configure'}
          </button>
          <button
            onClick={() => onToggle(cron.id, cron.enabled)}
            disabled={toggling === cron.id}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              cron.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                cron.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <SettingsPanel
            cron={cron}
            onSave={onSaveSettings}
            saving={saving === cron.id}
          />
          <SendEmailPanel
            cronId={cron.id}
            users={users}
            loadingUsers={loadingUsers}
          />
        </>
      )}
    </div>
  );
}

export default function SystemPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [marketingCrons, setMarketingCrons] = useState<MarketingCron[]>([]);
  const [loadingMarketing, setLoadingMarketing] = useState(true);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // Legacy nudge state
  const [nudgeActive, setNudgeActive] = useState(false);
  const [nudgeJob, setNudgeJob] = useState<CronJob | null>(null);
  const [togglingNudge, setTogglingNudge] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const { data } = await axios.get('/api/admin/cron-jobs', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setJobs(data.jobs);
      const nudge = data.jobs.find((j: CronJob) => j.sourceReferenceId?.includes('inactive_nudge'));
      setNudgeActive(!!nudge);
      setNudgeJob(nudge || null);
    } catch { /* noop */ }
    finally { setLoadingJobs(false); }
  }, []);

  const fetchMarketingCrons = useCallback(async () => {
    setLoadingMarketing(true);
    try {
      const { data } = await axios.get('/api/admin/marketing-crons', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setMarketingCrons(data.crons);
    } catch { /* noop */ }
    finally { setLoadingMarketing(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axios.get('/api/admin/users?limit=200', {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers((data.users || []).filter((u: any) => u.email));
    } catch { /* noop */ }
    finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchMarketingCrons();
    fetchUsers();
  }, [fetchJobs, fetchMarketingCrons, fetchUsers]);

  const toggleNudge = async () => {
    setTogglingNudge(true);
    try {
      if (nudgeActive) {
        await axios.delete('/api/admin/cron-jobs?feature=inactive-nudge', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } else {
        await axios.post('/api/admin/cron-jobs', { feature: 'inactive-nudge' }, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      }
      await fetchJobs();
    } catch { /* noop */ }
    finally { setTogglingNudge(false); }
  };

  const toggleMarketingCron = async (cronId: string, currentlyEnabled: boolean) => {
    setToggling(cronId);
    try {
      if (currentlyEnabled) {
        await axios.delete(`/api/admin/marketing-crons?cronId=${cronId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } else {
        await axios.post('/api/admin/marketing-crons', { cronId }, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      }
      await Promise.all([fetchMarketingCrons(), fetchJobs()]);
    } catch { /* noop */ }
    finally { setToggling(null); }
  };

  const saveSettings = async (cronId: string, cronExpression: string, settings: Record<string, any>) => {
    setSaving(cronId);
    try {
      await axios.patch('/api/admin/marketing-crons', {
        cronId,
        cronExpression,
        settings,
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      await fetchMarketingCrons();
    } catch { /* noop */ }
    finally { setSaving(null); }
  };

  const groupedCrons = ['reengagement', 'lifecycle', 'social', 'smart'].map(cat => ({
    ...CATEGORY_META[cat],
    category: cat,
    crons: marketingCrons.filter(c => c.category === cat),
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Manage scheduled jobs, marketing automations, and system features.</p>

      {/* Legacy: Inactive User Nudge */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Features</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Inactive User Nudge</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Sends push notifications to users who have not logged in recently, encouraging them to return and track expenses.
              </p>
              {nudgeJob && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cron: <span className="font-mono text-gray-700 dark:text-gray-300">{nudgeJob.cronExpression}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last run: <span className="text-gray-700 dark:text-gray-300">{timeAgo(nudgeJob.lastExecutedAt)}</span>
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={toggleNudge}
              disabled={togglingNudge || loadingJobs}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                nudgeActive ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                  nudgeActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Marketing Crons */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Marketing & Retention Automations</h3>
        {loadingMarketing ? (
          <div className="text-center py-8 text-gray-400">Loading marketing automations...</div>
        ) : (
          <div className="space-y-8">
            {groupedCrons.map(group => (
              <div key={group.category}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{group.icon}</span>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{group.label}</h4>
                  <span className="text-xs text-gray-400">({group.crons.filter(c => c.enabled).length}/{group.crons.length} active)</span>
                </div>
                <div className="grid gap-3">
                  {group.crons.map(cron => (
                    <MarketingCronCard
                      key={cron.id}
                      cron={cron}
                      users={users}
                      loadingUsers={loadingUsers}
                      onToggle={toggleMarketingCron}
                      onSaveSettings={saveSettings}
                      toggling={toggling}
                      saving={saving}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Cron Jobs Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Cron Jobs</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cron Expression</th>
                <th className="px-4 py-3 font-medium">Last Executed</th>
                <th className="px-4 py-3 font-medium">Last Result</th>
                <th className="px-4 py-3 font-medium">Next Fire</th>
              </tr>
            </thead>
            <tbody>
              {loadingJobs ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No cron jobs found</td></tr>
              ) : (
                jobs.map(job => (
                  <tr key={job._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{job.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{job.cronExpression}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">{timeAgo(job.lastExecutedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        resolveLastResult(job.lastResult) === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : resolveLastResult(job.lastResult) === 'fail'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {resolveLastResult(job.lastResult) || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {job.nextFireAt ? new Date(job.nextFireAt).toLocaleString('en-IN') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
