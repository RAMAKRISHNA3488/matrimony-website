/**
 * Interests Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';
import { createNotification } from './notifications.js';
import { createMatch } from './matches.js';
import { getUserById } from './users.js';

/**
 * Send an interest from senderUserId to receiverUserId
 */
export async function sendInterest(senderUserId, receiverUserId, message = "") {
  if (!senderUserId || !receiverUserId) {
    throw new Error("Sender and Receiver User IDs are required.");
  }

  const allInterests = await getAllFromStore(STORES.INTERESTS);
  const existing = allInterests.find(
    i => (i.senderUserId === senderUserId && i.receiverUserId === receiverUserId) ||
         (i.senderUserId === receiverUserId && i.receiverUserId === senderUserId)
  );

  if (existing) {
    return { success: false, message: "An interest has already been exchanged between these profiles.", interest: existing };
  }

  const now = new Date().toISOString();
  const id = `interest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const newInterest = {
    id,
    senderUserId: String(senderUserId),
    receiverUserId: String(receiverUserId),
    message: message || "Hi, I liked your profile and would like to connect.",
    status: 'pending',
    createdAt: now,
    updatedAt: now
  };

  await putInStore(STORES.INTERESTS, newInterest);

  // Trigger Notification for receiver
  const senderUser = await getUserById(senderUserId);
  await createNotification(
    receiverUserId,
    'interest_received',
    'New Interest Received! 💌',
    `${senderUser?.fullName || 'A TeluguBandham member'} sent you an interest request.`
  );

  return { success: true, interest: newInterest };
}

/**
 * Accept an interest request
 */
export async function acceptInterest(interestId) {
  const interest = await getFromStore(STORES.INTERESTS, interestId);
  if (!interest) return { success: false, message: "Interest request not found." };

  const updated = {
    ...interest,
    status: 'accepted',
    updatedAt: new Date().toISOString()
  };

  await putInStore(STORES.INTERESTS, updated);

  // Automatically create mutual match
  await createMatch(interest.senderUserId, interest.receiverUserId, 95);

  // Notify the sender that interest was accepted
  const receiverUser = await getUserById(interest.receiverUserId);
  await createNotification(
    interest.senderUserId,
    'interest_accepted',
    'Interest Accepted! 🎉',
    `${receiverUser?.fullName || 'Your match'} accepted your interest. You can now message and connect!`
  );

  return { success: true, interest: updated };
}

/**
 * Decline an interest request
 */
export async function declineInterest(interestId) {
  const interest = await getFromStore(STORES.INTERESTS, interestId);
  if (!interest) return { success: false, message: "Interest request not found." };

  const updated = {
    ...interest,
    status: 'declined',
    updatedAt: new Date().toISOString()
  };

  await putInStore(STORES.INTERESTS, updated);
  return { success: true, interest: updated };
}

/**
 * Get all interests for a user (sent & received)
 */
export async function getInterestsForUser(userId) {
  if (!userId) return { received: [], sent: [] };

  const allInterests = await getAllFromStore(STORES.INTERESTS);
  const users = await getAllFromStore(STORES.USERS);
  const userMap = new Map(users.map(u => [u.id, u]));

  const received = allInterests
    .filter(i => i.receiverUserId === String(userId))
    .map(i => ({
      ...i,
      sender: userMap.get(i.senderUserId) || { id: i.senderUserId, fullName: 'Member' }
    }));

  const sent = allInterests
    .filter(i => i.senderUserId === String(userId))
    .map(i => ({
      ...i,
      receiver: userMap.get(i.receiverUserId) || { id: i.receiverUserId, fullName: 'Member' }
    }));

  return { received, sent };
}
