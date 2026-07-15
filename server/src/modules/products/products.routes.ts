import { Router } from 'express';
import { productsController } from './products.controller';
import { requireAuth } from '~/middlewares/auth.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU identifier is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  description: z.string().optional().nullable(),
  isService: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial();

// Require auth for all endpoints under /products
router.use(requireAuth);

router.get('/', productsController.getProducts);
router.get('/:id', productsController.getProductById);
router.post('/', validateBody(createProductSchema), productsController.createProduct);
router.patch('/:id', validateBody(updateProductSchema), productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

export default router;
