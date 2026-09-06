import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockDb } from '../services/mockDb';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { calculateProfileCompletion } from '../services/matchingAlgorithm';
import ProfileIncompleteModal from '../components/common/ProfileIncompleteModal';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  
  // App state
  const [shortlist, setShortlist] = useState(() => mockDb.getShortlist() || []);
  const [interests, setInterests] = useState(() => {
    const active = mockDb.getCurrentUser();
    return mockDb.getInterestsForUser(active?.id || 'TB-USER-01') || { received: [], sent: [] };
  });
  const [conversations, setConversations] = useState(() => mockDb.getConversations() || []);
  const [notifications, setNotifications] = useState(() => mockDb.getNotifications() || []);
  const [toasts, setToasts] = useState([]);
  const [systemSettings, setSystemSettings] = useState(() => mockDb.getSystemSettings());
  
  // Profile completion enforcement modal state
  const [profileIncompleteState, setProfileIncompleteState] = useState({
    isOpen: false,
    actionType: 'interest',
    targetName: 'Member'
  });

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // { type: 'interest'|'compatibility'|'report'|'biodata'|'upgrade', data: any }

  // Sync user-dependent data
  const syncUserData = useCallback(() => {
    const activeUser = user || mockDb.getCurrentUser();
    const activeUserId = activeUser?.id || 'TB-USER-01';
    
    if (activeUser) {
      const userInterests = mockDb.getInterestsForUser(activeUserId);
      setInterests(userInterests || { received: [], sent: [] });
      setShortlist(mockDb.getShortlist() || []);
      setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
      setNotifications(mockDb.getNotificationsForUser(activeUserId) || mockDb.getNotifications() || []);
    } else {
      setInterests({ received: [], sent: [] });
      setShortlist([]);
      setConversations([]);
      setNotifications([]);
    }
  }, [user]);

  // Toast helper
  const showToast = useCallback((message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    syncUserData();
  }, [syncUserData]);

  // Real-time synchronization subscription
  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type, payload) => {
      const activeUser = user || mockDb.getCurrentUser();
      const activeUserId = activeUser?.id || 'TB-USER-01';

      if (type === 'notifications') {
        const updatedNotifs = mockDb.getNotificationsForUser(activeUserId) || mockDb.getNotifications() || [];
        setNotifications(updatedNotifs);
        if (payload?.type === 'announcement' || payload?.title?.includes('📢')) {
          showToast(payload.title || "New Platform Announcement", "warning");
        }
      } else if (type === 'interests' || type === 'shortlist' || type === 'storage_sync' || type === 'profiles' || type === 'user_updated' || type === 'conversations') {
        syncUserData();
      } else if (type === 'settings') {
        setSystemSettings(mockDb.getSystemSettings());
      }
    });

    const handleRealtimeEvent = (e) => {
      const type = e.detail?.type;
      if (type === 'interests' || type === 'shortlist' || type === 'storage_sync' || type === 'profiles' || type === 'user_updated') {
        syncUserData();
      }
    };

    window.addEventListener('telugubandham_realtime_event', handleRealtimeEvent);
    window.addEventListener('storage', syncUserData);

    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_realtime_event', handleRealtimeEvent);
      window.removeEventListener('storage', syncUserData);
    };
  }, [user, syncUserData, showToast]);

  const checkProfileCompleteness = (actionType = 'interest', targetName = 'Member') => {
    const active = user || mockDb.getCurrentUser();
    if (!active) {
      showToast("Please log in to continue", "warning");
      return false;
    }

    // Only the Interest option works without 100 percent profile
    if (actionType === 'interest') {
      return true;
    }

    // All other features require 100% profile completion
    const completion = calculateProfileCompletion(active);
    const isOneHundredPercent = completion.percentage >= 100 && completion.isComplete;

    if (!isOneHundredPercent) {
      setProfileIncompleteState({
        isOpen: true,
        actionType,
        targetName,
        step: 'bio-data'
      });
      return false;
    }

    return true;
  };

  // Shortlist actions
  const toggleShortlist = (profileId, note = "") => {
    if (!checkProfileCompleteness('shortlist', 'Member')) {
      return null;
    }
    const res = mockDb.toggleShortlist(profileId, note);
    setShortlist(mockDb.getShortlist() || []);
    showToast(
      res?.isShortlisted ? "Profile added to your Shortlist" : "The shortlisted profile was removed successfully",
      res?.isShortlisted ? "success" : "info"
    );
    return res;
  };

  const isShortlisted = (profileId) => {
    return Array.isArray(shortlist) && shortlist.some((s) => String(s.profileId).toLowerCase() === String(profileId).toLowerCase());
  };

  // Interests actions
  const sendInterest = (targetProfile, message) => {
    const activeUser = user || mockDb.getCurrentUser();
    if (!activeUser) {
      showToast("Please login to send interests", "warning");
      return { success: false };
    }

    if (!checkProfileCompleteness('interest', targetProfile?.name || 'Member')) {
      return { success: false, reason: 'PROFILE_INCOMPLETE' };
    }

    const targetId = targetProfile?.id || targetProfile?.profileId || targetProfile?.userId;
    if (!targetId) {
      showToast("Unable to send interest: Invalid profile", "warning");
      return { success: false };
    }

    const res = mockDb.sendInterest({
      sender: activeUser,
      receiver: targetProfile,
      message
    });

    if (res?.success) {
      const activeUserId = activeUser.id || 'TB-USER-01';
      const updatedInterests = mockDb.getInterestsForUser(activeUserId) || { received: [], sent: [] };
      setInterests(updatedInterests);
      setNotifications(mockDb.getNotificationsForUser(activeUserId) || []);
      showToast(`Interest sent to ${targetProfile?.name || 'Member'}! 💕`, "success");
      
      // Celebrate with confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6B1426', '#D4AF37', '#E0587E']
        });
      } catch (e) {
        // ignore if canvas not supported
      }
    } else {
      showToast(res?.message || "Unable to send interest", "warning");
    }

    return res;
  };

  const updateInterestStatus = (interestId, status) => {
    const activeUser = user || mockDb.getCurrentUser();
    const activeUserId = activeUser?.id || 'TB-USER-01';
    const updated = mockDb.updateInterestStatus(interestId, status);
    if (updated) {
      setInterests(mockDb.getInterestsForUser(activeUserId) || { received: [], sent: [] });
      setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
      setNotifications(mockDb.getNotificationsForUser(activeUserId) || []);
      
      if (status === 'accepted') {
        showToast("Interest Accepted! You can now start chatting 🎉", "success");
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#12B76A', '#D4AF37', '#8B1E3F']
          });
        } catch (e) {}
      } else {
        showToast("Interest response updated", "info");
      }
    }
  };

  const acceptInterest = (interestId) => updateInterestStatus(interestId, 'accepted');
  const declineInterest = (interestId) => updateInterestStatus(interestId, 'declined');

  const withdrawInterest = (targetIdOrInterestId) => {
    if (!targetIdOrInterestId) return;
    const activeUser = user || mockDb.getCurrentUser();
    const activeUserId = activeUser?.id || 'TB-USER-01';
    mockDb.withdrawInterest(targetIdOrInterestId);
    setInterests(mockDb.getInterestsForUser(activeUserId) || { received: [], sent: [] });
    setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
    showToast("Interest request withdrawn successfully ↺", "info");
  };

  const getInterestStatus = (profileId) => {
    if (!profileId) return null;
    const targetStr = String(profileId).trim().toLowerCase();
    const received = interests?.received || [];
    const sent = interests?.sent || [];
    const sentMatch = sent.find((i) => {
      const recId = String(i.receiverId || i.targetId || '').trim().toLowerCase();
      return recId === targetStr;
    });
    if (sentMatch) return sentMatch.status || 'pending';
    const receivedMatch = received.find((i) => {
      const sndId = String(i.senderId || i.userId || '').trim().toLowerCase();
      return sndId === targetStr;
    });
    if (receivedMatch) return receivedMatch.status || 'pending';
    return null;
  };

  // Messaging actions
  const sendMessage = (convId, text, senderId = null, attachment = null) => {
    if (!user || (!text?.trim() && !attachment)) return;
    const authorId = senderId || user.id;

    if (authorId === user.id) {
      if (!checkProfileCompleteness('message', 'Member')) {
        return null;
      }
    }

    const res = mockDb.sendMessage(convId, authorId, text ? text.trim() : '', attachment);
    if (res?.success) {
      setConversations(mockDb.getConversations() || []);
    }
    return res;
  };

  const openOrCreateChat = (targetProfile) => {
    const activeUser = user || mockDb.getCurrentUser();
    if (!activeUser) {
      showToast("Please login to message members", "warning");
      return null;
    }
    if (!checkProfileCompleteness('chat', targetProfile?.name || 'Member')) {
      return null;
    }
    const conv = mockDb.getOrCreateConversation(activeUser, targetProfile);
    const activeUserId = activeUser.id || 'TB-USER-01';
    setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
    return conv;
  };

  const clearChatHistory = (convId) => {
    const res = mockDb.clearChatHistory(convId);
    if (res?.success) {
      const activeUser = user || mockDb.getCurrentUser();
      const activeUserId = activeUser?.id || 'TB-USER-01';
      setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
      showToast("Chat history cleared successfully! 🧹", "info");
    }
    return res;
  };

  const deleteConversation = (convId) => {
    const res = mockDb.deleteConversation(convId);
    if (res?.success) {
      const activeUser = user || mockDb.getCurrentUser();
      const activeUserId = activeUser?.id || 'TB-USER-01';
      setConversations(mockDb.getConversationsForUser(activeUserId) || mockDb.getConversations() || []);
      setInterests(mockDb.getInterestsForUser(activeUserId) || { received: [], sent: [] });
      showToast("Conversation deleted & profile reset to message again 🔄", "info");
    }
    return res;
  };

  // Notifications actions
  const markNotificationRead = (id) => {
    const updated = mockDb.markNotificationRead(id);
    setNotifications(updated || []);
  };

  const markAllNotificationsRead = () => {
    const updated = mockDb.markAllNotificationsRead();
    setNotifications(updated || []);
    showToast("All notifications marked as read", "info");
  };

  const unreadNotifCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

  // Modal helpers
  const openModal = (type, data = null) => {
    setActiveModal({ type, data });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Derived conveniencies
  const receivedInterests = interests?.received || [];
  const sentInterests = interests?.sent || [];
  const shortlists = shortlist || [];

  const value = {
    shortlist,
    shortlists,
    toggleShortlist,
    isShortlisted,
    interests,
    receivedInterests,
    sentInterests,
    sendInterest,
    updateInterestStatus,
    acceptInterest,
    declineInterest,
    withdrawInterest,
    getInterestStatus,
    conversations,
    sendMessage,
    openOrCreateChat,
    clearChatHistory,
    deleteConversation,
    notifications,
    unreadNotifCount,
    markNotificationRead,
    markAllNotificationsRead,
    toasts,
    showToast,
    removeToast,
    activeModal,
    openModal,
    closeModal,
    checkProfileCompleteness,
    profileIncompleteState,
    setProfileIncompleteState,
    systemSettings,
    refreshState: syncUserData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
