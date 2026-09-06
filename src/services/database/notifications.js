/**
 * Notifications Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';

/**
 * Create a new notification for a user
 */
export async function createNotification(userId, type, title, message) {
  if (!userId) return null;

  const id = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newNotif = {
    id,
    userId: String(userId),
    type: type || 'system',
    title: title || 'TeluguBandham Update',
    message: message || '',
    read: false,
    createdAt: now
  };

  await putInStore(STORES.NOTIFICATIONS, newNotif);
  return newNotif;
}

/**
 * Get all notifications for a user
 */
export async function getNotificationsForUser(userId) {
  if (!userId) return [];

  const all = await getAllFromStore(STORES.NOTIFICATIONS);
  return all
    .filter(n => n.userId === String(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(notificationId) {
  const notif = await getFromStore(STORES.NOTIFICATIONS, notificationId);
  if (!notif) return false;

  notif.read = true;
  await putInStore(STORES.NOTIFICATIONS, notif);
  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId) {
  if (!userId) return false;

  const all = await getAllFromStore(STORES.NOTIFICATIONS);
  const uId = String(userId);

  const updates = [];
  for (const n of all) {
    if (n.userId === uId && !n.read) {
      n.read = true;
      updates.push(putInStore(STORES.NOTIFICATIONS, n));
    }
  }

  await Promise.all(updates);
  return true;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(userId) {
  if (!userId) return 0;
  const all = await getAllFromStore(STORES.NOTIFICATIONS);
  return all.filter(n => n.userId === String(userId) && !n.read).length;
}
