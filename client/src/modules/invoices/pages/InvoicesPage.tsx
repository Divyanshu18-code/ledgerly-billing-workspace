import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useInvoicesQuery,
  useDeleteInvoiceMutation,
  useDuplicateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  type Invoice,
} from '../hooks/useInvoices';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Copy,
  Trash2,
  AlertCircle,
  Loader2,
  MessageCircle,
  MoreVertical,
} from 'lucide-react';

const STATUS_FILTERS = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'DRAFT', color: 'bg-gray-500' },
  { label: 'Sent', value: 'SENT', color: 'bg-blue-500' },
  { label: 'Partially Paid', value: 'PARTIALLY_PAID', color: 'bg-amber-500' },
  { label: 'Paid', value: 'PAID', color: 'bg-emerald-500' },
  { label: 'Overdue', value: 'OVERDUE', color: 'bg-rose-500' },
  { label: 'Cancelled', value: 'CANCELLED', color: 'bg-zinc-500' },
];

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspace } = useWorkspaceData();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Flash message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setFeedbackMsg({ type: 'success', message: location.state.message });
      window.history.replaceState({}, document.title);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  }, [location.state]);

  const { data: responseData, isLoading, isError, refetch } = useInvoicesQuery({
    search: debouncedSearch,
    status: selectedStatus || undefined,
    page,
    limit,
  });

  const deleteMutation = useDeleteInvoiceMutation();
  const duplicateMutation = useDuplicateInvoiceMutation();
  const updateStatusMutation = useUpdateInvoiceStatusMutation();

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';
  const invoices = responseData?.data || [];
  const pagination = responseData?.pagination;

  // Compute metric summaries
  const totalInvoicesCount = pagination?.total || invoices.length;
  const totalPaidRevenue = invoices
    .filter((inv: Invoice) => inv.status === 'PAID')
    .reduce((sum: number, inv: Invoice) => sum + Number(inv.grandTotal || 0), 0);
  const totalUnpaidBalance = invoices
    .filter((inv: Invoice) => inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE')
    .reduce((sum: number, inv: Invoice) => sum + Number(inv.balanceDue || 0), 0);

  const handleDuplicate = async (inv: Invoice) => {
    try {
      const res = await duplicateMutation.mutateAsync(inv.id);
      setFeedbackMsg({ type: 'success', message: res.message || `Invoice ${inv.invoiceNumber} duplicated successfully` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to duplicate invoice' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleStatusChange = async (inv: Invoice, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: inv.id, status: newStatus });
      setFeedbackMsg({ type: 'success', message: `Invoice ${inv.invoiceNumber} status updated to ${newStatus}` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingInvoice) return;
    try {
      await deleteMutation.mutateAsync(deletingInvoice.id);
      setFeedbackMsg({ type: 'success', message: `Invoice ${deletingInvoice.invoiceNumber} deleted successfully` });
      setDeletingInvoice(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to delete invoice' });
      setDeletingInvoice(null);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleWhatsAppInvoice = (inv: Invoice) => {
    const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';
    const clientPhone = inv.client?.phone ? inv.client.phone.replace(/[^0-9]/g, '') : '';
    const message =
      `Hello ${inv.client?.name || 'Customer'},\n\n` +
      `Here is your Invoice document from ${workspace?.name || 'Ledgerly Billing'}:\n\n` +
      `🧾 Invoice #: ${inv.invoiceNumber}\n` +
      `💰 Grand Total: ${currencySymbol}${Number(inv.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `📌 Due Date: ${new Date(inv.dueDate).toLocaleDateString()}\n` +
      `💳 Balance Due: ${currencySymbol}${Number(inv.balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `📌 Status: ${inv.status}\n\n` +
      `📎 PDF Invoice Link:\n` +
      `http://localhost:5000/api/v1/invoices/${inv.id}/pdf\n\n` +
      `Thank you for your business!\n${workspace?.name || 'Ledgerly Billing'}`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = clientPhone ? `https://wa.me/${clientPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PARTIALLY_PAID':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'SENT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'OVERDUE':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'CANCELLED':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto pb-16">
      {/* Ambient lighting glow */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200/60 dark:border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white">
              Invoice Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              BILLING
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Issue formal customer invoices, record partial/full payments, and track outstanding receivables
          </p>
        </div>

        <button
          onClick={() => navigate('/invoices/new')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm animate-fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
        <div className="p-6 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">TOTAL INVOICES</div>
            <div className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-0.5">
              {totalInvoicesCount}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">REVENUE COLLECTED</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
              {currencySymbol}
              {totalPaidRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">UNPAID / OVERDUE</div>
            <div className="text-2xl font-black font-mono text-amber-500 mt-0.5">
              {currencySymbol}
              {totalUnpaidBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar with Photo 2 Style Horizontal Status Filter Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 relative z-20">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 text-gray-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-xs"
          />
        </div>

        {/* Photo 2 Horizontal Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl overflow-x-auto shadow-xs max-w-full">
          {STATUS_FILTERS.map((st) => {
            const isActive = selectedStatus === st.value;
            const labelText = st.value === '' ? `All (${totalInvoicesCount})` : st.label;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => {
                  setSelectedStatus(st.value);
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-[26px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-sm overflow-hidden relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
            <p className="text-xs font-medium text-gray-500">Loading invoices database...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <p className="text-xs font-semibold text-rose-500">Failed to load invoices records</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <FileText className="h-10 w-10 text-gray-400 mx-auto opacity-50" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Invoices Found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {debouncedSearch || selectedStatus
                  ? 'No records match your search query or filter.'
                  : 'Start by creating your first customer billing invoice.'}
              </p>
            </div>
            {!debouncedSearch && !selectedStatus && (
              <button
                onClick={() => navigate('/invoices/new')}
                className="px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500 transition"
              >
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 uppercase tracking-wider font-bold text-[11px]">
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Grand Total</th>
                  <th className="py-4 px-6 text-right">Balance Due</th>
                  <th className="py-4 px-6 text-center w-12">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {invoices.map((inv: Invoice) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="py-4 px-6 font-mono font-extrabold text-blue-600 dark:text-blue-400">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{inv.client.name}</div>
                      {inv.client.companyName && (
                        <div className="text-[11px] text-gray-400 font-normal">{inv.client.companyName}</div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${getStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-extrabold text-gray-900 dark:text-white text-sm">
                      {currencySymbol}
                      {Number(inv.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-amber-500">
                      {currencySymbol}
                      {Number(inv.balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick WhatsApp Action */}
                        <button
                          onClick={() => handleWhatsAppInvoice(inv)}
                          className="p-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 transition cursor-pointer active:scale-95"
                          title="Share Invoice via WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>

                        {/* Quick View Details */}
                        <button
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="p-2 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Sleek 3-Dots Dropdown Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionId(openActionId === inv.id ? null : inv.id)}
                            className="p-2 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                            title="More actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openActionId === inv.id && (
                            <div className="absolute right-0 top-[110%] z-50 w-48 p-1.5 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white dark:bg-[#181624] shadow-2xl space-y-0.5 backdrop-blur-xl text-left">
                              <button
                                onClick={() => {
                                  navigate(`/invoices/${inv.id}/edit`);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                                <span>Edit Invoice</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleDuplicate(inv);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-blue-500" />
                                <span>Duplicate</span>
                              </button>

                              {inv.status !== 'PAID' && (
                                <button
                                  onClick={() => {
                                    handleStatusChange(inv, 'PAID');
                                    setOpenActionId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                                  <span>Mark as Paid</span>
                                </button>
                              )}

                              <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                              <button
                                onClick={() => {
                                  setDeletingInvoice(inv);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Invoice</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/10 text-xs">
            <div className="text-gray-500 dark:text-gray-400">
              Showing Page <span className="font-bold text-gray-900 dark:text-white">{pagination.page}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{pagination.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-white/10 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161424] shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
              Delete Invoice {deletingInvoice.invoiceNumber}?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to soft delete this invoice? This action can be audited by workspace admins.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
