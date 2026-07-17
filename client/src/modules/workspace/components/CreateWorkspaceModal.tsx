import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWorkspaceCreate } from '../hooks/useWorkspace';
import { X, Building, ShieldAlert, Loader2, ChevronDown } from 'lucide-react';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  financialYear: z.string().min(1, 'Financial year is required'),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newWorkspaceId: string) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useWorkspaceCreate();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = React.useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = React.useState(false);

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC / GMT' },
    { value: 'Asia/Kolkata', label: 'Asia / Kolkata (IST)' },
    { value: 'America/New_York', label: 'America / New York (EST)' },
    { value: 'Europe/London', label: 'Europe / London (BST)' },
    { value: 'Asia/Singapore', label: 'Asia / Singapore' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      currency: 'USD',
      timezone: 'UTC',
      invoicePrefix: 'INV-',
      financialYear: '2026-2027',
    },
  });

  const selectedCurrency = watch('currency');
  const selectedTimezone = watch('timezone');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        currency: 'USD',
        timezone: 'UTC',
        invoicePrefix: 'INV-',
        financialYear: '2026-2027',
      });
      setSubmitError(null);
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    setSubmitError(null);
    try {
      const result = await createMutation.mutateAsync(data);
      onSuccess(result.id);
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to create workspace. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-55 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Create New Workspace</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Setup a new independent business tenant profile.</p>
          </div>
        </div>

        {submitError && (
          <div className="p-3 mb-4 text-xs text-red-500 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Company Legal Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="ex. Acme Corporation"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Invoice Prefix</label>
              <input
                type="text"
                {...register('invoicePrefix')}
                placeholder="ex. INV-"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
              {errors.invoicePrefix && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.invoicePrefix.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Financial Year</label>
              <input
                type="text"
                {...register('financialYear')}
                placeholder="ex. 2026-2027"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
              />
              {errors.financialYear && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.financialYear.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Currency Selector */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Base Currency</label>
              <button
                type="button"
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-card text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{currencyOptions.find((opt) => opt.value === selectedCurrency)?.label || selectedCurrency}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {isCurrencyOpen && (
                <div className="absolute z-30 mt-1 w-full rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-1 shadow-2xl animate-fade-in max-h-40 overflow-y-auto">
                  {currencyOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setValue('currency', opt.value);
                        setIsCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer transition ${
                        selectedCurrency === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Timezone Selector */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Timezone</label>
              <button
                type="button"
                onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-card text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">{timezoneOptions.find((opt) => opt.value === selectedTimezone)?.label || selectedTimezone}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {isTimezoneOpen && (
                <div className="absolute z-30 mt-1 w-full rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-1 shadow-2xl animate-fade-in max-h-40 overflow-y-auto">
                  {timezoneOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setValue('timezone', opt.value);
                        setIsTimezoneOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer transition ${
                        selectedTimezone === opt.value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-lg border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Create Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
