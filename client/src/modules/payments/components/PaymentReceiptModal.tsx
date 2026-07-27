import React from 'react';
import { Printer, Download, X, FileCheck2, Loader2 } from 'lucide-react';
import { usePaymentReceipt } from '@/modules/payments/hooks/usePaymentGateway';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ isOpen, onClose, transactionId }) => {
  const { data: receiptHtml, isLoading } = usePaymentReceipt(transactionId);

  if (!isOpen) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && receiptHtml) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleDownloadHTML = () => {
    if (!receiptHtml) return;
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transactionId || 'Payment'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Official Payment Receipt</h3>
              <p className="text-xs text-gray-400">Transaction #{transactionId || 'Live'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isLoading || !receiptHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              disabled={isLoading || !receiptHtml}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-white font-bold text-xs cursor-pointer transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-white p-4 overflow-auto">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">Generating Official Printable Receipt...</p>
            </div>
          ) : receiptHtml ? (
            <iframe
              srcDoc={receiptHtml}
              className="w-full h-full border-0 rounded-xl"
              title="Payment Receipt Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-red-500 text-xs font-semibold">
              Failed to load payment receipt
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
