import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { Mail, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [successData, setSuccessData] = useState<{ email: string; verificationToken?: string } | null>(null);

  const handleRegisterSuccess = (data: any) => {
    // Save registration success details to show verification card
    setSuccessData({
      email: data.user.email,
      verificationToken: data.user.verificationToken,
    });
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center py-12 sm:px-6 lg:px-8 bg-[#0c0a0f] bg-gradient-to-br from-[#0c0a0f] via-[#120f18] to-[#08070b] relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6 flex flex-col items-center relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg font-bold text-xl mb-3">
          L
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Ledgerly</h1>
      </div>

      <div className="w-full flex justify-center px-4 relative z-10">
        {successData ? (
          <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-[#0f0e13]/80 backdrop-blur-xl shadow-2xl space-y-6 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto animate-bounce">
              <Mail className="h-5 w-5" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white font-heading">Verification Required</h2>
              <p className="text-sm text-gray-400">
                We have registered your account. Please activate it by verifying your email address.
              </p>
            </div>

            {/* Dev Helper Token card */}
            {successData.verificationToken && (
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-left space-y-3">
                <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 rounded-full">
                  Developer Helper
                </span>
                <p className="text-xs text-gray-300">
                  Because this is running in a local demo environment, click the link below to verify your email:
                </p>
                <div className="p-2.5 rounded bg-black/60 font-mono text-[10px] text-blue-300 break-all select-all border border-white/5">
                  {window.location.origin}/verify-email?token={successData.verificationToken}
                </div>
                <Link
                  to={`/verify-email?token=${successData.verificationToken}`}
                  className="flex items-center justify-center gap-1 text-center text-xs font-bold text-white py-2 rounded bg-blue-600 hover:bg-blue-500 transition cursor-pointer"
                >
                  Verify Email Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <RegisterForm
            onSuccess={(data) => handleRegisterSuccess(data)}
            onNavigateToLogin={handleNavigateToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
