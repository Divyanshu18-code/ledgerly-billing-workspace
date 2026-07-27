import React, { useState } from 'react';
import { CheckCircle2, FileCheck } from 'lucide-react';
import { PaymentReceiptModal } from '@/modules/payments/components/PaymentReceiptModal';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: any;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ isOpen, onClose, result }) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  if (!isOpen || !result) return null;

  const transaction = result?.transaction || {};
  const currencySymbol = transaction?.currency === 'USD' ? '$' : '₹';
  const txnId = transaction?.transactionId || transaction?.id || 'pay_live_txn_001';
  const invoiceNumber = result?.invoiceNumber || 'INV-001';
  const amountPaid = Number(result?.amountPaid || transaction?.amount || 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl p-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white font-heading">Payment Successful!</h2>
            <p className="text-xs text-gray-400">
              Your online payment for Invoice #{invoiceNumber} was processed successfully.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="text-emerald-400 font-bold">{txnId}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Amount Paid:</span>
              <span className="text-white font-bold">
                {currencySymbol}
                {amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-gray-400">Payment Gateway:</span>
              <span className="text-white font-bold">{transaction?.gateway || 'RAZORPAY'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-emerald-400 font-bold uppercase">PAID & VERIFIED</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer active:scale-98"
            >
              <FileCheck className="w-4 h-4" />
              <span>Download Printable Receipt</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold text-xs transition cursor-pointer"
            >
              Done / Back to Invoice
            </button>
          </div>
        </div>
      </div>

      <PaymentReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transactionId={transaction?.id || transaction?.transactionId}
      />
    </>
  );
};
