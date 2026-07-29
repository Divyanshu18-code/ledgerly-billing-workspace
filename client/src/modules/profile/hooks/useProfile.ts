import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  phone?: string | null;
  avatar?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  timezone?: string | null;
  language?: string | null;
  theme?: string | null;
  fontSize?: string | null;
  compactMode?: boolean;
  twoFactorEnabled?: boolean;
  isVerified: boolean;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  invoiceNotifications?: boolean;
  paymentNotifications?: boolean;
  securityAlerts?: boolean;
  marketingEmails?: boolean;
  profileVisibility?: string;
  showEmail?: boolean;
  showPhone?: boolean;
  activityVisibility?: boolean;
  workspaceMembers?: Array<{
    role: string;
    workspace: {
      id: string;
      name: string;
      logoUrl?: string | null;
    };
  }>;
}

export function useProfile() {
  const queryClient = useQueryClient();

  // Fetch Profile
  const profileQuery = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await apiClient.get('/profile');
      return response.data.data;
    },
  });

  // Update Profile Info
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiClient.put('/profile', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Upload Avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (avatar: string) => {
      const response = await apiClient.post('/profile/avatar', { avatar });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Remove Avatar
  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/profile/avatar');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.put('/profile/password', payload);
      return response.data.data;
    },
  });

  // Active Sessions Query
  const sessionsQuery = useQuery({
    queryKey: ['profile-sessions'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/sessions');
      return response.data.data;
    },
  });

  // Logout Session
  const logoutSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.delete(`/profile/sessions/${sessionId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-sessions'] });
    },
  });

  // Logout All Other Sessions
  const logoutAllSessionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/profile/sessions');
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-sessions'] });
    },
  });

  // Login History Query
  const loginHistoryQuery = useQuery({
    queryKey: ['profile-login-history'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/login-history');
      return response.data.data;
    },
  });

  // Update Preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiClient.put('/profile/preferences', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Update Privacy
  const updatePrivacyMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await apiClient.put('/profile/privacy', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Update Theme Settings
  const updateThemeMutation = useMutation({
    mutationFn: async (payload: { theme: string; fontSize?: string; compactMode?: boolean }) => {
      const response = await apiClient.put('/profile/theme', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Export Account Data
  const exportAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/profile/export');
      return response.data.data;
    },
  });

  // Delete Account
  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiClient.delete('/profile', { data: { password } });
      return response.data.data;
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    removeAvatar: removeAvatarMutation.mutateAsync,
    isRemovingAvatar: removeAvatarMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    sessions: sessionsQuery.data || [],
    isLoadingSessions: sessionsQuery.isLoading,
    logoutSession: logoutSessionMutation.mutateAsync,
    logoutAllSessions: logoutAllSessionsMutation.mutateAsync,
    loginHistory: loginHistoryQuery.data || [],
    isLoadingLoginHistory: loginHistoryQuery.isLoading,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    updatePrivacy: updatePrivacyMutation.mutateAsync,
    updateTheme: updateThemeMutation.mutateAsync,
    exportAccount: exportAccountMutation.mutateAsync,
    isExporting: exportAccountMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
