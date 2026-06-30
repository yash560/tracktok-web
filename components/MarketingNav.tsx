"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, Zap, BarChart3, Tag, Users,
  MapPin, Wallet, MessageSquare, ShieldCheck, Grid3X3,
} from 'lucide-react';

const featureLinks = [
  { href: '/features/auto-detect', label: 'Auto-detect Transactions', desc: 'SMS & bank alerts', icon: Zap, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { href: '/features/ai-analytics', label: 'AI-Powered Analytics', desc: 'Charts & insights', icon: BarChart3, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  { href: '/features/smart-categorization', label: 'Smart Categorization', desc: 'Auto-tag spending', icon: Tag, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { href: '/features/shared-expenses', label: 'Shared Expenses', desc: 'Split with friends', icon: Users, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { href: '/features/location-insights', label: 'Location Insights', desc: 'Where you spend', icon: MapPin, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { href: '/features/multiple-accounts', label: 'Multiple Accounts', desc: 'All banks in one', icon: Wallet, color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { href: '/features/ai-chat', label: 'AI Chat Reports', desc: 'Ask your money', icon: MessageSquare, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { href: '/features/privacy', label: 'Privacy & Security', desc: 'Bank-grade safety', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
];

export function MarketingNav() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 py-3 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
            <Image src="/logo.png" alt="TrackTok Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <span className="text-lg sm:text-2xl font-bold font-display text-primary">TrackTok</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium"
            >
              Features
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
            </button>

            {featuresOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-2">
                  <Link
                    href="/features"
                    onClick={() => setFeaturesOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-secondary/5 to-primary/5 hover:from-secondary/10 hover:to-primary/10 transition-colors mb-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                      <Grid3X3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">All Features</p>
                      <p className="text-xs text-gray-500">See everything TrackTok can do</p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-1">
                    {featureLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setFeaturesOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">How it Works</Link>
          <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Pricing</Link>
          <Link href="/#learn" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Learn</Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/auth" className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium">Login</Link>
          <Link href="/dashboard" className="btn-primary text-sm sm:text-base">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
