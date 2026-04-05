"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, 
  BarChart3, 
  Tag, 
  StickyNote, 
  Users, 
  MapPin, 
  Wallet, 
  Calendar, 
  MessageSquare, 
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const features = [
  {
    title: "Auto-detect Transactions",
    description: "Automatically tracks your spending from SMS notifications and bank alerts without any manual input.",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "AI-Powered Spend Analytics",
    description: "Deep insights into your financial health with AI-driven charts and trend analysis.",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Smart Categorization",
    description: "Categorizes every transaction instantly into buckets like Food, Shopping, Bills, and more.",
    icon: Tag,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Add Notes to Transactions",
    description: "Personalize your records by adding quick notes or tags to any transaction.",
    icon: StickyNote,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Track Shared Expenses",
    description: "Divide and track costs with friends or family effortlessly.",
    icon: Users,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    title: "Location Insights",
    description: "See where you spend the most with interactive maps and location-based history.",
    icon: MapPin,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "Supports Multiple Accounts",
    description: "Manage all your bank accounts and credit cards in one unified dashboard.",
    icon: Wallet,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Flexible Time Filters",
    description: "Analyze your data by day, week, month, or custom periods with ease.",
    icon: Calendar,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    title: "Chat-Based Reports",
    description: "Ask our AI bot about your spending and get instant natural language reports.",
    icon: MessageSquare,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Privacy-First Design",
    description: "Your data stays encrypted. We prioritize your privacy above everything else.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen Selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass dark:dark-glass border-b border-white/10 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary dark:text-white">TrackTok</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="px-5 py-2.5 rounded-full font-medium text-text-secondary dark:text-text-light/70 hover:text-primary dark:hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/dashboard" className="px-6 py-2.5 bg-primary text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-md active:scale-95">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-3xl opacity-50" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary dark:text-primary-light text-sm font-bold rounded-full mb-6 tracking-wide uppercase">
            Track Everything
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-primary-dark dark:from-white dark:to-gray-400">
            Your Spending <br />
            <span className="text-primary dark:text-primary-light">at a Glance</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary dark:text-text-light/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered dashboard that shows how, where, and when you spend your money — all in one place, automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group shadow-primary/20">
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="https://play.google.com/store/apps/details?id=com.tracktok" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 dark:border-white/10 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              Google Play
            </a>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-20 max-w-5xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full -z-10 group-hover:bg-primary/30 transition-all duration-700" />
          <div className="bg-white dark:bg-[#1C1E26] rounded-3xl p-4 shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden aspect-video flex flex-col items-center justify-center text-gray-400">
             <div className="flex flex-col items-center gap-4">
               <Wallet className="w-16 h-16 text-primary/20" />
               <p className="text-lg font-medium">App Dashboard Mockup</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful AI Features</h2>
            <p className="text-xl text-text-secondary dark:text-text-light/60">Everything you need to master your personal finances.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-[#1F222A] p-8 rounded-[2.5rem] card-shadow border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all group"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg)}>
                  <feature.icon className={cn("w-7 h-7", feature.color)} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-text-secondary dark:text-text-light/60 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10 leading-tight">
            Stop guessing. <br />
            Start tracking.
          </h2>
          <p className="text-white/80 text-xl md:text-2xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">
            Join thousands of users who simplified their finances with TrackTok.
          </p>
          <div className="flex justify-center flex-wrap gap-4 relative z-10">
            <Link href="/dashboard" className="px-10 py-5 bg-white text-primary rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all">
              Launch Web Dashboard
            </Link>
            <a href="https://play.google.com/store/apps/details?id=com.tracktok" className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
              Download on Mobile
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-primary dark:text-white">TrackTok</span>
          </div>
          <p className="text-text-secondary dark:text-text-light/40 font-medium">
            © 2026 TrackTok AI. Build with ❤️ for Financial Freedom.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-text-secondary dark:text-text-light/40 hover:text-primary transition-colors font-medium">Privacy</a>
            <a href="#" className="text-text-secondary dark:text-text-light/40 hover:text-primary transition-colors font-medium">Terms</a>
            <a href="#" className="text-text-secondary dark:text-text-light/40 hover:text-primary transition-colors font-medium">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
