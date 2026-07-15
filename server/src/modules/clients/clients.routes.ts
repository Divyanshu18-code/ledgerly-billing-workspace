import { Router } from 'express';
import { clientsController } from './clients.controller';
import { requireAuth } from '~/middlewares/auth.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { z } from 'zod';

const router = Router();

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema.optional().nullable(),
});

const updateClientSchema = createClientSchema.partial();

// Require auth for all endpoints under /clients
router.use(requireAuth);

router.get('/', clientsController.getClients);
router.get('/:id', clientsController.getClientById);
router.post('/', validateBody(createClientSchema), clientsController.createClient);
router.patch('/:id', validateBody(updateClientSchema), clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

export default router;
