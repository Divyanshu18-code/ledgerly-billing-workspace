import { prisma } from '../../config/db';
import { CreateActivityLogDTO, ActivityQueryFilter } from './activity.types';

export class ActivityRepository {
  async createLog(data: CreateActivityLogDTO) {
    return prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId || null,
        action: data.action,
        module: data.module || 'GENERAL',
        description: data.description,
        entityId: data.entityId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findActivityLogs(workspaceId: string, filter: ActivityQueryFilter) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (filter.module && filter.module !== 'ALL') {
      where.module = filter.module;
    }

    if (filter.action && filter.action !== 'ALL') {
      where.action = filter.action;
    }

    if (filter.userId) {
      where.userId = filter.userId;
    }

    if (filter.search) {
      where.OR = [
        { description: { contains: filter.search, mode: 'insensitive' } },
        { action: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        where.createdAt.lte = new Date(filter.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
