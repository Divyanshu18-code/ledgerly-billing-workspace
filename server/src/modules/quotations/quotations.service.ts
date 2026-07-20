import { quotationsRepository, FindQuotationsOptions, CreateQuotationInput } from './repositories/quotations.repository';
import { ApiError } from '~/utils/errors';
import { QuotationStatus } from '@prisma/client';
import { prisma } from '~/config/db';

export class QuotationsService {
  private calculateTotals(items: CreateQuotationInput['items']) {
    let subTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;

    for (const item of items) {
      const qty = Number(item.quantity);
      const unitP = Number(item.unitPrice);
      const disc = Number(item.discountAmount || 0);
      const taxR = Number(item.taxRateValue || 0);

      const lineSub = qty * unitP - disc;
      const lineTax = (lineSub * taxR) / 100;

      subTotal += qty * unitP;
      discountTotal += disc;
      taxTotal += lineTax;
    }

    const grandTotal = subTotal - discountTotal + taxTotal;

    return {
      subTotal: Math.max(0, subTotal),
      taxTotal: Math.max(0, taxTotal),
      discountTotal: Math.max(0, discountTotal),
      grandTotal: Math.max(0, grandTotal),
    };
  }

  async getQuotations(workspaceId: string, options: FindQuotationsOptions = {}) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;

    const [items, totalItems] = await Promise.all([
      quotationsRepository.findMany(workspaceId, { ...options, page, limit }),
      quotationsRepository.count(workspaceId, options),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getQuotationById(id: string, workspaceId: string) {
    const quotation = await quotationsRepository.findById(id, workspaceId);
    if (!quotation) {
      throw ApiError.notFound('Quotation proposal not found');
    }
    return quotation;
  }

  async createQuotation(workspaceId: string, data: CreateQuotationInput) {
    if (!data.items || data.items.length === 0) {
      throw ApiError.badRequest('Quotation must contain at least one item or service line');
    }

    // Verify Client exists in workspace
    const clientExists = await prisma.client.findFirst({
      where: { id: data.clientId, workspaceId },
    });
    if (!clientExists) {
      throw ApiError.notFound('Selected client does not exist in this workspace');
    }

    const totals = this.calculateTotals(data.items);
    return quotationsRepository.create(workspaceId, data, totals);
  }

  async updateQuotation(id: string, workspaceId: string, data: Partial<CreateQuotationInput>) {
    const existing = await this.getQuotationById(id, workspaceId);

    let totals;
    if (data.items) {
      if (data.items.length === 0) {
        throw ApiError.badRequest('Quotation must contain at least one item or service line');
      }
      totals = this.calculateTotals(data.items);
    }

    return quotationsRepository.update(id, workspaceId, data, totals);
  }

  async updateStatus(id: string, workspaceId: string, status: QuotationStatus) {
    await this.getQuotationById(id, workspaceId);
    return quotationsRepository.updateStatus(id, workspaceId, status);
  }

  async duplicateQuotation(id: string, workspaceId: string, userId?: string | null) {
    const source = await this.getQuotationById(id, workspaceId);

    const nextQuotationNumber = await quotationsRepository.generateNextQuotationNumber(workspaceId);

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30); // 30 days default valid

    return quotationsRepository.create(
      workspaceId,
      {
        clientId: source.clientId,
        quotationNumber: nextQuotationNumber,
        validUntil: validUntilDate,
        status: QuotationStatus.DRAFT,
        currency: source.currency,
        notes: source.notes ? `Copy of ${source.quotationNumber}. ${source.notes}` : `Copy of ${source.quotationNumber}`,
        terms: source.terms,
        createdById: userId || null,
        items: source.items.map((it: any) => ({
          productId: it.productId,
          description: it.description,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          discountAmount: Number(it.discountAmount),
          taxRateValue: Number(it.taxRateValue),
        })),
      },
      {
        subTotal: Number(source.subTotal),
        taxTotal: Number(source.taxTotal),
        discountTotal: Number(source.discountTotal),
        grandTotal: Number(source.grandTotal),
      }
    );
  }

  async convertToInvoice(id: string, workspaceId: string) {
    const quotation = await this.getQuotationById(id, workspaceId);

    if (quotation.status === QuotationStatus.CONVERTED && quotation.convertedInvoiceId) {
      throw ApiError.badRequest('This quotation has already been converted to an invoice');
    }

    // Generate Invoice Number (e.g., INV-2026-0001)
    const year = new Date().getFullYear();
    const invPrefix = `INV-${year}-`;
    const latestInv = await prisma.invoice.findFirst({
      where: {
        workspaceId,
        invoiceNumber: { startsWith: invPrefix },
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    let nextInvNumber = `${invPrefix}0001`;
    if (latestInv) {
      const currentSeq = parseInt(latestInv.invoiceNumber.replace(invPrefix, ''), 10);
      const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;
      nextInvNumber = `${invPrefix}${nextSeq.toString().padStart(4, '0')}`;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // 15 days payment terms

    // Create Invoice in transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const createdInv = await tx.invoice.create({
        data: {
          workspaceId,
          clientId: quotation.clientId,
          invoiceNumber: nextInvNumber,
          issueDate: new Date(),
          dueDate,
          subTotal: quotation.subTotal,
          taxTotal: quotation.taxTotal,
          discountTotal: quotation.discountTotal,
          grandTotal: quotation.grandTotal,
          items: {
            create: quotation.items.map((item: any) => ({
              productId: item.productId,
              quantity: Math.round(Number(item.quantity)),
              unitPrice: item.unitPrice,
              taxAmount: item.taxAmount,
              discountAmount: item.discountAmount,
              totalAmount: item.totalAmount,
            })),
          },
        },
      });

      // Mark Quotation as CONVERTED
      await tx.quotation.update({
        where: { id },
        data: {
          status: QuotationStatus.CONVERTED,
          convertedInvoiceId: createdInv.id,
        },
      });

      return createdInv;
    });

    return {
      invoice,
      quotationId: quotation.id,
      message: `Quotation ${quotation.quotationNumber} converted to Invoice ${invoice.invoiceNumber} successfully`,
    };
  }

  async deleteQuotation(id: string, workspaceId: string) {
    await this.getQuotationById(id, workspaceId);
    return quotationsRepository.softDelete(id, workspaceId);
  }
}

export const quotationsService = new QuotationsService();
