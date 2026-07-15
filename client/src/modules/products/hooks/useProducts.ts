import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  description?: string | null;
  isService: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useProductsQuery = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await apiClient.get('/products');
      return response.data.data;
    },
  });
};

export const useProductQuery = (id: string) => {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiClient.post('/products', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      const response = await apiClient.patch(`/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
