import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  DollarSign,
  Clock,
  RotateCcw,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Wallet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ChevronDown,
  MessageCircle,
  MoreVertical,
} from 'lucide-react';
import { usePaymentsQuery, useDeletePaymentMutation } from '../hooks/usePayments';
import type { PaymentItem } from '../hooks/usePayments';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = usePaymentsQuery({
    page,
    limit: 10,
    search,
    status: statusFilter || undefined,
    paymentMethod: methodFilter || undefined,
  });

  const deleteMutation = useDeletePaymentMutation();

  const payments = response?.data || [];
  const pagination = response?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };
  const metrics = response?.metrics || { totalCollected: 0, pendingVerification: 0, refundedAmount: 0 };

  const handleDelete = async (id: string, paymentNumber: string) => {
    if (window.confirm(`Are you sure you want to delete payment ${paymentNumber}? This will automatically update the linked invoice balance.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleWhatsApp = (payment: PaymentItem) => {
    const clientPhone = payment.client?.phone ? payment.client.phone.replace(/[^0-9]/g, '') : '';
    const message =
      `Hello ${payment.client?.name || 'Customer'},\n\n` +
      `Thank you for your payment! Here is your Payment Receipt details:\n\n` +
      `📄 Receipt #: ${payment.paymentNumber}\n` +
      `🧾 Invoice #: ${payment.invoice?.invoiceNumber || 'N/A'}\n` +
      `💵 Amount Paid: ${currencySymbol}${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `💳 Method: ${payment.paymentMethod}\n` +
      `📅 Date: ${new Date(payment.paymentDate).toLocaleDateString()}\n` +
      `📌 Status: ${payment.status}\n\n` +
      `Regards,\n${workspace?.name || 'Ledgerly Billing'}`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = clientPhone ? `https://wa.me/${clientPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <RotateCcw className="w-3.5 h-3.5" />
            Refunded
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'UPI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Wallet className="w-3 h-3" /> UPI
          </span>
        );
      case 'BANK_TRANSFER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Building2 className="w-3 h-3" /> Bank Transfer
          </span>
        );
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
      case 'CARD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        );
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-3 h-3" /> Cash
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
            {method}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Payment Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Record, track, and synchronize invoice payments seamlessly
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/payments/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Payments Collected</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            {currencySymbol}
            {metrics.totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Total verified incoming cash inflow</p>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Verification</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            {currencySymbol}
            {metrics.pendingVerification.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Payments awaiting clearance or verification</p>
        </div>

        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Refunded</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
            {currencySymbol}
            {metrics.refundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-gray-400">Logged payment refunds</p>
        </div>
      </div>

      {/* Filter & Search Toolbar with Photo 2 Style Horizontal Status Filter Tabs */}
      <div className="p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Payment #, Invoice #, Client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Right Controls: Horizontal Status Filter Tabs + Method Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          {/* Photo 2 Horizontal Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl overflow-x-auto shadow-xs max-w-full">
            {[
              { value: '', label: `All (${response?.pagination?.total || 0})` },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'REFUNDED', label: 'Refunded' },
              { value: 'FAILED', label: 'Failed' },
            ].map((st) => {
              const isActive = statusFilter === st.value;
              return (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st.value);
                    setPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* Payment Method Dropdown */}
          <div className="relative shrink-0">
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none cursor-pointer transition-all hover:border-blue-500/50 shadow-xs"
            >
              <option value="" className="bg-white dark:bg-[#161420]">All Methods</option>
              <option value="CASH" className="bg-white dark:bg-[#161420]">Cash</option>
              <option value="BANK_TRANSFER" className="bg-white dark:bg-[#161420]">Bank Transfer</option>
              <option value="UPI" className="bg-white dark:bg-[#161420]">UPI</option>
              <option value="CREDIT_CARD" className="bg-white dark:bg-[#161420]">Credit Card</option>
              <option value="DEBIT_CARD" className="bg-white dark:bg-[#161420]">Debit Card</option>
              <option value="CHEQUE" className="bg-white dark:bg-[#161420]">Cheque</option>
              <option value="WALLET" className="bg-white dark:bg-[#161420]">Wallet</option>
              <option value="OTHER" className="bg-white dark:bg-[#161420]">Other</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] text-xs uppercase font-semibold text-gray-500 dark:text-gray-400">
                <th className="py-3.5 px-4">Payment #</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No payment records found. Click &quot;Record Payment&quot; to log incoming cash inflow.
                  </td>
                </tr>
              ) : (
                payments.map((payment: PaymentItem) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      <button
                        onClick={() => navigate(`/payments/${payment.id}`)}
                        className="hover:underline"
                      >
                        {payment.paymentNumber}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-700 dark:text-gray-300">
                      {payment.invoice ? (
                        <button
                          onClick={() => navigate(`/invoices/${payment.invoice?.id}`)}
                          className="hover:underline text-blue-500"
                        >
                          {payment.invoice.invoiceNumber}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                      {payment.client?.name || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4">{getMethodBadge(payment.paymentMethod)}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {currencySymbol}
                      {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(payment.status)}</td>

                    <td className="py-3.5 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Quick WhatsApp Action */}
                        <button
                          onClick={() => handleWhatsApp(payment)}
                          className="p-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 transition cursor-pointer active:scale-95"
                          title="Share via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        {/* Quick View Details */}
                        <button
                          onClick={() => navigate(`/payments/${payment.id}`)}
                          className="p-1.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                          title="View Payment Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Sleek 3-Dots Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionId(openActionId === payment.id ? null : payment.id)}
                            className="p-1.5 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openActionId === payment.id && (
                            <div className="absolute right-0 top-[110%] z-50 w-44 p-1.5 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white dark:bg-[#181624] shadow-2xl space-y-0.5 backdrop-blur-xl text-left">
                              <button
                                onClick={() => {
                                  navigate(`/payments/${payment.id}/edit`);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                                <span>Edit Payment</span>
                              </button>

                              <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                              <button
                                onClick={() => {
                                  handleDelete(payment.id, payment.paymentNumber);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Payment</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing {payments.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
