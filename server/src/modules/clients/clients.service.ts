import { clientsRepository } from './repositories/clients.repository';
import { ApiError } from '~/utils/errors';
import { Prisma } from '@prisma/client';

export class ClientsService {
  async getClients(workspaceId: string) {
    return clientsRepository.findMany(workspaceId);
  }

  async getClientById(id: string, workspaceId: string) {
    const client = await clientsRepository.findById(id, workspaceId);
    if (!client) {
      throw ApiError.notFound('Client not found');
    }
    return client;
  }

  async createClient(
    workspaceId: string,
    data: {
      name: string;
      email: string;
      phone?: string;
      taxNumber?: string;
      billingAddress: any;
      shippingAddress?: any;
    }
  ) {
    const existingClient = await clientsRepository.findByEmail(data.email, workspaceId);
    if (existingClient) {
      throw ApiError.badRequest('A client with this email already exists in this workspace');
    }

    return clientsRepository.create(workspaceId, data);
  }

  async updateClient(
    id: string,
    workspaceId: string,
    data: Prisma.ClientUpdateInput & { email?: string }
  ) {
    // Check if client exists
    await this.getClientById(id, workspaceId);

    // If changing email, check for duplicate
    if (data.email) {
      const existingClient = await clientsRepository.findByEmail(data.email, workspaceId);
      if (existingClient && existingClient.id !== id) {
        throw ApiError.badRequest('Another client with this email already exists in this workspace');
      }
    }

    return clientsRepository.update(id, workspaceId, data);
  }

  async deleteClient(id: string, workspaceId: string) {
    await this.getClientById(id, workspaceId);
    return clientsRepository.delete(id, workspaceId);
  }
}

export const clientsService = new ClientsService();
