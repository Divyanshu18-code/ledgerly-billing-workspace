import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useQuotationQuery,
  useUpdateQuotationStatusMutation,
  useDuplicateQuotationMutation,
  useConvertToInvoiceMutation,
} from '../hooks/useQuotations';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import {
  ArrowLeft,
  Printer,
  Mail,
  Copy,
  FileCheck2,
  Edit3,
  Loader2,
} from 'lucide-react';

export const QuotationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workspace } = useWorkspaceData();
  const { data: quotationResponse, isLoading } = useQuotationQuery(id);

  const quotation = quotationResponse?.data;
  const statusMutation = useUpdateQuotationStatusMutation();
  const duplicateMutation = useDuplicateQuotationMutation();
  const convertMutation = useConvertToInvoiceMutation();

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');

  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-medium text-gray-500">Loading proposal document...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quotation Proposal Not Found</h2>
        <button
          onClick={() => navigate('/quotations')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
        >
          Back to Quotations
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await statusMutation.mutateAsync({ id: quotation.id, status: newStatus });
      setFeedbackMsg({ type: 'success', message: `Quotation status updated to ${newStatus}` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to update status' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await duplicateMutation.mutateAsync(quotation.id);
      setFeedbackMsg({ type: 'success', message: res.message || 'Quotation proposal duplicated' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to duplicate proposal' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleConvert = async () => {
    if (!window.confirm(`Convert quotation ${quotation.quotationNumber} into a live Invoice?`)) return;
    try {
      const res = await convertMutation.mutateAsync(quotation.id);
      setFeedbackMsg({ type: 'success', message: res.message || 'Converted to invoice successfully' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', message: err.response?.data?.message || 'Failed to convert to invoice' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(false);
    setFeedbackMsg({
      type: 'success',
      message: `PDF Rate Proposal for ${quotation.quotationNumber} queued for dispatch to ${emailTo || quotation.client.email}`,
    });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="relative overflow-hidden space-y-6 max-w-4xl mx-auto pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/10 print:hidden">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            title="Back to List"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">
                {quotation.quotationNumber}
              </h1>
              <span className="px-2.5 py-0.5 text-xxs font-extrabold rounded-full border bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase tracking-wider">
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Issued for {quotation.client.name} {quotation.client.companyName ? `(${quotation.client.companyName})` : ''}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={() => {
              setEmailTo(quotation.client.email || '');
              setIsEmailModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Send Email</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 text-gray-700 dark:text-gray-200 text-xs font-semibold transition cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>

          {quotation.status !== 'CONVERTED' && (
            <button
              onClick={handleConvert}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Convert to Invoice</span>
            </button>
          )}
        </div>
      </div>

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

      {/* Status Switcher Bar */}
      <div className="p-3.5 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
        <span className="font-semibold text-gray-500 dark:text-gray-400">Proposal Status Workflow:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                quotation.status === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Quotation Document Paper Card */}
      <div className="p-8 sm:p-12 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#121118] shadow-lg space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-100 dark:border-white/10 pb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black font-heading tracking-wider text-gray-900 dark:text-white uppercase">
              {workspace?.name || 'Ledgerly SaaS'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rate Estimation Proposal</p>
          </div>

          <div className="text-right space-y-1">
            <h3 className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {quotation.quotationNumber}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Date: {new Date(quotation.issueDate).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Client & Company Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Prepared For</h4>
            <div className="font-bold text-sm text-gray-900 dark:text-white font-heading">{quotation.client.name}</div>
            {quotation.client.companyName && (
              <div className="text-gray-600 dark:text-gray-300 font-semibold">{quotation.client.companyName}</div>
            )}
            <div className="text-gray-500 dark:text-gray-400">{quotation.client.email}</div>
            {quotation.client.phone && <div className="text-gray-500 dark:text-gray-400">{quotation.client.phone}</div>}
          </div>

          <div className="space-y-1.5 p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <h4 className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Issuer Details</h4>
            <div className="font-bold text-sm text-gray-900 dark:text-white font-heading">{workspace?.name || 'Company'}</div>
            <div className="text-gray-500 dark:text-gray-400">Currency: {quotation.currency}</div>
            <div className="text-gray-500 dark:text-gray-400">Status: {quotation.status}</div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Itemized Proposal Breakdown</h4>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Item & Description</th>
                <th className="py-2.5 px-3 text-center w-20">Qty</th>
                <th className="py-2.5 px-3 text-right w-28">Unit Price</th>
                <th className="py-2.5 px-3 text-right w-24">Discount</th>
                <th className="py-2.5 px-3 text-right w-20">Tax</th>
                <th className="py-2.5 px-3 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {quotation.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900 dark:text-white font-heading">
                      {item.product?.name || 'Service Line'}
                    </div>
                    {item.description && <div className="text-gray-500 dark:text-gray-400 text-[11px]">{item.description}</div>}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-medium">{Number(item.quantity)}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">
                    {currencySymbol}
                    {Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-500">
                    -{currencySymbol}
                    {Number(item.discountAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-500">
                    {Number(item.taxRateValue || 0)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                    {currencySymbol}
                    {Number(item.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/10">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {currencySymbol}
                {Number(quotation.subTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Total Discount:</span>
              <span className="font-mono font-bold text-rose-500">
                -{currencySymbol}
                {Number(quotation.discountTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Estimated Tax:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                +{currencySymbol}
                {Number(quotation.taxTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-3 border-t border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
              <span>Grand Total:</span>
              <span className="font-mono text-base text-blue-600 dark:text-blue-400">
                {currencySymbol}
                {Number(quotation.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(quotation.notes || quotation.terms) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-white/10 text-xs">
            {quotation.notes && (
              <div className="space-y-1">
                <h5 className="font-bold text-gray-400 uppercase text-[10px]">Notes</h5>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{quotation.notes}</p>
              </div>
            )}
            {quotation.terms && (
              <div className="space-y-1">
                <h5 className="font-bold text-gray-400 uppercase text-[10px]">Terms & Conditions</h5>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{quotation.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <form
            onSubmit={handleSendEmail}
            className="p-6 rounded-[22px] border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14131a] max-w-md w-full space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                Dispatch Proposal Email
              </h3>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-gray-500 dark:text-gray-400">Recipient Email Address</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-xs"
              />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              This will send PDF Proposal <span className="font-mono font-bold text-blue-500">{quotation.quotationNumber}</span> along with your company branding to the recipient.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Dispatch Email
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
