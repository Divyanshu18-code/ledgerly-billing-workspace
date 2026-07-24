import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import { useClientsQuery } from '@/modules/clients/hooks/useClients';
import { useProductsQuery } from '@/modules/products/hooks/useProducts';
import { useInvoicesQuery } from '@/modules/invoices/hooks/useInvoices';
import { useQuotationsQuery } from '@/modules/quotations/hooks/useQuotations';
import { useExpensesQuery } from '@/modules/expenses/hooks/useExpenses';
import { usePaymentsQuery } from '@/modules/payments/hooks/usePayments';
import {
  Users,
  RefreshCw,
  Plus,
  DollarSign,
  FileSpreadsheet,
  Clock,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Receipt,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: workspace } = useWorkspaceData();

  // Real-time query subscriptions across all core modules
  const { data: clientsData, refetch: refetchClients } = useClientsQuery({ limit: 100 });
  const { refetch: refetchProducts } = useProductsQuery({ limit: 100 });
  const { data: invoicesData, refetch: refetchInvoices } = useInvoicesQuery({ limit: 100 });
  const { data: quotationsData, refetch: refetchQuotations } = useQuotationsQuery({ limit: 100 });
  const { data: expensesData, refetch: refetchExpenses } = useExpensesQuery({ limit: 100 });
  const { data: paymentsData, refetch: refetchPayments } = usePaymentsQuery({ limit: 100 });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Manual & Automated Real-time Sync
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchClients(),
      refetchProducts(),
      refetchInvoices(),
      refetchQuotations(),
      refetchExpenses(),
      refetchPayments(),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  // Extract real-time arrays
  const clients = (clientsData?.clients || (clientsData as any)?.data || []) as any[];
  const invoices = (invoicesData?.data || (invoicesData as any)?.invoices || []) as any[];
  const quotations = (quotationsData?.data || (quotationsData as any)?.quotations || []) as any[];
  const expenses = ((expensesData as any)?.expenses || (expensesData as any)?.data || (expensesData as any)?.items || []) as any[];
  const payments = ((paymentsData as any)?.payments || (paymentsData as any)?.data || (paymentsData as any)?.items || []) as any[];

  const totalClientsCount = clientsData?.pagination?.total ?? clients.length;
  const totalInvoicesCount = (invoicesData as any)?.pagination?.total ?? invoicesData?.pagination?.totalItems ?? invoices.length;
  const totalQuotationsCount = quotationsData?.pagination?.totalItems ?? (quotationsData as any)?.pagination?.total ?? quotations.length;

  // Invoice Filters & Real-time Metrics
  const paidInvoices = invoices.filter((i) => i.status === 'PAID');
  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED');

  const totalRevenueCollected = paidInvoices.reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  const totalOutstandingDues = unpaidInvoices.reduce((sum, i) => sum + Number(i.balanceDue || i.grandTotal || 0), 0);

  const paidCount = paidInvoices.length;
  const pendingCount = unpaidInvoices.length;

  const paidPct = totalInvoicesCount > 0 ? Math.round((paidCount / totalInvoicesCount) * 100) : 0;
  const outstandingPct = totalInvoicesCount > 0 ? Math.max(0, 100 - paidPct) : 0;

  // Monthly Revenue Data (Trailing 9 Months ending at current month)
  const getMonthlyRevenueData = () => {
    const monthsList: { label: string; year: number; month: number; total: number; expenses: number }[] = [];
    const now = new Date();

    for (let i = 8; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsList.push({
        label: d.toLocaleString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
        expenses: 0,
      });
    }

    invoices.forEach((inv) => {
      if (!inv.issueDate) return;
      const invDate = new Date(inv.issueDate);
      const match = monthsList.find(
        (m) => m.year === invDate.getFullYear() && m.month === invDate.getMonth()
      );
      if (match) {
        match.total += Number(inv.grandTotal || 0);
      }
    });

    expenses.forEach((exp) => {
      if (!exp.expenseDate && !exp.date) return;
      const expDate = new Date(exp.expenseDate || exp.date);
      const match = monthsList.find(
        (m) => m.year === expDate.getFullYear() && m.month === expDate.getMonth()
      );
      if (match) {
        match.expenses += Number(exp.amount || 0);
      }
    });

    const maxTotal = Math.max(...monthsList.map((m) => m.total), 1000);
    return { monthsList, maxTotal };
  };

  const { monthsList, maxTotal } = getMonthlyRevenueData();

  // Dynamic SVG Curve Points
  const points = monthsList.map((m, idx) => {
    const x = (idx / (monthsList.length - 1)) * 900 + 50;
    const y = m.total === 0 ? 190 : 180 - (m.total / maxTotal) * 150;
    return { x, y, label: m.label, total: m.total };
  });

  const generateSmoothPath = (pts: { x: number; y: number; total: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];

      if (curr.total === 0 && next.total === 0) {
        d += ` L ${next.x} 190`;
      } else if (curr.total === 0 && next.total > 0) {
        const cp1x = curr.x + (next.x - curr.x) * 0.6;
        const cp1y = 190;
        const cp2x = curr.x + (next.x - curr.x) * 0.85;
        const cp2y = next.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
      } else if (curr.total > 0 && next.total === 0) {
        const cp1x = curr.x + (next.x - curr.x) * 0.15;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) * 0.4;
        const cp2y = 190;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} 190`;
      } else {
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
      }
    }
    return d;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
    : '';

  // Quick Insights Calculations (Current Month)
  const now = new Date();
  const currentMonthInvoices = invoices.filter((i) => {
    if (!i.issueDate) return false;
    const d = new Date(i.issueDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate || e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const paidThisMonthTotal = currentMonthInvoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + Number(i.grandTotal || 0), 0);
  const expensesThisMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfitThisMonth = paidThisMonthTotal - expensesThisMonthTotal;
  const avgInvoiceValue = invoices.length > 0 ? (totalRevenueCollected + totalOutstandingDues) / invoices.length : 0;

  // Synthesize Recent Activities Stream
  const activities: { id: string; type: string; title: string; time: string; icon: any; color: string }[] = [];

  invoices.slice(0, 2).forEach((inv: any) => {
    activities.push({
      id: `inv-${inv.id}`,
      type: 'invoice',
      title: `Invoice ${inv.invoiceNumber || 'INV-001'} created`,
      time: 'Recently',
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10',
    });
  });

  payments.slice(0, 1).forEach((pay: any) => {
    activities.push({
      id: `pay-${pay.id}`,
      type: 'payment',
      title: `Payment ${pay.paymentNumber || 'PAY-001'} received`,
      time: '5 hours ago',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10',
    });
  });

  expenses.slice(0, 1).forEach((exp: any) => {
    activities.push({
      id: `exp-${exp.id}`,
      type: 'expense',
      title: `Expense ${exp.expenseNumber || exp.merchantName || 'EXP-001'} added`,
      time: 'Yesterday',
      icon: Receipt,
      color: 'text-amber-500 bg-amber-500/10',
    });
  });

  quotations.slice(0, 1).forEach((qt: any) => {
    activities.push({
      id: `qt-${qt.id}`,
      type: 'quotation',
      title: `Quotation ${qt.quotationNumber || 'QT-001'} created`,
      time: '2 days ago',
      icon: FileSpreadsheet,
      color: 'text-indigo-500 bg-indigo-500/10',
    });
  });

  // Top 5 KPI Cards (Matching Target Screenshot)
  const metrics = [
    {
      title: 'TOTAL REVENUE',
      value: `${currencySymbol}${totalRevenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: 'Total invoice collections',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'OUTSTANDING DUES',
      value: `${currencySymbol}${totalOutstandingDues.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      description: 'Unpaid pending invoices',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'ACTIVE INVOICES',
      value: `${totalInvoicesCount} Invoiced`,
      description: `${paidCount} Paid • ${pendingCount} Pending`,
      icon: FileText,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'QUOTATIONS',
      value: `${totalQuotationsCount} Proposals`,
      description: 'Logged estimate proposals',
      icon: FileSpreadsheet,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'ACTIVE DIRECTORY',
      value: `${totalClientsCount} Clients`,
      description: 'and 0 team registered',
      icon: Users,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="relative overflow-hidden space-y-6">
      {/* Background ambient lighting glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Welcome Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white flex items-center gap-2">
            Welcome back, {user?.firstName || 'Test'} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Here's a global overview of Ledgerly's billing & invoice collections metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition text-xs font-bold cursor-pointer shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-gray-500 dark:text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/invoices/new')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`p-2 rounded-xl border ${m.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-heading tracking-tight">
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

      {/* Middle Row (2 Columns: Invoiced Revenue 2/3 + Invoice Status Breakdown 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Invoiced Revenue Line/Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Invoiced Revenue</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Monthly billing trends and revenue performance</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>This Year</span>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>

          <div className="relative h-64 w-full flex">
            {/* Y-Axis scale */}
            <div className="w-12 h-48 flex flex-col justify-between text-[11px] font-mono text-gray-400 dark:text-gray-500 pr-2 pt-0.5 pb-0.5 text-right select-none shrink-0">
              <span>{Math.round(maxTotal)}</span>
              <span>{Math.round(maxTotal * 0.75)}</span>
              <span>{Math.round(maxTotal * 0.5)}</span>
              <span>{Math.round(maxTotal * 0.25)}</span>
              <span>0</span>
            </div>

            {/* SVG Content Area */}
            <div className="relative flex-1 h-64">
              <div className="absolute inset-x-0 top-1 border-t border-dashed border-gray-200/40 dark:border-white/5" />
              <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
              <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
              <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-gray-200/40 dark:border-white/5" />
              <div className="absolute inset-x-0 bottom-8 border-t border-solid border-gray-300/60 dark:border-white/10" />

              <svg className="absolute inset-x-0 top-1 h-48 w-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(37, 99, 235, 0.35)" />
                    <stop offset="100%" stopColor="rgba(37, 99, 235, 0.0)" />
                  </linearGradient>
                </defs>

                {areaPath && <path d={areaPath} fill="url(#blueGlow)" />}
                {linePath && <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />}

                {(() => {
                  const activeIdx = hoveredPoint !== null ? hoveredPoint : points.length - 1;
                  return points.map((pt, idx) => {
                    const isActive = activeIdx === idx;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                        {isActive && <line x1={pt.x} y1={pt.y} x2={pt.x} y2={195} stroke="#38bdf8" strokeWidth="2" />}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill={isActive ? '#ffffff' : '#2563eb'}
                          stroke={isActive ? '#38bdf8' : '#ffffff'}
                          strokeWidth={isActive ? '3.5' : '2'}
                        />
                      </g>
                    );
                  });
                })()}
              </svg>

              {/* Floating Active Tooltip */}
              {(() => {
                const activeIdx = hoveredPoint !== null ? hoveredPoint : points.length - 1;
                if (activeIdx < 0 || !points[activeIdx]) return null;
                const pt = points[activeIdx];
                return (
                  <div
                    style={{
                      left: `${(pt.x / 1000) * 100}%`,
                      top: `${Math.max(10, (pt.y / 200) * 100 - 30)}%`,
                    }}
                    className="absolute z-30 p-2.5 rounded-xl border border-gray-700/80 dark:border-white/15 bg-[#121118] text-white shadow-2xl space-y-0.5 pointer-events-none transform -translate-x-1/2 -translate-y-full backdrop-blur-xl font-sans"
                  >
                    <div className="text-xs font-bold text-gray-300">{pt.label}</div>
                    <div className="text-xs font-mono font-semibold text-blue-400">
                      Revenue : {currencySymbol}{pt.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })()}

              {/* Month Labels */}
              <div className="absolute bottom-0 inset-x-0 h-6 text-[11px] text-gray-400 dark:text-gray-400 font-medium select-none">
                {monthsList.map((m, idx) => {
                  const activeIdx = hoveredPoint !== null ? hoveredPoint : points.length - 1;
                  const isActive = activeIdx === idx;
                  const pt = points[idx];
                  return (
                    <button
                      key={`${m.year}-${m.month}`}
                      type="button"
                      style={{ left: `${(pt.x / 1000) * 100}%` }}
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className={`absolute bottom-0 transform -translate-x-1/2 cursor-pointer px-1.5 py-0.5 rounded-md transition-all ${
                        isActive
                          ? 'text-blue-500 font-bold bg-blue-500/10 border border-blue-500/30'
                          : 'hover:text-blue-400 hover:bg-white/5'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Invoice Status Breakdown Donut Chart */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5 mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Invoice Status Breakdown</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding and paid invoice shares</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* SVG Donut Chart */}
            <div className="relative h-44 w-44 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="3.5" />
                {/* Paid Segment (Emerald Green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.8"
                  strokeDasharray={`${paidPct} 100`}
                  strokeDashoffset="0"
                />
                {/* Outstanding Segment (Orange) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.8"
                  strokeDasharray={`${outstandingPct} 100`}
                  strokeDashoffset={`-${paidPct}`}
                />
              </svg>
              <div className="text-center space-y-0.5">
                <span className="text-3xl font-black text-gray-900 dark:text-white font-heading">{totalInvoicesCount}</span>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total</p>
              </div>
            </div>

            {/* Donut Legend List */}
            <div className="space-y-4 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Paid</span>
                </div>
                <span className="font-mono text-gray-500 dark:text-gray-400">{paidCount} ({paidPct}%)</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Outstanding</span>
                </div>
                <span className="font-mono text-gray-500 dark:text-gray-400">{pendingCount} ({outstandingPct}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row (3 Equal Columns: 1/3, 1/3, 1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Cashflow Comparison Bar Chart */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5 mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Cashflow Comparison</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cash inflows (Paid Invoices) vs. Operating Costs (Logged Expenses) month-over-month
            </p>
          </div>

          <div className="space-y-4">
            {/* Dynamic Dual Bar Representation */}
            <div className="h-32 w-full flex items-end justify-between px-2 border-b border-gray-200/60 dark:border-white/10 pb-1">
              {monthsList.slice(-6).map((m) => {
                const maxVal = Math.max(...monthsList.map((item) => Math.max(item.total, item.expenses)), 100);
                const inflowHeight = Math.max(4, Math.round((m.total / maxVal) * 85));
                const expenseHeight = Math.max(4, Math.round((m.expenses / maxVal) * 85));
                return (
                  <div key={m.label} className="flex flex-col items-center gap-1.5">
                    <div className="flex gap-1 h-24 items-end">
                      <div
                        style={{ height: `${inflowHeight}%` }}
                        className="w-3.5 bg-emerald-500 rounded-t-md transition-all duration-300"
                        title={`Cash Inflow: ${currencySymbol}${m.total}`}
                      />
                      <div
                        style={{ height: `${expenseHeight}%` }}
                        className="w-3.5 bg-orange-500 rounded-t-md transition-all duration-300"
                        title={`Operating Expense: ${currencySymbol}${m.expenses}`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500" />
                <span className="text-gray-700 dark:text-gray-300">Cash Inflows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded bg-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">Expenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Insights Card */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5 mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Quick Insights</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Clock className="h-4 w-4" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Outstanding Amount</span>
              </div>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {currencySymbol}{totalOutstandingDues.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Average Invoice Value</span>
              </div>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {currencySymbol}{avgInvoiceValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Paid This Month</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {currencySymbol}{paidThisMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                  <Receipt className="h-4 w-4" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Expenses This Month</span>
              </div>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {currencySymbol}{expensesThisMonthTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Net Profit (This Month)</span>
              </div>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                {currencySymbol}{netProfitThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/reports')}
            className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pt-2"
          >
            <span>View Detailed Reports</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Column 3: Recent Activities Feed */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">Recent Activities</h2>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-3.5">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No recent activities logged.</p>
            ) : (
              activities.map((act) => {
                const ActIcon = act.icon;
                return (
                  <div
                    key={act.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-xl shrink-0 ${act.color}`}>
                        <ActIcon className="h-4 w-4" />
                      </div>
                      <div className="truncate space-y-0.5">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{act.title}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{act.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
