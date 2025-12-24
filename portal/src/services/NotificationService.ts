import { Notification } from '../types/domain';
import { HttpClient } from './httpClient';

export interface NotificationService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(): Promise<void>;
}

export class ApiNotificationService implements NotificationService {
  constructor(private readonly client: HttpClient) {}

  getNotifications(): Promise<Notification[]> {
    return this.client.get<Notification[]>('/api/notifications');
  }

  markAsRead(): Promise<void> {
    return this.client.post<void>('/api/notifications/read', {});
  }
}
