import { prisma } from '~/config/db';
import { Product, ProductType, ProductStatus, Prisma } from '@prisma/client';

export interface FindProductsOptions {
  search?: string;
  type?: ProductType;
  status?: ProductStatus;
  page?: number;
  limit?: number;
}

export class ProductsRepository {
  async findMany(workspaceId: string, options: FindProductsOptions = {}): Promise<Product[]> {
    const { search, type, status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      workspaceId,
      isArchived: false,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        taxRate: true,
      },
    });
  }

  async count(workspaceId: string, options: FindProductsOptions = {}): Promise<number> {
    const { search, type, status } = options;

    const where: Prisma.ProductWhereInput = {
      workspaceId,
      isArchived: false,
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.product.count({ where });
  }

  async findById(id: string, workspaceId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
      include: {
        taxRate: true,
      },
    });
  }

  async findBySku(workspaceId: string, sku: string, excludeId?: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        workspaceId,
        sku: { equals: sku, mode: 'insensitive' },
        isArchived: false,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  async create(workspaceId: string, data: Omit<Prisma.ProductUncheckedCreateInput, 'workspaceId'>): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
        workspaceId,
      },
      include: {
        taxRate: true,
      },
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.ProductUncheckedUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        workspaceId,
      },
      data,
      include: {
        taxRate: true,
      },
    });
  }

  async softDelete(id: string, workspaceId: string): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }
}

export const productsRepository = new ProductsRepository();
