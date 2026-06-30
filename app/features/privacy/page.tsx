"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock, Eye, EyeOff, Server, KeyRound, FileText } from 'lucide-react';

const principles = [
  { icon: Lock, title: 'AES-256 encryption', desc: 'All your data is encrypted at rest and in transit using military-grade AES-256 encryption.', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
  { icon: EyeOff, title: 'Zero data selling', desc: 'We never sell your financial data to advertisers, data brokers, or any third parties. Ever.', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' },
  { icon: Eye, title: 'Read-only access', desc: 'TrackTok can only read your transaction data - it cannot initiate payments or transfers.', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { icon: Server, title: 'India-based servers', desc: 'Your data is stored on servers hosted in India, complying with all RBI data localization norms.', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
  { icon: KeyRound, title: 'No password storage', desc: 'We use OAuth2 and bank-level APIs. We never see or store your banking passwords.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  { icon: FileText, title: 'Transparent data policy', desc: 'Plain-English privacy policy. You can export or delete all your data at any time, instantly.', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
];

function PrivacyMockup() {
  return (
    <div className="space-y-4">
      {/* Shield visual */}
      <div className="rounded-[32px] bg-gradient-to-br from-emerald-900 to-teal-900 p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15),transparent_60%)]" />
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/30 flex items-center justify-center mx-auto mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
          </motion.div>
          <p className="text-emerald-300 text-xs uppercase tracking-widest font-semibold mb-2">Security Status</p>
          <p className="text-2xl font-bold mb-1">Protected</p>
          <p className="text-emerald-400 text-sm">All systems secure · Last audit: June 2026</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
          {[
            { label: 'Encryption', value: 'AES-256', icon: '🔒' },
            { label: 'Uptime', value: '99.99%', icon: '⚡' },
            { label: 'SOC 2', value: 'Certified', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-white/10 p-3 text-center">
              <div className="text-lg mb-1">{stat.icon}</div>
              <p className="text-xs font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-emerald-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data controls */}
      <div className="rounded-[28px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Your data controls</p>
        <div className="space-y-3">
          {[
            { label: 'Export all my data', desc: 'Download everything as CSV/JSON', icon: FileText, action: 'Export', color: 'text-blue-500' },
            { label: 'Revoke account access', desc: 'Disconnect a linked bank account', icon: EyeOff, action: 'Revoke', color: 'text-orange-500' },
            { label: 'Delete my account', desc: 'Permanently erase all data', icon: Lock, action: 'Delete', color: 'text-red-500' },
          ].map((control, idx) => {
            const Icon = control.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className={`w-4 h-4 ${control.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{control.label}</p>
                  <p className="text-xs text-gray-400">{control.desc}</p>
                </div>
                <button className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors">
                  {control.action} →
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-transparent dark:from-emerald-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute top-0 right-0 w-96 h-96 rounded-full bg-emerald-300/10 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold mb-6">
                <ShieldCheck className="w-4 h-4" /> Privacy First
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Your data,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600">
                  your rules.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We built TrackTok with privacy at the core, not as an afterthought. Bank-grade encryption, zero data selling, and complete transparency - because your financial life is personal.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['SOC 2 Type II', 'RBI Compliant', 'ISO 27001', 'GDPR Ready', 'End-to-end Encrypted'].map((cert) => (
                  <span key={cert} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-dark-card border border-emerald-200 dark:border-emerald-800/50 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400 shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> {cert}
                  </span>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Start Securely <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <PrivacyMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Our privacy principles
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Not just a policy. How we actually operate.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((item, idx) => {
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

      {/* Trust badges */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-emerald-50/50 dark:via-emerald-950/10 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Trusted by 400+ users</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { icon: '🔒', label: 'Encrypted', sub: 'AES-256' },
              { icon: '👁️', label: 'Read-only', sub: 'No transfers' },
              { icon: '🇮🇳', label: 'India hosted', sub: 'RBI compliant' },
              { icon: '🗑️', label: 'Deletable', sub: 'Instant, full' },
            ].map((badge, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} className="rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 p-5 text-center shadow-sm">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{badge.label}</p>
                <p className="text-xs text-gray-400">{badge.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-emerald-500 to-teal-600 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Safe, secure, and yours</h2>
            <p className="text-emerald-100 mb-8 text-lg">Your financial data deserves the best protection.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-emerald-50 transition-colors text-base shadow-lg">
              Get Started Securely <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
