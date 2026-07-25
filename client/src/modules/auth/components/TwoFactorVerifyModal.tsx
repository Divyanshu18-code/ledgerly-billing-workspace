import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface TwoFactorVerifyModalProps {
  isOpen: boolean;
  userId: string;
  email: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export const TwoFactorVerifyModal: React.FC<TwoFactorVerifyModalProps> = ({
  isOpen,
  userId,
  email,
  onSuccess,
  onCancel,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/auth/verify-2fa', {
        userId,
        otpCode: fullOtp,
      });
      onSuccess(response.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid 2-Step Verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">2-Step Verification</h2>
          <p className="text-sm text-slate-400">
            Enter the 6-digit security code sent to your email <br />
            <span className="font-semibold text-blue-400">{email}</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length !== 6}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all mb-4 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={onCancel}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Back to Login
          </button>
          
          <div className="flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Secured by Ledgerly Auth</span>
          </div>
        </div>

      </div>
    </div>
  );
};
