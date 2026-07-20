import { Router } from 'express';
import { productsController } from './products.controller';
import { requireAuth } from '~/middlewares/auth.middleware';
import { requireRole } from '~/middlewares/role.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU identifier is required'),
  type: z.enum(['PRODUCT', 'SERVICE']).optional(),
  price: z.number().min(0, 'Selling price must be 0 or greater'),
  purchasePrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unit: z.string().optional(),
  hsnSacCode: z.string().optional().nullable(),
  taxRateValue: z.number().min(0).max(100).optional(),
  taxRateId: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  isService: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

// Apply Authentication middleware to all product routes
router.use(requireAuth);

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);

// Mutating endpoints guarded with RBAC
router.post(
  '/',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  validateBody(createProductSchema),
  productsController.createProduct
);

router.put(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  validateBody(updateProductSchema),
  productsController.updateProduct
);

router.patch(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  validateBody(updateProductSchema),
  productsController.updateProduct
);

router.delete(
  '/:id',
  requireRole(['OWNER', 'ADMIN', 'MANAGER']),
  productsController.deleteProduct
);

export default router;
