import { Router } from 'express';
import { requireAuth } from '~/middlewares/auth.middleware';
import { checkRole } from '~/middlewares/role.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { workspaceController } from './workspace.controller';
import { z } from 'zod';
import { Role } from '@prisma/client';

const router = Router();

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').optional(),
  logoUrl: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  currency: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  invoicePrefix: z.string().min(1).optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid contact email address').or(z.literal('')).optional().nullable(),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
});

const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// Require authenticated user for all routes under workspace/team
router.use(requireAuth);

// Workspace endpoints
router.get('/workspace', workspaceController.getWorkspaceDetails);
router.put(
  '/workspace',
  checkRole([Role.OWNER, Role.ADMIN]),
  validateBody(updateWorkspaceSchema),
  workspaceController.updateWorkspaceDetails
);

// Team endpoints
router.get('/team', workspaceController.getTeamMembersList);
router.post(
  '/team/invite',
  checkRole([Role.OWNER, Role.ADMIN]),
  validateBody(inviteMemberSchema),
  workspaceController.inviteMember
);
router.put(
  '/team/:id',
  checkRole([Role.OWNER, Role.ADMIN]),
  validateBody(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);
router.delete(
  '/team/:id',
  checkRole([Role.OWNER, Role.ADMIN]),
  workspaceController.removeMember
);

export default router;
