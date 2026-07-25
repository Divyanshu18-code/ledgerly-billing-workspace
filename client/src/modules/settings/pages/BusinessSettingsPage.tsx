import React, { useState } from 'react';
import {
  Building,
  CreditCard,
  Globe,
  Receipt,
  FileText,
  FileSpreadsheet,
  Bell,
  Palette,
  ShieldCheck,
  Users,
  Zap,
  Bot,
  AlertTriangle,
  Save,
  Check,
  Eye,
  X,
  Plus,
} from 'lucide-react';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { CustomSelect } from '@/components/ui/CustomSelect';

export type SettingsSection =
  | 'company'
  | 'billing'
  | 'localization'
  | 'tax'
  | 'invoice'
  | 'quotation'
  | 'notifications'
  | 'branding'
  | 'security'
  | 'team'
  | 'integrations'
  | 'ai'
  | 'danger';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  permissions: string;
  status: 'ACTIVE' | 'INVITED';
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  comingSoon?: boolean;
}

export const BusinessSettingsPage: React.FC = () => {
  const { data: workspace } = useWorkspaceData();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('company');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modals & Dialogs
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [dangerModal, setDangerModal] = useState<'reset' | 'workspace' | 'account' | null>(null);

  // 1. COMPANY PROFILE STATE
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState(workspace?.name || 'Alex Enterprise Group');
  const [businessType, setBusinessType] = useState('Private Limited (Pvt Ltd)');
  const [gstin, setGstin] = useState('07AAAAA0000A1Z5');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [regNumber, setRegNumber] = useState('REG-2024-889102');
  const [email, setEmail] = useState(user?.email || 'billing@alexenterprise.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [website, setWebsite] = useState('https://alexenterprise.com');
  const [address, setAddress] = useState('Suite 402, Technology Park, Sector 62');
  const [city, setCity] = useState('Noida');
  const [state, setState] = useState('Uttar Pradesh');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('201309');

  // 2. BILLING CONFIGURATION STATE
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026-');
  const [quotationPrefix, setQuotationPrefix] = useState('QT-2026-');
  const [paymentPrefix, setPaymentPrefix] = useState('PAY-2026-');
  const [expensePrefix, setExpensePrefix] = useState('EXP-2026-');
  const [startingNumber, setStartingNumber] = useState(1001);
  const [autoIncrement, setAutoIncrement] = useState(true);
  const [defaultTerms, setDefaultTerms] = useState('Due on Receipt');
  const [invoiceDueDays, setInvoiceDueDays] = useState(30);
  const [currencySymbol, setCurrencySymbol] = useState(workspace?.currency === 'USD' ? '$' : '₹');
  const [decimalPrecision, setDecimalPrecision] = useState(2);

  // 3. CURRENCY & LOCALIZATION STATE
  const [currency, setCurrency] = useState(workspace?.currency || 'INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST +5:30)');
  const [language, setLanguage] = useState('English (US)');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState('1,23,456.00 (Indian Standard)');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');

  // 4. TAX SETTINGS STATE
  const [enableGst, setEnableGst] = useState(true);
  const [defaultGstRate, setDefaultGstRate] = useState(18);
  const [cgstRate, setCgstRate] = useState(9);
  const [sgstRate, setSgstRate] = useState(9);
  const [igstRate, setIgstRate] = useState(18);
  const [taxInclusive, setTaxInclusive] = useState(false);

  // 5. INVOICE SETTINGS STATE
  const [invoiceTemplate, setInvoiceTemplate] = useState('Modern Glass');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for choosing Alex Enterprise Group. Computer generated invoice.');
  const [defaultInvoiceNotes, setDefaultInvoiceNotes] = useState('Please remit payment within due days to avoid 1.5% late interest fee.');
  const [showLogo, setShowLogo] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);

  // 6. QUOTATION SETTINGS STATE
  const [quotationValidityDays, setQuotationValidityDays] = useState(30);
  const [quotationTerms, setQuotationTerms] = useState('Estimate valid for 30 days. Prices subject to inventory availability.');
  const [quotationAutoNumbering, setQuotationAutoNumbering] = useState(true);

  // 7. NOTIFICATION PREFERENCES STATE
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifBrowser, setNotifBrowser] = useState(true);
  const [notifInvoice, setNotifInvoice] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifExpense, setNotifExpense] = useState(false);
  const [notifCustomer, setNotifCustomer] = useState(true);

  // 8. BRANDING STATE
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [accentColor, setAccentColor] = useState('#10b981');

  // 9. SECURITY STATE
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60 Minutes');
  const [autoLogout, setAutoLogout] = useState(true);

  // 10. TEAM & ROLES STATE
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: `${user?.firstName || 'Divyanshu'} ${user?.lastName || 'Pandey'}`, email: user?.email || 'admin@ledgerly.io', role: 'OWNER', permissions: 'Full System Access', status: 'ACTIVE' },
    { id: '2', name: 'Alex Johnson', email: 'alex@enterprise.com', role: 'ADMIN', permissions: 'Invoices, Expenses, Payments', status: 'ACTIVE' },
    { id: '3', name: 'Sarah Miller', email: 'sarah@enterprise.com', role: 'MEMBER', permissions: 'Invoices & Quotations Only', status: 'INVITED' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER');

  // 11. INTEGRATIONS STATE
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'stripe', name: 'Stripe Gateway', description: 'Accept online card payments directly on digital invoices.', icon: '💳', status: 'DISCONNECTED', comingSoon: true },
    { id: 'razorpay', name: 'Razorpay UPI', description: 'Instant Indian UPI & netbanking invoice collection.', icon: '⚡', status: 'CONNECTED', comingSoon: false },
    { id: 'drive', name: 'Google Drive Sync', description: 'Auto-backup monthly invoice PDFs to Google Drive.', icon: '📁', status: 'DISCONNECTED', comingSoon: true },
    { id: 'calendar', name: 'Google Calendar', description: 'Sync invoice due dates to team calendar.', icon: '📅', status: 'DISCONNECTED', comingSoon: true },
    { id: 'slack', name: 'Slack Notifications', description: 'Receive instant payment alerts in Slack channels.', icon: '💬', status: 'DISCONNECTED', comingSoon: true },
    { id: 'email', name: 'Custom SMTP Email', description: 'Send invoices from your own branded domain email.', icon: '✉️', status: 'CONNECTED', comingSoon: false },
  ]);

  // 12. AI SETTINGS STATE
  const [enableAiAssistant, setEnableAiAssistant] = useState(true);
  const [aiInvoiceSuggestions, setAiInvoiceSuggestions] = useState(true);
  const [aiExpenseCategorization, setAiExpenseCategorization] = useState(true);
  const [aiBusinessInsights, setAiBusinessInsights] = useState(true);
  const [aiForecasting, setAiForecasting] = useState(true);

  const {
    settings,
    updateCompany,
    updateBilling,
    updateLocalization,
    updateTax,
    updateInvoice,
    updateNotifications,
    updateBranding,
    updateSecurity,
  } = useBusinessSettings();

  // Auto-fill state when backend settings load
  React.useEffect(() => {
    if (settings) {
      if (settings.companyName) setCompanyName(settings.companyName);
      if (settings.businessType) setBusinessType(settings.businessType);
      if (settings.gstNumber) setGstin(settings.gstNumber);
      if (settings.panNumber) setPanNumber(settings.panNumber);
      if (settings.registrationNumber) setRegNumber(settings.registrationNumber);
      if (settings.email) setEmail(settings.email);
      if (settings.phone) setPhone(settings.phone);
      if (settings.website) setWebsite(settings.website);
      if (settings.address) setAddress(settings.address);
      if (settings.city) setCity(settings.city);
      if (settings.state) setState(settings.state);
      if (settings.country) setCountry(settings.country);
      if (settings.postalCode) setPostalCode(settings.postalCode);
      if (settings.invoicePrefix) setInvoicePrefix(settings.invoicePrefix);
      if (settings.quotationPrefix) setQuotationPrefix(settings.quotationPrefix);
      if (settings.paymentPrefix) setPaymentPrefix(settings.paymentPrefix);
      if (settings.expensePrefix) setExpensePrefix(settings.expensePrefix);
      if (settings.startingNumber) setStartingNumber(settings.startingNumber);
      if (settings.autoIncrement !== undefined) setAutoIncrement(settings.autoIncrement);
      if (settings.defaultPaymentTerms) setDefaultTerms(settings.defaultPaymentTerms);
      if (settings.invoiceDueDays) setInvoiceDueDays(settings.invoiceDueDays);
      if (settings.currency) setCurrency(settings.currency);
      if (settings.timezone) setTimezone(settings.timezone);
      if (settings.language) setLanguage(settings.language);
      if (settings.dateFormat) setDateFormat(settings.dateFormat);
      if (settings.numberFormat) setNumberFormat(settings.numberFormat);
      if (settings.firstDayOfWeek) setFirstDayOfWeek(settings.firstDayOfWeek);
      if (settings.gstEnabled !== undefined) setEnableGst(settings.gstEnabled);
      if (settings.defaultGST !== undefined) setDefaultGstRate(settings.defaultGST);
      if (settings.cgst !== undefined) setCgstRate(settings.cgst);
      if (settings.sgst !== undefined) setSgstRate(settings.sgst);
      if (settings.igst !== undefined) setIgstRate(settings.igst);
      if (settings.taxInclusive !== undefined) setTaxInclusive(settings.taxInclusive);
      if (settings.invoiceTemplate) setInvoiceTemplate(settings.invoiceTemplate);
      if (settings.footer) setInvoiceFooter(settings.footer);
      if (settings.notes) setDefaultInvoiceNotes(settings.notes);
      if (settings.showLogo !== undefined) setShowLogo(settings.showLogo);
      if (settings.showSignature !== undefined) setShowSignature(settings.showSignature);
      if (settings.showQRCode !== undefined) setShowQrCode(settings.showQRCode);
      if (settings.emailNotifications !== undefined) setNotifEmail(settings.emailNotifications);
      if (settings.browserNotifications !== undefined) setNotifBrowser(settings.browserNotifications);
      if (settings.invoiceAlerts !== undefined) setNotifInvoice(settings.invoiceAlerts);
      if (settings.paymentAlerts !== undefined) setNotifPayment(settings.paymentAlerts);
      if (settings.expenseAlerts !== undefined) setNotifExpense(settings.expenseAlerts);
      if (settings.customerAlerts !== undefined) setNotifCustomer(settings.customerAlerts);
      if (settings.companyLogo) setCompanyLogo(settings.companyLogo);
      if (settings.favicon) setFaviconUrl(settings.favicon);
      if (settings.primaryColor) setPrimaryColor(settings.primaryColor);
      if (settings.secondaryColor) setSecondaryColor(settings.secondaryColor);
      if (settings.accentColor) setAccentColor(settings.accentColor);
      if (settings.twoFactorEnabled !== undefined) setEnable2FA(settings.twoFactorEnabled);
      if (settings.sessionTimeout) setSessionTimeout(settings.sessionTimeout);
      if (settings.autoLogout !== undefined) setAutoLogout(settings.autoLogout);
    }
  }, [settings]);

  const triggerSaveNotification = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleGlobalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeSection === 'company') {
        await updateCompany.mutateAsync({
          companyName,
          businessType,
          gstNumber: gstin,
          panNumber,
          registrationNumber: regNumber,
          email,
          phone,
          website,
          address,
          city,
          state,
          country,
          postalCode,
        });
      } else if (activeSection === 'billing') {
        await updateBilling.mutateAsync({
          invoicePrefix,
          quotationPrefix,
          paymentPrefix,
          expensePrefix,
          startingNumber,
          autoIncrement,
          defaultPaymentTerms: defaultTerms,
          invoiceDueDays,
        });
      } else if (activeSection === 'localization') {
        await updateLocalization.mutateAsync({
          currency,
          timezone,
          language,
          dateFormat,
          numberFormat,
          firstDayOfWeek,
        });
      } else if (activeSection === 'tax') {
        await updateTax.mutateAsync({
          gstEnabled: enableGst,
          defaultGST: defaultGstRate,
          cgst: cgstRate,
          sgst: sgstRate,
          igst: igstRate,
          taxInclusive,
        });
      } else if (activeSection === 'invoice') {
        await updateInvoice.mutateAsync({
          invoiceTemplate,
          footer: invoiceFooter,
          notes: defaultInvoiceNotes,
          showLogo,
          showSignature,
          showQRCode: showQrCode,
        });
      } else if (activeSection === 'notifications') {
        await updateNotifications.mutateAsync({
          emailNotifications: notifEmail,
          browserNotifications: notifBrowser,
          invoiceAlerts: notifInvoice,
          paymentAlerts: notifPayment,
          expenseAlerts: notifExpense,
          customerAlerts: notifCustomer,
        });
      } else if (activeSection === 'branding') {
        await updateBranding.mutateAsync({
          companyLogo: companyLogo || undefined,
          favicon: faviconUrl || undefined,
          primaryColor,
          secondaryColor,
          accentColor,
        });
      } else if (activeSection === 'security') {
        await updateSecurity.mutateAsync({
          twoFactorEnabled: enable2FA,
          sessionTimeout,
          autoLogout,
        });
      }
      triggerSaveNotification('Settings saved successfully!');
    } catch (err: any) {
      triggerSaveNotification(err?.response?.data?.message || 'Error saving settings');
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: TeamMember = {
      id: String(teamMembers.length + 1),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      permissions: inviteRole === 'ADMIN' ? 'All Modules' : 'Sales & Invoices Only',
      status: 'INVITED',
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
    triggerSaveNotification(`Invitation sent to ${inviteEmail}`);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
          triggerSaveNotification(`${item.name} is now ${nextStatus.toLowerCase()}`);
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  interface SectionItem {
    id: SettingsSection;
    label: string;
    icon: any;
    danger?: boolean;
  }

  const sectionsList: SectionItem[] = [
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'billing', label: 'Billing Configuration', icon: CreditCard },
    { id: 'localization', label: 'Currency & Localization', icon: Globe },
    { id: 'tax', label: 'Tax Settings', icon: Receipt },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'quotation', label: 'Quotation Settings', icon: FileSpreadsheet },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'branding', label: 'Branding & Theme', icon: Palette },
    { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Business Settings</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure company profile, invoice numbering, tax rules, branding, security, and team roles.
          </p>
        </div>
      </div>

      {saveToast && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="h-4 w-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main 2-Pane Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sticky Left Navigation Pane */}
        <div className="lg:col-span-1 p-2 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs space-y-1 sticky top-24 z-10">
          {sectionsList.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as SettingsSection)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : sec.danger
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-600/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : sec.danger ? 'text-red-500' : 'text-gray-400'}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Area */}
        <div className="lg:col-span-3 p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#121118]/80 backdrop-blur-xl shadow-xs">
          <form onSubmit={handleGlobalSave} className="space-y-6 text-xs">
            {/* 1. COMPANY PROFILE */}
            {activeSection === 'company' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Company Profile & Registration
                </h3>

                {/* Logo Upload Card */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div className="h-16 w-16 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl overflow-hidden shrink-0">
                    {companyLogo ? <img src={companyLogo} alt="Logo" className="h-full w-full object-cover" /> : 'L'}
                  </div>
                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Company Logo</p>
                    <p className="text-[11px] text-gray-400">PNG, JPG or SVG under 2MB. Displayed on invoices & proposals.</p>
                  </div>
                  <label className="px-3.5 py-2 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-semibold text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-white/20 transition">
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCompanyLogo(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Company Name *</label>
                    <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Business Type</label>
                    <input type="text" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">GSTIN Number</label>
                    <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">PAN Number</label>
                    <input type="text" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Registration / CIN</label>
                    <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Billing Email *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Website URL</label>
                    <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address Details</label>
                  <input type="text" placeholder="Street Address..." value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                    <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                    <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                    <input type="text" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. BILLING CONFIGURATION */}
            {activeSection === 'billing' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Invoice & Document Numbering Sequences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice Prefix</label>
                    <input type="text" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Quotation Prefix</label>
                    <input type="text" value={quotationPrefix} onChange={(e) => setQuotationPrefix(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Payment Prefix</label>
                    <input type="text" value={paymentPrefix} onChange={(e) => setPaymentPrefix(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Expense Prefix</label>
                    <input type="text" value={expensePrefix} onChange={(e) => setExpensePrefix(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Starting Number</label>
                    <input type="number" value={startingNumber} onChange={(e) => setStartingNumber(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice Due Days</label>
                    <input type="number" value={invoiceDueDays} onChange={(e) => setInvoiceDueDays(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Decimal Precision</label>
                    <CustomSelect
                      value={decimalPrecision}
                      onChange={(val) => setDecimalPrecision(Number(val))}
                      options={[
                        { value: 2, label: '2 Decimals (0.00)' },
                        { value: 3, label: '3 Decimals (0.000)' },
                        { value: 0, label: 'No Decimals (0)' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Default Payment Terms</label>
                    <input type="text" value={defaultTerms} onChange={(e) => setDefaultTerms(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Currency Symbol</label>
                    <input type="text" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Auto-Increment Document Numbers</p>
                    <p className="text-[11px] text-gray-400">Automatically increment invoice numbers sequentially on creation.</p>
                  </div>
                  <input type="checkbox" checked={autoIncrement} onChange={(e) => setAutoIncrement(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                </div>
              </div>
            )}

            {/* 3. CURRENCY & LOCALIZATION */}
            {activeSection === 'localization' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Currency, Language & Format Standards
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Base Currency</label>
                    <CustomSelect
                      value={currency}
                      onChange={(val) => setCurrency(val)}
                      options={[
                        { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                        { value: 'USD', label: 'USD ($) - US Dollar' },
                        { value: 'EUR', label: 'EUR (€) - Euro' },
                        { value: 'GBP', label: 'GBP (£) - British Pound' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Timezone</label>
                    <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Language</label>
                    <CustomSelect
                      value={language}
                      onChange={(val) => setLanguage(val)}
                      options={[
                        { value: 'English (US)', label: 'English (US)' },
                        { value: 'English (UK)', label: 'English (UK)' },
                        { value: 'Hindi', label: 'Hindi (हिंदी)' },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Date Format</label>
                    <CustomSelect
                      value={dateFormat}
                      onChange={(val) => setDateFormat(val)}
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">First Day of Week</label>
                    <CustomSelect
                      value={firstDayOfWeek}
                      onChange={(val) => setFirstDayOfWeek(val)}
                      options={[
                        { value: 'Monday', label: 'Monday' },
                        { value: 'Sunday', label: 'Sunday' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Number Format</label>
                    <input type="text" value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* 4. TAX SETTINGS */}
            {activeSection === 'tax' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  GST & Tax Calculations
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Enable GST Compliance</p>
                    <p className="text-[11px] text-gray-400">Calculate CGST, SGST, and IGST automatically on line items.</p>
                  </div>
                  <input type="checkbox" checked={enableGst} onChange={(e) => setEnableGst(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Default GST %</label>
                    <input type="number" value={defaultGstRate} onChange={(e) => setDefaultGstRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">CGST %</label>
                    <input type="number" value={cgstRate} onChange={(e) => setCgstRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">SGST %</label>
                    <input type="number" value={sgstRate} onChange={(e) => setSgstRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">IGST %</label>
                    <input type="number" value={igstRate} onChange={(e) => setIgstRate(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Tax Inclusive Pricing</p>
                    <p className="text-[11px] text-gray-400">If enabled, item price includes tax amount.</p>
                  </div>
                  <input type="checkbox" checked={taxInclusive} onChange={(e) => setTaxInclusive(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                </div>
              </div>
            )}

            {/* 5. INVOICE SETTINGS */}
            {activeSection === 'invoice' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Invoice Templates & Layout Elements
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsInvoicePreviewOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:bg-blue-500/10 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview Invoice</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice Template Layout</label>
                  <CustomSelect
                    value={invoiceTemplate}
                    onChange={(val) => setInvoiceTemplate(val)}
                    options={[
                      { value: 'Modern Glass', label: 'Modern Glass (Default)' },
                      { value: 'Classic Corporate', label: 'Classic Corporate' },
                      { value: 'Minimalist Clean', label: 'Minimalist Clean' },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="font-bold text-gray-900 dark:text-white">Show Company Logo</div>
                    <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="font-bold text-gray-900 dark:text-white">Show Digital Signature</div>
                    <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
                    <div className="font-bold text-gray-900 dark:text-white">Show UPI QR Code</div>
                    <input type="checkbox" checked={showQrCode} onChange={(e) => setShowQrCode(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Invoice Footer Text</label>
                  <input type="text" value={invoiceFooter} onChange={(e) => setInvoiceFooter(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Default Terms & Conditions</label>
                  <textarea rows={3} value={defaultInvoiceNotes} onChange={(e) => setDefaultInvoiceNotes(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                </div>
              </div>
            )}

            {/* 6. QUOTATION SETTINGS */}
            {activeSection === 'quotation' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Estimates & Proposal Preferences
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Default Validity (Days)</label>
                    <input type="number" value={quotationValidityDays} onChange={(e) => setQuotationValidityDays(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Auto-Numbering</p>
                      <p className="text-[11px] text-gray-400">Generate quotation codes automatically.</p>
                    </div>
                    <input type="checkbox" checked={quotationAutoNumbering} onChange={(e) => setQuotationAutoNumbering(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Quotation Terms & Conditions</label>
                  <textarea rows={3} value={quotationTerms} onChange={(e) => setQuotationTerms(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                </div>
              </div>
            )}

            {/* 7. NOTIFICATION PREFERENCES */}
            {activeSection === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Alert Toggles & Channel Preferences
                </h3>

                {[
                  { label: 'Email Notifications', desc: 'Receive daily invoice & payment digests via email.', state: notifEmail, set: setNotifEmail },
                  { label: 'Browser Push Notifications', desc: 'Show desktop popup notifications for business alerts.', state: notifBrowser, set: setNotifBrowser },
                  { label: 'Invoice Alerts', desc: 'Get notified when an invoice is created, sent, or overdue.', state: notifInvoice, set: setNotifInvoice },
                  { label: 'Payment Alerts', desc: 'Instant alerts when a customer pays an invoice online.', state: notifPayment, set: setNotifPayment },
                  { label: 'Expense Alerts', desc: 'Get notified when team members log expenses.', state: notifExpense, set: setNotifExpense },
                  { label: 'Customer Directory Alerts', desc: 'Alerts when new customer contacts are registered.', state: notifCustomer, set: setNotifCustomer },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                    <input type="checkbox" checked={item.state} onChange={(e) => item.set(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                ))}
              </div>
            )}

            {/* 8. BRANDING & THEME */}
            {activeSection === 'branding' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Branding & Theme Color Palette
                </h3>

                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs overflow-hidden shrink-0">
                    {faviconUrl ? <img src={faviconUrl} alt="Favicon" className="h-full w-full object-cover" /> : 'Fav'}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Browser Favicon Icon</p>
                    <p className="text-[11px] text-gray-400">ICO or PNG format (32x32px).</p>
                  </div>
                  <label className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 text-xs font-semibold cursor-pointer">
                    Upload Favicon
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFaviconUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-9 w-12 rounded cursor-pointer" />
                      <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-9 w-12 rounded cursor-pointer" />
                      <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-9 w-12 rounded cursor-pointer" />
                      <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-mono" />
                    </div>
                  </div>
                </div>

                {/* Theme Live Preview Box */}
                <div className="p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50 dark:bg-white/5 space-y-3">
                  <div className="text-[11px] uppercase font-bold text-gray-400">Live Theme Preview</div>
                  <div className="flex items-center gap-3">
                    <button style={{ backgroundColor: primaryColor }} className="px-4 py-2 rounded-xl text-white font-bold shadow-md">
                      Primary Button
                    </button>
                    <button style={{ backgroundColor: accentColor }} className="px-4 py-2 rounded-xl text-white font-bold shadow-md">
                      Accent Action
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. SECURITY */}
            {activeSection === 'security' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Password & Authentication Security
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                    <p className="text-[11px] text-gray-400">Require authenticator app code on login.</p>
                  </div>
                  <input type="checkbox" checked={enable2FA} onChange={(e) => setEnable2FA(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Session Inactivity Timeout</label>
                    <CustomSelect
                      value={sessionTimeout}
                      onChange={(val) => setSessionTimeout(val)}
                      options={[
                        { value: '15 Minutes', label: '15 Minutes' },
                        { value: '30 Minutes', label: '30 Minutes' },
                        { value: '60 Minutes', label: '60 Minutes' },
                        { value: '24 Hours', label: '24 Hours' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Auto Logout on Tab Close</p>
                      <p className="text-[11px] text-gray-400">Invalidate session token immediately on tab close.</p>
                    </div>
                    <input type="checkbox" checked={autoLogout} onChange={(e) => setAutoLogout(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* 10. TEAM & ROLES */}
            {activeSection === 'team' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Team Members & Access Control</h3>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Invite Member</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10 text-[10px] uppercase font-bold text-gray-400 bg-gray-50/50 dark:bg-white/5">
                        <th className="p-3">Member Name</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Permissions</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-medium">
                      {teamMembers.map((m) => (
                        <tr key={m.id}>
                          <td className="p-3">
                            <div className="font-bold text-gray-900 dark:text-white">{m.name}</div>
                            <div className="text-[11px] text-gray-400">{m.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-600/10 text-blue-600 font-bold font-mono text-[10px]">
                              {m.role}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">{m.permissions}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 11. INTEGRATIONS */}
            {activeSection === 'integrations' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Connected Apps & Payment Gateways
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {integrations.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-sm">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          {item.comingSoon ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold text-[9px] uppercase">
                              Coming Soon
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${item.status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-gray-500/10 text-gray-400'}`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="pt-2">
                        {item.comingSoon ? (
                          <button disabled className="w-full py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 font-semibold text-xs opacity-50 cursor-not-allowed">
                            Coming Soon
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleIntegration(item.id)}
                            className={`w-full py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                              item.status === 'CONNECTED'
                                ? 'border border-red-500/30 text-red-600 hover:bg-red-500/10'
                                : 'bg-blue-600 text-white hover:bg-blue-500'
                            }`}
                          >
                            {item.status === 'CONNECTED' ? 'Disconnect' : 'Connect Account'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. AI SETTINGS */}
            {activeSection === 'ai' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">
                  Gemini & Grok AI Automation Features
                </h3>

                {[
                  { label: 'Gemini Financial Assistant', desc: 'Enable AI chatbot for natural language cash flow queries.', state: enableAiAssistant, set: setEnableAiAssistant },
                  { label: 'Smart Invoice Line Generator', desc: 'Auto-generate item descriptions with AI.', state: aiInvoiceSuggestions, set: setAiInvoiceSuggestions },
                  { label: 'AI Expense Categorization', desc: 'Extract vendor details from uploaded receipt images.', state: aiExpenseCategorization, set: setAiExpenseCategorization },
                  { label: 'AI Executive Insights', desc: 'Automated monthly business risk warnings.', state: aiBusinessInsights, set: setAiBusinessInsights },
                  { label: 'Cash Flow Forecasting', desc: 'Predict next quarter invoice collection probabilities.', state: aiForecasting, set: setAiForecasting, comingSoon: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                        {item.comingSoon && (
                          <span className="px-2 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[9px] uppercase">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{item.desc}</p>
                    </div>
                    <input type="checkbox" checked={item.state} onChange={(e) => item.set(e.target.checked)} className="h-5 w-5 rounded accent-blue-600 cursor-pointer" />
                  </div>
                ))}
              </div>
            )}

            {/* 13. DANGER ZONE */}
            {activeSection === 'danger' && (
              <div className="space-y-4 p-4 rounded-2xl border border-red-500/30 bg-red-500/5">
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400 border-b border-red-500/20 pb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Danger Zone Actions
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Destructive actions that cannot be reverted. Please exercise caution.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-white dark:bg-[#16141d]">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Reset Demo Data</p>
                      <p className="text-[11px] text-gray-400">Clear test invoices and reset workspace metrics.</p>
                    </div>
                    <button type="button" onClick={() => setDangerModal('reset')} className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-red-600 font-bold hover:bg-red-500/10 cursor-pointer">
                      Reset Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-white dark:bg-[#16141d]">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Delete Workspace</p>
                      <p className="text-[11px] text-gray-400">Permanently delete current active workspace and team logs.</p>
                    </div>
                    <button type="button" onClick={() => setDangerModal('workspace')} className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 cursor-pointer">
                      Delete Workspace
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-white dark:bg-[#16141d]">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">Delete Account</p>
                      <p className="text-[11px] text-gray-400">Permanently remove user profile and cancel subscription.</p>
                    </div>
                    <button type="button" onClick={() => setDangerModal('account')} className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 cursor-pointer">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GLOBAL SAVE CTA */}
            {activeSection !== 'danger' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer">
                  <Save className="h-4 w-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* INVOICE PREVIEW MODAL */}
      {isInvoicePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Invoice Live Template Preview</h3>
              <button onClick={() => setIsInvoicePreviewOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151e] space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">{companyName}</h4>
                  <p className="text-[11px] text-gray-400">{address}, {city}</p>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-base">{invoicePrefix}0001</div>
                  <div className="text-[10px] text-gray-400">Date: 25/07/2026</div>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 dark:border-white/10 py-3 flex justify-between font-mono">
                <span>Sample Item Line x1</span>
                <span className="font-bold">{currencySymbol}1,500.00</span>
              </div>

              {showQrCode && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 text-center font-mono text-[10px] text-gray-400">
                  [ UPI / QR Code Payment Block ]
                </div>
              )}

              <p className="text-[11px] text-gray-400 italic text-center border-t border-gray-100 pt-2">
                {invoiceFooter}
              </p>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setIsInvoicePreviewOpen(false)} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Email Address *</label>
                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Role & Permissions</label>
                <CustomSelect
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val)}
                  options={[
                    { value: 'ADMIN', label: 'ADMIN (Full Manage Rights)' },
                    { value: 'MEMBER', label: 'MEMBER (Sales & Invoices)' },
                    { value: 'VIEWER', label: 'VIEWER (Read-Only)' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DANGER ZONE CONFIRMATION DIALOG */}
      {dangerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm p-6 rounded-[22px] border border-red-500/30 bg-white dark:bg-[#121118] shadow-2xl text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Confirm {dangerModal === 'reset' ? 'Data Reset' : dangerModal === 'workspace' ? 'Workspace Deletion' : 'Account Deletion'}?
            </h3>
            <p className="text-xs text-gray-500">
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDangerModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => {
                  setDangerModal(null);
                  triggerSaveNotification(`Action executed successfully`);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
