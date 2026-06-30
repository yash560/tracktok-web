"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, TrendingUp, Navigation, BarChart3 } from 'lucide-react';

const locations = [
  { city: 'Bengaluru', spent: '₹18,400', pct: 38, color: 'bg-violet-500', emoji: '🌆' },
  { city: 'Mumbai', spent: '₹12,200', pct: 25, color: 'bg-blue-500', emoji: '🏙️' },
  { city: 'Goa', spent: '₹9,600', pct: 20, color: 'bg-emerald-500', emoji: '🏖️' },
  { city: 'Delhi', spent: '₹5,800', pct: 12, color: 'bg-orange-500', emoji: '🕌' },
  { city: 'Hyderabad', spent: '₹2,750', pct: 5, color: 'bg-pink-500', emoji: '🏛️' },
];

const hotspots = [
  { name: 'Indiranagar, Bengaluru', amount: '₹8,200', category: 'Food & Bars', visits: 24, color: 'from-violet-500 to-purple-600' },
  { name: 'Bandra, Mumbai', amount: '₹5,600', category: 'Shopping', visits: 8, color: 'from-blue-500 to-cyan-500' },
  { name: 'Calangute, Goa', amount: '₹9,600', category: 'Hotels & Activities', visits: 5, color: 'from-emerald-500 to-teal-500' },
];

function LocationMockup() {
  return (
    <div className="rounded-[32px] bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Map placeholder */}
      <div className="relative h-52 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {/* Fake map grid */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Fake road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="80" x2="400" y2="80" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="0" y1="140" x2="400" y2="140" stroke="#94a3b8" strokeWidth="1" />
          <line x1="120" y1="0" x2="120" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="260" y1="0" x2="260" y2="200" stroke="#94a3b8" strokeWidth="1" />
        </svg>
        {/* Spending hotspot dots */}
        {[
          { x: '30%', y: '45%', size: 'w-10 h-10', color: 'bg-violet-500', label: 'Indiranagar', amount: '₹8.2K' },
          { x: '60%', y: '65%', size: 'w-7 h-7', color: 'bg-blue-500', label: 'Koramangala', amount: '₹5.1K' },
          { x: '75%', y: '30%', size: 'w-5 h-5', color: 'bg-emerald-500', label: 'HSR Layout', amount: '₹2.8K' },
        ].map((dot, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.2, type: 'spring' }}
            className="absolute"
            style={{ left: dot.x, top: dot.y, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`${dot.size} rounded-full ${dot.color} opacity-30 animate-pulse`} />
            <div className={`absolute inset-0 flex items-center justify-center`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-dark-card rounded-lg px-2 py-1 shadow-lg">
              <p className="text-[9px] font-bold text-gray-900 dark:text-white">{dot.label}</p>
              <p className="text-[8px] text-gray-400">{dot.amount}</p>
            </div>
          </motion.div>
        ))}
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm">
          Bengaluru spending map
        </div>
      </div>

      {/* City breakdown */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Top cities this month</p>
          <span className="text-xs text-gray-400">June 2026</span>
        </div>
        <div className="space-y-3">
          {locations.map((loc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg">{loc.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{loc.city}</span>
                  <span className="text-gray-500">{loc.spent}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${loc.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full rounded-full ${loc.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LocationInsightsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50/30 to-transparent dark:from-red-950/20 dark:via-transparent -z-10" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-20 right-0 w-96 h-96 rounded-full bg-red-300/15 blur-3xl -z-10"
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-semibold mb-6">
                <MapPin className="w-4 h-4" /> Where You Spend
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                Your spending,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                  on the map.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Discover which neighborhoods, cities, and places drain your wallet the most. Location insights turn your spending patterns into a visual story you can actually act on.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'See spending hotspots in your city',
                  'Compare spend across multiple cities',
                  'Identify expensive habitual locations',
                  'Set location-based budgets',
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-3 h-3 text-red-500" />
                    </div>
                    {point}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5 group">
                Explore Your Map <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <LocationMockup />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spending hotspots */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-gray-900 dark:text-white mb-4">
              Your top spending spots
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Every merchant tagged with its location so you can see your money moves on the map.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {hotspots.map((spot, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-[28px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className={`h-2 bg-gradient-to-r ${spot.color}`} />
                <div className="bg-white dark:bg-dark-card p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${spot.color} flex items-center justify-center flex-shrink-0`}>
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{spot.name}</p>
                      <p className="text-xs text-gray-500">{spot.category}</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white">{spot.amount}</p>
                      <p className="text-xs text-gray-400">{spot.visits} visits this month</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 md:px-12 bg-gradient-to-b from-transparent via-red-50/50 dark:via-red-950/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Navigation, title: 'Auto-tagged by merchant', desc: 'We map every merchant to its real-world location using our Indian merchant database.', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
              { icon: MapPin, title: 'Heatmap view', desc: 'See intensity clusters on a map - darker areas mean heavier spending in that zone.', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
              { icon: BarChart3, title: 'City comparisons', desc: 'Traveling between cities? See how your spending behavior changes location to location.', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-[32px] bg-gradient-to-br from-red-500 to-orange-500 p-10 sm:p-14 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-4">Know every spending hotspot</h2>
            <p className="text-red-100 mb-8 text-lg">See your money on the map and make smarter choices.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-8 py-3.5 rounded-2xl hover:bg-red-50 transition-colors text-base shadow-lg">
              Open My Map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
