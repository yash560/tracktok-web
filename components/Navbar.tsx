'use client';

import Image from 'next/image';
import { Settings, LogOut, Menu, User, Search } from 'lucide-react';
import { useAuth } from './AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen, onSearchClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="glass border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg">
            <Image src="/logo.png" alt="TrackTok Logo" width={32} height={32} className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold font-display text-primary">TrackTok</span>
        </div>

        <div className="hidden md:block">
          <h2 className="text-xl font-bold">Financial Dashboard</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition text-sm text-gray-500"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search</span>
              <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">⌘K</kbd>
            </button>
            <NotificationCenter />
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition text-danger hover:bg-danger/10"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};
