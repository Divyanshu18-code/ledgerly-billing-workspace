import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useWorkspaceData,
  useWorkspaceUpdate,
  useTeamMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useWorkspacesList,
  useWorkspaceSwitch,
  useWorkspaceArchive,
  useLeaveWorkspace,
} from '../hooks/useWorkspace';
import { InviteMemberModal } from '../components/InviteMemberModal';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';
import { TransferOwnershipModal } from '../components/TransferOwnershipModal';
import {
  Building,
  Users,
  AlertTriangle,
  Loader2,
  Trash2,
  ChevronDown,
  Layers,
  Plus,
  LogOut,
  Archive,
  Award,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspaceData();
  const { data: members = [], isLoading: isMembersLoading } = useTeamMembers();
  const { data: workspaces = [], isLoading: isWorkspacesListLoading } = useWorkspacesList();

  const updateWorkspaceMutation = useWorkspaceUpdate();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const switchMutation = useWorkspaceSwitch();
  const archiveMutation = useWorkspaceArchive();
  const leaveMutation = useLeaveWorkspace();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'workspaces'>('profile');

  useEffect(() => {
    if (location.pathname === '/team') {
      setActiveTab('team');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for general info
  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [shouldPreFill, setShouldPreFill] = useState(false);

  // Dropdown open states
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [activeMemberDropdownId, setActiveMemberDropdownId] = useState<string | null>(null);

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'INR', label: 'INR (₹)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  const timezoneOptions = [
    { value: 'UTC', label: 'UTC / GMT' },
    { value: 'Asia/Kolkata', label: 'Asia / Kolkata (IST)' },
    { value: 'America/New_York', label: 'America / New York (EST)' },
    { value: 'Europe/London', label: 'Europe / London (BST)' },
    { value: 'Asia/Singapore', label: 'Asia / Singapore' },
  ];

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ACCOUNTANT', label: 'Accountant' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  // Sync state when workspace data is loaded
  useEffect(() => {
    if (workspace && shouldPreFill) {
      setName(workspace.name || '');
      setGstNumber(workspace.gstNumber || '');
      setCurrency(workspace.currency || 'USD');
      setTimezone(workspace.timezone || 'UTC');
      setInvoicePrefix(workspace.invoicePrefix || 'INV-');
      setAddress(workspace.address || '');
      setPhone(workspace.phone || '');
      setEmail(workspace.email || '');
      setLogoUrl(workspace.logoUrl || '');
    }
  }, [workspace, shouldPreFill]);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateWorkspaceMutation.mutateAsync({
        name,
        gstNumber,
        currency,
        timezone,
        invoicePrefix,
        address,
        phone,
        email,
        logoUrl,
      });
      // Clear inputs upon saving
      setShouldPreFill(false);
      setName('');
      setGstNumber('');
      setAddress('');
      setPhone('');
      setEmail('');
      setLogoUrl('');
      setInvoicePrefix('');

      setSuccessMsg('Workspace settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update workspace. Please try again.');
    }
  };

  const handleSwitchWorkspace = async (workspaceId: string) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await switchMutation.mutateAsync(workspaceId);
      setSuccessMsg('Switched active workspace successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
      setShouldPreFill(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to switch workspace.');
    }
  };

  const handleArchiveWorkspace = async (workspaceId: string, wsName: string) => {
    if (!window.confirm(`WARNING: Are you sure you want to archive (soft delete) "${wsName}"? All business data (invoices, products, clients) will be hidden.`)) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await archiveMutation.mutateAsync(workspaceId);
      setSuccessMsg(`Workspace "${wsName}" archived successfully.`);
      setTimeout(() => {
        setSuccessMsg(null);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to archive workspace.');
    }
  };

  const handleLeaveWorkspace = async (workspaceId: string, wsName: string) => {
    if (!window.confirm(`Are you sure you want to leave "${wsName}"? You will lose access to all its invoices, clients and products.`)) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await leaveMutation.mutateAsync(workspaceId);
      setSuccessMsg(`You have successfully left "${wsName}".`);
      setTimeout(() => {
        setSuccessMsg(null);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to leave workspace.');
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER') => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setActiveMemberDropdownId(null);
    try {
      await updateRoleMutation.mutateAsync({ id: membershipId, role: newRole });
      setSuccessMsg('Team member role updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update member role.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member from the workspace?')) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await removeMemberMutation.mutateAsync(membershipId);
      setSuccessMsg('Team member removed from workspace.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove team member.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Find current user's membership details to check privileges
  const currentUserId = user?.id;
  const currentUserMembership = members?.find((m) => m.userId === currentUserId);
  const isOwnerOrAdmin =
    currentUserMembership?.role === 'OWNER' || currentUserMembership?.role === 'ADMIN';

  if (isWorkspaceLoading || isMembersLoading || isWorkspacesListLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb / Header */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Workspace Configuration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your company information, parameters, active tenants, and invite your team members.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 text-sm text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 bg-emerald-500/10">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 text-sm text-red-500 dark:text-red-400 rounded-lg border border-red-500/20 bg-red-500/10 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-2 border-b border-gray-100 dark:border-white/5 pb-0.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-semibold transition cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Building className="h-4 w-4" />
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('workspaces')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-semibold transition cursor-pointer ${
            activeTab === 'workspaces'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Layers className="h-4 w-4" />
          My Workspaces
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-semibold transition cursor-pointer ${
            activeTab === 'team'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Team Members
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleUpdateWorkspace} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-7 rounded-[22px] border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-[#121118]/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md space-y-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2 font-heading">
                Legal Company Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex. Acme Corp"
                    required
                    disabled={!isOwnerOrAdmin}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    GSTIN / Tax Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="ex. 27AAAAA1111A1Z1"
                    disabled={!isOwnerOrAdmin}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Official Email
                  </label>
                  <input
                    type="type"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex. billing@company.com"
                    disabled={!isOwnerOrAdmin}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-550 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ex. +91 9988776655"
                    disabled={!isOwnerOrAdmin}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ex. Suite 101, Business Park, Phase 1, Mumbai"
                    disabled={!isOwnerOrAdmin}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pt-4 pb-2">
                Regional Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Custom Currency Selector */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Currency
                  </label>
                  <button
                    type="button"
                    onClick={() => isOwnerOrAdmin && setIsCurrencyOpen(!isCurrencyOpen)}
                    disabled={!isOwnerOrAdmin}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <span>{currencyOptions.find((opt) => opt.value === currency)?.label || currency}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {isCurrencyOpen && (
                    <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#18181b] p-1 shadow-2xl animate-fade-in max-h-40 overflow-y-auto">
                      {currencyOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setCurrency(opt.value);
                            setIsCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                            currency === opt.value
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Timezone Selector */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Timezone
                  </label>
                  <button
                    type="button"
                    onClick={() => isOwnerOrAdmin && setIsTimezoneOpen(!isTimezoneOpen)}
                    disabled={!isOwnerOrAdmin}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#18181b] text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <span className="truncate">{timezoneOptions.find((opt) => opt.value === timezone)?.label || timezone}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {isTimezoneOpen && (
                    <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#18181b] p-1 shadow-2xl animate-fade-in max-h-52 overflow-y-auto">
                      {timezoneOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTimezone(opt.value);
                            setIsTimezoneOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                            timezone === opt.value
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-805 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="ex. INV-"
                    disabled={!isOwnerOrAdmin}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              {isOwnerOrAdmin && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  {!shouldPreFill && (
                    <button
                      type="button"
                      onClick={() => setShouldPreFill(true)}
                      className="px-4 py-2.5 text-xs font-bold rounded-lg border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      Load Saved Settings
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={updateWorkspaceMutation.isPending}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
                  >
                    {updateWorkspaceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Save Settings
                  </button>
                </div>
              )}
            </div>

            {/* Logo and info right sidebar cards */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Company Branding</h3>
                <div className="flex flex-col items-center gap-3">
                  <div className="h-20 w-20 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="object-contain h-full w-full" />
                    ) : (
                      <Building className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div className="w-full">
                    <label className="block text-xxs font-bold text-gray-400 uppercase tracking-wider mb-2">Logo Image URL</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="ex. https://example.com/logo.png"
                      disabled={!isOwnerOrAdmin}
                      className="w-full px-2.5 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/2 space-y-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Workspace Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Members:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{members?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Timezone:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{workspace?.timezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Owner role:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {members?.find((m) => m.role === 'OWNER')?.user?.firstName || 'Owner'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : activeTab === 'workspaces' ? (
        <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">My Workspaces</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Switch between active business profiles, transfer ownership, leave, or delete workspaces.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Workspace
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map((ws) => {
              const isActive = ws.id === workspace?.id;
              const isOwnerOfWs = ws.createdById === currentUserId || members.find(m => m.workspaceId === ws.id && m.userId === currentUserId)?.role === 'OWNER';

              return (
                <div
                  key={ws.id}
                  className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/2 shadow-md'
                      : 'border-gray-100 dark:border-white/5 bg-white dark:bg-card hover:border-gray-200 dark:hover:border-white/10'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-950 dark:text-white flex items-center gap-2">
                          {ws.name}
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xxs font-extrabold rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-xxs text-gray-400 mt-0.5 font-mono">{ws.id}</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                        {ws.logoUrl ? (
                          <img src={ws.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                          <Building className="h-4.5 w-4.5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-50 dark:border-white/5 text-xxs text-gray-500 dark:text-gray-400">
                      <div>
                        <span className="block text-gray-400 font-medium">Currency:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-300">{ws.currency}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-medium">Invoice Prefix:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-300">{ws.invoicePrefix}</span>
                      </div>
                      <div>
                        <span className="block text-gray-400 font-medium">Fin. Year:</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-300">{ws.financialYear || '2026-2027'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-2">
                    <div className="flex gap-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSwitchWorkspace(ws.id)}
                          className="px-3 py-1.5 text-xxs font-bold rounded bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                      {isActive && isOwnerOfWs && (
                        <button
                          onClick={() => setIsTransferOpen(true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xxs font-bold rounded border border-amber-500/20 bg-amber-500/5 text-amber-600 hover:bg-amber-500/10 transition cursor-pointer"
                          title="Transfer Workspace Ownership"
                        >
                          <Award className="h-3 w-3" />
                          Transfer Owner
                        </button>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      {isOwnerOfWs ? (
                        <button
                          onClick={() => handleArchiveWorkspace(ws.id, ws.name)}
                          className="p-1.5 rounded border border-red-500/10 bg-red-500/5 text-red-500 hover:bg-red-500/10 cursor-pointer transition"
                          title="Archive Workspace (Soft Delete)"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLeaveWorkspace(ws.id, ws.name)}
                          className="p-1.5 rounded border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer transition"
                          title="Leave Workspace"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-card space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Workspace Members</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                List of team members having access to Ledgerly workspaces.
              </p>
            </div>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition cursor-pointer shadow-sm"
              >
                <Users className="h-4 w-4" />
                Invite Member
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-white/5 min-h-[240px] pb-28">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 text-xxs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  {isOwnerOrAdmin && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isOwner = member.role === 'OWNER';
                  const isSelf = member.userId === currentUserId;

                  return (
                    <tr
                      key={member.id}
                      className="border-b border-gray-50 dark:border-white/2 hover:bg-gray-50/50 dark:hover:bg-white/2 transition text-xs"
                    >
                      <td className="p-4 text-gray-900 dark:text-white font-medium">
                        {member.user.firstName} {member.user.lastName} {isSelf && '(You)'}
                      </td>
                      <td className="p-4 text-gray-500 dark:text-gray-400">{member.user.email}</td>
                      <td className="p-4">
                        {isOwner || isSelf || !isOwnerOrAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-750 dark:text-gray-300">
                            {isOwner ? 'Owner' : member.role}
                          </span>
                        ) : (
                          /* Custom Inline Role Selector */
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setActiveMemberDropdownId(activeMemberDropdownId === member.id ? null : member.id)}
                              disabled={updateRoleMutation.isPending}
                              className="inline-flex items-center justify-between gap-2 px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-350 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition cursor-pointer"
                            >
                              <span>{roleOptions.find((opt) => opt.value === member.role)?.label || member.role}</span>
                              <ChevronDown className="h-3 w-3 text-gray-450" />
                            </button>

                            {activeMemberDropdownId === member.id && (
                              <div className="absolute left-0 z-50 mt-1 w-32 rounded-xl border border-gray-100 dark:border-white/10 bg-white dark:bg-[#18181b] p-1 shadow-2xl animate-fade-in animate-zoom-in">
                                {roleOptions.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleRoleChange(member.id, opt.value as any)}
                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                                      member.role === opt.value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-805 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-white/5'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {isOwnerOrAdmin && (
                        <td className="p-4 text-right">
                          {!isOwner && !isSelf ? (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removeMemberMutation.isPending}
                              className="p-2 rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer disabled:opacity-50 transition"
                              title="Remove Team Member"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <InviteMemberModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          onSuccess={() => {
            setSuccessMsg('Invitation has been sent successfully.');
            setTimeout(() => setSuccessMsg(null), 3000);
          }}
        />
      )}

      {/* Create Workspace Modal */}
      {isCreateOpen && (
        <CreateWorkspaceModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(newWorkspaceId) => {
            handleSwitchWorkspace(newWorkspaceId);
            setSuccessMsg('New workspace created and activated.');
            setTimeout(() => setSuccessMsg(null), 3000);
          }}
        />
      )}

      {/* Transfer Ownership Modal */}
      {isTransferOpen && (
        <TransferOwnershipModal
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => {
            setSuccessMsg('Workspace ownership transferred successfully. You are now an ADMIN.');
            setTimeout(() => {
              setSuccessMsg(null);
              window.location.reload();
            }, 3000);
          }}
          currentUserId={currentUserId || ''}
        />
      )}
    </div>
  );
};

export default WorkspacePage;
