import { prisma } from '~/config/db';
import { Quotation, QuotationItem, QuotationStatus, Prisma } from '@prisma/client';

export interface FindQuotationsOptions {
  search?: string;
  status?: QuotationStatus;
  clientId?: string;
  page?: number;
  limit?: number;
}

export interface CreateQuotationItemInput {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
}

export interface CreateQuotationInput {
  clientId: string;
  quotationNumber?: string;
  issueDate?: Date;
  validUntil: Date;
  status?: QuotationStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  createdById?: string | null;
  items: CreateQuotationItemInput[];
}

export class QuotationsRepository {
  async findMany(workspaceId: string, options: FindQuotationsOptions = {}): Promise<any[]> {
    const { search, status, clientId, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {
      workspaceId,
      isArchived: false,
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(search
        ? {
            OR: [
              { quotationNumber: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
              { client: { companyName: { contains: search, mode: 'insensitive' } } },
              { notes: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.quotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async count(workspaceId: string, options: FindQuotationsOptions = {}): Promise<number> {
    const { search, status, clientId } = options;

    const where: Prisma.QuotationWhereInput = {
      workspaceId,
      isArchived: false,
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(search
        ? {
            OR: [
              { quotationNumber: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } },
              { client: { companyName: { contains: search, mode: 'insensitive' } } },
              { notes: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.quotation.count({ where });
  }

  async findById(id: string, workspaceId: string): Promise<any | null> {
    return prisma.quotation.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
      include: {
        client: true,
        workspace: true,
        createdBy: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findByQuotationNumber(workspaceId: string, quotationNumber: string): Promise<Quotation | null> {
    return prisma.quotation.findFirst({
      where: {
        workspaceId,
        quotationNumber: { equals: quotationNumber, mode: 'insensitive' },
        isArchived: false,
      },
    });
  }

  async generateNextQuotationNumber(workspaceId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QT-${year}-`;

    const latest = await prisma.quotation.findFirst({
      where: {
        workspaceId,
        quotationNumber: { startsWith: prefix },
      },
      orderBy: { quotationNumber: 'desc' },
    });

    if (!latest) {
      return `${prefix}0001`;
    }

    const currentSeqStr = latest.quotationNumber.replace(prefix, '');
    const currentSeq = parseInt(currentSeqStr, 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  async create(workspaceId: string, data: CreateQuotationInput, totals: { subTotal: number; taxTotal: number; discountTotal: number; grandTotal: number }): Promise<any> {
    const quotationNumber = data.quotationNumber || (await this.generateNextQuotationNumber(workspaceId));

    return prisma.quotation.create({
      data: {
        workspaceId,
        clientId: data.clientId,
        quotationNumber,
        issueDate: data.issueDate || new Date(),
        validUntil: data.validUntil,
        status: data.status || QuotationStatus.DRAFT,
        currency: data.currency || 'INR',
        notes: data.notes || null,
        terms: data.terms || null,
        createdById: data.createdById || null,
        subTotal: totals.subTotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        grandTotal: totals.grandTotal,
        items: {
          create: data.items.map((item) => {
            const qty = Number(item.quantity);
            const unitP = Number(item.unitPrice);
            const disc = Number(item.discountAmount || 0);
            const taxR = Number(item.taxRateValue || 0);
            const lineSub = qty * unitP - disc;
            const lineTax = (lineSub * taxR) / 100;
            const lineTotal = lineSub + lineTax;

            return {
              productId: item.productId || null,
              description: item.description || null,
              quantity: qty,
              unitPrice: unitP,
              discountAmount: disc,
              taxRateValue: taxR,
              taxAmount: lineTax,
              totalAmount: lineTotal,
            };
          }),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async update(id: string, workspaceId: string, data: Partial<CreateQuotationInput>, totals?: { subTotal: number; taxTotal: number; discountTotal: number; grandTotal: number }): Promise<any> {
    // Transaction to delete old items and recreate updated ones if items array provided
    return prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.quotationItem.deleteMany({
          where: { quotationId: id },
        });
      }

      return tx.quotation.update({
        where: {
          id,
          workspaceId,
        },
        data: {
          ...(data.clientId ? { clientId: data.clientId } : {}),
          ...(data.quotationNumber ? { quotationNumber: data.quotationNumber } : {}),
          ...(data.issueDate ? { issueDate: data.issueDate } : {}),
          ...(data.validUntil ? { validUntil: data.validUntil } : {}),
          ...(data.status ? { status: data.status } : {}),
          ...(data.currency ? { currency: data.currency } : {}),
          ...(data.notes !== undefined ? { notes: data.notes } : {}),
          ...(data.terms !== undefined ? { terms: data.terms } : {}),
          ...(totals ? {
            subTotal: totals.subTotal,
            taxTotal: totals.taxTotal,
            discountTotal: totals.discountTotal,
            grandTotal: totals.grandTotal,
          } : {}),
          ...(data.items
            ? {
                items: {
                  create: data.items.map((item) => {
                    const qty = Number(item.quantity);
                    const unitP = Number(item.unitPrice);
                    const disc = Number(item.discountAmount || 0);
                    const taxR = Number(item.taxRateValue || 0);
                    const lineSub = qty * unitP - disc;
                    const lineTax = (lineSub * taxR) / 100;
                    const lineTotal = lineSub + lineTax;

                    return {
                      productId: item.productId || null,
                      description: item.description || null,
                      quantity: qty,
                      unitPrice: unitP,
                      discountAmount: disc,
                      taxRateValue: taxR,
                      taxAmount: lineTax,
                      totalAmount: lineTotal,
                    };
                  }),
                },
              }
            : {}),
        },
        include: {
          client: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  }

  async updateStatus(id: string, workspaceId: string, status: QuotationStatus, convertedInvoiceId?: string): Promise<Quotation> {
    return prisma.quotation.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        status,
        ...(convertedInvoiceId ? { convertedInvoiceId } : {}),
      },
    });
  }

  async softDelete(id: string, workspaceId: string): Promise<Quotation> {
    return prisma.quotation.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }
}

export const quotationsRepository = new QuotationsRepository();
