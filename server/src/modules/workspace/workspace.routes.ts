import { Router } from 'express';
import { requireAuth } from '~/middlewares/auth.middleware';
import { checkRole } from '~/middlewares/role.middleware';
import { validateBody } from '~/middlewares/validation.middleware';
import { workspaceController } from './workspace.controller';
import { z } from 'zod';
import { Role } from '@prisma/client';

const router = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  logoUrl: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  currency: z.string().min(1).default('USD'),
  timezone: z.string().min(1).default('UTC'),
  invoicePrefix: z.string().min(1).default('INV-'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional().nullable(),
  financialYear: z.string().min(1).default('2026-2027'),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required').optional(),
  logoUrl: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  currency: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  invoicePrefix: z.string().min(1).optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').or(z.literal('')).optional().nullable(),
  financialYear: z.string().min(1).optional(),
});

const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
});

const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
});

const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
});

const transferOwnershipSchema = z.object({
  targetUserId: z.string().uuid('Invalid target user ID format'),
});

// Require authenticated user for all workspace endpoints
router.use(requireAuth);

// General Workspace CRUD
router.post('/', validateBody(createWorkspaceSchema), workspaceController.createWorkspace);
router.get('/', workspaceController.listWorkspaces);
router.post('/switch', validateBody(switchWorkspaceSchema), workspaceController.switchWorkspace);
router.post('/invitations/accept', validateBody(acceptInvitationSchema), workspaceController.acceptInvitation);

router.get('/:id', workspaceController.getWorkspaceDetails);
router.put('/:id', checkRole([Role.OWNER, Role.ADMIN]), validateBody(updateWorkspaceSchema), workspaceController.updateWorkspaceDetails);
router.delete('/:id', checkRole([Role.OWNER]), workspaceController.archiveWorkspace);

// Team Member & Invitation Endpoints
router.get('/:id/members', workspaceController.getTeamMembersList);
router.post('/:id/invite', checkRole([Role.OWNER, Role.ADMIN]), validateBody(inviteMemberSchema), workspaceController.inviteMember);
router.put('/:id/members/:memberId', checkRole([Role.OWNER, Role.ADMIN]), validateBody(updateMemberRoleSchema), workspaceController.updateMemberRole);
router.delete('/:id/members/:memberId', checkRole([Role.OWNER, Role.ADMIN]), workspaceController.removeMember);

router.post('/:id/leave', workspaceController.leaveWorkspace);
router.post('/:id/transfer-ownership', checkRole([Role.OWNER]), validateBody(transferOwnershipSchema), workspaceController.transferOwnership);

export default router;
