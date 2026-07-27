import React from 'react';
import { CardSkeleton } from './CardSkeleton';
import { TableSkeleton } from './TableSkeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl w-48" />
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded-lg w-64" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl w-32" />
      </div>

      {/* 4 Stat Cards */}
      <CardSkeleton count={4} />

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 p-6 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-1/3" />
          <div className="h-48 bg-gray-200/50 dark:bg-white/5 rounded-2xl w-full" />
        </div>

        <div className="h-72 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 p-6 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 shrink-0" />
                <div className="space-y-1 w-full">
                  <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                  <div className="h-2 bg-gray-200/60 dark:bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  );
};
