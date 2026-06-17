'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  CreditCard,
  ChevronRight,
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Check initial theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          name: 'Dark Mode',
          description: 'Adjust the visual appearance of the app',
          icon: isDarkMode ? Moon : Sun,
          action: (
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-primary' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          name: 'Push Notifications',
          description: 'Receive alerts for large transactions',
          icon: Bell,
          action: (
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-primary' : 'bg-gray-200'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'currency',
          name: 'Default Currency',
          description: 'INR (₹)',
          icon: CreditCard,
          action: <ChevronRight className="w-5 h-5 text-gray-400" />,
        },
        {
          id: 'language',
          name: 'Language',
          description: 'English',
          icon: Globe,
          action: <ChevronRight className="w-5 h-5 text-gray-400" />,
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'export',
          name: 'Export Data',
          description: 'Download your financial history as CSV',
          icon: Database,
          action: <button className="text-primary font-semibold text-sm hover:underline">Export</button>,
        },
      ],
    },
  ];

  return (
    <div className="px-4 sm:px-6 md:px-12 max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Personalize your TrackTok experience</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400 px-4 sm:px-6">
              {section.title}
            </h3>
            <div className="card p-0 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/20 transition">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                        <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </div>
                    <div className="self-end sm:self-center flex-shrink-0">{item.action}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Security Placeholder */}
      <div className="card border-danger/20 bg-danger/[0.02] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 bg-danger/10 rounded-lg flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-danger" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-danger">Privacy & Security</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Your data is encrypted and secure. nosotros never share your financial information with third parties.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button className="w-full sm:w-auto px-4 py-2 bg-danger text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-danger/20 hover:bg-danger-dark transition">
            Privacy Center
          </button>
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 transition">
            Terms of Use
          </button>
        </div>
      </div>
    </div>
  );
}
