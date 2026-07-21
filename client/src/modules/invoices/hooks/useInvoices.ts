import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface InvoiceItem {
  id?: string;
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
  taxAmount?: number;
  totalAmount?: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
  } | null;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  clientId: string;
  quotationId?: string | null;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  currency: string;
  notes?: string | null;
  terms?: string | null;
  subTotal: number | string;
  taxTotal: number | string;
  discountTotal: number | string;
  grandTotal: number | string;
  amountPaid: number | string;
  balanceDue: number | string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  workspace?: {
    id: string;
    name: string;
    currency: string;
    gstNumber?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  items: InvoiceItem[];
}

export interface InvoiceItemInput {
  productId?: string | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRateValue?: number;
}

export interface CreateInvoicePayload {
  clientId: string;
  quotationId?: string | null;
  issueDate?: string;
  dueDate: string;
  status?: string;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItemInput[];
}

export interface QueryInvoicesParams {
  search?: string;
  status?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Fetch invoices list
export const useInvoicesQuery = (params: QueryInvoicesParams = {}) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await apiClient.get('/invoices', { params });
      return response.data;
    },
  });
};

// Fetch single invoice
export const useInvoiceQuery = (id?: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
};

// Create invoice mutation
export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const response = await apiClient.post('/invoices', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Update invoice mutation
export const useUpdateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateInvoicePayload> }) => {
      const response = await apiClient.put(`/invoices/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
  });
};

// Duplicate invoice mutation
export const useDuplicateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/invoices/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Convert Quotation to Invoice mutation
export const useConvertQuotationToInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await apiClient.post(`/invoices/from-quotation/${quotationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

// Update invoice status mutation
export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/invoices/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] });
    },
  });
};

// Delete invoice mutation
export const useDeleteInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/invoices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
