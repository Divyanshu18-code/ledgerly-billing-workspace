import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, ChevronDown } from 'lucide-react';
import { useCreatePaymentMutation } from '../hooks/usePayments';
import { useInvoicesQuery } from '@/modules/invoices/hooks/useInvoices';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const RecordPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedInvoiceId = searchParams.get('invoiceId') || '';

  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const { data: invoicesData } = useInvoicesQuery({ limit: 100 });
  const invoices = invoicesData?.invoices || (invoicesData as any)?.data || [];

  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionReference, setTransactionReference] = useState('');
  const [status, setStatus] = useState<string>('COMPLETED');
  const [notes, setNotes] = useState('');

  const createPaymentMutation = useCreatePaymentMutation();

  // Find selected invoice object
  const selectedInvoice = invoices.find((inv: any) => inv.id === invoiceId);

  // When selected invoice changes, default payment amount to balanceDue
  useEffect(() => {
    if (selectedInvoice) {
      setAmount(Number(selectedInvoice.balanceDue || 0));
    }
  }, [selectedInvoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId) {
      alert('Please select an invoice');
      return;
    }

    if (amount <= 0) {
      alert('Payment amount must be greater than 0');
      return;
    }

    try {
      await createPaymentMutation.mutateAsync({
        invoiceId,
        clientId: selectedInvoice?.clientId,
        amount: Number(amount),
        paymentMethod,
        paymentDate,
        transactionReference: transactionReference.trim() || null,
        status,
        notes: notes.trim() || null,
      });

      navigate('/payments');
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || 'Failed to record payment');
    }
  };

  const newBalanceDue = selectedInvoice
    ? Math.max(0, Number(selectedInvoice.balanceDue || 0) - (Number(amount) || 0))
    : 0;

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
          Record Payment
        </h1>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm space-y-6">
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Payment Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select an active invoice and specify payment collection details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invoice Selector */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Target Invoice <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161420] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 appearance-none cursor-pointer transition-all hover:border-blue-500/50 shadow-xs"
                >
                  <option value="" className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">-- Select Invoice --</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id} className="bg-white dark:bg-[#161420] text-gray-900 dark:text-white">
                      {inv.invoiceNumber} — {inv.client?.name || 'Client'} (Total: {currencySymbol}
                      {Number(inv.grandTotal).toFixed(2)}, Due: {currencySymbol}
                      {Number(inv.balanceDue).toFixed(2)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Invoice Info Card (If selected) */}
            {selectedInvoice && (
              <div className="md:col-span-2 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row justify-between gap-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-500">Client:</span>{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedInvoice.client?.name || '—'}
                  </span>
                  {selectedInvoice.client?.companyName && (
                    <span className="text-gray-400"> ({selectedInvoice.client.companyName})</span>
                  )}
                </div>

                <div className="flex gap-6">
                  <div>
                    <span className="text-gray-500">Invoice Total:</span>{' '}
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {currencySymbol}
                      {Number(selectedInvoice.grandTotal).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-500">Current Balance Due:</span>{' '}
                    <span className="font-mono font-bold text-rose-500">
                      {currencySymbol}
                      {Number(selectedInvoice.balanceDue).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

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
              {selectedInvoice && (
                <p className="text-[11px] text-gray-400">
                  Remaining balance after payment: <span className="font-mono font-semibold text-blue-400">{currencySymbol}{newBalanceDue.toFixed(2)}</span>
                </p>
              )}
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

            {/* Transaction Reference / Ref # */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Transaction Ref # / UTR / Cheque No.
              </label>
              <input
                type="text"
                placeholder="e.g. UPI/1298492049, TXN-9941"
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
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="COMPLETED"
                    checked={status === 'COMPLETED'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Completed (Verified Inflow)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="PENDING"
                    checked={status === 'PENDING'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Pending Clearance / Verification</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Internal Notes / Remarks
              </label>
              <textarea
                rows={3}
                placeholder="Add any internal payment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
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
            disabled={createPaymentMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            {createPaymentMutation.isPending ? 'Saving...' : 'Save & Sync Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
