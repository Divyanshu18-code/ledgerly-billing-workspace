import { Router } from 'express';
import { z } from 'zod';
import { invoicesController } from './invoices.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validation.middleware';

const router = Router();

// Zod Item Validation Schema
const createInvoiceItemSchema = z.object({
  productId: z.string().optional().nullable().transform((val) => (val && val.trim() !== '' ? val : null)),
  description: z.string().optional().nullable(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discountAmount: z.number().min(0).optional().default(0),
  taxRateValue: z.number().min(0).max(100).optional().default(0),
});

// Zod Create Invoice Validation Schema
const createInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  quotationId: z.string().optional().nullable().transform((val) => (val && val.trim() !== '' ? val : null)),
  issueDate: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional().default('DRAFT'),
  currency: z.string().optional().default('INR'),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(createInvoiceItemSchema).min(1, 'Invoice must contain at least 1 item line'),
});

// Zod Update Invoice Validation Schema
const updateInvoiceSchema = z.object({
  clientId: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  currency: z.string().optional(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(createInvoiceItemSchema).optional(),
});

// Zod Update Status Validation Schema
const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']),
});

// All routes require authentication
router.use(requireAuth);

// GET /api/v1/invoices
router.get(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  invoicesController.getInvoices.bind(invoicesController)
);

// GET /api/v1/invoices/:id
router.get(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  invoicesController.getInvoiceById.bind(invoicesController)
);

// POST /api/v1/invoices
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(createInvoiceSchema),
  invoicesController.createInvoice.bind(invoicesController)
);

// POST /api/v1/invoices/from-quotation/:quotationId
router.post(
  '/from-quotation/:quotationId',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  invoicesController.createFromQuotation.bind(invoicesController)
);

// POST /api/v1/invoices/:id/duplicate
router.post(
  '/:id/duplicate',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  invoicesController.duplicateInvoice.bind(invoicesController)
);

// PUT /api/v1/invoices/:id
router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(updateInvoiceSchema),
  invoicesController.updateInvoice.bind(invoicesController)
);

// PATCH /api/v1/invoices/:id/status
router.patch(
  '/:id/status',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(updateStatusSchema),
  invoicesController.updateInvoiceStatus.bind(invoicesController)
);

// DELETE /api/v1/invoices/:id
router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  invoicesController.deleteInvoice.bind(invoicesController)
);

export default router;
