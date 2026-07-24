import { prisma } from '../../config/db';
import { CreateNotificationDTO, NotificationQueryFilter, UpdatePreferencesDTO } from './notifications.types';

export class NotificationsRepository {
  async createNotification(data: CreateNotificationDTO) {
    return prisma.notification.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        entityId: data.entityId || null,
        entityType: data.entityType || null,
      },
    });
  }

  async createMultipleNotifications(notifications: CreateNotificationDTO[]) {
    return prisma.notification.createMany({
      data: notifications.map((n) => ({
        workspaceId: n.workspaceId,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        entityId: n.entityId || null,
        entityType: n.entityType || null,
      })),
    });
  }

  async findUserNotifications(workspaceId: string, userId: string, filter: NotificationQueryFilter) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { workspaceId, userId };

    if (filter.isRead === 'true') {
      where.isRead = true;
    } else if (filter.isRead === 'false') {
      where.isRead = false;
    }

    if (filter.type && (filter.type as string) !== 'ALL') {
      where.type = filter.type;
    }

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { message: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { workspaceId, userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, workspaceId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, workspaceId, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(workspaceId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { workspaceId, userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async deleteNotification(id: string, workspaceId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, workspaceId, userId },
    });
  }

  async getPreferences(workspaceId: string, userId: string) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: {
          workspaceId,
          userId,
        },
      });
    }

    return prefs;
  }

  async updatePreferences(workspaceId: string, userId: string, data: UpdatePreferencesDTO) {
    return prisma.notificationPreference.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      update: data,
      create: {
        workspaceId,
        userId,
        ...data,
      },
    });
  }
}
