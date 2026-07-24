import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.workspaceId;
      const userId = req.user?.id;

      if (!workspaceId || !userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Workspace context and User ID required',
        });
      }

      const result = await notificationsService.getUserNotifications(
        workspaceId,
        userId,
        req.query as any
      );

      return res.json({
        status: 'success',
        data: result.notifications,
        unreadCount: result.unreadCount,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch notifications',
      });
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;

      await notificationsService.markAsRead(id, workspaceId, userId);

      return res.json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to mark notification as read',
      });
    }
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;

      await notificationsService.markAllAsRead(workspaceId, userId);

      return res.json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to mark all notifications as read',
      });
    }
  };

  deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;

      await notificationsService.deleteNotification(id, workspaceId, userId);

      return res.json({
        status: 'success',
        message: 'Notification deleted',
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to delete notification',
      });
    }
  };

  getPreferences = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;

      const prefs = await notificationsService.getPreferences(workspaceId, userId);

      return res.json({
        status: 'success',
        data: prefs,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch notification preferences',
      });
    }
  };

  updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.workspaceId!;
      const userId = req.user!.id;

      const updated = await notificationsService.updatePreferences(
        workspaceId,
        userId,
        req.body
      );

      return res.json({
        status: 'success',
        data: updated,
        message: 'Notification preferences updated successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to update notification preferences',
      });
    }
  };
}

export const notificationsController = new NotificationsController();
