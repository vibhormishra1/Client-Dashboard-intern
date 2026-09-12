import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: 'desc' },
    include: { task: { select: { id: true, title: true } } },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('NOT_FOUND', 'Notification not found', 404);
  }

  if (notification.recipientId !== userId) {
    throw new AppError('FORBIDDEN', 'You cannot mark this notification as read', 403);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });
}
