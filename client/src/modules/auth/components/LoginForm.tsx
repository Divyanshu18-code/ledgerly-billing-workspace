import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
  const { login, loginGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      await login({
        email: data.email.trim(),
        password: data.password.trim(),
      });
      onSuccess();
    } catch (err: any) {
      const apiMessage = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || 'Login failed. Please try again.';
      setErrorMsg(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0f0e13]/80 backdrop-blur-xl shadow-2xl relative">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 font-heading">Welcome Back</h2>
        <p className="text-sm text-gray-400">Log in to manage your billing & invoices</p>
      </div>

      {verifyPending && !errorMsg && (
        <div className="p-4 mb-6 text-sm text-emerald-400 rounded-lg border border-emerald-500/20 bg-emerald-500/10 leading-relaxed text-center">
          Registration successful! Please check your email (or <code className="bg-emerald-500/20 px-1 rounded">server/logs/mail.log</code>) to verify your email address.
        </div>
      )}

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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-[#16151a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-white/10 bg-[#16151a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-400 cursor-pointer select-none">
            <input type="checkbox" className="rounded border-white/10 bg-[#16151a] text-blue-600 focus:ring-0 mr-2 cursor-pointer" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 transition">Forgot password?</Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition shadow-lg cursor-pointer text-sm font-semibold"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Sign In
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0f0e13] px-2 text-gray-500 font-semibold tracking-wider">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={openGooglePopup}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-white/10 bg-[#16151a]/50 hover:bg-[#16151a] text-white hover:text-white transition cursor-pointer text-sm font-semibold shadow-sm disabled:opacity-50"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
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
          Google
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
