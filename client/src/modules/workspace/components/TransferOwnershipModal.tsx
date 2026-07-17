import React from 'react';
import { useTransferOwnership, useTeamMembers } from '../hooks/useWorkspace';
import type { TeamMember } from '../hooks/useWorkspace';
import { X, ShieldAlert, Loader2, Award, ChevronDown } from 'lucide-react';

interface TransferOwnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string;
}

export const TransferOwnershipModal: React.FC<TransferOwnershipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUserId,
}) => {
  const { data: members = [] } = useTeamMembers();
  const transferMutation = useTransferOwnership();
  const [targetUserId, setTargetUserId] = React.useState('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Filter out the current owner and pending/unregistered members
  const eligibleMembers = members.filter(
    (m: TeamMember) => m.user.id !== currentUserId && m.role !== 'OWNER'
  );

  React.useEffect(() => {
    if (isOpen) {
      setTargetUserId('');
      setSubmitError(null);
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      setSubmitError('Please select a member to transfer ownership');
      return;
    }

    setSubmitError(null);
    try {
      await transferMutation.mutateAsync({ targetUserId });
      onSuccess();
      onClose();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to transfer ownership. Please try again.');
    }
  };

  const selectedMemberName = eligibleMembers.find((m) => m.user.id === targetUserId)
    ? `${eligibleMembers.find((m) => m.user.id === targetUserId)?.user.firstName} ${eligibleMembers.find((m) => m.user.id === targetUserId)?.user.lastName}`
    : 'Select a team member';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg border border-gray-100 dark:border-white/5 bg-gray-55 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-heading">Transfer Workspace Ownership</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Promote another member to OWNER. You will be demoted to ADMIN.
            </p>
          </div>
        </div>

        <div className="p-3 mb-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex gap-2">
          <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          <span>
            <strong>WARNING:</strong> This action is irreversible. Only the new Owner will be able to archive the workspace or transfer ownership back to you.
          </span>
        </div>

        {submitError && (
          <div className="p-3 mb-4 text-xs text-red-500 rounded bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Select Team Member</label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-card text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="truncate">{selectedMemberName}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-30 mt-1 w-full rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-card p-1 shadow-2xl animate-fade-in max-h-40 overflow-y-auto">
                {eligibleMembers.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">No other eligible members found</div>
                ) : (
                  eligibleMembers.map((m) => (
                    <button
                      key={m.user.id}
                      type="button"
                      onClick={() => {
                        setTargetUserId(m.user.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer transition ${
                        targetUserId === m.user.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="font-semibold">{m.user.firstName} {m.user.lastName}</span>
                      <span className="ml-2 text-xxs opacity-70">({m.user.email}) - {m.role}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-lg border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transferMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
            >
              {transferMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Transfer Ownership</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
