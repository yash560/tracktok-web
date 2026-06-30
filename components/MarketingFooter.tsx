"use client";

import Image from 'next/image';
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="TrackTok Logo" width={32} height={32} className="w-full h-full object-cover" />
              </div>
              <span className="font-bold font-display text-primary text-sm sm:text-base">TrackTok</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">AI-powered expense tracking for everyone.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Features</h4>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <li><Link href="/features/auto-detect" className="hover:text-primary transition-colors">Auto-detect</Link></li>
              <li><Link href="/features/ai-analytics" className="hover:text-primary transition-colors">AI Analytics</Link></li>
              <li><Link href="/features/smart-categorization" className="hover:text-primary transition-colors">Categorization</Link></li>
              <li><Link href="/features/shared-expenses" className="hover:text-primary transition-colors">Shared Expenses</Link></li>
              <li><Link href="/features/location-insights" className="hover:text-primary transition-colors">Location Insights</Link></li>
              <li><Link href="/features/multiple-accounts" className="hover:text-primary transition-colors">Multiple Accounts</Link></li>
              <li><Link href="/features/ai-chat" className="hover:text-primary transition-colors">AI Chat</Link></li>
              <li><Link href="/features/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Product</h4>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-colors">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Company</h4>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Legal</h4>
            <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">© 2026 TrackTok AI. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-xs sm:text-sm">Twitter</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-xs sm:text-sm">LinkedIn</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-xs sm:text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
