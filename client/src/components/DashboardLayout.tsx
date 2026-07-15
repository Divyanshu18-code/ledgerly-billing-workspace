import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Receipt,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building,
  User,
  Sun,
  Moon,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const activeWorkspaceName = localStorage.getItem('activeWorkspaceName') || 'Default Workspace';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Invoices', path: '/invoices', icon: FileText, disabled: true },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Expenses', path: '/expenses', icon: Receipt, disabled: true },
    { name: 'Settings', path: '/settings', icon: Settings, disabled: true },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fcfcfd] dark:bg-[#0d0c11] border-r border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-white/5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Building className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">Ledgerly</span>
          <span className="inline-block h-2 w-2 rounded-full bg-violet-500 ml-1 animate-pulse" />
        </div>
      </div>

      {/* Workspace Selector */}
      <div className="px-4 py-4 relative">
        <button
          onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#141218]/80 hover:bg-gray-100 dark:hover:bg-[#1a1820] text-gray-900 dark:text-white transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-6 w-6 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
              <Building className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-sm font-medium truncate">{activeWorkspaceName}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        </button>

        {isWorkspaceDropdownOpen && (
          <div className="absolute top-[90%] left-4 right-4 z-20 mt-1 p-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16141c] shadow-xl">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-550">
              Your Workspaces
            </div>
            <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white transition font-medium cursor-pointer">
              {activeWorkspaceName}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1.5 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return item.disabled ? (
            <div
              key={item.name}
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-gray-400 dark:text-gray-650 cursor-not-allowed select-none text-sm font-medium"
              title="Coming Soon"
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
              <span className="ml-auto text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-gray-450 dark:text-gray-600">
                Soon
              </span>
            </div>
          ) : (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition text-sm font-medium group cursor-pointer ${
                isActive
                  ? 'bg-violet-50 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${
                  isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-450 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#09080b]">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-600 dark:text-violet-400 font-bold text-sm">
            {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Moon className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-medium cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0c0a0f] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Top Navbar Header & Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gray-50 dark:bg-[#0c0a0f]">
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#fcfcfd] dark:bg-[#0d0c11] border-b border-gray-200 dark:border-white/5 relative z-30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-gray-900 dark:text-white">Ledgerly</span>
          </div>

          <button
            onClick={toggleMobile}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer overlay */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-20 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobile} />
            
            {/* Drawer */}
            <aside className="relative w-64 h-full flex-shrink-0 z-30">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative p-6 sm:p-8 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
