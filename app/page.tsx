"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  Zap,
  BarChart3,
  Tag,
  Users,
  MapPin,
  Wallet,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Shield,
  Brain,
  Bell,
  Star,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Sliders,
  Receipt,
  Send,
  Check,
  Lock,
  RefreshCw,
  Flame,
  Activity,
  CreditCard,
  Layers,
  Search,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';

// ─── SCROLLYTELLING STAGE DEFINITIONS ──────────────────────────────
interface StageInfo {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  accent: string;
  glow: string;
}

const STAGES: StageInfo[] = [
  {
    id: 0,
    badge: "01 // ZERO-TAP INGESTION",
    title: "Silent SMS & Bank Sync",
    subtitle: "Every rupee indexed before you even close your UPI app. Zero manual typing, zero copy-pasting.",
    accent: "from-blue-500 to-indigo-600",
    glow: "rgba(59, 130, 246, 0.25)",
  },
  {
    id: 1,
    badge: "02 // REAL-TIME PULSE",
    title: "Neural Spending Clusters",
    subtitle: "Categorization trained on millions of Indian merchant codes. Food, travel, shopping, rent in high-definition.",
    accent: "from-violet-500 to-purple-600",
    glow: "rgba(168, 85, 247, 0.25)",
  },
  {
    id: 2,
    badge: "03 // NATURAL LANGUAGE AI",
    title: "Conversational Copilot",
    subtitle: "Ask anything about your money in plain Hindi/English. Get exact graphs, category caps, and velocity alerts.",
    accent: "from-emerald-400 to-teal-500",
    glow: "rgba(34, 197, 94, 0.25)",
  },
  {
    id: 3,
    badge: "04 // STEALTH LEAK RADAR",
    title: "Autonomous Subscription Audit",
    subtitle: "Catch forgotten free trials, duplicate streaming tiers, and sneaky APR fees before they compound.",
    accent: "from-amber-400 to-orange-500",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: 4,
    badge: "05 // SQUAD LEDGER",
    title: "Frictionless Group Splits",
    subtitle: "Goa trips, flatmate rent, dinner bills settled in 30 seconds with 1-click UPI deep links and zero awkward chats.",
    accent: "from-pink-500 to-rose-600",
    glow: "rgba(244, 63, 94, 0.25)",
  },
];

