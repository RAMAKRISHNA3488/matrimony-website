// TeluguBandham Storage & Mock Database Layer
// Supports LocalStorage persistence with reactive subscribers

import {
  INITIAL_PROFILES,
  DEFAULT_USER_PROFILE,
  FEMALE_USER_PROFILE,
  INITIAL_INTERESTS,
  INITIAL_SHORTLIST,
  INITIAL_NOTIFICATIONS,
  SUCCESS_STORIES,
  MEMBERSHIP_PLANS,
  INITIAL_VERIFICATIONS_QUEUE,
  INITIAL_REPORTS,
  INITIAL_ADMIN_TEAM,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_MATCHES,
  INITIAL_TRANSACTIONS,
  INITIAL_SYSTEM_SERVICES,
  INITIAL_BACKUP_RECORDS
} from './mockData.js';

const KEYS = {
  PROFILES: 'tb_profiles_v4',
  USERS: 'tb_users_v2',
  CURRENT_USER: 'tb_current_user_v2',
  ADMIN_USER: 'tb_admin_user_v2',
  ADMIN_TEAM: 'tb_admin_team_v2',
  AUDIT_LOGS: 'tb_audit_logs_v2',
  SUPPORT_TICKETS: 'tb_support_tickets_v2',
  MATCHES: 'tb_matches_v2',
  TRANSACTIONS: 'tb_transactions_v2',
  SYSTEM_SERVICES: 'tb_system_services_v2',
  BACKUP_RECORDS: 'tb_backup_records_v2',
  INTERESTS: 'tb_interests_v4',
  SHORTLIST: 'tb_shortlist_v4',
  CONVERSATIONS: 'tb_conversations_v4',
  NOTIFICATIONS: 'tb_notifications_v4',
  STORIES: 'tb_stories_v2',
  PLANS: 'tb_plans_v2',
  VERIFICATIONS: 'tb_verifications_v2',
  REPORTS: 'tb_reports_v2',
  ACTIVITY_STATS: 'tb_activity_stats_v4',
  SYSTEM_SETTINGS: 'tb_system_settings_v2',
  FAQS: 'tb_faqs_v2',
  HERO_BANNER: 'tb_hero_banner_v3',
  HERO_BANNER_DISMISSED: 'tb_hero_banner_dismissed_v3',
  SAFETY_RULES: 'tb_safety_rules_v2'
};

export const DEFAULT_FAQS = [
  {
    id: 'faq-1',
    question: 'How does TeluguBandham verify candidate identity documents?',
    answer: 'Our Trust team manually validates official Government Proof (Aadhaar, Passport, Gazetted IDs) against encrypted government check records.',
    category: 'Trust & Verification',
    isPublished: true,
    views: 1420
  },
  {
    id: 'faq-2',
    question: 'Can I search by specific Telugu community and gothram?',
    answer: 'Yes, TeluguBandham allows precise filtering across 24+ Telugu communities including Kamma, Reddy, Kapu, Arya Vysya, Brahmin, Padmashali, Velama, Yadav, and Mudiraj.',
    category: 'Matchmaking',
    isPublished: true,
    views: 2890
  },
  {
    id: 'faq-3',
    question: 'How does the Vedic Horoscope and Kundali compatibility report work?',
    answer: 'We compute 36 Gunas Vedic compatibility (Ashtakoota Milan) using certified astrological algorithms including Gana, Nadi, and Rasi Koota matching.',
    category: 'Horoscope',
    isPublished: true,
    views: 1950
  },
  {
    id: 'faq-4',
    question: 'Are my phone number and biodata safe from unauthorized public view?',
    answer: 'Yes, phone numbers and horoscope files are completely masked and only shared with matches whose interest you mutually accept, or via verified VIP privacy settings.',
    category: 'Privacy & Security',
    isPublished: true,
    views: 1720
  },
  {
    id: 'faq-5',
    question: 'What are the payment options for Elite VIP and Diamond plans?',
    answer: 'We support UPI (PhonePe, Google Pay, Paytm), RuPay, Net Banking, and major Debit/Credit Cards via 256-bit encrypted Razorpay checkout.',
    category: 'Memberships',
    isPublished: true,
    views: 1310
  },
  {
    id: 'faq-6',
    question: 'How can parents manage matchmaking profiles on behalf of their children?',
    answer: 'Parents can create dedicated Parent-Managed profiles with direct contact preferences, astrologer consultation support, and family meeting coordinator assistance.',
    category: 'General',
    isPublished: true,
    views: 940
  }
];

export const DEFAULT_HERO_BANNER = {
  id: 'banner-1',
  title: 'Ugadi 2026 Special: Premium VIP Matchmaking Discount',
  subtitle: 'Join over 150,000+ verified Telugu brides & grooms with 50% extra contact views and complimentary Astro Kundali reports!',
  badgeText: '',
  ctaText: 'Explore VIP Plans',
  ctaLink: '/membership',
  isActive: false,
  bgColor: 'var(--admin-primary)',
  textColor: '#FFFFFF'
};

export const DEFAULT_SAFETY_RULES = [
  {
    id: 'rule-1',
    title: 'Financial Safeguard',
    description: 'Never send money, UPI transfers, or financial loans to prospective matches or family contacts under any circumstances.',
    severity: 'Critical',
    category: 'Financial Safety'
  },
  {
    id: 'rule-2',
    title: 'In-Person & Video Verification',
    description: 'Always arrange first meetings in public family settings or verify identity through our video meet features before committing.',
    severity: 'High',
    category: 'Meeting Safety'
  },
  {
    id: 'rule-3',
    title: 'Document & Biodata Authenticity',
    description: 'Report suspicious employment, NRI visa, or education claims directly to the TeluguBandham Trust & Safety moderation team.',
    severity: 'High',
    category: 'Profile Verification'
  },
  {
    id: 'rule-4',
    title: 'Privacy & Contact Sharing',
    description: 'Keep early communications within TeluguBandham secure chat until mutual trust and family background checks are established.',
    severity: 'Medium',
    category: 'Privacy'
  }
];

// In-memory fallback map for storage
const memoryStore = new Map();

// Helper to safely read from sessionStorage and localStorage
function readStorage(key, fallback) {
  if (typeof sessionStorage !== 'undefined') {
    try {
      const item = sessionStorage.getItem(key);
      if (item !== null) return JSON.parse(item);
    } catch (err) {
      console.warn(`Error reading key ${key} from sessionStorage:`, err);
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const localItem = localStorage.getItem(key);
      if (localItem !== null) return JSON.parse(localItem);
    } catch {}
  }
  if (memoryStore.has(key)) {
    return memoryStore.get(key);
  }
  return fallback;
}

// Helper to safely write to sessionStorage and localStorage
function writeStorage(key, data) {
  memoryStore.set(key, data);
  const jsonStr = JSON.stringify(data);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(key, jsonStr);
    } catch (err) {
      console.warn(`Error writing key ${key} to sessionStorage:`, err);
    }
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, jsonStr);
    } catch {}
  }
}

// Helper to safely remove key from sessionStorage and localStorage
function removeStorage(key) {
  memoryStore.delete(key);
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

// ==================== REAL-TIME SYNCHRONIZATION EVENT BUS ====================
// Supports both in-window instant callback dispatch and cross-tab BroadcastChannel sync
const subscribers = new Set();
let realtimeChannel = null;

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    realtimeChannel = new BroadcastChannel('telugubandham_realtime');
    realtimeChannel.onmessage = (event) => {
      const data = event.data;
      if (data && data.type) {
        // Clear memoryStore cache so subsequent reads get freshest localStorage data
        memoryStore.clear();
        notifySubscribers(data.type, data.payload, false);
      }
    };
  } catch (e) {
    console.warn("BroadcastChannel initialization fallback:", e);
  }
}

