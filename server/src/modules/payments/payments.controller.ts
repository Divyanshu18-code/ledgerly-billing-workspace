import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export class PaymentsController {
  /**
   * GET /api/v1/payments
   */
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = authReq.workspaceId;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active workspace required' },
        });
      }

      const params = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        status: typeof req.query.status === 'string' ? (req.query.status as any) : undefined,
        paymentMethod: typeof req.query.paymentMethod === 'string' ? (req.query.paymentMethod as any) : undefined,
        clientId: typeof req.query.clientId === 'string' ? req.query.clientId : undefined,
        invoiceId: typeof req.query.invoiceId === 'string' ? req.query.invoiceId : undefined,
        startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
        endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
      };

      const result = await paymentsService.getPayments(workspaceId, params);

      return res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination,
        metrics: result.metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/:id
   */
  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = authReq.workspaceId;
      const id = req.params.id as string;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active workspace required' },
        });
      }

      const payment = await paymentsService.getPaymentById(workspaceId, id);

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments
   */
  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = authReq.workspaceId;
      const userId = authReq.user?.id;

      if (!workspaceId || !userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active workspace and user authentication required' },
        });
      }

      const payment = await paymentsService.recordPayment(workspaceId, userId, req.body);

      return res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/payments/:id
   */
  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = authReq.workspaceId;
      const userId = authReq.user?.id;
      const id = req.params.id as string;

      if (!workspaceId || !userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active workspace and user authentication required' },
        });
      }

      const payment = await paymentsService.updatePayment(workspaceId, userId, id, req.body);

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/payments/:id
   */
  async deletePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const workspaceId = authReq.workspaceId;
      const userId = authReq.user?.id;
      const id = req.params.id as string;

      if (!workspaceId || !userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Active workspace and user authentication required' },
        });
      }

      const result = await paymentsService.deletePayment(workspaceId, userId, id);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
