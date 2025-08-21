import axios from 'axios';

const API_BASE_URL = 'http://localhost:3111/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  application_id?: number; // Optional field for job application notifications
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'message';
  user_id: number;
}

export const notificationService = {
  // Get all notifications for the current user (excluding message notifications)
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get('/notifications');
      // Filter out message-type notifications from general notification bar
      const notifications = response.data.data.filter((notification: Notification) => notification.type !== 'message');
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notifications count (excluding message notifications)
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      // The backend should return count excluding message notifications
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Create a new notification
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    try {
      const response = await apiClient.post('/notifications', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export const getUnreadNotifications = async (token: string) => {
	const res = await axios.get('/api/notifications/unread-count', {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const getAdminStats = async () => {
	const res = await apiClient.get('/admin/stats');
	return res.data;
};

export const getAdminUsers = async (params?: { type?: 'all' | 'general' | 'pwd'; page?: number; pageSize?: number; }) => {
	const res = await apiClient.get('/admin/users', { params });
	return res.data;
};

export const getAdminEmployers = async (params?: { page?: number; pageSize?: number; }) => {
	const res = await apiClient.get('/admin/employers', { params });
	return res.data;
};

export const getAdminAnalytics = async () => {
	const res = await apiClient.get('/admin/analytics');
	return res.data;
};

export const getAdminActivities = async (params?: { limit?: number; days?: number }) => {
	const res = await apiClient.get('/admin/activities', { params });
	return res.data;
}; 