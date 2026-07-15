import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { clientsService } from './clients.service';
import { ApiError } from '~/utils/errors';

export class ClientsController {
  async getClients(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const clients = await clientsService.getClients(workspaceId as string);
      res.status(200).json({
        status: 'success',
        data: clients,
      });
    } catch (error) {
      next(error);
    }
  }

  async getClientById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const client = await clientsService.getClientById(id as string, workspaceId as string);
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

      const { name, email, phone, taxNumber, billingAddress, shippingAddress } = req.body;
      const client = await clientsService.createClient(workspaceId as string, {
        name,
        email,
        phone,
        taxNumber,
        billingAddress,
        shippingAddress,
      });

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
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const client = await clientsService.updateClient(id as string, workspaceId as string, req.body);
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
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      await clientsService.deleteClient(id as string, workspaceId as string);
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
