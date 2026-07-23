import { Request, Response, NextFunction } from 'express';
import { expensesService } from './expenses.service';

export class ExpensesController {
  /**
   * GET /api/v1/expenses
   */
  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const { page, limit, search, category, status, vendorId, startDate, endDate } = req.query;

      const result = await expensesService.getPaginatedExpenses(workspaceId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search ? String(search) : undefined,
        category: category ? String(category) : undefined,
        status: status ? (String(status) as any) : undefined,
        vendorId: vendorId ? String(vendorId) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/expenses/:id
   */
  async getExpenseById(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const id = String(req.params.id);

      const expense = await expensesService.getExpenseById(workspaceId, id);

      return res.status(200).json({
        success: true,
        message: 'Expense details retrieved successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/expenses
   */
  async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const userId = (req as any).user?.id as string;

      const expense = await expensesService.createExpense(workspaceId, userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/expenses/:id
   */
  async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const id = String(req.params.id);

      const expense = await expensesService.updateExpense(workspaceId, id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/expenses/:id/duplicate
   */
  async duplicateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const userId = (req as any).user?.id as string;
      const id = String(req.params.id);

      const expense = await expensesService.duplicateExpense(workspaceId, userId, id);

      return res.status(201).json({
        success: true,
        message: 'Expense duplicated successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/expenses/:id
   */
  async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const id = String(req.params.id);

      await expensesService.deleteExpense(workspaceId, id);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Vendors ---

  async getVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const vendors = await expensesService.getVendors(workspaceId);

      return res.status(200).json({
        success: true,
        data: vendors,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const vendor = await expensesService.createVendor(workspaceId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Vendor created successfully',
        data: vendor,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Categories ---

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const categories = await expensesService.getCategories(workspaceId);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req as any).workspaceId as string;
      const category = await expensesService.createCategory(workspaceId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const expensesController = new ExpensesController();
