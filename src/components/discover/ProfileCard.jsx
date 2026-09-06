import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { calculateCompatibility } from '../../services/matchingAlgorithm';
import {
  Bookmark,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Crown,
  Flame,
  Check,
  CheckCircle2,
  Coins,
  Compass,
  ArrowRight,
  Heart,
  Users
} from 'lucide-react';

import MatchReasonModal from './MatchReasonModal';
import ExpressInterestModal from './ExpressInterestModal';
import '../../styles/cards.css';

export default function ProfileCard({ profile, viewMode = 'grid' }) {
  const { user } = useAuth();
  const { toggleShortlist, isShortlisted, sendInterest, withdrawInterest, interests, showToast, checkProfileCompleteness } = useApp();

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [localSent, setLocalSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const profileId = String(profile?.id || profile?.userId || profile?.profileId || '');
  const shortlisted = profileId ? isShortlisted(profileId) : false;
  const isInterestAlreadySent = Boolean(
    profileId &&
    Array.isArray(interests?.sent) &&
    interests.sent.some(
      (i) => (i.receiverId && String(i.receiverId).toLowerCase() === profileId.toLowerCase()) ||
             (i.targetId && String(i.targetId).toLowerCase() === profileId.toLowerCase()) ||
             (i.participantId && String(i.participantId).toLowerCase() === profileId.toLowerCase()) ||
             (profile?.name && i.receiverName && profile.name.trim().toLowerCase() === i.receiverName.trim().toLowerCase())
    )
  );

  useEffect(() => {
    if (!isInterestAlreadySent && localSent) {
      setLocalSent(false);
    }
  }, [isInterestAlreadySent, localSent]);

  if (!profile) return null;

  const isInterestSent = isInterestAlreadySent || localSent;
  const compatibility = calculateCompatibility(user, profile) || { score: 85, reasons: [] };

  const handleInterestSend = async (target, message) => {
    if (checkProfileCompleteness && !checkProfileCompleteness('interest', profile.name)) {
      return;
    }
    if (isProcessing) return;
    try {
      setIsProcessing(true);
      setLocalSent(true);
      if (sendInterest) {
        const res = await sendInterest(target || profile, message);
        if (res && res.success === false) {
          setLocalSent(false);
          if (res.reason !== 'PROFILE_INCOMPLETE') {
            showToast?.(res.message || "Unable to send interest", "warning");
          }
        }
      }
    } catch (err) {
      setLocalSent(false);
      showToast?.("Failed to express interest. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleInterest = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (isProcessing) return;

    if (isInterestSent) {
      try {
        setIsProcessing(true);
        setLocalSent(false);
        if (withdrawInterest) {
          await withdrawInterest(profileId);
        }
        showToast?.(`Interest withdrawn for ${profile.name || 'Member'} ↺`, "info");
      } catch (err) {
        setLocalSent(true);
        showToast?.("Failed to withdraw interest. Please try again.", "error");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (checkProfileCompleteness && !checkProfileCompleteness('interest', profile.name)) {
      return;
    }

    try {
      setIsProcessing(true);
      setLocalSent(true);
      if (sendInterest) {
        const res = await sendInterest(profile);
        if (res && res.success === false) {
          setLocalSent(false);
          if (res.reason !== 'PROFILE_INCOMPLETE') {
            showToast?.(res.message || "Unable to send interest", "warning");
          }
        }
      } else {
        showToast?.(`Interest expressed to ${profile.name || 'Member'}! 💕`, "success");
      }
    } catch (err) {
      setLocalSent(false);
      showToast?.("Failed to express interest. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const isList = viewMode === 'list';
  const defaultAvatar = profile.gender === 'male'
    ? '/assets/profiles/male/Male_Profile_01.jpg'
    : '/assets/profiles/female/Female_Profile_01.jpg';

  const photoSrc = (profile.photos && profile.photos[0]) || defaultAvatar;

  // Extract 2 key match reasons
  const matchHighlights = (compatibility.reasons && compatibility.reasons.length > 0)
    ? compatibility.reasons.slice(0, 2)
    : ["Age and Location Aligned", "Cultural Background Match"];

  return (
    <>
      <div className={`profile-card ${isList ? 'profile-card-horizontal' : ''} card-interactive animate-fade-in`}>
        {/* ================= COLUMN 1: PHOTO & BADGES ================= */}
        <div className="profile-card-image-wrap">
          <img
            src={photoSrc}
            alt={profile.name || 'Telugu Member'}
            className="profile-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultAvatar;
            }}
          />

          {/* Floating Top Badges */}
          <div className="card-floating-top">
            {profile.isVerified ? (
              <span className="card-verified-pill" title="100% ID Verified Profile">
                <ShieldCheck size={13} /> Verified
              </span>
            ) : profile.isPremium ? (
              <span className="card-premium-pill" title="Premium Telugu Member">
                <Crown size={13} /> Premium
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              className={`card-shortlist-btn ${shortlisted ? 'active' : ''}`}
              onClick={(e) => {
                e?.stopPropagation?.();
                if (checkProfileCompleteness && !checkProfileCompleteness('shortlist', profile.name)) {
                  return;
                }
                toggleShortlist(profile.id);
              }}
              title={shortlisted ? `Remove ${profile.name || 'Member'} from Shortlist` : `Add ${profile.name || 'Member'} to Shortlist`}
              aria-label={shortlisted ? `Remove ${profile.name || 'Member'} from Shortlist` : `Add ${profile.name || 'Member'} to Shortlist`}
            >
              <Bookmark
                size={15}
                fill={shortlisted ? "currentColor" : "none"}
                color={shortlisted ? "#FFFFFF" : "var(--primary-700, #901B2C)"}
              />
            </button>
          </div>

          {/* Floating Bottom Match Badge */}
          <div className="card-floating-bottom">
            <div
              className="card-match-badge"
              onClick={() => setIsReasonOpen(true)}
              title="Click to view full compatibility breakdown"
            >
              <Flame size={13} color="#C99A3A" />
              <span>{compatibility.score ?? 85}% Match</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: BODY DETAILS ================= */}
        {isList ? (
          /* ----- LIST VIEW BODY ----- */
          <div className="profile-card-body">
            <div>
              {/* Header: Name, Verified Status & Clear Demographics Row */}
              <div className="profile-list-header-row">
                <div className="profile-list-title-wrap">
                  <Link to={`/profile/${profile.id}`}>
                    <h3 className="profile-list-name">
                      {profile.name || 'Telugu Member'}
                    </h3>
                  </Link>
                  {profile.isVerified && (
                    <span className="profile-verified-badge" title="100% ID & Documents Verified">
                      <CheckCircle2 size={14} color="#059669" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {/* Explicit demographic attribute pills (Age, Height, Marital Status) */}
                <div className="profile-list-demographics-row">
                  <span className="profile-attr-pill" title="Age in years">
                    <strong>Age:</strong> {profile.age || 26} yrs
                  </span>
                  {profile.height && (
                    <span className="profile-attr-pill" title="Height">
                      <strong>Height:</strong> {profile.height}
                    </span>
                  )}
                  <span className="profile-attr-pill status" title="Marital Status">
                    <strong>Status:</strong> {profile.maritalStatus || 'Never Married'}
                  </span>
                </div>
              </div>

              {/* Location & Community Line - Clearly Labeled */}
              <div className="profile-list-meta-text">
                <div className="profile-meta-item">
                  <MapPin size={14} color="var(--primary-700, #901B2C)" />
                  <span>
                    <strong>Location:</strong> {profile.city || 'Hyderabad'}
                    {profile.state ? `, ${profile.state}` : ''}
                    {profile.country && profile.country !== 'India' ? ` (${profile.country})` : ''}
                  </span>
                </div>
                <div className="profile-meta-item">
                  <Users size={14} color="var(--primary-700, #901B2C)" />
                  <span>
                    <strong>Community:</strong> {profile.community || 'Telugu Community'}
                    {profile.subCaste ? ` (${profile.subCaste})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Info Matrix - Full Explicit Labels */}
            <div className="profile-list-info-matrix">
              <div className="profile-list-info-item" title={`Profession: ${profile.profession || 'Professional'}${profile.company ? ` at ${profile.company}` : ''}`}>
                <Briefcase size={15} />
                <span>
                  <strong>Profession:</strong> {profile.profession || 'Professional'}
                  {profile.company ? ` at ${profile.company}` : ''}
                </span>
              </div>

              <div className="profile-list-info-item" title={`Education: ${profile.education || 'Higher Education'}`}>
                <GraduationCap size={15} />
                <span>
                  <strong>Education:</strong> {profile.education || 'Higher Education'}
                </span>
              </div>

              <div className="profile-list-info-item" title={`Annual Package: ${profile.income || 'Undisclosed'}`}>
                <Coins size={15} />
                <span>
                  <strong>Annual Package:</strong> {profile.income || 'Undisclosed'}
                </span>
              </div>

              <div className="profile-list-info-item" title={`Gothram & Astrology: ${profile.gothram ? `${profile.gothram} Gothram` : 'Traditional roots'}${profile.raasi ? ` (${profile.raasi})` : ''}`}>
                <Compass size={15} />
                <span>
                  <strong>Gothram & Astro:</strong> {profile.gothram ? `${profile.gothram} Gothram` : 'Traditional roots'}
                  {profile.raasi ? ` (${profile.raasi.split(' ')[0]})` : ''}
                </span>
              </div>
            </div>

            {/* Compatibility Highlights & Bio snippet */}
            <div>
              <div className="profile-list-highlights-row">
                <span className="highlights-label">Match Highlights:</span>
                {matchHighlights.map((reason, idx) => (
                  <span key={idx} className="profile-list-match-pill">
                    <Check size={12} /> {reason}
                  </span>
                ))}
              </div>

              {profile.aboutMe && (
                <p className="profile-list-bio-snippet" style={{ marginTop: '0.45rem' }}>
                  <strong>About:</strong> "{profile.aboutMe}"
                </p>
              )}
            </div>
          </div>
        ) : (
          /* ----- GRID VIEW BODY ----- */
          <div className="profile-card-body">
            <div className="profile-card-header">
              <Link to={`/profile/${profile.id}`}>
                <h3 className="profile-card-name" title={profile.name}>
                  {profile.name || 'Telugu Member'}
                </h3>
              </Link>
              {profile.isVerified && (
                <span className="profile-verified-badge" title="100% ID Verified">
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* Compact Demographics Subtitle */}
            <div className="profile-card-subline">
              <span>{profile.age || 26} yrs</span>
              <span className="dot-sep">•</span>
              {profile.height && <span>{profile.height}</span>}
              {profile.height && <span className="dot-sep">•</span>}
              <span>{profile.maritalStatus || 'Never Married'}</span>
            </div>

            {/* Compact Details Rows */}
            <div className="profile-card-details">
              <div className="profile-detail-row" title={`Location & Community: ${profile.city || 'Hyderabad'}${profile.state ? `, ${profile.state}` : ''} • ${profile.community || 'Telugu'}`}>
                <MapPin size={13} />
                <span>{profile.city || 'Hyderabad'}{profile.state ? `, ${profile.state.split(' ')[0]}` : ''} • <strong>{profile.community || 'Telugu'}</strong></span>
              </div>
              <div className="profile-detail-row" title={`Profession: ${profile.profession || 'Professional'}${profile.company ? ` at ${profile.company}` : ''}`}>
                <Briefcase size={13} />
                <span>{profile.profession || 'Professional'}</span>
              </div>
              <div className="profile-detail-row" title={`Education & Package: ${profile.education || 'Graduate'}${profile.income ? ` (${profile.income})` : ''}`}>
                <GraduationCap size={13} />
                <span>{profile.education?.split('(')[0]?.trim() || 'Graduate'}{profile.income ? ` • ${profile.income}` : ''}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= COLUMN 3: ACTIONS & MATCH METER ================= */}
        {isList ? (
          /* ----- LIST VIEW ACTIONS ----- */
          <div className="profile-card-actions">
            <div className="profile-list-score-box">
              <div className="profile-list-score-title">
                <Flame size={16} color="#C99A3A" />
                <span>{compatibility.score ?? 85}% Match</span>
              </div>
              <button
                type="button"
                className="profile-list-score-link"
                onClick={() => setIsReasonOpen(true)}
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                Why you match →
              </button>
            </div>

            <button
              type="button"
              className={`tb-btn-interest profile-list-action-btn ${isInterestSent ? 'active' : ''} ${isProcessing ? 'loading' : ''}`}
              onClick={handleToggleInterest}
              disabled={isProcessing}
              aria-label={isInterestSent ? `Interest sent to ${profile.name}` : `Express interest in ${profile.name}`}
            >
              <Heart size={14} fill={isInterestSent ? "#FFFFFF" : "none"} />
              <span>{isProcessing ? 'Updating...' : isInterestSent ? 'Interest Sent' : 'Interest'}</span>
            </button>

            <Link
              to={`/profile/${profile.id}`}
              className="tb-btn-view-profile profile-list-action-btn"
            >
              <span>View Profile</span>
              <ArrowRight size={14} />
            </Link>

            <div className="profile-list-active-badge">
              <span className="profile-list-active-dot" />
              <span>{profile.lastActive || 'Active today'}</span>
            </div>
          </div>
        ) : (
          /* ----- GRID VIEW ACTIONS (Matches User Dashboard) ----- */
          <div className="profile-card-actions tb-match-actions">
            <button
              type="button"
              className={`tb-btn-interest ${isInterestSent ? 'active' : ''} ${isProcessing ? 'loading' : ''}`}
              onClick={handleToggleInterest}
              disabled={isProcessing}
              aria-label={isInterestSent ? `Interest sent to ${profile.name}` : `Express interest in ${profile.name}`}
            >
              <Heart size={14} fill={isInterestSent ? "#FFFFFF" : "none"} />
              <span>{isProcessing ? 'Updating...' : isInterestSent ? 'Interest Sent' : 'Interest'}</span>
            </button>

            <Link
              to={`/profile/${profile.id}`}
              className="tb-btn-view-profile"
              aria-label={`View full profile of ${profile.name}`}
            >
              <span>View Profile</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <MatchReasonModal
        isOpen={isReasonOpen}
        onClose={() => setIsReasonOpen(false)}
        candidate={profile}
        compatibility={compatibility}
        onSendInterest={() => {
          setIsReasonOpen(false);
          if (checkProfileCompleteness && !checkProfileCompleteness('interest', profile.name)) {
            return;
          }
          setIsInterestOpen(true);
        }}
        onShortlist={(id) => toggleShortlist(id)}
        isShortlisted={shortlisted}
      />

      <ExpressInterestModal
        isOpen={isInterestOpen}
        onClose={() => setIsInterestOpen(false)}
        candidate={profile}
        onSend={handleInterestSend}
      />
    </>
  );
}
