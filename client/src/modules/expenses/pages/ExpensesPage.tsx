import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  Receipt,
  Clock,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MoreVertical,
  CheckCircle2,
  DollarSign,
  Building2,
  Tag,
  Paperclip,
} from 'lucide-react';
import {
  useExpensesQuery,
  useDeleteExpenseMutation,
  useDuplicateExpenseMutation,
  type ExpenseItem,
} from '../hooks/useExpenses';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const ExpensesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Actions & Modals State
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-close 3-dots action dropdown menu on click outside or window scroll
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionId(null);
      }
    };
    const handleScroll = () => {
      if (openActionId) {
        setOpenActionId(null);
      }
    };

    if (openActionId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openActionId]);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (location.state?.message) {
      setFeedbackMsg({ type: 'success', message: location.state.message });
      window.history.replaceState({}, document.title);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  }, [location.state]);

  // Queries & Mutations
  const { data: responseData, isLoading, refetch } = useExpensesQuery({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const deleteMutation = useDeleteExpenseMutation();
  const duplicateMutation = useDuplicateExpenseMutation();

  const expenses = responseData?.data || [];
  const pagination = responseData?.pagination;
  const metrics = responseData?.metrics || { totalExpensesAmount: 0, totalTaxPaid: 0, pendingCount: 0 };

  const handleDuplicate = async (id: string, expNumber: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
      setFeedbackMsg({ type: 'success', message: `Expense ${expNumber} duplicated successfully!` });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err?.response?.data?.message || 'Failed to duplicate expense' });
    }
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return;
    try {
      await deleteMutation.mutateAsync(deletingExpense.id);
      setFeedbackMsg({ type: 'success', message: `Expense ${deletingExpense.expenseNumber} deleted successfully!` });
      setDeletingExpense(null);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err?.response?.data?.message || 'Failed to delete expense' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 uppercase tracking-wider">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-gray-500/10 text-gray-400 border border-gray-500/20 uppercase tracking-wider">
            {status}
          </span>
        );
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
              Expense Management
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Track operational costs, vendor payouts, tax deductions, and receipts
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/expenses/new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Record Expense</span>
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

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {currencySymbol}{metrics.totalExpensesAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Total operational cash outflow</p>
          </div>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Tax Paid (GST/Input)
            </span>
            <div className="p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {currencySymbol}{metrics.totalTaxPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Input tax credit eligible</p>
          </div>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Pending Clearances
            </span>
            <div className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
              {metrics.pendingCount}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Expenses awaiting payment approval</p>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Search & Photo 2 Horizontal Filter Tabs */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl relative z-20 shadow-sm">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by expense #, vendor, category or notes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition"
          />
        </div>

        {/* Photo 2 Style Horizontal Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl overflow-x-auto shadow-xs max-w-full">
          {[
            { id: 'ALL', label: `All (${pagination?.total || 0})` },
            { id: 'PAID', label: 'Paid' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((st) => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
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
      </div>

      {/* Main Expense Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-white/10">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Loading expense records...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 dark:bg-[#121118]/60 backdrop-blur-xl rounded-2xl border border-gray-200/80 dark:border-white/10 space-y-3">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500">
            <Receipt className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">No Expenses Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No expense records matched your active filters or search terms.'
              : 'You have not recorded any business expenses yet. Click Create Expense to start tracking operational costs.'}
          </p>
          <button
            onClick={() => navigate('/expenses/new')}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm transition hover:bg-blue-500 cursor-pointer"
          >
            Record First Expense
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-[#16151f]/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Expense #</th>
                  <th className="py-3.5 px-4">Category & Notes</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Date & Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                {expenses.map((exp, idx) => {
                  const isLastRow = idx >= expenses.length - 2 && expenses.length > 2;
                  return (
                    <tr
                      key={exp.id}
                      onClick={() => navigate(`/expenses/${exp.id}`)}
                      className="hover:bg-blue-50/30 dark:hover:bg-white/[0.02] transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.expenseNumber}</span>
                          {exp.receiptUrl && (
                            <span title="Receipt Attached">
                              <Paperclip className="h-3 w-3 text-emerald-500" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3 text-blue-500" />
                          <span className="font-bold text-gray-900 dark:text-white font-heading">{exp.categoryName}</span>
                        </div>
                        {exp.notes && (
                          <div className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">{exp.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {exp.vendor ? (
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-gray-400" />
                              <span>{exp.vendor.name}</span>
                            </div>
                            {exp.vendor.phone && <div className="text-[10px] text-gray-400">{exp.vendor.phone}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned Vendor</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(exp.expenseDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-400 uppercase tracking-wider text-[10px]">{exp.paymentMethod}</div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(exp.status)}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white text-sm">
                        {currencySymbol}
                        {Number(exp.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        {Number(exp.taxAmount) > 0 && (
                          <div className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                            (Tax: {currencySymbol}{Number(exp.taxAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/expenses/${exp.id}`)}
                            className="p-2 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                            title="View Expense Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setOpenActionId(openActionId === exp.id ? null : exp.id)}
                              className="p-2 rounded-xl border border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-[#181624] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition cursor-pointer active:scale-95"
                              title="More actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openActionId === exp.id && (
                              <div
                                ref={actionMenuRef}
                                className={`absolute right-0 z-50 w-48 p-1.5 rounded-2xl border border-gray-200/90 dark:border-white/15 bg-white dark:bg-[#181624] shadow-2xl space-y-0.5 backdrop-blur-xl text-left ${
                                  isLastRow ? 'bottom-[110%] mb-1' : 'top-[110%]'
                                }`}
                              >
                              <button
                                onClick={() => {
                                  navigate(`/expenses/${exp.id}/edit`);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                                <span>Edit Expense</span>
                              </button>

                              <button
                                onClick={() => {
                                  handleDuplicate(exp.id, exp.expenseNumber);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-blue-500" />
                                <span>Duplicate</span>
                              </button>

                              <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />

                              <button
                                onClick={() => {
                                  setDeletingExpense(exp);
                                  setOpenActionId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Expense</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200/80 dark:border-white/10 text-xs text-gray-500">
              <div>
                Showing Page <span className="font-bold text-gray-900 dark:text-white">{pagination.page}</span> of{' '}
                <span className="font-bold text-gray-900 dark:text-white">{pagination.totalPages}</span> ({pagination.total} total)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-white/10 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
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
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14131a] max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Delete Expense?</h3>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete expense record <strong className="text-gray-900 dark:text-white">{deletingExpense.expenseNumber}</strong> ({currencySymbol}{deletingExpense.totalAmount})? This action can be audited in logs.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
