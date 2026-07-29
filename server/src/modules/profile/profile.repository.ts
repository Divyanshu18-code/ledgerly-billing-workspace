import { prisma } from '~/config/db';

export class ProfileRepository {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatar: true,
        jobTitle: true,
        department: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        timezone: true,
        language: true,
        theme: true,
        fontSize: true,
        compactMode: true,
        twoFactorEnabled: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        emailNotifications: true,
        pushNotifications: true,
        invoiceNotifications: true,
        paymentNotifications: true,
        securityAlerts: true,
        marketingEmails: true,
        profileVisibility: true,
        showEmail: true,
        showPhone: true,
        activityVisibility: true,
        workspaceMembers: {
          select: {
            role: true,
            workspace: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        avatar: true,
        jobTitle: true,
        department: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        timezone: true,
        language: true,
        theme: true,
        fontSize: true,
        compactMode: true,
        twoFactorEnabled: true,
        updatedAt: true,
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string | null) {
    return prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: { id: true, avatar: true },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async getSessions(userId: string) {
    return prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActive: 'desc' },
    });
  }

  async createSession(sessionData: {
    userId: string;
    device: string;
    browser: string;
    os: string;
    ipAddress: string;
    location?: string;
    isCurrent?: boolean;
  }) {
    return prisma.userSession.create({
      data: sessionData,
    });
  }

  async deleteSession(sessionId: string, userId: string) {
    return prisma.userSession.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async deleteAllOtherSessions(userId: string, currentSessionId?: string) {
    return prisma.userSession.deleteMany({
      where: {
        userId,
        id: currentSessionId ? { not: currentSessionId } : undefined,
      },
    });
  }

  async getLoginHistory(userId: string, limit = 20) {
    return prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async deleteAccount(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const profileRepository = new ProfileRepository();
