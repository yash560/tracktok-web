'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  User,
  Settings,
  LogOut,
  X,
  Users,
  ChevronDown,
  PiggyBank,
  Bell,
  ScrollText,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { SplitGroup } from '@/types';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const pathname = usePathname();
  const { logout, token } = useAuth();
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);
  const [expandSplits, setExpandSplits] = useState(false);
  const [loadingSplits, setLoadingSplits] = useState(false);

  useEffect(() => {
    const fetchSplitGroups = async () => {
      if (!token) return;
      setLoadingSplits(true);
      try {
        const response = await axios.get('/api/split-groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSplitGroups(response.data.splitGroups || []);
      } catch (error) {
        console.error('Error fetching split groups:', error);
      } finally {
        setLoadingSplits(false);
      }
    };

    if (token) {
      fetchSplitGroups();
    }
  }, [token]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Transactions', icon: Receipt, href: '/dashboard/transactions' },
    { name: 'Budgets', icon: PiggyBank, href: '/dashboard/budgets' },
    { name: 'Reminders', icon: Bell, href: '/dashboard/reminders' },
    { name: 'Audit Log', icon: ScrollText, href: '/dashboard/audit-log' },
    { name: 'Profile', icon: User, href: '/dashboard/profile' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <Image src="/logo.png" alt="TrackTok Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold font-display text-primary">TrackTok</span>
            </Link>
            <button onClick={() => setOpen(false)} className="md:hidden">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              );
            })}

            {/* Split Groups Section */}
            {splitGroups.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setExpandSplits(!expandSplits)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Split Groups</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandSplits ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandSplits && (
                  <div className="mt-2 space-y-1 pl-2">
                    {loadingSplits ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-500">
                        Loading...
                      </div>
                    ) : (
                      splitGroups.map((group) => {
                        const isActive = pathname === `/split-groups/${group._id}`;
                        return (
                          <Link
                            key={group._id}
                            href={`/split-groups/${group._id}`}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                              isActive
                                ? 'bg-primary/10 text-primary dark:text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <span className="font-medium truncate">{group.name}</span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition mt-auto"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
