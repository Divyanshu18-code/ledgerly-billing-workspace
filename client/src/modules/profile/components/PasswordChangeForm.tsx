import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface PasswordChangeFormProps {
  onSubmit: (payload: { currentPassword: string; newPassword: string }) => Promise<void>;
  isLoading: boolean;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPasswordValue = watch('newPassword', '');

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(newPasswordValue);

  const getStrengthBadge = () => {
    if (!newPasswordValue) return null;
    if (strength <= 2) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (strength <= 4) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const badge = getStrengthBadge();

  const handleFormSubmit = async (data: PasswordFormData) => {
    setStatusMsg(null);
    try {
      await onSubmit({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setStatusMsg({ type: 'success', text: 'Password updated successfully!' });
      reset();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update password.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-medium ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-300">Current Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('currentPassword')}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-[11px] text-rose-400">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-300">New Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          {...register('newPassword')}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-medium"
        />
        {errors.newPassword && <p className="text-[11px] text-rose-400">{errors.newPassword.message}</p>}

        {/* Password Strength Meter */}
        {badge && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Password Strength:</span>
              <span className="font-bold text-white">{badge.label}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full ${badge.color} ${badge.width} transition-all duration-300`} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-300">Confirm New Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          {...register('confirmPassword')}
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#14121c] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs font-medium"
        />
        {errors.confirmPassword && (
          <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50 mt-4"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
        Update Password
      </button>
    </form>
  );
};
