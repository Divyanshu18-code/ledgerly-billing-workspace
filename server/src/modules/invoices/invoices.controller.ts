import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { invoicesService } from './invoices.service';
import { InvoiceStatus } from '@prisma/client';
import { ApiError } from '../../utils/errors';

export class InvoicesController {
  /**
   * GET /api/v1/invoices
   */
  async getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const { search, status, clientId, startDate, endDate, page, limit } = req.query;

      const sanitizedSearch = typeof search === 'string' && search.trim() !== '' ? search.trim() : undefined;
      const sanitizedStatus = typeof status === 'string' && status.trim() !== '' ? (status.trim() as InvoiceStatus) : undefined;
      const sanitizedClientId = typeof clientId === 'string' && clientId.trim() !== '' ? clientId.trim() : undefined;

      const options = {
        workspaceId,
        search: sanitizedSearch,
        status: sanitizedStatus,
        clientId: sanitizedClientId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      const result = await invoicesService.getInvoices(options);
      res.status(200).json({
        success: true,
        data: result.items,
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

  /**
   * GET /api/v1/invoices/:id
   */
  async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = req.params.id as string;
      const invoice = await invoicesService.getInvoiceById(id, workspaceId);

      res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/invoices
   */
  async createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id;

      const invoice = await invoicesService.createInvoice({
        ...req.body,
        workspaceId,
        createdById: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/invoices/from-quotation/:quotationId
   */
  async createFromQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id;
      const quotationId = req.params.quotationId as string;

      const invoice = await invoicesService.createFromQuotation(quotationId, workspaceId, userId);

      res.status(201).json({
        success: true,
        message: 'Quotation proposal converted to Invoice successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/invoices/:id/duplicate
   */
  async duplicateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id;
      const id = req.params.id as string;

      const invoice = await invoicesService.duplicateInvoice(id, workspaceId, userId);

      res.status(201).json({
        success: true,
        message: 'Invoice duplicated successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/invoices/:id
   */
  async updateInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = req.params.id as string;
      const invoice = await invoicesService.updateInvoice(id, workspaceId, req.body);

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/invoices/:id/status
   */
  async updateInvoiceStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = req.params.id as string;
      const { status } = req.body;

      const invoice = await invoicesService.updateInvoiceStatus(id, workspaceId, status);

      res.status(200).json({
        success: true,
        message: `Invoice status updated to ${status}`,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/invoices/:id
   */
  async deleteInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = req.params.id as string;
      const result = await invoicesService.deleteInvoice(id, workspaceId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const invoicesController = new InvoicesController();
