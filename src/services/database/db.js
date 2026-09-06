/**
 * TeluguBandham IndexedDB Temporary Client-Side Database Engine
 * 
 * Manages 10 Object Stores for local development, testing, and full persistence:
 * 1. users
 * 2. profiles
 * 3. interests
 * 4. matches
 * 5. messages
 * 6. notifications
 * 7. memberships
 * 8. reports
 * 9. blockedUsers
 * 10. adminLogs
 */

import {
  INITIAL_PROFILES,
  DEFAULT_USER_PROFILE,
  FEMALE_USER_PROFILE,
  DEFAULT_ADMIN_USER,
  INITIAL_INTERESTS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS
} from '../mockData.js';
import { mockDb } from '../mockDb.js';

export const DB_NAME = 'TeluguBandhamDB';
export const DB_VERSION = 1;

export const STORES = {
  USERS: 'users',
  PROFILES: 'profiles',
  INTERESTS: 'interests',
  MATCHES: 'matches',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  MEMBERSHIPS: 'memberships',
  REPORTS: 'reports',
  BLOCKED_USERS: 'blockedUsers',
  ADMIN_LOGS: 'adminLogs'
};

let dbInstance = null;
let initPromise = null;

/**
 * Open or retrieve the singleton IndexedDB connection
 */
