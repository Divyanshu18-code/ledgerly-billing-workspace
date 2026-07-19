import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/dashboard');
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
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
