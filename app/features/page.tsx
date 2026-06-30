"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, BarChart3, Tag, Users, MapPin, Wallet,
  MessageSquare, ShieldCheck, ArrowRight, Sparkles,
} from 'lucide-react';

const features = [
  {
    href: '/features/auto-detect',
    title: 'Auto-detect Transactions',
    description: 'Automatically reads SMS, bank alerts, and UPI receipts to track every rupee without lifting a finger.',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-100 dark:border-blue-900/50',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    tag: 'Zero taps',
  },
  {
    href: '/features/ai-analytics',
    title: 'AI-Powered Analytics',
    description: 'Deep insights into your financial health with AI-driven charts, trends, and weekly summaries.',
    icon: BarChart3,
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-100 dark:border-purple-900/50',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    tag: 'Smart insights',
  },
  {
    href: '/features/smart-categorization',
    title: 'Smart Categorization',
    description: 'AI automatically tags transactions into Food, Shopping, Bills, and more - and gets smarter over time.',
    icon: Tag,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-100 dark:border-pink-900/50',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400',
    tag: 'Auto-tagged',
  },
  {
    href: '/features/shared-expenses',
    title: 'Shared Expenses',
    description: 'Split bills, track group costs, and settle up with friends or family without the awkward IOU.',
    icon: Users,
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    border: 'border-indigo-100 dark:border-indigo-900/50',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    tag: 'Drama free',
  },
  {
    href: '/features/location-insights',
    title: 'Location Insights',
    description: 'See exactly where you spend the most with location-based heatmaps and city-level breakdowns.',
    icon: MapPin,
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-100 dark:border-red-900/50',
    iconBg: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
    tag: 'No guesswork',
  },
  {
    href: '/features/multiple-accounts',
    title: 'Multiple Accounts',
    description: 'All your bank accounts, credit cards, UPI wallets, and investments in one unified dashboard.',
    icon: Wallet,
    gradient: 'from-cyan-500 to-blue-600',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    border: 'border-cyan-100 dark:border-cyan-900/50',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
    tag: 'All in one',
  },
  {
    href: '/features/ai-chat',
    title: 'AI Chat Reports',
    description: 'Ask our AI anything - "How much did I spend on food?" - and get instant, clear answers.',
    icon: MessageSquare,
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-100 dark:border-green-900/50',
    iconBg: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
    tag: 'Fast AF',
  },
  {
    href: '/features/privacy',
    title: 'Privacy & Security',
    description: 'Bank-level encryption, zero data selling, and full transparency on what we store and why.',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-100 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    tag: 'Your data, your rules',
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-primary/3 to-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full bg-secondary/10 blur-3xl -z-10"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="pointer-events-none absolute top-20 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10"
        />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-full text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> Everything TrackTok can do
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
              Features built for{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
                your real life
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              From automatic expense detection to AI-powered insights, TrackTok packs everything you need to take control of your money - without the boring spreadsheets.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="pb-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.href}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                >
                  <Link
                    href={feature.href}
                    className={`group block h-full rounded-[28px] border ${feature.border} ${feature.bg} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feature.iconBg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white`}>
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{feature.description}</p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Ready to try them all?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Start free, no credit card needed. Connect your accounts and see TrackTok in action.
            </p>
            <Link href="/dashboard" className="btn-primary text-lg px-10 py-4">
              Launch Dashboard
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
