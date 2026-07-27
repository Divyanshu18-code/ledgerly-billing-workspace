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

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError(null);
    }
  }, [isOpen]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#12101b]/95 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-white space-y-6">
        
        {/* Header Shield Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Title & Email Subtitle */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black tracking-tight text-white font-heading">2-Step Verification</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Enter the 6-digit security code sent to your email <br />
            <span className="font-bold text-violet-400 break-all">{email}</span>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#1a1727] border border-white/10 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 outline-none transition-all text-white font-mono"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400 font-medium">
          <button
            type="button"
            onClick={onCancel}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Back to Login
          </button>
          
          <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-gray-400" />
            <span>Secured by Ledgerly Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
