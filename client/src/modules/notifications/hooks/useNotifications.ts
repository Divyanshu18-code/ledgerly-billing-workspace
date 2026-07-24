import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface NotificationItem {
  id: string;
  workspaceId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  workspaceId: string;
  emailNotifications: boolean;
  invoiceAlerts: boolean;
  paymentAlerts: boolean;
  quotationAlerts: boolean;
  expenseAlerts: boolean;
  systemAlerts: boolean;
}

export interface NotificationFilter {
  page?: number;
  limit?: number;
  isRead?: string;
  type?: string;
  search?: string;
}

export const useNotificationsQuery = (filter?: NotificationFilter) => {
  return useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const response = await apiClient.get('/notifications', { params: filter });
      return {
        notifications: (response.data?.data || []) as NotificationItem[],
        unreadCount: (response.data?.unreadCount || 0) as number,
        pagination: response.data?.pagination,
      };
    },
    refetchInterval: 10000, // Poll every 10 seconds for real-time notifications
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useNotificationPreferencesQuery = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/preferences');
      return response.data?.data as NotificationPreferences;
    },
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const response = await apiClient.patch('/notifications/preferences', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });
};
