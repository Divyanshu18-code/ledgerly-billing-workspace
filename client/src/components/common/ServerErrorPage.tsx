import React from 'react';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 relative z-10 p-8 rounded-3xl border border-rose-500/20 bg-slate-900/80 backdrop-blur-2xl shadow-2xl">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20">
          <ServerCrash className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 font-heading">
            500
          </h1>
          <h2 className="text-xl font-extrabold text-white">Internal Server Error</h2>
          <p className="text-xs text-gray-400">
            Something went wrong on our server. Our team has been notified and we are resolving it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 font-bold text-xs transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
