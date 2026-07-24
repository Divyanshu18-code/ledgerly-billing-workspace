import { expensesRepository } from './repositories/expenses.repository';
import { activityService } from '../activity/activity.service';
import { notificationsService } from '../notifications/notifications.service';
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseQueryParams,
  CreateVendorDTO,
  CreateCategoryDTO,
} from './expenses.types';

export class ExpensesService {
  /**
   * Get paginated expenses with metrics
   */
  async getPaginatedExpenses(workspaceId: string, params: ExpenseQueryParams) {
    const paginated = await expensesRepository.findPaginated(workspaceId, params);
    const metrics = await expensesRepository.getWorkspaceMetrics(workspaceId);

    return {
      data: paginated.expenses,
      pagination: {
        total: paginated.total,
        page: paginated.page,
        limit: paginated.limit,
        totalPages: paginated.totalPages,
      },
      metrics,
    };
  }

  /**
   * Get single expense details by ID
   */
  async getExpenseById(workspaceId: string, id: string) {
    const expense = await expensesRepository.findById(workspaceId, id);
    if (!expense) {
      throw new Error('Expense record not found');
    }
    return expense;
  }

  /**
   * Create a new expense record
   */
  async createExpense(workspaceId: string, userId: string, data: CreateExpenseDTO) {
    if (!data.amount || data.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const expenseNumber = await expensesRepository.generateExpenseNumber(workspaceId);
    const taxAmount = Number(data.taxAmount || 0);
    const amount = Number(data.amount);
    const totalAmount = amount + taxAmount;

    let categoryName = data.categoryName || 'Miscellaneous';
    if (data.categoryId) {
      const categories = await expensesRepository.findCategories(workspaceId);
      const matchedCat = categories.find((c) => c.id === data.categoryId);
      if (matchedCat) {
        categoryName = matchedCat.name;
      }
    }

    const expense = await expensesRepository.create(workspaceId, userId, {
      ...data,
      expenseNumber,
      amount,
      taxAmount,
      totalAmount,
      categoryName,
    });

    // Auto Activity & Notification
    activityService.logActivity({
      workspaceId,
      userId,
      action: 'EXPENSE_ADDED',
      module: 'EXPENSE',
      description: `Added expense ${expense.expenseNumber} of ${expense.currency} ${expense.totalAmount} (${categoryName})`,
      entityId: expense.id,
    });

    notificationsService.notifyWorkspaceMembers(
      workspaceId,
      userId,
      'EXPENSE_ADDED',
      'Expense Added',
      `New expense ${expense.expenseNumber} of ${expense.currency} ${expense.totalAmount} (${categoryName}) logged.`,
      expense.id,
      'EXPENSE'
    );

    return expense;
  }

  /**
   * Update an existing expense record
   */
  async updateExpense(workspaceId: string, id: string, data: UpdateExpenseDTO) {
    const existing = await expensesRepository.findById(workspaceId, id);
    if (!existing) {
      throw new Error('Expense record not found');
    }

    let totalAmount: number | undefined;
    const amount = data.amount !== undefined ? Number(data.amount) : Number(existing.amount);
    const taxAmount = data.taxAmount !== undefined ? Number(data.taxAmount) : Number(existing.taxAmount);
    totalAmount = amount + taxAmount;

    let categoryName = data.categoryName;
    if (data.categoryId) {
      const categories = await expensesRepository.findCategories(workspaceId);
      const matchedCat = categories.find((c) => c.id === data.categoryId);
      if (matchedCat) {
        categoryName = matchedCat.name;
      }
    }

    return expensesRepository.update(workspaceId, id, {
      ...data,
      amount,
      taxAmount,
      totalAmount,
      categoryName,
    });
  }

  /**
   * Duplicate an expense record
   */
  async duplicateExpense(workspaceId: string, userId: string, id: string) {
    const original = await expensesRepository.findById(workspaceId, id);
    if (!original) {
      throw new Error('Expense record not found');
    }

    const expenseNumber = await expensesRepository.generateExpenseNumber(workspaceId);

    return expensesRepository.create(workspaceId, userId, {
      expenseNumber,
      vendorId: original.vendorId,
      categoryId: original.categoryId,
      categoryName: original.categoryName,
      amount: Number(original.amount),
      taxAmount: Number(original.taxAmount),
      totalAmount: Number(original.totalAmount),
      currency: original.currency,
      paymentMethod: original.paymentMethod,
      expenseDate: new Date(),
      receiptUrl: original.receiptUrl,
      notes: original.notes ? `[Copy of ${original.expenseNumber}] ${original.notes}` : `Copy of ${original.expenseNumber}`,
      status: original.status,
    });
  }

  /**
   * Soft delete an expense
   */
  async deleteExpense(workspaceId: string, id: string) {
    const existing = await expensesRepository.findById(workspaceId, id);
    if (!existing) {
      throw new Error('Expense record not found');
    }
    return expensesRepository.softDelete(workspaceId, id);
  }

  // --- Vendors ---

  async getVendors(workspaceId: string) {
    return expensesRepository.findVendors(workspaceId);
  }

  async createVendor(workspaceId: string, data: CreateVendorDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Vendor name is required');
    }
    return expensesRepository.createVendor(workspaceId, data);
  }

  // --- Categories ---

  async getCategories(workspaceId: string) {
    let categories = await expensesRepository.findCategories(workspaceId);
    if (categories.length === 0) {
      categories = await expensesRepository.seedDefaultCategories(workspaceId);
    }
    return categories;
  }

  async createCategory(workspaceId: string, data: CreateCategoryDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new Error('Category name is required');
    }
    return expensesRepository.createCategory(workspaceId, data);
  }
}

export const expensesService = new ExpensesService();
