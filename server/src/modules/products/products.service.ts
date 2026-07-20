import { productsRepository, FindProductsOptions } from './repositories/products.repository';
import { ApiError } from '~/utils/errors';
import { ProductType, ProductStatus } from '@prisma/client';

export interface CreateProductDTO {
  name: string;
  sku: string;
  type?: ProductType;
  price: number;
  purchasePrice?: number | null;
  description?: string | null;
  category?: string | null;
  unit?: string;
  hsnSacCode?: string | null;
  taxRateValue?: number;
  taxRateId?: string | null;
  status?: ProductStatus;
  isService?: boolean;
  createdById?: string | null;
}

export interface UpdateProductDTO {
  name?: string;
  sku?: string;
  type?: ProductType;
  price?: number;
  purchasePrice?: number | null;
  description?: string | null;
  category?: string | null;
  unit?: string;
  hsnSacCode?: string | null;
  taxRateValue?: number;
  taxRateId?: string | null;
  status?: ProductStatus;
  isService?: boolean;
}

export class ProductsService {
  async getProducts(workspaceId: string, options: FindProductsOptions = {}) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;

    const [items, totalItems] = await Promise.all([
      productsRepository.findMany(workspaceId, { ...options, page, limit }),
      productsRepository.count(workspaceId, options),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getProductById(id: string, workspaceId: string) {
    const product = await productsRepository.findById(id, workspaceId);
    if (!product) {
      throw ApiError.notFound('Product or service not found');
    }
    return product;
  }

  async createProduct(workspaceId: string, data: CreateProductDTO) {
    const cleanSku = data.sku.trim();
    const existingProduct = await productsRepository.findBySku(workspaceId, cleanSku);
    if (existingProduct) {
      throw ApiError.badRequest('A product or service with this SKU already exists in this workspace');
    }

    const type = data.type || (data.isService ? ProductType.SERVICE : ProductType.PRODUCT);
    const isService = type === ProductType.SERVICE;

    return productsRepository.create(workspaceId, {
      name: data.name.trim(),
      sku: cleanSku,
      type,
      price: data.price,
      purchasePrice: data.purchasePrice !== undefined ? data.purchasePrice : null,
      description: data.description ? data.description.trim() : null,
      category: data.category ? data.category.trim() : null,
      unit: data.unit ? data.unit.trim() : (isService ? 'hrs' : 'pcs'),
      hsnSacCode: data.hsnSacCode ? data.hsnSacCode.trim() : null,
      taxRateValue: data.taxRateValue !== undefined ? data.taxRateValue : 0,
      taxRateId: data.taxRateId || null,
      status: data.status || ProductStatus.ACTIVE,
      isService,
      createdById: data.createdById || null,
    });
  }

  async updateProduct(id: string, workspaceId: string, data: UpdateProductDTO) {
    await this.getProductById(id, workspaceId);

    if (data.sku) {
      const cleanSku = data.sku.trim();
      const existingProduct = await productsRepository.findBySku(workspaceId, cleanSku, id);
      if (existingProduct) {
        throw ApiError.badRequest('Another product or service with this SKU already exists in this workspace');
      }
    }

    const type = data.type !== undefined ? data.type : (data.isService ? ProductType.SERVICE : undefined);
    const isService = type ? type === ProductType.SERVICE : undefined;

    return productsRepository.update(id, workspaceId, {
      ...(data.name ? { name: data.name.trim() } : {}),
      ...(data.sku ? { sku: data.sku.trim() } : {}),
      ...(type ? { type } : {}),
      ...(isService !== undefined ? { isService } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.purchasePrice !== undefined ? { purchasePrice: data.purchasePrice } : {}),
      ...(data.description !== undefined ? { description: data.description ? data.description.trim() : null } : {}),
      ...(data.category !== undefined ? { category: data.category ? data.category.trim() : null } : {}),
      ...(data.unit !== undefined ? { unit: data.unit.trim() } : {}),
      ...(data.hsnSacCode !== undefined ? { hsnSacCode: data.hsnSacCode ? data.hsnSacCode.trim() : null } : {}),
      ...(data.taxRateValue !== undefined ? { taxRateValue: data.taxRateValue } : {}),
      ...(data.taxRateId !== undefined ? { taxRateId: data.taxRateId || null } : {}),
      ...(data.status ? { status: data.status } : {}),
    });
  }

  async deleteProduct(id: string, workspaceId: string) {
    await this.getProductById(id, workspaceId);
    return productsRepository.softDelete(id, workspaceId);
  }
}

export const productsService = new ProductsService();
