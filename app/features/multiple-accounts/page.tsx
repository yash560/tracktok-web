"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, CreditCard, RefreshCw, Eye, Shield } from 'lucide-react';

const accounts = [
  { name: 'HDFC Savings', type: 'Savings', balance: '₹1,24,380', change: '+₹8,200', positive: true, color: 'from-red-500 to-rose-600', chipColor: 'bg-yellow-300', initials: 'HD' },
  { name: 'SBI Salary', type: 'Salary A/C', balance: '₹48,750', change: '-₹12,400', positive: false, color: 'from-blue-600 to-blue-800', chipColor: 'bg-yellow-300', initials: 'SB' },
  { name: 'HDFC Credit', type: 'Credit Card', balance: '-₹22,450', change: 'Due in 8 days', positive: false, color: 'from-slate-700 to-slate-900', chipColor: 'bg-white/30', initials: 'CC' },
  { name: 'Google Pay', type: 'UPI Wallet', balance: '₹2,100', change: 'Linked to SBI', positive: true, color: 'from-green-500 to-emerald-600', chipColor: 'bg-white/30', initials: 'GP' },
];

function MultiAccountMockup() {
  return (
    <div className="space-y-3">
      {/* Total balance card */}
      <div className="rounded-[28px] bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl">
        <p className="text-sm text-white/60 uppercase tracking-widest mb-1">Net Worth</p>
        <p className="text-4xl font-black mb-1">₹1,52,780</p>
        <p className="text-sm text-emerald-400 flex items-center gap-1">
          <span className="text-lg">↑</span> ₹14,200 this month
        </p>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-xs text-white/50 mb-1">Assets</p>
            <p className="text-sm font-bold text-emerald-300">₹1,75,230</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl p-3">
            <p className="text-xs text-white/50 mb-1">Liabilities</p>
            <p className="text-sm font-bold text-red-300">₹22,450</p>
          </div>
        </div>
      </div>

      {/* Account cards */}
      <div className="grid grid-cols-2 gap-3">
        {accounts.map((acc, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-[20px] bg-gradient-to-br ${acc.color} p-4 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-5 rounded-sm ${acc.chipColor}`} />
              <span className="text-[10px] text-white/60 uppercase tracking-wide">{acc.type}</span>
            </div>
            <p className="text-xs text-white/60 mb-0.5">{acc.name}</p>
            <p className="text-base font-black">{acc.balance}</p>
            <p className={`text-[10px] mt-1 ${acc.positive ? 'text-emerald-300' : 'text-red-300'}`}>{acc.change}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function MultipleAccountsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50/30 to-transparent dark:from-cyan-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-10 right-10 w-72 h-72 rounded-full bg-cyan-300/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full text-xs font-semibold mb-6">
                <Wallet className="w-4 h-4" /> All Banks, One Place
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Every account.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                  One dashboard.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Stop juggling between 5 different banking apps. Connect all your savings accounts, credit cards, UPI wallets, and investments to see your complete financial picture in one place.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Savings Accounts', 'Salary Accounts', 'Credit Cards', 'UPI (GPay, PhonePe)', 'Debit Cards', 'Fixed Deposits', 'Mutual Funds', 'Wallets'].map((type) => (
                  <span key={type} className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    {type}
                  </span>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Connect Accounts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <MultiAccountMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Your money, unified
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: CreditCard, title: 'Credit card tracking', desc: 'Track utilization, due dates, and minimum payments. Never miss a bill or pay late fees again.', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
              { icon: RefreshCw, title: 'Real-time sync', desc: 'Balance and transactions update as they happen. No stale data, no manual refreshes.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: Eye, title: 'Unified transaction view', desc: 'See all transactions from all accounts in a single, searchable, filterable feed.', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
              { icon: Shield, title: 'Read-only access', desc: 'We use bank-standard APIs with read-only access. We can never move your money.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-cyan-50/50 dark:via-cyan-950/10 to-transparent">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: '50+', label: 'banks supported' },
            { value: '5', label: 'account types' },
            { value: '∞', label: 'accounts per user' },
            { value: 'Live', label: 'sync speed' },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} className="text-center rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <p className="text-3xl font-black text-gray-900 dark:text-white font-display">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-cyan-500 to-blue-600 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Close the other apps</h2>
            <p className="text-cyan-100 mb-8 text-lg">One dashboard for your entire financial life.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-cyan-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-cyan-50 transition-colors text-base shadow-lg">
              Connect All Accounts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
