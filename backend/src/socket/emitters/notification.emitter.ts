import { io } from '../index';

interface NotificationPayload {
  id: string;
  recipientId: string;
  message: string;
  type: string;
  taskId: string | null;
  isRead: boolean;
  createdAt: Date;
}

export const notificationEmitter = {
  emit(notification: NotificationPayload) {
    const payload = {
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    };

    io.to(`user:${notification.recipientId}`).emit('notification:new', payload);
  }
};
