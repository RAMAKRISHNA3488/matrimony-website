import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { mockDb } from '../services/mockDb';
import { DEFAULT_ADMIN_USER } from '../services/mockData';
import { openDB, getUserById, updateUser as dbUpdateUser } from '../services/database/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => mockDb.getCurrentUser());
  const [adminUser, setAdminUser] = useState(() => mockDb.getAdminUser());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state and hydrate from IndexedDB on mount
  useEffect(() => {
    async function hydrate() {
      try {
        await openDB();
        const rawSession = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('tb_current_session') : null) ||
                           (typeof localStorage !== 'undefined' ? localStorage.getItem('tb_current_session') : null);
        if (rawSession) {
          const session = JSON.parse(rawSession);
          if (session?.userId) {
            const dbUser = await getUserById(session.userId);
            if (dbUser) {
              const userGender = (dbUser.gender || 'male').toLowerCase();
              const targetGender = userGender === 'female' ? 'male' : 'female';
              const lookingFor = userGender === 'female' ? 'Telugu Grooms (Male)' : 'Telugu Brides (Female)';
              const fullProfile = {
                ...dbUser,
                name: dbUser.fullName || dbUser.name,
                gender: userGender,
                phone: `+91 ${dbUser.mobileNumber}`,
                age: dbUser.dateOfBirth ? Math.max(18, new Date().getFullYear() - new Date(dbUser.dateOfBirth).getFullYear()) : 26,
                city: dbUser.location?.split(',')?.[0]?.trim() || 'Hyderabad',
                state: dbUser.location?.split(',')?.[1]?.trim() || 'Telangana',
                membershipTier: dbUser.membershipPlan || 'Free Member',
                photos: dbUser.profilePhoto ? [dbUser.profilePhoto] : (Array.isArray(dbUser.photos) ? dbUser.photos : []),
                partnerPreferences: dbUser.partnerPreferences || {
                  gender: targetGender,
                  lookingFor
                }
              };
              setUser(fullProfile);
              mockDb.setCurrentUser(fullProfile);
              return;
            }

          }
        }
      } catch (e) {
        console.warn("Hydration from IndexedDB warning:", e);
      }

      const currentUser = mockDb.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }

    hydrate();
  }, []);

  // Real-time synchronization for active user profile & status changes
  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type, payload) => {
      if (type === 'profiles' || type === 'user_updated') {
        const freshUser = mockDb.getCurrentUser();
        if (freshUser) {
          setUser(freshUser);
        } else if (user) {
          const matchingProfile = mockDb.getProfileById(user.id);
          if (matchingProfile) {
            setUser((prev) => ({ ...prev, ...matchingProfile }));
          }
        }
      } else if (type === 'admin_team') {
        const freshAdmin = mockDb.getAdminUser();
        if (freshAdmin) {
          setAdminUser(freshAdmin);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // User login via Mobile or Email + Password
  const login = useCallback(async (identifier, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await authService.login(identifier, password, rememberMe);
      if (res.success && res.user) {
        setUser(res.user);
      }
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Something went wrong. Please check your connection and try again.' };
    }
  }, []);

  // User registration
  const register = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const res = await authService.register(formData);
      if (res.success && res.user) {
        setUser(res.user);
      }
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Failed to create profile. Please try again.' };
    }
  }, []);

  // Request Mobile OTP
  const requestOtp = useCallback(async (mobileNumber, purpose = 'registration') => {
    return await authService.requestOtp(mobileNumber, purpose);
  }, []);

  // Verify Mobile OTP
  const verifyOtp = useCallback(async (mobileNumber, otpCode, purpose = 'registration') => {
    return await authService.verifyOtp(mobileNumber, otpCode, purpose);
  }, []);

  // Reset Password with OTP
  const resetPassword = useCallback(async (mobileNumber, otpCode, newPassword) => {
    setIsLoading(true);
    try {
      const res = await authService.resetPasswordWithOtp(mobileNumber, otpCode, newPassword);
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      return { success: false, message: 'Failed to reset password. Please try again.' };
    }
  }, []);

  // User logout
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  // Quick Demo Persona Switcher
  const switchPersona = useCallback((type) => {
    const switched = mockDb.switchPersona(type);
    setUser(switched);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('tb_auth_token_v2', `tb_token_demo_${type}`);
      sessionStorage.setItem('tb_current_session', JSON.stringify({ userId: switched.id, email: switched.email, mobile: switched.mobileNumber || switched.phone }));
    }
    return switched;
  }, []);

  // Update current user profile
  const updateProfile = useCallback(async (data) => {
    if (user && user.id) {
      try {
        await dbUpdateUser(user.id, data);
      } catch (err) {
        console.warn("Error updating user in IndexedDB:", err);
      }
    }
    const updated = mockDb.updateCurrentUserProfile(data);
    setUser(updated);
    return updated;
  }, [user]);

  // Admin login with 2FA OTP support
  const adminLogin = useCallback((email, password, options = {}) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const isMaster = cleanEmail === 'admin@telugubandham.com' && (password === 'admin123' || options.otpVerified || options.directLogin || !password);

        if (isMaster) {
          mockDb.setAdminUser(DEFAULT_ADMIN_USER);
          setAdminUser(DEFAULT_ADMIN_USER);
          setIsLoading(false);
          resolve({ success: true, admin: DEFAULT_ADMIN_USER });
          return;
        }

        // Also check admin team members in mockDb
        const team = mockDb.getAdminTeam();
        const member = team.find((t) => (t.email || '').toLowerCase() === cleanEmail);
        if (member && (password === 'admin123' || options.otpVerified || options.directLogin || !password)) {
          const adminData = {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            department: member.department,
            permissions: member.permissions
          };
          mockDb.setAdminUser(adminData);
          setAdminUser(adminData);
          setIsLoading(false);
          resolve({ success: true, admin: adminData });
          return;
        }

        setIsLoading(false);
        resolve({ success: false, message: "Invalid Admin credentials. Use admin@telugubandham.com / admin123" });
      }, 50);
    });
  }, []);

  // Admin logout
  const adminLogout = useCallback(() => {
    mockDb.setAdminUser(null);
    setAdminUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!adminUser,
    adminUser,
    isLoading,
    login,
    logout,
    register,
    requestOtp,
    verifyOtp,
    resetPassword,
    adminLogin,
    adminLogout,
    switchPersona,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
