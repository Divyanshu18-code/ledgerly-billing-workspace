import { ExpenseStatus, PaymentMethod, Prisma } from '@prisma/client';
import { prisma } from '../../../config/db';
import {
  CreateExpenseDTO,
  UpdateExpenseDTO,
  ExpenseQueryParams,
  CreateVendorDTO,
  CreateCategoryDTO,
} from '../expenses.types';

export class ExpensesRepository {
  /**
   * Auto-generate sequential expense number e.g., EXP-2026-0001 per workspace
   */
  async generateExpenseNumber(workspaceId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `EXP-${currentYear}-`;

    const latestExpense = await prisma.expense.findFirst({
      where: {
        workspaceId,
        expenseNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        expenseNumber: true,
      },
    });

    let nextSequence = 1;
    if (latestExpense && latestExpense.expenseNumber) {
      const parts = latestExpense.expenseNumber.split('-');
      if (parts.length === 3) {
        const lastSeq = parseInt(parts[2], 10);
        if (!isNaN(lastSeq)) {
          nextSequence = lastSeq + 1;
        }
      }
    }

    return `${prefix}${nextSequence.toString().padStart(4, '0')}`;
  }

  /**
   * Find paginated expenses filtered by workspace, search, status, category, vendor
   */
  async findPaginated(workspaceId: string, params: ExpenseQueryParams) {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.max(1, Math.min(100, Number(params.limit || 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {
      workspaceId,
      isArchived: false,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.vendorId) {
      where.vendorId = params.vendorId;
    }

    if (params.category && params.category !== 'ALL') {
      where.OR = [
        { categoryId: params.category },
        { categoryName: { equals: params.category, mode: 'insensitive' } },
      ];
    }

    if (params.search && params.search.trim() !== '') {
      const searchTerm = params.search.trim();
      const searchWhere: Prisma.ExpenseWhereInput = {
        OR: [
          { expenseNumber: { contains: searchTerm, mode: 'insensitive' } },
          { categoryName: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
          { vendor: { name: { contains: searchTerm, mode: 'insensitive' } } },
        ],
      };
      if (where.OR) {
        where.AND = [searchWhere];
      } else {
        where.OR = searchWhere.OR;
      }
    }

    if (params.startDate || params.endDate) {
      where.expenseDate = {};
      if (params.startDate) {
        where.expenseDate.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.expenseDate.lte = new Date(params.endDate);
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          expenseDate: 'desc',
        },
        include: {
          vendor: true,
          category: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find single expense by ID and workspaceId
   */
  async findById(workspaceId: string, id: string) {
    return prisma.expense.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
      include: {
        vendor: true,
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Create a new expense record
   */
  async create(
    workspaceId: string,
    userId: string,
    data: CreateExpenseDTO & { expenseNumber: string; totalAmount: number; categoryName: string }
  ) {
    return prisma.expense.create({
      data: {
        workspaceId,
        expenseNumber: data.expenseNumber,
        vendorId: data.vendorId || null,
        categoryId: data.categoryId || null,
        categoryName: data.categoryName,
        amount: data.amount,
        taxAmount: data.taxAmount || 0,
        totalAmount: data.totalAmount,
        currency: data.currency || 'INR',
        paymentMethod: data.paymentMethod || PaymentMethod.CASH,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        receiptUrl: data.receiptUrl || null,
        notes: data.notes || null,
        status: data.status || ExpenseStatus.PAID,
        createdById: userId,
      },
      include: {
        vendor: true,
        category: true,
      },
    });
  }

  /**
   * Update an existing expense record
   */
  async update(workspaceId: string, id: string, data: UpdateExpenseDTO & { totalAmount?: number }) {
    const updateData: any = {};
    if (data.vendorId !== undefined) updateData.vendorId = data.vendorId || null;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.categoryName !== undefined) updateData.categoryName = data.categoryName;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.taxAmount !== undefined) updateData.taxAmount = data.taxAmount;
    if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.expenseDate !== undefined) updateData.expenseDate = new Date(data.expenseDate);
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.expense.update({
      where: { id },
      data: updateData,
      include: {
        vendor: true,
        category: true,
      },
    });
  }

  /**
   * Soft delete an expense record
   */
  async softDelete(workspaceId: string, id: string) {
    return prisma.expense.update({
      where: { id },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Calculate workspace expense metrics
   */
  async getWorkspaceMetrics(workspaceId: string) {
    const [totalExpenses, totalTax, pendingCount] = await Promise.all([
      prisma.expense.aggregate({
        where: { workspaceId, isArchived: false },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { workspaceId, isArchived: false },
        _sum: { taxAmount: true },
      }),
      prisma.expense.count({
        where: { workspaceId, isArchived: false, status: ExpenseStatus.PENDING },
      }),
    ]);

    return {
      totalExpensesAmount: Number(totalExpenses._sum.totalAmount || 0),
      totalTaxPaid: Number(totalTax._sum.taxAmount || 0),
      pendingCount,
    };
  }

  // --- Vendors Methods ---

  async findVendors(workspaceId: string) {
    return prisma.vendor.findMany({
      where: { workspaceId, isArchived: false },
      orderBy: { name: 'asc' },
    });
  }

  async createVendor(workspaceId: string, data: CreateVendorDTO) {
    return prisma.vendor.create({
      data: {
        workspaceId,
        name: data.name,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        gstNumber: data.gstNumber || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
  }

  // --- Categories Methods ---

  async findCategories(workspaceId: string) {
    return prisma.expenseCategory.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(workspaceId: string, data: CreateCategoryDTO) {
    return prisma.expenseCategory.create({
      data: {
        workspaceId,
        name: data.name,
        description: data.description || null,
        color: data.color || '#3b82f6',
      },
    });
  }

  async seedDefaultCategories(workspaceId: string) {
    const defaultCategories = [
      { name: 'Office', description: 'Office supplies & equipment', color: '#3b82f6', isSystem: true },
      { name: 'Travel', description: 'Business travel & transportation', color: '#8b5cf6', isSystem: true },
      { name: 'Food', description: 'Team meals & client entertainment', color: '#f59e0b', isSystem: true },
      { name: 'Internet', description: 'Broadband & telecom expenses', color: '#06b6d4', isSystem: true },
      { name: 'Software', description: 'SaaS subscriptions & cloud tools', color: '#10b981', isSystem: true },
      { name: 'Marketing', description: 'Ads, promotions & branding', color: '#ec4899', isSystem: true },
      { name: 'Salary', description: 'Staff payroll & bonuses', color: '#6366f1', isSystem: true },
      { name: 'Utilities', description: 'Electricity, water & maintenance', color: '#eab308', isSystem: true },
      { name: 'Rent', description: 'Office workspace lease & rent', color: '#14b8a6', isSystem: true },
      { name: 'Taxes', description: 'Corporate & GST tax payments', color: '#ef4444', isSystem: true },
      { name: 'Miscellaneous', description: 'Other general expenses', color: '#64748b', isSystem: true },
    ];

    for (const cat of defaultCategories) {
      await prisma.expenseCategory.upsert({
        where: { workspaceId_name: { workspaceId, name: cat.name } },
        update: {},
        create: {
          workspaceId,
          name: cat.name,
          description: cat.description,
          color: cat.color,
          isSystem: cat.isSystem,
        },
      });
    }

    return this.findCategories(workspaceId);
  }
}

export const expensesRepository = new ExpensesRepository();
