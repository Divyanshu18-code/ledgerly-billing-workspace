import React, { useState } from 'react';
import {
  CheckCircle2,
  Settings,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  X,
  Lock,
} from 'lucide-react';

export const GatewayConfigCards: React.FC = () => {
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayTestMode, setRazorpayTestMode] = useState(true);
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [stripeTestMode, setStripeTestMode] = useState(true);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeConfigModal, setActiveConfigModal] = useState<'RAZORPAY' | 'STRIPE' | null>(null);

  // Key form state
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_ledgerly_live_key');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••••••');
  const [stripeKeyId, setStripeKeyId] = useState('pk_test_stripe_ledgerly_key');
  const [stripeSecret, setStripeSecret] = useState('••••••••••••••••••••');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. RAZORPAY INDIA GATEWAY CARD */}
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#12101d]/90 backdrop-blur-xl shadow-md dark:shadow-xl space-y-5 relative overflow-hidden group hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all duration-300">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-blue-500/5 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

          {/* Card Top Row */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl font-mono shadow-sm">
                ₹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Razorpay India</h3>
                  {razorpayEnabled ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected & Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-500/10 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-500/20 font-bold text-[10px]">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-medium">
                  UPI (GPay / PhonePe), NetBanking, Cards & Wallets
                </p>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <button
              type="button"
              onClick={() => setRazorpayEnabled(!razorpayEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                razorpayEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-md ${
                  razorpayEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mode Pill & API Status Box */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-semibold">Environment Mode:</span>
              <button
                type="button"
                onClick={() => setRazorpayTestMode(!razorpayTestMode)}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  razorpayTestMode
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{razorpayTestMode ? 'Test Sandbox Mode' : 'Live Production Mode'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/5 text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-semibold">Public Key ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-800 dark:text-gray-200 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  {razorpayKeyId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(razorpayKeyId, 'rzp')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Copy Public Key ID"
                >
                  {copiedKey === 'rzp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>HMAC-SHA256 Signature Verified</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveConfigModal('RAZORPAY')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure API Keys</span>
            </button>
          </div>
        </div>

        {/* 2. STRIPE INTERNATIONAL GATEWAY CARD */}
        <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#12101d]/90 backdrop-blur-xl shadow-md dark:shadow-xl space-y-5 relative overflow-hidden group hover:border-purple-500/50 dark:hover:border-purple-500/40 transition-all duration-300">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/5 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

          {/* Card Top Row */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-xl font-mono shadow-sm">
                $
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">Stripe International</h3>
                  {stripeEnabled ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected & Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-500/10 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-500/20 font-bold text-[10px]">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-medium">
                  Global Cards (USD/EUR/GBP), Apple Pay & Google Pay
                </p>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <button
              type="button"
              onClick={() => setStripeEnabled(!stripeEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer shadow-inner ${
                stripeEnabled ? 'bg-purple-600' : 'bg-slate-300 dark:bg-white/10'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-md ${
                  stripeEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mode Pill & API Status Box */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-semibold">Environment Mode:</span>
              <button
                type="button"
                onClick={() => setStripeTestMode(!stripeTestMode)}
                className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  stripeTestMode
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{stripeTestMode ? 'Test Sandbox Mode' : 'Live Production Mode'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-white/5 text-xs">
              <span className="text-slate-600 dark:text-gray-400 font-semibold">Publishable Key:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-800 dark:text-gray-200 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  {stripeKeyId}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(stripeKeyId, 'stripe')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                  title="Copy Publishable Key"
                >
                  {copiedKey === 'stripe' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400 font-medium">
              <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Multi-Currency Autoconvert Ready</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveConfigModal('STRIPE')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-xs transition cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure API Keys</span>
            </button>
          </div>
        </div>
      </div>

      {/* API KEY CONFIGURATION MODAL */}
      {activeConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#161424] shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  Configure {activeConfigModal === 'RAZORPAY' ? 'Razorpay' : 'Stripe'} API Credentials
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveConfigModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setActiveConfigModal(null);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-gray-300">
                  {activeConfigModal === 'RAZORPAY' ? 'Merchant Key ID' : 'Publishable Key'}
                </label>
                <input
                  type="text"
                  value={activeConfigModal === 'RAZORPAY' ? razorpayKeyId : stripeKeyId}
                  onChange={(e) =>
                    activeConfigModal === 'RAZORPAY'
                      ? setRazorpayKeyId(e.target.value)
                      : setStripeKeyId(e.target.value)
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-gray-300">
                  {activeConfigModal === 'RAZORPAY' ? 'Key Secret' : 'Secret Key'}
                </label>
                <input
                  type="password"
                  value={activeConfigModal === 'RAZORPAY' ? razorpaySecret : stripeSecret}
                  onChange={(e) =>
                    activeConfigModal === 'RAZORPAY'
                      ? setRazorpaySecret(e.target.value)
                      : setStripeSecret(e.target.value)
                  }
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveConfigModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
