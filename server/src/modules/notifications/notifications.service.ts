import { prisma } from '../../config/db';
import { NotificationsRepository } from './notifications.repository';
import { CreateNotificationDTO, NotificationQueryFilter, UpdatePreferencesDTO } from './notifications.types';
import { NotificationType } from '@prisma/client';

export class NotificationsService {
  private repo = new NotificationsRepository();

  async notifyWorkspaceMembers(
    workspaceId: string,
    excludeUserId: string | null,
    type: NotificationType,
    title: string,
    message: string,
    entityId?: string | null,
    entityType?: string | null
  ) {
    try {
      // Find all workspace members
      const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        select: { userId: true },
      });

      let userIds = members.map((m: { userId: string }) => m.userId);

      // If userIds empty after filter or only 1 member, ensure creator also gets notification
      if (userIds.length === 0 && excludeUserId) {
        userIds = [excludeUserId];
      }

      const notificationItems: CreateNotificationDTO[] = userIds.map((userId) => ({
        workspaceId,
        userId,
        type,
        title,
        message,
        entityId: entityId || null,
        entityType: entityType || null,
      }));

      await this.repo.createMultipleNotifications(notificationItems);
    } catch (error) {
      console.error('Failed to notify workspace members:', error);
    }
  }

  async createNotification(data: CreateNotificationDTO) {
    return this.repo.createNotification(data);
  }

  async getUserNotifications(workspaceId: string, userId: string, filter: NotificationQueryFilter) {
    return this.repo.findUserNotifications(workspaceId, userId, filter);
  }

  async markAsRead(id: string, workspaceId: string, userId: string) {
    return this.repo.markAsRead(id, workspaceId, userId);
  }

  async markAllAsRead(workspaceId: string, userId: string) {
    return this.repo.markAllAsRead(workspaceId, userId);
  }

  async deleteNotification(id: string, workspaceId: string, userId: string) {
    return this.repo.deleteNotification(id, workspaceId, userId);
  }

  async getPreferences(workspaceId: string, userId: string) {
    return this.repo.getPreferences(workspaceId, userId);
  }

  async updatePreferences(workspaceId: string, userId: string, data: UpdatePreferencesDTO) {
    return this.repo.updatePreferences(workspaceId, userId, data);
  }
}

export const notificationsService = new NotificationsService();
