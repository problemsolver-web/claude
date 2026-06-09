import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { emitToUser } from '../../realtime/io';
import { ApiError } from '../../utils/ApiError';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

/**
 * Persist a notification and push it in real time to the recipient.
 * Used by applications, messaging and matching modules.
 */
export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      notificationType: input.type,
      title: input.title,
      message: input.message,
      relatedEntityId: input.relatedEntityId,
      relatedEntityType: input.relatedEntityType,
    },
  });
  emitToUser(input.userId, 'notification', notification);
  return notification;
}

export async function listNotifications(userId: string, opts: { unreadOnly?: boolean; page: number; limit: number }) {
  const where: Prisma.NotificationWhereInput = { userId, ...(opts.unreadOnly ? { isRead: false } : {}) };
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  return { items, total, unreadCount, page: opts.page, limit: opts.limit };
}

export async function markRead(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw ApiError.notFound('Notification not found');
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { message: 'All notifications marked as read' };
}

export async function remove(userId: string, id: string) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw ApiError.notFound('Notification not found');
  await prisma.notification.delete({ where: { id } });
  return { message: 'Notification deleted' };
}
