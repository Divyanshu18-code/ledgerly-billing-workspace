import React, { useState } from 'react';
import {
  useProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  type Product,
} from '../hooks/useProducts';
import { ProductForm } from '../components/ProductForm';
import { Plus, Search, Trash2, Edit3, Briefcase, Box, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProductsQuery();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">Products & Services</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your service packages and item inventory rates</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium transition shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-card/60 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-450 dark:placeholder-gray-550 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* List of Products */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading items registry...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-center text-sm">
            Failed to load products. Please check server connections.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-100 dark:border-white/10 rounded-2xl bg-white dark:bg-[#18181b]/20">
            <Box className="h-16 w-16 text-gray-450 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Items Registered</h3>
            <p className="text-gray-550 dark:text-gray-400 text-sm max-w-xs text-center mb-6">
              {searchQuery ? 'Try adjusting your filters.' : 'Add your products or services here to select them inside invoice generators.'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition text-sm font-medium cursor-pointer"
              >
                Add Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card/60 backdrop-blur-md hover:border-blue-500/40 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-blue-500/5 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        {product.isService ? <Briefcase className="h-5 w-5" /> : <Box className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{product.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-550">SKU: {product.sku}</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-gray-150 dark:border-white/5 pt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic truncate max-w-[70%]">
                      {product.description || 'No descriptions provided.'}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 dark:text-gray-550 block">Rate / Price</span>
                      <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-heading">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Form Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-xl p-8 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/10 mb-6">
                <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {editingProduct ? 'Modify Registered Item' : 'Register New Inventory Item'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-2xl font-medium cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <ProductForm
                initialData={editingProduct || undefined}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
