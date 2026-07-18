import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { clientsService } from './clients.service';
import { ApiError } from '~/utils/errors';
import { ClientStatus } from '@prisma/client';

export class ClientsController {
  async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search ? (req.query.search as string) : undefined;
      const statusParam = req.query.status ? (req.query.status as string).toUpperCase() : undefined;
      
      let status: ClientStatus | undefined;
      if (statusParam === 'ACTIVE' || statusParam === 'INACTIVE') {
        status = statusParam as ClientStatus;
      }

      const result = await clientsService.getClients(workspaceId, { page, limit, search, status });
      
      res.status(200).json({
        status: 'success',
        data: result.clients,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const client = await clientsService.getClientById(id, workspaceId);
      res.status(200).json({
        status: 'success',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async createClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const userId = req.user?.id;

      const client = await clientsService.createClient(workspaceId, userId as string, req.body);

      res.status(201).json({
        status: 'success',
        message: 'Client created successfully',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const client = await clientsService.updateClient(id, workspaceId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Client updated successfully',
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClient(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      await clientsService.deleteClient(id, workspaceId);
      res.status(200).json({
        status: 'success',
        message: 'Client deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const clientsController = new ClientsController();
