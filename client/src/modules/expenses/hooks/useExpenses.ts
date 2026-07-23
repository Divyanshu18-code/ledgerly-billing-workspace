import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface VendorItem {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  gstNumber?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isSystem?: boolean;
}

export interface ExpenseItem {
  id: string;
  workspaceId: string;
  expenseNumber: string;
  vendorId?: string | null;
  categoryId?: string | null;
  categoryName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CHEQUE' | 'WALLET' | 'OTHER';
  expenseDate: string;
  receiptUrl?: string | null;
  notes?: string | null;
  status: 'PAID' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  vendor?: VendorItem | null;
  category?: CategoryItem | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedExpensesResponse {
  success: boolean;
  data: ExpenseItem[];
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

export interface CreateExpenseInput {
  vendorId?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  amount: number;
  taxAmount?: number;
  currency?: string;
  paymentMethod?: string;
  expenseDate?: string;
  receiptUrl?: string | null;
  notes?: string | null;
  status?: string;
}

export interface UpdateExpenseInput {
  vendorId?: string | null;
  categoryId?: string | null;
  categoryName?: string;
  amount?: number;
  taxAmount?: number;
  currency?: string;
  paymentMethod?: string;
  expenseDate?: string;
  receiptUrl?: string | null;
  notes?: string | null;
  status?: string;
}

// Fetch paginated expenses
export const useExpensesQuery = (params: ExpenseQueryParams = {}) => {
  return useQuery<PaginatedExpensesResponse>({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const response = await apiClient.get('/expenses', { params });
      return response.data;
    },
  });
};

// Fetch single expense by ID
export const useExpenseQuery = (id?: string) => {
  return useQuery<{ success: boolean; data: ExpenseItem }>({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const response = await apiClient.get(`/expenses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create new expense
export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpenseInput) => {
      const response = await apiClient.post('/expenses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Update expense
export const useUpdateExpenseMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateExpenseInput) => {
      const response = await apiClient.put(`/expenses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Duplicate expense
export const useDuplicateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/expenses/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// Soft delete expense
export const useDeleteExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/expenses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

// --- Vendors Hooks ---

export const useVendorsQuery = () => {
  return useQuery<{ success: boolean; data: VendorItem[] }>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.get('/expenses/meta/vendors');
      return response.data;
    },
  });
};

export const useCreateVendorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; contactPerson?: string; email?: string; phone?: string; gstNumber?: string }) => {
      const response = await apiClient.post('/expenses/meta/vendors', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
};

// --- Categories Hooks ---

export const useCategoriesQuery = () => {
  return useQuery<{ success: boolean; data: CategoryItem[] }>({
    queryKey: ['expenseCategories'],
    queryFn: async () => {
      const response = await apiClient.get('/expenses/meta/categories');
      return response.data;
    },
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      const response = await apiClient.post('/expenses/meta/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
  });
};
