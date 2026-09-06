/**
 * Messages & Conversations Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';
import { getUserById } from './users.js';
import { createNotification } from './notifications.js';

/**
 * Send a message between two users
 */
export async function sendMessage(senderUserId, receiverUserId, messageText) {
  if (!senderUserId || !receiverUserId || !messageText) {
    throw new Error("Sender, receiver, and message text are required.");
  }

  const id = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newMessage = {
    id,
    senderUserId: String(senderUserId),
    receiverUserId: String(receiverUserId),
    message: String(messageText).trim(),
    read: false,
    createdAt: now
  };

  await putInStore(STORES.MESSAGES, newMessage);

  // Trigger notification for the receiver
  const sender = await getUserById(senderUserId);
  await createNotification(
    receiverUserId,
    'new_message',
    `Message from ${sender?.fullName || 'Match'} 💬`,
    messageText.length > 50 ? `${messageText.slice(0, 47)}...` : messageText
  );

  return newMessage;
}

/**
 * Get all messages between two users (single conversation thread)
 */
export async function getConversation(userA, userB) {
  if (!userA || !userB) return [];

  const allMessages = await getAllFromStore(STORES.MESSAGES);
  const uA = String(userA);
  const uB = String(userB);

  return allMessages
    .filter(m => (m.senderUserId === uA && m.receiverUserId === uB) ||
                 (m.senderUserId === uB && m.receiverUserId === uA))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Get all conversation summaries for a user
 */
export async function getConversationsForUser(userId) {
  if (!userId) return [];

  const [allMessages, allUsers] = await Promise.all([
    getAllFromStore(STORES.MESSAGES),
    getAllFromStore(STORES.USERS)
  ]);

  const userMap = new Map(allUsers.map(u => [u.id, u]));
  const uId = String(userId);

  // Group messages by conversation partner
  const convMap = new Map();

  allMessages.forEach(m => {
    if (m.senderUserId === uId || m.receiverUserId === uId) {
      const partnerId = m.senderUserId === uId ? m.receiverUserId : m.senderUserId;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, []);
      }
      convMap.get(partnerId).push(m);
    }
  });

  const result = [];
  convMap.forEach((msgs, partnerId) => {
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const lastMsg = msgs[msgs.length - 1];
    const partner = userMap.get(partnerId) || { id: partnerId, fullName: 'Match', profilePhoto: '/assets/profiles/bride_sravani.jpg' };
    const unreadCount = msgs.filter(m => m.receiverUserId === uId && !m.read).length;

    result.push({
      id: `conv_${uId}_${partnerId}`,
      partnerId,
      partnerName: partner.fullName || partner.name || 'Telugu Member',
      partnerPhoto: partner.profilePhoto || partner.photos?.[0] || '/assets/profiles/bride_sravani.jpg',
      partnerOnline: true,
      lastMessage: lastMsg.message,
      lastMessageTime: lastMsg.createdAt,
      unreadCount,
      messages: msgs.map(m => ({
        id: m.id,
        senderId: m.senderUserId,
        receiverId: m.receiverUserId,
        text: m.message,
        timestamp: m.createdAt,
        read: m.read
      }))
    });
  });

  return result.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(currentUserId, partnerId) {
  const allMessages = await getAllFromStore(STORES.MESSAGES);
  const uId = String(currentUserId);
  const pId = String(partnerId);

  const updates = [];
  for (const m of allMessages) {
    if (m.senderUserId === pId && m.receiverUserId === uId && !m.read) {
      m.read = true;
      updates.push(putInStore(STORES.MESSAGES, m));
    }
  }

  await Promise.all(updates);
  return true;
}

/**
 * Get total unread message count for a user
 */
export async function getUnreadMessageCount(userId) {
  if (!userId) return 0;
  const allMessages = await getAllFromStore(STORES.MESSAGES);
  const uId = String(userId);
  return allMessages.filter(m => m.receiverUserId === uId && !m.read).length;
}
