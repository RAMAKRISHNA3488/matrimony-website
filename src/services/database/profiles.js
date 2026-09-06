/**
 * Profiles Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';
import { getUserById } from './users.js';

/**
 * Get profile details by userId
 */
export async function getProfileByUserId(userId) {
  if (!userId) return null;
  return await getFromStore(STORES.PROFILES, String(userId));
}

/**
 * Create or replace profile details for a user
 */
export async function createProfile(profileData) {
  if (!profileData || !profileData.userId) {
    throw new Error("userId is required to create profile.");
  }

  const profile = {
    userId: String(profileData.userId),
    about: profileData.about || profileData.aboutMe || "Looking for a compatible Telugu life partner.",
    height: profileData.height || "5'6\"",
    familyDetails: profileData.familyDetails || {
      familyType: 'Nuclear',
      fatherOccupation: 'Business / Service',
      motherOccupation: 'Homemaker'
    },
    lifestyle: profileData.lifestyle || {
      diet: profileData.foodHabits || 'Vegetarian',
      smoking: 'No',
      drinking: 'No'
    },
    interests: profileData.interests || ['Music', 'Reading', 'Travel'],
    horoscopeDetails: profileData.horoscopeDetails || {
      raasi: profileData.raasi || 'Mesha',
      nakshatram: profileData.nakshatram || 'Ashwini',
      dosham: 'No Dosham'
    },
    photos: Array.isArray(profileData.photos) ? profileData.photos : (profileData.photo ? [profileData.photo] : []),
    privacySettings: profileData.privacySettings || { photoVisibility: 'all', contactVisibility: 'members' }
  };

  await putInStore(STORES.PROFILES, profile);
  return profile;
}

/**
 * Update existing profile details
 */
export async function updateProfile(userId, updates) {
  if (!userId) return null;
  const existing = await getProfileByUserId(userId) || { userId };

  const updated = {
    ...existing,
    ...updates,
    userId: String(userId)
  };

  await putInStore(STORES.PROFILES, updated);
  return updated;
}

/**
 * Get all profiles joined with their base user information
 */
export async function getAllProfilesWithUsers() {
  const [profiles, users] = await Promise.all([
    getAllFromStore(STORES.PROFILES),
    getAllFromStore(STORES.USERS)
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));

  return users.map(user => {
    const profile = profiles.find(p => p.userId === user.id) || {};
    return {
      id: user.id,
      name: user.fullName,
      age: user.dateOfBirth ? Math.max(18, new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : 26,
      gender: user.gender,
      height: profile.height || "5'6\"",
      motherTongue: user.motherTongue || 'Telugu',
      maritalStatus: user.maritalStatus || 'Never Married',
      community: user.community,
      city: user.location?.split(',')?.[0]?.trim() || 'Hyderabad',
      state: user.location?.split(',')?.[1]?.trim() || 'Telangana',
      education: user.education,
      profession: user.occupation,
      membershipTier: user.membershipPlan,
      verificationStatus: user.verificationStatus,
      photos: profile.photos?.length > 0 ? profile.photos : [user.profilePhoto],
      aboutMe: profile.about,
      familyType: profile.familyDetails?.familyType || 'Nuclear',
      foodHabits: profile.lifestyle?.diet || 'Vegetarian',
      interests: profile.interests || [],
      raasi: profile.horoscopeDetails?.raasi || 'Simha',
      nakshatram: profile.horoscopeDetails?.nakshatram || 'Magha',
      dosham: profile.horoscopeDetails?.dosham || 'No Dosham',
      rawUser: user,
      rawProfile: profile
    };
  });
}

/**
 * Search profiles matching dynamic filters
 */
export async function searchProfiles(filters = {}) {
  const all = await getAllProfilesWithUsers();

  return all.filter(p => {
    if (filters.gender && p.gender !== filters.gender) return false;
    if (filters.community && filters.community !== 'All' && !p.community?.toLowerCase().includes(filters.community.toLowerCase())) return false;
    if (filters.maritalStatus && filters.maritalStatus !== 'All' && p.maritalStatus !== filters.maritalStatus) return false;
    if (filters.religion && filters.religion !== 'All' && p.rawUser?.religion !== filters.religion) return false;
    if (filters.city && filters.city !== 'All' && !p.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.education && filters.education !== 'All' && !p.education?.toLowerCase().includes(filters.education.toLowerCase())) return false;
    if (filters.minAge && p.age < Number(filters.minAge)) return false;
    if (filters.maxAge && p.age > Number(filters.maxAge)) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match = (
        p.name?.toLowerCase().includes(q) ||
        p.community?.toLowerCase().includes(q) ||
        p.profession?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });
}
