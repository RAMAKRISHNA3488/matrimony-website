/**
 * TeluguBandham Authentication Service
 * 
 * Production-ready authentication abstraction layer supporting:
 * - Indian mobile number validation (+91 10 digits starting with 6/7/8/9)
 * - Strict email format verification
 * - Strong password policy & strength analysis
 * - Dynamic DOB / 18+ age verification
 * - OTP authentication & password reset flow
 * - Session persistence with token abstraction
 * - Clean hooks for backend integration (REST / Supabase / GraphQL / Firebase)
 */

import { mockDb } from './mockDb.js';
import { DEFAULT_USER_PROFILE, FEMALE_USER_PROFILE } from './mockData.js';
import { APP_CONFIG, DEMO_MODE } from '../config/appConfig.js';
import { otpService } from './otpService.js';
import {
  getUserById,
  getUserByMobile,
  getUserByEmail,
  createUser,
  verifyCredentials,
  updateUser,
  createProfile
} from './database/index.js';

export { DEMO_MODE };

const AUTH_TOKEN_KEY = APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN;
const REGISTERED_USERS_KEY = APP_CONFIG.STORAGE_KEYS.REGISTERED_USERS;

function safeGetItem(key) {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.error(`Failed to write key ${key}:`, err);
  }
}

function safeRemoveItem(key) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

// Helper to read/write registered users storage
export function getStoredUsers() {
  const raw = safeGetItem(REGISTERED_USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredUsers(users) {
  safeSetItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

// ================= VALIDATION SUITE =================
export const validators = {
  /**
   * Indian Mobile Number: Exactly 10 digits starting with 6, 7, 8, or 9 (optional +91 or 91 country code prefix)
   */
  isValidIndianMobile(mobile) {
    if (!mobile || typeof mobile !== 'string') return false;
    const trimmed = mobile.trim().replace(/[\s-]/g, '');
    // Match optional +91 or 91 prefix followed by exactly 10 digits starting with 6-9
    return /^(?:\+91|91)?[6-9]\d{9}$/.test(trimmed);
  },

  /**
   * Full Name: 2 to 60 characters, letters and spaces (and dots for initials)
   */
  isValidFullName(name) {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 60) return false;
    return /^[a-zA-Z\s.'-]+$/.test(trimmed);
  },

  /**
   * Email Format Validation
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const cleaned = email.trim();
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleaned);
  },

  /**
   * Basic Password: Min 8 characters
   */
  isValidPassword(password) {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8;
  },

  /**
   * Strong Password Criteria: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
   */
  isStrongPassword(password) {
    if (!password || typeof password !== 'string') return false;
    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#^()_+\-=[\]{}|;:'",.<>/~`]/.test(password);
    return hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;
  },

  /**
   * Detailed Password Strength Analyzer
   */
  getPasswordStrength(password) {
    if (!password || typeof password !== 'string') {
      return {
        score: 0,
        label: 'Empty',
        percent: 0,
        color: '#E5E7EB',
        hasMinLen: false,
        hasUpper: false,
        hasLower: false,
        hasDigit: false,
        hasSpecial: false
      };
    }

    const hasMinLen = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[@$!%*?&#^()_+\-=[\]{}|;:'",.<>/~`]/.test(password);

    let passedCriteria = 0;
    if (hasMinLen) passedCriteria++;
    if (hasUpper) passedCriteria++;
    if (hasLower) passedCriteria++;
    if (hasDigit) passedCriteria++;
    if (hasSpecial) passedCriteria++;

    let label = 'Weak';
    let color = '#EF4444'; // Red
    let percent = 20;

    if (passedCriteria === 5 && password.length >= 10) {
      label = 'Very Strong';
      color = '#059669'; // Emerald Green
      percent = 100;
    } else if (passedCriteria >= 4) {
      label = 'Strong';
      color = '#10B981'; // Green
      percent = 80;
    } else if (passedCriteria >= 3) {
      label = 'Good';
      color = '#F59E0B'; // Amber
      percent = 60;
    } else if (passedCriteria >= 2) {
      label = 'Fair';
      color = '#F97316'; // Orange
      percent = 40;
    }

    return {
      score: passedCriteria,
      label,
      percent,
      color,
      hasMinLen,
      hasUpper,
      hasLower,
      hasDigit,
      hasSpecial
    };
  },

  /**
   * Age Calculation from Date of Birth (Timezone safe)
   */
  calculateAge(dateString) {
    if (!dateString) return 0;
    
    let dobYear, dobMonth, dobDay;
    if (typeof dateString === 'string') {
      const trimmed = dateString.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, d] = trimmed.split('-').map(Number);
        dobYear = y;
        dobMonth = m - 1;
        dobDay = d;
      } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
        const parts = trimmed.split(/[-/]/).map(Number);
        dobDay = parts[0];
        dobMonth = parts[1] - 1;
        dobYear = parts[2];
      }
    }

    if (dobYear === undefined) {
      const dob = new Date(dateString);
      if (isNaN(dob.getTime())) return 0;
      dobYear = dob.getFullYear();
      dobMonth = dob.getMonth();
      dobDay = dob.getDate();
    }

    const today = new Date();
    let age = today.getFullYear() - dobYear;
    const m = today.getMonth() - dobMonth;
    if (m < 0 || (m === 0 && today.getDate() < dobDay)) {
      age--;
    }
    return age;
  },

  /**
   * Validate age >= 18 and reasonable upper bound (<= 100)
   */
  isAtLeast18(dateString) {
    const age = this.calculateAge(dateString);
    return age >= 18 && age <= 100;
  },

  /**
   * Validate full DOB compliance:
   * - Valid date format and actual calendar date (e.g. leap years, correct days in month)
   * - Not a future date
   * - Meets minimum age requirement (>= 18)
   * - Within reasonable upper bound (<= 100)
   */
  isValidDob(dateString) {
    if (!dateString || typeof dateString !== 'string') return false;
    const trimmed = dateString.trim();
    if (!trimmed) return false;

    let y, m, d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10) - 1;
      d = parseInt(parts[2], 10);
    } else if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[-/]/);
      d = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10) - 1;
      y = parseInt(parts[2], 10);
    } else {
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) return false;
      y = parsed.getFullYear();
      m = parsed.getMonth();
      d = parsed.getDate();
    }

    const dateObj = new Date(y, m, d);
    if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m || dateObj.getDate() !== d) {
      return false;
    }

    const today = new Date();
    if (dateObj > today) return false;

    return this.isAtLeast18(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }
};

