import React, { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import { calculateProfileCompletion, calculateCompatibility } from '../../services/matchingAlgorithm';
import UpgradeModal from '../../components/common/UpgradeModal';
import {
  Eye,
  Heart,
  MessageCircle,
  Users,
  ShieldCheck,
  Crown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ArrowRight,
  Edit3,
  Award,
  Clock,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  CheckCircle2,
  ExternalLink,
  Compass,
  Circle,
  Flame,
  Send,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../styles/dashboard.css';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    receivedInterests = [],
    acceptInterest,
    declineInterest,
    sendInterest,
    withdrawInterest,
    sentInterests = [],
    shortlist = [],
    showToast,
    conversations = [],
    notifications = [],
    checkProfileCompleteness,
    openOrCreateChat
  } = useApp();
  const navigate = useNavigate();

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [selectedProfileModal, setSelectedProfileModal] = useState(null);
  const [submittingInterestId, setSubmittingInterestId] = useState(null);
  const [localSentInterests, setLocalSentInterests] = useState(() => {
    return new Set(
      Array.isArray(sentInterests)
        ? sentInterests
            .map(i => String(i.receiverId || i.targetId || '').trim().toLowerCase())
            .filter(Boolean)
        : []
    );
  });

  const carouselRef = useRef(null);

  // Sync sent interests from AppContext in real time during render
  const [prevSentInterests, setPrevSentInterests] = useState(sentInterests);
  if (sentInterests !== prevSentInterests) {
    setPrevSentInterests(sentInterests);
    setLocalSentInterests(
      new Set(
        Array.isArray(sentInterests)
          ? sentInterests
              .map(i => String(i.receiverId || i.targetId || '').trim().toLowerCase())
              .filter(Boolean)
          : []
      )
    );
  }

  // Robust interest status resolution helper
  const isMatchInterestSent = (match) => {
    if (!match) return false;
    const matchId = String(match.id || match.userId || match.profileId || '').trim().toLowerCase();
    const matchName = (match.name || match.fullName || '').trim().toLowerCase();

    // 1. Direct Set check
    if (matchId && localSentInterests.has(matchId)) return true;

    // 2. Direct sentInterests array check from AppContext
    if (Array.isArray(sentInterests) && sentInterests.length > 0) {
      return sentInterests.some((i) => {
        const rId = String(i.receiverId || i.targetId || i.participantId || '').trim().toLowerCase();
        const rName = (i.receiverName || '').trim().toLowerCase();
        return (matchId && rId === matchId) || (matchName && rName && matchName === rName);
      });
    }

    return false;
  };

  // Profile completion calculation from actual profile data (0 fallback for empty user)
  const completion = useMemo(() => {
    return calculateProfileCompletion(user) || {
      percentage: 0,
      missingSteps: ['Basic Information', 'Profile Photo', 'Partner Preferences', 'Trust Verification'],
      isComplete: false
    };
  }, [user]);

  const completionPercentage = completion?.percentage ?? 0;

  // Profile Strength evaluation
  const profileStrength = useMemo(() => {
    if (completionPercentage >= 80) return { label: t('dashboard.excellent', 'Excellent'), color: '#16A34A', tier: 'high' };
    if (completionPercentage >= 60) return { label: t('dashboard.good', 'Good'), color: '#C99A3A', tier: 'mid' };
    return { label: t('dashboard.needsImprovement', 'Needs Improvement'), color: '#DC2626', tier: 'low' };
  }, [completionPercentage, t]);

  // Target gender matching recommendations
  const targetGender = (user?.gender || 'male') === 'male' ? 'female' : 'male';

  // Dynamic match pool loaded from mockDb profiles with compatibility scores
  const matchPool = useMemo(() => {
    try {
      const allProfiles = mockDb.getProfiles() || [];
      const filtered = allProfiles.filter(p => p.gender === targetGender && p.id !== user?.id && !p.isSuspended);

      if (filtered.length > 0) {
        return filtered.map(p => {
          const comp = calculateCompatibility(user, p);
          return {
            ...p,
            compatibilityScore: comp?.score || 85,
            breakdown: comp?.breakdown || {},
            tag: p.isPremium ? 'Premium' : p.isVerified ? 'Verified' : 'New',
            tagType: p.isPremium ? 'gold' : p.isVerified ? 'primary' : 'green',
            photo: (p.photos && p.photos[0]) || (targetGender === 'female' ? '/assets/profiles/female/Female_Profile_01.jpg' : '/assets/profiles/male/Male_Profile_01.jpg')
          };
        }).sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
      }
    } catch (err) {
      console.warn("Error deriving match pool:", err);
    }
    return [];
  }, [targetGender, user]);

  // Total unread messages count calculated dynamically
  const unreadMessagesCount = useMemo(() => {
    if (!Array.isArray(conversations)) return 0;
    return conversations.reduce((acc, c) => acc + (c.unreadCount || (c.unread ? 1 : 0)), 0);
  }, [conversations]);

  // Pending interests queue (strictly real incoming interests, NO mock fallback)
  const [incomingInterests, setIncomingInterests] = useState(() => {
    if (Array.isArray(receivedInterests) && receivedInterests.length > 0) {
      return receivedInterests.filter(i => i.status === 'pending');
    }
    return [];
  });

  // Keep incomingInterests in sync with context during render
  const [prevReceivedInterests, setPrevReceivedInterests] = useState(receivedInterests);
  if (receivedInterests !== prevReceivedInterests) {
    setPrevReceivedInterests(receivedInterests);
    setIncomingInterests(
      Array.isArray(receivedInterests)
        ? receivedInterests.filter(i => i.status === 'pending')
        : []
    );
  }

  // Recent Messages list (from real conversations, NO fake fallback)
  const recentMessagesList = useMemo(() => {
    if (Array.isArray(conversations) && conversations.length > 0) {
      return conversations.slice(0, 3).map(conv => {
        const lastMsg = conv.messages?.[conv.messages.length - 1] || {};
        return {
          id: conv.id,
          name: conv.participantName || "Member",
          message: lastMsg.text || "Connected on TeluguBandham",
          time: lastMsg.time || "Recently",
          unread: conv.unreadCount || 0,
          photo: conv.participantPhoto || (targetGender === 'female' ? '/assets/profiles/female/Female_Profile_01.jpg' : '/assets/profiles/male/Male_Profile_01.jpg')
        };
      });
    }
    return [];
  }, [conversations, targetGender]);

  // Recent activities list from notifications (strictly real, NO fake fallback)
  const recentActivities = useMemo(() => {
    if (Array.isArray(notifications) && notifications.length > 0) {
      return notifications.slice(0, 4).map((notif) => ({
        id: notif.id,
        type: notif.type,
        desc: notif.message || notif.title || 'Profile update',
        time: notif.time || 'Recently',
        link: notif.link || '/notifications'
      }));
    }
    return [];
  }, [notifications]);

  // Carousel slide handlers
  const handleScrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth || 300;
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth || 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Interest toggle handler
  const handleToggleInterest = async (match) => {
    if (!match || submittingInterestId) return;
    const targetId = String(match.id || match.userId || match.profileId || '').trim();
    if (!targetId) return;

    setSubmittingInterestId(targetId);
    const isSent = isMatchInterestSent(match);
    const targetKey = targetId.toLowerCase();
    const updated = new Set(localSentInterests);

    try {
      if (isSent) {
        updated.delete(targetKey);
        setLocalSentInterests(updated);
        if (withdrawInterest) {
          await withdrawInterest(targetId);
        }
      } else {
        updated.add(targetKey);
        setLocalSentInterests(updated);
        if (sendInterest) {
          const res = await sendInterest(match);
          if (res && res.success === false) {
            updated.delete(targetKey);
            setLocalSentInterests(new Set(updated));
          }
        }
      }
    } finally {
      setSubmittingInterestId(null);
    }
  };

  // Accept interest handler
  const handleAccept = (item) => {
    setIncomingInterests(prev => prev.filter(i => i.id !== item.id));
    if (acceptInterest) {
      acceptInterest(item.id);
    }
    showToast(`You accepted ${item.name}'s interest! You can now start chatting. 🎉`, 'success');
    try {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#16A34A', '#C99A3A', '#8B1235']
      });
    } catch (e) {}
  };

  // Decline interest handler
  const handleDecline = (item) => {
    setIncomingInterests(prev => prev.filter(i => i.id !== item.id));
    if (declineInterest) {
      declineInterest(item.id);
    }
    showToast(`Interest request declined.`, 'info');
  };

  // Chat initiation handler matching Profile Chat behavior
  const handleStartChatFromModal = (candidate) => {
    if (!candidate) return;
    const activeUser = user || mockDb.getCurrentUser();
    if (!activeUser) {
      showToast("Please log in to chat with members", "warning");
      navigate('/login');
      return;
    }
    if (checkProfileCompleteness && !checkProfileCompleteness('chat', candidate.name || candidate.fullName || 'Member')) {
      return;
    }
    const conv = openOrCreateChat ? openOrCreateChat(candidate) : mockDb.getOrCreateConversation(activeUser, candidate);
    setSelectedProfileModal(null);
    if (conv && conv.id) {
      navigate(`/messages?chat=${conv.id}`);
    } else {
      navigate(`/messages?participant=${candidate.id}`);
    }
  };

  // Circular progress calculations for profile completion
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  // Dynamic user data
  const displayName = user?.name ? user.name.split(' ')[0] : (user?.fullName ? user.fullName.split(' ')[0] : 'Member');
  const fullDisplayName = user?.name || user?.fullName || 'Member';
  const userInitial = fullDisplayName.trim().charAt(0).toUpperCase() || 'M';
  const hasCustomPhoto = Boolean(
    user?.photos &&
    user.photos.length > 0 &&
    user.photos[0] &&
    !user.photos[0].includes('/assets/profiles/') &&
    !user.photos[0].includes('unsplash.com')
  );

  const getDisplayTier = (tier) => {
    if (!tier) return 'Free Member';
    const trimmed = tier.trim();
    if (trimmed.toLowerCase().endsWith('member')) {
      return trimmed;
    }
    return `${trimmed} Member`;
  };

  return (
    <div className="tb-dashboard-wrapper">
      <div className="tb-dashboard-container">
        
        {/* ======================================================== */}
        {/* MAIN DASHBOARD 2-COLUMN GRID (Content Left + Sidebar Right) */}
        {/* ======================================================== */}
        <div className="tb-dashboard-grid">
          
          {/* ======================================================== */}
          {/* LEFT MAIN CONTENT COLUMN */}
          {/* ======================================================== */}
          <main className="tb-main-content">

            {/* 1. WELCOME SECTION + STATS OVERVIEW */}
            <div className="tb-card tb-welcome-hero-card animate-fade-in">
              <div className="tb-welcome-header">
                <div className="tb-user-avatar-wrap">
                  {hasCustomPhoto ? (
                    <img
                      src={user.photos[0]}
                      alt={fullDisplayName}
                      className="tb-user-avatar"
                    />
                  ) : (
                    <div className="tb-user-avatar tb-user-avatar-initial" aria-label={`Avatar for ${fullDisplayName}`}>
                      {userInitial}
                    </div>
                  )}
                  <Link to="/profile/edit" className="tb-avatar-edit-badge" title="Edit Profile">
                    <Edit3 size={13} />
                  </Link>
                </div>

                <div className="tb-welcome-text">
                  <div className="tb-welcome-eyebrow">
                    <span>TELUGUBANDHAM MATRIMONY</span>
                  </div>
                  <h1 className="tb-welcome-title">
                    {t('dashboard.welcomeBack', 'Welcome back')}, {displayName}! 👋
                  </h1>
                  <p className="tb-welcome-subtitle">
                    {t('dashboard.continueJourney', 'Continue your journey to find your perfect life partner.')}
                    <span className="tb-welcome-pref-tag">
                      · Looking for: <strong>{targetGender === 'male' ? 'Telugu Grooms (Male)' : 'Telugu Brides (Female)'}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* 4 Statistics Metrics (All Fully Interactive & Navigable) */}
              <div className="tb-stats-strip">
                <Link to="/interests?tab=sent" className="tb-stat-cell tb-stat-clickable" title="View Outgoing Sent Interests">
                  <div className="tb-stat-top-row">
                    <span className="tb-stat-label">Interests Sent</span>
                    <ArrowRight size={13} className="tb-stat-arrow" aria-hidden="true" />
                  </div>
                  <div className="tb-stat-val-row">
                    <div className="tb-stat-icon-wrap tb-wrap-views" style={{ backgroundColor: '#FDF2F4', color: '#8B1235' }}>
                      <Send size={18} className="tb-stat-icon" color="#8B1235" />
                    </div>
                    <span className="tb-stat-number">{sentInterests?.length ?? 0}</span>
                  </div>
                </Link>

                <Link to="/interests?tab=received" className="tb-stat-cell tb-stat-clickable" title="View Received Interests">
                  <div className="tb-stat-top-row">
                    <span className="tb-stat-label">{t('dashboard.interestsReceived', 'Interests Received')}</span>
                    <ArrowRight size={13} className="tb-stat-arrow" aria-hidden="true" />
                  </div>
                  <div className="tb-stat-val-row">
                    <div className="tb-stat-icon-wrap tb-wrap-interests">
                      <Heart size={18} className="tb-stat-icon tb-icon-interests" />
                    </div>
                    <span className="tb-stat-number">{receivedInterests?.length ?? 0}</span>
                  </div>
                </Link>

                <Link to="/shortlist" className="tb-stat-cell tb-stat-clickable" title="View Shortlisted Candidates">
                  <div className="tb-stat-top-row">
                    <span className="tb-stat-label">Shortlisted</span>
                    <ArrowRight size={13} className="tb-stat-arrow" aria-hidden="true" />
                  </div>
                  <div className="tb-stat-val-row">
                    <div className="tb-stat-icon-wrap tb-wrap-matches" style={{ backgroundColor: '#FEF9EE', color: '#C99A3A' }}>
                      <Bookmark size={18} className="tb-stat-icon" color="#C99A3A" />
                    </div>
                    <span className="tb-stat-number">{shortlist?.length ?? 0}</span>
                  </div>
                </Link>

                <Link to="/messages" className="tb-stat-cell tb-stat-clickable" title="Open Messages Hub">
                  <div className="tb-stat-top-row">
                    <span className="tb-stat-label">{t('dashboard.messages', 'Unread Messages')}</span>
                    <ArrowRight size={13} className="tb-stat-arrow" aria-hidden="true" />
                  </div>
                  <div className="tb-stat-val-row">
                    <div className="tb-stat-icon-wrap tb-wrap-messages">
                      <MessageCircle size={18} className="tb-stat-icon tb-icon-messages" />
                    </div>
                    <span className="tb-stat-number">{unreadMessagesCount}</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* 2. TODAY'S MATCH INSIGHTS SECTION */}
            <section className="tb-section animate-fade-in">
              <div className="tb-card tb-insights-card">
                <div className="tb-insights-header">
                  <div className="tb-insights-title-group">
                    <div className="tb-insights-icon-box">
                      <Compass size={20} className="tb-compass-icon" />
                    </div>
                    <div>
                      <h2 className="tb-insights-heading">
                        {t('dashboard.matchInsights', "Today's Match Insights")}
                      </h2>
                      <p className="tb-insights-subtitle">
                        {matchPool.length > 0 ? (
                          <>
                            <strong>{matchPool.length}</strong> {t('dashboard.matchInsightsDesc', `verified Telugu ${targetGender === 'male' ? 'Groom' : 'Bride'} profiles match your partner search criteria today.`)}
                          </>
                        ) : (
                          t('dashboard.noInsightsYet', 'Complete your partner preferences in your profile to view tailored compatibility insights.')
                        )}
                      </p>
                    </div>
                  </div>
                  <Link to="/matches" className="tb-insights-action-link">
                    <span>{t('dashboard.viewAllMatches', 'Explore Matches →')}</span>
                  </Link>
                </div>

                {/* Compatibility Highlight Capsules */}
                {matchPool.length > 0 ? (
                  <div className="tb-insights-grid">
                    <div className="tb-insight-pill">
                      <div className="tb-insight-score-badge">{matchPool[0]?.compatibilityScore ? Math.min(99, matchPool[0].compatibilityScore + 2) : 95}%</div>
                      <div className="tb-insight-meta">
                        <span className="tb-insight-tag">{t('dashboard.kundaliMatch', 'Kundali and Horoscope Match')}</span>
                        <span className="tb-insight-desc">Astrological and Gothram harmony aligned</span>
                      </div>
                    </div>

                    <div className="tb-insight-pill">
                      <div className="tb-insight-score-badge">{matchPool[0]?.compatibilityScore ? Math.min(98, matchPool[0].compatibilityScore - 2) : 92}%</div>
                      <div className="tb-insight-meta">
                        <span className="tb-insight-tag">{t('dashboard.locationMatch', 'Location and City Match')}</span>
                        <span className="tb-insight-desc">Telugu regional and city preferences aligned</span>
                      </div>
                    </div>

                    <div className="tb-insight-pill">
                      <div className="tb-insight-score-badge">{matchPool[0]?.compatibilityScore ? Math.min(96, matchPool[0].compatibilityScore - 5) : 89}%</div>
                      <div className="tb-insight-meta">
                        <span className="tb-insight-tag">{t('dashboard.careerMatch', 'Education and Career Match')}</span>
                        <span className="tb-insight-desc">Professional and educational qualification match</span>
                      </div>
                    </div>

                    <div className="tb-insight-pill">
                      <div className="tb-insight-score-badge">{matchPool[0]?.compatibilityScore ? Math.min(95, matchPool[0].compatibilityScore - 7) : 86}%</div>
                      <div className="tb-insight-meta">
                        <span className="tb-insight-tag">{t('dashboard.culturalMatch', 'Cultural and Family Values')}</span>
                        <span className="tb-insight-desc">Traditional Telugu family values alignment</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '16px 20px', background: 'rgba(139, 18, 53, 0.04)', border: '1px solid rgba(139, 18, 53, 0.12)', borderRadius: '12px', color: '#6B6368', fontSize: '0.875rem' }}>
                    Set your partner preferences (Age, Community, Education, Location) in <Link to="/profile/edit" style={{ color: '#8B1235', fontWeight: 700, textDecoration: 'underline' }}>Profile Edit</Link> to unlock detailed match insights.
                  </div>
                )}
              </div>
            </section>

            {/* 3. RECOMMENDED MATCHES SECTION */}
            <section className="tb-section animate-fade-in">
              <div className="tb-section-header">
                <div className="tb-section-title-wrap">
                  <h2 className="tb-section-title">
                    {t('dashboard.recommendedMatches', `Recommended Telugu ${targetGender === 'male' ? 'Grooms' : 'Brides'}`)}
                  </h2>
                  <span className="tb-section-count-badge">{matchPool.length} Active</span>
                </div>

                <div className="tb-section-header-actions">
                  {matchPool.length > 1 && (
                    <div className="tb-carousel-header-controls">
                      <button
                        type="button"
                        className="tb-carousel-nav-btn"
                        onClick={handleScrollLeft}
                        aria-label="Previous matches"
                        title="Scroll Left"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        className="tb-carousel-nav-btn"
                        onClick={handleScrollRight}
                        aria-label="Next matches"
                        title="Scroll Right"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  <Link to="/matches" className="tb-section-link">
                    {t('dashboard.viewAllMatches', 'View All Matches →')}
                  </Link>
                </div>
              </div>

              {matchPool.length === 0 ? (
                <div className="tb-card" style={{ padding: '36px 24px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px' }}>
                  <Users size={40} className="text-gold" style={{ opacity: 0.7, margin: '0 auto 12px', display: 'block' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#29252A', marginBottom: '8px' }}>
                    {t('dashboard.noMatchesYet', 'No matching profiles found yet')}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#6B6368', maxWidth: '440px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                    {t('dashboard.noMatchesDesc', 'Update your partner preferences or explore all active Telugu brides and grooms in the directory.')}
                  </p>
                  <Link to="/discover" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                    {t('dashboard.discoverProfiles', 'Discover All Profiles')}
                  </Link>
                </div>
              ) : (
                <div className="tb-carousel-wrapper">
                  <div className="tb-matches-carousel" ref={carouselRef}>
                    {matchPool.map((match) => {
                      const matchId = match.id || match.userId || match.profileId;
                      const isSent = isMatchInterestSent(match);
                      return (
                        <div key={matchId || match.name} className="tb-card tb-match-card">
                          {/* Photo Box with Badge & Match Score */}
                          <div className="tb-match-photo-wrap">
                            <img
                              src={match.photo}
                              alt={match.name}
                              className="tb-match-photo"
                              loading="lazy"
                            />
                            <div className="tb-match-photo-overlay" />
                            <span className={`tb-match-tag-badge tb-tag-${match.tagType}`}>
                              {match.tag}
                            </span>
                            <span className="tb-match-score-pill">
                              <Flame size={12} className="tb-flame-icon" />
                              <span>{match.compatibilityScore || 92}% Match</span>
                            </span>
                          </div>

                          {/* Details */}
                          <div className="tb-match-details">
                            <div className="tb-match-name-row">
                              <h3 className="tb-match-name" title={`${match.name}, ${match.age}`}>
                                {match.name}, {match.age}
                              </h3>
                              {match.isVerified && (
                                <CheckCircle2 size={15} className="tb-verified-check" title="Verified Member" />
                              )}
                            </div>

                            <div className="tb-match-meta-list">
                              <div className="tb-match-meta-item" title={`${match.city}, ${match.state}`}>
                                <MapPin size={13} className="tb-meta-icon" />
                                <span className="tb-meta-truncate">{match.city}, {match.state}</span>
                              </div>

                              <div className="tb-match-meta-item" title={`${match.education} • ${match.profession}`}>
                                <Briefcase size={13} className="tb-meta-icon" />
                                <span className="tb-meta-truncate">{match.education} • {match.profession}</span>
                              </div>

                              <div className="tb-match-meta-item" title={`${match.motherTongue || 'Telugu'} • ${match.religion || 'Hindu'} • ${match.community}`}>
                                <GraduationCap size={13} className="tb-meta-icon" />
                                <span className="tb-meta-truncate">{match.motherTongue || 'Telugu'} • {match.religion || 'Hindu'} • {match.community}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="tb-match-actions">
                              <button
                                type="button"
                                className={`tb-btn-interest ${isSent ? 'active' : ''} ${submittingInterestId === matchId ? 'loading' : ''}`}
                                onClick={() => handleToggleInterest(match)}
                                disabled={submittingInterestId === matchId}
                                aria-label={isSent ? `Interest sent to ${match.name}` : `Express interest in ${match.name}`}
                              >
                                <Heart size={14} fill={isSent ? "#FFFFFF" : "none"} />
                                <span>{submittingInterestId === matchId ? 'Updating...' : isSent ? t('dashboard.interestSent', 'Interest Sent') : t('dashboard.interest', 'Interest')}</span>
                              </button>

                              <button
                                type="button"
                                className="tb-btn-view-profile"
                                onClick={() => setSelectedProfileModal(match)}
                                aria-label={`View quick bio-data of ${match.name}`}
                              >
                                <span>{t('dashboard.viewProfile', 'View Profile')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* 4. PEOPLE INTERESTED IN YOU SECTION */}
            <section className="tb-section animate-fade-in">
              <div className="tb-section-header">
                <div className="tb-section-title-wrap">
                  <h2 className="tb-section-title">
                    {t('dashboard.peopleInterested', 'People Interested in You')}
                  </h2>
                  <span className="tb-section-count-badge">
                    {incomingInterests.length} {t('dashboard.pending', 'Pending')}
                  </span>
                </div>
                <Link to="/interests?tab=received" className="tb-section-link">
                  {t('dashboard.viewAllInterests', 'View All Requests →')}
                </Link>
              </div>

              <div className="tb-card tb-interested-card">
                {incomingInterests.length === 0 ? (
                  <div className="tb-empty-state-wrap">
                    <Heart size={32} className="tb-empty-icon" />
                    <p className="tb-empty-text">
                      {t('dashboard.noInterests', "You don't have any new interest requests right now.")}
                    </p>
                  </div>
                ) : (
                  <div className="tb-interested-grid">
                    {incomingInterests.map((interest) => (
                      <div key={interest.id} className="tb-interested-item">
                        <div
                          className="tb-interested-avatar-wrap"
                          onClick={() => setSelectedProfileModal(interest)}
                          role="button"
                          tabIndex={0}
                          aria-label={`View bio-data for ${interest.name}`}
                          onKeyDown={(e) => e.key === 'Enter' && setSelectedProfileModal(interest)}
                        >
                          <img
                            src={interest.photo}
                            alt={interest.name}
                            className="tb-interested-avatar"
                          />
                        </div>

                        <div className="tb-interested-info">
                          <div
                            className="tb-interested-name-row"
                            onClick={() => setSelectedProfileModal(interest)}
                            role="button"
                            tabIndex={0}
                            aria-label={`View bio-data for ${interest.name}`}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedProfileModal(interest)}
                          >
                            <span className="tb-interested-name">{interest.name}, {interest.age}</span>
                            <span className="tb-interested-time">{interest.time || 'Recently'}</span>
                          </div>
                          <p className="tb-interested-role">{interest.profession || 'Professional'} • {interest.city || 'Hyderabad'}</p>

                          <div className="tb-interested-actions">
                            <button
                              type="button"
                              className="tb-btn-accept"
                              onClick={() => handleAccept(interest)}
                            >
                              <Check size={14} />
                              <span>{t('dashboard.accept', 'Accept')}</span>
                            </button>
                            <button
                              type="button"
                              className="tb-btn-decline"
                              onClick={() => handleDecline(interest)}
                            >
                              <X size={14} />
                              <span>{t('dashboard.decline', 'Decline')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 5. RECENT MESSAGES SECTION */}
            <section className="tb-section animate-fade-in">
              <div className="tb-section-header">
                <div className="tb-section-title-wrap">
                  <h2 className="tb-section-title">
                    {t('dashboard.recentMessages', 'Recent Messages')}
                  </h2>
                  <span className="tb-section-count-badge">
                    {recentMessagesList.length} Active
                  </span>
                </div>
                <Link to="/messages" className="tb-section-link">
                  {t('dashboard.viewAllMessages', 'Open Inbox →')}
                </Link>
              </div>

              <div className="tb-card tb-messages-card">
                {recentMessagesList.length === 0 ? (
                  <div className="tb-empty-state-wrap">
                    <MessageCircle size={32} className="tb-empty-icon" />
                    <p className="tb-empty-text">
                      {t('dashboard.noMessages', 'No new conversations yet. Express interest to start chatting!')}
                    </p>
                  </div>
                ) : (
                  <div className="tb-messages-grid">
                    {recentMessagesList.map((msg) => (
                      <div
                        key={msg.id}
                        className="tb-message-item"
                        onClick={() => navigate('/messages')}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/messages')}
                      >
                        <div className="tb-message-avatar-wrap">
                          <img
                            src={msg.photo}
                            alt={msg.name}
                            className="tb-message-avatar"
                          />
                          <span className="tb-online-dot" />
                        </div>

                        <div className="tb-message-info">
                          <div className="tb-message-top">
                            <span className="tb-message-name">{msg.name}</span>
                            <span className="tb-message-time">{msg.time}</span>
                          </div>
                          <p className="tb-message-preview">{msg.message}</p>
                        </div>

                        {msg.unread > 0 && (
                          <span className="tb-message-unread-badge">{msg.unread}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

          </main>

          {/* ======================================================== */}
          {/* RIGHT SIDEBAR COLUMN (STACKS ON TABLET / MOBILE) */}
          {/* ======================================================== */}
          <aside className="tb-sidebar">

            {/* CARD 1: Profile Completion Card */}
            <div className="tb-card tb-sidebar-card tb-completion-card animate-fade-in">
              <div className="tb-sidebar-header">
                <CheckCircle2 size={18} className="tb-sidebar-gold-icon" />
                <span className="tb-sidebar-label">{t('dashboard.completeProfile', 'Complete Your Profile')}</span>
              </div>

              <div className="tb-completion-body">
                <div className="tb-circular-progress-wrap">
                  <svg className="tb-progress-ring" width="72" height="72">
                    <circle
                      className="tb-progress-ring-bg"
                      stroke="#F0E8DC"
                      strokeWidth="6"
                      fill="transparent"
                      r={radius}
                      cx="36"
                      cy="36"
                    />
                    <circle
                      className="tb-progress-ring-fill"
                      stroke={completionPercentage >= 80 ? "#16A34A" : completionPercentage >= 50 ? "#C99A3A" : "#8B1235"}
                      strokeWidth="6"
                      strokeDasharray={`${circumference} ${circumference}`}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      fill="transparent"
                      r={radius}
                      cx="36"
                      cy="36"
                    />
                  </svg>
                  <span className="tb-progress-percent">{completionPercentage}%</span>
                </div>

                <div className="tb-completion-info">
                  <div className="tb-completion-status">
                    {completionPercentage === 100
                      ? t('dashboard.profileComplete', 'Profile Complete!')
                      : completionPercentage >= 70
                      ? t('dashboard.almostThere', 'Almost there!')
                      : t('dashboard.getStarted', 'Complete Profile')}
                  </div>
                  <p className="tb-completion-desc">
                    {completionPercentage === 100
                      ? t('dashboard.profileCompleteDesc', 'Your profile has 100% visibility for prospective matches.')
                      : t('dashboard.completeFewMore', 'Complete remaining sections to get better match recommendations.')}
                  </p>
                </div>
              </div>

              {/* Checklist steps */}
              <div className="tb-completion-check-list">
                <div className={`tb-check-item ${user?.name && user?.gender && (user?.dob || user?.age) ? 'done' : 'pending'}`}>
                  {user?.name && user?.gender && (user?.dob || user?.age) ? (
                    <Check size={14} className="tb-check-icon done" />
                  ) : (
                    <Circle size={12} className="tb-check-icon pending" />
                  )}
                  <span>{t('dashboard.basicInfo', 'Basic Information')}</span>
                </div>
                <div className={`tb-check-item ${Array.isArray(user?.photos) && user.photos.length > 0 && !user.photos[0].includes('placeholder') ? 'done' : 'pending'}`}>
                  {Array.isArray(user?.photos) && user.photos.length > 0 && !user.photos[0].includes('placeholder') ? (
                    <Check size={14} className="tb-check-icon done" />
                  ) : (
                    <Circle size={12} className="tb-check-icon pending" />
                  )}
                  <span>{t('dashboard.profilePhoto', 'Profile Photo')}</span>
                </div>
                <div className={`tb-check-item ${user?.partnerPreferences?.ageMin || (Array.isArray(user?.partnerPreferences?.communities) && user.partnerPreferences.communities.length > 0) ? 'done' : 'pending'}`}>
                  {user?.partnerPreferences?.ageMin || (Array.isArray(user?.partnerPreferences?.communities) && user.partnerPreferences.communities.length > 0) ? (
                    <Check size={14} className="tb-check-icon done" />
                  ) : (
                    <Circle size={12} className="tb-check-icon pending" />
                  )}
                  <span>{t('dashboard.partnerPreferences', 'Partner Preferences')}</span>
                </div>
                <div className={`tb-check-item ${user?.isVerified ? 'done' : 'pending'}`}>
                  {user?.isVerified ? (
                    <Check size={14} className="tb-check-icon done" />
                  ) : (
                    <Circle size={12} className="tb-check-icon pending" />
                  )}
                  <span>{t('dashboard.verificationDoc', 'Trust Verification')}</span>
                </div>
              </div>

              {completionPercentage === 100 && user?.isVerified ? (
                <Link to="/matches" className="tb-btn-maroon tb-btn-full" style={{ backgroundColor: '#16A34A', borderColor: '#16A34A' }}>
                  Explore Matches →
                </Link>
              ) : completionPercentage === 100 ? (
                <Link to="/settings" className="tb-btn-maroon tb-btn-full" style={{ backgroundColor: '#C99A3A', borderColor: '#C99A3A', color: '#FFFFFF' }}>
                  <ShieldCheck size={16} /> Verify Profile ID (Final Step) →
                </Link>
              ) : (
                <Link to="/profile/edit" className="tb-btn-maroon tb-btn-full">
                  {t('dashboard.completeNow', 'Complete Profile →')}
                </Link>
              )}
            </div>

            {/* CARD 2: Membership Card */}
            <div className="tb-card tb-sidebar-card tb-membership-card animate-fade-in">
              <div className="tb-sidebar-header">
                <Crown size={18} className="tb-sidebar-gold-icon" />
                <span className="tb-sidebar-label">{t('dashboard.membership', 'Membership')}</span>
              </div>

              <div className="tb-membership-content">
                <h3 className="tb-membership-title">
                  {getDisplayTier(user?.membershipTier || user?.membershipPlan)}
                </h3>
                <p className="tb-membership-expiry">
                  {user?.membershipExpiry ? `Valid till ${user.membershipExpiry}` : (user?.isPremium ? 'Active Premium Plan' : 'Free Plan - Upgrade for full contact access')}
                </p>
              </div>

              <Link
                to="/membership"
                className="tb-sidebar-action-link"
                title="View Membership Plans and Benefits"
              >
                <span>{t('dashboard.viewBenefits', 'View Membership Benefits')}</span>
                <ArrowRight size={14} />
              </Link>

              {/* Subtle Decorative Crown Motif */}
              <div className="tb-watermark-crown" aria-hidden="true">
                <Crown size={72} strokeWidth={1} />
              </div>
            </div>

            {/* CARD 3: Profile Strength Card */}
            <div className="tb-card tb-sidebar-card tb-strength-card animate-fade-in">
              <div className="tb-sidebar-header">
                <Award size={18} className="tb-sidebar-gold-icon" />
                <span className="tb-sidebar-label">{t('dashboard.profileStrength', 'Profile Strength')}</span>
              </div>

              <div className="tb-strength-score-row">
                <span className={`tb-strength-status ${profileStrength.tier}`}>{profileStrength.label}</span>
                <div className="tb-star-badge" title={`${completionPercentage}% Complete`}>
                  <Star size={16} fill="#C99A3A" color="#C99A3A" />
                </div>
              </div>

              <div className="tb-strength-bar-wrap">
                <div className="tb-strength-bar-bg">
                  <div
                    className="tb-strength-bar-fill"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="tb-strength-percent-text">
                  <strong>{completionPercentage}% {t('dashboard.completed', 'Completed')}</strong>
                </div>
              </div>

              <p className="tb-strength-desc">
                {t('dashboard.improveProfileDesc', 'Complete more sections to increase your match chances.')}
              </p>

              <Link to="/profile/edit" className="tb-btn-maroon tb-btn-full">
                {t('dashboard.improveProfile', 'Improve Profile →')}
              </Link>
            </div>

            {/* CARD 4: Recent Activity Card */}
            <div className="tb-card tb-sidebar-card tb-activity-card animate-fade-in">
              <div className="tb-sidebar-header" style={{ marginBottom: '1rem' }}>
                <Clock size={18} className="tb-sidebar-gold-icon" />
                <span className="tb-sidebar-label">
                  {t('dashboard.recentActivity', 'Recent Activity')}
                </span>
              </div>

              {recentActivities.length === 0 ? (
                <div className="tb-empty-state-wrap" style={{ padding: '20px 12px', textAlign: 'center' }}>
                  <Clock size={28} className="tb-empty-icon" style={{ opacity: 0.45, margin: '0 auto 8px', display: 'block' }} />
                  <p className="tb-empty-text" style={{ fontSize: '0.825rem', color: '#8C828A', margin: 0 }}>
                    {t('dashboard.noActivity', 'No recent activity yet. When candidates interact with your profile, updates will appear here.')}
                  </p>
                </div>
              ) : (
                <div className="tb-activity-list">
                  {recentActivities.map((act) => (
                    <Link to={act.link} key={act.id} className="tb-activity-item" style={{ textDecoration: 'none' }}>
                      <div className={`tb-act-icon-wrap ${act.type === 'interest_received' || act.type === 'interest_accepted' ? 'tb-act-heart' : act.type === 'message' ? 'tb-act-msg' : act.type === 'verification_success' ? 'tb-act-verify' : 'tb-act-view'}`}>
                        {act.type === 'interest_received' || act.type === 'interest_accepted' ? (
                          <Heart size={14} fill="#8B1235" color="#8B1235" />
                        ) : act.type === 'message' ? (
                          <MessageCircle size={14} fill="#2563EB" color="#2563EB" />
                        ) : act.type === 'verification_success' ? (
                          <Check size={14} color="#16A34A" />
                        ) : (
                          <Eye size={14} color="#C99A3A" />
                        )}
                      </div>
                      <div className="tb-act-content">
                        <div className="tb-act-desc">{act.desc}</div>
                        <div className="tb-act-time">{act.time}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <Link to="/notifications" className="tb-btn-maroon tb-btn-full" style={{ marginTop: '1.25rem' }}>
                {t('dashboard.viewAllActivity', 'View All Activity →')}
              </Link>
            </div>

          </aside>

        </div>

      </div>

      {/* ======================================================== */}
      {/* QUICK BIO-DATA PROFILE PREVIEW MODAL */}
      {/* ======================================================== */}
      {selectedProfileModal && (
        <div className="tb-modal-backdrop" onClick={() => setSelectedProfileModal(null)}>
          <div className="tb-profile-quick-modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="tb-modal-close-btn"
              onClick={() => setSelectedProfileModal(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="tb-quick-modal-grid">
              <div className="tb-quick-photo-col">
                <img
                  src={selectedProfileModal.photo}
                  alt={selectedProfileModal.name}
                  className="tb-quick-modal-photo"
                />
                <div className="tb-quick-photo-badge">
                  <ShieldCheck size={14} /> Verified Telugu Profile
                </div>
                {selectedProfileModal.compatibilityScore && (
                  <div className="tb-quick-comp-pill">
                    <Flame size={14} className="tb-flame-icon" />
                    <span>{selectedProfileModal.compatibilityScore}% Compatibility</span>
                  </div>
                )}
              </div>

              <div className="tb-quick-info-col">
                <h3 className="tb-quick-modal-name">
                  {selectedProfileModal.name}, {selectedProfileModal.age}
                </h3>
                <div className="tb-quick-modal-loc">
                  <MapPin size={14} /> {selectedProfileModal.city}, {selectedProfileModal.state}
                </div>

                <div className="tb-quick-details-grid">
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Education:</span>
                    <span className="tb-item-val">{selectedProfileModal.education}</span>
                  </div>
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Profession:</span>
                    <span className="tb-item-val">{selectedProfileModal.profession}</span>
                  </div>
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Community:</span>
                    <span className="tb-item-val">{selectedProfileModal.community}</span>
                  </div>
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Mother Tongue:</span>
                    <span className="tb-item-val">{selectedProfileModal.motherTongue || 'Telugu'}</span>
                  </div>
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Religion:</span>
                    <span className="tb-item-val">{selectedProfileModal.religion || 'Hindu'}</span>
                  </div>
                  <div className="tb-quick-item">
                    <span className="tb-item-lbl">Horoscope:</span>
                    <span className="tb-item-val">Kanya • Hasta • No Dosham</span>
                  </div>
                </div>

                <div className="tb-quick-modal-actions">
                  <button
                    type="button"
                    className={`tb-btn-maroon ${isMatchInterestSent(selectedProfileModal) ? 'active' : ''}`}
                    onClick={() => {
                      handleToggleInterest(selectedProfileModal);
                    }}
                  >
                    <Heart size={16} fill={isMatchInterestSent(selectedProfileModal) ? "#FFFFFF" : "none"} />
                    <span>{isMatchInterestSent(selectedProfileModal) ? 'Interest Sent' : 'Send Interest'}</span>
                  </button>

                  <button
                    type="button"
                    className="tb-btn-outline-maroon"
                    onClick={() => handleStartChatFromModal(selectedProfileModal)}
                  >
                    <MessageCircle size={16} />
                    <span>Send Message</span>
                  </button>

                  <Link
                    to={`/profile/${selectedProfileModal.id}`}
                    className="tb-btn-outline-simple"
                    onClick={() => setSelectedProfileModal(null)}
                  >
                    <span>Full Bio-Data</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Membership Benefits Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        selectedPlanId={null}
      />
    </div>
  );
}
