import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '~/utils/errors';
import { prisma } from '~/config/db';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  workspaceId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as { id: string; email: string };

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    // Extract workspace ID from header
    const workspaceId = req.headers['x-workspace-id'] as string;
    if (workspaceId) {
      const membership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: decoded.id,
        },
      });

      if (!membership) {
        throw ApiError.forbidden('You do not have access to this workspace');
      }

      req.workspaceId = workspaceId;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(ApiError.unauthorized('Invalid access token'));
    } else {
      next(error);
    }
  }
};
