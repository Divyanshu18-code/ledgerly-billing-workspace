import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface WorkspaceDetails {
  id: string;
  name: string;
  logoUrl: string | null;
  gstNumber: string | null;
  currency: string;
  timezone: string;
  invoicePrefix: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER';
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
}

export const useWorkspaceData = () => {
  return useQuery<WorkspaceDetails>({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await apiClient.get('/workspace');
      return response.data.data;
    },
  });
};

export const useWorkspaceUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceDetails, Error, Partial<WorkspaceDetails>>({
    mutationFn: async (updatedData) => {
      const response = await apiClient.put('/workspace', updatedData);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['workspace'], data);
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      // Sync local storage workspace name if modified
      if (data.name) {
        localStorage.setItem('activeWorkspaceName', data.name);
      }
    },
  });
};

export const useTeamMembers = () => {
  return useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await apiClient.get('/team');
      return response.data.data;
    },
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { email: string; role: 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER' }
  >({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/team/invite', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    any,
    Error,
    { id: string; role: 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER' }
  >({
    mutationFn: async ({ id, role }) => {
      const response = await apiClient.put(`/team/${id}`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/team/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
};
