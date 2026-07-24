import { InvoiceStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/db';
import { paymentsRepository } from './repositories/payments.repository';
import { CreatePaymentDTO, UpdatePaymentDTO, PaymentQueryParams } from './payments.types';
import { ApiError } from '../../utils/errors';
import { activityService } from '../activity/activity.service';
import { notificationsService } from '../notifications/notifications.service';

export class PaymentsService {
  /**
   * Recalculate & Sync Invoice Balance Due, Amount Paid, and Payment Status
   */
  private async syncInvoicePaymentStatus(workspaceId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId, isArchived: false },
    });

    if (!invoice) return;

    const totalPaid = await paymentsRepository.sumCompletedPaymentsForInvoice(workspaceId, invoiceId);
    const grandTotal = Number(invoice.grandTotal || 0);
    const balanceDue = Math.max(0, grandTotal - totalPaid);

    let newStatus: InvoiceStatus = invoice.status;

    if (balanceDue === 0 && grandTotal > 0) {
      newStatus = InvoiceStatus.PAID;
    } else if (balanceDue > 0 && totalPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else if (totalPaid === 0 && invoice.status === InvoiceStatus.PARTIALLY_PAID) {
      newStatus = InvoiceStatus.SENT;
    }

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: totalPaid,
        balanceDue,
        status: newStatus,
      },
    });
  }

  /**
   * List payments with workspace isolation and metrics
   */
  async getPayments(workspaceId: string, params: PaymentQueryParams) {
    const result = await paymentsRepository.findPaginated(workspaceId, params);
    const metrics = await paymentsRepository.getWorkspaceMetrics(workspaceId);

    return {
      payments: result.payments,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      metrics,
    };
  }

  /**
   * Get single payment by ID
   */
  async getPaymentById(workspaceId: string, id: string) {
    const payment = await paymentsRepository.findById(workspaceId, id);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }
    return payment;
  }

  /**
   * Record a new payment and sync invoice
   */
  async recordPayment(workspaceId: string, userId: string, dto: CreatePaymentDTO) {
    // 1. Verify Invoice exists & belongs to workspace
    const invoice = await prisma.invoice.findFirst({
      where: { id: dto.invoiceId, workspaceId, isArchived: false },
      include: { client: true },
    });

    if (!invoice) {
      throw ApiError.notFound('Target invoice not found in active workspace');
    }

    if (dto.amount <= 0) {
      throw ApiError.badRequest('Payment amount must be greater than 0');
    }

    // 2. Generate Payment Number PAY-2026-XXXX
    const paymentNumber = await paymentsRepository.generatePaymentNumber(workspaceId);

    // 3. Determine Client ID (from DTO or Invoice)
    const clientId = dto.clientId || invoice.clientId;

    // 4. Create Payment Record
    const payment = await paymentsRepository.create(workspaceId, userId, {
      ...dto,
      paymentNumber,
      clientId,
    });

    // 5. Auto-sync Invoice status & balance
    await this.syncInvoicePaymentStatus(workspaceId, invoice.id);

    // 6. Log Activity & Notify Members
    activityService.logActivity({
      workspaceId,
      userId,
      action: 'PAYMENT_RECORDED',
      module: 'PAYMENT',
      description: `Recorded payment ${payment.paymentNumber} of ${payment.currency} ${payment.amount} for invoice #${invoice.invoiceNumber}`,
      entityId: payment.id,
    });

    notificationsService.notifyWorkspaceMembers(
      workspaceId,
      userId,
      'PAYMENT_RECEIVED',
      'Payment Received',
      `Payment ${payment.paymentNumber} of ${payment.currency} ${payment.amount} received for invoice #${invoice.invoiceNumber}.`,
      payment.id,
      'PAYMENT'
    );

    return payment;
  }

  /**
   * Update an existing payment and sync invoice
   */
  async updatePayment(workspaceId: string, userId: string, id: string, dto: UpdatePaymentDTO) {
    const existing = await paymentsRepository.findById(workspaceId, id);
    if (!existing) {
      throw ApiError.notFound('Payment record not found');
    }

    if (dto.amount !== undefined && dto.amount <= 0) {
      throw ApiError.badRequest('Payment amount must be greater than 0');
    }

    const updatedPayment = await paymentsRepository.update(workspaceId, id, dto);

    // Auto-sync Invoice status & balance
    await this.syncInvoicePaymentStatus(workspaceId, existing.invoiceId);

    // Log Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'PAYMENT_UPDATED',
          description: `Updated payment ${updatedPayment.paymentNumber}`,
        },
      });
    } catch (_) {}

    return updatedPayment;
  }

  /**
   * Soft-delete a payment and sync invoice
   */
  async deletePayment(workspaceId: string, userId: string, id: string) {
    const existing = await paymentsRepository.findById(workspaceId, id);
    if (!existing) {
      throw ApiError.notFound('Payment record not found');
    }

    await paymentsRepository.softDelete(workspaceId, id);

    // Auto-sync Invoice status & balance
    await this.syncInvoicePaymentStatus(workspaceId, existing.invoiceId);

    // Log Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          userId,
          action: 'PAYMENT_DELETED',
          description: `Deleted payment ${existing.paymentNumber}`,
        },
      });
    } catch (_) {}

    return { message: 'Payment record deleted successfully' };
  }
}

export const paymentsService = new PaymentsService();
