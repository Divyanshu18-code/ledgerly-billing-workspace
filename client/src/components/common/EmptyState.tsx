import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-[#13111c]/40 backdrop-blur-md space-y-4 my-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
        <Icon className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-gray-900 dark:text-white font-heading">{title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-98"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
