import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

const TESTIMONIALS = [
  {
    quote:
      'Ledgerly is connected to our entire content & finance pipeline. It creates valuable reports for our team and automates online payments effortlessly. Ledgerly closes that loop for us.',
    name: 'Will De Ath',
    role: 'Head of Growth, Inth (YC P26)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    quote:
      'The automated Razorpay & Stripe integration allowed us to collect client payments 3x faster with 100% automated PDF receipts and real-time dashboard analytics.',
    name: 'Alex Vance',
    role: 'CFO, Apex Global (YC W25)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0d0c12] text-white p-4 sm:p-6 lg:p-8">
      {/* LEFT COLUMN: LOGIN FORM AREA */}
      <div className="flex flex-col justify-between p-4 sm:p-8 lg:pr-12 relative overflow-hidden">
        {/* Top Logo Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-violet-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-white text-lg font-mono">
              L
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white font-heading">Ledgerly</span>
        </div>

        {/* Center Login Form Container */}
        <div className="w-full my-auto flex justify-center py-6 z-10">
          <LoginForm onSuccess={handleLoginSuccess} onNavigateToRegister={handleNavigateToRegister} />
        </div>

        {/* Bottom Small Copyright */}
        <div className="text-[11px] text-gray-500 z-10">
          © {new Date().getFullYear()} Ledgerly SaaS Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT COLUMN: PURPLE ROUNDED CONTAINER (Matching Reference Image) */}
      <div className="hidden lg:flex relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#6D28D9] flex-col items-center justify-center p-8 shadow-2xl border border-violet-400/20">
        {/* Top-Right Pixel Grid Pattern Overlay */}
        <div
          className="absolute top-0 right-0 w-3/4 h-full pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 90% 10%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 90% 10%, black 40%, transparent 100%)',
          }}
        />

        {/* Floating Soft Glows */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Center Glassmorphic Testimonial Showcase Card */}
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-6 relative z-10 text-white">
          <blockquote className="text-sm sm:text-base font-normal leading-relaxed text-white/95">
            "{TESTIMONIALS[activeTestimonial].quote}"
          </blockquote>

          <div className="flex items-center gap-3 pt-1">
            <img
              src={TESTIMONIALS[activeTestimonial].avatar}
              alt={TESTIMONIALS[activeTestimonial].name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-md shrink-0"
            />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-white font-heading">
                {TESTIMONIALS[activeTestimonial].name}
              </h4>
              <p className="text-xs text-white/80 font-medium">{TESTIMONIALS[activeTestimonial].role}</p>
            </div>
          </div>
        </div>

        {/* Indicator Dots Below Card */}
        <div className="flex items-center justify-center gap-2 pt-6 relative z-10">
          {TESTIMONIALS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveTestimonial(idx)}
              className={`transition-all cursor-pointer ${
                activeTestimonial === idx
                  ? 'w-8 h-1.5 bg-white rounded-full'
                  : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80 rounded-full'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
