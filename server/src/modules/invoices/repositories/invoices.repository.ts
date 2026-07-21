import { prisma } from '../../../config/db';
import { InvoiceStatus, Prisma } from '@prisma/client';

export interface FindInvoicesQueryOptions {
  workspaceId: string;
  search?: string;
  status?: InvoiceStatus;
  clientId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface CreateInvoiceItemData {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateInvoiceData {
  workspaceId: string;
  clientId: string;
  quotationId?: string | null;
  invoiceNumber: string;
  issueDate?: Date;
  dueDate: Date;
  status?: InvoiceStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  createdById?: string | null;
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid?: number;
  balanceDue?: number;
  items: CreateInvoiceItemData[];
}

export interface UpdateInvoiceData {
  clientId?: string;
  dueDate?: Date;
  status?: InvoiceStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  subTotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  grandTotal?: number;
  amountPaid?: number;
  balanceDue?: number;
  items?: CreateInvoiceItemData[];
}

export class InvoicesRepository {
  /**
   * Auto-generate sequential invoice number: INV-YYYY-XXXX
   */
  async generateInvoiceNumber(workspaceId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;

    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        workspaceId,
        invoiceNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        invoiceNumber: true,
      },
    });

    if (!latestInvoice) {
      return `${prefix}0001`;
    }

    const currentSeqStr = latestInvoice.invoiceNumber.replace(prefix, '');
    const currentSeq = parseInt(currentSeqStr, 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;

    return `${prefix}${nextSeq.toString().padStart(4, '0')}`;
  }

  /**
   * Find paginated invoices matching filters
   */
  async findMany(options: FindInvoicesQueryOptions) {
    const { workspaceId, search, status, clientId, startDate, endDate, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      workspaceId,
      isArchived: false,
      ...(status && { status }),
      ...(clientId && { clientId }),
      ...(startDate && endDate && { issueDate: { gte: startDate, lte: endDate } }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
          { client: { companyName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              companyName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find single invoice by ID with items and client
   */
  async findById(id: string, workspaceId: string) {
    return prisma.invoice.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
      include: {
        client: true,
        workspace: {
          select: {
            id: true,
            name: true,
            currency: true,
            gstNumber: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Create new invoice with nested line items
   */
  async create(data: CreateInvoiceData) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          workspaceId: data.workspaceId,
          clientId: data.clientId,
          quotationId: data.quotationId || null,
          invoiceNumber: data.invoiceNumber,
          issueDate: data.issueDate || new Date(),
          dueDate: data.dueDate,
          status: data.status || InvoiceStatus.DRAFT,
          currency: data.currency || 'INR',
          notes: data.notes || null,
          terms: data.terms || null,
          createdById: data.createdById || null,
          subTotal: data.subTotal,
          taxTotal: data.taxTotal,
          discountTotal: data.discountTotal,
          grandTotal: data.grandTotal,
          amountPaid: data.amountPaid || 0,
          balanceDue: data.balanceDue ?? data.grandTotal - (data.amountPaid || 0),
          items: {
            create: data.items.map((item) => ({
              productId: item.productId || null,
              description: item.description || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: item.discountAmount || 0,
              taxRateValue: item.taxRateValue || 0,
              taxAmount: item.taxAmount,
              totalAmount: item.totalAmount,
            })),
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

      return invoice;
    });
  }

  /**
   * Update existing invoice and replace its line items
   */
  async update(id: string, workspaceId: string, data: UpdateInvoiceData) {
    return prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          ...(data.clientId && { clientId: data.clientId }),
          ...(data.dueDate && { dueDate: data.dueDate }),
          ...(data.status && { status: data.status }),
          ...(data.currency && { currency: data.currency }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.terms !== undefined && { terms: data.terms }),
          ...(data.subTotal !== undefined && { subTotal: data.subTotal }),
          ...(data.taxTotal !== undefined && { taxTotal: data.taxTotal }),
          ...(data.discountTotal !== undefined && { discountTotal: data.discountTotal }),
          ...(data.grandTotal !== undefined && { grandTotal: data.grandTotal }),
          ...(data.amountPaid !== undefined && { amountPaid: data.amountPaid }),
          ...(data.balanceDue !== undefined && { balanceDue: data.balanceDue }),
          ...(data.items && {
            items: {
              create: data.items.map((item) => ({
                productId: item.productId || null,
                description: item.description || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountAmount: item.discountAmount || 0,
                taxRateValue: item.taxRateValue || 0,
                taxAmount: item.taxAmount,
                totalAmount: item.totalAmount,
              })),
            },
          }),
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

      return invoice;
    });
  }

  /**
   * Update status of an invoice
   */
  async updateStatus(id: string, workspaceId: string, status: InvoiceStatus) {
    return prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        items: true,
      },
    });
  }

  /**
   * Soft delete an invoice
   */
  async softDelete(id: string, workspaceId: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }
}

export const invoicesRepository = new InvoicesRepository();
