export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  period?: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'all_time' | 'custom';
  clientId?: string;
  status?: string;
}

export interface DashboardKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingAmount: number;
  totalClients: number;
  totalProducts: number;
  totalQuotations: number;
  totalInvoices: number;
  totalPayments: number;
  revenueGrowth: number;
  expenseGrowth: number;
  profitMargin: number;
}

export interface MonthlyTrendData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentMethodDistribution {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface TopClientDTO {
  id: string;
  name: string;
  companyName?: string;
  totalInvoices: number;
  totalPaid: number;
  outstanding: number;
}

export interface TopProductDTO {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalSold: number;
  totalRevenue: number;
}

export interface RecentActivityDTO {
  id: string;
  type: 'INVOICE' | 'PAYMENT' | 'EXPENSE' | 'QUOTATION';
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  date: string;
}

export interface DashboardReportResponse {
  kpis: DashboardKPIs;
  monthlyTrend: MonthlyTrendData[];
  invoiceStatusDistribution: StatusDistribution[];
  paymentMethodDistribution: PaymentMethodDistribution[];
  topClients: TopClientDTO[];
  topProducts: TopProductDTO[];
  recentActivity: RecentActivityDTO[];
}

export interface RevenueReportResponse {
  summary: {
    totalRevenue: number;
    collectedRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    averageInvoiceValue: number;
  };
  trend: MonthlyTrendData[];
  byClient: TopClientDTO[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface ExpenseReportResponse {
  summary: {
    totalExpenses: number;
    taxPaid: number;
    pendingClearances: number;
    averageExpenseValue: number;
  };
  trend: MonthlyTrendData[];
  byCategory: CategoryBreakdown[];
}

export interface ProfitLossReportResponse {
  summary: {
    grossRevenue: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    netOperatingProfit: number;
    taxLiability: number;
    netProfit: number;
    profitMargin: number;
  };
  breakdown: {
    revenueItems: { name: string; amount: number }[];
    expenseCategories: { category: string; amount: number }[];
  };
  monthlyComparison: MonthlyTrendData[];
}
