import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useQuotationsQuery,
  useDeleteQuotationMutation,
  useDuplicateQuotationMutation,
  useConvertToInvoiceMutation,
  type Quotation,
} from '../hooks/useQuotations';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import {
  Plus,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  ChevronDown,
  Check,
  Eye,
  Edit3,
  Copy,
  FileCheck2,
  Trash2,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspace } = useWorkspaceData();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Custom Dropdown State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Modals / Feedback
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);

  // Query Hook
  const { data: responseData, isLoading, refetch } = useQuotationsQuery({
    search: debouncedSearch,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    page,
    limit,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click away for status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setFeedbackMsg({ type: 'success', message: location.state.message });
      refetch();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);

  const deleteMutation = useDeleteQuotationMutation();
  const duplicateMutation = useDuplicateQuotationMutation();
  const convertMutation = useConvertToInvoiceMutation();

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';
  const quotations = responseData?.data || [];
  const pagination = responseData?.pagination;

  // Calculate quick metrics
  const totalCount = pagination?.totalItems || quotations.length;
  const grandTotalSum = quotations.reduce((acc, q) => acc + Number(q.grandTotal), 0);
  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED' || q.status === 'APPROVED').length;
  const convertedCount = quotations.filter((q) => q.status === 'CONVERTED').length;

  const handleDuplicate = async (id: string, qNumber: string) => {
    try {
      const res = await duplicateMutation.mutateAsync(id);
      setFeedbackMsg({ type: 'success', message: res.message || `Quotation ${qNumber} duplicated successfully` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to duplicate quotation' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleConvert = async (id: string, qNumber: string) => {
    if (!window.confirm(`Are you sure you want to convert Quotation ${qNumber} to an Invoice?`)) return;
    try {
      const res = await convertMutation.mutateAsync(id);
      setFeedbackMsg({ type: 'success', message: res.message || `Quotation converted to Invoice successfully` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to convert quotation to invoice' });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingQuotation) return;
    try {
      await deleteMutation.mutateAsync(deletingQuotation.id);
      setFeedbackMsg({ type: 'success', message: `Quotation ${deletingQuotation.quotationNumber} deleted successfully` });
      setDeletingQuotation(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to delete quotation' });
      setDeletingQuotation(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'DRAFT':
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500 dark:text-gray-400';
      case 'SENT':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'ACCEPTED':
      case 'APPROVED':
        return 'badge-success-soft';
      case 'REJECTED':
      case 'EXPIRED':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
      case 'CONVERTED':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="relative overflow-hidden space-y-6">
      {/* Background radial glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">
              Quotations & Rate Proposals
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Draft estimations, issue proposals to clients, and convert accepted quotes to invoices
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/quotations/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-sm transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Quotation</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* Summary Metrics Cards (4 Luxury Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Total Proposals
            </span>
            <div className="p-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">{totalCount}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Active estimation records</p>
          </div>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Total Value
            </span>
            <div className="p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {currencySymbol}{grandTotalSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Gross quotation pipeline</p>
          </div>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Accepted Proposals
            </span>
            <div className="p-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">{acceptedCount}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Rates approved by prospects</p>
          </div>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.07)]">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Converted Invoices
            </span>
            <div className="p-2 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">{convertedCount}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Billed into invoice ledger</p>
          </div>
        </div>
      </div>

      {/* Action Bar (Search & Filter Dropdown) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl relative z-20 shadow-sm overflow-visible">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by quote #, client name, company or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 overflow-visible">
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white shadow-xs cursor-pointer"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  statusFilter === 'ACCEPTED' || statusFilter === 'APPROVED'
                    ? 'bg-emerald-500'
                    : statusFilter === 'CONVERTED'
                    ? 'bg-purple-500'
                    : statusFilter === 'SENT'
                    ? 'bg-blue-500'
                    : statusFilter === 'REJECTED' || statusFilter === 'EXPIRED'
                    ? 'bg-rose-500'
                    : 'bg-gray-400'
                }`}
              />
              <span>
                {statusFilter === 'ALL'
                  ? 'All Statuses'
                  : statusFilter === 'DRAFT'
                  ? 'Draft Proposals'
                  : statusFilter === 'SENT'
                  ? 'Sent to Client'
                  : statusFilter === 'ACCEPTED'
                  ? 'Accepted Quotes'
                  : statusFilter === 'REJECTED'
                  ? 'Rejected Quotes'
                  : statusFilter === 'CONVERTED'
                  ? 'Converted to Invoice'
                  : statusFilter}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isStatusDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Smooth Floating Popover Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute right-0 top-[115%] z-50 w-48 p-1.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-[#14131a]/95 backdrop-blur-xl shadow-xl space-y-0.5">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/5 mb-1">
                  Filter Quotations
                </div>

                {[
                  { id: 'ALL', label: 'All Statuses', color: 'bg-gray-400' },
                  { id: 'DRAFT', label: 'Draft Proposals', color: 'bg-gray-500' },
                  { id: 'SENT', label: 'Sent to Client', color: 'bg-blue-500' },
                  { id: 'ACCEPTED', label: 'Accepted Quotes', color: 'bg-emerald-500' },
                  { id: 'REJECTED', label: 'Rejected Quotes', color: 'bg-rose-500' },
                  { id: 'CONVERTED', label: 'Converted to Invoice', color: 'bg-purple-500' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st.id);
                      setPage(1);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      statusFilter === st.id
                        ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${st.color}`} />
                      <span>{st.label}</span>
                    </div>
                    {statusFilter === st.id && <Check className="h-3.5 w-3.5 text-blue-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Quotations Table / Empty State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Loading quotations catalog...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="p-12 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="h-7 w-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">No quotations found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Start building rate estimations by creating your first quotation proposal.
            </p>
          </div>
          <button
            onClick={() => navigate('/quotations/new')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Create First Quotation
          </button>
        </div>
      ) : (
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Quotation #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Date & Validity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-200">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {q.quotationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-white font-heading">{q.client.name}</div>
                      <div className="text-[11px] text-gray-400">{q.client.companyName || q.client.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="font-medium">{new Date(q.issueDate).toLocaleDateString()}</div>
                      <div className="text-gray-400">Expires: {new Date(q.validUntil).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-xxs font-extrabold rounded-full border uppercase tracking-wider ${getStatusBadgeClass(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white text-sm">
                      {currencySymbol}
                      {Number(q.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/quotations/${q.id}`)}
                          className="h-9 w-9 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                          title="View Proposal Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/quotations/${q.id}/edit`)}
                          className="h-9 w-9 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                          title="Edit Proposal"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(q.id, q.quotationNumber)}
                          className="h-9 w-9 rounded-2xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                          title="Duplicate Proposal"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {q.status !== 'CONVERTED' && (
                          <button
                            onClick={() => handleConvert(q.id, q.quotationNumber)}
                            className="h-9 w-9 rounded-2xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 dark:text-purple-400 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                            title="Convert to Invoice"
                          >
                            <FileCheck2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingQuotation(q)}
                          className="h-9 w-9 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                          title="Delete Quotation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-bold text-gray-900 dark:text-white">{pagination.currentPage}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white">{pagination.totalPages}</span> ({pagination.totalItems} total)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14131a] max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Delete Quotation?</h3>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete quotation <span className="font-mono font-bold text-gray-900 dark:text-white">{deletingQuotation.quotationNumber}</span>? It will be archived from your proposals list.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingQuotation(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Delete Proposal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
