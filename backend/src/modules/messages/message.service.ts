import { NotificationType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { emitToUser } from '../../realtime/io';
import { createNotification } from '../notifications/notification.service';

/** Send a direct message to another user. */
export async function sendMessage(senderId: string, recipientId: string, content: string) {
  if (senderId === recipientId) throw ApiError.badRequest('Cannot message yourself');
  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) throw ApiError.notFound('Recipient not found');

  const message = await prisma.message.create({ data: { senderId, recipientId, content } });

  // Real-time push to the recipient (and echo to sender for multi-tab sync).
  emitToUser(recipientId, 'message', message);
  emitToUser(senderId, 'message', message);

  const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
  await createNotification({
    userId: recipientId,
    type: NotificationType.MESSAGE_RECEIVED,
    title: 'New message',
    message: `${sender?.name ?? 'Someone'} sent you a message`,
    relatedEntityId: senderId,
    relatedEntityType: 'message',
  });

  return message;
}

/**
 * List conversations for a user: the most recent message per counterpart,
 * plus unread counts. Built in-memory from recent messages for simplicity.
 */
export async function listConversations(userId: string) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, name: true } },
      recipient: { select: { id: true, name: true } },
    },
    take: 500,
  });

  const conversations = new Map<string, any>();
  for (const m of messages) {
    const other = m.senderId === userId ? m.recipient : m.sender;
    if (!conversations.has(other.id)) {
      conversations.set(other.id, {
        userId: other.id,
        name: other.name,
        lastMessage: m.content,
        lastMessageAt: m.createdAt,
        unreadCount: 0,
      });
    }
    if (m.recipientId === userId && !m.readAt) {
      conversations.get(other.id).unreadCount += 1;
    }
  }
  return [...conversations.values()];
}

/** Full thread with one counterpart; marks incoming messages as read. */
export async function getConversation(userId: string, otherUserId: string, page = 1, limit = 50) {
  const where = {
    OR: [
      { senderId: userId, recipientId: otherUserId },
      { senderId: otherUserId, recipientId: userId },
    ],
  };
  const [items, total] = await Promise.all([
    prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.message.count({ where }),
  ]);

  await prisma.message.updateMany({
    where: { senderId: otherUserId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { items: items.reverse(), total, page, limit };
}
