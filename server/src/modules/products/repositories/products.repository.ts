import { prisma } from '~/config/db';
import { Product, Prisma } from '@prisma/client';

export class ProductsRepository {
  async findMany(workspaceId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { id, workspaceId },
    });
  }

  async findBySku(sku: string, workspaceId: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: { sku, workspaceId },
    });
  }

  async create(workspaceId: string, data: Omit<Prisma.ProductUncheckedCreateInput, 'workspaceId'>): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
        workspaceId,
      },
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async delete(id: string, workspaceId: string): Promise<Product> {
    return prisma.product.delete({
      where: {
        id,
        workspaceId,
      },
    });
  }
}

export const productsRepository = new ProductsRepository();
