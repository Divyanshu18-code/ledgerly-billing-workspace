import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspaceData } from '@/modules/workspace/hooks/useWorkspace';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  Receipt,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  Building,
  User,
  Sun,
  Moon,
  Briefcase,
  CreditCard,
  BarChart3,
  Bell,
  Bot,
  Scroll,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const { data: workspace } = useWorkspaceData();
  const activeWorkspaceName = workspace?.name || localStorage.getItem('activeWorkspaceName') || 'Default Workspace';

  // Complete Sidebar Categories Setup
  const mainItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspace', path: '/workspace', icon: Building },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Products & Services', path: '/products', icon: Package },
    { name: 'Quotations', path: '/quotations', icon: Briefcase },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const managementItems = [
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Team & Roles', path: '/team', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const futureItems = [
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Audit Logs', path: '/audit-logs', icon: Scroll },
    { name: 'Subscription', path: '/subscription', icon: ShieldCheck },
  ];

  const accountItems = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Helper to generate Breadcrumbs based on location
  const getBreadcrumbs = () => {
    const path = location.pathname.substring(1);
    if (!path || path === 'dashboard') return ['Dashboard'];
    
    // Capitalize and format path
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
    
    // Check categories for section grouping
    const matchesItem = (items: { name: string; path: string }[]) =>
      items.find((item) => item.path === `/${path}`);

    if (matchesItem(mainItems)) return ['Main', capitalize(path)];
    if (matchesItem(managementItems)) return ['Management', capitalize(path)];
    if (matchesItem(futureItems)) return ['Future', capitalize(path)];
    if (matchesItem(accountItems)) return ['Account', capitalize(path)];
    
    return [capitalize(path)];
  };

  const breadcrumbs = getBreadcrumbs();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fcfcfd] dark:bg-[#0d0c11] border-r border-gray-200 dark:border-white/5 text-gray-650 dark:text-gray-400 select-none">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-6 py-6 border-b border-gray-200 dark:border-white/5 ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
          <Building className="h-5 w-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight truncate">Ledgerly</span>
            <span className="h-2 w-2 rounded-full bg-violet-500 flex-shrink-0 animate-pulse" />
          </div>
        )}
      </div>

      {/* Workspace Selector */}
      <div className={`px-4 py-4 relative ${isCollapsed ? 'px-2 flex justify-center' : ''}`}>
        <button
          onClick={() => !isCollapsed && setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#141218]/80 hover:bg-gray-100 dark:hover:bg-[#1a1820] text-gray-900 dark:text-white transition text-left cursor-pointer ${
            isCollapsed ? 'w-10 h-10 p-0 justify-center rounded-lg' : ''
          }`}
          title={isCollapsed ? activeWorkspaceName : undefined}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`h-6 w-6 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0 ${isCollapsed ? 'h-5 w-5' : ''}`}>
              <Building className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium truncate">{activeWorkspaceName}</span>}
          </div>
          {!isCollapsed && <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
        </button>

        {!isCollapsed && isWorkspaceDropdownOpen && (
          <div className="absolute top-[90%] left-4 right-4 z-20 mt-1 p-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#16141c] shadow-xl">
            <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-gray-450 dark:text-gray-550">
              Your Workspaces
            </div>
            <button className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white transition font-medium cursor-pointer">
              {activeWorkspaceName}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-6 py-4 overflow-y-auto scrollbar-thin">
        {/* Helper to render navigation items */}
        {constRenderSection(isCollapsed, 'MAIN', mainItems, location.pathname, () => setIsMobileOpen(false))}
        {constRenderSection(isCollapsed, 'MANAGEMENT', managementItems, location.pathname, () => setIsMobileOpen(false))}
        {constRenderSection(isCollapsed, 'FUTURE', futureItems, location.pathname, () => setIsMobileOpen(false))}
      </nav>

      {/* Bottom Profile Section */}
      <div className={`p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#09080b]/50 ${isCollapsed ? 'p-2 flex flex-col items-center gap-3' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-650 dark:text-violet-400 font-bold text-sm">
              {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className={`flex items-center justify-between border-t border-gray-250/50 dark:border-white/5 pt-2 ${isCollapsed ? 'flex-col gap-3 pt-0 border-t-0 w-full' : ''}`}>
          {isCollapsed ? (
            <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-600/20 flex items-center justify-center text-violet-650 dark:text-violet-400 font-bold text-sm" title={`${user?.firstName} ${user?.lastName}`}>
              {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
          ) : null}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer ${
              isCollapsed ? 'h-10 w-10 flex items-center justify-center p-0' : ''
            }`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Moon className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-500" />
            )}
          </button>

          {isCollapsed ? (
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-450 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition cursor-pointer h-10 w-10 flex items-center justify-center p-0"
              title="View Profile"
            >
              <User className="h-4.5 w-4.5" />
            </button>
          ) : null}

          <button
            onClick={handleSignOut}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition text-sm font-medium cursor-pointer ${
              isCollapsed ? 'h-10 w-10 p-0 border-transparent hover:bg-red-50 dark:hover:bg-red-500/5 text-red-500 dark:text-red-400 hover:text-red-650' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="h-4.5 w-4.5" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0c0a0f] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Desktop Sidebar (Collapsible) */}
      <aside className={`hidden md:block flex-shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {renderSidebarContent()}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gray-50 dark:bg-[#0c0a0f]">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#fcfcfd]/80 dark:bg-[#0d0c11]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 relative z-25">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button (Desktop) */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
            </button>

            {/* Mobile Sidebar open button */}
            <button
              onClick={toggleMobile}
              className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb tracker display */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase select-none">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  <span className={idx === breadcrumbs.length - 1 ? 'text-gray-900 dark:text-white font-bold' : ''}>
                    {crumb}
                  </span>
                  {idx < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* User profile dropdown triggers in Top Navbar */}
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="h-8.5 w-8.5 rounded-full bg-violet-100 dark:bg-violet-600/20 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm hover:scale-105 transition cursor-pointer"
              title="Profile Settings"
            >
              {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer overlay */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobile} />
            
            {/* Drawer */}
            <aside className="relative w-64 h-full flex-shrink-0 z-50">
              {/* Force non-collapsed sidebar inside mobile drawers */}
              <div className="h-full" onClick={(e) => e.stopPropagation()}>
                {renderSidebarContent()}
              </div>
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

// Helper renderer inside file scoping
const constRenderSection = (
  isCollapsed: boolean,
  title: string,
  items: { name: string; path: string; icon: any }[],
  currentPath: string,
  onNavigate: () => void
) => (
  <div className="space-y-1.5">
    {!isCollapsed ? (
      <div className="px-3 text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-550 mb-1.5">
        {title}
      </div>
    ) : (
      <div className="h-px bg-gray-200 dark:bg-white/5 my-3" />
    )}
    
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.path}
            onClick={onNavigate}
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition text-sm font-medium group cursor-pointer border border-transparent ${
              isCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''
            } ${
              isActive
                ? 'bg-violet-50 dark:bg-violet-600/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/10'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <Icon
              className={`h-4.5 w-4.5 flex-shrink-0 transition ${
                isActive ? 'text-violet-600 dark:text-violet-400' : 'text-gray-450 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}
            />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </div>
  </div>
);

export default DashboardLayout;
