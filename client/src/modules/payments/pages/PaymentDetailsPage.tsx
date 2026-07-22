import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Edit3,
  Trash2,
  FileText,
  Mail,
  Send,
  MessageCircle,
  X,
  Check,
  Download,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { usePaymentQuery, useDeletePaymentMutation } from '../hooks/usePayments';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';

export const PaymentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: workspace } = useWorkspaceData();
  const currencySymbol = workspace?.currency === 'USD' ? '$' : '₹';

  const { data: response, isLoading } = usePaymentQuery(id);
  const payment = response?.data;

  const deleteMutation = useDeletePaymentMutation();

  // Modal states
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  const handleDelete = async () => {
    if (!payment) return;
    if (window.confirm(`Are you sure you want to delete payment ${payment.paymentNumber}?`)) {
      await deleteMutation.mutateAsync(payment.id);
      navigate('/payments');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp Handlers
  const handleSendWhatsApp = () => {
    if (!payment) return;
    setIsWhatsAppModalOpen(true);
  };

  const executeWhatsAppLaunch = () => {
    if (!payment) return;
    const clientPhone = payment.client?.phone ? payment.client.phone.replace(/[^0-9]/g, '') : '';
    const message =
      `Hello ${payment.client?.name || 'Customer'},\n\n` +
      `Attached is your official Payment Receipt PDF voucher ${payment.paymentNumber} from ${workspace?.name || 'Ledgerly Billing'}.\n\n` +
      `📄 Receipt #: ${payment.paymentNumber}\n` +
      `🧾 Invoice #: ${payment.invoice?.invoiceNumber || 'N/A'}\n` +
      `💵 Amount Paid: ${currencySymbol}${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n` +
      `💳 Method: ${payment.paymentMethod}\n` +
      `📅 Date: ${new Date(payment.paymentDate).toLocaleDateString()}\n\n` +
      `Thank you for your business!`;

    const encodedMsg = encodeURIComponent(message);
    const waUrl = clientPhone ? `https://wa.me/${clientPhone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
  };

  // Open Email Modal
  const openEmailModal = () => {
    if (!payment) return;
    setEmailTo(payment.client?.email || '');
    setEmailSubject(`Payment Receipt - ${payment.paymentNumber} (${workspace?.name || 'Ledgerly'})`);
    setEmailBody(
      `Dear ${payment.client?.name || 'Valued Customer'},\n\n` +
        `We have received your payment of ${currencySymbol}${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} for Invoice ${payment.invoice?.invoiceNumber || ''}.\n\n` +
        `Receipt Details:\n` +
        `- Receipt Number: ${payment.paymentNumber}\n` +
        `- Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}\n` +
        `- Payment Method: ${payment.paymentMethod}\n` +
        `- Transaction Ref: ${payment.transactionReference || 'N/A'}\n` +
        `- Amount Received: ${currencySymbol}${Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n` +
        `Thank you for doing business with us!\n\n` +
        `Best regards,\n${workspace?.name || 'Ledgerly Billing Team'}`
    );
    setIsEmailModalOpen(true);
  };

  // Send Email Trigger (Mailto / Simulation)
  const handleTriggerMailto = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:${emailTo}?subject=${subject}&body=${body}`, '_blank');
    setEmailSentSuccess(true);
    setTimeout(() => {
      setEmailSentSuccess(false);
      setIsEmailModalOpen(false);
    }, 2000);
  };

  if (isLoading) {
    return <div className="py-12 text-center text-gray-400">Loading payment details...</div>;
  }

  if (!payment) {
    return <div className="py-12 text-center text-gray-400">Payment record not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <button
          onClick={() => navigate('/payments')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </button>

        {/* Action Buttons Toolbar with WhatsApp & Mail Options */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          {/* Send via WhatsApp Button */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-98"
            title="Share Payment Receipt via WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Send via Email Button */}
          <button
            type="button"
            onClick={openEmailModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-98"
            title="Send Payment Receipt via Email"
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => navigate(`/payments/${payment.id}/edit`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-xs font-semibold text-amber-600 dark:text-amber-400 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Payment Receipt Master Card */}
      <div className="p-8 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#121118] shadow-xl space-y-8 print:shadow-none print:border-none">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-gray-200/80 dark:border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">
                PAYMENT RECEIPT
              </h1>
              <span className="font-mono text-sm px-3 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                {payment.paymentNumber}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Official Payment Voucher &amp; Cash Clearance Confirmation
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {currencySymbol}
              {Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider mt-0.5">
              Payment Amount
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Information */}
          <div className="p-5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Payment Information
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {payment.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Ref #:</span>
                <span className="font-mono text-gray-900 dark:text-white">
                  {payment.transactionReference || '—'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {payment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Client & Workspace Info */}
          <div className="p-5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Client &amp; Organization
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client Name:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {payment.client?.name || '—'}
                </span>
              </div>

              {payment.client?.companyName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Company:</span>
                  <span className="text-gray-900 dark:text-white">
                    {payment.client.companyName}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-500">Client Email:</span>
                <span className="text-gray-900 dark:text-white">
                  {payment.client?.email || '—'}
                </span>
              </div>

              {payment.createdBy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Recorded By:</span>
                  <span className="text-gray-900 dark:text-white">
                    {payment.createdBy.firstName} {payment.createdBy.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Linked Invoice Summary Card */}
        {payment.invoice && (
          <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Linked Invoice Summary
                </h3>
              </div>

              <button
                onClick={() => navigate(`/invoices/${payment.invoice?.id}`)}
                className="text-xs font-semibold text-blue-500 hover:underline"
              >
                View Full Invoice →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white dark:bg-black/30 border border-gray-200/60 dark:border-white/10">
                <div className="text-gray-400 text-[10px] uppercase">Invoice Number</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {payment.invoice.invoiceNumber}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-black/30 border border-gray-200/60 dark:border-white/10">
                <div className="text-gray-400 text-[10px] uppercase">Invoice Total</div>
                <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                  {currencySymbol}
                  {Number(payment.invoice.grandTotal).toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-black/30 border border-gray-200/60 dark:border-white/10">
                <div className="text-gray-400 text-[10px] uppercase">Total Amount Paid</div>
                <div className="font-bold text-emerald-500 mt-0.5">
                  {currencySymbol}
                  {Number(payment.invoice.amountPaid).toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-black/30 border border-gray-200/60 dark:border-white/10">
                <div className="text-gray-400 text-[10px] uppercase">Remaining Balance</div>
                <div className="font-bold text-rose-500 mt-0.5">
                  {currencySymbol}
                  {Number(payment.invoice.balanceDue).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes / Remarks */}
        {payment.notes && (
          <div className="p-4 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] space-y-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Internal Notes &amp; Remarks
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">{payment.notes}</p>
          </div>
        )}

        {/* Footer Voucher Stamp */}
        <div className="border-t border-gray-200/80 dark:border-white/10 pt-4 flex justify-between items-center text-xs text-gray-400">
          <div>Verified Payment Transaction Document</div>
          <div>Generated by Ledgerly SaaS</div>
        </div>
      </div>

      {/* Send Payment Receipt Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161422] shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-200/80 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                  Send Payment Receipt Email
                </h2>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emailSentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Payment Receipt Email Sent!
                </h3>
                <p className="text-xs text-gray-400">
                  Receipt dispatch triggered successfully for {emailTo}
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Step 1 PDF Download Banner */}
                <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-between">
                  <div className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-blue-400">Step 1:</span> Download receipt PDF to attach
                  </div>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Save PDF
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Message Body
                  </label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/30 text-gray-900 dark:text-white font-mono text-[11px] focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerMailto}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                  >
                    <Send className="w-4 h-4" />
                    Send Email Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* WhatsApp PDF Share Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161422] shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-200/80 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">
                    Send PDF Receipt on WhatsApp
                  </h2>
                  <p className="text-[11px] text-gray-400">Voucher #{payment.paymentNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step PDF Guide */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  <span>How to attach actual PDF in WhatsApp:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 text-[11px]">
                  <li>Click <span className="font-bold text-emerald-500">"1. Download PDF File"</span> below</li>
                  <li>Click <span className="font-bold text-emerald-500">"2. Open WhatsApp Chat"</span></li>
                  <li>In WhatsApp, click 📎 <strong>Paperclip</strong> $\rightarrow$ 📄 <strong>Document</strong> $\rightarrow$ select the downloaded PDF file!</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-98 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>1. Download PDF File ({payment.paymentNumber}.pdf)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    executeWhatsAppLaunch();
                    setIsWhatsAppModalOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold text-xs transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-500" />
                  <span>2. Open WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
