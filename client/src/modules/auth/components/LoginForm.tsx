import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { TwoFactorVerifyModal } from './TwoFactorVerifyModal';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onNavigateToRegister }) => {
  const { login, setAuthSession, loginGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<{ userId: string; email: string } | null>(null);
  const [searchParams] = useSearchParams();
  const verifyPending = searchParams.get('verifyPending') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await login({
        email: data.email.trim(),
        password: data.password.trim(),
      });

      if (res?.requires2FA) {
        setTwoFactorData({
          userId: res.data.userId,
          email: res.data.email,
        });
        return;
      }

      onSuccess();
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        err.message ||
        'Login failed. Please try again.';
      setErrorMsg(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASuccess = (data: any) => {
    setAuthSession(data.user, data.workspace, data.accessToken);
    setTwoFactorData(null);
    onSuccess();
  };

  const handleGoogleSignIn = async (credentials: { email: string; firstName: string; lastName: string }) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginGoogle(credentials);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGooglePopup = () => {
    const width = 450;
    const height = 580;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      '/simulated-google-auth',
      'Google Sign In',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no`
    );
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_SIGN_IN_SUCCESS') {
        const { email, firstName, lastName } = event.data.data;
        await handleGoogleSignIn({ email, firstName, lastName });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header Titles */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">Welcome back</h2>
        <p className="text-xs text-gray-400 font-medium">Log in to pick up where your team left off.</p>
      </div>

      {verifyPending && !errorMsg && (
        <div className="p-3.5 text-xs text-emerald-400 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 leading-relaxed text-center font-medium">
          Registration successful! Please check your email to verify your address.
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 text-xs text-rose-400 rounded-2xl border border-rose-500/30 bg-rose-500/10 font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* Single Google Login Button */}
      <button
        type="button"
        onClick={openGooglePopup}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full border border-white/10 bg-white hover:bg-gray-100 text-slate-900 transition cursor-pointer text-xs font-bold shadow-md active:scale-98 disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* OR Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-[#09080e] px-3 text-gray-500 font-bold tracking-widest">OR</span>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-300">Email</label>
          <input
            type="email"
            {...register('email')}
            placeholder="jane@company.com"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-xs font-medium"
          />
          {errors.email && <p className="text-[11px] text-rose-400 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Your password"
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
          {errors.password && <p className="text-[11px] text-rose-400 font-medium">{errors.password.message}</p>}
        </div>

        {/* Submit Pill Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3 px-4 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50 active:scale-98 mt-2"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Log in
        </button>

        {/* Links */}
        <div className="flex flex-col items-center gap-2 text-xs pt-2">
          <Link to="/forgot-password" className="text-gray-400 hover:text-violet-400 transition font-medium">
            Forgot your password? <span className="underline text-violet-400">Reset Your Password</span>
          </Link>

          <div className="text-gray-400 font-medium pt-1">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-violet-400 hover:text-violet-300 font-bold underline cursor-pointer"
            >
              Register
            </button>
          </div>
        </div>
      </form>

      {/* Legal Footer Notice */}
      <p className="text-[10px] text-gray-500 text-center pt-4 border-t border-white/5">
        By continuing, you agree to our{' '}
        <span className="underline cursor-pointer hover:text-gray-400">Terms of Service</span> and{' '}
        <span className="underline cursor-pointer hover:text-gray-400">Privacy Policy</span>.
      </p>

      <TwoFactorVerifyModal
        isOpen={!!twoFactorData}
        userId={twoFactorData?.userId || ''}
        email={twoFactorData?.email || ''}
        onSuccess={handle2FASuccess}
        onCancel={() => setTwoFactorData(null)}
      />
    </div>
  );
};
