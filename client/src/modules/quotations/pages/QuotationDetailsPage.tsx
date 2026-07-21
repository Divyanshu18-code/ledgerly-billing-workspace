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
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Sparkles,
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

  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

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
    <div className="relative space-y-6 max-w-5xl mx-auto pb-16">
      {/* Background ambient light */}
      <div className="absolute top-[-5%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar - Single Line Sleek Button Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200/60 dark:border-white/10 print:hidden relative z-10">
        <div className="flex items-center gap-3.5 shrink-0">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#161420]/80 hover:bg-gray-100 dark:hover:bg-white/10 transition shadow-xs cursor-pointer group"
            title="Back to Quotations"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight font-heading text-gray-900 dark:text-white">
                {quotation.quotationNumber}
              </h1>
              <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase tracking-wider ${
                quotation.status === 'ACCEPTED' || quotation.status === 'APPROVED'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : quotation.status === 'REJECTED'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  : quotation.status === 'SENT'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Issued for {quotation.client.name} {quotation.client.companyName ? `(${quotation.client.companyName})` : ''}
            </p>
          </div>
        </div>

        {/* All Action Buttons on ONE Single Horizontal Line */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-start md:justify-end shrink-0 py-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#1b1928] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <Printer className="h-3.5 w-3.5 text-blue-500" />
            <span>Print PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmailTo(quotation.client.email || '');
              setIsEmailModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#1b1928] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <Mail className="h-3.5 w-3.5 text-amber-500" />
            <span>Send Email</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#1b1928] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <Copy className="h-3.5 w-3.5 text-indigo-400" />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#1b1928] hover:bg-gray-100 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Edit</span>
          </button>

          {quotation.status !== 'CONVERTED' && (
            <button
              type="button"
              onClick={handleConvert}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition cursor-pointer shrink-0 active:scale-98"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Convert to Invoice</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      {/* Unified Master Luxury Card (Combines Workflow Bar & Proposal Sheet into ONE unified experience) */}
      <div className="rounded-[28px] border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-2xl shadow-xl overflow-hidden relative z-10 print:shadow-none print:border-none print:p-0">
        
        {/* Integrated Status Workflow Header Bar inside the Card */}
        <div className="p-4 sm:p-5 bg-gray-50/80 dark:bg-[#181624]/90 border-b border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-bold">
            <Sparkles className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Proposal Status Lifecycle:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { status: 'DRAFT', icon: Clock },
              { status: 'SENT', icon: Send },
              { status: 'ACCEPTED', icon: CheckCircle2 },
              { status: 'REJECTED', icon: XCircle },
            ].map(({ status: st, icon: Icon }) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStatusChange(st)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                  quotation.status === st
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{st}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Printable Proposal Document Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Company Branding & Proposal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-100 dark:border-white/10 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-heading tracking-wider text-gray-900 dark:text-white uppercase">
                {workspace?.name || 'Ledgerly SaaS'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rate Estimation Proposal</p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-lg font-mono font-extrabold text-blue-600 dark:text-blue-400">
                {quotation.quotationNumber}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Date: <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(quotation.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Valid Until: <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(quotation.validUntil).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Prepared For & Issuer Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#181624]/60 border border-gray-200/60 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">PREPARED FOR</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{quotation.client.name}</div>
              {quotation.client.companyName && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{quotation.client.companyName}</div>
              )}
              {quotation.client.email && (
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{quotation.client.email}</div>
              )}
              {quotation.client.phone && (
                <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{quotation.client.phone}</div>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 dark:bg-[#181624]/60 border border-gray-200/60 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-gray-400">ISSUER DETAILS</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{workspace?.name || 'Ledgerly CRM'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Currency: {quotation.currency}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Status: {quotation.status}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Itemized Proposal Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/60 dark:border-white/10 text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-3">Item & Description</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3 text-center">Unit Price</th>
                    <th className="py-3 px-3 text-center">Discount</th>
                    <th className="py-3 px-3 text-center">Tax</th>
                    <th className="py-3 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {quotation.items.map((it: any) => (
                    <tr key={it.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                        {it.product?.name || it.description || 'Custom Service Line'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-700 dark:text-gray-300">
                        {it.quantity}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-700 dark:text-gray-300">
                        {currencySymbol}{Number(it.unitPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-rose-500 font-bold">
                        -{currencySymbol}{Number(it.discountAmount).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-gray-500">
                        {it.taxRateValue}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {currencySymbol}{Number(it.totalAmount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {currencySymbol}{Number(quotation.subTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Total Discount:</span>
                <span className="font-mono font-bold text-rose-500">
                  -{currencySymbol}{Number(quotation.discountTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Estimated Tax:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  +{currencySymbol}{Number(quotation.taxTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-3 border-t border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-blue-600 dark:text-blue-400">
                  {currencySymbol}{Number(quotation.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Notes Footer */}
          {quotation.terms && (
            <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-1">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400">TERMS & CONDITIONS</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{quotation.terms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Dispatch Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="w-full max-w-md p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161424] shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white font-heading">
              Dispatch PDF Proposal via Email
            </h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Recipient Email Address</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  required
                  placeholder="client@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1f1d2b] text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Send Proposal PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
