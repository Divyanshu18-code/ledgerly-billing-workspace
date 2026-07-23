import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/modules/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '@/modules/auth/pages/VerifyEmailPage';
import SimulatedGoogleAuth from '@/modules/auth/pages/SimulatedGoogleAuth';
import ClientsPage from '@/modules/clients/pages/ClientsPage';
import ProductsPage from '@/modules/products/pages/ProductsPage';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import WorkspacePage from '@/modules/workspace/pages/WorkspacePage';
import AcceptInvitationPage from '@/modules/workspace/pages/AcceptInvitationPage';
import { QuotationsPage } from '@/modules/quotations/pages/QuotationsPage';
import { CreateQuotationPage } from '@/modules/quotations/pages/CreateQuotationPage';
import { EditQuotationPage } from '@/modules/quotations/pages/EditQuotationPage';
import { QuotationDetailsPage } from '@/modules/quotations/pages/QuotationDetailsPage';
import { InvoicesPage } from '@/modules/invoices/pages/InvoicesPage';
import { CreateInvoicePage } from '@/modules/invoices/pages/CreateInvoicePage';
import { EditInvoicePage } from '@/modules/invoices/pages/EditInvoicePage';
import { InvoiceDetailsPage } from '@/modules/invoices/pages/InvoiceDetailsPage';
import { PaymentsPage } from '@/modules/payments/pages/PaymentsPage';
import { RecordPaymentPage } from '@/modules/payments/pages/RecordPaymentPage';
import { EditPaymentPage } from '@/modules/payments/pages/EditPaymentPage';
import { PaymentDetailsPage } from '@/modules/payments/pages/PaymentDetailsPage';
import { ExpensesPage } from '@/modules/expenses/pages/ExpensesPage';
import { CreateExpensePage } from '@/modules/expenses/pages/CreateExpensePage';
import { ExpenseDetailsPage } from '@/modules/expenses/pages/ExpenseDetailsPage';
import { EditExpensePage } from '@/modules/expenses/pages/EditExpensePage';
import { ReportsDashboardPage } from '@/modules/reports/pages/ReportsDashboardPage';
import DashboardLayout from '@/components/DashboardLayout';
import { ComingSoon } from '@/components/ComingSoon';
import {
  Bell,
  Bot,
  Scroll,
  ShieldCheck,
  User,
} from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0a0f] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/simulated-google-auth" element={<SimulatedGoogleAuth />} />
          
          {/* Protected Dashboard Layout Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Main Paths */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            
            {/* Simulated Modules utilizing ComingSoon wrapper */}
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/quotations/new" element={<CreateQuotationPage />} />
            <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
            <Route path="/quotations/:id/edit" element={<EditQuotationPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/invoices/new" element={<CreateInvoicePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
            <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/new" element={<RecordPaymentPage />} />
            <Route path="/payments/:id" element={<PaymentDetailsPage />} />
            <Route path="/payments/:id/edit" element={<EditPaymentPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/expenses/new" element={<CreateExpensePage />} />
            <Route path="/expenses/:id" element={<ExpenseDetailsPage />} />
            <Route path="/expenses/:id/edit" element={<EditExpensePage />} />
            <Route path="/reports" element={<ReportsDashboardPage />} />

            {/* Management Paths */}
            <Route
              path="/notifications"
              element={
                <ComingSoon
                  icon={Bell}
                  title="Notifications Center"
                  description="Manage email templates for invoice alerts, payment receipts, due reminders, and system security warnings."
                  breadcrumbs={['Management', 'Notifications']}
                />
              }
            />
            <Route path="/team" element={<WorkspacePage />} />
            <Route path="/settings" element={<WorkspacePage />} />

            {/* Future Paths */}
            <Route
              path="/ai-assistant"
              element={
                <ComingSoon
                  icon={Bot}
                  title="Gemini AI Assistant"
                  description="Generate invoice descriptions, analyze company cash flow, chat with your finance logs, and automate calculations."
                  breadcrumbs={['Future', 'Gemini AI']}
                />
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ComingSoon
                  icon={Scroll}
                  title="Security Audit Logs"
                  description="Track logins history, configuration updates, workspace settings modifications, and critical invoice edit logs."
                  breadcrumbs={['Future', 'Audit Logs']}
                />
              }
            />
            <Route
              path="/subscription"
              element={
                <ComingSoon
                  icon={ShieldCheck}
                  title="Subscriptions & billing"
                  description="Upgrade your Ledgerly subscription, edit payment cards, download payment invoices, and manage seat limits."
                  breadcrumbs={['Future', 'Subscription']}
                />
              }
            />

            {/* Account Path */}
            <Route
              path="/profile"
              element={
                <ComingSoon
                  icon={User}
                  title="Account Profile"
                  description="Modify your personal profile details, change security passwords, setup 2FA tokens, and customize display names."
                  breadcrumbs={['Account', 'Profile']}
                />
              }
            />
          </Route>

          <Route
            path="/accept-invitation"
            element={
              <ProtectedRoute>
                <AcceptInvitationPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
