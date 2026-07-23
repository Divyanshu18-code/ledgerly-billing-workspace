import { prisma } from '../../../config/db';
import { ReportFilters } from '../reports.types';

export class ReportsRepository {
  /**
   * Helper to build date range filters for Prisma queries based on custom dates or period presets
   */
  private buildDateFilter(startDate?: string, endDate?: string, period?: string) {
    let gte: Date | undefined;
    let lte: Date | undefined;

    const now = new Date();

    if (period === 'this_month') {
      gte = new Date(now.getFullYear(), now.getMonth(), 1);
      lte = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      gte = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      lte = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'this_quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      gte = new Date(now.getFullYear(), currentQuarter * 3, 1);
      lte = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
    } else if (period === 'this_year') {
      gte = new Date(now.getFullYear(), 0, 1);
      lte = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    } else if (period === 'all_time') {
      return undefined;
    } else {
      if (startDate) gte = new Date(startDate);
      if (endDate) lte = new Date(endDate);
    }

    if (!gte && !lte) return undefined;

    const filter: { gte?: Date; lte?: Date } = {};
    if (gte) filter.gte = gte;
    if (lte) filter.lte = lte;
    return filter;
  }

  /**
   * Get raw financial KPI totals for a workspace
   */
  async getDashboardKPIs(workspaceId: string, filters: ReportFilters) {
    const dateFilter = this.buildDateFilter(filters.startDate, filters.endDate, filters.period);

    const invoiceWhere = {
      workspaceId,
      isArchived: false,
      ...(dateFilter ? { createdAt: dateFilter } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    };

    const expenseWhere = {
      workspaceId,
      isArchived: false,
      ...(dateFilter ? { expenseDate: dateFilter } : {}),
    };

    const paymentWhere = {
      workspaceId,
      isArchived: false,
      ...(dateFilter ? { paymentDate: dateFilter } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    };

    const quotationWhere = {
      workspaceId,
      isArchived: false,
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };

    // Parallel aggregate executions
    const [
      invoiceAgg,
      expenseAgg,
      paymentAgg,
      totalClients,
      totalProducts,
      totalQuotations,
      totalInvoices,
      totalPayments,
      unpaidInvoices,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: invoiceWhere,
        _sum: { grandTotal: true, amountPaid: true, balanceDue: true },
      }),
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: { totalAmount: true, amount: true, taxAmount: true },
      }),
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
      }),
      prisma.client.count({ where: { workspaceId, isArchived: false } }),
      prisma.product.count({ where: { workspaceId, isArchived: false } }),
      prisma.quotation.count({ where: quotationWhere }),
      prisma.invoice.count({ where: invoiceWhere }),
      prisma.payment.count({ where: paymentWhere }),
      prisma.invoice.aggregate({
        where: { workspaceId, isArchived: false, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
        _sum: { balanceDue: true },
      }),
    ]);

    const totalRevenue = Number(invoiceAgg._sum.grandTotal || 0);
    const totalExpenses = Number(expenseAgg._sum.totalAmount || 0);
    const netProfit = totalRevenue - totalExpenses;
    const outstandingAmount = Number(unpaidInvoices._sum.balanceDue || 0);
    const collectedPayments = Number(paymentAgg._sum.amount || 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      outstandingAmount,
      collectedPayments,
      totalClients,
      totalProducts,
      totalQuotations,
      totalInvoices,
      totalPayments,
      expenseTaxPaid: Number(expenseAgg._sum.taxAmount || 0),
    };
  }

  /**
   * Get 6-month rolling trends for Revenue vs Expenses vs Profit
   */
  async getMonthlyTrends(workspaceId: string) {
    const months: { label: string; start: Date; end: Date }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months.push({ label, start, end });
    }

    const trendData = await Promise.all(
      months.map(async (m) => {
        const [revAgg, expAgg] = await Promise.all([
          prisma.invoice.aggregate({
            where: {
              workspaceId,
              isArchived: false,
              createdAt: { gte: m.start, lte: m.end },
              status: { not: 'CANCELLED' },
            },
            _sum: { grandTotal: true },
          }),
          prisma.expense.aggregate({
            where: {
              workspaceId,
              isArchived: false,
              expenseDate: { gte: m.start, lte: m.end },
            },
            _sum: { totalAmount: true },
          }),
        ]);

        const revenue = Number(revAgg._sum.grandTotal || 0);
        const expenses = Number(expAgg._sum.totalAmount || 0);
        const profit = revenue - expenses;

        return {
          month: m.label,
          revenue,
          expenses,
          profit,
        };
      })
    );

    return trendData;
  }

  /**
   * Get Invoice Status distribution
   */
  async getInvoiceStatusDistribution(workspaceId: string, filters?: ReportFilters) {
    const dateFilter = this.buildDateFilter(filters?.startDate, filters?.endDate, filters?.period);
    const statuses = await prisma.invoice.groupBy({
      by: ['status'],
      where: {
        workspaceId,
        isArchived: false,
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _count: { id: true },
      _sum: { grandTotal: true },
    });

    const totalCount = statuses.reduce((acc: number, curr: { _count: { id: number } }) => acc + curr._count.id, 0);

    return statuses.map((item: { status: string; _count: { id: number }; _sum: { grandTotal: any } }) => ({
      status: item.status,
      count: item._count.id,
      amount: Number(item._sum.grandTotal || 0),
      percentage: totalCount > 0 ? Number(((item._count.id / totalCount) * 100).toFixed(1)) : 0,
    }));
  }

  /**
   * Get Payment Method distribution
   */
  async getPaymentMethodDistribution(workspaceId: string, filters?: ReportFilters) {
    const dateFilter = this.buildDateFilter(filters?.startDate, filters?.endDate, filters?.period);
    const methods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        workspaceId,
        isArchived: false,
        ...(dateFilter ? { paymentDate: dateFilter } : {}),
      },
      _count: { id: true },
      _sum: { amount: true },
    });

    const totalAmount = methods.reduce((acc: number, curr: { _sum: { amount: any } }) => acc + Number(curr._sum.amount || 0), 0);

    return methods.map((item: { paymentMethod: string; _count: { id: number }; _sum: { amount: any } }) => ({
      method: item.paymentMethod,
      count: item._count.id,
      amount: Number(item._sum.amount || 0),
      percentage: totalAmount > 0 ? Number(((Number(item._sum.amount || 0) / totalAmount) * 100).toFixed(1)) : 0,
    }));
  }

  /**
   * Get Top Clients by Revenue
   */
  async getTopClients(workspaceId: string, limit = 5) {
    const clients = await prisma.client.findMany({
      where: { workspaceId, isArchived: false },
      take: limit,
      include: {
        invoices: {
          where: { isArchived: false, status: { not: 'CANCELLED' } },
          select: { grandTotal: true, amountPaid: true, balanceDue: true },
        },
      },
    });

    const mapped = clients.map((c: any) => {
      const totalInvoices = c.invoices.length;
      const totalPaid = c.invoices.reduce((acc: number, inv: any) => acc + Number(inv.amountPaid || 0), 0);
      const outstanding = c.invoices.reduce((acc: number, inv: any) => acc + Number(inv.balanceDue || 0), 0);
      return {
        id: c.id,
        name: c.name,
        companyName: c.companyName || undefined,
        totalInvoices,
        totalPaid,
        outstanding,
      };
    });

    return mapped.sort((a: any, b: any) => b.totalPaid - a.totalPaid);
  }

  /**
   * Get Top Selling Products
   */
  async getTopProducts(workspaceId: string, limit = 5) {
    const products = await prisma.product.findMany({
      where: { workspaceId, isArchived: false },
      take: limit,
      include: {
        invoiceItems: {
          select: { quantity: true, totalAmount: true },
        },
      },
    });

    const mapped = products.map((p: any) => {
      const totalSold = p.invoiceItems.reduce((acc: number, item: any) => acc + Number(item.quantity || 0), 0);
      const totalRevenue = p.invoiceItems.reduce((acc: number, item: any) => acc + Number(item.totalAmount || 0), 0);
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category || 'General',
        totalSold,
        totalRevenue,
      };
    });

    return mapped.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get Recent Business Activity (Invoices, Payments, Expenses)
   */
  async getRecentActivity(workspaceId: string, limit = 8) {
    const [invoices, payments, expenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { workspaceId, isArchived: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      prisma.payment.findMany({
        where: { workspaceId, isArchived: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      prisma.expense.findMany({
        where: { workspaceId, isArchived: false },
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const items: Array<{
      id: string;
      type: 'INVOICE' | 'PAYMENT' | 'EXPENSE' | 'QUOTATION';
      title: string;
      subtitle: string;
      amount: number;
      status: string;
      date: string;
      rawDate: Date;
    }> = [];

    invoices.forEach((inv: any) => {
      items.push({
        id: inv.id,
        type: 'INVOICE',
        title: `Invoice ${inv.invoiceNumber}`,
        subtitle: inv.client?.name || 'Client',
        amount: Number(inv.grandTotal),
        status: inv.status,
        date: inv.createdAt.toISOString(),
        rawDate: inv.createdAt,
      });
    });

    payments.forEach((p: any) => {
      items.push({
        id: p.id,
        type: 'PAYMENT',
        title: `Payment ${p.paymentNumber}`,
        subtitle: p.client?.name || 'Received',
        amount: Number(p.amount),
        status: p.status,
        date: p.createdAt.toISOString(),
        rawDate: p.createdAt,
      });
    });

    expenses.forEach((e: any) => {
      items.push({
        id: e.id,
        type: 'EXPENSE',
        title: `Expense ${e.expenseNumber}`,
        subtitle: e.categoryName,
        amount: Number(e.totalAmount),
        status: e.status,
        date: e.expenseDate.toISOString(),
        rawDate: e.expenseDate,
      });
    });

    return items
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .slice(0, limit)
      .map(({ rawDate, ...rest }) => rest);
  }

  /**
   * Get Expense Category breakdown
   */
  async getExpenseCategoryBreakdown(workspaceId: string, filters?: ReportFilters) {
    const dateFilter = this.buildDateFilter(filters?.startDate, filters?.endDate, filters?.period);
    const categories = await prisma.expense.groupBy({
      by: ['categoryName'],
      where: {
        workspaceId,
        isArchived: false,
        ...(dateFilter ? { expenseDate: dateFilter } : {}),
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    const totalAmount = categories.reduce((acc: number, curr: { _sum: { totalAmount: any } }) => acc + Number(curr._sum.totalAmount || 0), 0);

    return categories.map((cat: { categoryName: string; _sum: { totalAmount: any }; _count: { id: number } }) => ({
      category: cat.categoryName,
      amount: Number(cat._sum.totalAmount || 0),
      count: cat._count.id,
      percentage: totalAmount > 0 ? Number(((Number(cat._sum.totalAmount || 0) / totalAmount) * 100).toFixed(1)) : 0,
    }));
  }
}
