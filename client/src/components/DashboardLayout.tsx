import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspaceData, useWorkspacesList, useWorkspaceSwitch } from '@/modules/workspace/hooks/useWorkspace';
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
  Scroll,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bot,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { data: workspace } = useWorkspaceData();
  const { data: workspaces = [] } = useWorkspacesList();
  const switchWorkspaceMutation = useWorkspaceSwitch();
  const activeWorkspaceName = workspace?.name || localStorage.getItem('activeWorkspaceName') || 'Default Workspace';

  // Refs for click-away behavior
  const workspaceRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Workspace dropdown
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceDropdownOpen(false);
      }
      // Profile dropdown
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Original Project Sidebar Navigation Items
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
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ');
    const allItems = [...mainItems, ...managementItems, ...futureItems];
    const match = allItems.find((item) => item.path === `/${path}`);
    
    if (match) {
      if (mainItems.includes(match)) return ['Main', match.name];
      if (managementItems.includes(match)) return ['Management', match.name];
      if (futureItems.includes(match)) return ['Future', match.name];
    }
    return [capitalize(path)];
  };

  const breadcrumbs = getBreadcrumbs();

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#fcfcfd] dark:bg-[#0d0c11] border-r border-gray-100 dark:border-white/5 text-gray-655 dark:text-gray-400 select-none">
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-6 py-6 border-b border-gray-100 dark:border-white/5 ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-blue-500/25">
            L
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-heading font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">Ledgerly</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 px-1 py-0.2 rounded bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20">CRM</span>
            </div>
          )}
        </Link>
      </div>

      {/* Workspace Selector (Sidebar version, hidden in collapsed) */}
      {!isCollapsed && (
        <div className="px-4 py-4 relative" ref={workspaceRef}>
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-card/80 hover:bg-gray-100 dark:hover:bg-[#1a1820] text-gray-900 dark:text-white transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-6 w-6 rounded bg-gray-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                <Building className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold truncate">{activeWorkspaceName}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          </button>

          {isWorkspaceDropdownOpen && (
            <div className="absolute top-[90%] left-4 right-4 z-20 mt-1 p-1 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#16141c] shadow-xl max-h-48 overflow-y-auto">
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-gray-450 dark:text-gray-550 border-b border-gray-100 dark:border-white/5 pb-1 mb-1">
                Your Workspaces
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={async () => {
                    setIsWorkspaceDropdownOpen(false);
                    try {
                      await switchWorkspaceMutation.mutateAsync(ws.id);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition font-medium cursor-pointer flex items-center justify-between ${
                    ws.id === workspace?.id
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {ws.id === workspace?.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100 dark:border-white/5 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false);
                    navigate('/workspace');
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-55 dark:hover:bg-white/5 text-blue-600 dark:text-blue-400 font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Manage / New
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-6 py-4 overflow-y-auto scrollbar-thin">
        {constRenderSection(isCollapsed, 'MAIN', mainItems, location.pathname, () => setIsMobileOpen(false))}
        {constRenderSection(isCollapsed, 'MANAGEMENT', managementItems, location.pathname, () => setIsMobileOpen(false))}
        {constRenderSection(isCollapsed, 'FUTURE', futureItems, location.pathname, () => setIsMobileOpen(false))}
      </nav>

      {/* Sidebar Footer version note only (Profile and Sign Out removed) */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#09080b]/50">
        {!isCollapsed && (
          <div className="text-[9px] font-bold text-gray-450 dark:text-gray-550 tracking-widest uppercase text-center select-none">
            v0.1 - Foundation build
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Desktop Sidebar (Collapsible) */}
      <aside className={`hidden md:block flex-shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        {renderSidebarContent()}
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gray-50 dark:bg-[#09090b]">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 bg-[#fcfcfd]/80 dark:bg-[#0d0c11]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 relative z-25">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button (Desktop) */}
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
            </button>

            {/* Mobile Sidebar open button */}
            <button
              onClick={toggleMobile}
              className="md:hidden p-2 rounded-lg border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Workspace Selector Badge */}
            <div 
              onClick={() => navigate('/workspace')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold font-heading cursor-pointer hover:bg-gray-50 dark:hover:bg-white/10 transition"
            >
              <Building className="h-3.5 w-3.5 text-blue-500" />
              <span>{activeWorkspaceName}</span>
            </div>

            {/* Breadcrumb tracker display */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase select-none">
              <span>/</span>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  <span className={idx === breadcrumbs.length - 1 ? 'text-gray-800 dark:text-white font-bold' : ''}>
                    {crumb}
                  </span>
                  {idx < breadcrumbs.length - 1 && <span>&gt;</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* User profile, mode toggle, and search section */}
          <div className="flex items-center gap-3">
            {/* Search Input box */}
            <div className="hidden lg:flex items-center relative w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                readOnly
                className="w-full pl-9 pr-12 py-1.5 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-card/80 text-xs text-gray-500 dark:text-gray-400 placeholder-gray-400 cursor-pointer focus:outline-none"
                onClick={() => alert('Search feature is coming soon!')}
              />
              <span className="absolute right-2 top-1.5 px-1.5 py-0.2 rounded border border-gray-100 dark:border-white/10 text-[9px] text-gray-400 dark:text-gray-550 font-bold font-mono bg-gray-55 dark:bg-black/20 select-none">
                ⌘K
              </span>
            </div>

            {/* Create Button */}
            <button
              onClick={() => navigate('/invoices')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-sm transition active:scale-98 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Moon className="h-4.5 w-4.5 text-blue-500" />
              ) : (
                <Sun className="h-4.5 w-4.5 text-amber-500" />
              )}
            </button>

            {/* Interactive User Profile Dropdown container */}
            <div className="flex items-center gap-2 border-l border-gray-100 dark:border-white/10 pl-3 relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="h-8.5 w-8.5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm hover:scale-105 transition cursor-pointer shadow-sm shadow-blue-500/10 focus:outline-none"
                title="Profile Menu"
              >
                {user?.firstName ? user.firstName[0].toUpperCase() : <User className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hidden sm:flex items-center gap-1 text-left focus:outline-none cursor-pointer"
              >
                <div className="max-w-[120px]">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                    {user?.firstName || 'Divyanshu'} {user?.lastName || 'Pandey'}
                  </p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </button>

              {/* Profile Dropdown popover */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-[120%] w-56 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#121115] shadow-2xl p-1.5 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-2.5">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="h-px bg-gray-150 dark:bg-white/5 my-1" />
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition font-medium"
                  >
                    <User className="h-4 w-4 text-blue-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition font-medium"
                  >
                    <Settings className="h-4 w-4 text-blue-500" />
                    <span>Settings</span>
                  </Link>

                  <div className="h-px bg-gray-150 dark:bg-white/5 my-1" />
                  
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition font-bold text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Panel Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-45 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleMobile} />
          <aside className="relative w-64 h-full flex-shrink-0 z-50">
            {renderSidebarContent()}
          </aside>
        </div>
      )}
    </div>
  );
};

// Internal Helper function to render sections with collapsible states
const constRenderSection = (
  isCollapsed: boolean,
  title: string,
  items: { name: string; path: string; icon: any; badge?: number; disabled?: boolean }[],
  currentPath: string,
  onNavigate: () => void
) => (
  <div className="space-y-1.5">
    {!isCollapsed ? (
      <div className="px-3 text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 select-none font-heading">
        {title}
      </div>
    ) : (
      <div className="h-px bg-gray-250 dark:bg-white/5 my-3" />
    )}
    
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.path;
        const Icon = item.icon;
        
        const handleClick = (e: React.MouseEvent) => {
          if (item.disabled) {
            e.preventDefault();
            alert(`${item.name} is coming soon in the next update!`);
            return;
          }
          onNavigate();
        };

        return (
          <Link
            key={item.name}
            to={item.disabled ? '#' : item.path}
            onClick={handleClick}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm font-medium group cursor-pointer border border-transparent ${
              isCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : ''
            } ${
              isActive
                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/10'
                : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white text-gray-600 dark:text-gray-300'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <Icon
                className={`h-4.5 w-4.5 flex-shrink-0 transition ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-450 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </div>
            {!isCollapsed && item.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 select-none">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  </div>
);

export default DashboardLayout;
