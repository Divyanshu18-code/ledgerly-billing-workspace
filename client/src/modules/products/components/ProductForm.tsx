import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product or service name is required'),
  sku: z.string().min(1, 'SKU identifier is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  description: z.string().optional().nullable(),
  isService: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
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
      price: initialData?.price !== undefined ? initialData.price : 0,
      description: initialData?.description || '',
      isService: initialData?.isService || false,
    },
  });

  const isServiceValue = watch('isService');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
      <div className="space-y-4">
        {/* Toggle Product vs Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setValue('isService', false)}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition cursor-pointer text-center ${
                !isServiceValue
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400'
                  : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#16151a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              📦 Physical Product
            </button>
            <button
              type="button"
              onClick={() => setValue('isService', true)}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition cursor-pointer text-center ${
                isServiceValue
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400'
                  : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#16151a] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              🛠️ Billable Service
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
          <input
            type="text"
            {...register('name')}
            placeholder={isServiceValue ? 'e.g. Consulting Hour' : 'e.g. Server Hardware'}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU / Item Code</label>
            <input
              type="text"
              {...register('sku')}
              placeholder="e.g. PRD-10293"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Price / Rate</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              onFocus={(e) => e.target.select()}
              placeholder="0.00"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 dark:text-gray-550">(Optional)</span></label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Provide detail specifications..."
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm resize-none"
          />
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
          Save Item
        </button>
      </div>
    </form>
  );
};
