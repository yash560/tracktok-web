"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, ArrowRight, CheckCircle, Bell, Wallet, MessageSquare } from 'lucide-react';

const groupMembers = [
  { name: 'Ankit', paid: 4800, owes: 0, initials: 'AK', color: 'bg-violet-500' },
  { name: 'Riya', paid: 0, owes: 1600, initials: 'RY', color: 'bg-pink-500' },
  { name: 'Sahil', paid: 0, owes: 1600, initials: 'SH', color: 'bg-blue-500' },
  { name: 'Priya', paid: 0, owes: 1600, initials: 'PR', color: 'bg-emerald-500' },
];

const expenses = [
  { title: 'Goa trip hotel', amount: '₹12,000', paidBy: 'Ankit', split: '4 people', category: 'Travel' },
  { title: 'Dinner at Nobu', amount: '₹4,800', paidBy: 'Ankit', split: '4 people', category: 'Food' },
  { title: 'Scuba diving', amount: '₹6,400', paidBy: 'Riya', split: '4 people', category: 'Activity' },
];

function SplitMockup() {
  return (
    <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Group header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest">Split Group</p>
            <p className="text-white text-xl font-bold">Goa 2026 🌊</p>
          </div>
          <div className="flex -space-x-2">
            {groupMembers.map((m) => (
              <div key={m.name} className={`w-9 h-9 rounded-full ${m.color} border-2 border-white flex items-center justify-center`}>
                <span className="text-white text-[10px] font-bold">{m.initials}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 text-white text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Total group spend</span>
            <span className="font-bold">₹23,200</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/70">Your share</span>
            <span className="font-bold text-emerald-300">₹5,800</span>
          </div>
        </div>
      </div>

      {/* Settlement breakdown */}
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Settlement Summary</p>
        <div className="space-y-2 mb-5">
          {groupMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
            >
              <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-[10px] font-bold">{member.initials}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">{member.name}</span>
              {member.paid > 0 ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                  Paid ₹{member.paid.toLocaleString()}
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
                  Owes ₹{member.owes.toLocaleString()}
                </span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Expenses */}
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">Group Expenses</p>
        <div className="space-y-2">
          {expenses.map((exp, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{exp.title}</p>
                <p className="text-[10px] text-gray-400">Paid by {exp.paidBy} · {exp.split}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{exp.amount}</p>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm">
          Settle Up with Riya ₹1,600 →
        </button>
      </div>
    </div>
  );
}

export default function SharedExpensesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/30 to-transparent dark:from-indigo-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], y: [0, 20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-indigo-300/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-semibold mb-6">
                <Users className="w-4 h-4" /> Drama-Free Splitting
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Split bills.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  Keep friendships.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Create group wallets for trips, dinners, and shared living. Track who paid what, calculate everyone&apos;s share, and settle up with zero awkwardness.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Group trips', icon: '✈️' },
                  { label: 'Shared rent', icon: '🏠' },
                  { label: 'Restaurant bills', icon: '🍽️' },
                  { label: 'Subscriptions', icon: '📱' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>{item.icon}</span> {item.label}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Create a Group <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <SplitMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Everything a group needs
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Flexible splitting', desc: 'Split equally, by percentage, or custom amounts. Perfect for unequal shares.', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
              { icon: Bell, title: 'Auto reminders', desc: 'TrackTok gently nudges pending members to settle - so you don\'t have to.', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
              { icon: Wallet, title: 'Settlement tracking', desc: 'Mark payments as settled via UPI, cash, or bank transfer. Full audit trail.', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
              { icon: MessageSquare, title: 'Group chat', desc: 'Discuss expenses right in the app. No WhatsApp confusion.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: CheckCircle, title: 'Expense history', desc: 'See every expense ever added to the group with a full searchable history.', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
              { icon: ArrowRight, title: 'Minimal simplify', desc: 'TrackTok auto-simplifies debts - if A owes B and B owes C, you only pay C.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">No more awkward IOUs</h2>
            <p className="text-indigo-100 mb-8 text-lg">Create your first group in under 30 seconds.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-indigo-50 transition-colors text-base shadow-lg">
              Split with Friends <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
