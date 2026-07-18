import { clientsRepository, FindClientsOptions } from './repositories/clients.repository';
import { ApiError } from '~/utils/errors';
import { ClientStatus } from '@prisma/client';

export class ClientsService {
  async getClients(workspaceId: string, options: FindClientsOptions = {}) {
    return clientsRepository.findMany(workspaceId, options);
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
    userId: string,
    data: {
      name: string;
      companyName?: string;
      email: string;
      phone?: string;
      taxNumber?: string;
      billingAddress?: any;
      shippingAddress?: any;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
      notes?: string;
      status?: ClientStatus;
    }
  ) {
    const existingClient = await clientsRepository.findByEmail(data.email, workspaceId);
    if (existingClient) {
      throw ApiError.badRequest('A client with this email already exists in this workspace');
    }

    return clientsRepository.create(workspaceId, userId, data);
  }

  async updateClient(
    id: string,
    workspaceId: string,
    data: {
      name?: string;
      companyName?: string;
      email?: string;
      phone?: string;
      taxNumber?: string;
      billingAddress?: any;
      shippingAddress?: any;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
      notes?: string;
      status?: ClientStatus;
    }
  ) {
    // Verify client exists in this workspace
    await this.getClientById(id, workspaceId);

    // If changing email, check for duplicate within workspace
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
    return clientsRepository.softDelete(id, workspaceId);
  }
}

export const clientsService = new ClientsService();