export function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve, reject) => {
    const idb = typeof window !== 'undefined' ? window.indexedDB : (typeof indexedDB !== 'undefined' ? indexedDB : null);
    if (!idb) {
      console.warn("IndexedDB is not supported in this environment.");
      return resolve(null);
    }

    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. users store
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        userStore.createIndex('mobileNumber', 'mobileNumber', { unique: false });
        userStore.createIndex('email', 'email', { unique: false });
        userStore.createIndex('gender', 'gender', { unique: false });
        userStore.createIndex('membershipPlan', 'membershipPlan', { unique: false });
        userStore.createIndex('verificationStatus', 'verificationStatus', { unique: false });
      }

      // 2. profiles store
      if (!db.objectStoreNames.contains(STORES.PROFILES)) {
        const profileStore = db.createObjectStore(STORES.PROFILES, { keyPath: 'userId' });
        profileStore.createIndex('userId', 'userId', { unique: true });
        profileStore.createIndex('community', 'community', { unique: false });
        profileStore.createIndex('city', 'city', { unique: false });
      }

      // 3. interests store
      if (!db.objectStoreNames.contains(STORES.INTERESTS)) {
        const interestStore = db.createObjectStore(STORES.INTERESTS, { keyPath: 'id' });
        interestStore.createIndex('senderUserId', 'senderUserId', { unique: false });
        interestStore.createIndex('receiverUserId', 'receiverUserId', { unique: false });
        interestStore.createIndex('status', 'status', { unique: false });
        interestStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 4. matches store
      if (!db.objectStoreNames.contains(STORES.MATCHES)) {
        const matchStore = db.createObjectStore(STORES.MATCHES, { keyPath: 'id' });
        matchStore.createIndex('userId', 'userId', { unique: false });
        matchStore.createIndex('matchedUserId', 'matchedUserId', { unique: false });
        matchStore.createIndex('compatibilityScore', 'compatibilityScore', { unique: false });
      }

      // 5. messages store
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messageStore.createIndex('senderUserId', 'senderUserId', { unique: false });
        messageStore.createIndex('receiverUserId', 'receiverUserId', { unique: false });
        messageStore.createIndex('read', 'read', { unique: false });
        messageStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 6. notifications store
      if (!db.objectStoreNames.contains(STORES.NOTIFICATIONS)) {
        const notifStore = db.createObjectStore(STORES.NOTIFICATIONS, { keyPath: 'id' });
        notifStore.createIndex('userId', 'userId', { unique: false });
        notifStore.createIndex('read', 'read', { unique: false });
        notifStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 7. memberships store
      if (!db.objectStoreNames.contains(STORES.MEMBERSHIPS)) {
        const membershipStore = db.createObjectStore(STORES.MEMBERSHIPS, { keyPath: 'id' });
        membershipStore.createIndex('userId', 'userId', { unique: false });
        membershipStore.createIndex('status', 'status', { unique: false });
        membershipStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 8. reports store
      if (!db.objectStoreNames.contains(STORES.REPORTS)) {
        const reportStore = db.createObjectStore(STORES.REPORTS, { keyPath: 'id' });
        reportStore.createIndex('reporterUserId', 'reporterUserId', { unique: false });
        reportStore.createIndex('reportedUserId', 'reportedUserId', { unique: false });
        reportStore.createIndex('status', 'status', { unique: false });
      }

      // 9. blockedUsers store
      if (!db.objectStoreNames.contains(STORES.BLOCKED_USERS)) {
        const blockedStore = db.createObjectStore(STORES.BLOCKED_USERS, { keyPath: 'id' });
        blockedStore.createIndex('userId', 'userId', { unique: false });
        blockedStore.createIndex('blockedUserId', 'blockedUserId', { unique: false });
      }

      // 10. adminLogs store
      if (!db.objectStoreNames.contains(STORES.ADMIN_LOGS)) {
        const adminLogStore = db.createObjectStore(STORES.ADMIN_LOGS, { keyPath: 'id' });
        adminLogStore.createIndex('adminId', 'adminId', { unique: false });
        adminLogStore.createIndex('action', 'action', { unique: false });
        adminLogStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = async (event) => {
      dbInstance = event.target.result;
      try {
        await seedInitialDataIfEmpty(dbInstance);
      } catch (err) {
        console.warn("Initial data seed check warning:", err);
      }
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };
  });

  return initPromise;
}

/**
 * Generic transactional helper: Get by primary key
 */
export async function getFromStore(storeName, key) {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Get all records from store
 */
export async function getAllFromStore(storeName) {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Query by index
 */
export async function getAllByIndex(storeName, indexName, value) {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Put (insert or replace) record
 */
export async function putInStore(storeName, value) {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Add (insert new) record
 */
export async function addToStore(storeName, value) {
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Delete record by key
 */
export async function deleteFromStore(storeName, key) {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper: Clear all records in store
 */
export async function clearStore(storeName) {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Initial Seed: Populates demo users, profiles, interests, messages, matches, and notifications
 * Executes ONLY if users store is currently empty.
 */
export async function seedInitialDataIfEmpty(db) {
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(
        [
          STORES.USERS,
          STORES.PROFILES,
          STORES.INTERESTS,
          STORES.MATCHES,
          STORES.MESSAGES,
          STORES.NOTIFICATIONS,
          STORES.MEMBERSHIPS,
          STORES.REPORTS,
          STORES.ADMIN_LOGS
        ],
        'readwrite'
      );

      const userStore = transaction.objectStore(STORES.USERS);
      const countRequest = userStore.count();

      countRequest.onsuccess = () => {
        if (countRequest.result > 0) {
          // Already seeded
          return resolve(false);
        }

        const profileStore = transaction.objectStore(STORES.PROFILES);
        const interestStore = transaction.objectStore(STORES.INTERESTS);
        const matchStore = transaction.objectStore(STORES.MATCHES);
        const messageStore = transaction.objectStore(STORES.MESSAGES);
        const notifStore = transaction.objectStore(STORES.NOTIFICATIONS);
        const membershipStore = transaction.objectStore(STORES.MEMBERSHIPS);
        const reportStore = transaction.objectStore(STORES.REPORTS);
        const adminLogStore = transaction.objectStore(STORES.ADMIN_LOGS);

        const now = new Date().toISOString();

        // 1. Seed Demo Primary User (Karthik Varma)
        const primaryUser = {
          id: DEFAULT_USER_PROFILE.id || 'TB-1002',
          fullName: DEFAULT_USER_PROFILE.name || 'Karthik Varma',
          email: 'karthik.varma@telugubandham.com',
          mobileNumber: '9876543210',
          password: 'Password@123',
          gender: DEFAULT_USER_PROFILE.gender || 'male',
          dateOfBirth: '1995-06-15',
          profilePhoto: DEFAULT_USER_PROFILE.photos?.[0] || '',
          profileFor: 'Self',
          location: `${DEFAULT_USER_PROFILE.city || 'Hyderabad'}, ${DEFAULT_USER_PROFILE.state || 'Telangana'}`,
          education: DEFAULT_USER_PROFILE.education || 'M.Tech',
          occupation: DEFAULT_USER_PROFILE.profession || 'Principal Staff Engineer',
          community: DEFAULT_USER_PROFILE.community || 'Raju (Kshatriya)',
          religion: 'Hindu',
          motherTongue: 'Telugu',
          maritalStatus: DEFAULT_USER_PROFILE.maritalStatus || 'Never Married',
          profileCompletion: 90,
          membershipPlan: DEFAULT_USER_PROFILE.membershipTier || 'Diamond Member',
          membershipExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          verificationStatus: 'verified',
          createdAt: now,
          updatedAt: now
        };
        userStore.put(primaryUser);

        profileStore.put({
          userId: primaryUser.id,
          about: DEFAULT_USER_PROFILE.aboutMe || "Passionate software architect in Hyderabad.",
          height: DEFAULT_USER_PROFILE.height || "5'11\"",
          familyDetails: {
            familyType: DEFAULT_USER_PROFILE.familyType || 'Nuclear',
            familyValues: DEFAULT_USER_PROFILE.familyValues || 'Traditional & Progressive',
            fatherOccupation: DEFAULT_USER_PROFILE.fatherOccupation || 'Retired Bank Executive',
            motherOccupation: DEFAULT_USER_PROFILE.motherOccupation || 'Homemaker'
          },
          lifestyle: {
            diet: DEFAULT_USER_PROFILE.foodHabits || 'Vegetarian',
            smoking: 'No',
            drinking: 'No'
          },
          interests: DEFAULT_USER_PROFILE.interests || ['Tech', 'Carnatic Music', 'Reading'],
          horoscopeDetails: {
            raasi: DEFAULT_USER_PROFILE.raasi || 'Simha (Leo)',
            nakshatram: DEFAULT_USER_PROFILE.nakshatram || 'Magha',
            dosham: 'No Dosham'
          },
          photos: DEFAULT_USER_PROFILE.photos || [],
          privacySettings: { photoVisibility: 'all', contactVisibility: 'members' }
        });

        // 2. Seed Demo Secondary User (Sravani Reddy)
        const femaleUser = {
          id: FEMALE_USER_PROFILE.id || 'TB-1001',
          fullName: FEMALE_USER_PROFILE.name || 'Sravani Reddy',
          email: 'sravani.reddy@telugubandham.com',
          mobileNumber: '9876543211',
          password: 'Password@123',
          gender: 'female',
          dateOfBirth: '1998-04-12',
          profilePhoto: FEMALE_USER_PROFILE.photos?.[0] || '/assets/profiles/bride_sravani.jpg',
          profileFor: 'Self',
          location: 'Hyderabad, Telangana',
          education: FEMALE_USER_PROFILE.education || 'M.S. in Data Science',
          occupation: FEMALE_USER_PROFILE.profession || 'Lead AI Data Scientist',
          community: 'Reddy',
          religion: 'Hindu',
          motherTongue: 'Telugu',
          maritalStatus: 'Never Married',
          profileCompletion: 95,
          membershipPlan: 'Gold Member',
          membershipExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          verificationStatus: 'verified',
          createdAt: now,
          updatedAt: now
        };
        userStore.put(femaleUser);

        profileStore.put({
          userId: femaleUser.id,
          about: FEMALE_USER_PROFILE.aboutMe || "AI scientist in Hyderabad.",
          height: FEMALE_USER_PROFILE.height || "5'5\"",
          familyDetails: {
            familyType: 'Nuclear',
            fatherOccupation: 'Executive Engineer',
            motherOccupation: 'Homemaker'
          },
          lifestyle: {
            diet: 'Non-Vegetarian',
            smoking: 'No',
            drinking: 'No'
          },
          interests: FEMALE_USER_PROFILE.interests || ['Carnatic Music', 'Trekking', 'Reading'],
          horoscopeDetails: {
            raasi: 'Kanya (Virgo)',
            nakshatram: 'Hasta',
            dosham: 'No Dosham'
          },
          photos: FEMALE_USER_PROFILE.photos || ['/assets/profiles/bride_sravani.jpg'],
          privacySettings: { photoVisibility: 'all', contactVisibility: 'members' }
        });

        // 3. Seed Other South Indian Candidate Profiles
        if (Array.isArray(INITIAL_PROFILES)) {
          INITIAL_PROFILES.forEach((p, idx) => {
            if (p.id !== primaryUser.id && p.id !== femaleUser.id) {
              const uId = p.id || `TB-${1003 + idx}`;
              const userRec = {
                id: uId,
                fullName: p.name || 'Member',
                email: `${(p.name || 'user').toLowerCase().replace(/\s+/g, '.')}@example.com`,
                mobileNumber: `98765${String(idx + 10000).slice(-5)}`,
                password: 'Password@123',
                gender: p.gender || (idx % 2 === 0 ? 'female' : 'male'),
                dateOfBirth: `${2024 - (p.age || 26)}-01-01`,
                profilePhoto: p.photos?.[0] || '/assets/profiles/bride_sravani.jpg',
                profileFor: 'Self',
                location: `${p.city || 'Hyderabad'}, ${p.state || 'Telangana'}`,
                education: p.education || 'B.Tech',
                occupation: p.profession || 'Software Professional',
                community: p.community || 'Telugu Community',
                religion: 'Hindu',
                motherTongue: 'Telugu',
                maritalStatus: p.maritalStatus || 'Never Married',
                profileCompletion: 85,
                membershipPlan: idx % 3 === 0 ? 'Gold Member' : 'Free Member',
                verificationStatus: idx % 4 === 0 ? 'pending' : 'verified',
                createdAt: now,
                updatedAt: now
              };
              userStore.put(userRec);

              profileStore.put({
                userId: uId,
                about: p.aboutMe || 'Looking for a compatible Telugu life partner.',
                height: p.height || "5'6\"",
                familyDetails: {
                  familyType: p.familyType || 'Nuclear',
                  fatherOccupation: p.fatherOccupation || 'Business',
                  motherOccupation: p.motherOccupation || 'Homemaker'
                },
                lifestyle: {
                  diet: p.foodHabits || 'Vegetarian',
                  smoking: p.smoking || 'No',
                  drinking: p.drinking || 'No'
                },
                interests: p.interests || ['Music', 'Movies', 'Travel'],
                horoscopeDetails: {
                  raasi: p.raasi || 'Mesha',
                  nakshatram: p.nakshatram || 'Ashwini',
                  dosham: p.dosham || 'No Dosham'
                },
                photos: p.photos || ['/assets/profiles/bride_sravani.jpg'],
                privacySettings: { photoVisibility: 'all', contactVisibility: 'members' }
              });
            }
          });
        }

        // 4. Seed Interests
        if (Array.isArray(INITIAL_INTERESTS)) {
          INITIAL_INTERESTS.forEach((item, idx) => {
            interestStore.put({
              id: item.id || `interest_${idx + 1}`,
              senderUserId: item.senderId || primaryUser.id,
              receiverUserId: item.receiverId || 'TB-1001',
              status: item.status || 'pending',
              createdAt: item.createdAt || now
            });
          });
        }

        // 5. Seed Matches
        if (Array.isArray(INITIAL_MATCHES)) {
          INITIAL_MATCHES.forEach((m, idx) => {
            matchStore.put({
              id: m.id || `match_${idx + 1}`,
              userId: m.userId || primaryUser.id,
              matchedUserId: m.matchedUserId || `TB-${1001 + idx}`,
              compatibilityScore: m.score || m.compatibilityScore || 92,
              createdAt: m.createdAt || now
            });
          });
        }

        // 6. Seed Conversations & Messages
        if (Array.isArray(INITIAL_CONVERSATIONS)) {
          INITIAL_CONVERSATIONS.forEach((conv) => {
            if (Array.isArray(conv.messages)) {
              conv.messages.forEach((msg, mIdx) => {
                messageStore.put({
                  id: msg.id || `msg_${conv.id}_${mIdx}`,
                  senderUserId: msg.senderId || primaryUser.id,
                  receiverUserId: msg.receiverId || conv.partnerId || 'TB-1001',
                  message: msg.text || msg.message || '',
                  read: !!msg.read,
                  createdAt: msg.timestamp || msg.createdAt || now
                });
              });
            }
          });
        }

        // 7. Seed Notifications
        if (Array.isArray(INITIAL_NOTIFICATIONS)) {
          INITIAL_NOTIFICATIONS.forEach((n, idx) => {
            notifStore.put({
              id: n.id || `notif_${idx + 1}`,
              userId: n.userId || primaryUser.id,
              type: n.type || 'interest',
              title: n.title || 'Notification',
              message: n.message || n.text || '',
              read: !!n.read,
              createdAt: n.timestamp || n.createdAt || now
            });
          });
        }

        // 8. Seed Initial Memberships
        if (Array.isArray(INITIAL_TRANSACTIONS)) {
          INITIAL_TRANSACTIONS.forEach((tx, idx) => {
            membershipStore.put({
              id: tx.id || `mem_${idx + 1}`,
              userId: tx.userId || primaryUser.id,
              plan: tx.plan || 'Diamond Member',
              amount: tx.amount || 5999,
              duration: '6 Months',
              status: tx.status || 'Active',
              startDate: tx.date || now,
              expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
              paymentMethod: tx.method || 'UPI',
              createdAt: tx.date || now
            });
          });
        }

        // 9. Seed Initial Reports
        if (Array.isArray(INITIAL_REPORTS)) {
          INITIAL_REPORTS.forEach((rep, idx) => {
            reportStore.put({
              id: rep.id || `rep_${idx + 1}`,
              reporterUserId: rep.reporterId || primaryUser.id,
              reportedUserId: rep.reportedId || 'TB-1005',
              reason: rep.reason || 'Spam / Fake Profile',
              description: rep.details || rep.description || 'Suspicious details provided.',
              status: rep.status || 'Under Review',
              createdAt: rep.timestamp || now
            });
          });
        }

        // 10. Seed Admin Logs
        if (Array.isArray(INITIAL_AUDIT_LOGS)) {
          INITIAL_AUDIT_LOGS.forEach((log, idx) => {
            adminLogStore.put({
              id: log.id || `audit_${idx + 1}`,
              adminId: log.adminId || 'admin_1',
              action: log.action || 'PROFILE_VERIFICATION',
              targetId: log.targetId || 'TB-1002',
              details: log.details || 'Profile verified by senior matchmaker.',
              createdAt: log.timestamp || now
            });
          });
        }

        resolve(true);
      };

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (e) => {
        console.warn("Seed transaction warning:", e.target.error);
        resolve(false);
      };
    } catch (err) {
      console.warn("Seed exception:", err);
      resolve(false);
    }
  });
}

/**
 * Developer Reset: Wipes all 10 object stores and re-seeds fresh test data
 */
export async function resetDatabase() {
  const db = await openDB();
  if (!db) return false;

  const storeNames = Object.values(STORES);
  for (const s of storeNames) {
    try {
      await clearStore(s);
    } catch (err) {
      console.warn(`Error clearing store ${s}:`, err);
    }
  }

  // Reseed initial data
  await seedInitialDataIfEmpty(db);

  // Clear session keys in sessionStorage and localStorage
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('tb_auth_token_v2');
    sessionStorage.removeItem('tb_current_user_v2');
    sessionStorage.removeItem('tb_current_session');
    sessionStorage.removeItem('telugubandham_auth_user');
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('tb_auth_token_v2');
    localStorage.removeItem('tb_current_user_v2');
    localStorage.removeItem('tb_current_session');
    localStorage.removeItem('telugubandham_auth_user');
  }

  // Reset mockDb session/local storage & reactive state
  try {
    mockDb.resetAllMockData();
  } catch (err) {
    console.warn("mockDb reset warning:", err);
  }

  return true;
}
