import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { BusinessSettingsController } from './settings.controller';

const router = Router();
const controller = new BusinessSettingsController();

router.use(requireAuth);

router.get('/', (req, res) => controller.getSettings(req, res));
router.put('/company', (req, res) => controller.updateCompany(req, res));
router.put('/billing', (req, res) => controller.updateBilling(req, res));
router.put('/localization', (req, res) => controller.updateLocalization(req, res));
router.put('/tax', (req, res) => controller.updateTax(req, res));
router.put('/invoice', (req, res) => controller.updateInvoice(req, res));
router.put('/notifications', (req, res) => controller.updateNotifications(req, res));
router.put('/branding', (req, res) => controller.updateBranding(req, res));
router.put('/security', (req, res) => controller.updateSecurity(req, res));

export default router;
