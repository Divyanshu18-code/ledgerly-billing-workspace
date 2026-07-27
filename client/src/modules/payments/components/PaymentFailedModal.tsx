import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface PaymentFailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  reason: string;
}

export const PaymentFailedModal: React.FC<PaymentFailedModalProps> = ({ isOpen, onClose, onRetry, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 shadow-2xl p-6 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-white font-heading">Payment Failed</h2>
          <p className="text-xs text-rose-300 font-medium">{reason}</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/60 text-left text-xs space-y-2 text-gray-400">
          <p className="font-semibold text-gray-300">Troubleshooting Steps:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            <li>Check if your card or UPI account has sufficient balance.</li>
            <li>Ensure multi-factor authentication (OTP) was entered correctly.</li>
            <li>Try switching to another payment method or gateway.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Payment Now</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-gray-400 hover:text-white font-semibold text-xs transition cursor-pointer"
          >
            Cancel / Close
          </button>
        </div>
      </div>
    </div>
  );
};
