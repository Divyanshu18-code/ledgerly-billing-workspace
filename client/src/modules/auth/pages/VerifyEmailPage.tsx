import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/apiClient';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }
      try {
        const response = await apiClient.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Email verification failed. The link may have expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-[#0c0a0f] bg-gradient-to-br from-[#0c0a0f] via-[#120f18] to-[#08070b] relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex flex-col items-center relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg font-bold text-xl mb-3">
          L
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Ledgerly</h1>
      </div>

      <div className="w-full flex justify-center px-4 relative z-10">
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0f0e13]/80 backdrop-blur-xl shadow-2xl text-center">
          {status === 'loading' && (
            <div className="space-y-6 py-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-heading">Verifying...</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white font-heading">Account Activated</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{message}</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition shadow-lg shadow-blue-500/15 cursor-pointer text-xs"
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white font-heading">Activation Failed</h2>
                <p className="text-sm text-red-400/90 leading-relaxed">{message}</p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition text-xs font-semibold cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
