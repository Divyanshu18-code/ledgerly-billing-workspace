import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import { useClientsQuery } from '@/modules/clients/hooks/useClients';
import { useProductsQuery } from '@/modules/products/hooks/useProducts';
import { useInvoicesQuery } from '@/modules/invoices/hooks/useInvoices';
import { useQuotationsQuery } from '@/modules/quotations/hooks/useQuotations';
import {
  Users,
  RefreshCw,
  Plus,
  DollarSign,
  FileSpreadsheet,
  Clock,
  FileText,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: workspace } = useWorkspaceData();
  const { data: clientsData, refetch: refetchClients } = useClientsQuery({ limit: 100 });
  const { data: productsData, refetch: refetchProducts } = useProductsQuery({ limit: 100 });
  const { data: invoicesData, refetch: refetchInvoices } = useInvoicesQuery({ limit: 100 });
  const { data: quotationsData, refetch: refetchQuotations } = useQuotationsQuery({ limit: 100 });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchClients(),
      refetchProducts(),
      refetchInvoices(),
      refetchQuotations(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const clients = (clientsData?.clients || (clientsData as any)?.data || []) as any[];
  const products = (productsData?.items || (productsData as any)?.data || []) as any[];
  const invoices = (invoicesData?.data || (invoicesData as any)?.invoices || []) as any[];
  const quotations = (quotationsData?.data || (quotationsData as any)?.quotations || []) as any[];

  const totalClientsCount = clientsData?.pagination?.total ?? clients.length;
  const totalProductsCount = productsData?.pagination?.totalItems ?? products.length;
  const totalInvoicesCount = (invoicesData as any)?.pagination?.total ?? invoicesData?.pagination?.totalItems ?? invoices.length;
  const totalQuotationsCount = quotationsData?.pagination?.totalItems ?? (quotationsData as any)?.pagination?.total ?? quotations.length;

  const paidInvoices = invoices.filter((i) => i.status === 'PAID');
  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
  const pendingInvoices = invoices.filter((i) => i.status === 'SENT' || i.status === 'DRAFT' || i.status === 'PARTIALLY_PAID');

  const totalRevenueCollected = paidInvoices.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  const totalOutstandingDues = unpaidInvoices.reduce((sum, i) => sum + Number(i.balanceDue || i.grandTotal || 0), 0);

  const paidCount = paidInvoices.length;
  const pendingCount = pendingInvoices.length;
  const overdueCount = overdueInvoices.length;

  const paidPct = totalInvoicesCount > 0 ? Math.round((paidCount / totalInvoicesCount) * 100) : 0;
  const pendingPct = totalInvoicesCount > 0 ? Math.round((pendingCount / totalInvoicesCount) * 100) : 0;
  const overduePct = totalInvoicesCount > 0 ? Math.max(0, 100 - paidPct - pendingPct) : 0;

  // Calculate Monthly Invoiced Revenue for full 12 months (Jan - Dec of current year)
  const getMonthlyRevenueData = () => {
    const currentYear = new Date().getFullYear();
    const monthsList: { label: string; year: number; month: number; total: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1);
      monthsList.push({
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: currentYear,
        month: i,
        total: 0,
      });
    }

    invoices.forEach((inv) => {
      if (!inv.issueDate) return;
      const invDate = new Date(inv.issueDate);
      if (invDate.getFullYear() === currentYear) {
        const match = monthsList.find((m) => m.month === invDate.getMonth());
        if (match) {
          match.total += Number(inv.grandTotal || 0);
        }
      }
    });

    const maxTotal = Math.max(...monthsList.map((m) => m.total), 1);
    return { monthsList, maxTotal };
  };

  const { monthsList, maxTotal } = getMonthlyRevenueData();

  // Dynamic SVG Curve Points
  const points = monthsList.map((m, idx) => {
    const x = (idx / (monthsList.length - 1)) * 900 + 50;
    const y = 160 - (m.total / maxTotal) * 120;
    return { x, y, label: m.label, total: m.total };
  });

  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2;
      const cp2y = next.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
    : '';

  const metrics = [
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${totalRevenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: 'Paid invoice collections',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Outstanding Dues',
      value: `${currencySymbol}${totalOutstandingDues.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: 'Unpaid pending invoices',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Active Invoices',
      value: `${totalInvoicesCount} Invoiced`,
      description: `${paidCount} Paid • ${unpaidInvoices.length} Pending`,
      icon: FileSpreadsheet,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Quotations',
      value: `${totalQuotationsCount} Proposals`,
      description: 'Logged estimate proposals',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Active Directory',
      value: `${totalClientsCount} Clients`,
      description: `and ${totalProductsCount} items registered`,
      icon: Users,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
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
            onClick={() => navigate('/invoices/new')}
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

      {/* Live Invoiced Revenue Chart matching screenshot 1:1 */}
      <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Invoiced Revenue</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Monthly billing trends and revenue performance</p>
          </div>
        </div>

        <div className="relative h-64 w-full flex">
          {/* Left Y-Axis Scale Values matching screenshot */}
          <div className="w-12 h-48 flex flex-col justify-between text-[11px] font-mono text-gray-400 dark:text-gray-500 pr-2 pt-0.5 pb-0.5 text-right select-none shrink-0">
            <span>{Math.round(maxTotal)}</span>
            <span>{Math.round(maxTotal * 0.75)}</span>
            <span>{Math.round(maxTotal * 0.5)}</span>
            <span>{Math.round(maxTotal * 0.25)}</span>
            <span>0</span>
          </div>

          {/* SVG & Chart Content Area */}
          <div className="relative flex-1 h-64">
            {/* Horizontal Dashed Grid Lines */}
            <div className="absolute inset-x-0 top-1 border-t border-dashed border-gray-200/40 dark:border-white/5" />
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
            <div className="absolute inset-x-0 bottom-8 border-t border-solid border-gray-300/60 dark:border-white/10" />

            {/* Dynamic SVG graphic */}
            <svg className="absolute inset-x-0 top-1 h-48 w-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(249, 115, 22, 0.35)" />
                  <stop offset="100%" stopColor="rgba(249, 115, 22, 0.0)" />
                </linearGradient>
              </defs>

              {/* Dynamic Glowing Orange Area fill */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#orangeGlow)"
                  className="w-full transition-all duration-700"
                />
              )}

              {/* Dynamic Smooth Orange Line stroke */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="w-full transition-all duration-700"
                />
              )}

              {/* Dynamic Data Points & Vertical Guide Lines */}
              {points.map((pt, idx) => (
                <g key={idx} className="group/pt cursor-pointer">
                  {/* Vertical Guide Line on Hover */}
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x}
                    y2={190}
                    stroke="#f97316"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-0 group-hover/pt:opacity-100 transition-opacity"
                  />
                  {/* Glowing Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? 6 : 4}
                    fill="#ffffff"
                    stroke="#f97316"
                    strokeWidth="3"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="transition-all duration-200"
                  />
                </g>
              ))}
            </svg>

            {/* Floating Hover Card matching screenshot 1:1 */}
            {hoveredPoint !== null && points[hoveredPoint] && (
              <div
                style={{
                  left: `${(hoveredPoint / (points.length - 1)) * 88 + 5}%`,
                  top: `${Math.max(10, (points[hoveredPoint].y / 200) * 100 - 30)}%`,
                }}
                className="absolute z-30 p-2.5 rounded-xl border border-gray-700/80 dark:border-white/15 bg-[#161424] text-white shadow-2xl space-y-0.5 pointer-events-none transform -translate-x-1/2 -translate-y-full backdrop-blur-xl font-sans"
              >
                <div className="text-xs font-bold text-gray-300">{points[hoveredPoint].label}</div>
                <div className="text-xs font-mono font-semibold text-orange-400">
                  value : {points[hoveredPoint].total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </div>
              </div>
            )}

            {/* Bottom Month Labels matching screenshot */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between px-2 text-[11px] text-gray-400 dark:text-gray-400 font-medium">
              {monthsList.map((m) => (
                <span key={`${m.year}-${m.month}`}>{m.label}</span>
              ))}
            </div>
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
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                {/* Circle Segment 1: Paid (Emerald) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.2"
                  strokeDasharray={`${paidPct} 100`}
                  strokeDashoffset="0"
                />
                {/* Circle Segment 2: Pending (Amber) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3.2"
                  strokeDasharray={`${pendingPct} 100`}
                  strokeDashoffset={`-${paidPct}`}
                />
                {/* Circle Segment 3: Overdue (Rose) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.2"
                  strokeDasharray={`${overduePct} 100`}
                  strokeDashoffset={`-${paidPct + pendingPct}`}
                />
              </svg>
              {/* Inner content */}
              <div className="text-center space-y-0.5">
                <span className="text-2xl font-black text-gray-900 dark:text-white font-heading">{totalInvoicesCount}</span>
                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Invoices</p>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Paid Invoices ({paidPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Pending Dues ({pendingPct}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overdue ({overdueCount} Invoices, {overduePct}%)</span>
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
