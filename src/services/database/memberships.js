/**
 * Memberships & Transactions Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';
import { getUserById, updateUser } from './users.js';
import { createNotification } from './notifications.js';

/**
 * Record a membership upgrade transaction and update the user record
 */
export async function createMembershipTransaction(userId, planData, paymentMethod = 'UPI (Test)') {
  if (!userId || !planData) {
    throw new Error("User ID and Plan Data are required.");
  }

  const id = `mem_tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const planName = planData.name || 'Gold Member';
  const duration = planData.period || '3 Months';
  const days = duration.includes('12') ? 365 : duration.includes('6') ? 180 : 90;
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const transaction = {
    id,
    userId: String(userId),
    plan: planName,
    amount: Number(planData.price) || 2999,
    duration,
    status: 'Active',
    startDate: now,
    expiryDate,
    paymentMethod,
    createdAt: now
  };

  // 1. Save transaction in memberships store
  await putInStore(STORES.MEMBERSHIPS, transaction);

  // 2. Update user's membershipPlan and expiry in users store
  await updateUser(userId, {
    membershipPlan: planName,
    membershipExpiry: expiryDate,
    isPremium: true
  });

  // 3. Trigger upgrade confirmation notification
  await createNotification(
    userId,
    'membership_activated',
    `👑 ${planName} Plan Activated!`,
    `Your membership has been upgraded successfully until ${new Date(expiryDate).toLocaleDateString('en-IN')}. Enjoy exclusive premium benefits!`
  );

  return transaction;
}

/**
 * Get all membership transactions for a user
 */
export async function getMembershipsForUser(userId) {
  if (!userId) return [];
  const all = await getAllFromStore(STORES.MEMBERSHIPS);
  return all
    .filter(m => m.userId === String(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get all membership records (for Admin portal)
 */
export async function getAllMemberships() {
  const [memberships, users] = await Promise.all([
    getAllFromStore(STORES.MEMBERSHIPS),
    getAllFromStore(STORES.USERS)
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));

  return memberships.map(m => {
    const user = userMap.get(m.userId) || {};
    return {
      ...m,
      userName: user.fullName || 'Member',
      userMobile: user.mobileNumber || '-',
      userEmail: user.email || '-'
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
