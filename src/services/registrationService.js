/**
 * TeluguBandham Registration Service
 * 
 * Manages:
 * - Centralized multi-step registration state
 * - Draft persistence across steps & page refreshes (no plaintext passwords stored)
 * - Granular validation schemas for each step (Basic, Profile, Family, Security)
 * - Helper datasets (Telugu communities, Raasis, Nakshatrams, Educations, Occupations, Incomes, Heights)
 */

import { APP_CONFIG } from '../config/appConfig.js';
import { validators } from './authService.js';

const DRAFT_KEY = APP_CONFIG.STORAGE_KEYS.REGISTRATION_DRAFT;

export const INITIAL_REGISTRATION_DATA = {
  // Step 1: Basic Information
  name: '',
  profileFor: 'Myself',
  gender: '',
  dob: '',
  email: '',
  phone: '',
  isMobileVerified: false,

  // Step 2: Profile Details
  height: "5'6\"",
  maritalStatus: 'Never Married',
  religion: 'Hindu',
  community: '',
  subCaste: '',
  motherTongue: 'Telugu',
  country: 'India',
  state: 'Telangana',
  city: '',
  education: '',
  profession: '',
  company: '',
  income: '₹15 - 25 Lakhs PA',
  aboutMe: '',

  // Step 3: Family Details & Astrology
  fatherOccupation: '',
  motherOccupation: '',
  siblings: '1 Brother',
  familyType: 'Nuclear',
  familyValues: 'Moderate',
  nativePlace: '',
  familyLocation: '',
  aboutFamily: '',
  gothram: '',
  raasi: '',
  nakshatram: '',

  // Step 4: Security & Consents
  password: '',
  confirmPassword: '',
  agreeTerms: false,
  confirmAccurate: false
};

// ================= DATA CONSTANTS =================
export const PROFILE_FOR_OPTIONS = [
  { value: 'Myself', labelEn: 'Myself', labelTe: 'నా కోసం (స్వయంగా)', genderLock: null },
  { value: 'Son', labelEn: 'Son', labelTe: 'కుమారుడు', genderLock: 'male' },
  { value: 'Daughter', labelEn: 'Daughter', labelTe: 'కుమార్తె', genderLock: 'female' },
  { value: 'Brother', labelEn: 'Brother', labelTe: 'సోదరుడు', genderLock: 'male' },
  { value: 'Sister', labelEn: 'Sister', labelTe: 'సోదరి', genderLock: 'female' },
  { value: 'Relative', labelEn: 'Relative', labelTe: 'బంధువు', genderLock: null },
  { value: 'Other', labelEn: 'Other / Friend', labelTe: 'ఇతర / స్నేహితుడు', genderLock: null }
];

export const TELUGU_COMMUNITIES = [
  'Reddy',
  'Kamma',
  'Brahmin - Niyogi',
  'Brahmin - Vaidiki',
  'Brahmin - Smartha / Dravida',
  'Kapu',
  'Arya Vysya',
  'Balija',
  'Padmashali',
  'Velama',
  'Yadav',
  'Mudiraj',
  'Goud',
  'Besta / Fisherman',
  'Munnuru Kapu',
  'Viswabrahmin',
  'Turpu Kapu',
  'Rajaka / Chakali',
  'Nayi Brahmin',
  'SC / ST',
  'Inter-Caste',
  'Other Telugu Community'
];

export const MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Awaiting Divorce',
  'Widowed',
  'Annulled'
];

export const HEIGHT_OPTIONS = [
  { value: "4'10\"", label: "4'10\" (147 cm)" },
  { value: "4'11\"", label: "4'11\" (150 cm)" },
  { value: "5'0\"", label: "5'0\" (152 cm)" },
  { value: "5'1\"", label: "5'1\" (155 cm)" },
  { value: "5'2\"", label: "5'2\" (157 cm)" },
  { value: "5'3\"", label: "5'3\" (160 cm)" },
  { value: "5'4\"", label: "5'4\" (162 cm)" },
  { value: "5'5\"", label: "5'5\" (165 cm)" },
  { value: "5'6\"", label: "5'6\" (168 cm)" },
  { value: "5'7\"", label: "5'7\" (170 cm)" },
  { value: "5'8\"", label: "5'8\" (173 cm)" },
  { value: "5'9\"", label: "5'9\" (175 cm)" },
  { value: "5'10\"", label: "5'10\" (178 cm)" },
  { value: "5'11\"", label: "5'11\" (180 cm)" },
  { value: "6'0\"", label: "6'0\" (183 cm)" },
  { value: "6'1\"", label: "6'1\" (185 cm)" },
  { value: "6'2\"", label: "6'2\" (188 cm)" },
  { value: "6'3\"", label: "6'3\" (190 cm)" }
];

export const EDUCATION_OPTIONS = [
  'B.Tech / B.E.',
  'M.S. / M.Tech',
  'MBA / PGDM',
  'MBBS / M.D. / M.S.',
  'BDS / MDS (Dental)',
  'Chartered Accountant (CA) / CS / CMA',
  'B.Com / B.Sc / B.A.',
  'MCA / BCA',
  'Ph.D. / Doctorate',
  'Law (LLB / LLM)',
  'B.Arch / M.Arch',
  'B.Pharm / M.Pharm',
  'Other Higher Education'
];

