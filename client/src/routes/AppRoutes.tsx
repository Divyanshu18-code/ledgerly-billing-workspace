import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

// Shared Components
import DashboardLayout from '@/components/DashboardLayout';
import { ComingSoon } from '@/components/ComingSoon';
import { PageLoader } from '@/components/common/PageLoader';
import { NotFoundPage } from '@/components/common/NotFoundPage';
import { OfflineBanner } from '@/components/common/OfflineBanner';
import { ApiErrorBoundary } from '@/components/common/ApiErrorBoundary';

import { Bot, ShieldCheck, User } from 'lucide-react';

// Lazy Loaded Page Components for Maximum Performance
const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/modules/auth/pages/VerifyEmailPage'));
const SimulatedGoogleAuth = lazy(() => import('@/modules/auth/pages/SimulatedGoogleAuth'));
const ClientsPage = lazy(() => import('@/modules/clients/pages/ClientsPage'));
const ProductsPage = lazy(() => import('@/modules/products/pages/ProductsPage'));
const DashboardPage = lazy(() => import('@/modules/dashboard/pages/DashboardPage'));
const WorkspacePage = lazy(() => import('@/modules/workspace/pages/WorkspacePage'));
const AcceptInvitationPage = lazy(() => import('@/modules/workspace/pages/AcceptInvitationPage'));

// Named Exports Lazy Wrappers
const QuotationsPage = lazy(() => import('@/modules/quotations/pages/QuotationsPage').then((m) => ({ default: m.QuotationsPage })));
const CreateQuotationPage = lazy(() => import('@/modules/quotations/pages/CreateQuotationPage').then((m) => ({ default: m.CreateQuotationPage })));
const EditQuotationPage = lazy(() => import('@/modules/quotations/pages/EditQuotationPage').then((m) => ({ default: m.EditQuotationPage })));
const QuotationDetailsPage = lazy(() => import('@/modules/quotations/pages/QuotationDetailsPage').then((m) => ({ default: m.QuotationDetailsPage })));

const InvoicesPage = lazy(() => import('@/modules/invoices/pages/InvoicesPage').then((m) => ({ default: m.InvoicesPage })));
const CreateInvoicePage = lazy(() => import('@/modules/invoices/pages/CreateInvoicePage').then((m) => ({ default: m.CreateInvoicePage })));
const EditInvoicePage = lazy(() => import('@/modules/invoices/pages/EditInvoicePage').then((m) => ({ default: m.EditInvoicePage })));
const InvoiceDetailsPage = lazy(() => import('@/modules/invoices/pages/InvoiceDetailsPage').then((m) => ({ default: m.InvoiceDetailsPage })));

const PaymentsPage = lazy(() => import('@/modules/payments/pages/PaymentsPage').then((m) => ({ default: m.PaymentsPage })));
const RecordPaymentPage = lazy(() => import('@/modules/payments/pages/RecordPaymentPage').then((m) => ({ default: m.RecordPaymentPage })));
const EditPaymentPage = lazy(() => import('@/modules/payments/pages/EditPaymentPage').then((m) => ({ default: m.EditPaymentPage })));
const PaymentDetailsPage = lazy(() => import('@/modules/payments/pages/PaymentDetailsPage').then((m) => ({ default: m.PaymentDetailsPage })));

const ExpensesPage = lazy(() => import('@/modules/expenses/pages/ExpensesPage').then((m) => ({ default: m.ExpensesPage })));
const CreateExpensePage = lazy(() => import('@/modules/expenses/pages/CreateExpensePage').then((m) => ({ default: m.CreateExpensePage })));
const ExpenseDetailsPage = lazy(() => import('@/modules/expenses/pages/ExpenseDetailsPage').then((m) => ({ default: m.ExpenseDetailsPage })));
const EditExpensePage = lazy(() => import('@/modules/expenses/pages/EditExpensePage').then((m) => ({ default: m.EditExpensePage })));

const ReportsDashboardPage = lazy(() => import('@/modules/reports/pages/ReportsDashboardPage').then((m) => ({ default: m.ReportsDashboardPage })));
const NotificationsPage = lazy(() => import('@/modules/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const ActivityLogsPage = lazy(() => import('@/modules/activity/pages/ActivityLogsPage').then((m) => ({ default: m.ActivityLogsPage })));
const BusinessSettingsPage = lazy(() => import('@/modules/settings/pages/BusinessSettingsPage').then((m) => ({ default: m.BusinessSettingsPage })));

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
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
        <OfflineBanner />
        <ApiErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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
                {/* Main Modules */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/products" element={<ProductsPage />} />
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
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/audit-logs" element={<ActivityLogsPage />} />
                <Route path="/team" element={<WorkspacePage />} />
                <Route path="/settings" element={<BusinessSettingsPage />} />

                {/* Coming Soon Features */}
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

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ApiErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
