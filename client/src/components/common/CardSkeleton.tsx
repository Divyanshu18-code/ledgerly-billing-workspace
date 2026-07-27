import React from 'react';

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white/80 dark:bg-[#13111c]/80 backdrop-blur-xl shadow-md space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
            <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
          </div>
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/3 pt-2" />
        </div>
      ))}
    </div>
  );
};
