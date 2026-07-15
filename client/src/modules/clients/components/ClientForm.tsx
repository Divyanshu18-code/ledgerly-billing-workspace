import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  billingAddress: addressSchema,
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Client Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Acme Corporation"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="billing@acme.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-gray-400 dark:text-gray-550">(Optional)</span></label>
            <input
              type="text"
              {...register('phone')}
              placeholder="+1 (555) 019-2834"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Identification / GSTIN <span className="text-gray-400 dark:text-gray-550">(Optional)</span></label>
            <input
              type="text"
              {...register('taxNumber')}
              placeholder="e.g. GSTIN123456"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Billing Address</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
            <input
              type="text"
              {...register('billingAddress.street')}
              placeholder="123 Financial Way"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
            {errors.billingAddress?.street && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.billingAddress.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input
                type="text"
                {...register('billingAddress.city')}
                placeholder="New York"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              />
              {errors.billingAddress?.city && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.billingAddress.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State / Region</label>
              <input
                type="text"
                {...register('billingAddress.state')}
                placeholder="NY"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              />
              {errors.billingAddress?.state && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.billingAddress.state.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <input
                type="text"
                {...register('billingAddress.country')}
                placeholder="United States"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              />
              {errors.billingAddress?.country && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.billingAddress.country.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
              <input
                type="text"
                {...register('billingAddress.postalCode')}
                placeholder="10001"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              />
              {errors.billingAddress?.postalCode && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.billingAddress.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-white/10 pt-6 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium disabled:opacity-50 transition text-sm cursor-pointer shadow-lg"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Client
        </button>
      </div>
    </form>
  );
};
