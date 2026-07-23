import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Receipt,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  CreditCard,
  Paperclip,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  useExpenseQuery,
  useUpdateExpenseMutation,
  useVendorsQuery,
  useCategoriesQuery,
} from '../hooks/useExpenses';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const EditExpensePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  // Queries
  const { data: expenseResponse, isLoading, isError } = useExpenseQuery(id);
  const { data: vendorsData } = useVendorsQuery();
  const { data: categoriesData } = useCategoriesQuery();

  const expense = expenseResponse?.data;
  const vendors = vendorsData?.data || [];
  const categories = categoriesData?.data || [];

  // Form State
  const [vendorId, setVendorId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('PAID');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const updateMutation = useUpdateExpenseMutation(id || '');

  // Populate form fields once expense data is loaded
  useEffect(() => {
    if (expense) {
      setVendorId(expense.vendorId || '');
      setCategoryId(expense.categoryId || '');
      setCategoryName(expense.categoryName || 'Miscellaneous');
      setAmount(String(expense.amount));
      setTaxAmount(String(expense.taxAmount));
      setPaymentMethod(expense.paymentMethod || 'CASH');
      if (expense.expenseDate) {
        setExpenseDate(new Date(expense.expenseDate).toISOString().split('T')[0]);
      }
      setReceiptUrl(expense.receiptUrl || '');
      setNotes(expense.notes || '');
      setStatus(expense.status || 'PAID');
    }
  }, [expense]);

  const numAmount = Number(amount || 0);
  const numTax = Number(taxAmount || 0);
  const totalAmount = numAmount + numTax;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const catId = e.target.value;
    setCategoryId(catId);
    const found = categories.find((c) => c.id === catId);
    if (found) {
      setCategoryName(found.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg(null);

    if (!amount || numAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        vendorId: vendorId || null,
        categoryId: categoryId || null,
        categoryName: categoryName || 'Miscellaneous',
        amount: numAmount,
        taxAmount: numTax,
        paymentMethod,
        expenseDate,
        receiptUrl: receiptUrl || null,
        notes: notes || null,
        status,
      });

      navigate(`/expenses/${id}`, {
        state: { message: 'Expense details updated successfully!' },
      });
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update expense. Please check input values.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-xs text-gray-500 font-medium">Loading expense details...</p>
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400">Expense Record Not Found</h2>
        <button onClick={() => navigate('/expenses')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Back to Expenses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100 dark:border-white/10">
        <button
          onClick={() => navigate(`/expenses/${id}`)}
          className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">
            Edit Expense {expense.expenseNumber}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Modify vendor, category, amounts, tax credits, or attached receipt URL
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Expense Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-6">
          {/* Section 1: Vendor & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span>Vendor / Supplier</span>
              </label>
              <div className="relative">
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition"
                >
                  <option value="">Select Vendor (Optional)</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id} className="bg-white dark:bg-[#161420]">
                      {v.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-purple-500" />
                <span>Expense Category</span>
              </label>
              <div className="relative">
                <select
                  value={categoryId}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#161420]">
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Amounts & Tax */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-[#161520]/50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                <span>Base Amount ({currencySymbol}) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-sm font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Tax Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-sm font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Expense Outflow
              </label>
              <div className="px-3.5 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-base font-mono font-extrabold">
                {currencySymbol}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Section 3: Date, Payment Method & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Expense Date</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <span>Payment Method</span>
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition"
                >
                  <option value="CASH" className="bg-white dark:bg-[#161420]">Cash</option>
                  <option value="BANK_TRANSFER" className="bg-white dark:bg-[#161420]">Bank Transfer</option>
                  <option value="UPI" className="bg-white dark:bg-[#161420]">UPI</option>
                  <option value="CREDIT_CARD" className="bg-white dark:bg-[#161420]">Credit Card</option>
                  <option value="DEBIT_CARD" className="bg-white dark:bg-[#161420]">Debit Card</option>
                  <option value="CHEQUE" className="bg-white dark:bg-[#161420]">Cheque</option>
                  <option value="WALLET" className="bg-white dark:bg-[#161420]">Wallet</option>
                  <option value="OTHER" className="bg-white dark:bg-[#161420]">Other</option>
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Status</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition"
                >
                  <option value="PAID" className="bg-white dark:bg-[#161420]">Paid</option>
                  <option value="PENDING" className="bg-white dark:bg-[#161420]">Pending Approval</option>
                  <option value="REJECTED" className="bg-white dark:bg-[#161420]">Rejected</option>
                  <option value="CANCELLED" className="bg-white dark:bg-[#161420]">Cancelled</option>
                </select>
                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 4: Receipt URL & Notes */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-emerald-500" />
                <span>Receipt Attachment Link</span>
              </label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://storage.example.com/receipts/rec-12345.pdf"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Notes & Remarks</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-xs font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/expenses/${id}`)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Expense...</span>
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                <span>Update Expense</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
