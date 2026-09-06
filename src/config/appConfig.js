/**
 * TeluguBandham Global Application Configuration
 */

export const APP_CONFIG = {
  // Demo Mode Switch
  // When false, demo/fast login options are completely hidden from the UI.
  DEMO_MODE: true,

  // OTP Configuration
  OTP: {
    CODE_LENGTH: 6,
    EXPIRY_SECONDS: 300, // 5 minutes
    RESEND_COOLDOWN_SECONDS: 60, // 60 seconds
    MAX_RESEND_ATTEMPTS: 3,
    DEV_DEFAULT_CODE: '123456'
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'tb_auth_token_v2',
    REGISTERED_USERS: 'tb_registered_users_v2',
    REGISTRATION_DRAFT: 'tb_registration_draft_v2',
    OTP_STORE: 'tb_otp_store_v2',
    LANGUAGE: 'telugubandham-language'
  },

  // Brand Info
  BRAND: {
    NAME: 'TeluguBandham',
    TAGLINE: 'Pure Telugu Matrimony & Trusted Life Partnerships',
    SUPPORT_PHONE: '+91 91234 56789',
    SUPPORT_EMAIL: 'support@telugubandham.com'
  }
};

export const DEMO_MODE = APP_CONFIG.DEMO_MODE;
