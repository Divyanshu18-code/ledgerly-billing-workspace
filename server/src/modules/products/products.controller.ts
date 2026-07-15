import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { productsService } from './products.service';
import { ApiError } from '~/utils/errors';

export class ProductsController {
  async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const products = await productsService.getProducts(workspaceId);
      res.status(200).json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const product = await productsService.getProductById(id as string, workspaceId);
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const { name, sku, price, description, isService } = req.body;
      const product = await productsService.createProduct(workspaceId, {
        name,
        sku,
        price: Number(price),
        description,
        isService: Boolean(isService),
      });

      res.status(201).json({
        status: 'success',
        message: 'Product or service registered successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      const product = await productsService.updateProduct(id as string, workspaceId, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Product or service updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID header is required');
      }

      await productsService.deleteProduct(id as string, workspaceId);
      res.status(200).json({
        status: 'success',
        message: 'Product or service deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
