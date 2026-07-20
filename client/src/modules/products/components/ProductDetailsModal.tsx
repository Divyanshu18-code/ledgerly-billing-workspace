import React from 'react';
import type { Product } from '../hooks/useProducts';
import { X, Tag, BarChart2, DollarSign, Calendar, Layers, ShieldCheck, Package, Wrench } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onEdit,
}) => {
  if (!product) return null;

  const isService = product.type === 'SERVICE' || product.isService;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${
              isService ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {isService ? <Wrench className="h-6 w-6" /> : <Package className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">{product.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  product.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                SKU: {product.sku} • {isService ? 'Billable Service' : 'Physical Product'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pricing Summary Card */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#191820] border border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider flex items-center gap-1 mb-1">
              <DollarSign className="h-3 w-3 text-blue-400" /> Selling Price
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
              ${Number(product.price).toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ {product.unit}</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider flex items-center gap-1 mb-1">
              <BarChart2 className="h-3 w-3 text-amber-400" /> Purchase Price / Cost
            </span>
            <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
              {product.purchasePrice ? `$${Number(product.purchasePrice).toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs font-medium">
              <Tag className="h-4 w-4 text-gray-400" /> Category
            </span>
            <span className="text-gray-900 dark:text-white font-semibold text-xs">{product.category || 'Uncategorized'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs font-medium">
              <Layers className="h-4 w-4 text-gray-400" /> HSN / SAC Code
            </span>
            <span className="text-gray-900 dark:text-white font-mono font-semibold text-xs">{product.hsnSacCode || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs font-medium">
              <ShieldCheck className="h-4 w-4 text-gray-400" /> Applicable Tax Rate
            </span>
            <span className="text-gray-900 dark:text-white font-semibold text-xs">{product.taxRateValue || 0}%</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-xs font-medium">
              <Calendar className="h-4 w-4 text-gray-400" /> Created On
            </span>
            <span className="text-gray-900 dark:text-white font-semibold text-xs">
              {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider mb-1">Description</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 p-3 rounded-lg bg-gray-50 dark:bg-[#16151a] border border-gray-100 dark:border-white/5 leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition text-xs cursor-pointer shadow-md"
          >
            Edit Item
          </button>
        </div>
      </div>
    </div>
  );
};
