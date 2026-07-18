import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  workspaceId: string;
  name: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  taxNumber?: string | null;
  billingAddress?: string | ClientAddress | null;
  shippingAddress?: string | ClientAddress | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postalCode?: string | null;
  notes?: string | null;
  status: ClientStatus;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedClientsResponse {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useClientsQuery = (params: ClientsQueryParams = {}) => {
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useQuery<PaginatedClientsResponse>({
    queryKey: ['clients', activeWorkspaceId, params],
    queryFn: async () => {
      const response = await apiClient.get('/clients', { params });
      return {
        clients: response.data.data || [],
        pagination: response.data.pagination || {
          total: response.data.data?.length || 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 1,
        },
      };
    },
    enabled: !!activeWorkspaceId,
  });
};

export const useClientQuery = (id: string) => {
  const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
  return useQuery<Client>({
    queryKey: ['clients', activeWorkspaceId, id],
    queryFn: async () => {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data.data;
    },
    enabled: !!id && !!activeWorkspaceId,
  });
};

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const response = await apiClient.post('/clients', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await apiClient.put(`/clients/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] });
    },
  });
};

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/clients/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
