import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { activityService } from './activity.service';

export class ActivityController {
  getActivityLogs = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const workspaceId = req.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({
          status: 'error',
          message: 'Workspace context required.',
        });
      }

      const result = await activityService.getActivityLogs(workspaceId, req.query as any);
      return res.json({
        status: 'success',
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to fetch activity logs',
      });
    }
  };
}

export const activityController = new ActivityController();
