import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreatePaymentDTO {
  invoiceId: string;
  clientId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string | Date;
  transactionReference?: string | null;
  notes?: string | null;
  status?: PaymentStatus;
  currency?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string | Date;
  transactionReference?: string | null;
  notes?: string | null;
  status?: PaymentStatus;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  clientId?: string;
  invoiceId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedPaymentsResult {
  data: any[];
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
