"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  BarChart3,
  Tag,
  StickyNote,
  Users,
  MapPin,
  Wallet,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Smartphone,
  Shield,
  Brain,
  Bell,
  Star,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    title: 'Auto-detect Transactions',
    description: 'Automatically tracks your spending from SMS notifications and bank alerts.',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'AI-Powered Analytics',
    description: 'Deep insights into your financial health with AI-driven charts and trends.',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Smart Categorization',
    description: 'Automatically categorizes transactions into Food, Shopping, Bills, and more.',
    icon: Tag,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Add Notes',
    description: 'Personalize your records with quick notes or tags to any transaction.',
    icon: StickyNote,
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Shared Expenses',
    description: 'Divide and track costs with friends or family effortlessly.',
    icon: Users,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Location Insights',
    description: 'See where you spend the most with interactive maps and history.',
    icon: MapPin,
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Multiple Accounts',
    description: 'Manage all your bank accounts and credit cards in one dashboard.',
    icon: Wallet,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Flexible Filters',
    description: 'Analyze your data by day, week, month, or custom periods.',
    icon: Calendar,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Chat-Based Reports',
    description: 'Ask our AI bot about your spending and get instant insights.',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Privacy-First',
    description: 'Your data stays encrypted. We prioritize your privacy above all.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
  },
];

const benefits = [
  'Real-time expense tracking',
  'Advanced financial analytics',
  'Multi-account support',
  'Secure data encryption',
  'Personalized insights',
  'Export reports',
];

const howItWorks = [
  {
    title: 'Auto-sync your spend',
    description: 'Track SMS alerts, bank notifications, and UPI receipts automatically, so you can stop copying numbers and start saving time.',
    icon: Zap,
    badge: 'Zero taps',
  },
  {
    title: 'See your money map',
    description: 'Get instant visuals of where your cash is going with category heatmaps and location-based spending insights.',
    icon: MapPin,
    badge: 'No guesswork',
  },
  {
    title: 'Ask AI stuff',
    description: 'Chat with TrackTok and ask things like “How much did I spend on brunch?” — our AI answers in seconds.',
    icon: MessageSquare,
    badge: 'Fast AF',
  },
  {
    title: 'Split with squad',
    description: 'Share expenses, track group payments, and avoid awkward IOUs with built-in split planning.',
    icon: Users,
    badge: 'Drama free',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for solo spenders who want AI clarity without the noise.',
    bullets: ['1 connected account', 'Weekly spending pulse', 'Auto category tagging'],
    accent: 'bg-secondary/10 text-secondary',
  },
  {
    name: 'Pro',
    price: '₹299/mo',
    description: 'For power users who want all insights, unlimited accounts, and premium AI reports.',
    bullets: ['Unlimited accounts', 'AI save suggestions', 'Advanced budgets & goals'],
    accent: 'bg-primary/10 text-primary',
    featured: true,
  },
  {
    name: 'Squad',
    price: '₹499/mo',
    description: 'Shared expenses, group goals, and split bill tracking for friends and families.',
    bullets: ['Group wallets', 'Expense sharing', 'Team reports'],
    accent: 'bg-emerald-100 text-success',
  },
];

