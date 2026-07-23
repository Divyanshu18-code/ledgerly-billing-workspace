import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-md overflow-hidden shadow-xs animate-pulse">
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/60 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-md w-32" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-48" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center justify-between px-6 py-4 gap-4">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className={`h-4 bg-gray-200/70 dark:bg-white/10 rounded-md ${
                  cIdx === 0 ? 'w-36 font-bold' : cIdx === columns - 1 ? 'w-16' : 'w-24'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const KPISkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-md w-24" />
            <div className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="h-7 bg-gray-200 dark:bg-white/10 rounded-lg w-32" />
          <div className="h-3 bg-gray-200/60 dark:bg-white/5 rounded-md w-40" />
        </div>
      ))}
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-md w-32" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200/70 dark:bg-white/10 rounded-md w-3/4" />
            <div className="h-3 bg-gray-200/50 dark:bg-white/5 rounded-md w-1/2" />
          </div>
          <div className="pt-2 flex items-center justify-between">
            <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-md w-20" />
            <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-md space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-white/10 rounded-lg w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-md w-24" />
            <div className="h-11 bg-gray-200/70 dark:bg-white/10 rounded-xl w-full" />
          </div>
        ))}
      </div>
      <div className="pt-4 flex justify-end gap-3">
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl w-28" />
        <div className="h-10 bg-blue-500/40 rounded-xl w-32" />
      </div>
    </div>
  );
};
