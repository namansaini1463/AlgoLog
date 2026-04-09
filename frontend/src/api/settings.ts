import api from './axios';

export interface NotificationPreferences {
  emailReminders: boolean;
  reminderTime: string;
  reminderTimezone: string;
}

export const settingsApi = {
  getNotifications: () =>
    api.get<NotificationPreferences>('/api/settings/notifications'),

  updateNotifications: (data: Partial<NotificationPreferences>) =>
    api.put<NotificationPreferences>('/api/settings/notifications', data),

  sendTestEmail: () =>
    api.post<{ message: string; note: string }>('/api/settings/test-email'),
};
