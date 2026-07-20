import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import { useClientsQuery } from '@/modules/clients/hooks/useClients';
import { useProductsQuery } from '@/modules/products/hooks/useProducts';
import {
  Users,
  RefreshCw,
  Plus,
  DollarSign,
  FileSpreadsheet,
  TrendingDown,
  Clock,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: workspace } = useWorkspaceData();
  const { data: clients } = useClientsQuery();
  const { data: products } = useProductsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';
  
  const totalClientsCount = clients?.pagination?.total ?? (Array.isArray(clients) ? clients.length : 5);
  const totalProductsCount = products?.pagination?.totalItems ?? (Array.isArray(products) ? (products as any[]).length : 12);

  const metrics = [
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${workspace?.currency === 'INR' ? '1,24,500' : '12,450'}.00`,
      description: 'Paid invoice collections',
      icon: DollarSign,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Outstanding Dues',
      value: `${currencySymbol}${workspace?.currency === 'INR' ? '38,900' : '3,890'}.00`,
      description: 'Unpaid pending invoices',
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Active Invoices',
      value: '18 Invoiced',
      description: 'Billed this month',
      icon: FileSpreadsheet,
      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Monthly Expenses',
      value: `${currencySymbol}${workspace?.currency === 'INR' ? '21,400' : '2,140'}.00`,
      description: 'Logged company costs',
      icon: TrendingDown,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Active Directory',
      value: `${totalClientsCount} Clients`,
      description: `and ${totalProductsCount} items registered`,
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <div className="relative overflow-hidden space-y-6">
      {/* Background radial glow mimics CRM page */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Welcome & Action Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white">
            Welcome back, {user?.firstName || 'Divyanshu'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Here's a global overview of Ledgerly billing & invoice collections metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-55 dark:hover:bg-white/10 transition text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => alert('Fast invoice builder is ready.')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (5 Invoicing Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`p-2 rounded-xl border ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                  {m.value}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  {m.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue SVG Line Chart */}
      <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="space-y-1 mb-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Invoiced Revenue</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly gross billing volumes across all active clients</p>
        </div>

        {/* Responsive Line Chart SVG representation */}
        <div className="h-64 w-full flex items-end justify-between relative mt-6 pb-6">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-100 dark:border-white/5" />
          <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-100 dark:border-white/5" />
          <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-100 dark:border-white/5" />
          <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-100 dark:border-white/5" />

          {/* SVG graphic */}
          <svg className="absolute inset-x-0 top-0 h-48 w-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(37, 99, 235, 0.12)" />
                <stop offset="100%" stopColor="rgba(37, 99, 235, 0.0)" />
              </linearGradient>
            </defs>
            {/* Chart Area glow */}
            <path
              d="M 0 192 L 0 170 C 150 170, 200 120, 350 120 C 500 120, 550 50, 700 50 L 900 50 L 900 192 Z"
              fill="url(#revenueGlow)"
              className="w-full"
            />
            {/* Chart Line stroke */}
            <path
              d="M 0 170 C 150 170, 200 120, 350 120 C 500 120, 550 50, 700 50 L 900 50"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
              className="w-full"
            />
            {/* Glowing dots */}
            <circle cx="350" cy="120" r="5" fill="#2563eb" className="animate-pulse" />
            <circle cx="700" cy="50" r="5" fill="#38bdf8" className="animate-pulse" />
          </svg>

          {/* Bottom labels */}
          <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] text-gray-455 dark:text-gray-500 font-bold uppercase tracking-wider">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>
      </div>

      {/* Two columns below the chart (Invoice Breakdown & Cashflow Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice status Breakdown Card */}
        <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card/60 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Invoice Status Breakdown</h2>
            <p className="text-xs text-gray-400 dark:text-gray-550">Outstanding and paid invoice shares</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Chart */}
            <div className="relative h-40 w-40 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                {/* Circle Segment 1: Paid (Blue) - 65% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2563eb" strokeWidth="3.2" strokeDasharray="65 100" strokeDashoffset="0" />
                {/* Circle Segment 2: Pending (Sky) - 25% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeDasharray="25 100" strokeDashoffset="-65" />
                {/* Circle Segment 3: Overdue (Indigo) - 10% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#6366f1" strokeWidth="3.2" strokeDasharray="10 100" strokeDashoffset="-90" />
              </svg>
              {/* Inner content */}
              <div className="text-center space-y-0.5">
                <span className="text-2xl font-black text-gray-900 dark:text-white font-heading">18</span>
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest">Invoices</p>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Paid Invoices (65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pending Dues (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overdue (10%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow Comparison Card */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-between">
          <div className="space-y-1 mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Cashflow Comparison</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cash Inflows (Paid Invoices) vs. Operating Costs (Logged Expenses) month-over-month</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-4">
            {/* SVG Comparison Graph */}
            <div className="h-32 w-full flex items-end justify-between relative px-4 border-b border-gray-100 dark:border-white/5 pb-1">
              {/* Grid guide */}
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-100 dark:border-white/5" />
              
              {/* Bars representation */}
              <div className="flex flex-col items-center gap-1.5 w-12">
                <div className="flex gap-1 h-20 items-end">
                  <div className="w-3.5 bg-blue-600 rounded-t h-12" />
                  <div className="w-3.5 bg-indigo-500/40 rounded-t h-4" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Feb</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-12">
                <div className="flex gap-1 h-20 items-end">
                  <div className="w-3.5 bg-blue-600 rounded-t h-16" />
                  <div className="w-3.5 bg-indigo-500/40 rounded-t h-6" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mar</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-12">
                <div className="flex gap-1 h-20 items-end">
                  <div className="w-3.5 bg-blue-600 rounded-t h-20" />
                  <div className="w-3.5 bg-indigo-500/40 rounded-t h-8" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Apr</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-12">
                <div className="flex gap-1 h-20 items-end">
                  <div className="w-3.5 bg-blue-600 rounded-t h-14" />
                  <div className="w-3.5 bg-indigo-500/40 rounded-t h-10" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">May</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 w-12">
                <div className="flex gap-1 h-20 items-end">
                  <div className="w-3.5 bg-blue-600 rounded-t h-24" />
                  <div className="w-3.5 bg-indigo-500/40 rounded-t h-6" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Jun</span>
              </div>
            </div>

            {/* Legend tags */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">Cash Inflows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-indigo-500/40" />
                <span className="text-gray-700 dark:text-gray-300">Operating Costs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
