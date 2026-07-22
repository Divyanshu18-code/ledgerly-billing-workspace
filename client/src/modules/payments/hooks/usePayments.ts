import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface PaymentItem {
  id: string;
  workspaceId: string;
  invoiceId: string;
  clientId: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHEQUE' | 'WALLET' | 'OTHER';
  paymentDate: string;
  transactionReference?: string | null;
  notes?: string | null;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  client?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    companyName?: string | null;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
    status: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  clientId?: string;
  invoiceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedPaymentsResponse {
  success: boolean;
  data: PaymentItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics?: {
    totalCollected: number;
    pendingVerification: number;
    refundedAmount: number;
  };
}

export interface CreatePaymentInput {
  invoiceId: string;
  clientId?: string;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
  transactionReference?: string | null;
  notes?: string | null;
  status?: string;
  currency?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  paymentMethod?: string;
  paymentDate?: string;
  transactionReference?: string | null;
  notes?: string | null;
  status?: string;
}

// Fetch list of payments
export const usePaymentsQuery = (params: PaymentQueryParams = {}) => {
  return useQuery<PaginatedPaymentsResponse>({
    queryKey: ['payments', params],
    queryFn: async () => {
      const response = await apiClient.get('/payments', { params });
      return response.data;
    },
  });
};

// Fetch single payment by ID
export const usePaymentQuery = (id?: string) => {
  return useQuery<{ success: boolean; data: PaymentItem }>({
    queryKey: ['payments', id],
    queryFn: async () => {
      const response = await apiClient.get(`/payments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Record new payment
export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentInput) => {
      const response = await apiClient.post('/payments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Update payment
export const useUpdatePaymentMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePaymentInput) => {
      const response = await apiClient.put(`/payments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Soft delete payment
export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/payments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
