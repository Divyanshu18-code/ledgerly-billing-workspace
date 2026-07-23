import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

const reportsService = new ReportsService();

export class ReportsController {
  /**
   * GET /api/v1/reports/dashboard
   */
  async getDashboardReports(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        period: req.query.period as any,
        clientId: req.query.clientId as string,
        status: req.query.status as string,
      };

      const data = await reportsService.getDashboardReports(workspaceId, filters);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch dashboard reports' });
    }
  }

  /**
   * GET /api/v1/reports/revenue
   */
  async getRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        clientId: req.query.clientId as string,
      };

      const data = await reportsService.getRevenueReport(workspaceId, filters);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch revenue report' });
    }
  }

  /**
   * GET /api/v1/reports/expenses
   */
  async getExpenseReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const data = await reportsService.getExpenseReport(workspaceId, filters);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch expense report' });
    }
  }

  /**
   * GET /api/v1/reports/profit-loss
   */
  async getProfitLossReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const data = await reportsService.getProfitLossReport(workspaceId, {});
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch P&L report' });
    }
  }

  /**
   * GET /api/v1/reports/invoices
   */
  async getInvoiceReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const data = await reportsService.getRevenueReport(workspaceId, {});
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch invoice report' });
    }
  }

  /**
   * GET /api/v1/reports/payments
   */
  async getPaymentReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const data = await reportsService.getRevenueReport(workspaceId, {});
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch payment report' });
    }
  }

  /**
   * GET /api/v1/reports/clients
   */
  async getClientReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const data = await reportsService.getRevenueReport(workspaceId, {});
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch client report' });
    }
  }

  /**
   * GET /api/v1/reports/products
   */
  async getProductReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const data = await reportsService.getRevenueReport(workspaceId, {});
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to fetch product report' });
    }
  }

  /**
   * GET /api/v1/reports/export
   */
  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string);
      const reportType = (req.query.type as string) || 'summary';

      if (!workspaceId) {
        res.status(400).json({ success: false, error: 'Workspace ID is required' });
        return;
      }

      const csvContent = await reportsService.generateCSVExport(workspaceId, reportType);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ledgerly_${reportType}_report.csv"`);
      res.status(200).send(csvContent);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to export report' });
    }
  }
}
