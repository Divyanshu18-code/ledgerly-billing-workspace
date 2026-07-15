import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$12,450.00',
      change: '+14.2% from last month',
      isPositive: true,
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Outstanding Dues',
      value: '$3,890.00',
      change: '-5.1% improvement',
      isPositive: true,
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Active Invoices',
      value: '18 Invoiced',
      change: '+3 new this week',
      isPositive: true,
      icon: FileSpreadsheet,
      color: 'text-violet-500 bg-violet-500/10',
    },
    {
      title: 'Monthly Expenses',
      value: '$2,140.00',
      change: '+8.3% increase',
      isPositive: false,
      icon: TrendingDown,
      color: 'text-rose-500 bg-rose-500/10',
    },
  ];

  const recentActivity = [
    { id: 1, text: 'Acme Corp paid Invoice #INV-2026-012', time: '2 hours ago', amount: '+$1,200.00' },
    { id: 2, text: 'Created Invoice #INV-2026-015 for TechLabs', time: '5 hours ago', amount: '$450.00' },
    { id: 3, text: 'Added new physical product: Server Hub v2', time: '1 day ago', amount: null },
    { id: 4, text: 'Logged server hosting expense payment', time: '2 days ago', amount: '-$120.00' },
    { id: 5, text: 'Client registration complete: Global Retail', time: '3 days ago', amount: null },
  ];

  return (
    <div className="relative overflow-hidden space-y-8">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121115]/60 backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white">
            Welcome Back, {user?.firstName || 'Divyanshu'}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg">
            Here's a quick summary of your active workspace's financial activities and invoice collections status.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/clients')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition text-sm font-semibold cursor-pointer"
          >
            <Users className="h-4 w-4" />
            Clients
          </button>
          <button
            onClick={() => navigate('/products')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-50 hover:to-indigo-500 text-white transition text-sm font-semibold cursor-pointer shadow-lg shadow-violet-500/10"
          >
            <Package className="h-4 w-4" />
            Products
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121115]/60 backdrop-blur-md flex flex-col justify-between hover:border-violet-500/30 dark:hover:border-violet-500/30 transition shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`p-2 rounded-lg ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-heading tracking-tight">
                  {m.value}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <span className={m.isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {m.change.split(' ')[0]}
                  </span>
                  <span className="text-gray-400 dark:text-gray-500">
                    {m.change.substring(m.change.indexOf(' '))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections: Revenue Chart & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Placeholder */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121115]/60 backdrop-blur-md flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Financial Growth</h2>
              <p className="text-xs text-gray-400">Monthly gross revenues breakdown</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/10 text-violet-600 dark:text-violet-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+14.2% Growth</span>
            </div>
          </div>

          {/* SVG Visual Graph mimicry */}
          <div className="h-56 w-full flex items-end justify-between relative mt-4">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200 dark:border-white/5" />
            <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-gray-200 dark:border-white/5" />
            <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-gray-200 dark:border-white/5" />

            {/* Custom SVG line */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124, 58, 237)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="rgb(124, 58, 237)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Glow Area */}
              <path
                d="M 0 160 Q 100 120 200 140 T 400 90 T 600 60 T 800 110 L 800 224 L 0 224 Z"
                fill="url(#chartGlow)"
                className="w-full"
              />
              {/* Main stroke */}
              <path
                d="M 0 160 Q 100 120 200 140 T 400 90 T 600 60 T 800 110"
                fill="none"
                stroke="rgb(139, 92, 246)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="w-full"
              />
            </svg>

            {/* Bottom labels */}
            <div className="absolute bottom-[-24px] inset-x-0 flex justify-between text-[10px] text-gray-400 tracking-wider font-semibold uppercase">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Recent Activities Panel */}
        <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121115]/60 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-heading mb-1">Recent Activity</h2>
            <p className="text-xs text-gray-400 mb-6">Real-time workspace activity feed</p>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex justify-between items-start text-xs border-b border-gray-150 dark:border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1 pr-4">
                    <p className="text-gray-800 dark:text-gray-300 font-medium leading-tight">
                      {activity.text}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 block">{activity.time}</span>
                  </div>
                  {activity.amount && (
                    <span className={`font-bold font-heading whitespace-nowrap ${
                      activity.amount.startsWith('+') ? 'text-emerald-500' : 'text-gray-900 dark:text-white'
                    }`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/clients')}
            className="w-full mt-6 py-2 rounded-lg border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>View All Ledger Logs</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
