import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-3 shadow-xl animate-fade-in">
      <WifiOff className="w-4 h-4 animate-bounce shrink-0" />
      <span>You are currently offline. Check your internet connection. Some features may be unavailable.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition flex items-center gap-1 text-[11px] cursor-pointer"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Retry</span>
      </button>
    </div>
  );
};
