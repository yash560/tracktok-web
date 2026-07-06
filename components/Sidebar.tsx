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
  PiggyBank,
  Bell,
  ScrollText,
  Shield,
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
  const { logout, token, isAdmin } = useAuth();
  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>([]);

  useEffect(() => {
    const fetchSplitGroups = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/split-groups', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSplitGroups(response.data.splitGroups || []);
      } catch (error) {
        console.error('Error fetching split groups:', error);
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
        className={`fixed top-0 left-0 h-full w-64 glass border-r border-gray-200/80 dark:border-gray-800 z-50 transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
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
                <Link
                  href="/split-groups"
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname === '/split-groups'
                      ? 'bg-primary/10 text-primary dark:text-primary'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Split Groups</span>
                </Link>
              </div>
            )}
          </nav>

          <div className="mt-auto space-y-2">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${pathname.startsWith('/admin')
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                  }`}
              >
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Admin Panel</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
