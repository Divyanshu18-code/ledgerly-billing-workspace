import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface Product {
  id: string;
  workspaceId: string;
  name: string;
  sku: string;
  type: 'PRODUCT' | 'SERVICE';
  price: number;
  purchasePrice?: number | null;
  description?: string | null;
  category?: string | null;
  unit: string;
  hsnSacCode?: string | null;
  taxRateValue: number;
  taxRateId?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  isService: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  taxRate?: {
    id: string;
    name: string;
    percentage: number;
  } | null;
}

export interface ProductsQueryParams {
  search?: string;
  type?: 'PRODUCT' | 'SERVICE';
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResponse {
  items: Product[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useProductsQuery = (params: ProductsQueryParams = {}) => {
  return useQuery<PaginatedProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.type) query.append('type', params.type);
      if (params.status) query.append('status', params.status);
      if (params.page) query.append('page', params.page.toString());
      if (params.limit) query.append('limit', params.limit.toString());

      const response = await apiClient.get(`/products?${query.toString()}`);
      return response.data.data;
    },
  });
};

export const useProductQuery = (id: string) => {
  return useQuery<Product>({
    queryKey: ['products', 'detail', id],
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
    mutationFn: async (data: Partial<Product>) => {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
      const response = await apiClient.put(`/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', variables.id] });
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