export const PROFESSION_OPTIONS = [
  'Software Engineer / Architect',
  'Data Scientist / AI Specialist',
  'Cloud / DevOps Engineer',
  'Doctor / Healthcare Professional',
  'Chartered Accountant / Finance Lead',
  'Civil Services / IAS / IPS / Group-1',
  'Entrepreneur / Business Owner',
  'Professor / Academician',
  'Banking and Financial Services',
  'Defense / Govt Services',
  'Marketing / Product Strategy',
  'Architect / Civil Engineer',
  'Lawyer / Legal Consultant',
  'HR / Operations Leader',
  'Other Professional'
];

export const INCOME_OPTIONS = [
  'Below ₹5 Lakhs PA',
  '₹5 - 10 Lakhs PA',
  '₹10 - 15 Lakhs PA',
  '₹15 - 25 Lakhs PA',
  '₹25 - 50 Lakhs PA',
  '₹50 - 75 Lakhs PA',
  '₹75 Lakhs - 1 Crore PA',
  '₹1 Crore+ PA',
  '$100,000+ USD PA',
  '$150,000+ USD PA',
  '$200,000+ USD PA'
];

export const TELUGU_RAASIS = [
  'Mesham (Aries)',
  'Vrushabham (Taurus)',
  'Mithunam (Gemini)',
  'Karkatakam (Cancer)',
  'Simham (Leo)',
  'Kanya (Virgo)',
  'Thula (Libra)',
  'Vruschikam (Scorpio)',
  'Dhanusu (Sagittarius)',
  'Makaram (Capricorn)',
  'Kumbham (Aquarius)',
  'Meenam (Pisces)',
  "Don't know / Open"
];

export const TELUGU_NAKSHATRAMS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu',
  'Pushyami', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swathi', 'Visakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purvashada',
  'Uttarashada', 'Sravana', 'Dhanishta', 'Satabhisha', 'Purvabhadra', 'Uttarabhadra', 'Revathi',
  "Don't know / Open"
];

// ================= STORAGE HELPERS =================
export const registrationService = {
  /**
   * Load draft data from storage (without passwords)
   */
  getDraftData() {
    if (typeof window === 'undefined') return { ...INITIAL_REGISTRATION_DATA };
    try {
      const stored = sessionStorage.getItem(DRAFT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Security rule: Never read stored passwords from draft storage
        return {
          ...INITIAL_REGISTRATION_DATA,
          ...parsed,
          password: '',
          confirmPassword: ''
        };
      }
    } catch (e) {
      console.warn('Failed to load registration draft', e);
    }
    return { ...INITIAL_REGISTRATION_DATA };
  },

  /**
   * Save registration draft safely (excluding password credentials)
   */
  saveDraftData(data) {
    if (typeof window === 'undefined') return;
    try {
      const sanitized = { ...data };
      delete sanitized.password;
      delete sanitized.confirmPassword;
      const json = JSON.stringify(sanitized);
      sessionStorage.setItem(DRAFT_KEY, json);
    } catch (e) {
      console.warn('Failed to save registration draft', e);
    }
  },

  /**
   * Clear registration draft from storage
   */
  clearDraftData() {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(DRAFT_KEY);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch {}
  },

  // ================= STEP VALIDATION SCHEMAS =================
  /**
   * Validate Step 1: Basic Information
   */
  validateStep1(data) {
    const errors = {};

    if (!data.name || !data.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (!validators.isValidFullName(data.name)) {
      errors.name = 'Full name must be 2-60 characters and contain letters and spaces only.';
    }

    if (!data.profileFor) {
      errors.profileFor = 'Please select who this profile is for.';
    }

    if (!data.gender) {
      errors.gender = 'Please select profile gender.';
    }

    if (!data.dob) {
      errors.dob = 'Date of birth is required.';
    } else if (!validators.isAtLeast18(data.dob)) {
      errors.dob = 'You must be at least 18 years old to create a matrimonial profile.';
    }

    if (!data.email || !data.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validators.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!data.phone || !data.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (!validators.isValidIndianMobile(data.phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.';
    } else if (!data.isMobileVerified) {
      errors.phone = 'Please verify your mobile number via OTP before continuing.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate Step 2: Profile Details
   */
  validateStep2(data) {
    const errors = {};

    if (!data.community) {
      errors.community = 'Please select your Telugu community / caste.';
    }

    if (!data.education) {
      errors.education = 'Please select highest education qualification.';
    }

    if (!data.profession) {
      errors.profession = 'Please select profession / occupation.';
    }

    if (!data.city || !data.city.trim()) {
      errors.city = 'Please enter your current city of residence.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate Step 3: Family Information
   */
  validateStep3(data) {
    const errors = {};
    // Family fields are largely optional/flexible as required by user prompt
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate Step 4: Security & Consent
   */
  validateStep4(data) {
    const errors = {};

    if (!data.password) {
      errors.password = 'Password is required.';
    } else if (!validators.isStrongPassword(data.password)) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!data.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    if (!data.confirmAccurate) {
      errors.confirmAccurate = 'Please confirm that the provided information is accurate.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
