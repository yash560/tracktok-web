'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, DollarSign, Trophy, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';

interface Notification {
  _id: string;
  type: 'payment' | 'reminder' | 'budget_alert' | 'achievement' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  payment: DollarSign,
  reminder: Bell,
  budget_alert: AlertTriangle,
  achievement: Trophy,
  system: Info,
};

const typeColors: Record<string, string> = {
  payment: 'bg-success/10 text-success',
  reminder: 'bg-warning/10 text-warning',
  budget_alert: 'bg-danger/10 text-danger',
  achievement: 'bg-purple-500/10 text-purple-500',
  system: 'bg-blue-500/10 text-blue-500',
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications?limit=20');
      setNotifications(res.data.notifications || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/api/notifications', { all: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silently fail
    }
  };

  const markRead = async (id: string) => {
    try {
      await axios.patch('/api/notifications', { id });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 max-h-96">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell;
                const colorClass = typeColors[notif.type] || 'bg-gray-100 text-gray-500';
                return (
                  <div
                    key={notif._id}
                    onClick={() => !notif.read && markRead(notif._id)}
                    className={`flex items-start gap-3 p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer ${
                      !notif.read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
