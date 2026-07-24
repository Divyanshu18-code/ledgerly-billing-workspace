import { ActivityRepository } from './activity.repository';
import { CreateActivityLogDTO, ActivityQueryFilter } from './activity.types';

export class ActivityService {
  private repo = new ActivityRepository();

  async logActivity(data: CreateActivityLogDTO) {
    try {
      return await this.repo.createLog(data);
    } catch (error) {
      console.error('Failed to record activity log:', error);
    }
  }

  async getActivityLogs(workspaceId: string, filter: ActivityQueryFilter) {
    return this.repo.findActivityLogs(workspaceId, filter);
  }
}

export const activityService = new ActivityService();
