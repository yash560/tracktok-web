"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, ArrowRight, TrendingDown, TrendingUp, Sparkles, Brain, Target } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const barHeights = [62, 78, 54, 90, 72, 85];

const categories = [
  { label: 'Food & Dining', pct: 30, color: 'bg-emerald-400', amount: '₹14,625' },
  { label: 'Travel', pct: 20, color: 'bg-cyan-400', amount: '₹9,750' },
  { label: 'Shopping', pct: 15, color: 'bg-orange-400', amount: '₹7,312' },
  { label: 'Bills & Utilities', pct: 15, color: 'bg-violet-500', amount: '₹7,312' },
  { label: 'Others', pct: 20, color: 'bg-slate-400', amount: '₹9,751' },
];

function AnalyticsMockup() {
  return (
    <div className="rounded-[32px] bg-slate-950 border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.2),transparent_50%)]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">Monthly Overview</p>
            <p className="text-2xl font-bold text-white mt-1">₹48,750 spent</p>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/20">
            <TrendingDown className="w-3.5 h-3.5" /> -12% vs last month
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-slate-900/80 rounded-2xl p-4 mb-4">
          <p className="text-xs text-slate-400 mb-3">Spending trend (6 months)</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {barHeights.map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                  className={`w-full rounded-full ${idx === 5 ? 'bg-gradient-to-t from-violet-500 to-purple-400' : 'bg-slate-700'}`}
                />
                <span className="text-[9px] text-slate-500">{months[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2.5">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  {cat.label}
                </span>
                <span className="text-slate-400">{cat.amount}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${cat.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${cat.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* AI tip */}
        <div className="mt-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">AI Insight</p>
          </div>
          <p className="text-sm text-slate-300">You spend 40% more on weekends. Setting a weekend budget of ₹2,000 could save you ₹8,400/year.</p>
        </div>
      </div>
    </div>
  );
}

export default function AIAnalyticsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-violet-50/30 to-transparent dark:from-purple-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-10 -left-10 w-80 h-80 rounded-full bg-purple-400/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold mb-6">
                <Brain className="w-4 h-4" /> AI-Powered Insights
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Your money,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-violet-600">
                  crystal clear.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                TrackTok&apos;s AI transforms raw transaction data into meaningful visual stories. Understand exactly where your money goes — by day, week, month, or category.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Spending trends', icon: TrendingDown },
                  { label: 'Category breakdowns', icon: BarChart3 },
                  { label: 'AI-generated tips', icon: Sparkles },
                  { label: 'Budget vs actual', icon: Target },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      </div>
                      {item.label}
                    </div>
                  );
                })}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                See Your Analytics <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <AnalyticsMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Insight types */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Every angle covered
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Multiple views, one complete picture of your finances.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Weekly Pulse', desc: 'Every Monday, get a digest of last week — wins, spends, and what to watch this week.', tag: 'Auto-generated', color: 'from-purple-500 to-violet-600' },
              { title: 'Spending Heatmap', desc: 'See which days you spend most on a calendar-style heatmap. Spot patterns instantly.', tag: 'Visual', color: 'from-pink-500 to-rose-500' },
              { title: 'Anomaly Alerts', desc: 'TrackTok flags unusual charges or suddenly high spend in a category — before it\'s a problem.', tag: 'Proactive', color: 'from-orange-500 to-amber-500' },
              { title: 'Category Trends', desc: 'Track how your food, travel, or shopping spend evolves over months, not just this month.', tag: 'Long-term', color: 'from-blue-500 to-cyan-500' },
              { title: 'AI Suggestions', desc: 'Personalized tips based on your actual habits — not generic advice.', tag: 'Personalized', color: 'from-emerald-500 to-teal-500' },
              { title: 'Custom Reports', desc: 'Filter by date, category, account, or tag. Export to PDF or CSV for your records.', tag: 'Flexible', color: 'from-indigo-500 to-purple-500' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className={`inline-block text-xs font-bold text-white px-2.5 py-1 rounded-full bg-gradient-to-r ${item.color} mb-3`}>
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-purple-50/50 dark:via-purple-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: '2M+', label: 'transactions analyzed' },
              { value: '92%', label: 'AI accuracy rate' },
              { value: '4.2×', label: 'more savings reported' },
              { value: '<1s', label: 'insight generation' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
              >
                <p className="text-3xl font-black text-gray-900 dark:text-white font-display">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-purple-600 to-violet-600 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Know your money cold</h2>
            <p className="text-purple-100 mb-8 text-lg">Get insights others only discover after years of budgeting.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-purple-50 transition-colors text-base shadow-lg">
              Explore Analytics <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
