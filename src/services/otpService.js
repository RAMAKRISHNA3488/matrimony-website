/**
 * TeluguBandham OTP (One-Time Password) Service
 * 
 * Production-ready abstraction for SMS & OTP verification:
 * - 6-digit numeric verification code
 * - Expiration management (5 minutes default)
 * - Resend countdown cooldown (60 seconds)
 * - Maximum resend attempts protection (prevent spam)
 * - Clean interface ready for SMS Gateways (Twilio, MSG91, Fast2SMS, AWS SNS, Firebase Auth)
 */

import { APP_CONFIG } from '../config/appConfig.js';

let memoryOtpStore = {};

function getOtpStore() {
  if (typeof sessionStorage === 'undefined') return memoryOtpStore;
  try {
    const raw = sessionStorage.getItem(APP_CONFIG.STORAGE_KEYS.OTP_STORE);
    return raw ? JSON.parse(raw) : memoryOtpStore;
  } catch {
    return memoryOtpStore;
  }
}

function setOtpStore(store) {
  memoryOtpStore = store;
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(APP_CONFIG.STORAGE_KEYS.OTP_STORE, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save OTP store', e);
  }
}

export const otpService = {
  /**
   * Request a 6-digit OTP for a mobile number
   * @param {string} mobileNumber 10-digit Indian mobile number
   * @param {string} purpose 'registration' | 'forgot-password' | 'login'
   */
  async requestOtp(mobileNumber, purpose = 'registration') {
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);

    if (!cleanMobile || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return {
        success: false,
        message: 'Please provide a valid 10-digit Indian mobile number.'
      };
    }

    const store = getOtpStore();
    const key = `${cleanMobile}_${purpose}`;
    const now = Date.now();
    const existing = store[key];

    // Check cooldown if OTP was requested recently
    if (existing && existing.lastRequestedAt) {
      const secondsSinceLast = Math.floor((now - existing.lastRequestedAt) / 1000);
      if (secondsSinceLast < APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS) {
        const remaining = APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS - secondsSinceLast;
        return {
          success: false,
          message: `Please wait ${remaining} seconds before requesting a new OTP.`,
          cooldownRemaining: remaining
        };
      }

      // Check max resend attempts
      if (existing.resendCount >= APP_CONFIG.OTP.MAX_RESEND_ATTEMPTS) {
        // Reset if older than 15 minutes
        if (now - existing.lastRequestedAt < 15 * 60 * 1000) {
          return {
            success: false,
            message: 'Maximum OTP request attempts reached. Please try again after 15 minutes or contact support.',
            isMaxAttempts: true
          };
        }
      }
    }

    // In production, generate random 6-digit number. For dev, use configurable code or randomized with devCode exposed.
    const generatedCode = APP_CONFIG.OTP.DEV_DEFAULT_CODE || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + APP_CONFIG.OTP.EXPIRY_SECONDS * 1000;
    const resendCount = existing && (now - (existing.lastRequestedAt || 0) < 15 * 60 * 1000)
      ? (existing.resendCount || 0) + 1
      : 1;

    store[key] = {
      mobile: cleanMobile,
      purpose,
      code: generatedCode,
      expiresAt,
      lastRequestedAt: now,
      resendCount,
      attempts: 0,
      verified: false
    };

    setOtpStore(store);

    // Simulated network latency
    await new Promise((res) => setTimeout(res, 350));

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}.`,
      demoCode: generatedCode,
      expiresInSeconds: APP_CONFIG.OTP.EXPIRY_SECONDS,
      cooldownSeconds: APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS,
      resendCount,
      maxResends: APP_CONFIG.OTP.MAX_RESEND_ATTEMPTS
    };
  },

  /**
   * Verify an entered 6-digit OTP
   * @param {string} mobileNumber 
   * @param {string} otpCode 
   * @param {string} purpose 
   */
  async verifyOtp(mobileNumber, otpCode, purpose = 'registration') {
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    const cleanCode = (otpCode || '').trim();

    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      };
    }

    const store = getOtpStore();
    const key = `${cleanMobile}_${purpose}`;
    const otpRecord = store[key];
    const now = Date.now();

    await new Promise((res) => setTimeout(res, 250));

    // Universal dev code accepted in development mode
    if (APP_CONFIG.DEMO_MODE && cleanCode === APP_CONFIG.OTP.DEV_DEFAULT_CODE) {
      if (otpRecord) {
        otpRecord.verified = true;
        setOtpStore(store);
      }
      return {
        success: true,
        message: 'Mobile number verified successfully!'
      };
    }

    if (!otpRecord) {
      return {
        success: false,
        message: 'No OTP request found for this mobile number. Please request an OTP.'
      };
    }

    // Check expiry
    if (now > otpRecord.expiresAt) {
      return {
        success: false,
        isExpired: true,
        message: 'OTP has expired. Please request a new OTP code.'
      };
    }

    // Track failed attempts
    otpRecord.attempts = (otpRecord.attempts || 0) + 1;

    if (otpRecord.attempts > 5) {
      delete store[key];
      setOtpStore(store);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      };
    }

    if (otpRecord.code === cleanCode) {
      otpRecord.verified = true;
      setOtpStore(store);
      return {
        success: true,
        message: 'Mobile number verified successfully!'
      };
    }

    setOtpStore(store);
    return {
      success: false,
      message: 'Invalid OTP code. Please check and try again.'
    };
  },

  /**
   * Check if a mobile number has been verified for a purpose
   */
  isVerified(mobileNumber, purpose = 'registration') {
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    const store = getOtpStore();
    const key = `${cleanMobile}_${purpose}`;
    return !!(store[key] && store[key].verified);
  },

  /**
   * Clear OTP record after successful flow completion
   */
  clearOtp(mobileNumber, purpose = 'registration') {
    const cleanMobile = (mobileNumber || '').trim().replace(/\D/g, '').slice(-10);
    const store = getOtpStore();
    const key = `${cleanMobile}_${purpose}`;
    delete store[key];
    setOtpStore(store);
  },

  /**
   * Request a 6-digit Security OTP for an Email address (e.g. Admin Two-Factor Authentication)
   * @param {string} email
   * @param {string} purpose
   */
  async requestEmailOtp(email, purpose = 'admin-login') {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return {
        success: false,
        message: 'Please provide a valid administrator email address.'
      };
    }

    const store = getOtpStore();
    const key = `email_${cleanEmail}_${purpose}`;
    const now = Date.now();
    const existing = store[key];

    // Check cooldown
    if (existing && existing.lastRequestedAt) {
      const secondsSinceLast = Math.floor((now - existing.lastRequestedAt) / 1000);
      if (secondsSinceLast < APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS) {
        const remaining = APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS - secondsSinceLast;
        return {
          success: false,
          message: `Please wait ${remaining}s before requesting a new code.`,
          cooldownRemaining: remaining
        };
      }
    }

    const generatedCode = APP_CONFIG.OTP.DEV_DEFAULT_CODE || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + APP_CONFIG.OTP.EXPIRY_SECONDS * 1000;

    store[key] = {
      email: cleanEmail,
      purpose,
      code: generatedCode,
      expiresAt,
      lastRequestedAt: now,
      attempts: 0,
      verified: false
    };

    setOtpStore(store);

    await new Promise((res) => setTimeout(res, 40));

    return {
      success: true,
      message: `Security OTP sent to ${cleanEmail}.`,
      demoCode: generatedCode,
      expiresInSeconds: APP_CONFIG.OTP.EXPIRY_SECONDS,
      cooldownSeconds: APP_CONFIG.OTP.RESEND_COOLDOWN_SECONDS
    };
  },

  /**
   * Verify an entered 6-digit Email OTP
   * @param {string} email
   * @param {string} otpCode
   * @param {string} purpose
   */
  async verifyEmailOtp(email, otpCode, purpose = 'admin-login') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (otpCode || '').trim();

    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      return {
        success: false,
        message: 'Please enter a valid 6-digit verification code.'
      };
    }

    const store = getOtpStore();
    const key = `email_${cleanEmail}_${purpose}`;
    const otpRecord = store[key];
    const now = Date.now();

    await new Promise((res) => setTimeout(res, 40));

    // Universal dev code accepted in development mode
    if (APP_CONFIG.DEMO_MODE && cleanCode === APP_CONFIG.OTP.DEV_DEFAULT_CODE) {
      if (otpRecord) {
        otpRecord.verified = true;
        setOtpStore(store);
      }
      return {
        success: true,
        message: 'Email security verification successful!'
      };
    }

    if (!otpRecord) {
      return {
        success: false,
        message: 'No OTP request found for this email. Please request a new code.'
      };
    }

    if (now > otpRecord.expiresAt) {
      return {
        success: false,
        isExpired: true,
        message: 'Verification code has expired. Please request a new code.'
      };
    }

    otpRecord.attempts = (otpRecord.attempts || 0) + 1;

    if (otpRecord.attempts > 5) {
      delete store[key];
      setOtpStore(store);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      };
    }

    if (otpRecord.code === cleanCode) {
      otpRecord.verified = true;
      setOtpStore(store);
      return {
        success: true,
        message: 'Email security verification successful!'
      };
    }

    setOtpStore(store);
    return {
      success: false,
      message: 'Invalid verification code. Please check your email and try again.'
    };
  },

  isEmailVerified(email, purpose = 'admin-login') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const store = getOtpStore();
    const key = `email_${cleanEmail}_${purpose}`;
    return !!(store[key] && store[key].verified);
  },

  clearEmailOtp(email, purpose = 'admin-login') {
    const cleanEmail = (email || '').trim().toLowerCase();
    const store = getOtpStore();
    const key = `email_${cleanEmail}_${purpose}`;
    delete store[key];
    setOtpStore(store);
  }
};
