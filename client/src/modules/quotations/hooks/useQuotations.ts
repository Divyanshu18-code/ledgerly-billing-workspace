import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface QuotationItemInput {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
}

export interface QuotationItemData extends QuotationItemInput {
  id: string;
  quotationId: string;
  taxAmount: number;
  totalAmount: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    type: string;
  } | null;
}

export interface Quotation {
  id: string;
  workspaceId: string;
  clientId: string;
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  currency: string;
  notes?: string | null;
  terms?: string | null;
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  createdById?: string | null;
  convertedInvoiceId?: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    companyName?: string | null;
    phone?: string | null;
  };
  items: QuotationItemData[];
}

export interface CreateQuotationPayload {
  clientId: string;
  quotationNumber?: string;
  issueDate?: string;
  validUntil: string;
  status?: string;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items: QuotationItemInput[];
}

export interface QuotationsQueryParams {
  search?: string;
  status?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedQuotationsResponse {
  success: boolean;
  data: Quotation[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useQuotationsQuery = (params: QuotationsQueryParams = {}) => {
  return useQuery<PaginatedQuotationsResponse>({
    queryKey: ['quotations', params],
    queryFn: async () => {
      const response = await apiClient.get('/quotations', { params });
      return response.data;
    },
    staleTime: 1000 * 30, // 30s stale time
  });
};

export const useQuotationQuery = (id?: string) => {
  return useQuery<{ success: boolean; data: Quotation }>({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const response = await apiClient.get(`/quotations/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreateQuotationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateQuotationPayload) => {
      const response = await apiClient.post('/quotations', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateQuotationPayload> }) => {
      const response = await apiClient.put(`/quotations/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
    },
  });
};

export const useUpdateQuotationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/quotations/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
    },
  });
};

export const useDuplicateQuotationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/quotations/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useConvertToInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/quotations/${id}/convert-to-invoice`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables] });
    },
  });
};

export const useDeleteQuotationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/quotations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};
