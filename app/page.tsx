"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  Compass,
  PieChart,
  FileText,
  AlertTriangle,
  QrCode,
  DollarSign,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { MarketingNav } from '@/components/MarketingNav';
import { MarketingFooter } from '@/components/MarketingFooter';

// ═════════════════════════════════════════════════════════════════════
// 1. SCROLLYTELLING STORY ARCHITECTURE & BUSINESS ANALYST DATA
// ═════════════════════════════════════════════════════════════════════

interface StoryStage {
  id: number;
  num: string;
  badge: string;
  title: string;
  headline: string;
  lead: string;
  problem: string;
  solution: string;
  analystNote: string;
  metrics: { label: string; value: string; trend?: string }[];
  accentGradient: string;
  glowColor: string;
}

const STORY_STAGES: StoryStage[] = [
  {
    id: 0,
    num: "01",
    badge: "ZERO-TAP EDGE INGESTION",
    title: "Silent SMS & Bank Telemetry",
    headline: "Every rupee indexed before you even lock your phone.",
    lead: "Traditional expense trackers ask you to open an app and manually type '₹150 for coffee'. You abandon them in 4 days. Aggregator apps demand netbanking passwords that break constantly. TrackTok eliminates both.",
    problem: "Manual logging suffers an 84% abandonment rate by day 14. Credential-based aggregators pose major security risks and trigger constant 2FA disconnects.",
    solution: "On-device deterministic regex and local token extractors parse transactional bank SMS payloads into structured, MCC-mapped transaction objects in 11.8ms.",
    analystNote: "Preserves 100% read-only boundaries. Conforms to RBI digital payment notification guidelines with zero banking credential storage.",
    metrics: [
      { label: "Parse Latency", value: "11.8ms", trend: "On-device" },
      { label: "Token Precision", value: "99.4%", trend: "MCC-mapped" },
      { label: "Credentials Required", value: "0", trend: "Zero-Trust" },
    ],
    accentGradient: "from-blue-500 to-indigo-600",
    glowColor: "rgba(59, 130, 246, 0.25)",
  },
  {
    id: 1,
    num: "02",
    badge: "NEURAL CAPITAL VELOCITY",
    title: "Real-Time Spending Clusters & Burn Pacing",
    headline: "Cashflow is not a flat list. It is a live velocity radar.",
    lead: "A 40-page bank PDF statement tells you what happened weeks ago when it's too late to adjust. TrackTok transforms raw transactions into dynamic capital allocation rings that predict month-end runway in real time.",
    problem: "Chronological transaction lists give zero spatial intuition of wealth burn, causing 73% of urban professionals to face mid-month liquidity shock.",
    solution: "Instant merchant clustering groups debits into 4 core liquidity rings (Fixed Commitments, Lifestyle Velocity, Discretionary Buffer, Capital Formation) with dynamic burn velocity pacing.",
    analystNote: "Dynamic velocity modeling computes daily allowable discretionary burn rate to guarantee user-defined month-end savings targets.",
    metrics: [
      { label: "Liquidity Rings", value: "4 Pools", trend: "Dynamic" },
      { label: "Target Pacing", value: "104.8%", trend: "On-track" },
      { label: "Runway Visibility", value: "30 Days", trend: "Predictive" },
    ],
    accentGradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(168, 85, 247, 0.25)",
  },
  {
    id: 2,
    num: "03",
    badge: "DETERMINISTIC COPILOT",
    title: "Conversational Financial Intelligence",
    headline: "Talk to your money without pivot tables or spreadsheets.",
    lead: "Query your cashflow naturally in plain English or conversational Hinglish. Get immediate, mathematically verified breakdowns backed directly by your encrypted ledger—with zero hallucination.",
    problem: "Complex filtering and spreadsheet pivot tables are unusable on mobile. Generic chatbots invent numbers rather than auditing genuine transaction ledgers.",
    solution: "Deterministic semantic retrieval engine queries local encrypted ledger indexes directly, synthesizing clear conversational answers with inline visualizations.",
    analystNote: "Zero-hallucination guarantee: every monetary figure returned by Copilot is strictly cross-referenced against confirmed transaction ledger hashes.",
    metrics: [
      { label: "Query Response", value: "<18ms", trend: "Instant" },
      { label: "Math Hallucination", value: "0.0%", trend: "Verified" },
      { label: "Language Support", value: "EN + HI", trend: "Contextual" },
    ],
    accentGradient: "from-emerald-400 to-teal-500",
    glowColor: "rgba(34, 197, 94, 0.25)",
  },
  {
    id: 3,
    num: "04",
    badge: "STEALTH MANDATE RADAR",
    title: "Autonomous Subscription Audit & Leak Stopper",
    headline: "Plug silent subscription creep before auto-debits compound.",
    lead: "Forgotten free trials, duplicate streaming tiers, dormant gym passes, and credit card APR charges bleed capital continuously. TrackTok’s mandate radar detects recurring cadences and flags inactive drains.",
    problem: "The average urban professional loses ₹3,200 to ₹6,500 every month to zombie e-NACH and UPI AutoPay mandates that renew without conscious evaluation.",
    solution: "Autonomous recurrence engine tracks billing cadences, biometric inactivity, and upcoming debit schedules, providing 1-tap plug actions and early warning alerts.",
    analystNote: "Recovers an average of ₹38,400 in dormant capital per user annually with zero manual bank statement reviews.",
    metrics: [
      { label: "Avg Annual Recovery", value: "₹38,400", trend: "+12.4% ROI" },
      { label: "Mandate Coverage", value: "100%", trend: "e-NACH + UPI" },
      { label: "Pre-Debit Warning", value: "72 Hours", trend: "Proactive" },
    ],
    accentGradient: "from-amber-400 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: 4,
    num: "05",
    badge: "SQUAD LEDGER & UPI LINK",
    title: "1-Click NPCI UPI Settlements",
    headline: "Shared bills settled in 30 seconds with zero awkward texts.",
    lead: "Goa trips, flatmate rent, and team lunches usually mean messy WhatsApp threads, manual math errors, and forgotten debts. TrackTok automates the entire group ledger with instant 1-click UPI intent links.",
    problem: "Group expenses destroy social harmony through forgotten IOUs, confusing multi-payer split math, and tedious manual VPA copy-pasting.",
    solution: "Integrated squad ledger automatically computes net debt settlements and generates direct NPCI UPI deep links for Google Pay, PhonePe, and Paytm.",
    analystNote: "Compresses group debt reconciliation cycles from 14 days down to under 4 minutes with automated UPI intent link generation.",
    metrics: [
      { label: "Settlement Speed", value: "4 Seconds", trend: "1-Tap UPI" },
      { label: "Math Discrepancy", value: "0%", trend: "Auto-netted" },
      { label: "Supported UPI Apps", value: "All NPCI", trend: "Universal" },
    ],
    accentGradient: "from-pink-500 to-rose-600",
    glowColor: "rgba(244, 63, 94, 0.25)",
  },
  {
    id: 5,
    num: "06",
    badge: "ZERO-TRUST HARDWARE VAULT",
    title: "Fortress-Grade Privacy & AES-256 GCM",
    headline: "Your wealth telemetry belongs to you. Zero data monetization.",
    lead: "Most 'free' budgeting apps sell your transaction history to credit card telemarketers, loan brokers, and ad exchanges. TrackTok operates on a strict Zero-Knowledge privacy model.",
    problem: "Traditional fintech aggregators harvest personal financial behavior to cross-sell predatory personal loans and high-interest credit lines.",
    solution: "On-device regex sanitization discards OTPs in volatile memory before storage. All transaction telemetry is encrypted locally via AES-256 GCM with hardware key derivation.",
    analystNote: "Complies with SOC 2 Type II controls and RBI regulatory norms. TrackTok maintains zero fund-transfer authority and zero netbanking credentials.",
    metrics: [
      { label: "Encryption Cipher", value: "AES-256", trend: "Hardware GCM" },
      { label: "Ad Monetization", value: "0.0%", trend: "Strictly Prohibited" },
      { label: "Transfer Authority", value: "None", trend: "Read-Only" },
    ],
    accentGradient: "from-cyan-400 to-blue-600",
    glowColor: "rgba(6, 182, 212, 0.25)",
  },
];

