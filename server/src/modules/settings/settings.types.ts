export interface CompanyProfileDto {
  companyName: string;
  businessType?: string;
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface BillingConfigDto {
  invoicePrefix?: string;
  quotationPrefix?: string;
  paymentPrefix?: string;
  expensePrefix?: string;
  startingNumber?: number;
  autoIncrement?: boolean;
  defaultPaymentTerms?: string;
  invoiceDueDays?: number;
}

export interface LocalizationDto {
  currency?: string;
  timezone?: string;
  language?: string;
  dateFormat?: string;
  numberFormat?: string;
  firstDayOfWeek?: string;
}

export interface TaxSettingsDto {
  gstEnabled?: boolean;
  defaultGST?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  taxInclusive?: boolean;
}

export interface InvoiceSettingsDto {
  invoiceTemplate?: string;
  footer?: string;
  notes?: string;
  terms?: string;
  showLogo?: boolean;
  showSignature?: boolean;
  showQRCode?: boolean;
}

export interface NotificationSettingsDto {
  emailNotifications?: boolean;
  browserNotifications?: boolean;
  invoiceAlerts?: boolean;
  paymentAlerts?: boolean;
  expenseAlerts?: boolean;
  customerAlerts?: boolean;
}

export interface BrandingDto {
  companyLogo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface SecuritySettingsDto {
  twoFactorEnabled?: boolean;
  sessionTimeout?: string;
  autoLogout?: boolean;
}
