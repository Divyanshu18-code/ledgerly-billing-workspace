import React, { useState, useEffect } from 'react';
import {
  useClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} from '../hooks/useClients';
import type { Client } from '../hooks/useClients';
import { ClientForm } from '../components/ClientForm';
import type { ClientFormData } from '../components/ClientForm';
import { ClientDetailsModal } from '../components/ClientDetailsModal';
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Building,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  // Search, Filter, and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Debounce search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query Hook
  const { data, isLoading, isError } = useClientsQuery({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const clients = data?.clients || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 8, totalPages: 1 };

  // Mutations
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();
  const deleteMutation = useDeleteClientMutation();

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackMsg({ type, message });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleFormSubmit = async (formData: ClientFormData) => {
    try {
      if (editingClient) {
        await updateMutation.mutateAsync({ id: editingClient.id, data: formData });
        showFeedback('success', 'Client updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        showFeedback('success', 'New client registered successfully');
      }
      closeFormModal();
    } catch (err: any) {
      showFeedback('error', err.response?.data?.message || 'Failed to save client. Please try again.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        showFeedback('success', 'Client deleted successfully');
      } catch (err: any) {
        showFeedback('error', err.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsFormModalOpen(true);
  };

  const openViewModal = (client: Client) => {
    setViewingClient(client);
    setIsDetailsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingClient(null);
  };

  const formatAddressSummary = (client: Client) => {
    if (client.city || client.state || client.country) {
      return [client.city, client.state, client.country].filter(Boolean).join(', ');
    }
    if (typeof client.billingAddress === 'string') return client.billingAddress;
    if (typeof client.billingAddress === 'object' && client.billingAddress) {
      const addr = client.billingAddress as any;
      return [addr.city, addr.state, addr.country].filter(Boolean).join(', ');
    }
    return 'Location not specified';
  };

  return (
    <div className="relative overflow-hidden space-y-6">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">Clients Directory</h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Manage customer profiles, billing locations, and tax credentials</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-lg text-xs font-semibold flex items-center justify-between border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400'
            }`}
          >
            <span>{feedbackMsg.message}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="flex items-center relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, company, email, phone or GST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-card text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-semibold pr-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
            </div>
            <div className="flex rounded-lg border border-gray-200 dark:border-white/10 p-0.5 bg-gray-50 dark:bg-card text-xs font-semibold">
              {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md transition cursor-pointer text-xs ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Inactive'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clients List Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-xs">Loading clients database...</p>
          </div>
        ) : isError ? (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-center text-xs flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Failed to load clients. Please check your backend connection.</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-card/40">
            <Building className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 font-heading">No Clients Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs text-center mb-5">
              {searchQuery || statusFilter !== 'ALL'
                ? 'No client profiles match your filter options.'
                : 'Register your first customer to start creating invoices and quotations.'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && (
              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-xs font-bold cursor-pointer"
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">{client.name}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xxs font-extrabold rounded-full border uppercase tracking-wider ${
                            client.status === 'ACTIVE'
                              ? 'badge-success-soft'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {client.status}
                        </span>
                      </div>
                      {client.companyName ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{client.companyName}</span>
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openViewModal(client)}
                        className="p-1.5 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
                        title="Edit Client"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id, client.name)}
                        className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                        title="Delete Client"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{formatAddressSummary(client)}</span>
                    </div>
                  </div>
                </div>

                {client.taxNumber && (
                  <div className="mt-3 pt-2 border-t border-gray-50 dark:border-white/5 flex items-center justify-between text-xxs">
                    <span className="text-gray-400 uppercase font-semibold">Tax ID / GSTIN:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-300 font-mono">{client.taxNumber}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Control Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Showing <span className="font-bold text-gray-900 dark:text-white">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> clients
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition font-semibold cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 px-2 font-bold text-gray-800 dark:text-gray-200">
                <span>{pagination.page}</span>
                <span>/</span>
                <span>{pagination.totalPages}</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-white/5 transition font-semibold cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Form Dialog for Create/Edit */}
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-3xl p-6 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-white/10 mb-6">
                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                  {editingClient ? 'Edit Client Profile' : 'Register New Client'}
                </h2>
                <button
                  onClick={closeFormModal}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-xl font-medium cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <ClientForm
                initialData={editingClient || undefined}
                onSubmit={handleFormSubmit}
                onCancel={closeFormModal}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Details View Modal */}
        <ClientDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          client={viewingClient}
          onEdit={(c) => openEditModal(c)}
        />
      </div>
    </div>
  );
};

export default ClientsPage;
