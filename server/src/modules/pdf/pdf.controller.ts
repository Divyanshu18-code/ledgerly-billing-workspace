import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { PDFService } from './pdf.service';

const pdfService = new PDFService();

export class PDFController {
  async getInvoicePDF(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      const id = req.params.id as string;
      const theme = typeof req.query.theme === 'string' ? req.query.theme : 'Modern Glass';

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const data = await pdfService.getInvoicePDFData(workspaceId, id, theme);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getQuotationPDF(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      const id = req.params.id as string;
      const theme = typeof req.query.theme === 'string' ? req.query.theme : 'Modern Glass';

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const data = await pdfService.getQuotationPDFData(workspaceId, id, theme);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async sendInvoiceEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { recipient, cc, bcc, subject, message, theme } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }
      if (!recipient) {
        return res.status(400).json({ success: false, message: 'Recipient email is required' });
      }

      const result = await pdfService.sendInvoiceEmail({
        workspaceId,
        invoiceId: id,
        recipient: String(recipient),
        cc: cc ? String(cc) : undefined,
        bcc: bcc ? String(bcc) : undefined,
        subject: String(subject || ''),
        message: message ? String(message) : undefined,
        userId,
        theme: theme ? String(theme) : undefined,
      });

      return res.status(200).json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async sendQuotationEmail(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      const userId = req.user?.id;
      const id = req.params.id as string;
      const { recipient, cc, bcc, subject, message, theme } = req.body;

      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }
      if (!recipient) {
        return res.status(400).json({ success: false, message: 'Recipient email is required' });
      }

      const result = await pdfService.sendQuotationEmail({
        workspaceId,
        quotationId: id,
        recipient: String(recipient),
        cc: cc ? String(cc) : undefined,
        bcc: bcc ? String(bcc) : undefined,
        subject: String(subject || ''),
        message: message ? String(message) : undefined,
        userId,
        theme: theme ? String(theme) : undefined,
      });

      return res.status(200).json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async getEmailHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const history = await pdfService.getEmailHistory(workspaceId);
      return res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
