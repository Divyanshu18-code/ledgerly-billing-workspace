import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import type { Client } from '../hooks/useClients';

const clientFormSchema = z.object({
  name: z.string().min(1, 'Client full name is required'),
  companyName: z.string().optional().nullable(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  billingAddress: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  initialData?: Partial<Client>;
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
  // Helper to format initial address string if it was JSON
  const formatInitialAddress = (addr: any) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const parts = [addr.street, addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean);
      return parts.join(', ');
    }
    return '';
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      companyName: initialData?.companyName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      taxNumber: initialData?.taxNumber || '',
      status: initialData?.status || 'ACTIVE',
      billingAddress: formatInitialAddress(initialData?.billingAddress),
      shippingAddress: formatInitialAddress(initialData?.shippingAddress),
      country: initialData?.country || (typeof initialData?.billingAddress === 'object' ? (initialData.billingAddress as any)?.country : ''),
      state: initialData?.state || (typeof initialData?.billingAddress === 'object' ? (initialData.billingAddress as any)?.state : ''),
      city: initialData?.city || (typeof initialData?.billingAddress === 'object' ? (initialData.billingAddress as any)?.city : ''),
      postalCode: initialData?.postalCode || (typeof initialData?.billingAddress === 'object' ? (initialData.billingAddress as any)?.postalCode : ''),
      notes: initialData?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic & Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 pb-2 font-heading">
            Contact & Company Details
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="ex. Alex Mercer"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              autoFocus
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              {...register('companyName')}
              placeholder="ex. Mercer Enterprises Ltd"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="ex. alex@mercer.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                {...register('phone')}
                placeholder="ex. +91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              GSTIN / Tax Identification
            </label>
            <input
              type="text"
              {...register('taxNumber')}
              placeholder="ex. 27AAAAA1111A1Z1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
          </div>
        </div>

        {/* Location & Address Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 pb-2 font-heading">
            Addresses & Location
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Billing Address
            </label>
            <input
              type="text"
              {...register('billingAddress')}
              placeholder="ex. Suite 402, Financial Park, Phase 1"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Shipping Address
            </label>
            <input
              type="text"
              {...register('shippingAddress')}
              placeholder="ex. Warehouse 3, Logistics Complex"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                {...register('city')}
                placeholder="ex. Mumbai"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">State / Region</label>
              <input
                type="text"
                {...register('state')}
                placeholder="ex. Maharashtra"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Country</label>
              <input
                type="text"
                {...register('country')}
                placeholder="ex. India"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">Postal Code</label>
              <input
                type="text"
                {...register('postalCode')}
                placeholder="ex. 400001"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
          Internal Notes & Key Customer Remarks
        </label>
        <textarea
          {...register('notes')}
          rows={2}
          placeholder="ex. Preferred billing currency is INR. Requires net 30 payment terms."
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/10 pt-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition text-xs font-bold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold disabled:opacity-50 transition shadow-md cursor-pointer"
        >
          {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          <span>{initialData ? 'Update Client' : 'Save Client'}</span>
        </button>
      </div>
    </form>
  );
};
