import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const SimulatedGoogleAuth: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Extract names from email address
    const namePart = email.split('@')[0];
    const nameParts = namePart.split(/[\._-]/);
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'GoogleUser';

    setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_SIGN_IN_SUCCESS',
            data: {
              email,
              firstName,
              lastName,
            },
          },
          window.location.origin
        );
      }
      window.close();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] dark:bg-[#131314] font-sans antialiased text-gray-900 dark:text-gray-100 p-4">
      <div className="w-full max-w-[450px] bg-white dark:bg-[#1e1e20] rounded-3xl p-8 sm:p-10 border border-[#e3e3e3] dark:border-[#303030] shadow-sm relative overflow-hidden">
        
        {/* Google G Logo */}
        <div className="flex justify-start mb-6">
          <svg className="h-6.5 w-6.5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            />
          </svg>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-normal tracking-tight font-heading text-gray-900 dark:text-white">Sign in</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">to continue to <span className="font-semibold">Ledgerly</span></p>
            </div>

            {error && (
              <div className="p-3 text-xs text-red-500 rounded bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or phone"
                className="w-full px-4 py-4 rounded-lg border border-gray-300 dark:border-gray-650 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                required
                autoFocus
              />
            </div>

            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
              Forgot email?
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Not your computer? Use Guest mode to sign in privately.{' '}
              <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                Learn more about using Guest mode
              </span>
            </p>

            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
                Create account
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-normal tracking-tight font-heading text-gray-900 dark:text-white">Welcome</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-transparent text-xs text-gray-700 dark:text-gray-300 max-w-full">
                <span className="truncate">{email}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs text-red-500 rounded bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-4 rounded-lg border border-gray-300 dark:border-gray-650 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="show-pwd" className="rounded border-gray-300 focus:ring-0 h-4 w-4 cursor-pointer" />
              <label htmlFor="show-pwd" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                Show password
              </label>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Next
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SimulatedGoogleAuth;
