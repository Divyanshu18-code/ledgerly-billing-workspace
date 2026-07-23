import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
const reportsController = new ReportsController();

// Require authentication for all report endpoints
router.use(requireAuth);

router.get(
  '/dashboard',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getDashboardReports.bind(reportsController)
);

router.get(
  '/revenue',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getRevenueReport.bind(reportsController)
);

router.get(
  '/expenses',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getExpenseReport.bind(reportsController)
);

router.get(
  '/profit-loss',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getProfitLossReport.bind(reportsController)
);

router.get(
  '/invoices',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getInvoiceReport.bind(reportsController)
);

router.get(
  '/payments',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getPaymentReport.bind(reportsController)
);

router.get(
  '/clients',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getClientReport.bind(reportsController)
);

router.get(
  '/products',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.getProductReport.bind(reportsController)
);

router.get(
  '/export',
  requireRole(['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'VIEWER']),
  reportsController.exportReport.bind(reportsController)
);

export default router;
