import { PaymentMethod, ExpenseStatus } from '@prisma/client';

export interface CreateExpenseDTO {
  vendorId?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  amount: number;
  taxAmount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  expenseDate?: string | Date;
  receiptUrl?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
}

export interface UpdateExpenseDTO {
  vendorId?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  amount?: number;
  taxAmount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  expenseDate?: string | Date;
  receiptUrl?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ExpenseStatus;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedExpensesResult {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  metrics?: {
    totalExpensesAmount: number;
    totalTaxPaid: number;
    pendingCount: number;
  };
}

export interface CreateVendorDTO {
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstNumber?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string | null;
  color?: string | null;
}
