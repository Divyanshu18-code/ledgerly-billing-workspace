import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useWorkspaceData,
  useWorkspaceUpdate,
  useTeamMembers,
  useUpdateMemberRole,
  useRemoveMember,
} from '../hooks/useWorkspace';
import { InviteMemberModal } from '../components/InviteMemberModal';
import {
  Building,
  Users,
  AlertTriangle,
  Loader2,
  Trash2,
  Lock,
  ChevronDown,
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspaceData();
  const { data: members, isLoading: isMembersLoading } = useTeamMembers();

  const updateWorkspaceMutation = useWorkspaceUpdate();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');

  useEffect(() => {
    if (location.pathname === '/team') {
      setActiveTab('team');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
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
    if (workspace) {
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
  }, [workspace]);

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
      setSuccessMsg('Workspace settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update workspace. Please try again.');
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

  if (isWorkspaceLoading || isMembersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Breadcrumb / Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-heading">
            Workspace Configuration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your company information, parameters, and invite your team members.
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
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/5 pb-0.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-semibold transition cursor-pointer ${
            activeTab === 'profile'
              ? 'border-violet-500 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Building className="h-4 w-4" />
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-semibold transition cursor-pointer ${
            activeTab === 'team'
              ? 'border-violet-500 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          Team Members
          {members && (
            <span className="text-[10px] bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded-full font-bold ml-1">
              {members.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'profile' ? (
        <form onSubmit={handleUpdateWorkspace} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side card - Branding logo preview */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f0e13] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building className="h-10 w-10 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Company Branding</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-455 mt-1 max-w-[180px]">
                  Provide a web URL to display your company branding icon on invoices.
                </p>
              </div>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                disabled={!isOwnerOrAdmin}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              />
            </div>

            {/* Right side card - Fields forms */}
            <div className="md:col-span-2 p-6 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f0e13] space-y-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                Business Settings
              </h2>

              {!isOwnerOrAdmin && (
                <div className="p-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Only Owners and Admins can modify these company configurations.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                    disabled={!isOwnerOrAdmin}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider mb-2">
                    GSTIN / Tax Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="27AAAAA1111A1Z1"
                    disabled={!isOwnerOrAdmin}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-655 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@company.com"
                    disabled={!isOwnerOrAdmin}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-655 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9988776655"
                    disabled={!isOwnerOrAdmin}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Billing Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Suite 101, Business Park, Phase 1, Mumbai"
                    disabled={!isOwnerOrAdmin}
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pt-4 pb-2">
                Regional Parameters
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Custom Currency Selector */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-650 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Base Currency
                  </label>
                  <button
                    type="button"
                    onClick={() => isOwnerOrAdmin && setIsCurrencyOpen(!isCurrencyOpen)}
                    disabled={!isOwnerOrAdmin}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                  >
                    <span>{currencyOptions.find((opt) => opt.value === currency)?.label || currency}</span>
                    <ChevronDown className="h-4 w-4 text-gray-450" />
                  </button>

                  {isCurrencyOpen && (
                    <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-250 dark:border-white/10 bg-white dark:bg-[#16151a] p-1 shadow-2xl animate-fade-in max-h-52 overflow-y-auto">
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
                              ? 'bg-violet-600 text-white'
                              : 'text-gray-800 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-white/5'
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
                  <label className="block text-xs font-semibold text-gray-655 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Timezone
                  </label>
                  <button
                    type="button"
                    onClick={() => isOwnerOrAdmin && setIsTimezoneOpen(!isTimezoneOpen)}
                    disabled={!isOwnerOrAdmin}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#16151a] text-gray-900 dark:text-white text-left text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
                  >
                    <span className="truncate">{timezoneOptions.find((opt) => opt.value === timezone)?.label || timezone}</span>
                    <ChevronDown className="h-4 w-4 text-gray-455" />
                  </button>

                  {isTimezoneOpen && (
                    <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-gray-255 dark:border-white/10 bg-white dark:bg-[#16151a] p-1 shadow-2xl animate-fade-in max-h-52 overflow-y-auto">
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
                              ? 'bg-violet-600 text-white'
                              : 'text-gray-800 dark:text-gray-300 hover:bg-gray-150 dark:hover:bg-white/5'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-655 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="INV-"
                    disabled={!isOwnerOrAdmin}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 text-sm"
                  />
                </div>
              </div>

              {isOwnerOrAdmin && (
                <div className="flex justify-end pt-4 border-t border-gray-150 dark:border-white/5">
                  <button
                    type="submit"
                    disabled={updateWorkspaceMutation.isPending}
                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-50 transition cursor-pointer"
                  >
                    {updateWorkspaceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    Save Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-[#0f0e13] space-y-6">
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
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition cursor-pointer shadow-sm"
              >
                <Users className="h-4 w-4" />
                Invite Member
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/5">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 text-gray-655 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-white/5">
                  <th className="p-4 text-xs uppercase tracking-wider">Member Details</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Workspace Role</th>
                  {isOwnerOrAdmin && <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {members?.map((member) => {
                  const avatarText = `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase();
                  const isPending = !member.user.isVerified;
                  const isOwner = member.role === 'OWNER';
                  const isSelf = member.userId === currentUserId;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-white/2 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {avatarText}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight flex items-center gap-1.5">
                            {member.user.firstName} {member.user.lastName}
                            {isSelf && (
                              <span className="text-[9px] bg-violet-600/10 text-violet-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {member.user.email}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Invited (Pending)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {isOwner || !isOwnerOrAdmin || isSelf ? (
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
                              <div className="absolute left-0 z-30 mt-1 w-32 rounded-xl border border-gray-250 dark:border-white/10 bg-white dark:bg-[#16151a] p-1 shadow-2xl animate-fade-in">
                                {roleOptions.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleRoleChange(member.id, opt.value as any)}
                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs cursor-pointer transition ${
                                      member.role === opt.value
                                        ? 'bg-violet-600 text-white'
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
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          setSuccessMsg('Invitation has been sent successfully.');
          setTimeout(() => setSuccessMsg(null), 3000);
        }}
      />
    </div>
  );
};

export default WorkspacePage;
