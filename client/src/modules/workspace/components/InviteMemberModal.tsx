import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInviteMember } from '../hooks/useWorkspace';
import { X, Mail, ShieldAlert, Loader2, ChevronDown } from 'lucide-react';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'ACCOUNTANT', 'MANAGER', 'VIEWER']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const inviteMutation = useInviteMember();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin (Co-Owner privileges)' },
    { value: 'ACCOUNTANT', label: 'Accountant (Invoices & Reports focus)' },
    { value: 'MANAGER', label: 'Manager (Client & Invoices updates)' },
    { value: 'VIEWER', label: 'Viewer (Read-only access)' },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      role: 'VIEWER',
    },
  });

  const selectedRole = watch('role');

  if (!isOpen) return null;

  const onSubmit = async (data: InviteFormData) => {
    setSubmitError(null);
    try {
      await inviteMutation.mutateAsync(data);
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to send invitation. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0e13] shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-500 flex items-center justify-center flex-shrink-0">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Invite Team Member</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Invite colleagues to collaborate in your workspace.</p>
          </div>
        </div>

        {submitError && (
          <div className="p-3 mb-4 text-xs text-red-500 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              {...register('email')}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              autoFocus
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">Assign Role</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <span>{roleOptions.find((opt) => opt.value === selectedRole)?.label}</span>
              <ChevronDown className="h-4 w-4 text-gray-450" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-250 dark:border-white/10 bg-white dark:bg-[#16151a] p-1 shadow-2xl animate-fade-in max-h-52 overflow-y-auto">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setValue('role', opt.value as any);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                      selectedRole === opt.value
                        ? 'bg-violet-600 text-white'
                        : 'text-gray-800 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            {errors.role && (
              <p className="mt-1.5 text-xs text-red-400">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-150 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-250 dark:border-white/10 bg-transparent text-gray-700 dark:text-gray-350 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
