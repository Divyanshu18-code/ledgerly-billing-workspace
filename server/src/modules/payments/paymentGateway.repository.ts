import { prisma } from '../../config/db';

export class PaymentGatewayRepository {
  async createTransaction(data: {
    workspaceId: string;
    invoiceId?: string;
    customerId?: string;
    gateway: string;
    transactionId: string;
    orderId?: string;
    amount: number;
    currency?: string;
    status: string;
    paymentMethod: string;
    failureReason?: string;
  }) {
    return await prisma.paymentTransaction.create({
      data: {
        workspaceId: data.workspaceId,
        invoiceId: data.invoiceId || null,
        customerId: data.customerId || null,
        gateway: data.gateway,
        transactionId: data.transactionId,
        orderId: data.orderId || null,
        amount: data.amount,
        currency: data.currency || 'INR',
        status: data.status,
        paymentMethod: data.paymentMethod,
        failureReason: data.failureReason || null,
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            balanceDue: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getTransactions(workspaceId: string) {
    return await prisma.paymentTransaction.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getTransactionById(workspaceId: string, id: string) {
    return await prisma.paymentTransaction.findFirst({
      where: { id, workspaceId },
      include: {
        invoice: {
          include: {
            client: true,
          },
        },
        customer: true,
      },
    });
  }

  async getMetrics(workspaceId: string) {
    const transactions = await prisma.paymentTransaction.findMany({
      where: { workspaceId },
    });

    const totalRevenue = transactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const onlinePaymentsCount = transactions.filter((t) => t.status === 'COMPLETED').length;
    const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
    const failedCount = transactions.filter((t) => t.status === 'FAILED').length;
    const refundedCount = transactions.filter((t) => t.status === 'REFUNDED').length;

    return {
      totalRevenue,
      onlinePaymentsCount,
      pendingCount,
      failedCount,
      refundedCount,
      totalCount: transactions.length,
      successRate: transactions.length > 0 ? ((onlinePaymentsCount / transactions.length) * 100).toFixed(1) : '100',
    };
  }
}
