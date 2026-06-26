'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function SystemPage() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [nudgeActive, setNudgeActive] = useState(false);
  const [nudgeJob, setNudgeJob] = useState<CronJob | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const { data } = await axios.get('/api/admin/cron-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(data.jobs);
      const nudge = data.jobs.find((j: CronJob) => j.sourceReferenceId?.includes('inactive_nudge'));
      setNudgeActive(!!nudge);
      setNudgeJob(nudge || null);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleNudge = async () => {
    setToggling(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (nudgeActive) {
        await axios.delete('/api/admin/cron-jobs?feature=inactive-nudge', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/admin/cron-jobs', { feature: 'inactive-nudge' }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchJobs();
    } catch {
      /* noop */
    } finally {
      setToggling(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Feature Cards</h3>
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
              disabled={toggling || loading}
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
              {loading ? (
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
                        job.lastResult === 'success'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : job.lastResult === 'fail'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {job.lastResult || '-'}
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
