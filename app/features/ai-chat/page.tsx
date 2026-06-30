"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowRight, Send, Sparkles, Bot, User } from 'lucide-react';

const sampleConversations = [
  {
    q: 'How much did I spend on food last month?',
    a: 'You spent ₹14,250 on Food & Dining in May — that\'s 29% of your total spend. Zomato (₹4,800) and Swiggy (₹3,200) were your top merchants. Want me to break it down by week?',
  },
  {
    q: 'Am I overspending on subscriptions?',
    a: 'You have 7 active subscriptions totalling ₹2,847/month. Netflix, Spotify, Amazon Prime, and 4 others. That\'s up 22% from 3 months ago. Want me to list ones you haven\'t used recently?',
  },
  {
    q: 'How can I save ₹5,000 more each month?',
    a: 'Based on your spending, here are 3 quick wins: (1) Cut weekend food delivery by 30% → save ₹1,800. (2) Cancel 2 unused subscriptions → save ₹850. (3) Reduce cab usage → save ₹2,100. Total: ₹4,750/month.',
  },
];

const suggestions = [
  'What\'s my biggest expense this month?',
  'Show me my savings rate',
  'Which day do I spend most?',
  'Compare June vs May',
];

function AIChatMockup() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">TrackTok AI</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <p className="text-white/70 text-xs">Online · Instant answers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="p-4 min-h-[220px] space-y-3">
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {/* User message */}
            <div className="flex justify-end mb-3">
              <div className="flex items-end gap-2 max-w-[80%]">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                  {sampleConversations[activeIdx].q}
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-end gap-2 max-w-[90%]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {sampleConversations[activeIdx].a}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Suggestion pills */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {sampleConversations.map((conv, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`text-[10px] px-2.5 py-1.5 rounded-full border transition-all font-medium ${
                activeIdx === idx
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 py-2.5">
          <input className="flex-1 text-sm bg-transparent text-gray-600 dark:text-gray-400 outline-none placeholder:text-gray-400" placeholder="Ask me anything about your money..." readOnly />
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50/30 to-transparent dark:from-green-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.25, 1], x: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-16 -right-16 w-80 h-80 rounded-full bg-green-300/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold mb-6">
                <MessageSquare className="w-4 h-4" /> Ask Your Money Anything
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Chat with{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">
                  your finances.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Our AI understands your spending habits and answers natural questions — no finance degree needed. Just ask, and get instant, personalized insights.
              </p>
              <div className="space-y-2 mb-8">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Try asking</p>
                {suggestions.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm text-sm text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    &ldquo;{s}&rdquo;
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Start Chatting <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <AIChatMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              More than a chatbot
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              TrackTok AI has full context of your finances — every transaction, every category, every month.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Spending summaries', desc: 'Ask for weekly or monthly summaries in plain English. Get tables, totals, and commentary.', emoji: '📊' },
              { title: 'Budget check-ins', desc: '"Am I on track this month?" — TrackTok compares your current pace against your goals.', emoji: '🎯' },
              { title: 'Saving ideas', desc: 'Based on your actual habits, AI suggests specific cuts that add up to real money.', emoji: '💡' },
              { title: 'Merchant lookup', desc: '"What did I spend at Swiggy in March?" — drill into any merchant, any date range.', emoji: '🔍' },
              { title: 'Anomaly questions', desc: '"Did I have any unusual charges?" — AI flags spikes and one-off transactions.', emoji: '⚡' },
              { title: 'Comparison analysis', desc: '"How does this month compare to last year?" — longitudinal analysis on demand.', emoji: '📈' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="rounded-[28px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card p-6 shadow-sm"
              >
                <span className="text-3xl mb-4 block">{item.emoji}</span>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-green-500 to-emerald-600 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Your 24/7 money advisor</h2>
            <p className="text-green-100 mb-8 text-lg">No appointment needed. Just ask.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-green-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-green-50 transition-colors text-base shadow-lg">
              Ask TrackTok AI <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
