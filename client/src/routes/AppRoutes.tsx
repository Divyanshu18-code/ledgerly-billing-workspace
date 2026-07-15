import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import ClientsPage from '@/modules/clients/pages/ClientsPage';
import ProductsPage from '@/modules/products/pages/ProductsPage';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';
import DashboardLayout from '@/components/DashboardLayout';
import { ComingSoon } from '@/components/ComingSoon';
import {
  Building,
  FileText,
  Briefcase,
  CreditCard,
  TrendingDown,
  BarChart3,
  Bell,
  Users,
  Settings,
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
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
            <Route
              path="/workspace"
              element={
                <ComingSoon
                  icon={Building}
                  title="Workspace Switcher"
                  description="Manage multiple organization spaces, workspace parameters, logos, active currencies, and multi-tenant profiles."
                  breadcrumbs={['Main', 'Workspace']}
                />
              }
            />
            <Route
              path="/quotations"
              element={
                <ComingSoon
                  icon={Briefcase}
                  title="Quotations Builder"
                  description="Draft estimation sheets, send rate proposals to prospects, and automatically convert approved estimations into invoices."
                  breadcrumbs={['Main', 'Quotations']}
                />
              }
            />
            <Route
              path="/invoices"
              element={
                <ComingSoon
                  icon={FileText}
                  title="Invoices Builder"
                  description="Generate premium invoice sheets, set payment due dates, setup recurring schedules, and export documents as PDFs."
                  breadcrumbs={['Main', 'Invoices']}
                />
              }
            />
            <Route
              path="/payments"
              element={
                <ComingSoon
                  icon={CreditCard}
                  title="Payments Processing"
                  description="Integrate Stripe, Razorpay, or bank transfer gateways, automate payment links, and track transaction success logs."
                  breadcrumbs={['Main', 'Payments']}
                />
              }
            />
            <Route
              path="/expenses"
              element={
                <ComingSoon
                  icon={TrendingDown}
                  title="Expenses Registry"
                  description="Log company costs, upload payment receipt files, categorize expenses, and generate spending tax reports."
                  breadcrumbs={['Main', 'Expenses']}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ComingSoon
                  icon={BarChart3}
                  title="Financial Reports"
                  description="Access real-time balance sheets, Profit & Loss graphs, tax estimations, and overall company cashflow analytics."
                  breadcrumbs={['Main', 'Reports']}
                />
              }
            />

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
            <Route
              path="/team"
              element={
                <ComingSoon
                  icon={Users}
                  title="Team & Roles (RBAC)"
                  description="Invite team members, assign custom roles (Owner, Admin, Accountant, Viewer), and configure access privileges."
                  breadcrumbs={['Management', 'Team & Roles']}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <ComingSoon
                  icon={Settings}
                  title="Global Settings"
                  description="Adjust regional date-time preferences, active currencies, tax rules, invoice layouts, and company registrations."
                  breadcrumbs={['Management', 'Settings']}
                />
              }
            />

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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
