import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Paperclip,
  Edit3,
  Copy,
  Trash2,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import {
  useExpenseQuery,
  useDeleteExpenseMutation,
  useDuplicateExpenseMutation,
} from '../hooks/useExpenses';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const ExpenseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const { data: response, isLoading, isError } = useExpenseQuery(id);
  const deleteMutation = useDeleteExpenseMutation();
  const duplicateMutation = useDuplicateExpenseMutation();

  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const expense = response?.data;

  const handleDuplicate = async () => {
    if (!expense) return;
    try {
      await duplicateMutation.mutateAsync(expense.id);
      setFeedbackMsg({ type: 'success', message: `Expense ${expense.expenseNumber} duplicated successfully!` });
      navigate('/expenses');
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err?.response?.data?.message || 'Failed to duplicate expense' });
    }
  };

  const confirmDelete = async () => {
    if (!expense) return;
    try {
      await deleteMutation.mutateAsync(expense.id);
      navigate('/expenses', {
        state: { message: `Expense ${expense.expenseNumber} deleted successfully.` },
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err?.response?.data?.message || 'Failed to delete expense' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-xs text-gray-500 font-medium">Fetching expense details...</p>
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">Expense Record Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          The requested expense record does not exist or has been deleted.
        </p>
        <button
          onClick={() => navigate('/expenses')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
        >
          Back to Expenses
        </button>
      </div>
    );
  }

  const numAmount = Number(expense.amount);
  const numTax = Number(expense.taxAmount);
  const numTotal = Number(expense.totalAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/expenses')}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white font-mono">
                {expense.expenseNumber}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xxs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                {expense.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Recorded on {new Date(expense.expenseDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/expenses/${expense.id}/edit`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer active:scale-95"
          >
            <Edit3 className="h-4 w-4 text-amber-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition cursor-pointer active:scale-95"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 font-bold text-xs hover:bg-rose-500/20 transition cursor-pointer active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
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

      {/* Financial Breakdown Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[22px] border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Total Expense Outflow
          </span>
          <div className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {currencySymbol}{numTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Base Amount + Tax</p>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Base Amount (Pre-Tax)
          </span>
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-2">
            {currencySymbol}{numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Cost before taxes</p>
        </div>

        <div className="p-5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            Input Tax Paid / GST
          </span>
          <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white mt-2">
            {currencySymbol}{numTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1">Eligible for GST Input Credit</p>
        </div>
      </div>

      {/* Detail Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor & Category Details Card */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">Vendor & Classification</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Category</span>
              <span className="font-bold text-gray-900 dark:text-white">{expense.categoryName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Vendor Name</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {expense.vendor?.name || 'Unassigned Vendor'}
              </span>
            </div>

            {expense.vendor?.gstNumber && (
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
                <span className="text-gray-400 font-medium">Vendor GST #</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white uppercase">
                  {expense.vendor.gstNumber}
                </span>
              </div>
            )}

            {expense.vendor?.phone && (
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
                <span className="text-gray-400 font-medium">Phone</span>
                <span className="font-semibold text-gray-900 dark:text-white">{expense.vendor.phone}</span>
              </div>
            )}

            {expense.vendor?.email && (
              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
                <span className="text-gray-400 font-medium">Email</span>
                <span className="font-semibold text-gray-900 dark:text-white">{expense.vendor.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Metadata Card */}
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
            <CreditCard className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">Payment Information</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Payment Method</span>
              <span className="font-bold text-gray-900 dark:text-white uppercase">{expense.paymentMethod}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Currency</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{expense.currency}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Created By User</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {expense.createdBy ? `${expense.createdBy.firstName} ${expense.createdBy.lastName}` : 'System User'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-white/5">
              <span className="text-gray-400 font-medium">Record Created At</span>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(expense.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt & Notes Section */}
      <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
          <Paperclip className="h-5 w-5 text-emerald-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">Receipt Attachment & Notes</h3>
        </div>

        <div className="space-y-4 text-xs">
          {expense.receiptUrl ? (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Paperclip className="h-4 w-4 text-emerald-500" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Receipt File Attached</div>
                  <div className="text-[11px] text-gray-400 truncate max-w-md">{expense.receiptUrl}</div>
                </div>
              </div>
              <a
                href={expense.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition"
              >
                <span>View Receipt</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-white/10 text-gray-400 text-center italic">
              No receipt document link attached to this expense.
            </div>
          )}

          {expense.notes && (
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#161520]/50 space-y-1">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Internal Notes</div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-sans">{expense.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14131a] max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">Delete Expense?</h3>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete expense record <strong className="text-gray-900 dark:text-white">{expense.expenseNumber}</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(false)}
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
