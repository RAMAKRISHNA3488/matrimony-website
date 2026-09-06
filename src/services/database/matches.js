/**
 * Matches Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';
import { getAllProfilesWithUsers } from './profiles.js';

/**
 * Create a match record
 */
export async function createMatch(userId, matchedUserId, compatibilityScore = 90) {
  const allMatches = await getAllFromStore(STORES.MATCHES);
  const existing = allMatches.find(
    m => (m.userId === userId && m.matchedUserId === matchedUserId) ||
         (m.userId === matchedUserId && m.matchedUserId === userId)
  );

  if (existing) return existing;

  const id = `match_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const newMatch = {
    id,
    userId: String(userId),
    matchedUserId: String(matchedUserId),
    compatibilityScore: Number(compatibilityScore) || 90,
    createdAt: new Date().toISOString()
  };

  await putInStore(STORES.MATCHES, newMatch);
  return newMatch;
}

/**
 * Get all matches for a user joined with candidate profiles
 */
export async function getMatchesForUser(userId) {
  if (!userId) return [];

  const [matches, allProfiles] = await Promise.all([
    getAllFromStore(STORES.MATCHES),
    getAllProfilesWithUsers()
  ]);

  const profileMap = new Map(allProfiles.map(p => [p.id, p]));

  const userMatches = matches.filter(
    m => m.userId === String(userId) || m.matchedUserId === String(userId)
  );

  return userMatches.map(m => {
    const partnerId = m.userId === String(userId) ? m.matchedUserId : m.userId;
    const partnerProfile = profileMap.get(partnerId) || {
      id: partnerId,
      name: 'Compatible Match',
      age: 26,
      city: 'Hyderabad',
      education: 'Professional',
      profession: 'Software Engineer',
      photos: ['/assets/profiles/bride_sravani.jpg']
    };

    return {
      id: m.id,
      matchId: m.id,
      partnerId,
      compatibilityScore: m.compatibilityScore || 92,
      createdAt: m.createdAt,
      profile: partnerProfile
    };
  });
}

/**
 * Generate Recommended Matches dynamically from stored profiles
 */
export async function getRecommendedMatches(userId, userGender = 'male') {
  const allProfiles = await getAllProfilesWithUsers();
  const oppositeGender = userGender === 'male' ? 'female' : 'male';

  return allProfiles
    .filter(p => p.id !== String(userId) && (p.gender === oppositeGender || !p.gender))
    .map(p => ({
      ...p,
      compatibilityScore: Math.floor(Math.random() * 15 + 85) // 85% to 99%
    }));
}
