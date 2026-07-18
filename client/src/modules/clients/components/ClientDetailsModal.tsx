import React from 'react';
import type { Client } from '../hooks/useClients';
import { X, Building, Mail, Phone, MapPin, FileText, Edit3 } from 'lucide-react';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  onEdit,
}) => {
  if (!isOpen || !client) return null;

  const formatAddress = (addr: any) => {
    if (!addr) return null;
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const parts = [addr.street, addr.city, addr.state, addr.country, addr.postalCode].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : null;
    }
    return null;
  };

  const billingAddr = formatAddress(client.billingAddress);
  const shippingAddr = formatAddress(client.shippingAddress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Client Header */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/5 pb-4 mb-6 pr-8">
          <div className="flex items-start gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-lg font-heading">
              {client.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading">{client.name}</h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-xxs font-extrabold rounded-full border uppercase tracking-wider ${
                    client.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-500/10 border-gray-500/20 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              {client.companyName ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Building className="h-3.5 w-3.5" />
                  <span>{client.companyName}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Individual Account</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onEdit(client);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold transition cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Client Profile Information Grid */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 space-y-2.5">
              <span className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Contact Communication</span>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone ? (
                  <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xxs italic">No phone number added</div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2 space-y-2.5">
              <span className="text-xxs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tax & Security Metadata</span>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">GSTIN / Tax ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {client.taxNumber || 'Not Specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date Added:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Address Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-heading">
              Registered Locations
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card space-y-2">
                <span className="text-xxs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Billing Address
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {billingAddr || 'No billing address specified.'}
                </p>
                {(client.city || client.state || client.country) && (
                  <p className="text-xxs text-gray-400">
                    {[client.city, client.state, client.country, client.postalCode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card space-y-2">
                <span className="text-xxs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Shipping Address
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  {shippingAddr || 'Same as billing address or unspecified.'}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          {client.notes && (
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-amber-500/5 text-amber-900 dark:text-amber-300 space-y-1">
              <span className="text-xxs font-bold uppercase tracking-wider flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <FileText className="h-3.5 w-3.5" /> Customer Remarks & Notes
              </span>
              <p className="text-xs leading-relaxed whitespace-pre-line">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
