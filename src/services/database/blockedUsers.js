/**
 * Blocked Users Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';

/**
 * Block a user
 */
export async function blockUser(userId, blockedUserId) {
  if (!userId || !blockedUserId) return false;

  const id = `block_${userId}_${blockedUserId}`;
  const record = {
    id,
    userId: String(userId),
    blockedUserId: String(blockedUserId),
    createdAt: new Date().toISOString()
  };

  await putInStore(STORES.BLOCKED_USERS, record);
  return true;
}

/**
 * Unblock a user
 */
export async function unblockUser(userId, blockedUserId) {
  const id = `block_${userId}_${blockedUserId}`;
  return await deleteFromStore(STORES.BLOCKED_USERS, id);
}

/**
 * Get all blocked user IDs for a user
 */
export async function getBlockedUsersForUser(userId) {
  if (!userId) return [];
  const all = await getAllFromStore(STORES.BLOCKED_USERS);
  return all
    .filter(b => b.userId === String(userId))
    .map(b => b.blockedUserId);
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(userId, targetUserId) {
  const id = `block_${userId}_${targetUserId}`;
  const rec = await getFromStore(STORES.BLOCKED_USERS, id);
  return !!rec;
}
