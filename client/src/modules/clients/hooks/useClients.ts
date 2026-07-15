import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  taxNumber?: string | null;
  billingAddress: ClientAddress;
  shippingAddress?: ClientAddress | null;
  createdAt: string;
  updatedAt: string;
}

export const useClientsQuery = () => {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get('/clients');
      return response.data.data;
    },
  });
};

export const useClientQuery = (id: string) => {
  return useQuery<Client>({
    queryKey: ['clients', id],
    queryFn: async () => {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      const response = await apiClient.patch(`/clients/${id}`, data);
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
