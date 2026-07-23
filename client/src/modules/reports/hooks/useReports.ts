import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface ReportFilterParams {
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
// Fetch Dashboard Overview Reports
export const useDashboardReportsQuery = (params?: ReportFilterParams) => {
  return useQuery({
    queryKey: ['reports', 'dashboard', params],
    queryFn: async (): Promise<DashboardReportResponse> => {
      const response = await apiClient.get('/reports/dashboard', {
        params,
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });
};

// Fetch Revenue Report
export const useRevenueReportQuery = (params?: ReportFilterParams) => {
  return useQuery({
    queryKey: ['reports', 'revenue', params],
    queryFn: async (): Promise<RevenueReportResponse> => {
      const response = await apiClient.get('/reports/revenue', {
        params,
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Fetch Expense Report
export const useExpenseReportQuery = (params?: ReportFilterParams) => {
  return useQuery({
    queryKey: ['reports', 'expenses', params],
    queryFn: async (): Promise<ExpenseReportResponse> => {
      const response = await apiClient.get('/reports/expenses', {
        params,
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Fetch Profit & Loss Statement
export const useProfitLossReportQuery = (params?: ReportFilterParams) => {
  return useQuery({
    queryKey: ['reports', 'profit-loss', params],
    queryFn: async (): Promise<ProfitLossReportResponse> => {
      const response = await apiClient.get('/reports/profit-loss', {
        params,
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Download CSV Report helper using authenticated apiClient
export const downloadCSVReport = async (reportType: string) => {
  try {
    const response = await apiClient.get('/reports/export', {
      params: { type: reportType },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ledgerly_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download CSV report:', error);
  }
};

// Export PDF Report helper producing a branded executive document
export const downloadPDFReport = async (reportType: string, workspaceName = 'Ledgerly Workspace') => {
  try {
    const response = await apiClient.get('/reports/dashboard');
    const data = response.data?.data;
    const kpis = data?.kpis;
    const trends = data?.monthlyTrend || [];
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ledgerly - Financial & Business Audit Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              color: #0f172a;
              background-color: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .brand {
              font-size: 24px;
              font-weight: 800;
              color: #1e293b;
            }
            .brand span {
              color: #3b82f6;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              color: #64748b;
              line-height: 1.5;
            }
            .title-section {
              margin-bottom: 30px;
            }
            .title-section h1 {
              font-size: 20px;
              font-weight: 700;
              margin: 0 0 6px 0;
              color: #0f172a;
            }
            .title-section p {
              font-size: 13px;
              color: #64748b;
              margin: 0;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 35px;
            }
            .card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              background-color: #f8fafc;
            }
            .card-label {
              font-size: 11px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .card-val {
              font-size: 20px;
              font-weight: 800;
              color: #0f172a;
            }
            .text-green { color: #10b981; }
            .text-blue { color: #3b82f6; }
            .text-red { color: #f43f5e; }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 14px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #334155;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 11px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Ledgerly <span>CRM</span></div>
            <div class="meta">
              <div><strong>Workspace:</strong> ${workspaceName}</div>
              <div><strong>Report Date:</strong> ${dateStr}</div>
              <div><strong>Statement Type:</strong> ${reportType.toUpperCase()}</div>
            </div>
          </div>

          <div class="title-section">
            <h1>Executive Financial & Performance Audit Report</h1>
            <p>Official aggregated financial breakdown, trend overview, and bottom-line metrics.</p>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-label">Total Invoiced Revenue</div>
              <div class="card-val text-blue">₹${kpis?.totalRevenue?.toLocaleString() || 0}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Operating Expenses</div>
              <div class="card-val text-red">₹${kpis?.totalExpenses?.toLocaleString() || 0}</div>
            </div>
            <div class="card">
              <div class="card-label">Net Operating Profit / Loss</div>
              <div class="card-val ${kpis?.netProfit >= 0 ? 'text-green' : 'text-red'}">₹${kpis?.netProfit?.toLocaleString() || 0}</div>
            </div>
            <div class="card">
              <div class="card-label">Outstanding Uncollected Due</div>
              <div class="card-val">₹${kpis?.outstandingAmount?.toLocaleString() || 0}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Active Clients</div>
              <div class="card-val">${kpis?.totalClients || 0}</div>
            </div>
            <div class="card">
              <div class="card-label">Total Invoices Billed</div>
              <div class="card-val">${kpis?.totalInvoices || 0}</div>
            </div>
          </div>

          <h2 style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">Monthly Financial Performance Trend</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Invoiced Revenue</th>
                <th>Operating Expenses</th>
                <th>Net Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              ${trends.map((t: any) => `
                <tr>
                  <td><strong>${t.month}</strong></td>
                  <td>₹${t.revenue.toLocaleString()}</td>
                  <td>₹${t.expenses.toLocaleString()}</td>
                  <td style="font-weight: 700; color: ${t.profit >= 0 ? '#10b981' : '#f43f5e'}">₹${t.profit.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated automatically by Ledgerly Billing & Finance SaaS — Confidential Financial Statement
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }, 250);
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
  }
};
