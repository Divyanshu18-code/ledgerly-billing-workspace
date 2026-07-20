import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { productsService } from './products.service';
import { ApiError } from '~/utils/errors';
import { ProductType, ProductStatus } from '@prisma/client';

export class ProductsController {
  async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspaceId as string;
      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required');
      }

      const search = req.query.search ? String(req.query.search) : undefined;
      const type = req.query.type && (req.query.type === 'PRODUCT' || req.query.type === 'SERVICE')
        ? (req.query.type as ProductType)
        : undefined;
      const status = req.query.status && (req.query.status === 'ACTIVE' || req.query.status === 'INACTIVE')
        ? (req.query.status as ProductStatus)
        : undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await productsService.getProducts(workspaceId, {
        search,
        type,
        status,
        page,
        limit,
      });

      res.status(200).json({
        status: 'success',
        data: result,
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
        throw ApiError.badRequest('Workspace ID is required');
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
        throw ApiError.badRequest('Workspace ID is required');
      }

      const userId = req.user?.id || null;
      const product = await productsService.createProduct(workspaceId, {
        ...req.body,
        price: Number(req.body.price),
        purchasePrice: req.body.purchasePrice !== undefined && req.body.purchasePrice !== null ? Number(req.body.purchasePrice) : null,
        taxRateValue: req.body.taxRateValue !== undefined ? Number(req.body.taxRateValue) : 0,
        createdById: userId,
      });

      res.status(201).json({
        status: 'success',
        message: 'Product or service created successfully',
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
        throw ApiError.badRequest('Workspace ID is required');
      }

      const updateData = {
        ...req.body,
        ...(req.body.price !== undefined ? { price: Number(req.body.price) } : {}),
        ...(req.body.purchasePrice !== undefined ? { purchasePrice: req.body.purchasePrice !== null ? Number(req.body.purchasePrice) : null } : {}),
        ...(req.body.taxRateValue !== undefined ? { taxRateValue: Number(req.body.taxRateValue) } : {}),
      };

      const product = await productsService.updateProduct(id as string, workspaceId, updateData);
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
        throw ApiError.badRequest('Workspace ID is required');
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
