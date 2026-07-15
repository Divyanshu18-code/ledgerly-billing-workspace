import { productsRepository } from './repositories/products.repository';
import { ApiError } from '~/utils/errors';
import { Prisma } from '@prisma/client';

export class ProductsService {
  async getProducts(workspaceId: string) {
    return productsRepository.findMany(workspaceId);
  }

  async getProductById(id: string, workspaceId: string) {
    const product = await productsRepository.findById(id, workspaceId);
    if (!product) {
      throw ApiError.notFound('Product or service not found');
    }
    return product;
  }

  async createProduct(
    workspaceId: string,
    data: {
      name: string;
      sku: string;
      price: number;
      description?: string | null;
      isService?: boolean;
    }
  ) {
    const existingProduct = await productsRepository.findBySku(data.sku, workspaceId);
    if (existingProduct) {
      throw ApiError.badRequest('A product with this SKU already exists in this workspace');
    }

    return productsRepository.create(workspaceId, data);
  }

  async updateProduct(
    id: string,
    workspaceId: string,
    data: Prisma.ProductUpdateInput & { sku?: string }
  ) {
    // Check if product exists
    await this.getProductById(id, workspaceId);

    // If changing SKU, check for duplicates
    if (data.sku) {
      const existingProduct = await productsRepository.findBySku(data.sku, workspaceId);
      if (existingProduct && existingProduct.id !== id) {
        throw ApiError.badRequest('Another product with this SKU already exists in this workspace');
      }
    }

    return productsRepository.update(id, workspaceId, data);
  }

  async deleteProduct(id: string, workspaceId: string) {
    await this.getProductById(id, workspaceId);
    return productsRepository.delete(id, workspaceId);
  }
}

export const productsService = new ProductsService();
