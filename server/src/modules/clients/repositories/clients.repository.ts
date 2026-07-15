import { prisma } from '~/config/db';
import { Client, Prisma } from '@prisma/client';

export class ClientsRepository {
  async findMany(workspaceId: string): Promise<Client[]> {
    return prisma.client.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, workspaceId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { id, workspaceId },
    });
  }

  async findByEmail(email: string, workspaceId: string): Promise<Client | null> {
    return prisma.client.findFirst({
      where: { email, workspaceId },
    });
  }

  async create(workspaceId: string, data: Omit<Prisma.ClientCreateWithoutWorkspaceInput, 'workspace'>): Promise<Client> {
    return prisma.client.create({
      data: {
        ...data,
        workspaceId,
      },
    });
  }

  async update(id: string, workspaceId: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return prisma.client.update({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async delete(id: string, workspaceId: string): Promise<Client> {
    return prisma.client.delete({
      where: {
        id,
        workspaceId,
      },
    });
  }
}

export const clientsRepository = new ClientsRepository();
