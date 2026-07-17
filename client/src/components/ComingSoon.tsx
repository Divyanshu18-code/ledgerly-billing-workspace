import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  breadcrumbs: string[];
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  icon: Icon,
  title,
  description,
  breadcrumbs,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background glowing blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-blue-600/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Breadcrumbs & Header */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-gray-450 dark:text-gray-500 uppercase">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              <span>{crumb}</span>
              {index < breadcrumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading text-gray-900 dark:text-white">{title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Status: Under Development</p>
          </div>
        </div>
      </div>

      {/* Main Illustration & Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-16 relative z-10 max-w-md mx-auto text-center">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xl shadow-blue-500/5 mb-6 animate-pulse">
          <Icon className="h-10 w-10" />
        </div>

        <span className="inline-block px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/10 mb-3">
          Coming Soon
        </span>
        
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Module Under Construction</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">
          {description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mb-8 max-w-xs">
          This feature module is currently undergoing architecture reviews and database setup. It will be fully functional soon.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition shadow-lg shadow-blue-500/15 cursor-pointer text-sm"
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
