import React, { useState } from 'react';
import {
  useClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  type Client,
} from '../hooks/useClients';
import { ClientForm } from '../components/ClientForm';
import { Plus, Search, Trash2, Edit3, Mail, Phone, MapPin, Building, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: clients, isLoading, error } = useClientsQuery();
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();
  const deleteMutation = useDeleteClientMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients?.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingClient) {
        await updateMutation.mutateAsync({ id: editingClient.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">Clients</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and bill your customers</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium transition shadow-lg shadow-violet-500/10 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Client
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a]/60 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
          />
        </div>

        {/* Clients List/Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading clients data...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/10 text-red-650 dark:text-red-400 text-center text-sm">
            Failed to load clients. Please check your backend connection.
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#16151a]/20">
            <Building className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Clients Found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs text-center mb-6">
              {searchQuery ? 'Try adjusting your search filter.' : 'Add your first customer to start creating invoices.'}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="px-5 py-2.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition text-sm font-medium cursor-pointer"
              >
                Add Client
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121115]/60 backdrop-blur-md hover:border-violet-500/40 dark:hover:border-violet-500/50 hover:shadow-lg dark:hover:shadow-violet-500/5 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{client.name}</h3>
                      {client.taxNumber && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-violet-100 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          Tax ID: {client.taxNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-violet-550 dark:text-violet-400" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-violet-550 dark:text-violet-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-violet-550 dark:text-violet-400 mt-0.5" />
                      <span>
                        {client.billingAddress.street}, {client.billingAddress.city},{' '}
                        {client.billingAddress.state}, {client.billingAddress.country} -{' '}
                        {client.billingAddress.postalCode}
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
            <div className="w-full max-w-2xl p-8 rounded-2xl border border-gray-250 dark:border-white/10 bg-white dark:bg-[#0f0e13] shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-white/10 mb-6">
                <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                  {editingClient ? 'Edit Client Profile' : 'Register New Client'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-2xl font-medium cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <ClientForm
                initialData={editingClient || undefined}
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

export default ClientsPage;
