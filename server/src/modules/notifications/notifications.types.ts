import { NotificationType } from '@prisma/client';

export interface CreateNotificationDTO {
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityId?: string | null;
  entityType?: string | null;
}

export interface NotificationQueryFilter {
  page?: number;
  limit?: number;
  isRead?: string;
  type?: NotificationType;
  search?: string;
}

export interface UpdatePreferencesDTO {
  emailNotifications?: boolean;
  invoiceAlerts?: boolean;
  paymentAlerts?: boolean;
  quotationAlerts?: boolean;
  expenseAlerts?: boolean;
  systemAlerts?: boolean;
}
