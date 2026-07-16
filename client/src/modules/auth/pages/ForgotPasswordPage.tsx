import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/lib/apiClient';
import { Loader2, Mail, ArrowLeft, Send } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ resetToken: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.post('/auth/forgot-password', data);
      setSuccessData(response.data.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-[#0c0a0f] bg-gradient-to-br from-[#0c0a0f] via-[#120f18] to-[#08070b] relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex flex-col items-center relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg font-bold text-xl mb-3">
          L
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Ledgerly</h1>
      </div>

      <div className="w-full flex justify-center px-4 relative z-10">
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0f0e13]/80 backdrop-blur-xl shadow-2xl">
          {successData ? (
            <div className="space-y-6 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Send className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white font-heading">Reset Link Dispatched</h2>
                <p className="text-sm text-gray-400">
                  We have simulated dispatching a password recovery link to your inbox.
                </p>
              </div>

              {/* Dev Helper Token card */}
              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 text-left space-y-3">
                <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 rounded-full">
                  Developer Helper
                </span>
                <p className="text-xs text-gray-300">
                  Because this is running in a local demo environment, copy the reset link below to reset the password:
                </p>
                <div className="p-2.5 rounded bg-black/60 font-mono text-[10px] text-violet-300 break-all select-all border border-white/5">
                  {window.location.origin}/reset-password?token={successData.resetToken}
                </div>
                <Link
                  to={`/reset-password?token=${successData.resetToken}`}
                  className="block text-center text-xs font-bold text-white py-2 rounded bg-violet-600 hover:bg-violet-500 transition cursor-pointer"
                >
                  Proceed to Reset Screen
                </Link>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2 font-heading">Recovery Request</h2>
                <p className="text-sm text-gray-400">Recover your password credentials via your email address</p>
              </div>

              {errorMsg && (
                <div className="p-4 mb-6 text-sm text-red-400 rounded-lg border border-red-500/20 bg-red-500/10">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-[#16151a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition shadow-lg cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : null}
                  Send Recovery Link
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-400">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-medium transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
