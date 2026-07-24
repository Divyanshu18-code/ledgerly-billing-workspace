import { InvoicesRepository, FindInvoicesQueryOptions } from './repositories/invoices.repository';
import { quotationsRepository } from '../quotations/repositories/quotations.repository';
import { InvoiceStatus, QuotationStatus } from '@prisma/client';
import { ApiError } from '../../utils/errors';
import { activityService } from '../activity/activity.service';
import { notificationsService } from '../notifications/notifications.service';

export interface CreateInvoiceInputItem {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
}

export interface CreateInvoiceInput {
  workspaceId: string;
  clientId: string;
  quotationId?: string | null;
  issueDate?: string;
  dueDate: string;
  status?: InvoiceStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  createdById?: string | null;
  items: CreateInvoiceInputItem[];
}

export interface UpdateInvoiceInput {
  clientId?: string;
  dueDate?: string;
  status?: InvoiceStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items?: CreateInvoiceInputItem[];
}

export class InvoicesService {
  private repository: InvoicesRepository;

  constructor() {
    this.repository = new InvoicesRepository();
  }

  private calculateInvoiceTotals(items: CreateInvoiceInputItem[], amountPaid: number = 0) {
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    const processedItems = items.map((item) => {
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.unitPrice) || 0;
      const disc = Number(item.discountAmount) || 0;
      const taxRate = Number(item.taxRateValue) || 0;

      const lineSub = qty * rate - disc;
      const lineTax = (lineSub * taxRate) / 100;
      const lineTotal = Math.max(0, lineSub + lineTax);

      subTotal += qty * rate;
      discountTotal += disc;
      taxTotal += lineTax;

      return {
        productId: item.productId || null,
        description: item.description || null,
        quantity: qty,
        unitPrice: rate,
        discountAmount: disc,
        taxRateValue: taxRate,
        taxAmount: Number(lineTax.toFixed(2)),
        totalAmount: Number(lineTotal.toFixed(2)),
      };
    });

    const grandTotal = Math.max(0, subTotal - discountTotal + taxTotal);
    const balanceDue = Math.max(0, grandTotal - amountPaid);

    return {
      subTotal: Number(subTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      amountPaid: Number(amountPaid.toFixed(2)),
      balanceDue: Number(balanceDue.toFixed(2)),
      items: processedItems,
    };
  }

  async getInvoices(options: FindInvoicesQueryOptions) {
    return this.repository.findMany(options);
  }

  async getInvoiceById(id: string, workspaceId: string) {
    const invoice = await this.repository.findById(id, workspaceId);
    if (!invoice) {
      throw ApiError.notFound('Invoice not found');
    }
    return invoice;
  }

  async createInvoice(input: CreateInvoiceInput) {
    if (!input.items || input.items.length === 0) {
      throw ApiError.badRequest('Invoice must contain at least one line item');
    }

    const invoiceNumber = await this.repository.generateInvoiceNumber(input.workspaceId);
    const totals = this.calculateInvoiceTotals(input.items, 0);

    const invoice = await this.repository.create({
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      quotationId: input.quotationId || null,
      invoiceNumber,
      issueDate: input.issueDate ? new Date(input.issueDate) : new Date(),
      dueDate: new Date(input.dueDate),
      status: input.status || InvoiceStatus.DRAFT,
      currency: input.currency || 'INR',
      notes: input.notes || null,
      terms: input.terms || null,
      createdById: input.createdById || null,
      subTotal: totals.subTotal,
      taxTotal: totals.taxTotal,
      discountTotal: totals.discountTotal,
      grandTotal: totals.grandTotal,
      amountPaid: 0,
      balanceDue: totals.grandTotal,
      items: totals.items,
    });

    // Auto Activity Log & Notification
    activityService.logActivity({
      workspaceId: input.workspaceId,
      userId: input.createdById || null,
      action: 'INVOICE_CREATED',
      module: 'INVOICE',
      description: `Created invoice #${invoice.invoiceNumber}`,
      entityId: invoice.id,
    });

    notificationsService.notifyWorkspaceMembers(
      input.workspaceId,
      input.createdById || null,
      'INVOICE_CREATED',
      'New Invoice Created',
      `Invoice #${invoice.invoiceNumber} for ${totals.grandTotal} ${input.currency || 'INR'} has been created.`,
      invoice.id,
      'INVOICE'
    );

    return invoice;
  }

  async createFromQuotation(quotationId: string, workspaceId: string, createdById?: string) {
    const quotation = await quotationsRepository.findById(quotationId, workspaceId);
    if (!quotation) {
      throw ApiError.notFound('Quotation proposal not found');
    }

    const lineItems: CreateInvoiceInputItem[] = quotation.items.map((it: any) => ({
      productId: it.productId || null,
      description: it.description || null,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      discountAmount: Number(it.discountAmount || 0),
      taxRateValue: Number(it.taxRateValue || 0),
    }));

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const invoice = await this.createInvoice({
      workspaceId,
      clientId: quotation.clientId,
      quotationId: quotation.id,
      issueDate: new Date().toISOString(),
      dueDate,
      status: InvoiceStatus.DRAFT,
      currency: quotation.currency || 'INR',
      notes: quotation.notes || `Created from Quotation ${quotation.quotationNumber}`,
      terms: quotation.terms || 'Payment due within 30 days.',
      createdById: createdById || null,
      items: lineItems,
    });

    await quotationsRepository.update(quotation.id, workspaceId, {
      status: QuotationStatus.CONVERTED,
    });

    return invoice;
  }

  async duplicateInvoice(id: string, workspaceId: string, createdById?: string) {
    const existing = await this.getInvoiceById(id, workspaceId);

    const lineItems: CreateInvoiceInputItem[] = existing.items.map((it: any) => ({
      productId: it.productId || null,
      description: it.description || null,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      discountAmount: Number(it.discountAmount || 0),
      taxRateValue: Number(it.taxRateValue || 0),
    }));

    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return this.createInvoice({
      workspaceId,
      clientId: existing.clientId,
      issueDate: new Date().toISOString(),
      dueDate,
      status: InvoiceStatus.DRAFT,
      currency: existing.currency,
      notes: existing.notes ? `Copy of ${existing.invoiceNumber}: ${existing.notes}` : null,
      terms: existing.terms,
      createdById: createdById || null,
      items: lineItems,
    });
  }

  async updateInvoice(id: string, workspaceId: string, input: UpdateInvoiceInput) {
    const existing = await this.getInvoiceById(id, workspaceId);

    let totalsData = {};
    if (input.items && input.items.length > 0) {
      const currentPaid = Number(existing.amountPaid || 0);
      const totals = this.calculateInvoiceTotals(input.items, currentPaid);
      totalsData = {
        subTotal: totals.subTotal,
        taxTotal: totals.taxTotal,
        discountTotal: totals.discountTotal,
        grandTotal: totals.grandTotal,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        items: totals.items,
      };
    }

    const updated = await this.repository.update(id, workspaceId, {
      clientId: input.clientId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      status: input.status,
      currency: input.currency,
      notes: input.notes,
      terms: input.terms,
      ...totalsData,
    });

    return updated;
  }

  async updateInvoiceStatus(id: string, workspaceId: string, status: InvoiceStatus) {
    await this.getInvoiceById(id, workspaceId);
    return this.repository.updateStatus(id, workspaceId, status);
  }

  async deleteInvoice(id: string, workspaceId: string) {
    await this.getInvoiceById(id, workspaceId);
    await this.repository.softDelete(id, workspaceId);
    return { success: true, message: 'Invoice soft deleted successfully' };
  }
}

export const invoicesService = new InvoicesService();
