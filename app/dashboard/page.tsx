"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Home, 
  List, 
  User, 
  ArrowDown, 
  ArrowUp, 
  MoreHorizontal, 
  Search, 
  Bell,
  LayoutDashboard,
  Wallet,
  Settings,
  HelpCircle,
  Menu,
  X,
  Plus
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const chartData = [
  { name: "Week 1", value: 12000 },
  { name: "Week 2", value: 18000 },
  { name: "Week 3", value: 24610 },
  { name: "Week 4", value: 15000 },
];

const categories = [
  { 
    name: "Shopping", 
    amount: 16587.32, 
    change: "+427.20%", 
    color: "bg-pink-500", 
    icon: "🛍️",
    trend: "up" 
  },
  { 
    name: "Food", 
    amount: 6563.32, 
    change: "+11.16%", 
    color: "bg-orange-500", 
    icon: "🍔",
    trend: "up" 
  },
  { 
    name: "Transfer", 
    amount: 5819.00, 
    change: "+307.80%", 
    color: "bg-blue-500", 
    icon: "🏦",
    trend: "up" 
  },
  { 
    name: "Bills", 
    amount: 4256.40, 
    change: "-12.30%", 
    color: "bg-green-500", 
    icon: "📄",
    trend: "down" 
  },
  { 
    name: "Rent", 
    amount: 12000.00, 
    change: "0.00%", 
    color: "bg-purple-500", 
    icon: "🏠",
    trend: "stable" 
  },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTransactions(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F9FE] dark:bg-[#181A20] text-text-main dark:text-text-light font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#1F222A] border-r border-gray-100 dark:border-white/5 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary dark:text-white">TrackTok</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Overview" active />
          <SidebarItem icon={List} label="Transactions" />
          <SidebarItem icon={Wallet} label="Budgets" />
          <SidebarItem icon={User} label="Profile" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto p-4 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/10 dark:border-white/10">
          <div className="flex items-center gap-3 mb-3">
             <HelpCircle className="w-5 h-5 text-primary dark:text-primary-light" />
             <span className="font-bold">Need Help?</span>
          </div>
          <p className="text-xs text-text-secondary dark:text-gray-400 mb-3 font-medium">Read our guides or contact support.</p>
          <button className="w-full py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            Get Support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#181A20]/80 backdrop-blur-md px-6 md:px-12 py-5 flex justify-between items-center border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                <Menu className="w-6 h-6" />
             </button>
             <h1 className="text-2xl font-bold">Hello, Yash Jain 👋</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 border border-transparent focus-within:border-primary/30 transition-all">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search transactions..." className="bg-transparent border-none focus:outline-none px-2 text-sm w-48 font-medium" />
             </div>
             <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#1F222A] rounded-full" />
             </button>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-light border-2 border-white dark:border-[#1F222A] shadow-md" />
          </div>
        </header>

        <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Summary & Chart */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* Summary Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2F2E51] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/30"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-white/60 font-bold uppercase tracking-widest text-xs">This period</span>
                       <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold">JUN 2025</span>
                    </div>
                    <div className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">₹52361.20</div>
                    <div className="flex items-center gap-2 text-white/80 font-bold text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full">
                       <ArrowDown className="w-4 h-4 text-red-400" />
                       <span>Percentage Decrease: <span className="text-red-400">47%</span></span>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2">
                     <button className="flex-1 md:flex-none px-6 py-3 bg-white text-primary rounded-2xl font-bold shadow-lg hover:scale-105 transition-all text-sm">
                        Add Expense
                     </button>
                     <button className="flex-1 md:flex-none px-6 py-3 bg-white/20 text-white rounded-2xl font-bold hover:bg-white/30 transition-all text-sm">
                        Export Report
                     </button>
                  </div>
                </div>
              </motion.div>

              {/* Chart Section */}
              <div className="bg-white dark:bg-[#1F222A] rounded-[2.5rem] p-8 md:p-10 card-shadow border border-gray-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Spending Overview</h2>
                    <p className="text-sm text-text-secondary dark:text-gray-400 font-medium">Weekly comparison of your expenses.</p>
                  </div>
                  <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all">Day</button>
                    <button className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-white/10 rounded-lg shadow-sm">Week</button>
                    <button className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all">Month</button>
                    <button className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all">Year</button>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2F2E51" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2F2E51" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" opacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#888' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#888' }} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontWeight: 'bold',
                            backgroundColor: '#fff'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2F2E51" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                          dot={{ r: 6, fill: '#fff', stroke: '#2F2E51', strokeWidth: 3 }}
                        />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column - Categorized Spends */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-[#1F222A] rounded-[2.5rem] p-8 md:p-10 card-shadow border border-gray-100 dark:border-white/5 h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">Categorized Spends</h2>
                  <button className="text-sm font-bold text-primary dark:text-primary-light hover:underline">See All</button>
                </div>

                <div className="space-y-6">
                  {categories.map((category, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110", category.color + "/10")}>
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-bold text-base mb-0.5">{category.name}</p>
                          <p className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full w-fit", 
                             category.trend === "up" ? "text-red-500 bg-red-500/10" : "text-green-500 bg-green-500/10"
                          )}>
                            {category.change}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base">₹{category.amount.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] text-text-secondary dark:text-gray-400 font-bold uppercase tracking-wider">12 Transactions</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-dashed border-gray-200 dark:border-gray-700">
                   <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                         <Plus className="w-6 h-6 text-primary" />
                      </div>
                   </div>
                   <p className="text-center font-bold mb-1">New Category?</p>
                   <p className="text-center text-xs text-text-secondary dark:text-gray-400 font-medium">Add a custom category to track specific expenses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start">
           <motion.aside 
             initial={{ x: -300 }}
             animate={{ x: 0 }}
             className="w-72 bg-white dark:bg-[#1F222A] p-6 h-full shadow-2xl"
           >
             <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">T</div>
                 <span className="text-xl font-bold">TrackTok</span>
               </div>
               <button onClick={() => setSidebarOpen(false)} className="p-1">
                 <X className="w-6 h-6" />
               </button>
             </div>
             <nav className="space-y-4">
              <SidebarItem icon={LayoutDashboard} label="Overview" active onClick={() => setSidebarOpen(false)} />
              <SidebarItem icon={List} label="Transactions" onClick={() => setSidebarOpen(false)} />
              <SidebarItem icon={Wallet} label="Budgets" onClick={() => setSidebarOpen(false)} />
              <SidebarItem icon={User} label="Profile" onClick={() => setSidebarOpen(false)} />
              <SidebarItem icon={Settings} label="Settings" onClick={() => setSidebarOpen(false)} />
             </nav>
           </motion.aside>
           <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-text-secondary dark:text-gray-400 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-white" : "text-inherit")} />
      {label}
    </button>
  );
}
