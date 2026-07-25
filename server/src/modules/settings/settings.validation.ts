import { z } from 'zod';

export const updateCompanySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const updateBillingSchema = z.object({
  invoicePrefix: z.string().optional(),
  quotationPrefix: z.string().optional(),
  paymentPrefix: z.string().optional(),
  expensePrefix: z.string().optional(),
  startingNumber: z.number().int().min(1).optional(),
  autoIncrement: z.boolean().optional(),
  defaultPaymentTerms: z.string().optional(),
  invoiceDueDays: z.number().int().min(0).optional(),
});

export const updateLocalizationSchema = z.object({
  currency: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  numberFormat: z.string().optional(),
  firstDayOfWeek: z.string().optional(),
});

export const updateTaxSchema = z.object({
  gstEnabled: z.boolean().optional(),
  defaultGST: z.number().min(0).max(100).optional(),
  cgst: z.number().min(0).max(100).optional(),
  sgst: z.number().min(0).max(100).optional(),
  igst: z.number().min(0).max(100).optional(),
  taxInclusive: z.boolean().optional(),
});

export const updateInvoiceSchema = z.object({
  invoiceTemplate: z.string().optional(),
  footer: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  showLogo: z.boolean().optional(),
  showSignature: z.boolean().optional(),
  showQRCode: z.boolean().optional(),
});

export const updateNotificationSchema = z.object({
  emailNotifications: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  invoiceAlerts: z.boolean().optional(),
  paymentAlerts: z.boolean().optional(),
  expenseAlerts: z.boolean().optional(),
  customerAlerts: z.boolean().optional(),
});

export const updateBrandingSchema = z.object({
  companyLogo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code').optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code').optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code').optional(),
});

export const updateSecuritySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.string().optional(),
  autoLogout: z.boolean().optional(),
});
