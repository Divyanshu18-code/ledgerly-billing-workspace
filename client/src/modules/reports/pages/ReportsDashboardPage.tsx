import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  PiggyBank,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  useDashboardReportsQuery,
  useRevenueReportQuery,
  useExpenseReportQuery,
  useProfitLossReportQuery,
  downloadCSVReport,
  downloadPDFReport,
} from '../hooks/useReports';
import type { ReportFilterParams } from '../hooks/useReports';
import { ReportFilters } from '../components/ReportFilters';
import {
  FinancialTrendAreaChart,
  CategoryBarChart,
  DistributionDonutChart,
} from '../components/InteractiveCharts';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const ReportsDashboardPage: React.FC = () => {
  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'expenses' | 'pnl' | 'analytics'>('overview');
  const [filters, setFilters] = useState<ReportFilterParams>({
    period: 'this_month',
  });

  const { data: dashboardData, isLoading: loadingDash } = useDashboardReportsQuery(filters);
  const { data: revenueData } = useRevenueReportQuery(filters);
  const { data: expenseData } = useExpenseReportQuery(filters);
  const { data: pnlData } = useProfitLossReportQuery(filters);

  const kpis = dashboardData?.kpis;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Filters & CSV Export CTA */}
      <ReportFilters
        filters={filters}
        onFilterChange={setFilters}
        onExportCSV={() => downloadCSVReport(activeTab === 'pnl' ? 'summary' : activeTab)}
        onExportPDF={() => downloadPDFReport(activeTab === 'pnl' ? 'summary' : activeTab, workspace?.name)}
      />

      {/* Tab Controls */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-white/10 overflow-x-auto pb-2 scrollbar-none print:hidden">
        {[
          { key: 'overview', label: 'Executive Overview', icon: BarChart3 },
          { key: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
          { key: 'expenses', label: 'Expense Analysis', icon: Receipt },
          { key: 'pnl', label: 'Profit & Loss Statement', icon: PiggyBank },
          { key: 'analytics', label: 'Business Intelligence', icon: PieChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white/50 dark:bg-[#121118]/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loadingDash ? (
        <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-400 font-medium">Aggregating live financial records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && kpis && (
            <div className="space-y-6">
              {/* 9 Executive KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* 1. Total Revenue */}
                <div className="p-5 rounded-[22px] border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Revenue</span>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                      {currencySymbol}{kpis.totalRevenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+{kpis.revenueGrowth}% from last period</span>
                    </div>
                  </div>
                </div>

                {/* 2. Total Expenses */}
                <div className="p-5 rounded-[22px] border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Expenses</span>
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                      <Receipt className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-black font-mono text-gray-900 dark:text-white">
                      {currencySymbol}{kpis.totalExpenses.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-rose-500 font-semibold mt-1">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>{kpis.expenseGrowth}% optimization</span>
                    </div>
                  </div>
                </div>

                {/* 3. Net Profit */}
                <div className="p-5 rounded-[22px] border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Net Profit</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{kpis.netProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                      Margin: <span className="font-bold text-emerald-500">{kpis.profitMargin}%</span>
                    </div>
                  </div>
                </div>

                {/* 4. Outstanding Amount */}
                <div className="p-5 rounded-[22px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Outstanding Due</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                      {currencySymbol}{kpis.outstandingAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-amber-500 font-medium mt-1">
                      Uncollected Invoices
                    </div>
                  </div>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center">
                  <div className="text-xs text-gray-500 font-medium">Clients</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{kpis.totalClients}</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center">
                  <div className="text-xs text-gray-500 font-medium">Products</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{kpis.totalProducts}</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center">
                  <div className="text-xs text-gray-500 font-medium">Quotations</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{kpis.totalQuotations}</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center">
                  <div className="text-xs text-gray-500 font-medium">Invoices</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{kpis.totalInvoices}</div>
                </div>
                <div className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center col-span-2 sm:col-span-1">
                  <div className="text-xs text-gray-500 font-medium">Payments</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">{kpis.totalPayments}</div>
                </div>
              </div>

              {/* Financial Trend Line Chart & Distribution Donut */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">
                    Financial Performance Trend
                  </h3>
                  <FinancialTrendAreaChart data={dashboardData.monthlyTrend} currencySymbol={currencySymbol} />
                </div>

                <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">
                    Invoice Status Distribution
                  </h3>
                  <DistributionDonutChart distributions={dashboardData.invoiceStatusDistribution} />
                </div>
              </div>

              {/* Recent Activity Stream */}
              <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                  Recent Business Activity
                </h3>
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {dashboardData.recentActivity.map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-xs font-bold ${
                          act.type === 'INVOICE' ? 'bg-blue-500/10 text-blue-500' :
                          act.type === 'PAYMENT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {act.type}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{act.title}</div>
                          <div className="text-xs text-gray-500">{act.subtitle} • {new Date(act.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                        {currencySymbol}{act.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REVENUE ANALYSIS */}
          {activeTab === 'revenue' && revenueData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Total Billed Revenue</div>
                  <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
                    {currencySymbol}{revenueData.summary.totalRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Collected Cash Inflow</div>
                  <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
                    {currencySymbol}{revenueData.summary.collectedRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Pending Uncollected</div>
                  <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
                    {currencySymbol}{revenueData.summary.pendingRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Average Invoice Size</div>
                  <div className="text-2xl font-bold font-mono text-purple-500 mt-1">
                    {currencySymbol}{revenueData.summary.averageInvoiceValue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">Top Client Revenue Contributors</h3>
                <div className="space-y-3">
                  {revenueData.byClient.map((client) => (
                    <div key={client.id} className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.totalInvoices} Total Invoices</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-500">{currencySymbol}{client.totalPaid.toLocaleString()}</div>
                        <div className="text-xs text-amber-500 font-mono">Due: {currencySymbol}{client.outstanding.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXPENSE ANALYSIS */}
          {activeTab === 'expenses' && expenseData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Total Operational Outflow</div>
                  <div className="text-2xl font-bold font-mono text-rose-500 mt-1">
                    {currencySymbol}{expenseData.summary.totalExpenses.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Input GST Tax Paid</div>
                  <div className="text-2xl font-bold font-mono text-blue-500 mt-1">
                    {currencySymbol}{expenseData.summary.taxPaid.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                  <div className="text-xs text-gray-500 font-medium">Pending Clearances</div>
                  <div className="text-2xl font-bold font-mono text-amber-500 mt-1">
                    {currencySymbol}{expenseData.summary.pendingClearances.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">Category Spend Breakdown</h3>
                <CategoryBarChart categories={expenseData.byCategory} currencySymbol={currencySymbol} />
              </div>
            </div>
          )}

          {/* TAB 4: PROFIT & LOSS STATEMENT */}
          {activeTab === 'pnl' && pnlData && (
            <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 space-y-6">
              <div className="border-b border-gray-200 dark:border-white/10 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Profit & Loss Statement</h3>
                  <p className="text-xs text-gray-500">Formal financial P&L audit overview</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono font-bold text-sm">
                  Margin: {pnlData.summary.profitMargin}%
                </div>
              </div>

              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5">
                  <span className="font-bold text-gray-900 dark:text-white">Gross Invoiced Revenue</span>
                  <span className="font-bold text-blue-500">{currencySymbol}{pnlData.summary.grossRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5 text-gray-500">
                  <span>Less: Direct Cost of Goods/Services</span>
                  <span className="text-rose-400">({currencySymbol}{pnlData.summary.costOfSales.toLocaleString()})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-white/10 font-bold">
                  <span className="text-gray-900 dark:text-white">Gross Operating Profit</span>
                  <span className="text-emerald-500">{currencySymbol}{pnlData.summary.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5 text-gray-500">
                  <span>Less: Operating & Administrative Expenses</span>
                  <span className="text-rose-400">({currencySymbol}{pnlData.summary.operatingExpenses.toLocaleString()})</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-white/5 text-gray-500">
                  <span>Less: Input GST & Tax Liabilities</span>
                  <span className="text-rose-400">({currencySymbol}{pnlData.summary.taxLiability.toLocaleString()})</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-emerald-500 text-lg font-extrabold">
                  <span className="text-gray-900 dark:text-white">NET PROFIT (BOTTOM LINE)</span>
                  <span className="text-emerald-500">{currencySymbol}{pnlData.summary.netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BUSINESS INTELLIGENCE */}
          {activeTab === 'analytics' && dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">Top Selling Products & Services</h3>
                <div className="space-y-3">
                  {dashboardData.topProducts.map((prod) => (
                    <div key={prod.id} className="p-3 rounded-xl border border-gray-100 dark:border-white/5 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{prod.name}</div>
                        <div className="text-xs text-gray-500">SKU: {prod.sku} • {prod.totalSold} Units Sold</div>
                      </div>
                      <div className="font-mono font-bold text-blue-500 text-sm">
                        {currencySymbol}{prod.totalRevenue.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70">
                <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading mb-4">Payment Method Breakdown</h3>
                <div className="space-y-3">
                  {dashboardData.paymentMethodDistribution.map((pm, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-100 dark:border-white/5 flex justify-between items-center">
                      <div className="font-bold text-gray-900 dark:text-white text-xs">{pm.method}</div>
                      <div className="font-mono font-bold text-emerald-500 text-sm">
                        {currencySymbol}{pm.amount.toLocaleString()} ({pm.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