// Storage event listener fallback for cross-tab sync in older browser contexts
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && Object.values(KEYS).includes(e.key)) {
      memoryStore.delete(e.key);
      notifySubscribers('storage_sync', { key: e.key }, false);
    }
  });
}

function notifySubscribers(type, payload = null, broadcast = true) {
  // 1. Notify all active React subscriber callbacks
  subscribers.forEach((callback) => {
    try {
      callback(type, payload);
    } catch (err) {
      console.error("Error in mockDb subscriber callback:", err);
    }
  });

  // 2. Dispatch window-level custom events
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('telugubandham_realtime_event', {
      detail: { type, payload, timestamp: Date.now() }
    }));
    // Dispatch legacy event for backward compatibility with existing views
    window.dispatchEvent(new CustomEvent('telugubandham_content_updated', {
      detail: { type, payload }
    }));
  }

  // 3. Broadcast to all other open browser tabs & windows
  if (broadcast && realtimeChannel) {
    try {
      realtimeChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (err) {
      console.warn("Error posting to realtimeChannel:", err);
    }
  }
}

// Initialize default database state in sessionStorage for active session
export function initDatabase() {
  if (typeof sessionStorage === 'undefined') return;

  // Clear obsolete legacy migration keys if present from v1
  try {
    const obsoleteKeys = [
      'telugubandham_auth_user',
      'tb_hero_banner_dismissed_v2',
      'tb_hero_banner_v2'
    ];
    obsoleteKeys.forEach(k => {
      try {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(k);
      } catch {}
    });
  } catch (e) {
    // Ignore storage errors
  }

  // Ensure all profiles use local South Indian profile assets
  const storedProfiles = readStorage(KEYS.PROFILES, null);
  if (!storedProfiles || !Array.isArray(storedProfiles) || storedProfiles.length < 50) {
    writeStorage(KEYS.PROFILES, INITIAL_PROFILES);
  }

  // Note: KEYS.CURRENT_USER and KEYS.ADMIN_USER are NOT seeded on startup,
  // guaranteeing that first-time visitors start unauthenticated on the public landing page.

  const existingInterests = readStorage(KEYS.INTERESTS, null);
  if (!existingInterests) {
    writeStorage(KEYS.INTERESTS, INITIAL_INTERESTS);
  } else if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(KEYS.INTERESTS)) {
    try {
      sessionStorage.setItem(KEYS.INTERESTS, JSON.stringify(existingInterests));
    } catch {}
  }

  const existingShortlist = readStorage(KEYS.SHORTLIST, null);
  if (!existingShortlist) {
    writeStorage(KEYS.SHORTLIST, INITIAL_SHORTLIST);
  } else if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(KEYS.SHORTLIST)) {
    try {
      sessionStorage.setItem(KEYS.SHORTLIST, JSON.stringify(existingShortlist));
    } catch {}
  }
  const existingConvs = readStorage(KEYS.CONVERSATIONS, null);
  if (!existingConvs) {
    writeStorage(KEYS.CONVERSATIONS, []);
  } else if (Array.isArray(existingConvs)) {
    // Filter out legacy dummy mock conversations and auto-generated interest stubs
    const cleaned = existingConvs.filter(c => {
      if (c.id === 'CONV-01' || c.id === 'CONV-02') return false;
      const isAutoInterestConv = Array.isArray(c.messages) && c.messages.length === 1 && (
        c.messages[0]?.text?.includes('Namaskaram! I am interested') ||
        c.messages[0]?.text?.includes('I viewed your profile and would love to connect')
      );
      if (isAutoInterestConv) return false;
      return true;
    });
    if (cleaned.length !== existingConvs.length) {
      writeStorage(KEYS.CONVERSATIONS, cleaned);
    }
  }
  if (!sessionStorage.getItem(KEYS.NOTIFICATIONS)) {
    writeStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!sessionStorage.getItem(KEYS.STORIES)) {
    writeStorage(KEYS.STORIES, SUCCESS_STORIES);
  }
  if (!sessionStorage.getItem(KEYS.PLANS)) {
    writeStorage(KEYS.PLANS, MEMBERSHIP_PLANS);
  }
  if (!sessionStorage.getItem(KEYS.VERIFICATIONS)) {
    writeStorage(KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS_QUEUE);
  }
  if (!sessionStorage.getItem(KEYS.REPORTS)) {
    writeStorage(KEYS.REPORTS, INITIAL_REPORTS);
  }
  if (!sessionStorage.getItem(KEYS.ADMIN_TEAM)) {
    writeStorage(KEYS.ADMIN_TEAM, INITIAL_ADMIN_TEAM);
  }
  if (!sessionStorage.getItem(KEYS.AUDIT_LOGS)) {
    writeStorage(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  if (!sessionStorage.getItem(KEYS.SUPPORT_TICKETS)) {
    writeStorage(KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
  }
  if (!sessionStorage.getItem(KEYS.MATCHES)) {
    writeStorage(KEYS.MATCHES, INITIAL_MATCHES);
  }
  if (!sessionStorage.getItem(KEYS.TRANSACTIONS)) {
    writeStorage(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }
  if (!sessionStorage.getItem(KEYS.SYSTEM_SERVICES)) {
    writeStorage(KEYS.SYSTEM_SERVICES, INITIAL_SYSTEM_SERVICES);
  }
  if (!sessionStorage.getItem(KEYS.BACKUP_RECORDS)) {
    writeStorage(KEYS.BACKUP_RECORDS, INITIAL_BACKUP_RECORDS);
  }
  if (!sessionStorage.getItem(KEYS.FAQS)) {
    writeStorage(KEYS.FAQS, DEFAULT_FAQS);
  }
  if (!sessionStorage.getItem(KEYS.HERO_BANNER)) {
    writeStorage(KEYS.HERO_BANNER, DEFAULT_HERO_BANNER);
  }
  if (!sessionStorage.getItem(KEYS.SAFETY_RULES)) {
    writeStorage(KEYS.SAFETY_RULES, DEFAULT_SAFETY_RULES);
  }
  if (!sessionStorage.getItem(KEYS.SYSTEM_SETTINGS)) {
    writeStorage(KEYS.SYSTEM_SETTINGS, {
      siteName: "TeluguBandham Matrimony",
      supportEmail: "support@telugubandham.com",
      helplinePhone: "+91 98480 22334",
      maintenanceMode: false,
      requireTwoFactor: true,
      autoApproveGovtID: false,
      maxDailyContactViews: 25,
      chatSafetyFilterStrict: true,
      smtpHost: "email-smtp.ap-south-1.amazonaws.com",
      smsGatewayProvider: "Twilio / Karix SMS Gateway",
      paymentGateway: "Razorpay (Production Mode)",
      backupFrequency: "Daily at 04:00 AM IST"
    });
  }
  if (!sessionStorage.getItem(KEYS.ACTIVITY_STATS)) {
    writeStorage(KEYS.ACTIVITY_STATS, {
      profileViews: 0,
      todayViews: 0,
      interestsReceivedCount: 0,
      shortlistedByCount: 0,
      contactViewsRemaining: 50
    });
  }
}

// Run initialization immediately on load
initDatabase();

export const mockDb = {
  // ==================== REAL-TIME SUBSCRIPTION ====================
  subscribe(callback) {
    if (typeof callback === 'function') {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }
    return () => {};
  },

  notify(type, payload = null) {
    notifySubscribers(type, payload, true);
  },

  // ==================== AUTH & SESSION ====================
  getCurrentUser() {
    return readStorage(KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user) {
    if (user) {
      writeStorage(KEYS.CURRENT_USER, user);
    } else {
      removeStorage(KEYS.CURRENT_USER);
    }
    this.notify('user_updated', user);
  },

  getAdminUser() {
    return readStorage(KEYS.ADMIN_USER, null);
  },

  setAdminUser(admin) {
    if (admin) {
      writeStorage(KEYS.ADMIN_USER, admin);
    } else {
      removeStorage(KEYS.ADMIN_USER);
    }
  },

  switchPersona(personaType) {
    const type = String(personaType || '').toLowerCase();
    if (type === 'male' || type === 'groom') {
      this.setCurrentUser(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    } else if (type === 'female' || type === 'bride') {
      this.setCurrentUser(FEMALE_USER_PROFILE);
      return FEMALE_USER_PROFILE;
    }
    this.setCurrentUser(DEFAULT_USER_PROFILE);
    return DEFAULT_USER_PROFILE;
  },

  // ==================== PROFILES ====================
  getProfiles() {
    return readStorage(KEYS.PROFILES, INITIAL_PROFILES);
  },

  getProfileById(id) {
    const currentUser = this.getCurrentUser();
    const cleanId = String(id || '').trim();
    if (cleanId === 'me' || (currentUser && (currentUser.id === cleanId || String(currentUser.id) === cleanId))) {
      return currentUser;
    }
    const profiles = this.getProfiles();
    const found = profiles.find(p => p.id === cleanId || String(p.id) === cleanId);
    return found || currentUser || null;
  },

  updateCurrentUserProfile(updatedData) {
    const current = this.getCurrentUser() || {};
    const merged = { ...current, ...updatedData, lastActive: "Active just now" };
    this.setCurrentUser(merged);
    
    // Also update in profiles list if present
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === merged.id);
    if (idx !== -1) {
      profiles[idx] = merged;
      writeStorage(KEYS.PROFILES, profiles);
    }
    this.notify('user_updated', merged);
    this.notify('profiles', { profileId: merged.id, updatedData: merged, profile: merged });
    return merged;
  },

  adminUpdateProfile(profileId, updatedData) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profileId || String(p.id) === String(profileId));
    let updatedProfile = null;
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updatedData };
      writeStorage(KEYS.PROFILES, profiles);
      updatedProfile = profiles[idx];
    }
    const currentUser = this.getCurrentUser();
    if (currentUser && (currentUser.id === profileId || String(currentUser.id) === String(profileId))) {
      const merged = { ...currentUser, ...updatedData };
      this.setCurrentUser(merged);
      updatedProfile = merged;
      this.notify('user_updated', merged);
    }
    this.notify('profiles', { profileId, updatedData, profile: updatedProfile });
    return updatedProfile;
  },

  adminCreateProfile(profileData) {
    const profiles = this.getProfiles();
    const newId = profileData.id || `TB-${Math.floor(10000 + Math.random() * 90000)}`;
    const newProfile = {
      id: newId,
      name: profileData.name || 'New Member',
      gender: profileData.gender || 'male',
      age: Number(profileData.age) || 27,
      community: profileData.community || 'Telugu Community',
      subCaste: profileData.subCaste || '',
      city: profileData.city || 'Hyderabad',
      state: profileData.state || 'Telangana',
      country: profileData.country || 'India',
      profession: profileData.profession || 'Software Professional',
      company: profileData.company || 'Tech Company',
      education: profileData.education || 'B.Tech / MCA',
      maritalStatus: profileData.maritalStatus || 'Never Married',
      height: profileData.height || "5' 8\"",
      income: profileData.income || "18-25 Lakhs",
      membershipTier: profileData.membershipTier || 'Free Member',
      isVerified: Boolean(profileData.isVerified),
      isSuspended: Boolean(profileData.isSuspended),
      trustScore: profileData.isVerified ? 98 : 75,
      photos: profileData.photos && profileData.photos.length > 0 ? profileData.photos : [
        profileData.gender === 'female'
          ? '/assets/profiles/female/Female_Profile_01.jpg'
          : '/assets/profiles/male/Male_Profile_01.jpg'
      ],
      about: profileData.about || `Hello, I am ${profileData.name || 'a member'}, looking for a compatible Telugu life partner.`,
      createdAt: new Date().toISOString(),
      lastActive: "Active today"
    };
    const updated = [newProfile, ...profiles];
    writeStorage(KEYS.PROFILES, updated);
    this.notify('profiles', { newProfile });
    return newProfile;
  },

  adminDeleteProfile(profileId) {
    const profiles = this.getProfiles().filter(p => p.id !== profileId && String(p.id) !== String(profileId));
    writeStorage(KEYS.PROFILES, profiles);
    this.notify('profiles', { deletedId: profileId });
    return true;
  },

  adminToggleUserStatus(profileId, isSuspended) {
    return this.adminUpdateProfile(profileId, { isSuspended });
  },

  adminVerifyUser(profileId, isVerified) {
    return this.adminUpdateProfile(profileId, { isVerified, trustScore: isVerified ? 98 : 70 });
  },

  // ==================== INTERESTS ====================
  getInterests() {
    return readStorage(KEYS.INTERESTS, INITIAL_INTERESTS);
  },

  getInterestsForUser(userId) {
    if (!userId) {
      const curr = this.getCurrentUser();
      userId = curr?.id || 'TB-USER-01';
    }
    const all = this.getInterests();
    const userStr = String(userId).trim().toLowerCase();
    const isPrimaryDemo = userStr === 'tb-user-01' || userStr === '1' || userStr === 'me' || userStr === 'siddharth';

    return {
      received: all.filter(i => {
        const recId = String(i.receiverId || i.targetId || i.recipientId || '').trim().toLowerCase();
        return recId === userStr || (isPrimaryDemo && (recId === 'tb-user-01' || recId === '1'));
      }),
      sent: all.filter(i => {
        const sndId = String(i.senderId || i.userId || i.senderProfileId || '').trim().toLowerCase();
        return sndId === userStr || (isPrimaryDemo && (sndId === 'tb-user-01' || sndId === '1' || sndId === 'tb-user-02'));
      })
    };
  },

  sendInterest({ sender, receiver, message = "Namaskaram! I am interested in your profile." }) {
    if (!sender) {
      sender = this.getCurrentUser() || DEFAULT_USER_PROFILE;
    }
    if (!receiver) return { success: false, message: "Invalid candidate profile." };
    const senderId = String(sender.id || sender.userId || 'TB-USER-01');
    const receiverId = String(receiver.id || receiver.userId || receiver.profileId || '');
    if (!receiverId) return { success: false, message: "Invalid candidate profile ID." };

    const interests = this.getInterests();
    const existingIdx = interests.findIndex(
      i => String(i.senderId).toLowerCase() === senderId.toLowerCase() &&
           String(i.receiverId || i.targetId || '').toLowerCase() === receiverId.toLowerCase()
    );

    if (existingIdx !== -1) {
      // Refresh message and timestamp if already exists, and return success
      interests[existingIdx].message = message || interests[existingIdx].message;
      interests[existingIdx].updatedAt = new Date().toISOString();
      writeStorage(KEYS.INTERESTS, interests);
      this.notify('interests', { action: 'updated', interest: interests[existingIdx] });
      return { success: true, interest: interests[existingIdx], alreadyExisted: true };
    }

    // Enrich candidate profile details if receiver is partial
    const allProfiles = this.getProfiles();
    const foundProfile = allProfiles.find(
      p => String(p.id).toLowerCase() === receiverId.toLowerCase() ||
           (p.name && receiver.name && p.name.trim().toLowerCase() === receiver.name.trim().toLowerCase())
    );
    const candidate = foundProfile ? { ...foundProfile, ...receiver } : receiver;

    const defaultReceiverAvatar = candidate.gender === 'male'
      ? '/assets/profiles/male/Male_Profile_01.jpg'
      : '/assets/profiles/female/Female_Profile_01.jpg';

    const defaultSenderAvatar = sender.gender === 'female'
      ? '/assets/profiles/female/Female_Profile_01.jpg'
      : '/assets/profiles/male/Male_Profile_01.jpg';

    const newInterest = {
      id: `INT-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      senderId: String(senderId),
      senderName: sender.name || sender.fullName || "Member",
      senderPhoto: (sender.photos && sender.photos[0]) || defaultSenderAvatar,
      senderAge: sender.age || 28,
      senderProfession: sender.profession || sender.occupation || "Professional",
      senderCity: sender.city || "Hyderabad",
      senderCommunity: sender.community || "Telugu Community",
      receiverId: String(receiverId),
      receiverName: candidate.name || candidate.fullName || "Member",
      receiverPhoto: (candidate.photos && candidate.photos[0]) || candidate.avatar || defaultReceiverAvatar,
      receiverAge: candidate.age || 26,
      receiverProfession: candidate.profession || candidate.occupation || "Professional",
      receiverCity: candidate.city || "Hyderabad",
      receiverCommunity: candidate.community || "Telugu Community",
      receiverEducation: candidate.education || "Higher Education",
      receiverState: candidate.state || "Telangana",
      status: "pending",
      message: message || "Namaskaram! I am interested in connecting with your profile.",
      createdAt: new Date().toISOString()
    };

    interests.unshift(newInterest);
    writeStorage(KEYS.INTERESTS, interests);

    // Trigger notification for the sender
    this.addNotification({
      userId: String(senderId),
      type: "interest_sent",
      title: "Interest Sent 💕",
      message: `You expressed interest in ${candidate.name || 'a member'}.`,
      link: "/interests?tab=sent",
      avatar: (candidate.photos && candidate.photos[0]) || defaultReceiverAvatar
    });

    this.notify('interests', { action: 'sent', interest: newInterest });
    return { success: true, interest: newInterest };
  },

  updateInterestStatus(interestId, newStatus) {
    const interests = this.getInterests();
    const idx = interests.findIndex(i => String(i.id).toLowerCase() === String(interestId).toLowerCase());
    if (idx !== -1) {
      interests[idx].status = newStatus;
      interests[idx].respondedAt = new Date().toISOString();
      writeStorage(KEYS.INTERESTS, interests);

      // If accepted, also create or activate conversation
      if (newStatus === 'accepted') {
        const item = interests[idx];
        this.addNotification({
          userId: String(item.senderId),
          type: "interest_accepted",
          title: "Interest Accepted! 🎉",
          message: `${item.receiverName || item.senderName} accepted your interest. You can now chat!`,
          link: "/messages",
          avatar: item.receiverPhoto || item.senderPhoto
        });
      }

      this.notify('interests', { action: 'status_changed', status: newStatus, interest: interests[idx] });
      return interests[idx];
    }
    return null;
  },

  withdrawInterest(targetIdOrInterestId) {
    if (!targetIdOrInterestId) return false;
    const targetStr = String(targetIdOrInterestId).trim().toLowerCase();
    const interests = this.getInterests().filter(
      i => String(i.id).toLowerCase() !== targetStr &&
           String(i.receiverId || i.targetId || '').toLowerCase() !== targetStr
    );
    writeStorage(KEYS.INTERESTS, interests);
    this.notify('interests', { action: 'withdrawn', targetId: targetIdOrInterestId });
    return true;
  },

  // ==================== SHORTLIST ====================
  getShortlist() {
    return readStorage(KEYS.SHORTLIST, INITIAL_SHORTLIST);
  },

  toggleShortlist(profileId, note = "") {
    const list = this.getShortlist();
    const idx = list.findIndex(s => s.profileId === profileId);
    let isShortlisted = false;

    if (idx !== -1) {
      list.splice(idx, 1);
      isShortlisted = false;
    } else {
      list.unshift({
        profileId,
        addedAt: new Date().toISOString(),
        note: note || "Added to shortlist"
      });
      isShortlisted = true;
    }

    writeStorage(KEYS.SHORTLIST, list);
    this.notify('shortlist', { profileId, isShortlisted });
    return { isShortlisted, count: list.length };
  },

  isProfileShortlisted(profileId) {
    const list = this.getShortlist();
    return list.some(s => s.profileId === profileId);
  },

  // ==================== CONVERSATIONS & CHAT ====================
  getConversations() {
    const list = readStorage(KEYS.CONVERSATIONS, []);
    if (!Array.isArray(list)) return [];
    return list
      .filter(c => c.id !== 'CONV-01' && c.id !== 'CONV-02')
      .map(c => {
        if (Array.isArray(c.messages)) {
          c.messages = c.messages.map(m => {
            const isCandidateReply =
              m.text?.includes("discuss this with my parents") ||
              m.text?.includes("plan a family call") ||
              m.text?.includes("family values and horoscopes") ||
              m.text?.includes("had a look at your bio-data") ||
              m.senderId === c.participantId;
            return {
              ...m,
              senderId: isCandidateReply ? (c.participantId || 'candidate') : (m.senderId || 'TB-USER-01')
            };
          });
        }
        return c;
      });
  },

  getConversationsForUser(userId) {
    const all = this.getConversations();
    if (!userId) return [];
    // Only return conversations if this user is a participant
    return all.filter(c => c.userId === userId || c.senderId === userId || c.participantId === userId || (userId === 'TB-USER-01' && !c.userId));
  },

  getNotificationsForUser(userId) {
    const all = this.getNotifications();
    if (!userId) return [];
    return all.filter(n => n.userId === userId || (userId === 'TB-USER-01' && !n.userId));
  },

  getConversationById(convId) {
    const convs = this.getConversations();
    return convs.find(c => c.id === convId) || null;
  },

  getOrCreateConversation(currentUser, targetProfile) {
    const convs = this.getConversations();
    const targetId = String(targetProfile?.id || targetProfile?.profileId || targetProfile?.userId || '');
    const currentUserId = currentUser?.id || 'TB-USER-01';

    const existing = convs.find(c => {
      const cPartId = String(c.participantId || '').toLowerCase();
      const tPartId = targetId.toLowerCase();
      const matchId = targetId && cPartId === tPartId;
      const matchName = targetProfile?.name && c.participantName && c.participantName.trim().toLowerCase() === targetProfile.name.trim().toLowerCase();
      return matchId || matchName;
    });

    if (existing) {
      return existing;
    }

    const defaultPhoto = targetProfile?.gender === 'male'
      ? '/assets/profiles/male/Male_Profile_01.jpg'
      : '/assets/profiles/female/Female_Profile_01.jpg';

    const photo = (Array.isArray(targetProfile?.photos) && targetProfile.photos[0]) ||
      targetProfile?.photo ||
      targetProfile?.avatar ||
      defaultPhoto;

    const newConv = {
      id: `CONV-${Date.now()}`,
      userId: currentUserId,
      participantId: targetId || `TB-${Date.now()}`,
      participantName: targetProfile?.name || targetProfile?.fullName || 'Telugu Member',
      participantPhoto: photo,
      participantProfession: targetProfile?.profession || targetProfile?.occupation || 'Professional',
      isOnline: true,
      lastMessage: "Connected on TeluguBandham",
      lastMessageTime: "Just now",
      unreadCount: 0,
      messages: [
        {
          id: `M-${Date.now()}`,
          senderId: currentUserId,
          text: `Namaskaram ${targetProfile?.name || 'there'}! Great to connect with you on TeluguBandham. 🙏`,
          time: "Just now"
        }
      ]
    };

    convs.unshift(newConv);
    writeStorage(KEYS.CONVERSATIONS, convs);
    notifySubscribers('conversations', { conversation: newConv });
    return newConv;
  },

  sendMessage(convId, senderId, text, attachment = null) {
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === convId);
    if (idx !== -1) {
      const newMsg = {
        id: `M-${Date.now()}`,
        senderId,
        text: text || '',
        time: "Just now",
        attachment: attachment || null
      };
      convs[idx].messages.push(newMsg);
      convs[idx].lastMessage = text || (attachment ? `Attached ${attachment.name || attachment.title || 'file'}` : '');
      convs[idx].lastMessageTime = "Just now";
      writeStorage(KEYS.CONVERSATIONS, convs);
      return { success: true, message: newMsg, conversation: convs[idx] };
    }
    return { success: false };
  },

  clearChatHistory(convId) {
    const convs = this.getConversations();
    const idx = convs.findIndex(c => c.id === convId);
    if (idx !== -1) {
      convs[idx].messages = [];
      convs[idx].lastMessage = "Chat history cleared";
      convs[idx].lastMessageTime = "Just now";
      writeStorage(KEYS.CONVERSATIONS, convs);
      notifySubscribers('conversations', { action: 'cleared', convId });
      return { success: true, conversation: convs[idx] };
    }
    return { success: false };
  },

  deleteConversation(convId) {
    let convs = this.getConversations();
    const targetConv = convs.find(c => c.id === convId);
    const participantId = targetConv?.participantId;
    const participantName = targetConv?.participantName;

    convs = convs.filter(c => c.id !== convId);
    writeStorage(KEYS.CONVERSATIONS, convs);

    // Also remove associated interest records so the profile resets and user can start messaging fresh
    if (participantId || participantName) {
      let interests = this.getInterests();
      if (Array.isArray(interests)) {
        interests = interests.filter(
          i =>
            i.receiverId !== participantId &&
            i.senderId !== participantId &&
            String(i.receiverId || '').toLowerCase() !== String(participantId || '').toLowerCase() &&
            String(i.senderId || '').toLowerCase() !== String(participantId || '').toLowerCase() &&
            i.receiverName !== participantName &&
            i.senderName !== participantName
        );
        writeStorage(KEYS.INTERESTS, interests);
      }
      notifySubscribers('interests', { action: 'deleted_with_conversation', participantId });
    }

    notifySubscribers('conversations', { action: 'deleted', convId, participantId });
    return { success: true, conversations: convs, participantId };
  },

  // ==================== NOTIFICATIONS ====================
  getNotifications() {
    return readStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  markNotificationRead(notifId) {
    const list = this.getNotifications();
    const item = list.find(n => n.id === notifId);
    if (item) {
      item.read = true;
      writeStorage(KEYS.NOTIFICATIONS, list);
      this.notify('notifications', { notifId, action: 'read' });
    }
    return list;
  },

  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    writeStorage(KEYS.NOTIFICATIONS, list);
    this.notify('notifications', { action: 'mark_all_read' });
    return list;
  },

  addNotification(notifData) {
    const list = this.getNotifications();
    const newNotif = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time: "Just now",
      read: false,
      ...notifData
    };
    list.unshift(newNotif);
    writeStorage(KEYS.NOTIFICATIONS, list);
    this.notify('notifications', newNotif);
    return newNotif;
  },

  // ==================== VERIFICATION MANAGEMENT (ADMIN) ====================
  getVerifications() {
    return readStorage(KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS_QUEUE);
  },

  submitVerification(user, docType, docPreview) {
    const queue = this.getVerifications();
    const newEntry = {
      id: `VERIF-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userCity: user.city,
      documentType: docType,
      documentPreview: docPreview,
      documentImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
      submittedAt: new Date().toISOString(),
      status: "Pending",
      notes: "Submitted through user settings."
    };
    queue.unshift(newEntry);
    writeStorage(KEYS.VERIFICATIONS, queue);
    this.notify('verifications', newEntry);
    return newEntry;
  },

  reviewVerification(verifId, status, reviewNotes) {
    const queue = this.getVerifications();
    const item = queue.find(v => v.id === verifId);
    if (item) {
      item.status = status;
      item.reviewNotes = reviewNotes;
      item.reviewedAt = new Date().toISOString();
      writeStorage(KEYS.VERIFICATIONS, queue);

      // If approved, verify the user
      if (status === 'Approved') {
        this.adminVerifyUser(item.userId, true);
        this.addNotification({
          type: "verification_success",
          title: "Profile Verified ✅",
          message: "Your profile verification request was approved by the Trust team.",
          link: "/profile/edit"
        });
      } else if (status === 'Rejected') {
        this.adminVerifyUser(item.userId, false);
      }
      this.notify('verifications', { verifId, status, item });
      return item;
    }
    return null;
  },

  // ==================== REPORTS & MODERATION ====================
  getReports() {
    const raw = readStorage(KEYS.REPORTS, INITIAL_REPORTS);
    const profiles = this.getProfiles();
    const fallbackPhotos = [
      '/assets/profiles/male/Male_Profile_01.jpg',
      '/assets/profiles/male/Male_Profile_02.jpg',
      '/assets/profiles/female/Female_Profile_02.jpg',
      '/assets/profiles/male/Male_Profile_03.jpg',
      '/assets/profiles/female/Female_Profile_04.jpg',
      '/assets/profiles/male/Male_Profile_05.jpg'
    ];

    // Guarantee each report has a valid profile image
    return raw.map((r, idx) => {
      let photo = r.reportedUserPhoto;
      if (!photo || photo.trim() === '' || photo.includes('undefined')) {
        const found = profiles.find(p => p.id === r.reportedUserId || p.name?.toLowerCase() === r.reportedUserName?.toLowerCase());
        photo = (found && found.photos && found.photos[0]) || fallbackPhotos[idx % fallbackPhotos.length];
      }
      return {
        ...r,
        reportedUserPhoto: photo
      };
    });
  },

  submitReport({ reportedProfile, reporter, category, reason }) {
    const reports = this.getReports();
    const profiles = this.getProfiles();
    const found = profiles.find(p => p.id === reportedProfile.id || p.name?.toLowerCase() === reportedProfile.name?.toLowerCase());

    const photo = (reportedProfile.photos && reportedProfile.photos[0]) ||
                  (found && found.photos && found.photos[0]) ||
                  '/assets/profiles/male/Male_Profile_02.jpg';

    const newReport = {
      id: `REP-${Date.now()}`,
      reportedUserId: reportedProfile.id || `TB-${Math.floor(1000 + Math.random() * 9000)}`,
      reportedUserName: reportedProfile.name || 'Reported Member',
      reportedUserPhoto: photo,
      reportedBy: `${reporter.name} (${reporter.id || 'TB-USER'})`,
      category,
      reason,
      status: "Under Review",
      reportedAt: new Date().toISOString(),
      actionTaken: null
    };
    reports.unshift(newReport);
    writeStorage(KEYS.REPORTS, reports);
    this.notify('reports', newReport);
    return newReport;
  },

  moderateReport(reportId, action, notes) {
    const reports = this.getReports();
    const item = reports.find(r => r.id === reportId);
    if (item) {
      item.status = action === 'dismiss' ? 'Dismissed' : 'Suspended';
      item.actionTaken = notes || (action === 'dismiss' ? 'Report dismissed after review' : 'User account suspended');
      item.resolvedAt = new Date().toISOString();
      writeStorage(KEYS.REPORTS, reports);

      if (action === 'suspend') {
        this.adminToggleUserStatus(item.reportedUserId, true);
      }
      this.notify('reports', { reportId, action, item });
      return item;
    }
    return null;
  },

  // ==================== CONTENT & SUCCESS STORIES ====================
  getStories() {
    return readStorage(KEYS.STORIES, SUCCESS_STORIES);
  },

  addStory(story) {
    const stories = this.getStories();
    const newStory = {
      id: `STORY-${Date.now()}`,
      featured: story.featured !== undefined ? story.featured : true,
      ...story
    };
    stories.unshift(newStory);
    writeStorage(KEYS.STORIES, stories);
    this.notify('stories', { stories, newStory });
    return newStory;
  },

  updateStory(storyId, updated) {
    const stories = this.getStories();
    const idx = stories.findIndex(s => s.id === storyId);
    if (idx !== -1) {
      stories[idx] = { ...stories[idx], ...updated };
      writeStorage(KEYS.STORIES, stories);
      this.notify('stories', { stories, updatedStory: stories[idx] });
      return stories[idx];
    }
    return null;
  },

  deleteStory(storyId) {
    const stories = this.getStories().filter(s => s.id !== storyId);
    writeStorage(KEYS.STORIES, stories);
    this.notify('stories', { stories, deletedId: storyId });
    return true;
  },

  toggleStoryFeatured(storyId) {
    const stories = this.getStories();
    const item = stories.find(s => s.id === storyId);
    if (item) {
      item.featured = !item.featured;
      writeStorage(KEYS.STORIES, stories);
      this.notify('stories', { stories, updatedStory: item });
      return item;
    }
    return null;
  },

  // ==================== MEMBERSHIP PLANS ====================
  getPlans() {
    return readStorage(KEYS.PLANS, MEMBERSHIP_PLANS);
  },

  updatePlan(planId, updatedData) {
    const plans = this.getPlans();
    const idx = plans.findIndex(p => p.id === planId);
    if (idx !== -1) {
      plans[idx] = { ...plans[idx], ...updatedData };
      writeStorage(KEYS.PLANS, plans);
      this.notify('plans', { plans, updatedPlan: plans[idx] });
      return plans[idx];
    }
    return null;
  },

  addPlan(planData) {
    const plans = this.getPlans();
    const newPlan = {
      id: `plan_${Date.now()}`,
      name: planData.name || 'Custom VIP Plan',
      price: Number(planData.price) || 2999,
      period: planData.period || '3 Months',
      tagline: planData.tagline || 'Special membership tier',
      popular: Boolean(planData.popular),
      features: Array.isArray(planData.features) ? planData.features : [
        "Verified Mobile & WhatsApp Contact Views",
        "Unlimited Direct Messaging & Chat",
        "Vedic Horoscope & Kundali Compatibility Reports"
      ]
    };
    if (newPlan.popular) {
      plans.forEach(p => { p.popular = false; });
    }
    const updated = [...plans, newPlan];
    writeStorage(KEYS.PLANS, updated);
    this.notify('plans', { plans: updated, newPlan });
    return newPlan;
  },

  deletePlan(planId) {
    if (planId === 'plan_free' || planId === 'plan_gold') {
      return false;
    }
    const plans = this.getPlans().filter(p => p.id !== planId);
    writeStorage(KEYS.PLANS, plans);
    this.notify('plans', { plans });
    return true;
  },

  togglePlanPopular(planId) {
    const plans = this.getPlans();
    plans.forEach(p => {
      p.popular = p.id === planId ? !p.popular : false;
    });
    writeStorage(KEYS.PLANS, plans);
    this.notify('plans', { plans });
    return plans.find(p => p.id === planId);
  },

  upgradeMembership(planId) {
    const plans = this.getPlans();
    const selected = plans.find(p => p.id === planId) || plans[1];
    const updated = this.updateCurrentUserProfile({
      membershipTier: selected.name,
      isPremium: selected.price > 0
    });

    this.addNotification({
      type: "membership_upgrade",
      title: "Membership Activated! 👑",
      message: `Congratulations! Your ${selected.name} is now active. Enjoy premium matchmaking benefits.`,
      link: "/membership"
    });

    return updated;
  },

  // ==================== STATS & ANALYTICS ====================
  getActivityStats() {
    return readStorage(KEYS.ACTIVITY_STATS, {
      profileViews: 0,
      todayViews: 0,
      interestsReceivedCount: 0,
      shortlistedByCount: 0,
      contactViewsRemaining: 50
    });
  },

  // ==================== ADMIN TEAM MANAGEMENT (RBAC) ====================
  getAdminTeam() {
    return readStorage(KEYS.ADMIN_TEAM, INITIAL_ADMIN_TEAM);
  },

  addAdminMember(memberData) {
    const team = this.getAdminTeam();
    const newMember = {
      id: `ADM-${String(team.length + 1).padStart(3, '0')}`,
      status: "Active",
      twoFactorEnabled: true,
      lastLogin: "Never",
      permissions: memberData.permissions || ["USER_MODERATION"],
      ...memberData
    };
    team.push(newMember);
    writeStorage(KEYS.ADMIN_TEAM, team);
    this.addAuditLog({
      action: "Created Admin Account",
      target: `${newMember.name} (${newMember.role})`,
      targetType: "Admin Account",
      details: `New administrator assigned ${newMember.role} role with permissions.`
    });
    return newMember;
  },

  updateAdminMember(adminId, updatedData) {
    const team = this.getAdminTeam();
    const idx = team.findIndex(a => a.id === adminId);
    if (idx !== -1) {
      team[idx] = { ...team[idx], ...updatedData };
      writeStorage(KEYS.ADMIN_TEAM, team);
      this.addAuditLog({
        action: "Updated Admin Permissions/Role",
        target: `${team[idx].name} (${team[idx].id})`,
        targetType: "Admin Account",
        details: `Updated role to ${team[idx].role || 'Admin'} or adjusted permissions.`
      });
      return team[idx];
    }
    return null;
  },

  deleteAdminMember(adminId) {
    const team = this.getAdminTeam().filter(a => a.id !== adminId);
    writeStorage(KEYS.ADMIN_TEAM, team);
    this.addAuditLog({
      action: "Removed Admin User",
      target: `Admin ID: ${adminId}`,
      targetType: "Admin Account",
      details: "Revoked administrative access and security credentials."
    });
    return true;
  },

  // ==================== AUDIT LOGS ====================
  getAuditLogs() {
    return readStorage(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  addAuditLog({ action, target, targetType = "General", details = "" }) {
    const logs = this.getAuditLogs();
    const currentAdmin = this.getAdminUser() || { name: "Master Administrator", email: "admin@telugubandham.com" };
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName: currentAdmin.name,
      adminEmail: currentAdmin.email,
      action,
      target,
      targetType,
      ipAddress: "49.205.142.88 (Hyderabad, TS)",
      status: "Success",
      details
    };
    logs.unshift(newLog);
    writeStorage(KEYS.AUDIT_LOGS, logs);
    return newLog;
  },

  // ==================== SUPPORT TICKETS ====================
  getSupportTickets() {
    return readStorage(KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
  },

  addSupportTicket(ticketData) {
    const tickets = this.getSupportTickets();
    const newTicket = {
      id: `TCK-${Date.now()}`,
      ticketNumber: `#TB-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: "Open",
      messages: [],
      ...ticketData
    };
    tickets.unshift(newTicket);
    writeStorage(KEYS.SUPPORT_TICKETS, tickets);
    return newTicket;
  },

  replyToSupportTicket(ticketId, messageText, adminName = "Support Agent") {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].messages.push({
        sender: "admin",
        name: adminName,
        text: messageText,
        time: "Just now"
      });
      tickets[idx].lastUpdated = new Date().toISOString();
      writeStorage(KEYS.SUPPORT_TICKETS, tickets);
      return tickets[idx];
    }
    return null;
  },

  updateSupportTicketStatus(ticketId, status, assignedTo) {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex(t => t.id === ticketId);
    if (idx !== -1) {
      tickets[idx].status = status;
      if (assignedTo) tickets[idx].assignedTo = assignedTo;
      tickets[idx].lastUpdated = new Date().toISOString();
      writeStorage(KEYS.SUPPORT_TICKETS, tickets);
      this.addAuditLog({
        action: `Updated Support Ticket to ${status}`,
        target: `${tickets[idx].ticketNumber} (${tickets[idx].userName})`,
        targetType: "Support Ticket",
        details: `Assigned agent: ${tickets[idx].assignedTo || 'Unassigned'}`
      });
      return tickets[idx];
    }
    return null;
  },

  // ==================== MATCHMAKING ENGINE ====================
  getMatches() {
    return readStorage(KEYS.MATCHES, INITIAL_MATCHES);
  },

  createManualMatch(groom, bride, notes = "") {
    const matches = this.getMatches();
    const newMatch = {
      id: `MATCH-${Date.now()}`,
      groomId: groom.id,
      groomName: groom.name,
      groomPhoto: (groom.photos && groom.photos[0]) || "",
      groomCommunity: groom.community,
      groomLocation: groom.city,
      brideId: bride.id,
      brideName: bride.name,
      bridePhoto: (bride.photos && bride.photos[0]) || "",
      brideCommunity: bride.community,
      brideLocation: bride.city,
      compatibilityScore: 95,
      horoscopeMatch: "32 / 36 Gunas (Super Match)",
      lifestyleMatch: "97%",
      status: "Matchmaker Assisted",
      notes,
      createdAt: new Date().toISOString()
    };
    matches.unshift(newMatch);
    writeStorage(KEYS.MATCHES, matches);
    this.addAuditLog({
      action: "Created Matchmaker Introduction",
      target: `${groom.name} & ${bride.name}`,
      targetType: "Matchmaking",
      details: `Curated matchmaking assist between ${groom.id} and ${bride.id}.`
    });
    return newMatch;
  },

  // ==================== TRANSACTIONS & BILLING ====================
  getTransactions() {
    return readStorage(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },

  processRefund(txnId, reason = "Customer Request") {
    const txns = this.getTransactions();
    const idx = txns.findIndex(t => t.id === txnId);
    if (idx !== -1) {
      txns[idx].status = "Refunded";
      txns[idx].refundReason = reason;
      txns[idx].refundedAt = new Date().toISOString();
      writeStorage(KEYS.TRANSACTIONS, txns);
      this.addAuditLog({
        action: "Processed Payment Refund",
        target: `${txns[idx].id} (₹${txns[idx].amount})`,
        targetType: "Payment Transaction",
        details: `Refunded ${txns[idx].userName} for ${txns[idx].planName}. Reason: ${reason}`
      });
      return txns[idx];
    }
    return null;
  },

  // ==================== SYSTEM SERVICES & STATUS ====================
  getSystemServices() {
    return readStorage(KEYS.SYSTEM_SERVICES, INITIAL_SYSTEM_SERVICES);
  },

  // ==================== SYSTEM BACKUP & RESTORE ====================
  getBackupRecords() {
    return readStorage(KEYS.BACKUP_RECORDS, INITIAL_BACKUP_RECORDS);
  },

  triggerSystemBackup(backupType = "Manual Administrator Snapshot") {
    const backups = this.getBackupRecords();
    const dateStr = new Date().toISOString().slice(0, 10);
    const newRecord = {
      id: `BKP-${Date.now()}`,
      filename: `TeluguBandham_Snapshot_${dateStr}_${Date.now().toString().slice(-4)}.sql.gz`,
      type: backupType,
      size: `${480 + Math.floor(Math.random() * 15)} MB`,
      createdAt: new Date().toISOString(),
      status: "Verified & Encrypted",
      location: "AWS S3 Multi-Region Glacier (Mumbai)"
    };
    backups.unshift(newRecord);
    writeStorage(KEYS.BACKUP_RECORDS, backups);
    this.addAuditLog({
      action: "Triggered System Backup",
      target: newRecord.filename,
      targetType: "Database Snapshot",
      details: `Completed full database backup snapshot (${newRecord.size}).`
    });
    return newRecord;
  },

  // ==================== SYSTEM SETTINGS ====================
  getSystemSettings() {
    return readStorage(KEYS.SYSTEM_SETTINGS, {
      siteName: "TeluguBandham Matrimony",
      supportEmail: "support@telugubandham.com",
      helplinePhone: "+91 98480 22334",
      maintenanceMode: false,
      requireTwoFactor: true,
      autoApproveGovtID: false,
      maxDailyContactViews: 25,
      chatSafetyFilterStrict: true,
      smtpHost: "email-smtp.ap-south-1.amazonaws.com",
      smsGatewayProvider: "Twilio / Karix SMS Gateway",
      paymentGateway: "Razorpay (Production Mode)",
      backupFrequency: "Daily at 04:00 AM IST"
    });
  },

  updateSystemSettings(settings) {
    const current = this.getSystemSettings();
    const merged = { ...current, ...settings };
    writeStorage(KEYS.SYSTEM_SETTINGS, merged);
    this.notify('settings', merged);
    this.addAuditLog({
      action: "Updated System Settings",
      target: "Core Platform Configuration",
      targetType: "System Settings",
      details: "Modified global platform operational parameters."
    });
    return merged;
  },

  // ==================== CSV EXPORT UTILITY ====================
  exportDataToCSV(dataType) {
    let filename = `TeluguBandham_${dataType}_${new Date().toISOString().slice(0, 10)}.csv`;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (dataType === 'users') {
      const users = this.getProfiles();
      csvContent += "ID,Name,Gender,Age,Community,City,Profession,MembershipTier,Verified,Status\n";
      users.forEach(u => {
        csvContent += `"${u.id}","${u.name}","${u.gender}","${u.age}","${u.community}","${u.city}","${u.profession}","${u.membershipTier || 'Free'}","${u.isVerified ? 'Yes' : 'No'}","${u.isSuspended ? 'Suspended' : 'Active'}"\n`;
      });
    } else if (dataType === 'transactions') {
      const txns = this.getTransactions();
      csvContent += "TransactionID,ReferenceID,User,Plan,Amount,PaymentMethod,Status,Date\n";
      txns.forEach(t => {
        csvContent += `"${t.id}","${t.referenceId}","${t.userName}","${t.planName}","${t.amount}","${t.paymentMethod}","${t.status}","${t.date}"\n`;
      });
    } else if (dataType === 'audit_logs') {
      const logs = this.getAuditLogs();
      csvContent += "Timestamp,Admin,Action,Target,IPAddress,Status,Details\n";
      logs.forEach(l => {
        csvContent += `"${l.timestamp}","${l.adminName}","${l.action}","${l.target}","${l.ipAddress}","${l.status}","${l.details}"\n`;
      });
    } else if (dataType === 'verifications') {
      const verifs = this.getVerifications();
      csvContent += "ID,User,City,DocumentType,SubmittedAt,Status,Notes\n";
      verifs.forEach(v => {
        csvContent += `"${v.id}","${v.userName}","${v.userCity}","${v.documentType}","${v.submittedAt}","${v.status}","${v.notes || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true, filename };
  },

  // ==================== CONTENT MANAGEMENT & FAQS ====================
  getFAQs() {
    return readStorage(KEYS.FAQS, DEFAULT_FAQS);
  },

  addFAQ(faq) {
    const list = this.getFAQs();
    const newFaq = {
      id: `faq-${Date.now()}`,
      question: faq.question?.trim() || 'Frequently Asked Question',
      answer: faq.answer?.trim() || 'Helpful answer text for candidates.',
      category: faq.category || 'General',
      isPublished: faq.isPublished !== undefined ? faq.isPublished : true,
      views: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newFaq, ...list];
    writeStorage(KEYS.FAQS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'faqs' } }));
    }
    this.addAuditLog({
      action: "Created FAQ Item",
      target: newFaq.question,
      targetType: "Content CMS",
      details: `Added new FAQ question under '${newFaq.category}' category.`
    });
    return newFaq;
  },

  updateFAQ(id, data) {
    const list = this.getFAQs();
    const updated = list.map(f => f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f);
    writeStorage(KEYS.FAQS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'faqs' } }));
    }
    this.addAuditLog({
      action: "Updated FAQ Item",
      target: id,
      targetType: "Content CMS",
      details: `Modified FAQ question content.`
    });
    return updated.find(f => f.id === id);
  },

  deleteFAQ(id) {
    const list = this.getFAQs();
    const target = list.find(f => f.id === id);
    const updated = list.filter(f => f.id !== id);
    writeStorage(KEYS.FAQS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'faqs' } }));
    }
    this.addAuditLog({
      action: "Deleted FAQ Item",
      target: target?.question || id,
      targetType: "Content CMS",
      details: `Removed FAQ question from knowledgebase.`
    });
    return true;
  },

  // ==================== HERO BANNERS ====================
  getHeroBanner() {
    return readStorage(KEYS.HERO_BANNER, DEFAULT_HERO_BANNER);
  },

  isHeroBannerDismissed() {
    try {
      const banner = this.getHeroBanner();
      if (!banner) return false;
      const dismissedRecord = readStorage(KEYS.HERO_BANNER_DISMISSED, null);
      if (!dismissedRecord) return false;
      const currentSignature = `${banner.id || 'banner'}_${banner.title || ''}`;
      if (typeof dismissedRecord === 'object' && dismissedRecord !== null) {
        return dismissedRecord.signature === currentSignature || dismissedRecord.dismissed === true;
      }
      return dismissedRecord === currentSignature || dismissedRecord === 'true';
    } catch {
      return false;
    }
  },

  dismissHeroBanner() {
    try {
      const banner = this.getHeroBanner();
      const currentSignature = banner ? `${banner.id || 'banner'}_${banner.title || ''}` : 'banner_dismissed';
      writeStorage(KEYS.HERO_BANNER_DISMISSED, {
        signature: currentSignature,
        dismissed: true,
        dismissedAt: new Date().toISOString()
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'banner_dismissed' } }));
      }
      return true;
    } catch {
      return false;
    }
  },

  resetHeroBannerDismissal() {
    try {
      removeStorage(KEYS.HERO_BANNER_DISMISSED);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(KEYS.HERO_BANNER_DISMISSED);
      }
      return true;
    } catch {
      return false;
    }
  },

  updateHeroBanner(bannerData) {
    const current = this.getHeroBanner();
    const merged = { ...current, ...bannerData, updatedAt: new Date().toISOString() };
    writeStorage(KEYS.HERO_BANNER, merged);
    this.resetHeroBannerDismissal();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'banner' } }));
    }
    this.addAuditLog({
      action: "Updated Hero Announcement Banner",
      target: merged.title,
      targetType: "Content CMS",
      details: `Updated homepage banner status: ${merged.isActive ? 'Active' : 'Disabled'}.`
    });
    return merged;
  },

  // ==================== SAFETY GUIDELINES ====================
  getSafetyRules() {
    return readStorage(KEYS.SAFETY_RULES, DEFAULT_SAFETY_RULES);
  },

  updateSafetyRules(rules) {
    writeStorage(KEYS.SAFETY_RULES, rules);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('telugubandham_content_updated', { detail: { type: 'safety' } }));
    }
    this.addAuditLog({
      action: "Updated Safety Guidelines",
      target: "Matrimonial Safety Rules",
      targetType: "Content CMS",
      details: `Synchronized ${rules.length} safety principles.`
    });
    return rules;
  },

  addSafetyRule(rule) {
    const rules = this.getSafetyRules();
    const newRule = {
      id: `rule-${Date.now()}`,
      title: rule.title || 'Safety Guideline',
      description: rule.description || '',
      severity: rule.severity || 'High',
      category: rule.category || 'General Safety'
    };
    const updated = [...rules, newRule];
    this.updateSafetyRules(updated);
    return newRule;
  },

  deleteSafetyRule(id) {
    const rules = this.getSafetyRules();
    const updated = rules.filter(r => r.id !== id);
    return this.updateSafetyRules(updated);
  },

  // ==================== COMPLETE TEST DATA RESET ====================
  resetAllMockData() {
    // Clear in-memory cache
    memoryStore.clear();

    // Clear all KEYS from storage
    Object.values(KEYS).forEach((key) => {
      removeStorage(key);
    });

    // Reseed initial baseline records
    writeStorage(KEYS.PROFILES, INITIAL_PROFILES);
    writeStorage(KEYS.CURRENT_USER, DEFAULT_USER_PROFILE);
    writeStorage(KEYS.PLANS, MEMBERSHIP_PLANS);
    writeStorage(KEYS.STORIES, SUCCESS_STORIES);
    writeStorage(KEYS.VERIFICATIONS, INITIAL_VERIFICATIONS_QUEUE);
    writeStorage(KEYS.REPORTS, INITIAL_REPORTS);
    writeStorage(KEYS.ADMIN_TEAM, INITIAL_ADMIN_TEAM);
    writeStorage(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    writeStorage(KEYS.SUPPORT_TICKETS, INITIAL_SUPPORT_TICKETS);
    writeStorage(KEYS.MATCHES, INITIAL_MATCHES);
    writeStorage(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    writeStorage(KEYS.SYSTEM_SERVICES, INITIAL_SYSTEM_SERVICES);
    writeStorage(KEYS.BACKUP_RECORDS, INITIAL_BACKUP_RECORDS);
    writeStorage(KEYS.FAQS, DEFAULT_FAQS);
    writeStorage(KEYS.HERO_BANNER, DEFAULT_HERO_BANNER);
    writeStorage(KEYS.SAFETY_RULES, DEFAULT_SAFETY_RULES);
    writeStorage(KEYS.INTERESTS, INITIAL_INTERESTS);
    writeStorage(KEYS.SHORTLIST, INITIAL_SHORTLIST);
    writeStorage(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);

    // Notify listeners & broadcast channels
    notifySubscribers('reset_database', null);
    return true;
  }
};

export default mockDb;

