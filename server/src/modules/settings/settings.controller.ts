import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { BusinessSettingsService } from './settings.service';
import {
  updateCompanySchema,
  updateBillingSchema,
  updateLocalizationSchema,
  updateTaxSchema,
  updateInvoiceSchema,
  updateNotificationSchema,
  updateBrandingSchema,
  updateSecuritySchema,
} from './settings.validation';

const settingsService = new BusinessSettingsService();

export class BusinessSettingsController {
  async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const settings = await settingsService.getSettings(workspaceId);
      return res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateCompany(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateCompanySchema.parse(req.body);
      const updated = await settingsService.updateCompanyProfile(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Company profile updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateBilling(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateBillingSchema.parse(req.body);
      const updated = await settingsService.updateBillingConfig(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Billing configuration updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateLocalization(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateLocalizationSchema.parse(req.body);
      const updated = await settingsService.updateLocalization(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Localization settings updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateTax(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateTaxSchema.parse(req.body);
      const updated = await settingsService.updateTaxSettings(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Tax settings updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateInvoiceSchema.parse(req.body);
      const updated = await settingsService.updateInvoiceSettings(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Invoice settings updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateNotificationSchema.parse(req.body);
      const updated = await settingsService.updateNotificationSettings(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Notification preferences updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateBranding(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateBrandingSchema.parse(req.body);
      const updated = await settingsService.updateBranding(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Branding updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateSecurity(req: AuthenticatedRequest, res: Response) {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ success: false, message: 'Workspace ID required' });
      }

      const validated = updateSecuritySchema.parse(req.body);
      const updated = await settingsService.updateSecuritySettings(workspaceId, validated);
      return res.status(200).json({ success: true, data: updated, message: 'Security settings updated' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
