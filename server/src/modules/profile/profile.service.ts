import bcrypt from 'bcryptjs';
import { profileRepository } from './profile.repository';
import { authRepository } from '../auth/repositories/auth.repository';
import { ApiError } from '~/utils/errors';
import { prisma } from '~/config/db';

export class ProfileService {
  async getProfile(userId: string) {
    const profile = await profileRepository.getProfile(userId);
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, data: Record<string, any>) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updateData: Record<string, any> = {};
    const allowedFields = [
      'firstName',
      'lastName',
      'displayName',
      'phone',
      'jobTitle',
      'department',
      'bio',
      'dateOfBirth',
      'gender',
      'address',
      'city',
      'state',
      'country',
      'postalCode',
      'timezone',
      'language',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        if (field === 'dateOfBirth' && data[field]) {
          updateData[field] = new Date(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    });

    return profileRepository.updateProfile(userId, updateData);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      throw ApiError.badRequest('Valid avatar URL or image required');
    }
    return profileRepository.updateAvatar(userId, avatarUrl);
  }

  async removeAvatar(userId: string) {
    return profileRepository.updateAvatar(userId, null);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    if (newPassword.length < 6) {
      throw ApiError.badRequest('New password must be at least 6 characters long');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await profileRepository.updatePassword(userId, passwordHash);

    return { message: 'Password updated successfully' };
  }

  async getSessions(userId: string) {
    return profileRepository.getSessions(userId);
  }

  async logoutSession(userId: string, sessionId: string) {
    await profileRepository.deleteSession(sessionId, userId);
    return { message: 'Session logged out successfully' };
  }

  async logoutAllOtherSessions(userId: string) {
    await profileRepository.deleteAllOtherSessions(userId);
    return { message: 'Logged out of all other devices successfully' };
  }

  async getLoginHistory(userId: string) {
    return profileRepository.getLoginHistory(userId);
  }

  async updatePreferences(userId: string, data: Record<string, any>) {
    const allowedFields = [
      'emailNotifications',
      'pushNotifications',
      'invoiceNotifications',
      'paymentNotifications',
      'securityAlerts',
      'marketingEmails',
      'twoFactorEnabled',
    ];

    const updateData: Record<string, any> = {};
    allowedFields.forEach((field) => {
      if (typeof data[field] === 'boolean') {
        updateData[field] = data[field];
      }
    });

    return profileRepository.updateProfile(userId, updateData);
  }

  async updatePrivacy(userId: string, data: Record<string, any>) {
    const allowedFields = ['profileVisibility', 'showEmail', 'showPhone', 'activityVisibility'];
    const updateData: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    return profileRepository.updateProfile(userId, updateData);
  }

  async updateTheme(userId: string, theme: string, fontSize?: string, compactMode?: boolean) {
    const updateData: Record<string, any> = {};
    if (['light', 'dark', 'system'].includes(theme)) {
      updateData.theme = theme;
    }
    if (fontSize && ['small', 'medium', 'large'].includes(fontSize)) {
      updateData.fontSize = fontSize;
    }
    if (typeof compactMode === 'boolean') {
      updateData.compactMode = compactMode;
    }

    return profileRepository.updateProfile(userId, updateData);
  }

  async exportAccount(userId: string) {
    const user = await profileRepository.getProfile(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const userWorkspaces = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
    });

    const clientCount = await prisma.client.count({ where: { createdById: userId } });
    const invoiceCount = await prisma.invoice.count({ where: { createdById: userId } });
    const paymentCount = await prisma.payment.count({ where: { createdById: userId } });

    return {
      exportedAt: new Date().toISOString(),
      user,
      workspaces: userWorkspaces,
      summary: {
        clientCount,
        invoiceCount,
        paymentCount,
      },
    };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest('Incorrect password. Cannot delete account.');
    }

    await profileRepository.deleteAccount(userId);
    return { message: 'Account deleted permanently' };
  }
}

export const profileService = new ProfileService();