// ═════════════════════════════════════════════════════════════════════
// 2. HARDWARE PHONE SIMULATOR ENGINE (INTERACTIVE SCROLL-DRIVEN STAGE)
// ═════════════════════════════════════════════════════════════════════

interface PhoneSimulatorProps {
  activeStage: number;
}

function PhoneHardwareSimulator({ activeStage }: PhoneSimulatorProps) {
  // Stage 0: Mock SMS selection
  const mockSmsList = [
    {
      id: 'sms-1',
      sender: 'HDFC-BANK-ALERT',
      time: 'Just now',
      rawText: 'Sent Rs.850.00 from A/C **4912 to ZOMATO MEDIA via UPI ref 4291039401. Avl Bal Rs.64,120.',
      merchant: 'Zomato Ltd',
      amount: '- ₹850.00',
      category: 'Food & Dining 🍔',
      account: 'HDFC Regalia',
      tag: '32% of monthly dining cap',
    },
    {
      id: 'sms-2',
      sender: 'ICICI-ALERT',
      time: '2m ago',
      rawText: 'Debited Rs.420.00 from A/C **8821 to SWIGGY INSTAMART UPI ref 9948123011. Avl Bal Rs.41,200.',
      merchant: 'Swiggy Instamart',
      amount: '- ₹420.00',
      category: 'Quick Commerce 🛒',
      account: 'ICICI Wealth',
      tag: 'Auto-categorized groceries',
    },
    {
      id: 'sms-3',
      sender: 'AXIS-BANK',
      time: '14m ago',
      rawText: 'Rs.1,240.00 spent on Axis Card **3019 at BLINKIT GURGAON. Avl Lmt Rs.2,40,000.',
      merchant: 'Blinkit Commerce',
      amount: '- ₹1,240.00',
      category: 'Household & Pantry 🍎',
      account: 'Axis Neo Card',
      tag: 'Household Essentials',
    },
  ];
  const [selectedSms, setSelectedSms] = useState(0);

  // Stage 2: Copilot Queries
  const copilotQuestions = [
    {
      q: "Did my dining burn exceed last month?",
      a: "Yes by 14%. You've spent ₹8,420 across 11 orders (avg ₹765/order). However, you cut transit spend by ₹2,100, so net lifestyle burn is safely within your 15% discretionary buffer.",
      badge: "Discretionary Pacing",
      stat: "₹8,420 spent (↑ 14%)",
    },
    {
      q: "Can I book a ₹42,000 flight without touching my emergency fund?",
      a: "Yes, comfortably. Your liquid surplus currently stands at ₹58,400 after reserving ₹35,000 for upcoming rent and SIPs. Booking today leaves a ₹16,400 surplus buffer for the month.",
      badge: "Liquidity Safe",
      stat: "₹58,400 liquid surplus",
    },
    {
      q: "When is my HDFC Regalia bill due?",
      a: "Due in 3 days (₹18,450). Auto-debit scheduled for Oct 14. Clearing it today protects your 794 CIBIL score and optimizes your credit utilization ratio to 7.6%.",
      badge: "Credit Optimization",
      stat: "Due Oct 14 (₹18,450)",
    },
  ];
  const [activeCopilotQ, setActiveCopilotQ] = useState(0);

  // Stage 3: Leak Radar Toggles
  const [unpluggedLeaks, setUnpluggedLeaks] = useState<number[]>([]);
  const leaksData = [
    {
      id: 1,
      name: 'Cult.fit Elite Pass',
      cost: '₹1,500/mo',
      annual: 18000,
      reason: '0 biometric check-ins in 42 days',
      type: 'Dormant Fitness',
    },
    {
      id: 2,
      name: 'Netflix 4K Premium',
      cost: '₹649/mo',
      annual: 7788,
      reason: 'Duplicate active tier in household',
      type: 'Redundant Stream',
    },
    {
      id: 3,
      name: 'HDFC Late APR Risk',
      cost: '₹1,200 APR',
      annual: 14400,
      reason: 'Due in 3 days; pay now to waive fee',
      type: 'Avoidable Finance Fee',
    },
  ];

  const totalLeakRecovered = useMemo(() => {
    return unpluggedLeaks.reduce((acc, leakId) => {
      const match = leaksData.find((l) => l.id === leakId);
      return acc + (match ? match.annual : 0);
    }, 0);
  }, [unpluggedLeaks]);

  // Stage 4: Squad Ledger Settle State
  const [kabirSettled, setKabirSettled] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]">
      {/* Outer Dynamic Glow matching active stage */}
      <div
        className="absolute -inset-4 rounded-[52px] blur-3xl opacity-60 transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${STORY_STAGES[activeStage]?.glowColor || 'rgba(108, 99, 255, 0.25)'} 0%, transparent 70%)`,
        }}
      />

      {/* Titanium Frame Chassis */}
      <div className="relative rounded-[48px] p-3 sm:p-3.5 bg-gradient-to-b from-slate-700 via-slate-900 to-black shadow-2xl border border-slate-700/80 ring-1 ring-white/10">
        {/* Dynamic Island Screen */}
        <div className="relative rounded-[40px] bg-slate-950 overflow-hidden text-slate-100 flex flex-col min-h-[590px] sm:min-h-[640px] border border-white/10 shadow-inner">
          
          {/* Top Status Bar & Dynamic Island */}
          <div className="px-6 pt-3.5 pb-2 flex items-center justify-between z-20 bg-slate-950/80 backdrop-blur-md">
            <span className="text-[11px] font-semibold tracking-wider text-slate-300 font-mono">9:41</span>
            
            {/* Dynamic Island Pill */}
            <div className="h-6 w-32 bg-black rounded-full flex items-center justify-center gap-1.5 px-2.5 border border-white/10 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-mono text-emerald-300 truncate font-semibold">
                {activeStage === 0 && "12ms Parsed"}
                {activeStage === 1 && "Pulse 104.8%"}
                {activeStage === 2 && "Copilot Ready"}
                {activeStage === 3 && "Radar Active"}
                {activeStage === 4 && "UPI DeepLink"}
                {activeStage === 5 && "AES-256 Vault"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <Activity className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-mono">5G</span>
            </div>
          </div>

          {/* Screen Body with Stage Transitions */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">

              {/* STAGE 0: ZERO-TAP BANK INGESTION & SUB-12MS PARSING */}
              {activeStage === 0 && (
                <motion.div
                  key="stage-0"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Hardware Telemetry</p>
                      <h4 className="text-base font-bold text-white">Bank SMS Parser</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold border border-emerald-500/30">
                      Live Stream
                    </span>
                  </div>

                  {/* SMS Switcher Tabs */}
                  <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5">
                    {mockSmsList.map((sms, idx) => (
                      <button
                        key={sms.id}
                        onClick={() => setSelectedSms(idx)}
                        className={`flex-1 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                          selectedSms === idx
                            ? 'bg-secondary text-white shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sample 0{idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Raw Bank Alert Card with Scanning Laser */}
                  <div className="relative rounded-2xl bg-slate-900/90 border border-indigo-500/40 p-3 shadow-lg overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
                    
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                          B
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200">
                          {mockSmsList[selectedSms].sender}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{mockSmsList[selectedSms].time}</span>
                    </div>

                    <p className="text-[10px] text-slate-300 font-mono leading-relaxed bg-black/60 p-2.5 rounded-xl border border-white/5">
                      {mockSmsList[selectedSms].rawText}
                    </p>
                  </div>

                  {/* Parsed Structured Token Output */}
                  <motion.div
                    key={`parsed-${selectedSms}`}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/70 border border-purple-500/40 p-3.5 space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[11px] font-bold text-white">Structured Ledger Entry</span>
                      </div>
                      <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        11.8ms Edge Latency
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900/70 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-[9px]">Merchant Entity</p>
                        <p className="font-semibold text-white mt-0.5 truncate">{mockSmsList[selectedSms].merchant}</p>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-[9px]">Debit Value</p>
                        <p className="font-semibold text-rose-400 font-mono mt-0.5">{mockSmsList[selectedSms].amount}</p>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-[9px]">Category Mapping</p>
                        <p className="font-semibold text-amber-300 mt-0.5 truncate">{mockSmsList[selectedSms].category}</p>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-xl border border-white/5">
                        <p className="text-slate-400 text-[9px]">Bank Ledger</p>
                        <p className="font-semibold text-sky-300 mt-0.5 truncate">{mockSmsList[selectedSms].account}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-400 border-t border-white/5">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Auto-allocated to April Cap
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">{mockSmsList[selectedSms].tag}</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* STAGE 1: NEURAL CAPITAL VELOCITY & RADAR CLUSTERING */}
              {activeStage === 1 && (
                <motion.div
                  key="stage-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Capital Flow</p>
                      <h4 className="text-base font-bold text-white">Velocity Radar</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-mono font-semibold">
                      104.8% Pacing
                    </span>
                  </div>

                  {/* Interactive Spending Matrix Radial Visualizer */}
                  <div className="rounded-2xl bg-slate-900/90 border border-violet-500/30 p-3.5 text-center space-y-3">
                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="#6C63FF" strokeWidth="6"
                          strokeDasharray="264" strokeDashoffset="75"
                          strokeLinecap="round"
                        />
                        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="32" fill="none"
                          stroke="#A855F7" strokeWidth="6"
                          strokeDasharray="201" strokeDashoffset="60"
                          strokeLinecap="round"
                        />
                        <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                        <circle
                          cx="50" cy="50" r="22" fill="none"
                          stroke="#22C55E" strokeWidth="6"
                          strokeDasharray="138" strokeDashoffset="35"
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 font-mono">Monthly Burn</span>
                        <span className="text-sm font-bold font-mono text-white">₹46,250</span>
                        <span className="text-[9px] text-emerald-400 font-semibold font-mono">₹28,400 Saved</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[9px] pt-1">
                      <div className="p-1.5 rounded-lg bg-slate-950/80 border border-indigo-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mx-auto mb-1" />
                        <p className="text-slate-400">Fixed Rent/EMI</p>
                        <p className="font-bold text-white font-mono mt-0.5">₹26,000</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/80 border border-purple-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mx-auto mb-1" />
                        <p className="text-slate-400">Lifestyle</p>
                        <p className="font-bold text-white font-mono mt-0.5">₹14,800</p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/80 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mb-1" />
                        <p className="text-slate-400">Wealth SIP</p>
                        <p className="font-bold text-emerald-300 font-mono mt-0.5">₹25,000</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-violet-950/50 to-slate-900 border border-violet-500/20 p-3 flex items-center justify-between text-[10px]">
                    <div className="space-y-0.5">
                      <p className="text-slate-400">Sustainable Discretionary Runway</p>
                      <p className="font-bold text-white">₹1,820/day allowable spend</p>
                    </div>
                    <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 font-semibold">
                      +₹14,200 vs Target
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: CONVERSATIONAL FINANCIAL COPILOT */}
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
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Deterministic RAG</p>
                      <h4 className="text-base font-bold text-white">Financial Copilot</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-semibold">
                      Zero Hallucination
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {copilotQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCopilotQ(idx)}
                        className={`w-full text-left p-2 rounded-xl text-[10px] font-medium transition cursor-pointer flex items-center justify-between border ${
                          activeCopilotQ === idx
                            ? 'bg-secondary/20 border-secondary text-white'
                            : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="truncate pr-2">"{q.q}"</span>
                        <ChevronRight className="w-3 h-3 flex-shrink-0 text-slate-500" />
                      </button>
                    ))}
                  </div>

                  <motion.div
                    key={`copilot-res-${activeCopilotQ}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-3.5 space-y-2 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                        <Brain className="w-3.5 h-3.5" /> TrackTok Copilot
                      </div>
                      <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                        {copilotQuestions[activeCopilotQ].badge}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-200 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                      {copilotQuestions[activeCopilotQ].a}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                      <span>Telemetry Verification:</span>
                      <span className="text-white font-semibold">{copilotQuestions[activeCopilotQ].stat}</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* STAGE 3: STEALTH MANDATE RADAR & SUBSCRIPTION STOPPER */}
              {activeStage === 3 && (
                <motion.div
                  key="stage-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">AutoPay Defense</p>
                      <h4 className="text-base font-bold text-white">Mandate Audit</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold">
                      ₹3,349/mo Flagged
                    </span>
                  </div>

                  <div className="space-y-2">
                    {leaksData.map((sub) => {
                      const isUnplugged = unpluggedLeaks.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className={`rounded-2xl border p-2.5 transition-all ${
                            isUnplugged
                              ? 'bg-slate-900/40 border-emerald-500/40 opacity-75'
                              : 'bg-slate-900/90 border-amber-500/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-white">{sub.name}</span>
                            <span className="font-mono text-amber-300 font-semibold">{sub.cost}</span>
                          </div>
                          <p className="text-[9px] text-slate-400 mb-2">{sub.reason}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {sub.type}
                            </span>
                            <button
                              onClick={() => {
                                setUnpluggedLeaks((prev) =>
                                  prev.includes(sub.id) ? prev.filter((x) => x !== sub.id) : [...prev, sub.id]
                                );
                              }}
                              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                isUnplugged
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                              }`}
                            >
                              {isUnplugged ? '✓ Mandate Cancelled' : 'Plug Auto-Debit'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-2.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-300 font-medium">1-Year Capital Reclaimed:</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      ₹{unpluggedLeaks.length > 0 ? totalLeakRecovered.toLocaleString() : '40,188'}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: SQUAD LEDGER & 1-CLICK NPCI UPI SETTLEMENT */}
              {activeStage === 4 && (
                <motion.div
                  key="stage-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Debt Netting</p>
                      <h4 className="text-base font-bold text-white">Goa Villa Trip (4)</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold">
                      ₹24,800 Total
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { name: 'Yash (Organizer)', note: 'Paid ₹24,800 villa booking', status: 'Receives ₹18,600', color: 'bg-emerald-500' },
                      { name: 'Kabir Verma', note: 'Owes ₹6,200 share', status: kabirSettled ? 'Settled via UPI ✓' : '₹6,200 pending', color: 'bg-indigo-500' },
                      { name: 'Priya Sharma', note: 'Owes ₹6,200 share', status: 'Settled via UPI ✓', color: 'bg-purple-500' },
                      { name: 'Sneha Patel', note: 'Owes ₹6,200 share', status: 'Settled via UPI ✓', color: 'bg-rose-500' },
                    ].map((m, idx) => (
                      <div key={idx} className="rounded-2xl bg-slate-900/80 border border-white/10 p-2.5 flex items-center gap-2.5 text-xs">
                        <div className={`w-7 h-7 rounded-full ${m.color} flex items-center justify-center font-bold text-white text-[10px]`}>
                          {m.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-[11px] truncate">{m.name}</p>
                          <p className="text-[9px] text-slate-400">{m.note}</p>
                        </div>
                        <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                          m.status.includes('Settled')
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (!kabirSettled) {
                        setShowUpiModal(true);
                      } else {
                        setKabirSettled(false);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-secondary to-primary text-white text-xs font-bold shadow-lg hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    {kabirSettled ? 'Reset Settlement Demo' : 'Generate Kabir UPI Link (₹6,200)'}
                  </button>

                  {showUpiModal && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-2xl bg-slate-900 border border-purple-500/50 p-3 space-y-2 text-center"
                    >
                      <p className="text-[10px] font-mono text-purple-300">NPCI Intent Generated</p>
                      <p className="text-xs font-bold text-white font-mono">upi://pay?pa=yash@okhdfc&am=6200</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setKabirSettled(true);
                            setShowUpiModal(false);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition cursor-pointer"
                        >
                          Simulate PhonePe Pay
                        </button>
                        <button
                          onClick={() => setShowUpiModal(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* STAGE 5: ZERO-TRUST HARDWARE VAULT & PRIVACY */}
              {activeStage === 5 && (
                <motion.div
                  key="stage-5"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Security Core</p>
                      <h4 className="text-base font-bold text-white">Zero-Trust Vault</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-semibold">
                      AES-256 GCM
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        step: 'Layer 01',
                        title: 'On-Device Sanitizer',
                        desc: 'Sensitive OTPs & personal identifiers purged in volatile RAM before disk storage.',
                        badge: 'Zero Persistent OTPs',
                      },
                      {
                        step: 'Layer 02',
                        title: 'AES-256 GCM Encryption',
                        desc: 'Hardware-backed keystore derivations isolate your local ledger cryptographically.',
                        badge: 'Hardware Enclave',
                      },
                      {
                        step: 'Layer 03',
                        title: 'Zero Fund Transfer Rights',
                        desc: 'Read-only SMS parsing hook. TrackTok has zero access to initiate debits or transfers.',
                        badge: 'Read-Only Invariant',
                      },
                    ].map((sec, idx) => (
                      <div key={idx} className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-cyan-400 text-[10px] font-bold">{sec.step}</span>
                          <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
                            {sec.badge}
                          </span>
                        </div>
                        <p className="font-bold text-white text-[11px]">{sec.title}</p>
                        <p className="text-[9px] text-slate-400 leading-relaxed">{sec.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-900 p-2.5 border border-white/5 flex items-center justify-center gap-2 text-[10px] text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>RBI Notification Norms & SOC 2 Type II Aligned</span>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom Safe Area / Home Indicator */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-500 text-[9px] font-mono">
              <span className="flex items-center gap-1 text-slate-400">
                <Lock className="w-2.5 h-2.5 text-emerald-400" /> Secure Sandbox
              </span>
              <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto" />
              <span>TrackTok OS</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 3. CONTINUOUS SCROLL-DRIVEN SCROLLYTELLING SHOWCASE THEATRE
// ═════════════════════════════════════════════════════════════════════

function ScrollytellingTheatre() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      const stageIdx = Math.min(Math.floor(latest * STORY_STAGES.length), STORY_STAGES.length - 1);
      setActiveStage(stageIdx);
    });
  }, [scrollYProgress]);

  const scrollToStage = (index: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const containerHeight = containerRef.current.offsetHeight;
    const stepHeight = containerHeight / STORY_STAGES.length;
    window.scrollTo({
      top: containerTop + stepHeight * index + 15,
      behavior: 'smooth',
    });
  };

  const currentStory = STORY_STAGES[activeStage] || STORY_STAGES[0];

  return (
    <section id="scrollytelling" ref={containerRef} className="relative h-[550vh] bg-slate-950 text-white">
      {/* Sticky Full-Viewport Stage Canvas */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 md:px-12 py-16 sm:py-20">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(108,99,255,0.15),transparent_65%)]" />

        {/* Top Scrubber & Story Act Progress Navigation */}
        <div className="max-w-7xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                ACT {currentStory.num} OF 06 // PRODUCT STORY
              </p>
              <h3 className="text-base sm:text-xl font-bold font-display text-white">
                {currentStory.title}
              </h3>
            </div>
          </div>

          {/* Quick-Jump Step Scrubber */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1 rounded-full shadow-xl">
            {STORY_STAGES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => scrollToStage(idx)}
                className={`px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all cursor-pointer ${
                  activeStage === idx
                    ? 'bg-gradient-to-r from-secondary to-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

        {/* Central Presentation Canvas */}
        <div className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_auto_1fr] items-center gap-8 lg:gap-12 z-10 my-auto">
          
          {/* Left Narrative Column */}
          <div className="hidden lg:flex flex-col justify-center space-y-6">
            <motion.div
              key={`narrative-${activeStage}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 max-w-lg"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-white/10 text-secondary border border-white/10">
                {currentStory.badge}
              </span>

              <h2 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight text-white">
                {currentStory.headline}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {currentStory.lead}
              </p>

              {/* Business Analyst Deep Dive Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5 shadow-lg">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Why Traditional Solutions Fail
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStory.problem}
                </p>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[11px] font-mono text-emerald-300">
                    <span className="font-bold text-emerald-400">TrackTok Edge: </span>
                    {currentStory.solution}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Center Column: Hardware Phone Simulator */}
          <div className="flex justify-center items-center">
            <PhoneHardwareSimulator activeStage={activeStage} />
          </div>

          {/* Right Column: Quantitative Telemetry Metrics */}
          <div className="hidden lg:flex flex-col justify-center space-y-4">
            <motion.div
              key={`telemetry-${activeStage}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 max-w-sm"
            >
              <div className="rounded-2xl bg-slate-900/90 border border-white/10 p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono uppercase text-slate-400">Clinical Impact Metrics</p>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {currentStory.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-400">{m.label}</p>
                        <p className="text-base font-bold font-mono text-white mt-0.5">{m.value}</p>
                      </div>
                      {m.trend && (
                        <span className="text-[10px] font-mono text-secondary bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20">
                          {m.trend}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Senior Analyst Note</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                    "{currentStory.analystNote}"
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-secondary/15 to-primary/15 border border-secondary/30 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">Ready to test drive?</p>
                  <p className="text-sm font-bold text-white">Experience live web app</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition shadow"
                >
                  Launch App
                </Link>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Bottom Interactive Stage Control Bar */}
        <div className="max-w-7xl mx-auto w-full z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="font-mono text-secondary font-bold">ACT {currentStory.num} OF 06</span>
            <span className="hidden sm:inline">• Scroll down or use buttons to navigate story</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToStage(Math.max(0, activeStage - 1))}
              disabled={activeStage === 0}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer font-semibold"
            >
              Previous
            </button>
            <button
              onClick={() => scrollToStage(Math.min(STORY_STAGES.length - 1, activeStage + 1))}
              disabled={activeStage === STORY_STAGES.length - 1}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer font-semibold"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 4. HERO SECTION WITH 3D PERSPECTIVE SCROLL UNFOLD
// ═════════════════════════════════════════════════════════════════════

function HeroShowcase() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.8], [12, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.94, 1.0]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0.95, 1.0]);

  return (
    <section ref={heroRef} className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[650px] bg-gradient-to-b from-primary/15 via-secondary/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-secondary/10 text-secondary border border-secondary/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-secondary" />
          <span>The Autonomous Financial Operating System</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-display tracking-tight text-gray-900 dark:text-white leading-[1.08] max-w-5xl mx-auto mb-8"
        >
          Stop wondering where your money went.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-pink-500">
            See every rupee in real time.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal"
        >
          Built for modern professionals, founders, and flatmates. Captures bank SMS in 12ms, normalizes cryptic merchant codes, stops forgotten subscription leaks, and settles group splits with 1-click UPI links—with zero manual data entry and bank-grade read-only security.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#scrollytelling"
            className="btn-primary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl group cursor-pointer"
          >
            <span>Explore The 6-Act Product Story</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <Link
            href="/dashboard"
            className="btn-secondary text-base px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Launch Web Dashboard</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-gray-200/60 dark:border-gray-800 mb-16"
        >
          {[
            { value: '₹4.8 Cr+', label: 'Ledger Volume Tracked', detail: 'Across 50+ Banks' },
            { value: '11.8ms', label: 'On-Device Parse Latency', detail: 'Zero Cloud Roundtrip' },
            { value: '99.4%', label: 'Merchant Classification', detail: 'MCC-Tagged Accuracy' },
            { value: '₹38,400', label: 'Avg Annual Leak Reclaimed', detail: 'Per Active User' },
          ].map((m, idx) => (
            <div key={idx} className="p-3">
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-gray-900 dark:text-white">{m.value}</p>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{m.label}</p>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{m.detail}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          style={{
            perspective: 1200,
            rotateX,
            scale,
            opacity,
          }}
          className="relative max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-slate-800/60 via-slate-900/80 to-slate-950 border border-white/10 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10 px-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">tracktok-os.live // unified-ledger-v1.4</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-mono">Consolidated Net Balance</p>
              <h3 className="text-3xl font-extrabold font-mono text-white">₹1,42,850.00</h3>
              <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last month run-rate
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-mono">Monthly Discretionary Burn</p>
              <h3 className="text-3xl font-extrabold font-mono text-white">₹46,250.00</h3>
              <p className="text-xs text-slate-400 font-mono">
                Pacing: <span className="text-emerald-400 font-bold">₹1,820/day</span> allowable
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-mono">Leaking Mandates Caught</p>
              <h3 className="text-3xl font-extrabold font-mono text-amber-400">3 Subscriptions</h3>
              <p className="text-xs text-amber-300 font-mono">
                ₹3,349/mo recoverable capital
              </p>
            </div>
          </div>

          <div className="absolute -top-6 -left-6 hidden lg:flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-2xl text-xs text-white">
            <Zap className="w-4 h-4 text-secondary" />
            <span>HDFC SMS Parsed in 11.8ms</span>
          </div>

          <div className="absolute -bottom-6 -right-6 hidden lg:flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl text-xs text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Goa Trip Split Settled via UPI</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 5. INTERACTIVE FINANCIAL ROI & CAPITAL RECOVERY ENGINE
// ═════════════════════════════════════════════════════════════════════

function FinancialROIEngine() {
  const [monthlySpend, setMonthlySpend] = useState<number>(75000);
  const [archetype, setArchetype] = useState<'solo' | 'founder' | 'squad'>('solo');

  const leakRate = archetype === 'solo' ? 0.055 : archetype === 'founder' ? 0.085 : 0.07;
  const optimizationRate = archetype === 'solo' ? 0.08 : archetype === 'founder' ? 0.12 : 0.095;

  const monthlyLeaksCaught = Math.round(monthlySpend * leakRate);
  const monthlySmartOptimization = Math.round(monthlySpend * optimizationRate);
  const totalMonthlySavings = monthlyLeaksCaught + monthlySmartOptimization;
  const annualSavings = totalMonthlySavings * 12;
  const paybackDays = Math.max(1, Math.round((299 / (totalMonthlySavings / 30)) * 10) / 10);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-slate-50 dark:bg-slate-950/60 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary/10 text-secondary mb-4">
            <Sliders className="w-3.5 h-3.5" /> Quantitative Capital Recovery Model
          </span>
          <h2 className="section-header">How much dormant wealth will TrackTok recover for you?</h2>
          <p className="section-subtitle">
            Drag the outflow slider to your monthly burn. Our financial analyst model calculates exact capital recovery from plugged zombie mandates and neural budget pacing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
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
                min={20000}
                max={300000}
                step={5000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                <span>₹20,000</span>
                <span>₹1,50,000</span>
                <span>₹3,00,000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Spending Profile Archetype
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'solo', label: 'Solo Pro', desc: 'Personal bills & lifestyle' },
                  { id: 'founder', label: 'Founder / SMB', desc: 'SaaS, travel & expenses' },
                  { id: 'squad', label: 'Shared / Squad', desc: 'Flatmates & group trips' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setArchetype(item.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      archetype === item.id
                        ? 'bg-secondary/10 border-secondary text-gray-900 dark:text-white shadow-sm'
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
                <span>• Forgotten AutoPay subscriptions & redundant tiers:</span>
                <span className="font-semibold text-rose-500 font-mono">₹{monthlyLeaksCaught.toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>• Neural budget velocity optimization & dining pacing:</span>
                <span className="font-semibold text-emerald-500 font-mono">₹{monthlySmartOptimization.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 flex flex-col justify-between min-h-[390px]">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-mono font-semibold">
                Projected Capital Recovery
              </span>
              <p className="text-sm text-slate-300 mt-4">1-Year Net Reclaimed Wealth</p>
              <h3 className="text-4xl sm:text-5xl font-extrabold font-mono text-white mt-1">
                ₹{annualSavings.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                TrackTok Pro pays for itself in <span className="text-emerald-400 font-bold">{paybackDays} days</span> each month.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Net Monthly Capital Boost:</span>
                <span className="font-bold text-white font-mono text-sm">₹{totalMonthlySavings.toLocaleString()}</span>
              </div>
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm text-center block hover:bg-slate-100 transition shadow-lg cursor-pointer"
              >
                Claim Your Recovery Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 6. HIGH-PERFORMANCE BENTO GRID ARCHITECTURE (DEEP DIVE TOOLS)
// ═════════════════════════════════════════════════════════════════════

function BentoArchitecture() {
  const [selectedCity, setSelectedCity] = useState<'blr' | 'bom' | 'del'>('blr');

  const cityData = {
    blr: { city: 'Bengaluru', spend: '₹28,450', hotspot: 'Indiranagar & Koramangala', tag: 'Tech Hub Dining' },
    bom: { city: 'Mumbai', spend: '₹34,120', hotspot: 'Bandra West & BKC', tag: 'Transit & Cafes' },
    del: { city: 'Delhi NCR', spend: '₹22,800', hotspot: 'CyberHub & South Ex', tag: 'Lifestyle & Metro' },
  };

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-secondary/10 text-secondary mb-4">
            <Sparkles className="w-3.5 h-3.5" /> High-Density Functional Modules
          </span>
          <h2 className="section-header">Engineered for absolute financial precision</h2>
          <p className="section-subtitle">
            Replace fragmented budgeting apps, manual bank statements, Splitwise groups, and spreadsheet formulas with one cohesive financial OS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              On-Device Sub-12ms SMS Extraction
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">
              Never manually log expenses again. TrackTok’s deterministic parser reads bank notification payloads in real time, normalizes merchant descriptors, attributes MCC categories, and updates account balances.
            </p>
            <div className="rounded-2xl bg-slate-950 p-4 border border-white/10 font-mono text-xs text-slate-300 space-y-1.5">
              <p className="text-emerald-400 font-semibold">// Edge Parser Engine Execution</p>
              <p className="text-slate-400">Payload: "Sent Rs.850.00 from A/C **4912 to ZOMATO MEDIA via UPI"</p>
              <p className="text-cyan-300">Extraction: Merchant="Zomato Ltd" | MCC=5812 (Dining) | Bal="₹64,120"</p>
              <p className="text-slate-500 text-[10px]">Deterministic latency: 11.8ms | Cloud roundtrips: 0</p>
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Bank-Grade Zero-Trust Vault
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Read-only SMS hooks. We never hold your netbanking passwords or trigger transfers. Zero ad tracking, zero loan broker data sales.
            </p>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>RBI Guidelines Compliant</span>
            </div>
          </div>

          <div className="rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              City Spending Geography
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Track where your capital flows geographically across transit hubs, airport lounges, and dining corridors.
            </p>
            <div className="flex gap-1.5 mb-4">
              {(['blr', 'bom', 'del'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    selectedCity === c
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-800 text-xs space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">{cityData[selectedCity].city}</span>
                <span className="font-mono text-primary">{cityData[selectedCity].spend}</span>
              </div>
              <p className="text-gray-500 text-[11px]">{cityData[selectedCity].hotspot}</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl p-8 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Squad Ledger & 1-Click NPCI UPI Links
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg leading-relaxed">
              No more manual debt tracking. Auto-net multi-person group balances and generate instant UPI intent deep links that friends can tap to settle on Google Pay, PhonePe, or Paytm.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Zero Reminders', desc: 'Auto-nudges over WhatsApp' },
                { title: 'Multi-Currency', desc: 'INR, USD, EUR auto-converted' },
                { title: 'Custom Ratios', desc: 'Equal, percentage & itemized' },
                { title: 'Receipt OCR', desc: 'Itemizes dinner tabs line by line' },
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

// ═════════════════════════════════════════════════════════════════════
// 7. BUSINESS ANALYST COMPARISON MATRIX
// ═════════════════════════════════════════════════════════════════════

function ClinicalComparisonMatrix() {
  const comparisonItems = [
    {
      feature: 'Zero-Tap SMS Ingestion',
      tracktok: '11.8ms On-Device Regex',
      banks: 'Manual or Lagged Batches',
      sheets: 'Tedious Manual Entry',
    },
    {
      feature: 'Conversational Copilot',
      tracktok: 'Deterministic RAG Ledger',
      banks: 'Static FAQs or Absent',
      sheets: 'Complex Custom Formulas',
    },
    {
      feature: 'Mandate Leak Radar',
      tracktok: 'e-NACH & AutoPay Flags',
      banks: 'Hidden in Statement PDFs',
      sheets: 'Manual Spot Audits',
    },
    {
      feature: 'Squad Splits & UPI Links',
      tracktok: 'Instant NPCI Deep Links',
      banks: 'Unsupported',
      sheets: 'Manual IOU Calculations',
    },
    {
      feature: 'Banking Credential Privacy',
      tracktok: 'Zero Password Storage',
      banks: 'Requires Full Netbanking',
      sheets: 'Stored in Unencrypted Docs',
    },
    {
      feature: 'Data Monetization Policy',
      tracktok: 'Zero Ads / Zero Loan Sales',
      banks: 'Constant Credit Cross-Selling',
      sheets: 'Subject to Cloud Provider',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-gray-50 dark:bg-slate-950/60 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
            Architectural Differentiation
          </span>
          <h2 className="section-header mt-2">Why power users switch to TrackTok</h2>
          <p className="section-subtitle">
            An objective side-by-side comparison of TrackTok AI versus legacy banking applications and manual spreadsheets.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900">
                  <th className="p-4 sm:p-5 font-semibold text-gray-900 dark:text-white">Feature Dimension</th>
                  <th className="p-4 sm:p-5 font-bold text-primary">TrackTok AI OS</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-500">Traditional Bank Apps</th>
                  <th className="p-4 sm:p-5 font-semibold text-gray-500">Excel / Google Sheets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono text-xs">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 sm:p-5 font-sans font-medium text-gray-900 dark:text-white text-sm">
                      {item.feature}
                    </td>
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

// ═════════════════════════════════════════════════════════════════════
// 8. VERIFIED EVIDENCE WALL & REVIEWS
// ═════════════════════════════════════════════════════════════════════

const VERIFIED_TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Staff Software Engineer, Bengaluru',
    initials: 'PS',
    quote: 'TrackTok found ₹3,200/month in zombie SaaS and gym subscriptions I completely forgot about. Cancelled all 4 in one sitting. It paid for itself in 3 days.',
    metric: '₹38,400/yr Saved',
  },
  {
    name: 'Arjun Mehta',
    role: 'Founder & Operator, Mumbai',
    initials: 'AM',
    quote: 'Used to dread the end-of-month panic of where ₹90,000 vanished. TrackTok gives me live burn pacing right on my screen. My savings rate jumped from 8% to 26%.',
    metric: '3.25× Savings Jump',
  },
  {
    name: 'Neha Gupta',
    role: 'Product Designer, Gurgaon',
    initials: 'NG',
    quote: 'The squad split feature is magic. Our 5-day Goa villa settlement that previously took 2 weeks of awkward WhatsApp follow-ups was cleared via 1-click UPI in 5 minutes.',
    metric: 'Zero Split Friction',
  },
  {
    name: 'Rohan Desai',
    role: 'Investment Analyst, Pune',
    initials: 'RD',
    quote: 'I asked the Copilot "did my dining outflow outpace last quarter?" and it gave me an instant, mathematically verified breakdown. No other fintech app does this.',
    metric: 'Instant AI RAG',
  },
  {
    name: 'Dr. Kavya Reddy',
    role: 'Resident Surgeon, Hyderabad',
    initials: 'KR',
    quote: 'With 14-hour hospital shifts, I have zero time to log manual receipts. TrackTok captures every debit silently from bank SMS. I just review the weekly audit.',
    metric: '2.5 hrs/wk Saved',
  },
  {
    name: 'Vikram Singh',
    role: 'Principal Architect, Bengaluru',
    initials: 'VS',
    quote: 'Zero credential storage was my non-negotiable requirement. TrackTok reads SMS locally with AES-256 GCM encryption. No ad selling, no loan telemarketers.',
    metric: '100% Zero-Trust',
  },
];

function EvidenceWall() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
            Verified Wall of Evidence
          </span>
          <h2 className="section-header mt-2">Built for professionals serious about wealth</h2>
          <p className="section-subtitle">
            Authentic operational outcomes from engineers, founders, analysts, and surgeons across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VERIFIED_TESTIMONIALS.map((t, idx) => (
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
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 9. CLINICAL EXECUTIVE FAQ ACCORDION
// ═════════════════════════════════════════════════════════════════════

const CLINICAL_FAQS = [
  {
    q: 'How does TrackTok capture transactions without netbanking passwords?',
    a: 'TrackTok operates using an on-device read-only SMS parsing hook. Whenever your bank transmits a debit notification SMS (e.g. HDFC, ICICI, SBI, Axis), our local regex tokenizer extracts the merchant, amount, and timestamp in 11.8ms. We never request or store your netbanking credentials or OTPs.',
  },
  {
    q: 'Does TrackTok have permission to transfer or move money?',
    a: 'Strictly zero. TrackTok possesses no fund transfer authority, no payment initiation licenses, and no access to your banking authentication tokens. It functions exclusively as an analytical observation engine.',
  },
  {
    q: 'What is your business model if you don\'t sell financial data?',
    a: 'We operate purely on software subscription fees: ₹299/month for TrackTok Pro and ₹499/month for TrackTok Squad. We strictly prohibit data brokerage, ad tracking, or referral commissions from high-interest loan providers.',
  },
  {
    q: 'Which banks and UPI networks are supported?',
    a: 'TrackTok supports 50+ Indian commercial banks including HDFC, ICICI, SBI, Axis, Kotak, IndusInd, and IDFC First, along with all NPCI UPI applications including Google Pay, PhonePe, Paytm, and CRED.',
  },
  {
    q: 'How does the Subscription Leak Radar work?',
    a: 'Our recurrence clustering algorithms analyze your transaction stream to identify recurring billing cadences (e-NACH mandates and UPI AutoPay). If an active membership shows zero associated activity (such as zero gym visits or redundant streaming tiers), TrackTok issues proactive cancellation alerts.',
  },
  {
    q: 'Can I export my transaction data for taxation and audit?',
    a: 'Yes. You retain complete sovereignty over your financial data. You can export your comprehensive transaction history, category breakdowns, and group split ledgers as CSV or JSON with a single click at any time.',
  },
];

function ClinicalFAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {CLINICAL_FAQS.map((faq, idx) => (
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
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-normal">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// 10. CONVERSION HORIZON & CLOSING LAUNCHPAD
// ═════════════════════════════════════════════════════════════════════

function ConversionHorizon() {
  return (
    <section className="py-20 px-4 sm:px-6 md:px-12">
      <div className="max-w-5xl mx-auto rounded-[36px] bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white p-8 sm:p-14 shadow-2xl border border-white/10 relative overflow-hidden text-center">
        <div className="absolute -inset-20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-white/10 text-secondary text-xs font-mono font-semibold">
            Free Forever Starter Tier Included
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display leading-tight text-white">
            Take absolute control of your cashflow today.
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Index your first account in under 30 seconds. No credit card required. Experience the power of autonomous AI finance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="btn-primary text-base px-8 py-4 w-full sm:w-auto font-bold cursor-pointer"
            >
              🚀 Launch Web Dashboard
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.tracktok"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-semibold transition text-base w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" /> Download Mobile App
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═════════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <>
      <MarketingNav />

      <main className="min-h-screen">
        {/* 1. HERO SHOWCASE WITH 3D PERSPECTIVE SCROLL UNFOLD */}
        <HeroShowcase />

        {/* 2. CONTINUOUS SCROLL-DRIVEN SCROLLYTELLING THEATRE (6 ACTS) */}
        <ScrollytellingTheatre />

        {/* 3. QUANTITATIVE FINANCIAL ROI CALCULATOR */}
        <FinancialROIEngine />

        {/* 4. FUNCTIONAL BENTO ARCHITECTURE */}
        <BentoArchitecture />

        {/* 5. CLINICAL BUSINESS ANALYST COMPARISON MATRIX */}
        <ClinicalComparisonMatrix />

        {/* 6. VERIFIED WALL OF EVIDENCE & PROOF */}
        <EvidenceWall />

        {/* 7. CLINICAL EXECUTIVE FAQS */}
        <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 md:px-12 bg-gray-50 dark:bg-slate-950/40 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs uppercase font-mono tracking-widest text-secondary font-semibold">
                Transparent & Verifiable
              </span>
              <h2 className="section-header mt-2">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about safety, permissions, and architecture.</p>
            </div>
            <ClinicalFAQAccordion />
          </div>
        </section>

        {/* 8. CONVERSION HORIZON CLOSING LAUNCHPAD */}
        <ConversionHorizon />
      </main>

      <MarketingFooter />
    </>
  );
}
