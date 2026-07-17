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
  financialYear: string;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
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
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useQuery<WorkspaceDetails>({
    queryKey: ['workspace', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) {
        throw new Error('No active workspace selected');
      }
      const response = await apiClient.get(`/workspaces/${activeWorkspaceId}`);
      return response.data.data;
    },
    enabled: !!activeWorkspaceId,
  });
};

export const useWorkspaceUpdate = () => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useMutation<WorkspaceDetails, Error, Partial<WorkspaceDetails>>({
    mutationFn: async (updatedData) => {
      if (!activeWorkspaceId) throw new Error('No active workspace selected');
      const response = await apiClient.put(`/workspaces/${activeWorkspaceId}`, updatedData);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['workspace', activeWorkspaceId], data);
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (data.name) {
        localStorage.setItem('activeWorkspaceName', data.name);
      }
    },
  });
};

export const useWorkspacesList = () => {
  return useQuery<WorkspaceDetails[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await apiClient.get('/workspaces');
      return response.data.data;
    },
  });
};

export const useWorkspaceCreate = () => {
  const queryClient = useQueryClient();
  return useMutation<WorkspaceDetails, Error, { name: string; currency: string; timezone: string; invoicePrefix: string; financialYear: string }>({
    mutationFn: async (payload) => {
      const response = await apiClient.post('/workspaces', payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // If no active workspace is selected, set this newly created workspace as active
      if (!localStorage.getItem('activeWorkspaceId')) {
        localStorage.setItem('activeWorkspaceId', data.id);
        localStorage.setItem('activeWorkspaceName', data.name);
      }
    },
  });
};

export const useWorkspaceArchive = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (workspaceId) => {
      const response = await apiClient.delete(`/workspaces/${workspaceId}`);
      return response.data;
    },
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (localStorage.getItem('activeWorkspaceId') === workspaceId) {
        localStorage.removeItem('activeWorkspaceId');
        localStorage.removeItem('activeWorkspaceName');
      }
    },
  });
};

export const useWorkspaceSwitch = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (workspaceId) => {
      const response = await apiClient.post('/workspaces/switch', { workspaceId });
      return response.data;
    },
    onSuccess: (data) => {
      const ws = data.data.workspace;
      localStorage.setItem('activeWorkspaceId', ws.id);
      localStorage.setItem('activeWorkspaceName', ws.name);
      // Invalidate all workspace/team queries to reload active context
      queryClient.invalidateQueries();
    },
  });
};

export const useLeaveWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (workspaceId) => {
      const response = await apiClient.post(`/workspaces/${workspaceId}/leave`);
      return response.data;
    },
    onSuccess: (_, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      if (localStorage.getItem('activeWorkspaceId') === workspaceId) {
        localStorage.removeItem('activeWorkspaceId');
        localStorage.removeItem('activeWorkspaceName');
      }
    },
  });
};

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useMutation<any, Error, { targetUserId: string }>({
    mutationFn: async ({ targetUserId }) => {
      if (!activeWorkspaceId) throw new Error('No active workspace selected');
      const response = await apiClient.post(`/workspaces/${activeWorkspaceId}/transfer-ownership`, { targetUserId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] });
      queryClient.invalidateQueries({ queryKey: ['team-members', activeWorkspaceId] });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: async (token) => {
      const response = await apiClient.post('/workspaces/invitations/accept', { token });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Switch to accepted workspace automatically
      localStorage.setItem('activeWorkspaceId', data.workspaceId);
    },
  });
};

export const useTeamMembers = () => {
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useQuery<TeamMember[]>({
    queryKey: ['team-members', activeWorkspaceId],
    queryFn: async () => {
      if (!activeWorkspaceId) return [];
      const response = await apiClient.get(`/workspaces/${activeWorkspaceId}/members`);
      return response.data.data;
    },
    enabled: !!activeWorkspaceId,
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useMutation<
    any,
    Error,
    { email: string; role: 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER' }
  >({
    mutationFn: async (payload) => {
      if (!activeWorkspaceId) throw new Error('No active workspace selected');
      const response = await apiClient.post(`/workspaces/${activeWorkspaceId}/invite`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', activeWorkspaceId] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useMutation<
    any,
    Error,
    { id: string; role: 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'VIEWER' }
  >({
    mutationFn: async ({ id, role }) => {
      if (!activeWorkspaceId) throw new Error('No active workspace selected');
      const response = await apiClient.put(`/workspaces/${activeWorkspaceId}/members/${id}`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', activeWorkspaceId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useMutation<any, Error, string>({
    mutationFn: async (id) => {
      if (!activeWorkspaceId) throw new Error('No active workspace selected');
      const response = await apiClient.delete(`/workspaces/${activeWorkspaceId}/members/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', activeWorkspaceId] });
    },
  });
};
