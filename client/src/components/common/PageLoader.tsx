import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin shadow-lg shadow-blue-500/30" />
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono tracking-wider animate-pulse">
        LOADING LEDGERLY...
      </p>
    </div>
  );
};
