'use client';

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

function PhoneMockup() {
  return (
    <div className="relative">
      {/* AI Insight floating card - top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute -left-8 lg:-left-28 top-12 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-52 z-10 hidden md:block"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Insight</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          You spent <span className="text-green-500 font-bold">18% less</span> on Food this month.
          <br />Great job! 🎉
        </p>
      </motion.div>

      {/* Top Location floating card - bottom left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="absolute -left-4 lg:-left-20 bottom-32 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-48 z-10 hidden md:block"
      >
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

      {/* Total Savings floating card - top right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute -right-4 lg:-right-20 top-20 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-44 z-10 hidden md:block"
      >
        <p className="text-xs text-gray-500 mb-1">Total Savings</p>
        <p className="text-2xl font-bold text-green-500">₹6,240</p>
        <p className="text-xs text-gray-400">This Month</p>
        <svg className="w-full h-8 mt-2" viewBox="0 0 120 30">
          <polyline
            points="0,25 15,20 30,22 45,15 60,18 75,10 90,12 105,5 120,8"
            fill="none"
            stroke="#4DD69B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Ask AI floating card - bottom right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="absolute -right-4 lg:-right-24 bottom-24 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 w-52 z-10 hidden md:block"
      >
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

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative mx-auto w-[280px] sm:w-[300px]"
      >
        <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* Status bar */}
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-3 pb-1">
              <span className="text-[10px] font-semibold text-gray-900 dark:text-white">9:41</span>
              <div className="w-20 h-5 bg-gray-900 rounded-full mx-auto" />
              <div className="flex items-center gap-0.5">
                <svg className="w-3 h-3 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                <svg className="w-4 h-3 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="6" width="18" height="12" rx="2" fillOpacity="0.3"/><rect x="2" y="6" width="14" height="12" rx="2"/><rect x="21" y="10" width="2" height="4" rx="1"/></svg>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="px-4 pb-6 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Hello, Ankit 👋</p>
                  <p className="text-[10px] text-gray-500">Here&apos;s your spending overview</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                </div>
              </div>

              {/* Total Spent card */}
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

              {/* Spending by Category */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Spending by Category</p>
                  <span className="text-[9px] text-gray-400">This Month ▾</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Donut chart */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: 'conic-gradient(#4DD69B 0% 30%, #8C7DFF 30% 50%, #FBA94D 50% 65%, #7C3AED 65% 80%, #94A3B8 80% 100%)',
                      }}
                    />
                    <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-[8px] text-gray-400">Total</p>
                        <p className="text-[9px] font-bold text-gray-900 dark:text-white">₹48,750</p>
                      </div>
                    </div>
                  </div>
                  {/* Legend */}
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

              {/* Recent Transactions */}
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
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 py-3 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <Image src="/logo.png" alt="TrackTok Logo" width={40} height={40} className="w-full h-full object-cover" />
            </div>
            <span className="text-lg sm:text-2xl font-bold font-display text-primary">TrackTok</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">
              Features <ChevronDown className="w-4 h-4" />
            </button>
            <Link href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">
              How it Works
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            <Link href="#blog" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors font-medium">
              Blog
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/auth"
              className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-sm font-medium"
            >
              Login
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm sm:text-base">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-0 px-4 sm:px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] sm:h-[800px] bg-gradient-to-b from-secondary/5 via-primary/3 to-transparent -z-10 blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary/10 text-secondary font-semibold rounded-full text-xs sm:text-sm mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Expense Tracker
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1]">
                Your Spending,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-purple-500">
                  Smarter
                </span>{' '}
                with AI
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Track every expense automatically, get AI insights, smart reports, and take total control of your money.
                <br />No manual entry. No spreadsheets. Just clarity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
                <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2 group">
                  🚀 Launch Dashboard
                </Link>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tracktok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 w-full sm:w-auto border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:border-primary hover:text-primary transition-all text-base"
                >
                  <Smartphone className="w-4 h-4" /> Download Mobile App
                </a>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" /> Auto-detect Transactions
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <Brain className="w-3.5 h-3.5 text-secondary" /> AI-Powered Insights
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-dark-card rounded-full text-xs text-gray-600 dark:text-gray-400 font-medium">
                  <Shield className="w-3.5 h-3.5 text-green-500" /> Bank Level Security
                </span>
              </div>

              {/* Social proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Trusted by <strong className="text-gray-900 dark:text-white">20,000+</strong> users</span>
                  <div className="flex -space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-primary border-2 border-white dark:border-dark-bg flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">{String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">4.8/5</span>
                </div>
                <span className="text-xs text-gray-500">On Play Store 🏴</span>
              </div>
            </motion.div>

            {/* Right side - Phone mockup */}
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-5xl mx-auto mt-16 sm:mt-20 mb-8"
        >
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

      {/* Features Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="section-header">Powerful AI Features</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Everything you need to master your personal finances
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="card group hover:shadow-lg"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-header mb-6 sm:mb-8">Why Choose TrackTok?</h2>
              <div className="space-y-3 sm:space-y-4">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-success flex-shrink-0" />
                    <span className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">500K+</p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">₹2B+</p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Tracked Transactions</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">4.8★</p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">App Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary-light rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-4 sm:mb-6 leading-tight">
              Stop guessing. Start tracking.
            </h2>
            <p className="text-base sm:text-xl text-white/90 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of users who simplified their finances with TrackTok.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Get Started Free
              </Link>
              <a
                href="https://play.google.com/store/apps/details?id=com.tracktok"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg border border-white/30 transition-all"
              >
                Download App
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
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
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                AI-powered expense tracking for everyone
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white text-sm">Product</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
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
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                © 2026 TrackTok AI. All rights reserved.
              </p>
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
