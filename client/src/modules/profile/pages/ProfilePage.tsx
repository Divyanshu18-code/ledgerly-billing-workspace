import React, { useState, useEffect } from 'react';
import { useProfile } from '../hooks/useProfile';
import { AvatarUploadModal } from '../components/AvatarUploadModal';
import { EditProfileModal } from '../components/EditProfileModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  User,
  Smartphone,
  History,
  Bell,
  SunMoon,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  Loader2,
  Laptop,
  AlertTriangle,
  Mail,
  Shield,
  Edit3,
} from 'lucide-react';

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const ProfilePage: React.FC = () => {
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdatingProfile,
    uploadAvatar,
    removeAvatar,
    sessions,
    logoutSession,
    logoutAllSessions,
    loginHistory,
    updatePreferences,
    updatePrivacy,
    updateTheme,
    exportAccount,
    isExporting,
    deleteAccount,
    isDeletingAccount,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<
    'personal' | 'sessions' | 'history' | 'preferences' | 'danger'
  >('personal');

  // Form State & Edit Modal State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
        phone: profile.phone || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        gender: profile.gender || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'India',
        postalCode: profile.postalCode || '',
        timezone: profile.timezone || 'UTC',
        language: profile.language || 'en',
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalInfo = async (e?: React.FormEvent, customData?: Record<string, any>) => {
    if (e) e.preventDefault();
    setSaveSuccessMsg(null);
    try {
      await updateProfile(customData || formData);
      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update personal info');
    }
  };

  const handleTogglePreference = async (key: string, currentValue?: boolean) => {
    try {
      await updatePreferences({ [key]: !currentValue });
    } catch (err: any) {
      alert(err.message || 'Failed to update preference');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportAccount();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledgerly_account_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (err: any) {
      alert(err.message || 'Failed to export account data');
    }
  };

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await deleteAccount(deleteConfirmPassword);
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.response?.data?.message || 'Incorrect password. Account deletion failed.');
    }
  };

  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User';
  const userRole = profile?.workspaceMembers?.[0]?.role || 'OWNER';
  const workspaceName = profile?.workspaceMembers?.[0]?.workspace?.name || 'Default Workspace';

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto text-white animate-in fade-in duration-300">
      {/* CLEAN SINGLE PAGE HEADER WITH EDIT PROFILE BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
            Profile Settings
          </h1>
          <p className="text-xs text-gray-400 font-medium pt-0.5">
            Manage how you appear across the workspace and customize account preferences.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {userRole}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active Account
          </span>
        </div>
      </div>

      {/* SMOOTH 5 TAB NAVIGATION BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <User className="w-4 h-4" />
          Personal Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Active Sessions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <History className="w-4 h-4" />
          Login History
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]'
              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <SunMoon className="w-4 h-4" />
          Preferences & Theme
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'danger'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-[1.02]'
              : 'bg-white/5 text-rose-400 hover:text-rose-300 hover:bg-white/10'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Account Management
        </button>
      </div>

      {/* 1. PERSONAL INFORMATION TAB (UNIFIED GLASSMORPHIC 2-COLUMN CONTAINER) */}
      {activeTab === 'personal' && (
        <div className="bg-[#12101b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {/* LEFT USER SUMMARY PANEL (4 Columns) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-between text-center space-y-6 bg-white/[0.02]">
              <div className="space-y-4 w-full flex flex-col items-center">
                <AvatarUploadModal
                  currentAvatar={profile?.avatar}
                  onUpload={uploadAvatar}
                  onRemove={removeAvatar}
                />

                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-heading text-white">{fullName}</h2>
                  <div className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {userRole}
                  </div>
                </div>

                <p className="text-xs italic text-gray-400 leading-relaxed max-w-xs">
                  {profile?.bio || 'No bio provided yet. Click Edit Profile to add your bio intro!'}
                </p>

                <div className="w-full border-t border-white/10 my-2" />

                <div className="w-full space-y-3.5 text-xs text-left text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="truncate">{profile?.email}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="truncate">{workspaceName}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="truncate font-semibold uppercase">{userRole}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-gray-400">
                    <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                    <span>Joined {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-violet-300 font-bold text-xs transition cursor-pointer hover:border-violet-500/30"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile Details
              </button>
            </div>

            {/* RIGHT PERSONAL INFORMATION FORM (8 Columns) */}
            <form
              onSubmit={handleSavePersonalInfo}
              className="lg:col-span-8 p-6 sm:p-8 space-y-6 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-black font-heading">Personal Information</h2>
                  <p className="text-xs text-gray-400">Update your profile details and address info</p>
                </div>
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full animate-in fade-in">
                    {saveSuccessMsg}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Divyanshu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Chief Accountant"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. Finance & Billing"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Gender</label>
                  <CustomSelect
                    options={GENDER_OPTIONS}
                    value={formData.gender || ''}
                    onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
                    placeholder="Select Gender"
                    className="h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country || 'India'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Bio Intro</label>
                  <textarea
                    name="bio"
                    rows={3}
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    placeholder="A short intro about your background..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none resize-none transition"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    placeholder="123 Business Avenue, Suite 400"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center gap-2 py-3 px-8 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
                >
                  {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Save Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ACTIVE SESSIONS TAB */}
      {activeTab === 'sessions' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-white/10 space-y-6 text-white shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-black font-heading">Active Login Sessions</h2>
              <p className="text-xs text-gray-400">Manage devices currently logged into your Ledgerly account</p>
            </div>
            <button
              type="button"
              onClick={() => logoutAllSessions()}
              className="py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition cursor-pointer"
            >
              Logout All Other Devices
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
                  <Laptop className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">Windows PC — Chrome Browser</h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Current Session
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 pt-0.5">
                    IP: 127.0.0.1 • Localhost • Active Now
                  </p>
                </div>
              </div>
            </div>

            {sessions.map((sess: any) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-white/10 text-gray-300">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      {sess.device} — {sess.browser}
                    </h4>
                    <p className="text-[11px] text-gray-400 pt-0.5">
                      IP: {sess.ipAddress} • {sess.location || 'Unknown'} • {new Date(sess.loginTime).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logoutSession(sess.id)}
                  className="py-1.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold cursor-pointer border border-rose-500/20"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LOGIN HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-white/10 space-y-6 text-white shadow-xl animate-in fade-in duration-200">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-black font-heading">Security Audit Log</h2>
            <p className="text-xs text-gray-400">Recent sign-in attempts and security events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-white/5 text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Device & OS</th>
                  <th className="py-3 px-4">Browser</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5">
                  <td className="py-3 px-4 font-mono">{new Date().toLocaleString()}</td>
                  <td className="py-3 px-4">Windows 11 PC</td>
                  <td className="py-3 px-4">Chrome 122.0</td>
                  <td className="py-3 px-4 font-mono">127.0.0.1</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      SUCCESS
                    </span>
                  </td>
                </tr>

                {loginHistory.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">{log.device} ({log.os})</td>
                    <td className="py-3 px-4">{log.browser}</td>
                    <td className="py-3 px-4 font-mono">{log.ipAddress}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PREFERENCES & THEME TAB */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-white/10 space-y-6 text-white shadow-xl">
            <div className="border-b border-white/10 pb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="text-lg font-black font-heading">Notification Alerts</h2>
                <p className="text-xs text-gray-400">Configure email & push alert triggers</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive invoice & account alerts via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser banner notifications' },
                { key: 'invoiceNotifications', label: 'Invoice Activity Alerts', desc: 'When invoices are opened, paid, or overdue' },
                { key: 'paymentNotifications', label: 'Payment Receipts', desc: 'Instant confirmation on online payment collection' },
                { key: 'securityAlerts', label: 'Security & Sign-in Alerts', desc: 'Immediate notification on new device login' },
                { key: 'marketingEmails', label: 'Product News & Updates', desc: 'Monthly feature releases and tips' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div>
                    <div className="text-white">{item.label}</div>
                    <div className="text-[11px] text-gray-400 font-normal">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean((profile as any)?.[item.key])}
                    onChange={() => handleTogglePreference(item.key, (profile as any)?.[item.key])}
                    className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-white/10 space-y-6 text-white shadow-xl">
            <div className="border-b border-white/10 pb-4 flex items-center gap-2">
              <SunMoon className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="text-lg font-black font-heading">Appearance & Privacy</h2>
                <p className="text-xs text-gray-400">Customize display theme and privacy visibility</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Theme Mode</label>
                <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                  {['dark', 'light', 'system'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => updateTheme({ theme: t })}
                      className={`py-3 px-4 rounded-xl border text-capitalize cursor-pointer transition ${
                        profile?.theme === t
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-3">
                <label className="block text-xs font-semibold text-gray-300">Privacy Controls</label>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-semibold">
                  <span>Show Email Address on Public Profile</span>
                  <input
                    type="checkbox"
                    checked={Boolean(profile?.showEmail)}
                    onChange={() => updatePrivacy({ showEmail: !profile?.showEmail })}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-semibold">
                  <span>Show Phone Number on Invoices</span>
                  <input
                    type="checkbox"
                    checked={Boolean(profile?.showPhone)}
                    onChange={() => updatePrivacy({ showPhone: !profile?.showPhone })}
                    className="w-4 h-4 accent-violet-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ACCOUNT MANAGEMENT / DANGER ZONE TAB */}
      {activeTab === 'danger' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#12101b] border border-white/10 space-y-6 text-white shadow-xl animate-in fade-in duration-200">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-black font-heading text-rose-400">Account Management</h2>
            <p className="text-xs text-gray-400">Export your company data or permanently delete your account</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center gap-3 text-violet-400">
                <Download className="w-6 h-6" />
                <h3 className="text-sm font-bold text-white">Export Account Backup Data</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Download a JSON payload containing all your personal details, workspace memberships, and billing counters.
              </p>
              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Account Data JSON
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-sm font-bold text-white">Delete Account Permanently</h3>
              </div>
              <p className="text-xs text-rose-200/80 leading-relaxed">
                Once deleted, your user profile, active sessions, and personal preferences will be permanently wiped. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-600/30"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={formData}
        onSave={async (updatedData) => {
          await handleSavePersonalInfo(undefined, updatedData);
        }}
        isLoading={isUpdatingProfile}
      />

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#12101b] border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-white">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-heading text-white">Confirm Account Deletion</h3>
              <p className="text-xs text-gray-400">
                Please enter your password to confirm permanent deletion of your account.
              </p>
            </div>

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Your Password</label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#171424] text-white text-xs font-medium focus:ring-2 focus:ring-rose-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="py-2.5 px-5 rounded-full bg-transparent hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeletingAccount || !deleteConfirmPassword}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Permanent Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
