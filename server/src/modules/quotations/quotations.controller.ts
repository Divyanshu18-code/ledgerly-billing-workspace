import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { quotationsService } from './quotations.service';
import { QuotationStatus } from '@prisma/client';
import { ApiError } from '~/utils/errors';

export class QuotationsController {
  async getQuotations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const search = req.query.search && String(req.query.search).trim() !== '' ? String(req.query.search).trim() : undefined;
      const status = req.query.status && String(req.query.status).trim() !== '' ? (req.query.status as QuotationStatus) : undefined;
      const clientId = req.query.clientId && String(req.query.clientId).trim() !== '' ? String(req.query.clientId).trim() : undefined;
      const page = req.query.page ? Number(req.query.page) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;

      const result = await quotationsService.getQuotations(workspaceId, {
        search,
        status,
        clientId,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuotationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const quotation = await quotationsService.getQuotationById(id, workspaceId);

      res.status(200).json({
        success: true,
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id;

      const quotation = await quotationsService.createQuotation(workspaceId, {
        ...req.body,
        createdById: userId,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
        validUntil: new Date(req.body.validUntil),
      });

      res.status(201).json({
        success: true,
        message: `Quotation proposal ${quotation.quotationNumber} generated successfully`,
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const quotation = await quotationsService.updateQuotation(id, workspaceId, {
        ...req.body,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Quotation proposal updated successfully',
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;

      const quotation = await quotationsService.updateStatus(id, workspaceId, status as QuotationStatus);

      res.status(200).json({
        success: true,
        message: `Quotation status updated to ${status}`,
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async duplicateQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const quotation = await quotationsService.duplicateQuotation(id, workspaceId, userId);

      res.status(201).json({
        success: true,
        message: `Quotation duplicated as new Draft (${quotation.quotationNumber})`,
        data: quotation,
      });
    } catch (error) {
      next(error);
    }
  }

  async convertToInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await quotationsService.convertToInvoice(id, workspaceId);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuotation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await quotationsService.deleteQuotation(id, workspaceId);

      res.status(200).json({
        success: true,
        message: 'Quotation proposal deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const quotationsController = new QuotationsController();
