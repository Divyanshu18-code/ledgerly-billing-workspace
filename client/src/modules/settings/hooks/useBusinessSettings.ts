import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface BusinessSettingsData {
  id: string;
  workspaceId: string;
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
  invoicePrefix: string;
  quotationPrefix: string;
  paymentPrefix: string;
  expensePrefix: string;
  startingNumber: number;
  autoIncrement: boolean;
  defaultPaymentTerms: string;
  invoiceDueDays: number;
  currency: string;
  timezone: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  firstDayOfWeek: string;
  gstEnabled: boolean;
  defaultGST: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxInclusive: boolean;
  invoiceTemplate: string;
  footer?: string;
  notes?: string;
  terms?: string;
  showLogo: boolean;
  showSignature: boolean;
  showQRCode: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  invoiceAlerts: boolean;
  paymentAlerts: boolean;
  expenseAlerts: boolean;
  customerAlerts: boolean;
  companyLogo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  autoLogout: boolean;
}

export const useBusinessSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<BusinessSettingsData>({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const res = await apiClient.get('/settings');
      return res.data.data;
    },
  });

  const updateSectionMutation = (subpath: string) =>
    useMutation({
      mutationFn: async (payload: any) => {
        const res = await apiClient.put(`/settings/${subpath}`, payload);
        return res.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['business-settings'] });
      },
    });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateCompany: updateSectionMutation('company'),
    updateBilling: updateSectionMutation('billing'),
    updateLocalization: updateSectionMutation('localization'),
    updateTax: updateSectionMutation('tax'),
    updateInvoice: updateSectionMutation('invoice'),
    updateNotifications: updateSectionMutation('notifications'),
    updateBranding: updateSectionMutation('branding'),
    updateSecurity: updateSectionMutation('security'),
  };
};
