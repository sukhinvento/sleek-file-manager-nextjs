import apiClient from '@/lib/api-client';

export interface AppNotification {
  _id: string;
  userId: string;
  tenantId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  entityId?: string;
  entityType?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  items: AppNotification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

/**
 * Fetch notifications for the current user
 * API: GET /notifications
 */
export const getNotifications = async (options?: {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResponse> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.offset) params.append('offset', String(options.offset));
  if (options?.unreadOnly) params.append('unreadOnly', 'true');

  const response = await apiClient.get<NotificationListResponse>(
    `/notifications?${params.toString()}`
  );
  return response.data;
};

/**
 * Get unread notification count
 * API: GET /notifications/unread-count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<{ unreadCount: number }>(
    '/notifications/unread-count'
  );
  return response.data.unreadCount;
};

/**
 * Mark a single notification as read
 * API: PATCH /notifications/:id/read
 */
export const markAsRead = async (id: string): Promise<AppNotification> => {
  const response = await apiClient.patch<AppNotification>(
    `/notifications/${id}/read`
  );
  return response.data;
};

/**
 * Mark all notifications as read
 * API: POST /notifications/mark-all-read
 */
export const markAllAsRead = async (): Promise<{ modifiedCount: number }> => {
  const response = await apiClient.post<{ modifiedCount: number }>(
    '/notifications/mark-all-read'
  );
  return response.data;
};

export const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
