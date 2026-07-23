import React, { useState, useEffect, useRef } from 'react';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type Product,
} from '../hooks/useProducts';
import { ProductForm, type ProductFormData } from '../components/ProductForm';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Briefcase,
  Box,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Package,
  Wrench,
  ChevronDown,
  Check,
} from 'lucide-react';
import { TableSkeleton } from '@/components/SkeletonLoaders';
import { useNavigate } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search, Filter, and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PRODUCT' | 'SERVICE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Status Filter Dropdown State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Click-away listener for Status Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Hook
  const { data: responseData, isLoading, isFetching, error } = useProductsQuery({
    search: debouncedSearch,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    limit,
  });

  const products = responseData?.items || [];
  const pagination = responseData?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 8,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Mutations
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const handleFormSubmit = async (data: ProductFormData) => {
    setActionError(null);
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: {
            ...data,
            price: Number(data.price),
            purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
            taxRateValue: data.taxRateValue ? Number(data.taxRateValue) : 0,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          price: Number(data.price),
          purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : null,
          taxRateValue: data.taxRateValue ? Number(data.taxRateValue) : 0,
        });
      }
      closeFormModal();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to save catalog item');
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete catalog item');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setActionError(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
    setActionError(null);
  };

  // Summary Metrics calculations
  const totalCount = pagination.totalItems;
  const productsCount = products.filter((p) => p.type === 'PRODUCT' || !p.isService).length;
  const servicesCount = products.filter((p) => p.type === 'SERVICE' || p.isService).length;

  return (
    <div className="space-y-6 text-left relative overflow-hidden">
      {/* Decorative Blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition mb-2 cursor-pointer font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-lg">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
                Products & Services Catalog
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage physical items, rates, HSN codes & billable services
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition cursor-pointer text-xs"
        >
          <Plus className="h-4 w-4" />
          Add Item / Service
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1">
            Total Catalog Items
          </span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{totalCount}</p>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1">
            Physical Products
          </span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{productsCount}</p>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1">
            Billable Services
          </span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{servicesCount}</p>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1">
            Active Catalog Items
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {products.filter((p) => p.status === 'ACTIVE').length}
          </p>
        </div>
      </div>

      {/* Action Bar (Search & Filter Tabs) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl relative z-20 shadow-sm overflow-visible">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition"
          />
        </div>

        {/* Filter Tabs & Dropdown */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-visible">
          <div className="flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5 text-xs font-semibold">
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-white dark:bg-[#1a1922] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setTypeFilter('PRODUCT');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'PRODUCT'
                  ? 'bg-white dark:bg-[#1a1922] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Box className="h-3.5 w-3.5" /> Physical
            </button>
            <button
              onClick={() => {
                setTypeFilter('SERVICE');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                typeFilter === 'SERVICE'
                  ? 'bg-white dark:bg-[#1a1922] text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" /> Services
            </button>
          </div>

          {/* Smooth Custom Status Filter Dropdown */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white shadow-xs cursor-pointer"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : statusFilter === 'INACTIVE'
                    ? 'bg-rose-500'
                    : 'bg-blue-500'
                }`}
              />
              <span>
                {statusFilter === 'ALL'
                  ? 'All Status'
                  : statusFilter === 'ACTIVE'
                  ? 'Active Only'
                  : 'Inactive Only'}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isStatusDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Smooth Animated Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-[115%] z-40 w-44 p-1.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-[#14131a]/95 backdrop-blur-xl shadow-xl space-y-0.5 animate-fade-in">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/5 mb-1">
                  Filter by Status
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('ALL');
                    setPage(1);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>All Status</span>
                  </div>
                  {statusFilter === 'ALL' && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('ACTIVE');
                    setPage(1);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Active Only</span>
                  </div>
                  {statusFilter === 'ACTIVE' && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('INACTIVE');
                    setPage(1);
                    setIsStatusDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                    statusFilter === 'INACTIVE'
                      ? 'bg-rose-50 dark:bg-rose-600/10 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span>Inactive Only</span>
                  </div>
                  {statusFilter === 'INACTIVE' && <Check className="h-3.5 w-3.5 text-rose-500" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="font-bold underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Product List Table / Grid */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl overflow-hidden relative z-10 shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : error ? (
          <div className="py-16 text-center text-red-500 dark:text-red-400 text-xs">
            Failed to load catalog items. Please refresh page.
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center mx-auto shadow-inner">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No items found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'No products match your active search or filter parameters.'
                  : 'Start building your inventory catalog by adding your first product or billable service.'}
              </p>
            </div>
            {!searchQuery && typeFilter === 'ALL' && statusFilter === 'ALL' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-md mt-2"
              >
                <Plus className="h-4 w-4" /> Add Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-white/10 text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold bg-gray-50/50 dark:bg-white/5">
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">SKU / Code</th>
                  <th className="p-4">Price / Rate</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {products.map((item) => {
                  const isService = item.type === 'SERVICE' || item.isService;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold ${
                              isService
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            }`}
                          >
                            {isService ? <Wrench className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white font-heading">{item.name}</p>
                            <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                              {item.description || 'No description provided'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isService
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {isService ? 'Service' : 'Product'}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-semibold text-gray-700 dark:text-gray-300">
                        {item.sku}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-gray-900 dark:text-white font-mono text-sm">
                          ${Number(item.price).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">/ {item.unit}</span>
                      </td>

                      <td className="p-4 text-gray-600 dark:text-gray-400 font-medium">
                        {item.category || <span className="text-gray-400 italic">Uncategorized</span>}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setViewingProduct(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(item)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                            title="Soft Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Showing page <strong className="text-gray-900 dark:text-white">{pagination.currentPage}</strong> of{' '}
              <strong className="text-gray-900 dark:text-white">{pagination.totalPages}</strong> ({pagination.totalItems} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={!pagination.hasPrevPage || isFetching}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage || isFetching}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition flex items-center gap-1 cursor-pointer font-medium"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121118] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
                  {editingProduct ? 'Edit Catalog Item' : 'Create Product or Service'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {editingProduct
                    ? 'Modify catalog item prices, SKU code, or category attributes'
                    : 'Add a new physical item or billable service to your workspace catalog'}
                </p>
              </div>
            </div>

            <ProductForm
              initialData={editingProduct || undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeFormModal}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      <ProductDetailsModal
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
        onEdit={(product) => openEditModal(product)}
      />

      {/* Soft Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-white dark:bg-[#121118] p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">
                Soft Delete Item?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Are you sure you want to delete <strong className="text-gray-900 dark:text-white">"{deletingProduct.name}"</strong> ({deletingProduct.sku})? It will be archived and hidden from your catalog.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => setDeletingProduct(null)}
                className="px-5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition text-xs cursor-pointer shadow-md disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
