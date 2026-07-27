import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface PaymentTransactionItem {
  id: string;
  workspaceId: string;
  invoiceId?: string;
  customerId?: string;
  gateway: 'RAZORPAY' | 'STRIPE' | 'MANUAL';
  transactionId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  paymentDate: string;
  receiptUrl?: string;
  failureReason?: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    grandTotal: number;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useGatewayHistory() {
  return useQuery({
    queryKey: ['payment-gateway-history'],
    queryFn: async () => {
      const res = await apiClient.get('/payments/gateway/history');
      return {
        history: res.data.data as PaymentTransactionItem[],
        metrics: res.data.metrics,
      };
    },
  });
}

export function useCreateGatewayOrder() {
  return useMutation({
    mutationFn: async (payload: {
      invoiceId: string;
      gateway: 'RAZORPAY' | 'STRIPE';
      amount?: number;
    }) => {
      const res = await apiClient.post('/payments/create-order', payload);
      return res.data.data;
    },
  });
}

export function useVerifyGatewayPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      invoiceId: string;
      gateway: 'RAZORPAY' | 'STRIPE';
      orderId: string;
      paymentId: string;
      signature?: string;
      paymentMethod?: string;
      amount?: number;
    }) => {
      const res = await apiClient.post('/payments/verify', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateway-history'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function usePaymentReceipt(transactionId?: string) {
  return useQuery({
    queryKey: ['payment-receipt', transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const res = await apiClient.get(`/payments/gateway/${transactionId}/receipt`);
      return res.data.data.html as string;
    },
    enabled: !!transactionId,
  });
}
