import { Router } from 'express';
import { z } from 'zod';
import { paymentsController } from './payments.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validation.middleware';

const router = Router();

// Zod Validation Schemas
const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  clientId: z.string().optional(),
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  paymentMethod: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CHEQUE',
    'WALLET',
    'OTHER',
  ]).default('CASH'),
  paymentDate: z.string().optional(),
  transactionReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']).optional().default('COMPLETED'),
  currency: z.string().optional().default('INR'),
});

const updatePaymentSchema = z.object({
  amount: z.number().min(0.01, 'Payment amount must be greater than 0').optional(),
  paymentMethod: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'UPI',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CHEQUE',
    'WALLET',
    'OTHER',
  ]).optional(),
  paymentDate: z.string().optional(),
  transactionReference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['COMPLETED', 'PENDING', 'FAILED', 'REFUNDED']).optional(),
});

// All routes require authentication
router.use(requireAuth);

// GET /api/v1/payments
router.get(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  paymentsController.getPayments.bind(paymentsController)
);

// GET /api/v1/payments/:id
router.get(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  paymentsController.getPaymentById.bind(paymentsController)
);

// POST /api/v1/payments
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(recordPaymentSchema),
  paymentsController.recordPayment.bind(paymentsController)
);

// PUT /api/v1/payments/:id
router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(updatePaymentSchema),
  paymentsController.updatePayment.bind(paymentsController)
);

// DELETE /api/v1/payments/:id
router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  paymentsController.deletePayment.bind(paymentsController)
);

// --- PAYMENT GATEWAY ENDPOINTS ---

// POST /api/v1/payments/create-order
router.post('/create-order', (req, res, next) => paymentsController.createOrder(req, res, next));

// POST /api/v1/payments/verify
router.post('/verify', (req, res, next) => paymentsController.verifyPayment(req, res, next));

// POST /api/v1/payments/webhook
router.post('/webhook', (req, res) => paymentsController.handleWebhook(req, res));

// GET /api/v1/payments/gateway/history
router.get('/gateway/history', (req, res, next) => paymentsController.getHistory(req, res, next));

// GET /api/v1/payments/gateway/:id/receipt
router.get('/gateway/:id/receipt', (req, res, next) => paymentsController.getReceiptHTML(req, res, next));

export default router;
