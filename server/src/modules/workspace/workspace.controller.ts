import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { workspaceService } from './workspace.service';
import { ApiError } from '~/utils/errors';
import { Role } from '@prisma/client';

export class WorkspaceController {
  async getWorkspaceDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const workspace = await workspaceService.getWorkspace(workspaceId as string);
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
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const workspace = await workspaceService.updateWorkspace(workspaceId as string, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Workspace configurations updated successfully',
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembersList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const members = await workspaceService.getTeamMembers(workspaceId as string);
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
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const { email, role } = req.body;
      if (!email || !role) {
        throw ApiError.badRequest('Email and role are required parameters');
      }

      const validRoles: Role[] = [Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER, Role.VIEWER];
      if (!validRoles.includes(role as Role)) {
        throw ApiError.badRequest('Invalid workspace role specified');
      }

      const invitation = await workspaceService.inviteTeamMember(workspaceId as string, email, role as Role);
      res.status(201).json({
        status: 'success',
        message: 'Team member invited successfully',
        data: invitation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const { id: membershipId } = req.params;
      const { role } = req.body;

      if (!role) {
        throw ApiError.badRequest('Role parameter is required');
      }

      const validRoles: Role[] = [Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER, Role.VIEWER];
      if (!validRoles.includes(role as Role)) {
        throw ApiError.badRequest('Invalid workspace role specified');
      }

      const updated = await workspaceService.updateMemberRole(workspaceId as string, currentUserId as string, membershipId as string, role as Role);
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
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw ApiError.unauthorized('User context is missing');
      }

      const { id: membershipId } = req.params;
      const removed = await workspaceService.removeMember(workspaceId as string, currentUserId as string, membershipId as string);

      res.status(200).json({
        status: 'success',
        message: 'Team member removed from workspace successfully',
        data: removed,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
