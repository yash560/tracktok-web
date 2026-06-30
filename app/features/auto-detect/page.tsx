"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Bell, CheckCircle, Smartphone, Shield, Clock } from 'lucide-react';

const banks = [
  { name: 'HDFC', color: 'bg-red-500', initial: 'H' },
  { name: 'SBI', color: 'bg-blue-600', initial: 'S' },
  { name: 'ICICI', color: 'bg-orange-500', initial: 'I' },
  { name: 'GPay', color: 'bg-blue-400', initial: 'G' },
  { name: 'PhonePe', color: 'bg-purple-600', initial: 'P' },
  { name: 'Paytm', color: 'bg-blue-500', initial: 'P' },
];

const smsMessages = [
  {
    bank: 'HDFC Bank',
    color: 'bg-red-500',
    initial: 'H',
    msg: 'INR 850.00 debited from A/c **1234 on 30-Jun-26. Info: UPI/ZOMATO. Avl Bal:INR 24,150.00',
    parsed: { amount: '₹850', merchant: 'Zomato', category: 'Food & Dining', time: 'Just now' },
  },
  {
    bank: 'SBI',
    color: 'bg-blue-600',
    initial: 'S',
    msg: 'Your A/c XXXX5678 debited by Rs.620.00 on 29-Jun. UPI Ref:Uber. Balance:Rs.18,240.00',
    parsed: { amount: '₹620', merchant: 'Uber', category: 'Travel', time: '1h ago' },
  },
  {
    bank: 'ICICI Bank',
    color: 'bg-orange-500',
    initial: 'I',
    msg: 'ICICI Bank Alert: Rs.1,499.00 debited from Acct XX9012 for Amazon.in on 28-Jun-26.',
    parsed: { amount: '₹1,499', merchant: 'Amazon', category: 'Shopping', time: 'Yesterday' },
  },
];

function AutoDetectMockup() {
  return (
    <div className="relative">
      {/* SMS side */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4 text-center sm:text-left">Raw SMS Alerts</p>
          {smsMessages.map((sms, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${sms.color} flex items-center justify-center`}>
                  <span className="text-white text-[9px] font-bold">{sms.initial}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{sms.bank}</span>
                <Bell className="w-3 h-3 text-gray-400 ml-auto" />
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-mono">{sms.msg}</p>
            </motion.div>
          ))}
        </div>

        {/* Arrow */}
        <div className="hidden sm:flex flex-col items-center gap-2 px-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="w-0.5 h-24 bg-gradient-to-b from-blue-500 to-transparent" />
        </div>

        {/* Parsed transactions */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4 text-center sm:text-left">Auto-parsed Transactions</p>
          {smsMessages.map((sms, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 + 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900/40 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl ${sms.color} flex items-center justify-center`}>
                    <span className="text-white text-[10px] font-bold">{sms.initial}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{sms.parsed.merchant}</p>
                    <p className="text-[10px] text-gray-500">{sms.parsed.time}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">- {sms.parsed.amount}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{sms.parsed.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AutoDetectPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50/30 to-transparent dark:from-blue-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold mb-6">
                <Zap className="w-4 h-4" /> Zero Effort Tracking
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Every rupee tracked.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                  Automatically.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                TrackTok reads your SMS alerts and bank notifications to detect transactions the moment they happen. No manual entry, no missed expenses — just instant, accurate tracking.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['HDFC Bank', 'SBI', 'ICICI', 'Axis', 'Kotak', 'GPay', 'PhonePe', 'Paytm', '+40 more'].map((b) => (
                  <span key={b} className="px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                    {b}
                  </span>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Start Tracking Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl p-6 sm:p-8">
                <AutoDetectMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              How auto-detect works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Three simple steps, zero manual work on your part.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Bell, step: '01', title: 'Receive notification', desc: 'Your bank sends an SMS or push notification for any debit, credit, or UPI transaction.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: Zap, step: '02', title: 'AI parses in real-time', desc: 'Our NLP engine extracts the merchant, amount, date, and account from any format — instantly.', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
              { icon: CheckCircle, step: '03', title: 'Transaction added', desc: 'A clean, categorized entry appears in your dashboard. Review, edit, or ignore — you\'re in control.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
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
                  <span className="text-4xl font-black text-gray-100 dark:text-gray-800 font-display">{item.step}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mt-2 mb-4 ${item.color}`}>
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

      {/* Supported sources */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-blue-50/50 dark:via-blue-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 dark:text-white mb-3">Works with all major banks</h2>
            <p className="text-gray-500 dark:text-gray-400">Supports SMS, push notifications, and email alerts</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {banks.map((bank) => (
              <div key={bank.name} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className={`w-7 h-7 rounded-full ${bank.color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{bank.initial}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{bank.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Clock, title: 'Save 2+ hours/week', desc: 'Never manually enter a transaction again. TrackTok does it instantly for you.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: Smartphone, title: 'Works in the background', desc: 'You don\'t even need to open the app. Transactions are detected as they happen.', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
              { icon: Shield, title: 'Read-only access', desc: 'We only read SMS notifications — we cannot send messages or access your banking apps.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
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

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-blue-500 to-cyan-500 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">
              Stop tracking manually
            </h2>
            <p className="text-blue-100 mb-8 text-lg">Join 20,000+ users who let TrackTok handle it automatically.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-blue-50 transition-colors text-base shadow-lg">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
