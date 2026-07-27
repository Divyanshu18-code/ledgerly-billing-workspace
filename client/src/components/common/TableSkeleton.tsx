import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="w-full rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-xl p-4 space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-white/5 pb-3">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-lg w-1/4" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-24" />
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-20" />
        </div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
            {Array.from({ length: columns }).map((_, cIndex) => (
              <div
                key={cIndex}
                className="h-4 bg-gray-200/80 dark:bg-white/5 rounded-md"
                style={{ width: `${Math.floor(Math.random() * 30) + 15}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