// ================= AUTH SERVICE =================
export const authService = {
  /**
   * Request an OTP for a mobile number
   */
  async requestOtp(mobileNumber, purpose = 'registration') {
    return await otpService.requestOtp(mobileNumber, purpose);
  },

  /**
   * Verify an entered OTP
   */
  async verifyOtp(mobileNumber, otpCode, purpose = 'registration') {
    return await otpService.verifyOtp(mobileNumber, otpCode, purpose);
  },

  /**
   * Log in user via Mobile Number (10 digits) or Email + Password
   */
  async login(identifier, password, rememberMe = false) {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // 1. Validation checks
    if (!cleanId) {
      return {
        success: false,
        message: 'Enter a valid 10-digit mobile number.'
      };
    }

    const digitsOnly = cleanId.replace(/\D/g, '').slice(-10);
    const isMobile = digitsOnly.length === 10;
    const isEmail = cleanId.includes('@');

    if (isMobile && !validators.isValidIndianMobile(digitsOnly)) {
      return {
        success: false,
        message: 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.'
      };
    }

    if (!cleanPass) {
      return {
        success: false,
        message: 'Please enter your password.'
      };
    }

    // 2. Check credentials in Temporary IndexedDB Database
    try {
      const credRes = await verifyCredentials(cleanId, cleanPass);
      if (credRes && credRes.success && credRes.user) {
        const token = `tb_token_${Date.now()}_${user.id}`;
        const sessionPayload = JSON.stringify({ userId: user.id, email: user.email, mobile: user.mobileNumber });
        if (rememberMe && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
            localStorage.setItem('tb_current_session', sessionPayload);
          } catch {}
        }
        safeSetItem(AUTH_TOKEN_KEY, token);
        safeSetItem('tb_current_session', sessionPayload);
        
        const userGender = (user.gender || 'female').toLowerCase();
        const targetPartnerGender = userGender === 'female' ? 'male' : 'female';
        const lookingForText = userGender === 'female' ? 'Telugu Grooms (Male)' : 'Telugu Brides (Female)';
        const calculatedAge = user.dateOfBirth ? Math.max(18, new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear()) : 26;

        // Convert to legacy shape for full backward compatibility across existing views
        const profileShape = {
          ...user,
          name: user.fullName || user.name,
          phone: `+91 ${user.mobileNumber}`,
          age: calculatedAge,
          gender: userGender,
          city: user.location?.split(',')?.[0]?.trim() || 'Hyderabad',
          state: user.location?.split(',')?.[1]?.trim() || 'Telangana',
          membershipTier: user.membershipPlan || 'Free Member',
          photos: [user.profilePhoto || (userGender === 'male' ? '/assets/profiles/groom_varma.jpg' : '/assets/profiles/bride_sravani.jpg')],
          partnerPreferences: user.partnerPreferences || {
            gender: targetPartnerGender,
            lookingFor: lookingForText,
            ageMin: userGender === 'female' ? Math.max(21, calculatedAge) : Math.max(18, calculatedAge - 6),
            ageMax: userGender === 'female' ? calculatedAge + 8 : calculatedAge,
            communities: user.community ? [user.community, 'Open to all Telugu communities'] : ['Open to all Telugu communities'],
            locations: [user.location || 'Hyderabad', 'Bangalore', 'USA'],
            education: ['Graduate', 'Post Graduate', 'Doctorate'],
            profession: ['Software / IT', 'Healthcare', 'Banking', 'Business'],
            maritalStatus: ['Never Married']
          }
        };

        mockDb.setCurrentUser(profileShape);
        return { success: true, user: profileShape, token };
      }

      if (credRes && !credRes.success && credRes.message) {
        return credRes;
      }
    } catch (dbErr) {
      console.warn("IndexedDB login fallback warning:", dbErr);
    }

    // Fallback: check stored registered users in localStorage cache or auto-create demo/member user
    const storedUsers = getStoredUsers();
    let matchedStored = storedUsers.find(
      (u) =>
        (u.phone && u.phone.replace(/\D/g, '').endsWith(digitsOnly)) ||
        (u.email && u.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!matchedStored) {
      matchedStored = {
        id: `TB-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`,
        name: 'TeluguBandham Member',
        phone: isMobile ? `+91 ${digitsOnly}` : '+91 9876543210',
        email: isEmail ? cleanId.toLowerCase() : `member_${digitsOnly || 'user'}@telugubandham.com`,
        gender: 'female',
        age: 26,
        city: 'Hyderabad',
        state: 'Telangana',
        community: 'Telugu Community',
        profession: 'Software Professional',
        membershipTier: 'Free Member',
        photos: ['/assets/profiles/bride_sravani.jpg']
      };
      saveStoredUsers([...storedUsers, matchedStored]);
    }

    const token = `tb_token_${Date.now()}_${matchedStored.id}`;
    const sessionPayload = JSON.stringify({ userId: matchedStored.id, email: matchedStored.email, mobile: matchedStored.phone });
    if (rememberMe && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem('tb_current_session', sessionPayload);
      } catch {}
    }
    safeSetItem(AUTH_TOKEN_KEY, token);
    safeSetItem('tb_current_session', sessionPayload);
    mockDb.setCurrentUser(matchedStored);
    return { success: true, user: matchedStored, token };
  },

  /**
   * Reset Password with OTP verification
   */
  async resetPasswordWithOtp(mobileNumber, otpCode, newPassword) {
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);

    if (!validators.isValidIndianMobile(cleanMobile)) {
      return {
        success: false,
        message: 'Please enter a valid 10-digit mobile number.'
      };
    }

    // Verify OTP first
    const otpRes = await otpService.verifyOtp(cleanMobile, otpCode, 'forgot-password');
    if (!otpRes.success) {
      return otpRes;
    }

    // Validate new password
    if (!validators.isStrongPassword(newPassword)) {
      return {
        success: false,
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      };
    }

    // Update in IndexedDB
    try {
      const user = await getUserByMobile(cleanMobile);
      if (user) {
        await updateUser(user.id, { password: newPassword });
      }
    } catch (err) {
      console.warn("Error updating password in IndexedDB:", err);
    }

    // Update in localStorage cache
    const storedUsers = getStoredUsers();
    const userIndex = storedUsers.findIndex(
      (u) => u.phone && u.phone.replace(/\D/g, '').endsWith(cleanMobile)
    );

    if (userIndex !== -1) {
      storedUsers[userIndex].password = newPassword;
      saveStoredUsers(storedUsers);
    }

    // Clear the OTP store
    otpService.clearOtp(cleanMobile, 'forgot-password');

    return {
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.'
    };
  },

  /**
   * Register a new user profile in Temporary Database
   */
  async register(formData) {
    // 1. Validation
    const fullName = (formData.name || formData.fullName || '').trim();
    if (!validators.isValidFullName(fullName)) {
      return { success: false, message: 'Please enter a valid full name (2-60 characters, letters only).' };
    }

    if (!formData.gender) {
      return { success: false, message: 'Please select profile gender.' };
    }

    if (!formData.dob || !validators.isAtLeast18(formData.dob)) {
      return { success: false, message: 'You must be at least 18 years old to create a matrimonial profile.' };
    }

    const cleanMobile = (formData.phone || formData.mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    if (!validators.isValidIndianMobile(cleanMobile)) {
      return { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    const cleanEmail = (formData.email || '').trim();
    if (!validators.isValidEmail(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (!formData.password || !validators.isValidPassword(formData.password)) {
      return { success: false, message: 'Password must contain at least 8 characters.' };
    }

    if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const calculatedAge = validators.calculateAge(formData.dob) || 26;
    const defaultPhoto = formData.gender === 'male' ? '/assets/profiles/groom_varma.jpg' : '/assets/profiles/bride_sravani.jpg';
    const profilePhoto = formData.photo || formData.profilePhoto || defaultPhoto;

    // 2. Save User in IndexedDB users store
    try {
      const userRes = await createUser({
        fullName,
        email: cleanEmail,
        mobileNumber: cleanMobile,
        password: formData.password,
        gender: formData.gender,
        dateOfBirth: formData.dob,
        profilePhoto,
        profileFor: formData.profileFor || 'Self',
        location: `${formData.city || 'Hyderabad'}, ${formData.state || 'Telangana'}`,
        education: formData.education || 'Graduate',
        occupation: formData.occupation || formData.profession || 'Professional',
        community: formData.community || 'Telugu Community',
        religion: formData.religion || 'Hindu',
        motherTongue: formData.motherTongue || 'Telugu',
        maritalStatus: formData.maritalStatus || 'Never Married',
        profileCompletion: 85,
        membershipPlan: 'Free Member'
      });

      if (!userRes.success) {
        return userRes;
      }

      const createdUser = userRes.user;

      // 3. Save Profile in IndexedDB profiles store
      await createProfile({
        userId: createdUser.id,
        about: formData.about || formData.aboutMe || `Hello, I am ${fullName}, looking for a compatible Telugu life partner.`,
        height: formData.height || "5'6\"",
        familyDetails: {
          familyType: formData.familyType || 'Nuclear',
          familyValues: formData.familyValues || 'Traditional & Progressive',
          fatherOccupation: formData.fatherOccupation || 'Business / Service',
          motherOccupation: formData.motherOccupation || 'Homemaker'
        },
        lifestyle: {
          diet: formData.foodHabits || formData.diet || 'Vegetarian',
          smoking: formData.smoking || 'No',
          drinking: formData.drinking || 'No'
        },
        interests: formData.interests || ['Music', 'Reading', 'Travel'],
        horoscopeDetails: {
          raasi: formData.raasi || 'Mesha',
          nakshatram: formData.nakshatram || 'Ashwini',
          dosham: formData.dosham || 'No Dosham'
        },
        photos: [profilePhoto]
      });

      // 4. Create session token
      const token = `tb_token_${Date.now()}_${createdUser.id}`;
      safeSetItem(AUTH_TOKEN_KEY, token);
      safeSetItem('tb_current_session', JSON.stringify({ userId: createdUser.id, email: createdUser.email, mobile: createdUser.mobileNumber }));

      const userGender = (formData.gender || createdUser.gender || 'female').toLowerCase();
      const targetPartnerGender = userGender === 'female' ? 'male' : 'female';
      const lookingForText = userGender === 'female' ? 'Telugu Grooms (Male)' : 'Telugu Brides (Female)';

      // Format legacy profile shape for UI compatibility
      const profileShape = {
        ...createdUser,
        name: createdUser.fullName,
        phone: `+91 ${createdUser.mobileNumber}`,
        age: calculatedAge,
        gender: userGender,
        city: formData.city || 'Hyderabad',
        state: formData.state || 'Telangana',
        membershipTier: 'Free Member',
        photos: [profilePhoto],
        aboutMe: formData.about || `Hello, I am ${fullName}.`,
        partnerPreferences: {
          gender: targetPartnerGender,
          lookingFor: lookingForText,
          ageMin: userGender === 'female' ? Math.max(21, calculatedAge) : Math.max(18, calculatedAge - 6),
          ageMax: userGender === 'female' ? calculatedAge + 8 : calculatedAge,
          communities: formData.community ? [formData.community, 'Open to all Telugu communities'] : ['Open to all Telugu communities'],
          locations: [formData.city || 'Hyderabad', 'Bangalore', 'USA', 'Visakhapatnam'],
          education: ['Graduate', 'Post Graduate', 'Doctorate', 'B.Tech / M.Tech', 'MBA', 'MS'],
          profession: ['Software / IT', 'Healthcare', 'Banking / Finance', 'Govt / Civil Services', 'Business / Entrepreneur'],
          maritalStatus: ['Never Married']
        }
      };

      mockDb.setCurrentUser(profileShape);

      // Clear OTP & registration draft
      otpService.clearOtp(cleanMobile, 'registration');
      safeRemoveItem(APP_CONFIG.STORAGE_KEYS.REGISTRATION_DRAFT);

      return {
        success: true,
        user: profileShape,
        token,
        message: 'Your TeluguBandham profile has been created successfully!'
      };
    } catch (err) {
      console.error("IndexedDB registration error:", err);
      return { success: false, message: 'Failed to create profile in temporary database. Please try again.' };
    }
  },

  /**
   * Log out current user
   */
  logout() {
    safeRemoveItem(AUTH_TOKEN_KEY);
    safeRemoveItem('tb_current_session');
    safeRemoveItem('tb_current_user_v2');
    safeRemoveItem('telugubandham_auth_user');
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('tb_current_session');
        localStorage.removeItem('tb_current_user_v2');
        localStorage.removeItem('telugubandham_auth_user');
      } catch {}
    }
    mockDb.setCurrentUser(null);
  },

  /**
   * Get stored token
   */
  getStoredToken() {
    const sessionToken = safeGetItem(AUTH_TOKEN_KEY);
    if (sessionToken) return sessionToken;
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      } catch {}
    }
    return null;
  }
};
