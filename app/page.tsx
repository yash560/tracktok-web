'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    title: 'Auto-detect Transactions',
    description: 'Automatically tracks your spending from SMS notifications and bank alerts.',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'AI-Powered Analytics',
    description: 'Deep insights into your financial health with AI-driven charts and trends.',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Smart Categorization',
    description: 'Automatically categorizes transactions into Food, Shopping, Bills, and more.',
    icon: Tag,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: 'Add Notes',
    description: 'Personalize your records with quick notes or tags to any transaction.',
    icon: StickyNote,
    color: 'from-orange-500 to-amber-500',
  },
  {
    title: 'Shared Expenses',
    description: 'Divide and track costs with friends or family effortlessly.',
    icon: Users,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Location Insights',
    description: 'See where you spend the most with interactive maps and history.',
    icon: MapPin,
    color: 'from-red-500 to-pink-500',
  },
  {
    title: 'Multiple Accounts',
    description: 'Manage all your bank accounts and credit cards in one dashboard.',
    icon: Wallet,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Flexible Filters',
    description: 'Analyze your data by day, week, month, or custom periods.',
    icon: Calendar,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    title: 'Chat-Based Reports',
    description: 'Ask our AI bot about your spending and get instant insights.',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Privacy-First',
    description: 'Your data stays encrypted. We prioritize your privacy above all.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
  },
];

const benefits = [
  'Real-time expense tracking',
  'Advanced financial analytics',
  'Multi-account support',
  'Secure data encryption',
  'Personalized insights',
  'Export reports',
];

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold font-display text-primary">TrackTok</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden sm:block text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
          </div>
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
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm uppercase tracking-wider mb-6">
            ✨ Track Everything Instantly
          </span>

          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-light to-primary">
            Your Spending at a Glance
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI-powered dashboard that shows how, where, and when you spend your money, all automatically.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-2 group">
              Launch Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.tracktok"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto"
            >
              Download Mobile
            </a>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="glass rounded-3xl p-8 border-white/20 aspect-video flex flex-col items-center justify-center">
            <Wallet className="w-24 h-24 text-primary/20 mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400 font-semibold">Dashboard Preview</p>
            <p className="text-sm text-gray-400 mt-2">Your financial data visualization will appear here</p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="section-header">Powerful AI Features</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              Everything you need to master your personal finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="card group hover:shadow-lg"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="section-header mb-8">Why Choose TrackTok?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="space-y-6">
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">500K+</p>
                  <p className="text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">₹2B+</p>
                  <p className="text-gray-600 dark:text-gray-400">Tracked Transactions</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-primary mb-2">4.8★</p>
                  <p className="text-gray-600 dark:text-gray-400">App Rating</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-r from-primary to-primary-light rounded-3xl p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -ml-48 -mb-48" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">
              Stop guessing. Start tracking.
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join thousands of users who simplified their finances with TrackTok.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:scale-105 transition-transform"
              >
                Get Started Free
              </Link>
              <a
                href="https://play.google.com/store/apps/details?id=com.tracktok"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-lg border border-white/30 transition-all"
              >
                Download App
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold font-display text-primary">TrackTok</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI-powered expense tracking for everyone
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2026 TrackTok AI. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Twitter</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">LinkedIn</a>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
