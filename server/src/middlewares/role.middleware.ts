import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '~/utils/errors';
import { prisma } from '~/config/db';

export const checkRole = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication is required');
      }

      const workspaceId = req.workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace context is missing');
      }

      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: req.user.id,
        },
      });

      if (!membership) {
        throw ApiError.forbidden('You are not a member of this workspace');
      }

      if (!allowedRoles.includes(membership.role)) {
        throw ApiError.forbidden('You do not have the required role privileges');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
