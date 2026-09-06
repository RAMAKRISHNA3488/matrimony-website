import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Award, MapPin, GraduationCap, Users, Coffee, Flame, Send } from 'lucide-react';

export default function MatchReasonModal({ isOpen, onClose, candidate, compatibility, onSendInterest, onShortlist, isShortlisted }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  const breakdown = compatibility?.breakdown || {};
  const score = compatibility?.score || 85;

  const avatarSrc =
    (candidate.photos && candidate.photos[0]) ||
    (candidate.gender === 'male'
      ? '/assets/profiles/male/Male_Profile_01.jpg'
      : '/assets/profiles/female/Female_Profile_01.jpg');

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(20, 10, 15, 0.32)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'min(90vh, 640px)',
          margin: 'auto',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          padding: '0',
          position: 'relative',
          borderRadius: '16px',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.25), 0 8px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(201, 162, 74, 0.35)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Candidate summary */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary-900, #5C0E1E) 0%, var(--primary-800, #731320) 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            position: 'relative',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              color: 'rgba(255, 255, 255, 0.9)',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={avatarSrc}
              alt={candidate.name}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #C9A24A'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = candidate.gender === 'male' ? '/assets/profiles/male/Male_Profile_01.jpg' : '/assets/profiles/female/Female_Profile_01.jpg';
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>{candidate.name}</h3>
                {candidate.isVerified && (
                  <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                    Verified ✅
                  </span>
                )}
              </div>
              <p style={{ color: '#E8C872', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                {candidate.age} yrs • {candidate.city}, {candidate.state} • {candidate.profession}
              </p>
            </div>
          </div>

          {/* Compatibility Score Hero Meter */}
          <div
            style={{
              marginTop: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Flame size={22} color="#C99A3A" />
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#E8C872' }}>
                  Compatibility Match
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                  {score}% Match
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              Based on partner preferences
            </div>
          </div>
        </div>

        {/* Breakdown Items List */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, overflowY: 'auto' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Award size={18} className="text-gold" />
            Why this profile is a strong match for you:
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Age */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: breakdown.age?.matched ? 'var(--success-bg, #F0FDF4)' : '#FDF9F3',
                border: `1px solid ${breakdown.age?.matched ? 'var(--success-border, #BBF7D0)' : '#EFE4D6'}`
              }}
            >
              <CheckCircle size={17} color={breakdown.age?.matched ? '#16A34A' : '#718096'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Age and Life Stage (Weight: 20%)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {breakdown.age?.text || `Age ${candidate.age} matches your preferred age bracket.`}
                </div>
              </div>
            </div>

            {/* Location */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: breakdown.location?.matched ? 'var(--success-bg, #F0FDF4)' : '#FDF9F3',
                border: `1px solid ${breakdown.location?.matched ? 'var(--success-border, #BBF7D0)' : '#EFE4D6'}`
              }}
            >
              <MapPin size={17} color={breakdown.location?.matched ? '#16A34A' : '#718096'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Location Alignment (Weight: 15%)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {breakdown.location?.text || `Based in ${candidate.city}, matching preferred city hub.`}
                </div>
              </div>
            </div>

            {/* Education & Career */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: breakdown.education?.matched ? 'var(--success-bg, #F0FDF4)' : '#FDF9F3',
                border: `1px solid ${breakdown.education?.matched ? 'var(--success-border, #BBF7D0)' : '#EFE4D6'}`
              }}
            >
              <GraduationCap size={17} color={breakdown.education?.matched ? '#16A34A' : '#718096'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Education and Career Standing (Weight: 15%)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {breakdown.education?.text || `${candidate.education} • ${candidate.profession}`}
                </div>
              </div>
            </div>

            {/* Community & Cultural */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: breakdown.community?.matched ? 'var(--success-bg, #F0FDF4)' : '#FDF9F3',
                border: `1px solid ${breakdown.community?.matched ? 'var(--success-border, #BBF7D0)' : '#EFE4D6'}`
              }}
            >
              <Users size={17} color={breakdown.community?.matched ? '#16A34A' : '#718096'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cultural and Community Harmony (Weight: 15%)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {breakdown.community?.text || `${candidate.community} community with ${candidate.gothram} Gothram`}
                </div>
              </div>
            </div>

            {/* Lifestyle & Habits */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                backgroundColor: breakdown.lifestyle?.matched ? 'var(--success-bg, #F0FDF4)' : '#FDF9F3',
                border: `1px solid ${breakdown.lifestyle?.matched ? 'var(--success-border, #BBF7D0)' : '#EFE4D6'}`
              }}
            >
              <Coffee size={17} color={breakdown.lifestyle?.matched ? '#16A34A' : '#718096'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Diet and Living Habits (Weight: 15%)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {breakdown.lifestyle?.text || `${candidate.foodHabits} diet, non-smoking lifestyle.`}
                </div>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #ECE7E6'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => {
                if (onShortlist) onShortlist(candidate.id);
              }}
            >
              {isShortlisted ? "Shortlisted" : "Add to Shortlist"}
            </button>
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => {
                onClose();
                if (onSendInterest) onSendInterest(candidate);
              }}
            >
              <Send size={15} />
              <span>Express Interest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
