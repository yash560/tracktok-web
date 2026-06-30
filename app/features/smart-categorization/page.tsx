"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tag, ArrowRight, CheckCircle, Sparkles, RefreshCw, Pencil } from 'lucide-react';

const transactions = [
  { merchant: 'Zomato', amount: '₹850', category: 'Food & Dining', confidence: 99, color: 'bg-red-500', letter: 'Z', catColor: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { merchant: 'Uber', amount: '₹620', category: 'Travel', confidence: 97, color: 'bg-gray-900', letter: 'U', catColor: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { merchant: 'Amazon', amount: '₹1,499', category: 'Shopping', confidence: 95, color: 'bg-orange-500', letter: 'A', catColor: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { merchant: 'Netflix', amount: '₹649', category: 'Entertainment', confidence: 99, color: 'bg-red-600', letter: 'N', catColor: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { merchant: 'Airtel', amount: '₹399', category: 'Bills & Utilities', confidence: 96, color: 'bg-red-500', letter: 'A', catColor: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  { merchant: 'BigBasket', amount: '₹2,340', category: 'Groceries', confidence: 98, color: 'bg-green-600', letter: 'B', catColor: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
];

const allCategories = [
  { name: 'Food & Dining', color: 'bg-red-400', count: 28 },
  { name: 'Travel', color: 'bg-cyan-400', count: 14 },
  { name: 'Shopping', color: 'bg-orange-400', count: 19 },
  { name: 'Bills', color: 'bg-violet-400', count: 8 },
  { name: 'Entertainment', color: 'bg-pink-400', count: 6 },
  { name: 'Groceries', color: 'bg-green-400', count: 22 },
  { name: 'Health', color: 'bg-emerald-400', count: 5 },
  { name: 'Others', color: 'bg-slate-400', count: 11 },
];

function CategorizationMockup() {
  return (
    <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
        <p className="text-white/80 text-xs uppercase tracking-widest">Auto-categorized</p>
        <p className="text-white text-xl font-bold">113 transactions sorted</p>
      </div>
      <div className="p-5">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {allCategories.map((cat) => (
            <span key={cat.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
              <span className={`w-2 h-2 rounded-full ${cat.color}`} />
              {cat.name}
              <span className="ml-1 text-gray-400">{cat.count}</span>
            </span>
          ))}
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {transactions.map((tx, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-xl ${tx.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{tx.letter}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{tx.merchant}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tx.catColor}`}>
                    {tx.category}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> {tx.confidence}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">{tx.amount}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SmartCategorizationPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50/30 to-transparent dark:from-pink-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-300/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold mb-6">
                <Tag className="w-4 h-4" /> AI-Powered Tags
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Every spend,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-rose-500">
                  perfectly labeled.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Our AI reads the merchant name, amount, and time to instantly categorize your transactions. No rules to set up, no spreadsheets to maintain. Just automatic, accurate labels.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Food & Dining', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Groceries', 'Education', 'Investments'].map((cat) => (
                  <span key={cat} className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    {cat}
                  </span>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Try Smart Tagging <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <CategorizationMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How AI categorizes */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              AI that actually learns
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Our model improves from collective user data and your personal corrections.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Merchant recognition', desc: 'Recognizes 10,000+ Indian merchants out of the box - Swiggy, Zomato, Flipkart, Ola, and more.', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
              { icon: RefreshCw, title: 'Gets smarter over time', desc: 'Each correction you make trains your personal model. After 30 days, accuracy exceeds 98%.', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
              { icon: Pencil, title: 'Always editable', desc: 'Disagree with a category? Fix it in one tap. Your correction is learned instantly.', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accuracy bar */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-pink-50/50 dark:via-pink-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { value: '10K+', label: 'Indian merchants recognized' },
                { value: '98%', label: 'categorization accuracy' },
                { value: '< 0.5s', label: 'per transaction' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-4xl font-black text-gray-900 dark:text-white font-display">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { title: 'Custom categories', desc: 'Create your own tags - "Client dinners", "Side hustle", or whatever fits your life.', icon: Tag },
              { title: 'Bulk re-categorize', desc: 'Select multiple transactions and change their category at once. Fast and painless.', icon: CheckCircle },
              { title: 'Category budgets', desc: 'Set monthly limits per category and get notified when you\'re approaching your cap.', icon: Sparkles },
              { title: 'Export by category', desc: 'Download all Food expenses for the year with a single click. Perfect for taxes.', icon: ArrowRight },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-4 rounded-[24px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-5 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0 text-pink-600 dark:text-pink-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-pink-500 to-rose-500 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Let AI do the labeling</h2>
            <p className="text-pink-100 mb-8 text-lg">Focus on your money, not your spreadsheet.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-pink-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-pink-50 transition-colors text-base shadow-lg">
              Start Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
