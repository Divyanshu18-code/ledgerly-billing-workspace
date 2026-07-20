import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Package, Wrench } from 'lucide-react';
import type { Product } from '../hooks/useProducts';

const productSchema = z.object({
  name: z.string().min(1, 'Product or service name is required'),
  sku: z.string().min(1, 'SKU identifier is required'),
  type: z.enum(['PRODUCT', 'SERVICE']),
  price: z.number().min(0, 'Selling price must be 0 or greater'),
  purchasePrice: z.number().min(0).optional().nullable(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  unit: z.string().min(1, 'Unit is required'),
  hsnSacCode: z.string().optional().nullable(),
  taxRateValue: z.number().min(0).max(100).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      type: initialData?.type || (initialData?.isService ? 'SERVICE' : 'PRODUCT'),
      price: initialData?.price !== undefined ? Number(initialData.price) : 0,
      purchasePrice: initialData?.purchasePrice !== undefined && initialData?.purchasePrice !== null ? Number(initialData.purchasePrice) : null,
      description: initialData?.description || '',
      category: initialData?.category || '',
      unit: initialData?.unit || (initialData?.isService ? 'hrs' : 'pcs'),
      hsnSacCode: initialData?.hsnSacCode || '',
      taxRateValue: initialData?.taxRateValue !== undefined ? Number(initialData.taxRateValue) : 0,
      status: initialData?.status || 'ACTIVE',
    },
  });

  const selectedType = watch('type');

  const generateAutoSku = () => {
    const prefix = selectedType === 'SERVICE' ? 'SERV' : 'PROD';
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    setValue('sku', `${prefix}-${randomCode}`, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
      {/* Item Type Selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
          Catalog Item Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'PRODUCT');
              if (watch('unit') === 'hrs') setValue('unit', 'pcs');
            }}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              selectedType === 'PRODUCT'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Package className="h-4 w-4" /> Physical Product
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'SERVICE');
              if (watch('unit') === 'pcs') setValue('unit', 'hrs');
            }}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              selectedType === 'SERVICE'
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <Wrench className="h-4 w-4" /> Billable Service
          </button>
        </div>
      </div>

      {/* Name and SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Title / Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder={selectedType === 'SERVICE' ? 'e.g. Website Consulting' : 'e.g. Server Rack Mount'}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              SKU <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={generateAutoSku}
              className="text-[10px] text-blue-500 hover:text-blue-400 flex items-center gap-0.5 cursor-pointer font-semibold"
            >
              <Sparkles className="h-3 w-3" /> Auto
            </button>
          </div>
          <input
            type="text"
            {...register('sku')}
            placeholder="PROD-1001"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white uppercase placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-mono"
          />
          {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
        </div>
      </div>

      {/* Pricing & Units */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Selling Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            onFocus={(e) => e.target.select()}
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm font-semibold"
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Purchase Price <span className="text-gray-400 font-normal">(Cost)</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register('purchasePrice', { valueAsNumber: true, setValueAs: v => v === '' ? null : Number(v) })}
            onFocus={(e) => e.target.select()}
            placeholder="0.00"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Unit
          </label>
          <select
            {...register('unit')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm cursor-pointer"
          >
            <option value="pcs">pcs (Pieces)</option>
            <option value="hrs">hrs (Hours)</option>
            <option value="kg">kg (Kilogram)</option>
            <option value="units">units (Units)</option>
            <option value="m">m (Meters)</option>
            <option value="months">months (Months)</option>
            <option value="flat">flat (Flat Fee)</option>
          </select>
        </div>
      </div>

      {/* Tax & Codes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <input
            type="text"
            {...register('category')}
            placeholder="e.g. Hardware / Development"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            HSN / SAC Code
          </label>
          <input
            type="text"
            {...register('hsnSacCode')}
            placeholder="e.g. 998313"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('taxRateValue', { valueAsNumber: true })}
            onFocus={(e) => e.target.select()}
            placeholder="18"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
          />
        </div>
      </div>

      {/* Description & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={2}
            placeholder="Provide item specifications or details..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm cursor-pointer"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end gap-3 border-t border-gray-100 dark:border-white/10 pt-5 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-medium cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium disabled:opacity-50 transition text-sm cursor-pointer shadow-lg"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Catalog Item
        </button>
      </div>
    </form>
  );
};
