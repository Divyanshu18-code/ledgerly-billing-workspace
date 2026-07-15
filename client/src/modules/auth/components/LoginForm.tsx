import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
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
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      await login(data);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0f0e13]/80 backdrop-blur-xl shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 font-heading">Welcome Back</h2>
        <p className="text-sm text-gray-400">Log in to manage your billing & invoices</p>
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-white/10 bg-[#16151a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
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
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-white/10 bg-[#16151a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
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
          <label className="flex items-center text-gray-400 cursor-pointer">
            <input type="checkbox" className="rounded border-white/10 bg-[#16151a] text-violet-600 focus:ring-0 mr-2" />
            Remember me
          </label>
          <a href="#" className="text-violet-400 hover:text-violet-300 transition">Forgot password?</a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition shadow-lg cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Sign In
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="text-violet-400 hover:text-violet-300 font-medium transition cursor-pointer"
        >
          Sign up for free
        </button>
      </div>
    </div>
  );
};
