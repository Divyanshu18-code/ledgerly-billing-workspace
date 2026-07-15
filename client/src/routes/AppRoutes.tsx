import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import ClientsPage from '@/modules/clients/pages/ClientsPage';
import ProductsPage from '@/modules/products/pages/ProductsPage';
import DashboardLayout from '@/components/DashboardLayout';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0a0f] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DashboardPlaceholder = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col justify-center items-center text-center py-20">
      <h1 className="text-4xl font-bold mb-4 font-heading text-gray-900 dark:text-white">Ledgerly Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium">Welcome, {user?.firstName} {user?.lastName}!</p>
      <p className="text-sm text-gray-500 dark:text-gray-550 max-w-sm">
        Use the sidebar navigation menu on the left to manage clients, create invoice sheets, or update configurations.
      </p>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
