import { prisma } from '../../config/db';
import { PDFGeneratorService } from './pdfGenerator.service';
import { EmailHistoryRepository } from './emailHistory.repository';
import { logMail } from '../../utils/mail';

export class PDFService {
  private pdfGenerator: PDFGeneratorService;
  private emailHistoryRepo: EmailHistoryRepository;

  constructor() {
    this.pdfGenerator = new PDFGeneratorService();
    this.emailHistoryRepo = new EmailHistoryRepository();
  }

  async getInvoicePDFData(workspaceId: string, invoiceId: string, theme: string = 'Modern Glass') {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, workspaceId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { workspaceId },
    });

    const html = this.pdfGenerator.generateInvoiceHTML(invoice, settings, theme);
    return { invoice, html };
  }

  async getQuotationPDFData(workspaceId: string, quotationId: string, theme: string = 'Modern Glass') {
    const quotation = await prisma.quotation.findFirst({
      where: { id: quotationId, workspaceId },
      include: {
        client: true,
        items: true,
      },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    const settings = await prisma.businessSettings.findUnique({
      where: { workspaceId },
    });

    const html = this.pdfGenerator.generateQuotationHTML(quotation, settings, theme);
    return { quotation, html };
  }

  async sendInvoiceEmail(data: {
    workspaceId: string;
    invoiceId: string;
    recipient: string;
    cc?: string;
    bcc?: string;
    subject: string;
    message?: string;
    userId?: string;
    theme?: string;
  }) {
    const { invoice, html } = await this.getInvoicePDFData(data.workspaceId, data.invoiceId, data.theme);

    const docNumber = invoice.invoiceNumber;
    const emailSubject = data.subject || `Invoice #${docNumber} from Ledgerly`;
    const emailText = data.message || `Dear Customer,\n\nPlease find attached Invoice #${docNumber}.\n\nThank you for your business.`;

    try {
      await logMail(data.recipient, emailSubject, emailText, html);

      await this.emailHistoryRepo.logEmail({
        workspaceId: data.workspaceId,
        documentType: 'INVOICE',
        documentId: data.invoiceId,
        recipient: data.recipient,
        cc: data.cc,
        bcc: data.bcc,
        subject: emailSubject,
        message: data.message,
        status: 'SENT',
        createdById: data.userId,
      });

      return { success: true, message: `Invoice #${docNumber} email sent successfully to ${data.recipient}` };
    } catch (err: any) {
      await this.emailHistoryRepo.logEmail({
        workspaceId: data.workspaceId,
        documentType: 'INVOICE',
        documentId: data.invoiceId,
        recipient: data.recipient,
        cc: data.cc,
        bcc: data.bcc,
        subject: emailSubject,
        message: data.message,
        status: 'FAILED',
        createdById: data.userId,
      });

      throw new Error(`Failed to send invoice email: ${err.message}`);
    }
  }

  async sendQuotationEmail(data: {
    workspaceId: string;
    quotationId: string;
    recipient: string;
    cc?: string;
    bcc?: string;
    subject: string;
    message?: string;
    userId?: string;
    theme?: string;
  }) {
    const { quotation, html } = await this.getQuotationPDFData(data.workspaceId, data.quotationId, data.theme);

    const docNumber = quotation.quotationNumber;
    const emailSubject = data.subject || `Quotation #${docNumber} from Ledgerly`;
    const emailText = data.message || `Dear Customer,\n\nPlease find attached Quotation #${docNumber}.\n\nThank you.`;

    try {
      await logMail(data.recipient, emailSubject, emailText, html);

      await this.emailHistoryRepo.logEmail({
        workspaceId: data.workspaceId,
        documentType: 'QUOTATION',
        documentId: data.quotationId,
        recipient: data.recipient,
        cc: data.cc,
        bcc: data.bcc,
        subject: emailSubject,
        message: data.message,
        status: 'SENT',
        createdById: data.userId,
      });

      return { success: true, message: `Quotation #${docNumber} email sent successfully to ${data.recipient}` };
    } catch (err: any) {
      await this.emailHistoryRepo.logEmail({
        workspaceId: data.workspaceId,
        documentType: 'QUOTATION',
        documentId: data.quotationId,
        recipient: data.recipient,
        cc: data.cc,
        bcc: data.bcc,
        subject: emailSubject,
        message: data.message,
        status: 'FAILED',
        createdById: data.userId,
      });

      throw new Error(`Failed to send quotation email: ${err.message}`);
    }
  }

  async getEmailHistory(workspaceId: string) {
    return await this.emailHistoryRepo.getHistory(workspaceId);
  }
}
