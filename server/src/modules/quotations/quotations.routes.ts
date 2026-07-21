import { Router } from 'express';
import { quotationsController } from './quotations.controller';
import { requireAuth } from '~/middlewares/auth.middleware';
import { requireRole } from '~/middlewares/role.middleware';
import { validateBody, validateQuery } from '~/middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

// Zod Validation Schemas
const createQuotationItemSchema = z.object({
  productId: z.string().optional().nullable().transform((val) => (val && val.trim() !== '' ? val : null)),
  description: z.string().optional().nullable(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  discountAmount: z.number().min(0).optional().default(0),
  taxRateValue: z.number().min(0).max(100).optional().default(0),
});

const createQuotationSchema = z.object({
  clientId: z.string().uuid('Valid client ID is required'),
  quotationNumber: z.string().optional(),
  issueDate: z.string().optional(),
  validUntil: z.string().min(1, 'Validity date is required'),
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional().default('DRAFT'),
  currency: z.string().optional().default('INR'),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(createQuotationItemSchema).min(1, 'Quotation must contain at least 1 item line'),
});

const updateQuotationSchema = createQuotationSchema.partial();

const updateStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']),
});

const queryQuotationSchema = z.object({
  search: z.string().optional().nullable().or(z.literal('')),
  status: z.union([
    z.enum(['DRAFT', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']),
    z.literal(''),
    z.null(),
  ]).optional(),
  clientId: z.string().optional().nullable().or(z.literal('')),
  page: z.union([z.string(), z.number()]).optional(),
  limit: z.union([z.string(), z.number()]).optional(),
});

// Middleware stack for all quotation endpoints
router.use(requireAuth);

// Endpoints
router.get(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  quotationsController.getQuotations
);

router.get(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  quotationsController.getQuotationById
);

router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  validateBody(createQuotationSchema),
  quotationsController.createQuotation
);

router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  validateBody(updateQuotationSchema),
  quotationsController.updateQuotation
);

router.patch(
  '/:id/status',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(updateStatusSchema),
  quotationsController.updateStatus
);

router.post(
  '/:id/duplicate',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  quotationsController.duplicateQuotation
);

router.post(
  '/:id/convert-to-invoice',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  quotationsController.convertToInvoice
);

router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN']),
  quotationsController.deleteQuotation
);

export default router;
