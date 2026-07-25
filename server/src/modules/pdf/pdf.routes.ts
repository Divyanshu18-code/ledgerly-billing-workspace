import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { PDFController } from './pdf.controller';

const router = Router();
const controller = new PDFController();

router.use(requireAuth);

router.get('/invoice/:id', (req, res) => controller.getInvoicePDF(req, res));
router.get('/quotation/:id', (req, res) => controller.getQuotationPDF(req, res));
router.post('/invoice/:id/email', (req, res) => controller.sendInvoiceEmail(req, res));
router.post('/quotation/:id/email', (req, res) => controller.sendQuotationEmail(req, res));
router.get('/emails/history', (req, res) => controller.getEmailHistory(req, res));

export default router;
