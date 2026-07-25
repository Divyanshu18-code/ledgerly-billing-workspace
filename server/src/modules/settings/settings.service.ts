import { BusinessSettingsRepository } from './settings.repository';
import {
  CompanyProfileDto,
  BillingConfigDto,
  LocalizationDto,
  TaxSettingsDto,
  InvoiceSettingsDto,
  NotificationSettingsDto,
  BrandingDto,
  SecuritySettingsDto,
} from './settings.types';

export class BusinessSettingsService {
  private repository: BusinessSettingsRepository;

  constructor() {
    this.repository = new BusinessSettingsRepository();
  }

  async getSettings(workspaceId: string) {
    return await this.repository.getSettings(workspaceId);
  }

  async updateCompanyProfile(workspaceId: string, data: CompanyProfileDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateBillingConfig(workspaceId: string, data: BillingConfigDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateLocalization(workspaceId: string, data: LocalizationDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateTaxSettings(workspaceId: string, data: TaxSettingsDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateInvoiceSettings(workspaceId: string, data: InvoiceSettingsDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateNotificationSettings(workspaceId: string, data: NotificationSettingsDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateBranding(workspaceId: string, data: BrandingDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }

  async updateSecuritySettings(workspaceId: string, data: SecuritySettingsDto) {
    return await this.repository.updateSettings(workspaceId, data);
  }
}
