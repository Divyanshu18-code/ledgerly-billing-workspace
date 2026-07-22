import { PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '../../../config/db';
import { CreatePaymentDTO, UpdatePaymentDTO, PaymentQueryParams } from '../payments.types';

export class PaymentsRepository {
  /**
   * Auto-generate sequential payment number e.g., PAY-2026-0001 per workspace
   */
  async generatePaymentNumber(workspaceId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PAY-${currentYear}-`;

    const latestPayment = await prisma.payment.findFirst({
      where: {
        workspaceId,
        paymentNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        paymentNumber: true,
      },
    });

    let nextSequence = 1;
    if (latestPayment && latestPayment.paymentNumber) {
      const parts = latestPayment.paymentNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextSequence = lastSeq + 1;
        }
      }
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
  }

  /**
   * Find paginated payments filtered by workspace, search, status, client, etc.
   */
  async findPaginated(workspaceId: string, params: PaymentQueryParams) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.max(1, Math.min(100, Number(params.limit || 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      workspaceId,
      isArchived: false,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.paymentMethod) {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.clientId) {
      where.clientId = params.clientId;
    }

    if (params.invoiceId) {
      where.invoiceId = params.invoiceId;
    }

    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      where.OR = [
        { paymentNumber: { contains: searchTerm, mode: 'insensitive' } },
        { transactionReference: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
        { client: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { invoice: { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    if (params.startDate || params.endDate) {
      where.paymentDate = {};
      if (params.startDate) {
        where.paymentDate.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.paymentDate.lte = new Date(params.endDate);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          paymentDate: 'desc',
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              companyName: true,
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              grandTotal: true,
              amountPaid: true,
              balanceDue: true,
              status: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find single payment by ID and workspaceId
   */
  async findById(workspaceId: string, id: string) {
    return prisma.payment.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
      include: {
        client: true,
        invoice: {
          include: {
            items: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create a new payment record
   */
  async create(workspaceId: string, userId: string, data: CreatePaymentDTO & { paymentNumber: string; clientId: string }) {
    return prisma.payment.create({
      data: {
        workspaceId,
        invoiceId: data.invoiceId,
        clientId: data.clientId,
        paymentNumber: data.paymentNumber,
        amount: data.amount,
        currency: data.currency || 'INR',
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        transactionReference: data.transactionReference || null,
        notes: data.notes || null,
        status: data.status || PaymentStatus.COMPLETED,
        createdById: userId,
      },
      include: {
        client: true,
        invoice: true,
      },
    });
  }

  /**
   * Update an existing payment record
   */
  async update(workspaceId: string, id: string, data: UpdatePaymentDTO) {
    const updateData: any = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.paymentDate !== undefined) updateData.paymentDate = new Date(data.paymentDate);
    if (data.transactionReference !== undefined) updateData.transactionReference = data.transactionReference;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        invoice: true,
      },
    });
  }

  /**
   * Soft delete a payment record
   */
  async softDelete(workspaceId: string, id: string) {
    return prisma.payment.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Sum all completed active payments for a specific invoice
   */
  async sumCompletedPaymentsForInvoice(workspaceId: string, invoiceId: string): Promise<number> {
    const aggregate = await prisma.payment.aggregate({
      where: {
        workspaceId,
        invoiceId,
        isArchived: false,
        status: PaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    return Number(aggregate._sum.amount || 0);
  }

  /**
   * Calculate workspace payment metrics
   */
  async getWorkspaceMetrics(workspaceId: string) {
    const [totalCollected, pendingVerification, refundedAmount] = await Promise.all([
      prisma.payment.aggregate({
        where: { workspaceId, isArchived: false, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { workspaceId, isArchived: false, status: PaymentStatus.PENDING },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { workspaceId, isArchived: false, status: PaymentStatus.REFUNDED },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalCollected: Number(totalCollected._sum.amount || 0),
      pendingVerification: Number(pendingVerification._sum.amount || 0),
      refundedAmount: Number(refundedAmount._sum.amount || 0),
    };
  }
}

export const paymentsRepository = new PaymentsRepository();
