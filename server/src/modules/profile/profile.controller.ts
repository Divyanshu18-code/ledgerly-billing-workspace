import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '~/middlewares/auth.middleware';
import { profileService } from './profile.service';

export class ProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await profileService.getProfile(userId);
      res.status(200).json({
        status: 'success',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updated = await profileService.updateProfile(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { avatar } = req.body;
      const updated = await profileService.updateAvatar(userId, avatar);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Avatar uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updated = await profileService.removeAvatar(userId);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Avatar removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      const result = await profileService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessions = await profileService.getSessions(userId);
      res.status(200).json({
        status: 'success',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.id as string;
      const result = await profileService.logoutSession(userId, sessionId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await profileService.logoutAllOtherSessions(userId);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const history = await profileService.getLoginHistory(userId);
      res.status(200).json({
        status: 'success',
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updated = await profileService.updatePreferences(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrivacy(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const updated = await profileService.updatePrivacy(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Privacy settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTheme(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { theme, fontSize, compactMode } = req.body;
      const updated = await profileService.updateTheme(userId, theme, fontSize, compactMode);
      res.status(200).json({
        status: 'success',
        data: updated,
        message: 'Theme settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async exportAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const exportData = await profileService.exportAccount(userId);
      res.status(200).json({
        status: 'success',
        data: exportData,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = req.body;
      const result = await profileService.deleteAccount(userId, password);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
