import { Router } from 'express';
import { z } from 'zod';
import { expensesController } from './expenses.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validation.middleware';

const router = Router();

// Zod Validation Schemas
const createExpenseSchema = z.object({
  vendorId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  categoryName: z.string().optional(),
  amount: z.number().min(0.01, 'Expense amount must be greater than 0'),
  taxAmount: z.number().min(0).optional().default(0),
  currency: z.string().optional().default('INR'),
  paymentMethod: z
    .enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'WALLET', 'OTHER'])
    .optional()
    .default('CASH'),
  expenseDate: z.string().optional(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['PAID', 'PENDING', 'REJECTED', 'CANCELLED']).optional().default('PAID'),
});

const updateExpenseSchema = z.object({
  vendorId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  categoryName: z.string().optional(),
  amount: z.number().min(0.01, 'Expense amount must be greater than 0').optional(),
  taxAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  paymentMethod: z
    .enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'WALLET', 'OTHER'])
    .optional(),
  expenseDate: z.string().optional(),
  receiptUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['PAID', 'PENDING', 'REJECTED', 'CANCELLED']).optional(),
});

const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

// Require authentication for all routes
router.use(requireAuth);

// Metadata / Lookup endpoints
router.get(
  '/meta/categories',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  expensesController.getCategories.bind(expensesController)
);

router.post(
  '/meta/categories',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(createCategorySchema),
  expensesController.createCategory.bind(expensesController)
);

router.get(
  '/meta/vendors',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  expensesController.getVendors.bind(expensesController)
);

router.post(
  '/meta/vendors',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(createVendorSchema),
  expensesController.createVendor.bind(expensesController)
);

// Main Expense CRUD endpoints
router.get(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  expensesController.getExpenses.bind(expensesController)
);

router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(createExpenseSchema),
  expensesController.createExpense.bind(expensesController)
);

router.get(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  expensesController.getExpenseById.bind(expensesController)
);

router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  validateBody(updateExpenseSchema),
  expensesController.updateExpense.bind(expensesController)
);

router.post(
  '/:id/duplicate',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  expensesController.duplicateExpense.bind(expensesController)
);

router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']),
  expensesController.deleteExpense.bind(expensesController)
);

export default router;
