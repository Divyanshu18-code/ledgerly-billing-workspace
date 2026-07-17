import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { workspaceService } from './workspace.service';
import { ApiError } from '~/utils/errors';
import { Role } from '@prisma/client';

export class WorkspaceController {
  async createWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspace = await workspaceService.createWorkspace(userId, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Workspace created successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  async listWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaces = await workspaceService.listWorkspaces(userId);
      res.status(200).json({
        status: 'success',
        data: workspaces,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const id = req.params.id as string;
      if (!id) {
        throw ApiError.badRequest('Workspace ID parameter is required');
      }

      const workspace = await workspaceService.getWorkspace(id, userId);
      res.status(200).json({
        status: 'success',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkspaceDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const id = req.params.id as string;
      if (!id) {
        throw ApiError.badRequest('Workspace ID parameter is required');
      }

      const workspace = await workspaceService.updateWorkspace(id, userId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Workspace settings updated successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const id = req.params.id as string;
      if (!id) {
        throw ApiError.badRequest('Workspace ID parameter is required');
      }

      const archived = await workspaceService.archiveWorkspace(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Workspace archived successfully',
        data: archived,
      });
    } catch (error) {
      next(error);
    }
  }

  async switchWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaceId = req.body.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID to switch to is required');
      }

      const result = await workspaceService.switchWorkspace(userId, workspaceId);
      res.status(200).json({
        status: 'success',
        message: 'Switched workspace successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembersList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const id = req.params.id as string;
      if (!id) {
        throw ApiError.badRequest('Workspace ID parameter is required');
      }

      const members = await workspaceService.getTeamMembers(id, userId);
      res.status(200).json({
        status: 'success',
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const invitedByUserId = req.user?.id;
      if (!invitedByUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const id = req.params.id as string;
      if (!id) {
        throw ApiError.badRequest('Workspace ID parameter is required');
      }

      const { email, role } = req.body;
      if (!email || !role) {
        throw ApiError.badRequest('Email and role are required parameters');
      }

      const validRoles: Role[] = [Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER, Role.VIEWER];
      if (!validRoles.includes(role as Role)) {
        throw ApiError.badRequest('Invalid workspace role specified');
      }

      const invitation = await workspaceService.inviteTeamMember(id, invitedByUserId, email, role as Role);
      res.status(201).json({
        status: 'success',
        message: 'Team member invitation generated successfully',
        data: invitation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaceId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const { role } = req.body;

      if (!role) {
        throw ApiError.badRequest('Role parameter is required');
      }

      const validRoles: Role[] = [Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER, Role.VIEWER];
      if (!validRoles.includes(role as Role)) {
        throw ApiError.badRequest('Invalid workspace role specified');
      }

      const updated = await workspaceService.updateMemberRole(workspaceId, currentUserId, memberId, role as Role);
      res.status(200).json({
        status: 'success',
        message: 'Member role updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaceId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const removed = await workspaceService.removeMember(workspaceId, currentUserId, memberId);

      res.status(200).json({
        status: 'success',
        message: 'Team member removed from workspace successfully',
        data: removed,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const { token } = req.body;
      if (!token) {
        throw ApiError.badRequest('Invitation token is required');
      }

      const membership = await workspaceService.acceptInvitation(userId, token);
      res.status(200).json({
        status: 'success',
        message: 'Invitation accepted and joined workspace successfully',
        data: membership,
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveWorkspace(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaceId = req.params.id as string;
      await workspaceService.leaveWorkspace(workspaceId, userId);

      res.status(200).json({
        status: 'success',
        message: 'You have left the workspace successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentOwnerUserId = req.user?.id;
      if (!currentOwnerUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const workspaceId = req.params.id as string;
      const { targetUserId } = req.body;

      if (!targetUserId) {
        throw ApiError.badRequest('Target user ID is required to transfer ownership');
      }

      await workspaceService.transferOwnership(workspaceId, currentOwnerUserId, targetUserId);

      res.status(200).json({
        status: 'success',
        message: 'Workspace ownership transferred successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
