import { prisma } from '~/config/db';
import { Client, ClientStatus, Prisma } from '@prisma/client';

export interface FindClientsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
}

export interface PaginatedClientsResult {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ClientsRepository {
  async findMany(workspaceId: string, options: FindClientsOptions = {}): Promise<PaginatedClientsResult> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      workspaceId,
      isArchived: false,
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.search && options.search.trim() !== '') {
      const query = options.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { companyName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
        { taxNumber: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      clients,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: string, workspaceId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        id,
        workspaceId,
        isArchived: false,
      },
    });
  }

  async findByEmail(email: string, workspaceId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: {
        email: email.trim(),
        workspaceId,
        isArchived: false,
      },
    });
  }

  async create(workspaceId: string, createdById: string | undefined, data: any): Promise<Client> {
    return prisma.client.create({
      data: {
        name: data.name,
        companyName: data.companyName || null,
        email: data.email,
        phone: data.phone || null,
        taxNumber: data.taxNumber || null,
        billingAddress: typeof data.billingAddress === 'object' ? JSON.stringify(data.billingAddress) : (data.billingAddress || null),
        shippingAddress: typeof data.shippingAddress === 'object' ? JSON.stringify(data.shippingAddress) : (data.shippingAddress || null),
        country: data.country || null,
        state: data.state || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        notes: data.notes || null,
        status: data.status || ClientStatus.ACTIVE,
        createdById: createdById || null,
        workspaceId,
      },
    });
  }

  async update(id: string, workspaceId: string, data: any): Promise<Client> {
    const updateData: Prisma.ClientUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.taxNumber !== undefined) updateData.taxNumber = data.taxNumber;
    if (data.billingAddress !== undefined) {
      updateData.billingAddress = typeof data.billingAddress === 'object' ? JSON.stringify(data.billingAddress) : data.billingAddress;
    }
    if (data.shippingAddress !== undefined) {
      updateData.shippingAddress = typeof data.shippingAddress === 'object' ? JSON.stringify(data.shippingAddress) : data.shippingAddress;
    }
    if (data.country !== undefined) updateData.country = data.country;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.client.update({
      where: { id, workspaceId },
      data: updateData,
    });
  }

  async softDelete(id: string, workspaceId: string): Promise<Client> {
    return prisma.client.update({
      where: { id, workspaceId },
      data: {
        isArchived: true,
        deletedAt: new Date(),
      },
    });
  }
}

export const clientsRepository = new ClientsRepository();
