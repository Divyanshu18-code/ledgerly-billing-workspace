export interface CreateActivityLogDTO {
  workspaceId: string;
  userId?: string | null;
  action: string;
  module: string;
  description: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ActivityQueryFilter {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
