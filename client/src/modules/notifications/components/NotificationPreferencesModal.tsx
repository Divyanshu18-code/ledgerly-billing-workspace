import React, { useEffect, useState } from 'react';
import { X, Bell, Mail, FileText, DollarSign, Receipt, Settings } from 'lucide-react';
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../hooks/useNotifications';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: prefs, isLoading } = useNotificationPreferencesQuery();
  const updateMutation = useUpdateNotificationPreferencesMutation();

  const [form, setForm] = useState({
    emailNotifications: true,
    invoiceAlerts: true,
    paymentAlerts: true,
    quotationAlerts: true,
    expenseAlerts: true,
    systemAlerts: true,
  });

  useEffect(() => {
    if (prefs) {
      setForm({
        emailNotifications: prefs.emailNotifications ?? true,
        invoiceAlerts: prefs.invoiceAlerts ?? true,
        paymentAlerts: prefs.paymentAlerts ?? true,
        quotationAlerts: prefs.quotationAlerts ?? true,
        expenseAlerts: prefs.expenseAlerts ?? true,
        systemAlerts: prefs.systemAlerts ?? true,
      });
    }
  }, [prefs]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof typeof form) => {
    const updated = { ...form, [key]: !form[key] };
    setForm(updated);
    updateMutation.mutate(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                Notification Preferences
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your alert channels and events
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Toggles */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading preferences...</div>
        ) : (
          <div className="space-y-3">
            {[
              {
                key: 'emailNotifications' as const,
                title: 'Email Notifications',
                desc: 'Receive digest and instant alerts via email',
                icon: Mail,
              },
              {
                key: 'invoiceAlerts' as const,
                title: 'Invoice Alerts',
                desc: 'When invoices are created, sent, or overdue',
                icon: FileText,
              },
              {
                key: 'paymentAlerts' as const,
                title: 'Payment Alerts',
                desc: 'When payments are recorded or cleared',
                icon: DollarSign,
              },
              {
                key: 'expenseAlerts' as const,
                title: 'Expense Alerts',
                desc: 'When new team operating expenses are logged',
                icon: Receipt,
              },
              {
                key: 'systemAlerts' as const,
                title: 'System & Security Alerts',
                desc: 'Workspace settings changes and team invites',
                icon: Settings,
              },
            ].map(({ key, title, desc, icon: Icon }) => (
              <div
                key={key}
                onClick={() => handleToggle(key)}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-200/50 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>

                <div
                  className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                    form[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                      form[key] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
