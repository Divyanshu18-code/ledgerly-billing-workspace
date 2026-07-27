import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/lib/apiClient';
import { Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMsg('Reset token is missing or invalid.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0d0c12] text-white p-4 sm:p-6 lg:p-8">
      {/* LEFT COLUMN: RESET PASSWORD FORM AREA */}
      <div className="flex flex-col justify-between p-4 sm:p-8 lg:pr-12 relative overflow-hidden">
        {/* Top Logo Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-violet-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-white text-lg font-mono">
              L
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white font-heading">Ledgerly</span>
        </div>

        {/* Center Form / State Container */}
        <div className="w-full my-auto flex justify-center py-6 z-10">
          <div className="w-full max-w-sm space-y-6">
            {!token ? (
              <div className="space-y-6 text-center">
                <div className="h-14 w-14 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white font-heading">Invalid Request</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The password recovery token is missing. Please initiate a new recovery request.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/forgot-password"
                    className="w-full inline-flex items-center justify-center py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-white transition text-xs font-bold shadow-md cursor-pointer"
                  >
                    Request Reset Link
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="space-y-6 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white font-heading">Password Restored</h2>
                  <p className="text-xs text-gray-400">
                    Your account password credentials have been successfully updated.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">Reset Password</h2>
                  <p className="text-xs text-gray-400 font-medium">Specify your new secure credentials below</p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 text-xs text-rose-400 rounded-2xl border border-rose-500/30 bg-rose-500/10 font-medium text-center">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-300">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[11px] text-rose-400">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-300">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('confirmPassword')}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-xs font-medium"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50 active:scale-98 mt-2"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Reset Password
                  </button>
                </form>

                <div className="text-center text-xs text-gray-400 pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer"
                  >
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Small Copyright */}
        <div className="text-[11px] text-gray-500 z-10">
          © {new Date().getFullYear()} Ledgerly SaaS Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: PURPLE ROUNDED CONTAINER (Matching Reference Design) */}
      <div className="hidden lg:flex relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] flex-col items-center justify-center p-8 shadow-2xl border border-violet-400/20">
        {/* Top-Right Pixel Grid Pattern Overlay */}
        <div
          className="absolute top-0 right-0 w-3/4 h-full pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 90% 10%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 90% 10%, black 40%, transparent 100%)',
          }}
        />

        {/* Floating Soft Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Center Glassmorphic Card */}
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6 relative z-10 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white font-heading">Strong Password Security</h3>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              We recommend using a unique password with uppercase letters, numbers, and special symbols to safeguard your billing workspace and invoices.
            </p>
          </div>
        </div>

        {/* Indicator Pill */}
        <div className="flex items-center justify-center gap-2 pt-6 relative z-10">
          <div className="w-8 h-1.5 bg-white rounded-full" />
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
