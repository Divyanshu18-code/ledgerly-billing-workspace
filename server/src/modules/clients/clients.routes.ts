import { Router } from 'express';
import { clientsController } from './clients.controller';
import { requireAuth } from '~/middlewares/auth.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { z } from 'zod';
import { ClientStatus } from '@prisma/client';

const router = Router();

const createClientSchema = z.object({
  name: z.string().min(1, 'Client full name is required'),
  companyName: z.string().optional().nullable(),
  email: z.string().email('Invalid email address format'),
  phone: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  billingAddress: z.union([z.string(), z.record(z.string(), z.any())]).optional().nullable(),
  shippingAddress: z.union([z.string(), z.record(z.string(), z.any())]).optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.nativeEnum(ClientStatus).optional().default(ClientStatus.ACTIVE),
});

const updateClientSchema = createClientSchema.partial();

// Require auth for all endpoints under /clients
router.use(requireAuth);

router.get('/', clientsController.getClients);
router.get('/:id', clientsController.getClientById);
router.post('/', validateBody(createClientSchema), clientsController.createClient);
router.put('/:id', validateBody(updateClientSchema), clientsController.updateClient);
router.patch('/:id', validateBody(updateClientSchema), clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

export default router;
