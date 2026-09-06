import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { calculateCompatibility } from '../../services/matchingAlgorithm';
import {
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Bookmark,
  MessageCircle,
  Download,
  ShieldAlert,
  Lock,
  Phone,
  Check,
  ArrowLeft,
  Home,
  User as UserIcon,
  Moon,
  Send,
  Flame,
  Camera,
  Edit3,
  CheckCircle2,
  Heart,
  Users,
  X
} from 'lucide-react';
import ExpressInterestModal from '../../components/discover/ExpressInterestModal';
import ReportUserModal from '../../components/profile/ReportUserModal';
import BioDataPrintModal from '../../components/profile/BioDataPrintModal';
import MatchReasonModal from '../../components/discover/MatchReasonModal';
import '../../styles/profile.css';

export default function ProfileView() {
  const { id } = useParams();
  const { user, updateProfile } = useAuth();
  const { isShortlisted, toggleShortlist, sendInterest, getInterestStatus, showToast, checkProfileCompleteness, openOrCreateChat } = useApp();
  const navigate = useNavigate();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [revealedPhone, setRevealedPhone] = useState(false);

  // Contact edit states for own profile
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [profileRevision, setProfileRevision] = useState(0);

  // Real-time synchronization when admin updates profile details or interests change
  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'profiles' || type === 'user_updated' || type === 'storage_sync' || type === 'interests') {
        setProfileRevision((prev) => prev + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if viewing own profile
  const isOwnProfile = useMemo(() => {
    if (!user) return false;
    const cleanId = String(id || '').trim().toLowerCase();
    const currentId = String(user.id || '').trim().toLowerCase();
    return cleanId === 'me' || cleanId === currentId || cleanId === 'tb-user-01' || cleanId === 'tb-user-02';
  }, [id, user]);

  // Resolve candidate details
  const candidate = useMemo(() => {
    void profileRevision; // Explicitly consume revision signal to recompute when profile is edited
    if (isOwnProfile) {
      return user || mockDb.getCurrentUser();
    }
    const cleanId = String(id || '').trim();
    if (cleanId === 'me') {
      return user || mockDb.getCurrentUser();
    }
    const current = user || mockDb.getCurrentUser();
    if (current && String(current.id) === cleanId) {
      return current;
    }
    const found = mockDb.getProfileById(cleanId);
    return found || current || mockDb.getCurrentUser();
  }, [id, user, isOwnProfile, profileRevision]);

  if (!candidate) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Profile Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The requested TeluguBandham profile ID does not exist or may have been deactivated.
        </p>
        <Link to="/discover" className="btn btn-primary">
          Return to Discover
        </Link>
      </div>
    );
  }

  const shortlisted = isShortlisted(candidate.id);
  const interestStatus = getInterestStatus(candidate.id);
  const compatibility = calculateCompatibility(user, candidate);

  // Robust photo resolution
  const rawPhotos = candidate.photos || [];
  const validPhotos = Array.isArray(rawPhotos)
    ? rawPhotos.filter(p => p && typeof p === 'string' && p.trim().length > 0)
    : [];

  const fallbackPortrait = candidate.gender === 'female'
    ? '/assets/profiles/female/Female_Profile_01.jpg'
    : '/assets/profiles/male/Male_Profile_01.jpg';

  const hasPhotos = validPhotos.length > 0;
  const userInitial = (candidate.name || candidate.fullName || 'U').charAt(0).toUpperCase();

  const startEditContact = () => {
    const rawPhone = candidate.phone || candidate.mobileNumber || '';
    const cleanDigits = rawPhone.replace(/[^0-9]/g, '').slice(-10);
    setEditPhone(cleanDigits || '9876543210');
    setEditEmail(candidate.email || 'user@example.com');
    setIsEditingContact(true);
  };

  const handleSaveContact = async (e) => {
    e?.preventDefault?.();
    const cleanDigits = editPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.length !== 10) {
      showToast("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    if (!editEmail || !editEmail.includes('@') || !editEmail.includes('.')) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsSavingContact(true);
    const updatedPayload = {
      ...user,
      phone: `+91 ${cleanDigits}`,
      mobileNumber: cleanDigits,
      email: editEmail.trim()
    };

    try {
      if (updateProfile) {
        await updateProfile(updatedPayload);
      } else {
        mockDb.updateCurrentUserProfile(updatedPayload);
      }
      setIsSavingContact(false);
      setIsEditingContact(false);
      showToast("Contact details updated successfully! 🎉", "success");
    } catch (err) {
      setIsSavingContact(false);
      showToast("Failed to update contact details", "error");
    }
  };

  const handleRevealContact = () => {
    if (checkProfileCompleteness && !checkProfileCompleteness('contact', candidate.name || 'Member')) {
      return;
    }
    if (user?.isPremium || user?.membershipTier === 'Gold' || user?.membershipTier === 'Diamond' || user?.membershipTier === 'Elite VIP') {
      setRevealedPhone(true);
      showToast("Verified contact number revealed!", "success");
    } else {
      showToast("Contact details are reserved for Premium Members. Please upgrade your plan.", "info");
      navigate('/membership');
    }
  };

  const handleStartChat = () => {
    const activeUser = user || mockDb.getCurrentUser();
    if (!activeUser) {
      showToast("Please log in to chat with members", "warning");
      navigate('/login');
      return;
    }
    if (checkProfileCompleteness && !checkProfileCompleteness('chat', candidate.name || 'Member')) {
      return;
    }
    const conv = openOrCreateChat ? openOrCreateChat(candidate) : mockDb.getOrCreateConversation(activeUser, candidate);
    if (conv && conv.id) {
      navigate(`/messages?chat=${conv.id}`);
    } else {
      navigate(`/messages?participant=${candidate.id}`);
    }
  };

  return (
    <div className="profile-view-wrapper">
      <div className="container-wide">
        {/* Back Link */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back to Search Results
          </button>
        </div>

        {/* 1. Profile Hero Summary Header */}
        <div className="profile-hero-card animate-fade-in">
          {/* Gallery Side */}
          <div className="profile-gallery-container">
            <div className="profile-main-photo-wrap">
              {hasPhotos ? (
                <img
                  src={validPhotos[activePhotoIdx] || validPhotos[0]}
                  alt={candidate.name || 'TeluguBandham Member'}
                  className="profile-main-photo"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackPortrait;
                  }}
                />
              ) : isOwnProfile ? (
                <div className="profile-no-photo-wrap">
                  <div className="profile-no-photo-avatar">
                    {userInitial}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    No Photo Added Yet
                  </div>
                  <Link to="/profile/edit?tab=photos" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                    <Camera size={14} /> Add Profile Photo
                  </Link>
                </div>
              ) : (
                <img
                  src={fallbackPortrait}
                  alt={candidate.name || 'TeluguBandham Member'}
                  className="profile-main-photo"
                />
              )}

              {candidate.isVerified && (
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <span className="badge badge-gold">
                    <ShieldCheck size={13} /> 100% ID Verified
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Selectors if multiple photos exist */}
            {validPhotos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {validPhotos.map((p, idx) => (
                  <img
                    key={idx}
                    src={p}
                    alt={`Photo thumbnail ${idx + 1}`}
                    onClick={() => setActivePhotoIdx(idx)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackPortrait;
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activePhotoIdx === idx ? '2px solid var(--primary-700)' : '1px solid var(--border-light)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hero Bio Details & Action Bar */}
          <div className="profile-hero-content">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h1 className="profile-hero-name">
                  {candidate.name || candidate.fullName || 'Telugu Member'}, {candidate.age || 28} yrs
                </h1>

                {isOwnProfile ? (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.85rem',
                      background: 'linear-gradient(135deg, var(--primary-50, #FFF5F7) 0%, #FFF0F3 100%)',
                      color: 'var(--primary-800, #7A1428)',
                      border: '1px solid var(--primary-200, #F5C6CB)',
                      borderRadius: '20px'
                    }}
                  >
                    <span>My Profile (Public Preview)</span>
                  </div>
                ) : (
                  <div
                    className="card-match-badge"
                    onClick={() => setShowReasonModal(true)}
                    style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem', cursor: 'pointer' }}
                  >
                    <Flame size={14} color="#C99A3A" />
                    <span>{compatibility.score}% Compatibility Score</span>
                  </div>
                )}
              </div>

              {/* Demographics & Metadata */}
              <div className="profile-hero-meta" style={{ marginTop: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} className="text-gold" /> {candidate.city || 'Hyderabad'}, {candidate.state || 'Telangana'}
                  {candidate.country && candidate.country !== 'India' ? ` (${candidate.country})` : ''}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users size={14} /> {candidate.community || 'Telugu Community'}
                  {candidate.subCaste ? ` (${candidate.subCaste})` : ''}
                  {candidate.gothram ? ` • ${candidate.gothram} Gothram` : ''}
                </span>
                <span>•</span>
                <span>ID: {candidate.id || 'TB-USER-01'}</span>
              </div>
            </div>

            {/* Profession & Education Lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Briefcase size={16} color="var(--primary-700)" />
                <strong style={{ color: 'var(--text-primary)' }}>{candidate.profession || candidate.occupation || 'Software Professional'}</strong>
                {candidate.company && <span>at {candidate.company}</span>}
                {candidate.income && <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>({candidate.income})</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <GraduationCap size={16} color="var(--primary-700)" />
                <span>{candidate.education || 'Higher Education'}</span>
                {candidate.college && <span>• {candidate.college}</span>}
              </div>
            </div>

            {/* Action Bar */}
            <div className="profile-hero-actions">
              {isOwnProfile ? (
                <>
                  <Link to="/profile/edit" className="btn btn-primary">
                    <Edit3 size={16} /> Edit My Bio-Data
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (checkProfileCompleteness && !checkProfileCompleteness('biodata', 'My Profile')) {
                        return;
                      }
                      setShowPrintModal(true);
                    }}
                    className="btn btn-secondary action-btn-download"
                    title="Download Matrimonial Bio-Data Document"
                  >
                    <Download size={16} />
                    <span>Download Bio-Data</span>
                  </button>
                  <Link to="/profile/edit?tab=photos" className="btn btn-secondary">
                    <Camera size={16} /> Manage Photos
                  </Link>
                </>
              ) : (
                <>
                  {(interestStatus === 'pending' || interestStatus === 'Sent') ? (
                    <span className="badge badge-gold" style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}>
                      Interest Sent (Pending Response)
                    </span>
                  ) : (interestStatus === 'accepted' || interestStatus === 'Accepted') ? (
                    <span
                      className="badge badge-success"
                      style={{
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.875rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: '#ECFDF5',
                        color: '#047857',
                        border: '1px solid #A7F3D0',
                        borderRadius: '9999px',
                        fontWeight: 600
                      }}
                    >
                      <CheckCircle2 size={15} color="#059669" />
                      <span>Interest Accepted</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowInterestModal(true);
                      }}
                      className="btn btn-primary"
                    >
                      <Send size={16} /> Express Interest
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStartChat}
                    className="btn btn-secondary action-btn-chat"
                    title={`Chat directly with ${candidate.name || 'Member'}`}
                    aria-label={`Chat directly with ${candidate.name || 'Member'}`}
                  >
                    <MessageCircle size={16} />
                    <span>Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (checkProfileCompleteness && !checkProfileCompleteness('shortlist', candidate.name || 'Member')) {
                        return;
                      }
                      toggleShortlist(candidate.id);
                    }}
                    className={`btn btn-secondary action-btn-shortlist ${shortlisted ? 'btn-gold' : ''}`}
                    title={shortlisted ? "Remove from Shortlist" : "Add to Shortlist"}
                  >
                    <Bookmark size={16} fill={shortlisted ? "currentColor" : "none"} />
                    <span>{shortlisted ? "Shortlisted" : "Shortlist"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (checkProfileCompleteness && !checkProfileCompleteness('biodata', candidate.name || 'Member')) {
                        return;
                      }
                      setShowPrintModal(true);
                    }}
                    className="btn btn-secondary action-btn-download"
                    title="Download Matrimonial Bio-Data Document"
                  >
                    <Download size={16} />
                    <span>Download Bio-Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (checkProfileCompleteness && !checkProfileCompleteness('report', candidate.name || 'Member')) {
                        return;
                      }
                      setShowReportModal(true);
                    }}
                    className="btn btn-ghost action-btn-report"
                    title="Report Inappropriate Profile"
                  >
                    <ShieldAlert size={16} />
                    <span>Report</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Detailed Bio-Data Sections Grid */}
        <div className="biodata-grid">
          {/* Main Column */}
          <div>
            {/* About Profile */}
            <div className="biodata-card">
              <div className="biodata-card-header">
                <UserIcon size={20} color="var(--primary-700)" />
                <span>About {candidate.name || candidate.fullName || 'Member'}</span>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {candidate.aboutMe || candidate.about || "Looking for an understanding, educated life partner with good family values and progressive mindset."}
              </p>
            </div>

            {/* Astrological Horoscope (జాతకం) */}
            <div className="biodata-card">
              <div className="biodata-card-header">
                <Moon size={20} color="var(--gold-600)" />
                <span>Horoscope and Astrological Profile (జాతక వివరాలు)</span>
              </div>

              <div className="horoscope-grid">
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Gothram (గోత్రం)</span>
                  <span className="biodata-field-value">{candidate.gothram || 'Bharadwaja'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Raasi (రాశి)</span>
                  <span className="biodata-field-value">{candidate.raasi || 'Simham (Leo)'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Nakshatram (నక్షత్రం)</span>
                  <span className="biodata-field-value">{candidate.nakshatram || 'Makha'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Dosham / Kuja</span>
                  <span className="biodata-field-value">{candidate.dosham || 'No Dosham (శుద్ధ జాతకం)'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Time of Birth</span>
                  <span className="biodata-field-value">{candidate.birthTime || '07:15 AM'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Place of Birth / Native</span>
                  <span className="biodata-field-value">{candidate.nativePlace || candidate.birthPlace || candidate.city || 'Hyderabad, Telangana'}</span>
                </div>
              </div>
            </div>

            {/* Education & Career Background */}
            <div className="biodata-card">
              <div className="biodata-card-header">
                <GraduationCap size={20} color="var(--primary-700)" />
                <span>Education and Professional Career</span>
              </div>

              <div className="biodata-details-table">
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Highest Education</span>
                  <span className="biodata-field-value">{candidate.education || 'Higher Education'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">College / University</span>
                  <span className="biodata-field-value">{candidate.college || 'Reputed University'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Profession</span>
                  <span className="biodata-field-value">{candidate.profession || candidate.occupation || 'Software Professional'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Company / Employer</span>
                  <span className="biodata-field-value">{candidate.company || 'Leading Corporation'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Annual Package</span>
                  <span className="biodata-field-value" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                    {candidate.income || '₹30 - 45 Lakhs PA'}
                  </span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Work Location</span>
                  <span className="biodata-field-value">{candidate.city || 'Hyderabad'}, {candidate.state || 'Telangana'}</span>
                </div>
              </div>
            </div>

            {/* Family Background */}
            <div className="biodata-card">
              <div className="biodata-card-header">
                <Home size={20} color="var(--primary-700)" />
                <span>Family Background (కుటుంబ నేపథ్యం)</span>
              </div>

              <div className="biodata-details-table">
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Father's Profession</span>
                  <span className="biodata-field-value">{candidate.fatherOccupation || candidate.familyDetails?.father || 'Business / Retired Executive'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Mother's Profession</span>
                  <span className="biodata-field-value">{candidate.motherOccupation || candidate.familyDetails?.mother || 'Homemaker'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Siblings</span>
                  <span className="biodata-field-value">
                    {candidate.brothers || candidate.sisters
                      ? `${candidate.brothers || '0'} Brother(s), ${candidate.sisters || '0'} Sister(s)`
                      : (candidate.familyDetails?.siblings || '1 Brother (Pursuing Masters)')}
                  </span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Family Type / Values</span>
                  <span className="biodata-field-value">
                    {candidate.familyType || candidate.familyDetails?.type || 'Nuclear'} • {candidate.familyValues || candidate.familyDetails?.values || 'Traditional & Progressive'}
                  </span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Native Place</span>
                  <span className="biodata-field-value">{candidate.nativePlace || candidate.city || 'Vijayawada, Andhra Pradesh'}</span>
                </div>
                <div className="biodata-field-item">
                  <span className="biodata-field-label">Family Residence</span>
                  <span className="biodata-field-value">{candidate.familyLocation || `${candidate.city || 'Hyderabad'}, ${candidate.state || 'Telangana'}`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Column: Match Checklist & Contact Reveal */}
          <div>
            {/* Compatibility & Partner Expectations */}
            <div className="biodata-card" style={{ borderColor: 'var(--primary-200)' }}>
              <div className="biodata-card-header" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.05rem' }}>Partner Expectations</span>
                <span className="badge badge-gold">
                  {isOwnProfile ? 'Your Criteria' : `${compatibility.score}% Match`}
                </span>
              </div>

              <div className="preferences-checklist">
                <div className="preference-row">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Age Preference</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {candidate.partnerPreferences?.ageMin ? `${candidate.partnerPreferences.ageMin}–${candidate.partnerPreferences.ageMax} yrs` : (candidate.partnerPreferences?.ageRange || '24–28 yrs')}
                    </div>
                  </div>
                  <span className="checklist-match-tag"><Check size={14} /> Matched</span>
                </div>

                <div className="preference-row">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Preferred Communities</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {Array.isArray(candidate.partnerPreferences?.communities)
                        ? candidate.partnerPreferences.communities.join(', ')
                        : (candidate.partnerPreferences?.communities || candidate.community || 'Open to all Telugu communities')}
                    </div>
                  </div>
                  <span className="checklist-match-tag"><Check size={14} /> Matched</span>
                </div>

                <div className="preference-row">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Preferred Locations</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {Array.isArray(candidate.partnerPreferences?.locations)
                        ? candidate.partnerPreferences.locations.join(', ')
                        : (Array.isArray(candidate.partnerPreferences?.preferredLocations)
                          ? candidate.partnerPreferences.preferredLocations.join(', ')
                          : (candidate.partnerPreferences?.locations || 'Hyderabad, Bangalore, USA'))}
                    </div>
                  </div>
                  <span className="checklist-match-tag"><Check size={14} /> Matched</span>
                </div>

                <div className="preference-row">
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Diet & Habits</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {candidate.foodHabits || candidate.lifestyle?.diet || 'Non-Vegetarian'}
                      {candidate.drinking ? ` • Drinks: ${candidate.drinking}` : ''}
                    </div>
                  </div>
                  <span className="checklist-match-tag"><Check size={14} /> Matched</span>
                </div>
              </div>
            </div>

            {/* Protected Contact Numbers Card */}
            <div className="biodata-card" style={{ backgroundColor: 'var(--bg-warm)' }}>
              <div className="biodata-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Lock size={18} color="var(--primary-700)" />
                  <span style={{ fontSize: '1.05rem' }}>Contact Details</span>
                </div>
                {isOwnProfile && !isEditingContact && (
                  <button
                    type="button"
                    onClick={startEditContact}
                    className="btn btn-ghost btn-sm"
                    style={{
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.78rem',
                      color: 'var(--primary-700)',
                      border: '1px solid var(--primary-200)',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    title="Edit Verified Contact Details"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </div>

              {isOwnProfile ? (
                isEditingContact ? (
                  <form onSubmit={handleSaveContact} style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label className="search-input-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem', display: 'block' }}>
                        Your Mobile Number (10 Digits)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ padding: '0.55rem 0.75rem', background: '#EDE8E9', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          style={{
                            flex: 1,
                            padding: '0.55rem 0.75rem',
                            border: '1px solid var(--border-strong, #D4CCCB)',
                            borderRadius: '6px',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            letterSpacing: '0.5px'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="search-input-label" style={{ fontSize: '0.75rem', marginBottom: '0.3rem', display: 'block' }}>
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="yourname@example.com"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.75rem',
                          border: '1px solid var(--border-strong, #D4CCCB)',
                          borderRadius: '6px',
                          fontSize: '0.9rem'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isSavingContact}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        <Check size={14} /> {isSavingContact ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingContact(false)}
                        className="btn btn-secondary btn-sm"
                        style={{ justifyContent: 'center' }}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <span className="biodata-field-label">Your Mobile Number</span>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
                        {candidate.phone || (candidate.mobileNumber ? `+91 ${candidate.mobileNumber}` : '+91 98765 43210')}
                      </div>
                    </div>

                    <div>
                      <span className="biodata-field-label">Your Email Address</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>
                        {candidate.email || 'user@example.com'}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      ✓ This is your verified account contact info visible to accepted interest connections.
                    </div>
                  </div>
                )
              ) : revealedPhone ? (
                <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <span className="biodata-field-label">Mobile Number</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      {candidate.phone || (candidate.mobileNumber ? `+91 ${candidate.mobileNumber}` : '+91 98480 22341')}
                    </div>
                  </div>
                  <div>
                    <span className="biodata-field-label">Email Address</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {candidate.email || `contact.${candidate.name?.toLowerCase().replace(/\s+/g, '')}@example.com`}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Phone number and family contacts are protected under TeluguBandham Privacy Rules.
                  </p>
                  <button
                    type="button"
                    onClick={handleRevealContact}
                    className="btn btn-primary btn-sm w-full"
                  >
                    <Phone size={14} /> View Verified Phone Number
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ExpressInterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        candidate={candidate}
        onSend={(target, msg) => sendInterest(target, msg)}
      />

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedProfile={candidate}
        reportedUser={candidate}
      />

      <BioDataPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        profile={candidate}
      />

      <MatchReasonModal
        isOpen={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        candidate={candidate}
        compatibility={compatibility}
        onSendInterest={() => {
          setShowReasonModal(false);
          setShowInterestModal(true);
        }}
        onShortlist={(candId) => toggleShortlist(candId)}
        isShortlisted={shortlisted}
      />
    </div>
  );
}
