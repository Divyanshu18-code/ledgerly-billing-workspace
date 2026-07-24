import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface ActivityLogItem {
  id: string;
  workspaceId: string;
  userId?: string | null;
  action: string;
  module: string;
  description: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface ActivityLogFilter {
  page?: number;
  limit?: number;
  module?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const useActivityLogsQuery = (filter?: ActivityLogFilter) => {
  return useQuery({
    queryKey: ['activity-logs', filter],
    queryFn: async () => {
      const response = await apiClient.get('/activity', { params: filter });
      return {
        logs: (response.data?.data || []) as ActivityLogItem[],
        pagination: response.data?.pagination,
      };
    },
    refetchInterval: 15000,
  });
};
