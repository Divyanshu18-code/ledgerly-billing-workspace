import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown } from 'lucide-react';
import { usePaymentQuery, useUpdatePaymentMutation } from '../hooks/usePayments';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const EditPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const { data: response, isLoading } = usePaymentQuery(id);
  const payment = response?.data;

  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState('');
  const [status, setStatus] = useState<string>('COMPLETED');
  const [notes, setNotes] = useState('');

  const updatePaymentMutation = useUpdatePaymentMutation(id || '');

  useEffect(() => {
    if (payment) {
      setAmount(Number(payment.amount || 0));
      setPaymentMethod(payment.paymentMethod || 'CASH');
      setPaymentDate(payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '');
      setTransactionReference(payment.transactionReference || '');
      setStatus(payment.status || 'COMPLETED');
      setNotes(payment.notes || '');
    }
  }, [payment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }

    try {
      await updatePaymentMutation.mutateAsync({
        amount: Number(amount),
        paymentMethod,
        paymentDate,
        transactionReference: transactionReference.trim() || null,
        status,
        notes: notes.trim() || null,
      });

      navigate(`/payments/${id}`);
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || 'Failed to update payment');
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Loading payment details...</div>;
  }

  if (!payment) {
    return <div className="py-12 text-center text-gray-400">Payment record not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/payments')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </button>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white font-heading">
          Edit Payment — {payment.paymentNumber}
        </h1>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-6">
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Modify Payment Record</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Updating this payment will automatically recalculate the linked invoice status
              </p>
            </div>

            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-500">
              Linked: {payment.invoice?.invoiceNumber || 'Invoice'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Payment Amount ({currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none cursor-pointer transition-all hover:border-blue-500/50 shadow-xs"
                >
                  <option value="CASH" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Cash</option>
                  <option value="BANK_TRANSFER" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Bank Transfer</option>
                  <option value="UPI" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">UPI</option>
                  <option value="CREDIT_CARD" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Credit Card</option>
                  <option value="DEBIT_CARD" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Debit Card</option>
                  <option value="CHEQUE" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Cheque</option>
                  <option value="WALLET" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Wallet</option>
                  <option value="OTHER" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">Other</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Payment Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Transaction Reference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Transaction Reference # / Ref No.
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Payment Status
              </label>
              <div className="flex flex-wrap gap-4">
                {['COMPLETED', 'PENDING', 'REFUNDED', 'FAILED'].map((st) => (
                  <label key={st} className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={st}
                      checked={status === st}
                      onChange={(e) => setStatus(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{st}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Internal Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/payments')}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updatePaymentMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            {updatePaymentMutation.isPending ? 'Saving...' : 'Update & Sync Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