function DashboardMockup() {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-slate-950/95 border border-white/10 shadow-2xl ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.35),transparent_40%)] opacity-70" />
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live preview</p>
            <h3 className="text-2xl font-bold text-white">Your money mood, simplified</h3>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
            April Pulse
          </span>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/90 p-5 mb-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase text-slate-400">Total spent</p>
              <p className="text-3xl font-semibold text-white">₹48,750</p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              -12% vs last month
            </div>
          </div>
          <div className="h-24 rounded-3xl bg-slate-800 p-3">
            <div className="relative h-full">
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2">
                {[68, 84, 56, 95, 72, 86, 60].map((height, idx) => (
                  <span key={idx} className="block w-full rounded-full bg-gradient-to-t from-emerald-400 to-slate-500" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          {[
            { label: 'Food & Dining', value: '30%', tone: 'from-rose-400 to-pink-500' },
            { label: 'Travel', value: '20%', tone: 'from-cyan-400 to-blue-500' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-900/90 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${item.tone}`} style={{ width: item.value }} />
              </div>
              <p className="mt-3 text-sm text-slate-300 font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-slate-900/90 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-slate-500">AI tip</p>
              <p className="text-sm text-slate-200 font-semibold">Cap coffee spend, save ₹1,200</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300">
              Smart Save
            </div>
          </div>
          <p className="text-sm text-slate-400">TrackTok spots repeat charges, suggests smarter budgets, and throws in a monthly flex report.</p>
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="absolute -left-8 lg:-left-28 top-12 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-52 z-10 hidden md:block">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Insight</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          You spent <span className="text-green-500 font-bold">18% less</span> on food this month.
          <br />Great job! 🎉
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.0 }} className="absolute -left-4 lg:-left-20 bottom-32 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-48 z-10 hidden md:block">
        <p className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Top Location</p>
        <div className="flex gap-1 items-end mb-2">
          <div className="w-4 h-6 bg-secondary/30 rounded-sm" />
          <div className="w-4 h-10 bg-secondary/50 rounded-sm" />
          <div className="w-4 h-14 bg-secondary rounded-sm" />
          <div className="w-4 h-8 bg-secondary/40 rounded-sm" />
          <div className="w-4 h-5 bg-secondary/20 rounded-sm" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Bengaluru</p>
        <p className="text-xs text-gray-500">₹12,450</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.9 }} className="absolute -right-4 lg:-right-20 top-20 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-44 z-10 hidden md:block">
        <p className="text-xs text-gray-500 mb-1">Total Savings</p>
        <p className="text-2xl font-bold text-green-500">₹6,240</p>
        <p className="text-xs text-gray-400">This Month</p>
        <svg className="w-full h-8 mt-2" viewBox="0 0 120 30">
          <polyline points="0,25 15,20 30,22 45,15 60,18 75,10 90,12 105,5 120,8" fill="none" stroke="#4DD69B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.1 }} className="absolute -right-4 lg:-right-24 bottom-24 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-52 z-10 hidden md:block">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">Ask AI</span>
        </div>
        <p className="text-xs text-gray-500 bg-gray-100 dark:bg-dark-bg rounded-lg px-3 py-2">
          How much did I spend on travel last month?
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative mx-auto w-[280px] sm:w-[300px]">
        <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-3 pb-1">
              <span className="text-[10px] font-semibold text-gray-900 dark:text-white">9:41</span>
              <div className="w-20 h-5 bg-gray-900 rounded-full mx-auto" />
              <div className="flex items-center gap-0.5">
                <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
                <svg className="w-4 h-3 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="18" height="12" rx="2" fillOpacity="0.3" /><rect x="2" y="6" width="14" height="12" rx="2" /><rect x="21" y="10" width="2" height="4" rx="1" /></svg>
              </div>
            </div>

            <div className="px-4 pb-6 pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Hello, Ankit 👋</p>
                  <p className="text-[10px] text-gray-500">Here&apos;s your spending overview</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-3 mb-3">
                <p className="text-[10px] text-white/80">Total Spent</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-white">₹48,750</p>
                  <span className="flex items-center gap-0.5 text-[9px] text-white/90 bg-white/20 rounded-full px-1.5 py-0.5">
                    <TrendingDown className="w-2.5 h-2.5" /> 12%
                  </span>
                </div>
                <p className="text-[9px] text-white/70">vs last month</p>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Spending by Category</p>
                  <span className="text-[9px] text-gray-400">This Month ▾</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <div className="w-full h-full rounded-full" style={{ background: 'conic-gradient(#4DD69B 0% 30%, #8C7DFF 30% 50%, #FBA94D 50% 65%, #7C3AED 65% 80%, #94A3B8 80% 100%)' }} />
                    <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-[8px] text-gray-400">Total</p>
                        <p className="text-[9px] font-bold text-gray-900 dark:text-white">₹48,750</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#4DD69B]" />
                      <span className="text-gray-600 dark:text-gray-400">Food & Dining</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">30%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#8C7DFF]" />
                      <span className="text-gray-600 dark:text-gray-400">Travel</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">20%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#FBA94D]" />
                      <span className="text-gray-600 dark:text-gray-400">Shopping</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">15%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                      <span className="text-gray-600 dark:text-gray-400">Bills & Utilities</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">15%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                      <span className="text-gray-600 dark:text-gray-400">Others</span>
                      <span className="ml-auto font-semibold text-gray-900 dark:text-white">20%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Recent Transactions</p>
                  <span className="text-[9px] text-secondary font-semibold">View All</span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Zomato', cat: 'Food & Dining', amount: '₹850', time: 'Today', color: 'bg-red-500', letter: 'Z' },
                    { name: 'Uber', cat: 'Travel', amount: '₹620', time: 'Yesterday', color: 'bg-gray-900', letter: 'U' },
                    { name: 'Amazon', cat: 'Shopping', amount: '₹1,499', time: '2 May', color: 'bg-orange-500', letter: 'A' },
                  ].map((tx) => (
                    <div key={tx.name} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${tx.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold">{tx.letter}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-900 dark:text-white">{tx.name}</p>
                        <p className="text-[9px] text-gray-400">{tx.cat}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold text-gray-900 dark:text-white">- {tx.amount}</p>
                        <p className="text-[9px] text-gray-400">{tx.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 py-3 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <Image src="/logo.png" alt="TrackTok Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg sm:text-2xl font-bold font-display text-primary">TrackTok</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Features</Link>
            <Link href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">How it Works</Link>
            <Link href="#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Pricing</Link>
            <Link href="#learn" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">Learn</Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/auth" className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium">Login</Link>
            <Link href="/dashboard" className="btn-primary text-sm sm:text-base">Get Started</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-24 sm:pt-32 pb-0 px-4 sm:px-6 md:px-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] sm:h-[800px] bg-gradient-to-b from-secondary/5 via-primary/3 to-transparent -z-10 blur-3xl opacity-60" />

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary font-semibold rounded-full text-xs sm:text-sm mb-6">
                  <Sparkles className="w-4 h-4" /> AI-Powered Expense Tracker
                </span>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.05]">
                  Your spending, <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-purple-500">smarter</span>, more social, and actually chill.
                </h1>

                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  TrackTok turns every SMS and bank alert into clean money stories. Smart budgets, quick AI answers, and squad-friendly split tracking — all served with Gen Z energy.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                  <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2 group">
                    🚀 Launch Dashboard
                  </Link>
                  <a href="https://play.google.com/store/apps/details?id=com.tracktok" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-primary hover:text-primary transition-all text-base">
                    <Smartphone className="w-4 h-4" /> Download Mobile App
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" /> Auto-detect Transactions
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <Brain className="w-3.5 h-3.5 text-secondary" /> AI-Powered Insights
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                    <Shield className="w-3.5 h-3.5 text-green-500" /> Bank-Level Security
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-white">20K+</p>
                    <p>happy users</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-white">4.8★</p>
                    <p>app rating</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-white">2M+</p>
                    <p>transactions tracked</p>
                  </div>
                </div>
              </motion.div>

              <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
                <PhoneMockup />
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="max-w-5xl mx-auto mt-16 sm:mt-20 mb-8">
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { icon: Users, value: '20K+', label: 'Happy Users' },
                  { icon: BarChart3, value: '2M+', label: 'Transactions Tracked' },
                  { icon: Shield, value: '100%', label: 'Secure & Private' },
                  { icon: Star, value: '4.8★', label: 'Play Store Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 text-secondary px-4 py-2 text-xs uppercase tracking-[0.3em] font-semibold">
                FEATURES
              </span>
              <h2 className="section-header mt-6">Designed for clarity. Built for control.</h2>
              <p className="section-subtitle max-w-2xl mx-auto">Powerful AI features that automatically track, analyze, and simplify your financial life.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] items-center">
              <div className="space-y-5 lg:space-y-6">
                {[
                  {
                    title: 'Auto-detect Transactions',
                    description: 'We automatically read SMS, bank alerts, and notifications to track your spending.',
                    icon: Zap,
                    color: 'bg-violet-100 text-violet-600',
                  },
                  {
                    title: 'AI-Powered Analytics',
                    description: 'Get deep insights, smart summaries, and personalized reports generated by AI.',
                    icon: BarChart3,
                    color: 'bg-pink-100 text-pink-600',
                  },
                  {
                    title: 'Shared Expenses',
                    description: 'Track and split expenses with friends, colleagues, or clients effortlessly.',
                    icon: Users,
                    color: 'bg-amber-100 text-amber-600',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }} className="group rounded-[28px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`grid place-items-center h-14 w-14 rounded-3xl ${item.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="relative order-first lg:order-none">
                <div className="absolute inset-x-0 top-1/2 hidden lg:block">
                  <div className="mx-auto h-[1px] w-24 bg-slate-200 dark:bg-gray-700"></div>
                </div>
                <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-[46px] border border-slate-200 dark:border-gray-800 bg-white dark:bg-dark-card shadow-2xl">
                  <div className="px-6 py-5 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Program Insider</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Overview</p>
                    </div>
                    <div className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-3 py-1 text-xs text-slate-700 dark:text-slate-300">May 1 - May 31</div>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-950 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Total Spent</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white">₹48,750</p>
                        <p className="text-xs text-success mt-2">+12% vs last month</p>
                      </div>
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-950 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Total Savings</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white">₹6,240</p>
                        <p className="text-xs text-success mt-2">+18% vs last month</p>
                      </div>
                      <div className="rounded-3xl bg-slate-100 dark:bg-slate-950 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">Transactions</p>
                        <p className="text-2xl font-semibold text-slate-900 dark:text-white">162</p>
                        <p className="text-xs text-success mt-2">+8% vs last month</p>
                      </div>
                    </div>
                    <div className="mt-6 rounded-[32px] bg-slate-950/95 border border-slate-800 p-6 text-white">
                      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center">
                        <div>
                          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Spending by Category</p>
                          <p className="text-lg font-semibold mt-2">₹48,750 Total</p>
                        </div>
                        <div className="h-36 w-full rounded-3xl bg-gradient-to-r from-violet-500 via-cyan-400 to-amber-400" />
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                          { label: 'Food & Dining', value: '30%', color: 'bg-emerald-400' },
                          { label: 'Travel', value: '20%', color: 'bg-cyan-400' },
                          { label: 'Shopping', value: '15%', color: 'bg-orange-400' },
                          { label: 'Bills & Utilities', value: '15%', color: 'bg-violet-500' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-3xl bg-slate-900/90 p-4">
                            <div className="flex items-center justify-between text-sm text-slate-300 mb-3">
                              <span>{item.label}</span>
                              <span>{item.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                              <div className={`${item.color} h-full rounded-full`} style={{ width: item.value }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 lg:space-y-6">
                {[
                  {
                    title: 'Smart Categorization',
                    description: 'AI automatically categorizes transactions and improves as you use the app.',
                    icon: Tag,
                    color: 'bg-emerald-100 text-emerald-600',
                  },
                  {
                    title: 'Location Insights',
                    description: 'See where you spend the most with beautiful maps and location analytics.',
                    icon: MapPin,
                    color: 'bg-sky-100 text-sky-600',
                  },
                  {
                    title: 'Chat-Based Reports',
                    description: 'Talk to your money. Ask anything and get instant answers and reports.',
                    icon: MessageSquare,
                    color: 'bg-orange-100 text-orange-600',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }} className="group rounded-[28px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`grid place-items-center h-14 w-14 rounded-3xl ${item.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10 rounded-[32px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Privacy First', description: 'Your data is encrypted and never shared.', icon: Shield },
                { title: 'Multiple Accounts', description: 'Bank, UPI, cards, and wallets — all in one place.', icon: Wallet },
                { title: 'Flexible Filters', description: 'Today, this week, this month or custom date ranges.', icon: Calendar },
                { title: 'Works Everywhere', description: 'Available on mobile and web, anytime.', icon: Smartphone },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="grid place-items-center h-12 w-12 rounded-3xl bg-secondary/10 text-secondary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs uppercase tracking-[0.2em] mb-4">
                    <Sparkles className="w-3.5 h-3.5" /> How it works
                  </span>
                  <h2 className="section-header mb-4">Stop wondering, start winning with every rupee.</h2>
                  <p className="section-subtitle max-w-2xl">A simple four-step flow that makes spending, saving, and sharing money feel less like adulting and more like leveling up.</p>
                </motion.div>

                <div className="mt-10 grid gap-4 sm:gap-5">
                  {howItWorks.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="card flex gap-4 items-start">
                        <div className="w-12 h-12 rounded-3xl bg-secondary/10 text-secondary flex items-center justify-center mt-1">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">{item.badge}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-secondary" />
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <DashboardMockup />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-secondary/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="section-header">Choose your vibe</h2>
              <p className="section-subtitle max-w-2xl mx-auto">Plans designed for solo spenders, money managers, and anyone who splits bills with friends.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan, idx) => (
                <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`rounded-[28px] border ${plan.featured ? 'border-primary/20 bg-white dark:bg-slate-900' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card'} p-8 shadow-md`}>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.accent}`}>Favorite</span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{plan.price}</p>
                  <ul className="space-y-3 mb-8 text-gray-600 dark:text-gray-400">
                    {plan.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard" className={`inline-flex items-center justify-center w-full rounded-2xl px-5 py-3 font-semibold transition ${plan.featured ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-slate-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    Start {plan.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="learn" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Stay in control', description: 'See everything in one scroll — no hidden fees, no surprise bills.', icon: Shield },
                { title: 'Move faster', description: 'AI answers your money questions instantly, without a finance degree.', icon: Sparkles },
                { title: 'Share smarter', description: 'Split gifts, trips, and rent with friends without the awkward tab.', icon: Users },
              ].map((item, idx) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} className="card group hover:shadow-xl">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary/10 text-secondary mb-5">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-header mb-4">Ready to own your money story?</h2>
            <p className="section-subtitle mb-8">TrackTok is the dashboard that makes expense tracking feel less like work and more like a flex.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary px-10 py-4 text-lg">Start free</Link>
              <a href="https://play.google.com/store/apps/details?id=com.tracktok" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-10 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-all">
                Download App
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src="/logo.png" alt="TrackTok Logo" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                <span className="font-bold font-display text-primary text-sm sm:text-base">TrackTok</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">AI-powered expense tracking for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Product</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#learn" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Company</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Legal</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
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
    </>
  );
}
