/**
 * Users Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  addToStore,
  deleteFromStore,
  getAllByIndex
} from './db.js';

/**
 * Get user by primary key (id)
 */
export async function getUserById(userId) {
  if (!userId) return null;
  return await getFromStore(STORES.USERS, String(userId));
}

/**
 * Get user by mobile number
 */
export async function getUserByMobile(mobileNumber) {
  if (!mobileNumber) return null;
  const cleanMobile = String(mobileNumber).trim().replace(/[\s-]/g, '').replace(/^(?:\+91|91)/, '');
  const allUsers = await getAllFromStore(STORES.USERS);
  return allUsers.find(u => {
    const userMobile = String(u.mobileNumber || '').trim().replace(/[\s-]/g, '').replace(/^(?:\+91|91)/, '');
    return userMobile === cleanMobile;
  }) || null;
}

/**
 * Get user by email address
 */
export async function getUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  const allUsers = await getAllFromStore(STORES.USERS);
  return allUsers.find(u => String(u.email || '').trim().toLowerCase() === cleanEmail) || null;
}

/**
 * Get all users
 */
export async function getAllUsers() {
  return await getAllFromStore(STORES.USERS);
}

/**
 * Create a new user with duplicate validation
 */
export async function createUser(userData) {
  if (!userData) throw new Error("User data is required.");

  const mobile = String(userData.mobileNumber || '').trim().replace(/[\s-]/g, '').replace(/^(?:\+91|91)/, '');
  const email = String(userData.email || '').trim().toLowerCase();

  // Validate duplicate mobile
  if (mobile) {
    const existingMobile = await getUserByMobile(mobile);
    if (existingMobile) {
      return { success: false, message: "A profile is already registered with this mobile number." };
    }
  }

  // Validate duplicate email
  if (email) {
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return { success: false, message: "A profile is already registered with this email address." };
    }
  }

  const userId = userData.id || `TB-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
  const now = new Date().toISOString();

  const newUser = {
    id: userId,
    fullName: userData.fullName || userData.name || 'Member',
    email: email || `${userId.toLowerCase()}@telugubandham.com`,
    mobileNumber: mobile,
    password: userData.password || 'Password@123',
    gender: userData.gender || 'female',
    dateOfBirth: userData.dateOfBirth || userData.dob || '1998-01-01',
    profilePhoto: userData.profilePhoto || userData.photo || (userData.gender === 'male' ? '/assets/profiles/groom_varma.jpg' : '/assets/profiles/bride_sravani.jpg'),
    profileFor: userData.profileFor || 'Self',
    location: userData.location || `${userData.city || 'Hyderabad'}, ${userData.state || 'Telangana'}`,
    education: userData.education || 'Graduate',
    occupation: userData.occupation || userData.profession || 'Professional',
    community: userData.community || 'Telugu Community',
    religion: userData.religion || 'Hindu',
    motherTongue: userData.motherTongue || 'Telugu',
    maritalStatus: userData.maritalStatus || 'Never Married',
    profileCompletion: userData.profileCompletion || 80,
    membershipPlan: userData.membershipPlan || 'Free Member',
    membershipExpiry: userData.membershipExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    verificationStatus: userData.verificationStatus || 'pending',
    createdAt: now,
    updatedAt: now
  };

  await putInStore(STORES.USERS, newUser);
  return { success: true, user: newUser };
}

/**
 * Update an existing user
 */
export async function updateUser(userId, updates) {
  if (!userId) return null;
  const existing = await getUserById(userId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await putInStore(STORES.USERS, updated);
  return updated;
}

/**
 * Delete a user by id
 */
export async function deleteUser(userId) {
  if (!userId) return false;
  return await deleteFromStore(STORES.USERS, String(userId));
}

/**
 * Validate credentials for login - Strictly verifies identifier and password
 */
export async function verifyCredentials(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: "Please enter your mobile number/email and password." };
  }

  const cleanIdent = String(identifier).trim();
  const cleanPass = String(password);

  // Check if identifier is mobile or email
  const isEmail = cleanIdent.includes('@');
  const user = isEmail 
    ? await getUserByEmail(cleanIdent)
    : await getUserByMobile(cleanIdent);

  // If user does not exist in DB
  if (!user) {
    return {
      success: false,
      message: "Account not found with this mobile number or email. Please check your credentials or register."
    };
  }

  // Strict password verification (supports seeded Password@123 or user-defined password)
  const expectedPassword = user.password || 'Password@123';
  if (cleanPass !== expectedPassword) {
    return {
      success: false,
      message: "Invalid password. Please check your password and try again."
    };
  }

  return { success: true, user };
}