// ─── PHONE SIMULATOR COMPONENT ─────────────────────────────────────
function InteractivePhoneStage({ activeStage }: { activeStage: number }) {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [cancelledSubs, setCancelledSubs] = useState<number[]>([]);
  const [settledFriend, setSettledFriend] = useState(false);

  const questions = [
    {
      q: "Am I on track for my ₹25K savings goal?",
      a: "Yes! You've banked ₹18,400. Pacing indicates you'll close at ₹26,200 (104.8% of goal). Keep weekend dinners under ₹1,200.",
    },
    {
      q: "How much did I burn on Swiggy & Zomato?",
      a: "₹4,180 across 6 orders this month (↓ 18% vs last month). You saved ₹890 by cooking on weekdays!",
    },
    {
      q: "When is my HDFC Millennia bill due?",
      a: "Due in 4 days (₹14,250). Auto-debit scheduled for Oct 14. Clearing today preserves your 790 CIBIL score.",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[370px]">
      {/* Outer ambient glow based on stage */}
      <div
        className="absolute -inset-4 rounded-[50px] blur-3xl opacity-60 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${STAGES[activeStage]?.glow || 'rgba(108, 99, 255, 0.2)'} 0%, transparent 70%)`,
        }}
      />

      {/* Titanium Phone Chassis */}
      <div className="relative rounded-[46px] p-3 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-2xl border border-slate-700/60 ring-1 ring-white/10">
        {/* Dynamic Island Screen */}
        <div className="relative rounded-[38px] bg-slate-950 overflow-hidden text-slate-100 flex flex-col min-h-[580px] sm:min-h-[620px] border border-white/5 shadow-inner">
          {/* Top Status Bar & Dynamic Island */}
          <div className="px-6 pt-3 pb-2 flex items-center justify-between z-20">
            <span className="text-[11px] font-semibold tracking-wider text-slate-300">9:41</span>
            {/* Dynamic Island Pill */}
            <div className="h-6 w-28 bg-black rounded-full flex items-center justify-center gap-1.5 px-2 border border-white/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[9px] font-mono text-emerald-300 truncate">
                {activeStage === 0 && "SMS Captured"}
                {activeStage === 1 && "Pulse 120bpm"}
                {activeStage === 2 && "TrackTok AI"}
                {activeStage === 3 && "Radar Active"}
                {activeStage === 4 && "Squad Sync"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <Activity className="w-3 h-3 text-slate-400" />
              <span>5G</span>
            </div>
          </div>

          {/* Screen Body with Stage-specific Transitions */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              {/* STAGE 0: ZERO-TAP SMS INGESTION */}
              {activeStage === 0 && (
                <motion.div
                  key="stage-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Incoming Feed</p>
                      <h4 className="text-base font-bold text-white">Bank SMS Stream</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                      Live Hook
                    </span>
                  </div>

                  {/* Mock Raw Bank Alert */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-3.5 shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-bold">
                        H
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300">HDFC-BANK-ALERT</span>
                      <span className="ml-auto text-[9px] text-slate-500">Just now</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-black/40 p-2 rounded-lg border border-white/5">
                      Sent Rs.850.00 from A/C **4912 to ZOMATO MEDIA via UPI ref 4291039401. Avl Bal Rs.64,120.
                    </p>
                  </motion.div>

                  {/* Neural Parsing Animation Result */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/70 border border-purple-500/40 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[11px] font-bold text-white">TrackTok AI Extractor</span>
                      </div>
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                        12ms latency
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400">Merchant</p>
                        <p className="font-semibold text-white mt-0.5">Zomato Ltd</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400">Amount</p>
                        <p className="font-semibold text-rose-400 mt-0.5">- ₹850.00</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400">Category</p>
                        <p className="font-semibold text-amber-300 mt-0.5">Food & Dining 🍔</p>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400">Account</p>
                        <p className="font-semibold text-sky-300 mt-0.5">HDFC Salary</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Auto-tagged to April Budget
                      </span>
                      <span className="font-semibold">32% of food cap</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* STAGE 1: REAL-TIME PULSE & CLUSTERING */}
              {activeStage === 1 && (
                <motion.div
                  key="stage-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Monthly Snapshot</p>
                      <h4 className="text-base font-bold text-white">₹48,750 Total Spent</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                      <TrendingDown className="w-2.5 h-2.5" /> -12% MoM
                    </span>
                  </div>

                  {/* Radial Conic Donut Chart Mockup */}
                  <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <div
                        className="w-full h-full rounded-full animate-spin-slow"
                        style={{
                          background: 'conic-gradient(#6C63FF 0% 30%, #A855F7 30% 50%, #FBA94D 50% 65%, #22C55E 65% 80%, #38BDF8 80% 100%)',
                        }}
                      />
                      <div className="absolute inset-3 bg-slate-950 rounded-full flex flex-col items-center justify-center">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Pulse</span>
                        <span className="text-xs font-bold text-white">Healthy</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-1.5 text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6C63FF]" /> Food & Dining
                        </span>
                        <span className="font-bold text-white">30% (₹14.6K)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#A855F7]" /> Commute/Travel
                        </span>
                        <span className="font-bold text-white">20% (₹9.7K)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#FBA94D]" /> Shopping
                        </span>
                        <span className="font-bold text-white">15% (₹7.3K)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Utilities/Bills
                        </span>
                        <span className="font-bold text-white">15% (₹7.3K)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Subscriptions
                        </span>
                        <span className="font-bold text-white">20% (₹9.8K)</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Velocity Bars */}
                  <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Weekly Velocity</p>
                    <div className="h-16 flex items-end justify-between gap-2 px-1">
                      {[
                        { day: 'Mon', h: '45%' },
                        { day: 'Tue', h: '60%' },
                        { day: 'Wed', h: '35%' },
                        { day: 'Thu', h: '75%' },
                        { day: 'Fri', h: '90%' },
                        { day: 'Sat', h: '55%' },
                        { day: 'Sun', h: '40%' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-slate-800 rounded-t-sm h-full flex items-end overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: item.h }}
                              transition={{ duration: 0.5, delay: idx * 0.05 }}
                              className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-sm"
                            />
                          </div>
                          <span className="text-[8px] text-slate-400">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: CONVERSATIONAL INTELLIGENCE */}
              {activeStage === 2 && (
                <motion.div
                  key="stage-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Ask TrackTok</p>
                      <h4 className="text-base font-bold text-white">Financial Intelligence</h4>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready
                    </span>
                  </div>

                  {/* Interactive Question Chips */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {questions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveQuestion(idx)}
                        className={`text-[9px] px-2.5 py-1 rounded-full whitespace-nowrap transition cursor-pointer ${
                          activeQuestion === idx
                            ? 'bg-secondary text-white font-semibold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        Prompt {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Chat Stream Bubble */}
                  <div className="space-y-2.5 text-[11px]">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-tr-sm p-3 text-slate-200 ml-6">
                      <p className="font-medium text-slate-100">{questions[activeQuestion].q}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/30 rounded-2xl rounded-tl-sm p-3.5 space-y-1.5 mr-3">
                      <div className="flex items-center gap-1.5 text-secondary font-bold text-[10px]">
                        <Brain className="w-3.5 h-3.5" /> TrackTok Copilot
                      </div>
                      <p className="text-slate-300 leading-relaxed">{questions[activeQuestion].a}</p>
                    </div>
                  </div>

                  {/* Mini Input Box Mock */}
                  <div className="rounded-xl bg-slate-900 border border-white/10 p-2 flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="Ask your money anything..."
                      className="bg-transparent text-[11px] text-slate-500 flex-1 outline-none"
                    />
                    <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                      <Send className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: AUTONOMOUS LEAK STOPPER */}
              {activeStage === 3 && (
                <motion.div
                  key="stage-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Leak Radar</p>
                      <h4 className="text-base font-bold text-white">Recurring Audit</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                      ₹3,349/mo Flagged
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: 1,
                        name: 'Cult.fit Elite Pass',
                        amount: '₹1,500/mo',
                        flag: '0 check-ins in 42 days',
                        tag: 'Unused gym',
                      },
                      {
                        id: 2,
                        name: 'Netflix Premium 4K',
                        amount: '₹649/mo',
                        flag: 'Duplicate plan in household',
                        tag: 'Redundant',
                      },
                      {
                        id: 3,
                        name: 'Credit Card Interest Alert',
                        amount: '₹1,200 APR',
                        flag: 'Due in 3 days; pay today',
                        tag: 'Avoid fee',
                      },
                    ].map((sub) => {
                      const isCancelled = cancelledSubs.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className={`rounded-2xl border p-3 transition-all ${
                            isCancelled
                              ? 'bg-slate-900/40 border-emerald-500/30 opacity-70'
                              : 'bg-slate-900/90 border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-white">{sub.name}</span>
                            <span className="font-mono text-amber-300">{sub.amount}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mb-2">{sub.flag}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {sub.tag}
                            </span>
                            <button
                              onClick={() => {
                                setCancelledSubs((prev) =>
                                  prev.includes(sub.id) ? prev.filter((x) => x !== sub.id) : [...prev, sub.id]
                                );
                              }}
                              className={`text-[9px] font-semibold px-2 py-1 rounded transition cursor-pointer ${
                                isCancelled
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                              }`}
                            >
                              {isCancelled ? '✓ Leak Plugged' : 'Plug Leak'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/30 p-2.5 flex items-center justify-between text-[11px] text-emerald-300">
                    <span>Projected 1-Yr Net Savings:</span>
                    <span className="font-bold text-white">
                      ₹{cancelledSubs.length > 0 ? (cancelledSubs.length * 15000).toLocaleString() : '40,188'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: SQUAD SPLIT */}
              {activeStage === 4 && (
                <motion.div
                  key="stage-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Group Ledger</p>
                      <h4 className="text-base font-bold text-white">Goa Beach Villa (4)</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold">
                      ₹24,800 Total
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Yash (You)', role: 'Paid ₹24,800', status: 'Gets ₹18,600', color: 'bg-emerald-500' },
                      { name: 'Kabir Verma', role: 'Owes ₹6,200', status: settledFriend ? 'Settled UPI ✓' : '₹1,450 remaining', color: 'bg-indigo-500' },
                      { name: 'Priya Sharma', role: 'Owes ₹6,200', status: 'Pending Approval', color: 'bg-amber-500' },
                      { name: 'Sneha Patel', role: 'Owes ₹6,200', status: 'Settled UPI ✓', color: 'bg-rose-500' },
                    ].map((m, idx) => (
                      <div key={idx} className="rounded-2xl bg-slate-900/80 border border-white/10 p-2.5 flex items-center gap-2.5 text-xs">
                        <div className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center font-bold text-white text-[10px]`}>
                          {m.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400">{m.role}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          m.status.includes('Settled')
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSettledFriend(!settledFriend)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-bold shadow-lg hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {settledFriend ? 'Send Thank You Note' : 'Request Kabir via 1-Click UPI'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Dock / Home Indicator */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-500 text-[9px]">
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="w-2.5 h-2.5 text-emerald-400" /> AES-256 Encrypted
              </span>
              <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto" />
              <span>v1.4.8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCROLLYTELLING SHOWCASE SECTION ───────────────────────────────
function ScrollytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 24,
    restDelta: 0.001,
  });

  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      // Map 0..1 to 0..4
      const stageIdx = Math.min(Math.floor(latest * STAGES.length), STAGES.length - 1);
      setActiveStage(stageIdx);
    });
  }, [scrollYProgress]);

  const scrollToStage = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const stepHeight = containerHeight / STAGES.length;
    window.scrollTo({
      top: containerTop + stepHeight * index + 10,
      behavior: 'smooth',
    });
  };

  return (
    <section id="scrollytelling" ref={containerRef} className="relative h-[420vh] bg-slate-950 text-white">
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 md:px-12 py-16 sm:py-20">
        {/* Subtle Ambient Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(108,99,255,0.12),transparent_65%)]" />

        {/* Top Header & Stage Navigation Scrubber */}
        <div className="max-w-7xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Interactive Walkthrough</p>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                {STAGES[activeStage]?.title}
              </h3>
            </div>
          </div>

          {/* Quick-Jump Step Scrubber */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1 rounded-full shadow-lg">
            {STAGES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => scrollToStage(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeStage === idx
                    ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Central Presentation Canvas: Left Narrative, Center Phone, Right Telemetry */}
        <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-12 z-10 my-auto">
          {/* Left Narrative Card */}
          <div className="hidden lg:flex flex-col justify-center space-y-6">
            <motion.div
              key={`left-${activeStage}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 max-w-md"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-white/10 text-secondary border border-white/10">
                {STAGES[activeStage]?.badge}
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
                {STAGES[activeStage]?.title}
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                {STAGES[activeStage]?.subtitle}
              </p>

              <div className="pt-2">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Under the hood</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeStage === 0 && "• Regex + LLM token extractor parses bank headers in ~12ms without storing SMS body."}
                    {activeStage === 1 && "• Dynamic clustering vector weights expenses into 6 canonical rings with velocity indicators."}
                    {activeStage === 2 && "• Multi-turn RAG querying over encrypted transaction ledger with zero hallucination guarantee."}
                    {activeStage === 3 && "• Recurrence cadence tracker identifies stealth price bumps, renewal traps & unused memberships."}
                    {activeStage === 4 && "• Direct NPCI / UPI link generation: friends tap once to settle without copy-pasting numbers."}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Stage: Phone Mockup */}
          <div className="flex justify-center items-center">
            <InteractivePhoneStage activeStage={activeStage} />
          </div>

          {/* Right Companion Badges */}
          <div className="hidden lg:flex flex-col justify-center space-y-4">
            <motion.div
              key={`right-${activeStage}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 max-w-sm"
            >
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                    {activeStage === 0 && <Zap className="w-5 h-5" />}
                    {activeStage === 1 && <BarChart3 className="w-5 h-5" />}
                    {activeStage === 2 && <MessageSquare className="w-5 h-5" />}
                    {activeStage === 3 && <Flame className="w-5 h-5" />}
                    {activeStage === 4 && <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Key Differentiator</p>
                    <p className="text-sm font-bold text-white">
                      {activeStage === 0 && "100% Read-Only Access"}
                      {activeStage === 1 && "Autonomous Clustering"}
                      {activeStage === 2 && "Natural Language Engine"}
                      {activeStage === 3 && "Proactive Leaks Radar"}
                      {activeStage === 4 && "Zero-Awkward Splits"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStage === 0 && "We never ask for your netbanking passwords or OTPs. All telemetry is parsed from standard notification payloads."}
                  {activeStage === 1 && "Forget manually tagging 200 items at month-end. TrackTok learns your habits and categorizes with 99.4% precision."}
                  {activeStage === 2 && "No spreadsheets or pivot tables required. Simply ask your assistant how much you spent on cabs or groceries."}
                  {activeStage === 3 && "The average subscriber saves ₹38,400 per year simply by canceling forgotten recurring subscriptions."}
                  {activeStage === 4 && "No more awkward WhatsApp follow-ups. Automated 1-click UPI deep links get your tabs squared away instantly."}
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">Like what you see?</p>
                  <p className="text-sm font-bold text-white">Experience it live</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition"
                >
                  Open Web App
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Interactive Progress Scroller */}
        <div className="max-w-7xl mx-auto w-full z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="font-mono text-secondary">STAGE 0{activeStage + 1} OF 05</span>
            <span className="hidden sm:inline">• Scroll to advance through money stages</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToStage(Math.max(0, activeStage - 1))}
              disabled={activeStage === 0}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => scrollToStage(Math.min(STAGES.length - 1, activeStage + 1))}
              disabled={activeStage === STAGES.length - 1}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── INTERACTIVE FINANCIAL SAVINGS SIMULATOR ───────────────────────
function FinancialSimulator() {
  const [monthlySpend, setMonthlySpend] = useState<number>(65000);
  const [profile, setProfile] = useState<'solo' | 'founder' | 'squad'>('solo');

  const leakPercentage = profile === 'solo' ? 0.06 : profile === 'founder' ? 0.09 : 0.075;
  const optimizationRate = profile === 'solo' ? 0.08 : profile === 'founder' ? 0.12 : 0.10;

  const leaksCaughtMonthly = Math.round(monthlySpend * leakPercentage);
  const smartOptimizationMonthly = Math.round(monthlySpend * optimizationRate);
  const totalMonthlySavings = leaksCaughtMonthly + smartOptimizationMonthly;
  const annualSavings = totalMonthlySavings * 12;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-slate-50 dark:bg-slate-950/50 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary/10 text-secondary mb-4">
            <Sliders className="w-3.5 h-3.5" /> Interactive ROI Simulator
          </span>
          <h2 className="section-header">How much money will TrackTok save you?</h2>
          <p className="section-subtitle">
            Drag the slider to your average monthly outflow. Watch our autonomous leak radar and budget clusters project your 1-year capital recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Controls Card */}
          <div className="lg:col-span-7 bg-white dark:bg-dark-card rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">
                  Monthly Total Outflow
                </label>
                <span className="text-2xl font-bold font-mono text-primary">
                  ₹{monthlySpend.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={15000}
                max={250000}
                step={5000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                <span>₹15,000</span>
                <span>₹1,25,000</span>
                <span>₹2,50,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Spending Archetype
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'solo', label: 'Solo Pro', desc: 'Personal bills & lifestyle' },
                  { id: 'founder', label: 'Founder / SMB', desc: 'SaaS, travel & expenses' },
                  { id: 'squad', label: 'Shared / Squad', desc: 'Flatmates & group trips' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProfile(item.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      profile === item.id
                        ? 'bg-secondary/10 border-secondary text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>• Forgotten subscriptions & redundant tiers:</span>
                <span className="font-semibold text-rose-500 font-mono">₹{leaksCaughtMonthly.toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>• AI budget reallocation & dining caps:</span>
                <span className="font-semibold text-emerald-500 font-mono">₹{smartOptimizationMonthly.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 flex flex-col justify-between min-h-[380px]">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-mono font-semibold">
                Estimated Capital Return
              </span>
              <p className="text-sm text-slate-300 mt-4">1-Year Projected Savings</p>
              <h3 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mt-1">
                ₹{annualSavings.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Equivalent to <span className="text-emerald-400 font-semibold">{Math.round(annualSavings / 299)} months</span> of TrackTok Pro paid for automatically.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Net Monthly Benefit:</span>
                <span className="font-bold text-white font-mono">₹{totalMonthlySavings.toLocaleString()}</span>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm text-center block hover:bg-slate-100 transition shadow-lg"
              >
                Claim Your Savings Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── BENTO GRID FEATURES ───────────────────────────────────────────
function BentoGridSection() {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary/10 text-secondary mb-4">
            <Sparkles className="w-3.5 h-3.5" /> High-Performance Architecture
          </span>
          <h2 className="section-header">Built for clarity. Engineered for velocity.</h2>
          <p className="section-subtitle">
            TrackTok replaces 4 different clunky apps: expense loggers, subscription trackers, Splitwise groups, and financial spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Zero-Tap SMS Reading */}
          <div className="md:col-span-2 rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Auto-detect SMS & Bank Alerts
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md leading-relaxed">
              Never open an app to type "₹150 for chai". TrackTok’s on-device parser ingests transactional SMS, extracts merchant names, calculates balances, and tags categories instantly.
            </p>
            <div className="rounded-2xl bg-slate-900 p-4 border border-white/5 font-mono text-xs text-slate-300 space-y-1">
              <p className="text-emerald-400 font-semibold">// Live Parser Telemetry</p>
              <p className="text-slate-400">Merchant: "Zomato Ltd" → Category: "Food & Dining" (Confidence: 0.998)</p>
              <p className="text-slate-400">Balance: "₹64,120.00" → Updated ledger in 14ms</p>
            </div>
          </div>

          {/* Card 2: Bank-Grade Privacy */}
          <div className="rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bank-Grade AES-256
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Read-only SMS access. We never hold your netbanking passwords or trigger transfers. SOC-2 Type II compliant with zero ad monetization.
            </p>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>RBI Guidelines Compliant</span>
            </div>
          </div>

          {/* Card 3: Location Heatmaps */}
          <div className="rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Location Spending Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Visualize where your wealth flows geographically across cities, transit hubs, and weekend dining clusters.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Koramangala, BLR</span>
                <span className="font-mono text-primary font-bold">₹14,250</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-900">
                <span className="font-semibold text-gray-800 dark:text-gray-200">Bandra West, BOM</span>
                <span className="font-mono text-primary font-bold">₹9,800</span>
              </div>
            </div>
          </div>

          {/* Card 4: Squad Split */}
          <div className="md:col-span-2 rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Squad Split & 1-Click UPI Links
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg leading-relaxed">
              Eliminate the spreadsheet stress. Share wallets, track vacation expenses, and settle balances instantly using generated UPI intent deep-links.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Zero Reminders', desc: 'Auto-nudges over WhatsApp' },
                { title: 'Multi-Currency', desc: 'INR, USD, EUR auto-converted' },
                { title: 'Equal & Unequal', desc: 'Custom percentage splits' },
                { title: 'Receipt Uploads', desc: 'OCR itemizes line by line' },
              ].map((f, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{f.title}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── COMPARISON MATRIX ─────────────────────────────────────────────
function ComparisonSection() {
  const features = [
    { name: 'Zero-Tap SMS Ingestion', tracktok: 'Yes (100% Automated)', banks: 'No (Manual or slow)', sheets: 'No' },
    { name: 'Natural Language AI Q&A', tracktok: 'Yes (Instant Answers)', banks: 'No', sheets: 'No' },
    { name: 'Squad Split & UPI Links', tracktok: 'Built-in', banks: 'No', sheets: 'Manual formulas' },
    { name: 'Subscription Creep Radar', tracktok: 'Proactive Flags', banks: 'No', sheets: 'No' },
    { name: 'Bank Credentials Required', tracktok: 'Never (Read-Only SMS)', banks: 'Yes (Full Login)', sheets: 'No' },
    { name: 'Zero Data Monetization', tracktok: 'Guaranteed SOC2', banks: 'Cross-sells loans', sheets: 'Manual' },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-gray-50 dark:bg-slate-950/60 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
            The Competitive Standard
          </span>
          <h2 className="section-header mt-2">Why power users switch to TrackTok</h2>
          <p className="section-subtitle">
            See how TrackTok compares against legacy bank applications and tedious manual spreadsheets.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
                  <th className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">Feature</th>
                  <th className="p-4 sm:p-5 font-bold text-primary">TrackTok AI</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-500">Traditional Bank Apps</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-500">Excel / Spreadsheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {features.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 sm:p-5 font-medium text-gray-900 dark:text-white">{item.name}</td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> {item.tracktok}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400">{item.banks}</td>
                    <td className="p-4 sm:p-5 text-gray-500 dark:text-gray-400">{item.sheets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS WALL ─────────────────────────────────────────────
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bengaluru',
    initials: 'PS',
    quote: 'TrackTok found ₹3,200/month in subscriptions I forgot about. Cancelled 4 in one sitting. Best app I installed this year.',
    badge: '₹38,400/yr saved',
  },
  {
    name: 'Arjun Mehta',
    role: 'MBA Student, Mumbai',
    initials: 'AM',
    quote: 'Used to dread the "where did my money go?" panic. TrackTok answers that in real time. My savings rate went from 8% to 24%.',
    badge: '3× savings rate',
  },
  {
    name: 'Neha Gupta',
    role: 'Freelance Designer, Delhi',
    initials: 'NG',
    quote: 'The split feature is insane. Our Goa trip settlement that took 3 WhatsApp groups and 2 weeks now takes 5 minutes.',
    badge: 'Zero awkward IOUs',
  },
  {
    name: 'Rohan Desai',
    role: 'Product Manager, Pune',
    initials: 'RD',
    quote: 'Asked the AI "am I spending more than last quarter?" and it gave me a proper breakdown by category. No other app does this.',
    badge: 'Instant AI answers',
  },
  {
    name: 'Kavya Reddy',
    role: 'Doctor, Hyderabad',
    initials: 'KR',
    quote: 'I work crazy hours — no time to manually track anything. TrackTok auto-detects everything from my bank SMS. I just check the weekly report.',
    badge: '2 hrs/week saved',
  },
  {
    name: 'Vikram Singh',
    role: 'Startup Founder, Bengaluru',
    initials: 'VS',
    quote: 'Privacy was my main concern. Read-only SMS access, AES-256 encryption, no data selling. After reading their policy I trusted them completely.',
    badge: 'Full data control',
  },
];

// ─── FAQS ACCORDION ────────────────────────────────────────────────
const faqs = [
  {
    q: 'Is my banking data safe with TrackTok?',
    a: 'Yes. TrackTok reads SMS notifications using read-only access — we cannot initiate payments or access your banking apps. All data is AES-256 encrypted at rest and in transit. We are SOC 2 Type II certified and RBI-compliant.',
  },
  {
    q: 'Do you sell my financial data?',
    a: 'Never. Your transactions, spending habits, and personal data are never sold to advertisers, data brokers, or any third parties. Our business model is subscription revenue from users — not your data.',
  },
  {
    q: 'How does TrackTok make money?',
    a: 'We charge ₹299/month for Pro and ₹499/month for Squad. That\'s it. No ads, no data monetization, no referral fees from financial products.',
  },
  {
    q: 'Which banks and payment apps are supported?',
    a: 'We support 50+ Indian banks including HDFC, SBI, ICICI, Axis, Kotak, and all major UPI apps — Google Pay, PhonePe, Paytm, and CRED. If we\'re missing yours, let us know and we\'ll add it.',
  },
  {
    q: 'Can TrackTok transfer or move my money?',
    a: 'No. TrackTok only reads SMS notifications. We never have your banking credentials and cannot initiate any transaction under any circumstances.',
  },
  {
    q: 'What happens to my data if I delete my account?',
    a: 'All your data is permanently deleted from our servers within 24 hours of deletion. You can export everything as CSV or JSON before you go.',
  },
  {
    q: 'Does it work without giving bank access?',
    a: 'Yes — the core auto-detect feature works from SMS notifications only. You can also add transactions manually. No bank login required.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Starter plan is permanently free with 1 connected account, weekly spending pulse, and auto category tagging. No credit card required to start.',
  },
];

function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card overflow-hidden transition"
        >
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{faq.q}</span>
            <span className={`text-xl font-light text-gray-400 flex-shrink-0 transition-transform duration-200 ${open === idx ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === idx && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN HOME COMPONENT ───────────────────────────────────────────
export default function Home() {
  return (
    <>
      <MarketingNav />

      <main className="min-h-screen">
        {/* 1. HERO SECTION */}
        <section className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 md:px-12 relative overflow-hidden">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-secondary/10 text-secondary border border-secondary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Scroll-Driven AI Operating System for Money</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white leading-[1.05] max-w-5xl mx-auto mb-8"
            >
              Your finances, completely{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-pink-500">
                scroll-driven
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Experience silent bank SMS capture, real-time spending clusters, natural language AI querying, and squad splits in one seamless journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            >
              <a
                href="#scrollytelling"
                className="btn-primary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl group"
              >
                <span>Take The Interactive Scroll Tour</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/dashboard"
                className="btn-secondary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Launch Web Dashboard</span>
              </Link>
            </motion.div>

            {/* Live Metrics Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-gray-200/60 dark:border-gray-800"
            >
              {[
                { value: '₹4.2 Cr+', label: 'Volume Tracked' },
                { value: '12ms', label: 'SMS Parse Latency' },
                { value: '20,000+', label: 'Active Users' },
                { value: '4.8 ★', label: 'Store Rating' },
              ].map((m, idx) => (
                <div key={idx} className="p-3">
                  <p className="text-2xl sm:text-3xl font-extrabold font-mono text-gray-900 dark:text-white">{m.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 2. THE CORE SCROLL-DRIVEN EXPERIENCE */}
        <ScrollytellingSection />

        {/* 3. INTERACTIVE FINANCIAL SIMULATOR */}
        <FinancialSimulator />

        {/* 4. BENTO GRID FEATURES */}
        <BentoGridSection />

        {/* 5. COMPETITIVE MATRIX */}
        <ComparisonSection />

        {/* 6. VERIFIED REVIEWS WALL */}
        <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-white dark:bg-dark-bg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
                Verified Wall of Love
              </span>
              <h2 className="section-header mt-2">Built for anyone serious about money</h2>
              <p className="section-subtitle">Real feedback from founders, engineers, students, and doctors across India.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl p-6 bg-slate-50 dark:bg-dark-card border border-gray-200/80 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">
                        {t.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{t.name}</p>
                        <p className="text-[10px] text-gray-500">{t.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-gray-50 dark:bg-slate-950/40 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
                Transparent & Honest
              </span>
              <h2 className="section-header mt-2">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about safety, permissions, and pricing.</p>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* 8. HIGH-CONVERTING CLOSING CTA */}
        <section className="py-20 px-4 sm:px-6 md:px-12">
          <div className="max-w-5xl mx-auto rounded-[36px] bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white p-8 sm:p-14 shadow-2xl border border-white/10 relative overflow-hidden text-center">
            <div className="absolute -inset-20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-white/10 text-secondary text-xs font-mono font-semibold">
                Free Forever Starter Tier
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight text-white">
                Take control of your money today.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Connect your first account in under 30 seconds. No credit card required. Experience the power of autonomous AI finance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/dashboard"
                  className="btn-primary text-base px-8 py-4 w-full sm:w-auto font-bold"
                >
                  🚀 Launch Dashboard
                </Link>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tracktok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold transition text-base w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Download Mobile App
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
