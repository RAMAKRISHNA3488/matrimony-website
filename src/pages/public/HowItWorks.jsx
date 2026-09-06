import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Heart,
  Lock,
  Users,
  CheckCircle2,
  ArrowRight,
  User,
  Search,
  Filter,
  Check,
  MessageCircle,
  Calendar,
  Award,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages.css';

// Step-specific details for the interactive popup window
const STEP_MODAL_DATA = {
  1: {
    stepNumber: 1,
    badge: 'Step 01 • Profile & Verification',
    title: 'Create Your Verified Profile',
    shortDesc: 'A comprehensive, verified profile establishes authenticity and builds confidence among prospective Telugu matches and their families.',
    icon: ShieldCheck,
    highlights: [
      {
        title: 'Education, Career & Lifestyle',
        desc: 'Highlight your academic degrees, current profession, employer, work location, and everyday lifestyle to paint a genuine picture of who you are.'
      },
      {
        title: 'Telugu Heritage & Community Roots',
        desc: 'Provide your Telugu community, Gothram, Raasi, Nakshatram, and family background for seamless cultural and astrological alignment.'
      },
      {
        title: 'Confidential Government ID Verification',
        desc: 'Submit official ID (such as Aadhaar) to earn a verified trust badge, proving authenticity while keeping your personal documents completely private.'
      },
      {
        title: 'Photos & Flexible Privacy Settings',
        desc: 'Upload high-quality photos with complete privacy control over who can view your photo album and sensitive contact information.'
      }
    ],
    proTip: 'Profiles with government ID verification receive up to 3x higher responses from genuine families.',
    ctaText: 'Create Your Profile',
    ctaLink: '/register'
  },
  2: {
    stepNumber: 2,
    badge: 'Step 02 • Intelligent Discovery',
    title: 'Set Preferences and Discover Matches',
    shortDesc: 'Customize criteria that matter most to you and your family to discover highly compatible Telugu brides and grooms.',
    icon: Filter,
    highlights: [
      {
        title: 'Tailored Partner Preference Filters',
        desc: 'Filter by age, height, educational level, profession, income, location (AP, Telangana, NRI), and community preferences.'
      },
      {
        title: 'Intelligent Compatibility Score',
        desc: 'Our proprietary algorithm evaluates compatibility across shared cultural values, lifestyle, career goals, and family expectations.'
      },
      {
        title: 'Curated Daily Match Stream',
        desc: 'Explore fresh, active, and thoroughly verified Telugu profiles recommended daily based on your high-priority criteria.'
      },
      {
        title: 'Family Shortlist & Collaboration',
        desc: 'Save promising profiles into your private shortlist so you and your elders can review and discuss potential matches together.'
      }
    ],
    proTip: 'Refining your partner preferences helps our matchmaking algorithm surface your highest-compatibility matches.',
    ctaText: 'Explore Matches',
    ctaLink: '/discover'
  },
  3: {
    stepNumber: 3,
    badge: 'Step 03 • 100% Private & Mutual Connection',
    title: 'Express Interest and Connect',
    shortDesc: 'Connect with confidence and dignity. Communication channels activate only when both individuals and their families show mutual interest.',
    icon: Lock,
    highlights: [
      {
        title: 'One-Click Expressions of Interest',
        desc: 'Send an expression of interest to profiles that catch your attention, accompanied by a polite personalized greeting.'
      },
      {
        title: 'Mutual Consent Safeguards',
        desc: 'Conversations unlock only once the recipient accepts your interest, ensuring a respectful and spam-free environment.'
      },
      {
        title: 'Secure In-App Chat & Messaging',
        desc: 'Communicate directly and safely within TeluguBandham without revealing your private mobile number or email address upfront.'
      },
      {
        title: 'Family Contact Information Exchange',
        desc: 'Exchange parent or guardian phone numbers smoothly when both sides agree to proceed to traditional family discussions.'
      }
    ],
    proTip: 'Sending a respectful, personalized message alongside your interest request significantly increases acceptance rates.',
    ctaText: 'Start Connecting',
    ctaLink: '/register'
  },
  4: {
    stepNumber: 4,
    badge: 'Step 04 • Two Families, One Journey',
    title: 'Build a Meaningful Relationship',
    shortDesc: 'Transition from online introductions into genuine, family-blessed understanding and a sacred lifelong matrimonial union.',
    icon: Heart,
    highlights: [
      {
        title: 'In-Depth Values & Vision Dialogue',
        desc: 'Discuss long-term goals, family traditions, career aspirations, and core values with open communication and mutual respect.'
      },
      {
        title: 'Elder Meetings & Horoscope Matching',
        desc: 'Coordinate traditional family meetings and Kundali/Jathakam matching with elder blessings in a respectful setting.'
      },
      {
        title: 'Safety Guidelines & Advisory Support',
        desc: 'Benefit from our safety guidelines, advisory tips, and support team to guide you through every pre-matrimonial stage.'
      },
      {
        title: 'A Blessed Lifelong Matrimony',
        desc: 'Celebrate an auspicious Telugu wedding uniting two families with trust, affection, cultural heritage, and lifelong happiness.'
      }
    ],
    proTip: 'Involving parents and elders early in the journey creates harmony, clarity, and blessings for both families.',
    ctaText: 'Find Your Partner',
    ctaLink: '/register'
  }
};

// Compact, accessible popup modal for each step
function StepDetailModal({ stepNumber, onClose, onSelectStep }) {
  const step = STEP_MODAL_DATA[stepNumber];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && stepNumber < 4) onSelectStep(stepNumber + 1);
      if (e.key === 'ArrowLeft' && stepNumber > 1) onSelectStep(stepNumber - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [stepNumber, onClose, onSelectStep]);

  if (!step) return null;

  const IconComponent = step.icon;

  return createPortal(
    <div
      className="animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="step-popup-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(20, 10, 16, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="step-modal-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'min(90vh, 680px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 24px 64px -12px rgba(91, 18, 41, 0.35), 0 8px 24px rgba(0, 0, 0, 0.12)',
          border: '1.5px solid rgba(201, 162, 74, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7A1635 0%, #520B1F 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.4rem',
            position: 'relative',
            borderBottom: '1px solid rgba(201, 162, 74, 0.3)',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#C9A24A',
                  color: '#520B1F',
                  fontWeight: '800',
                  fontSize: '0.78rem',
                  letterSpacing: '-0.02em',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}
              >
                0{step.stepNumber}
              </span>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#E8D4A2'
                }}
              >
                {step.badge}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close popup"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={16} />
            </button>
          </div>

          <h3
            id="step-popup-title"
            style={{
              margin: '0 0 4px 0',
              fontSize: '1.22rem',
              fontWeight: '700',
              color: '#FFFFFF',
              fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)',
              letterSpacing: '-0.01em'
            }}
          >
            {step.title}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '0.84rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.42
            }}
          >
            {step.shortDesc}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.15rem 1.35rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#7A1635',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconComponent size={14} color="#7A1635" />
            <span>Step Details & Features</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            {step.highlights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '9px 11px',
                  borderRadius: '12px',
                  backgroundColor: '#FAF7F2',
                  border: '1px solid #EFE6D8'
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FAF0F2',
                    border: '1px solid rgba(122, 22, 53, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    color: '#7A1635'
                  }}
                >
                  <CheckCircle2 size={12} color="#7A1635" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      color: '#29242A',
                      marginBottom: '2px'
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: '#655E63',
                      lineHeight: 1.42
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Step Pro Tip Strip */}
          {step.proTip && (
            <div
              style={{
                marginTop: '4px',
                padding: '8px 11px',
                borderRadius: '10px',
                backgroundColor: 'rgba(201, 162, 74, 0.1)',
                border: '1px dashed rgba(201, 162, 74, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Award size={14} color="#A37E2C" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.76rem', color: '#6A5016', fontWeight: '600', lineHeight: 1.35 }}>
                {step.proTip}
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.85rem 1.35rem',
            borderTop: '1px solid #EFE6D8',
            backgroundColor: '#FAF7F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0
          }}
        >
          {/* Step switcher pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <button
              type="button"
              disabled={step.stepNumber === 1}
              onClick={() => onSelectStep(step.stepNumber - 1)}
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1px solid #E0D5C5',
                background: '#FFFFFF',
                color: step.stepNumber === 1 ? '#CCC' : '#4A4346',
                cursor: step.stepNumber === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.76rem',
                fontWeight: '600'
              }}
              aria-label="Previous step"
            >
              <ChevronLeft size={13} /> Prev
            </button>

            <span style={{ fontSize: '0.76rem', color: '#7E767B', fontWeight: '600', minWidth: '38px', textAlign: 'center' }}>
              {step.stepNumber} / 4
            </span>

            <button
              type="button"
              disabled={step.stepNumber === 4}
              onClick={() => onSelectStep(step.stepNumber + 1)}
              style={{
                padding: '5px 8px',
                borderRadius: '8px',
                border: '1px solid #E0D5C5',
                background: '#FFFFFF',
                color: step.stepNumber === 4 ? '#CCC' : '#4A4346',
                cursor: step.stepNumber === 4 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.76rem',
                fontWeight: '600'
              }}
              aria-label="Next step"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 12px',
                borderRadius: '9px',
                border: '1px solid #D8CFC2',
                backgroundColor: '#FFFFFF',
                color: '#4A4346',
                fontWeight: '600',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>

            <Link
              to={step.ctaLink}
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '9px',
                backgroundColor: '#7A1635',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.8rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(122, 22, 53, 0.25)'
              }}
            >
              {step.ctaText} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function HowItWorks() {
  const { isAuthenticated } = useAuth();
  const [activeStepModal, setActiveStepModal] = useState(null);

  return (
    <div className="howpage-wrapper">
      {/* 1. HERO SECTION */}
      <section className="howpage-hero">
        <div className="howpage-bg-decor howpage-bg-decor-left" aria-hidden="true"></div>
        <div className="howpage-bg-decor howpage-bg-decor-right" aria-hidden="true"></div>

        <div className="howpage-container">
          <div className="howpage-hero-content">
            <span className="howpage-eyebrow-pill">STEP BY STEP GUIDE</span>
            <h1 className="howpage-hero-title">How TeluguBandham Works</h1>
            <p className="howpage-hero-desc">
              Four simple, trusted steps to discover and connect with your ideal Telugu life partner.
            </p>
          </div>
        </div>
      </section>

      {/* 2. 4-STEP JOURNEY SECTION */}
      <section className="howpage-journey-section">
        <div className="howpage-container">
          <div className="howpage-steps-grid">
            {/* ================= STEP 01 ================= */}
            <div className="howpage-step-item">
              <div
                className="howpage-card"
                onClick={() => setActiveStepModal(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStepModal(1);
                  }
                }}
                aria-haspopup="dialog"
                aria-label="Click to view details for Step 1: Create Your Verified Profile"
              >
                <div className="howpage-card-top">
                  <div className="howpage-step-badge-wrap">
                    <span className="howpage-step-badge">01</span>
                    <span className="howpage-step-cat">Step 1 • Profile</span>
                  </div>
                  <span className="howpage-verified-tag">
                    <ShieldCheck size={12} /> ID Verified
                  </span>
                </div>

                {/* Step 1 Visual Illustration */}
                <div className="howpage-visual-box">
                  <div className="step1-phone-mockup">
                    <div className="step1-phone-notch"></div>
                    <div className="step1-phone-screen">
                      <div className="step1-user-row">
                        <div className="step1-avatar-circle">
                          <User size={18} color="#FFFFFF" />
                        </div>
                        <div className="step1-user-details">
                          <span className="step1-user-name">Telugu Member</span>
                          <span className="step1-user-status">
                            <CheckCircle2 size={11} color="#059669" /> Aadhaar Verified
                          </span>
                        </div>
                      </div>

                      <div className="step1-progress-container">
                        <div className="step1-progress-labels">
                          <span>Profile Completion</span>
                          <span>100%</span>
                        </div>
                        <div className="step1-progress-track">
                          <div className="step1-progress-bar"></div>
                        </div>
                      </div>

                      <div className="step1-chips-grid">
                        <span className="step1-chip">🎓 M.S. / Tech Lead</span>
                        <span className="step1-chip">📍 Hyderabad, TS</span>
                        <span className="step1-chip">🕉️ Bharadwaja • Raasi</span>
                        <span className="step1-chip">👨‍👩‍👧‍👦 Family Values</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="howpage-card-body">
                  <h2 className="howpage-card-title">Create Your Verified Profile</h2>
                  <p className="howpage-card-desc">
                    Tell us about your education, profession, Telugu community, Gothram, Raasi and family background. Complete your profile and verification.
                  </p>
                  <span className="howpage-card-cta">
                    Get Started <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              {/* Connector 1 -> 2 */}
              <div className="howpage-connector" aria-hidden="true">
                <div className="howpage-connector-line"></div>
                <div className="howpage-connector-node">
                  <ArrowRight size={14} className="node-icon" />
                </div>
              </div>
            </div>

            {/* ================= STEP 02 ================= */}
            <div className="howpage-step-item">
              <div
                className="howpage-card"
                onClick={() => setActiveStepModal(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStepModal(2);
                  }
                }}
                aria-haspopup="dialog"
                aria-label="Click to view details for Step 2: Set Preferences and Discover Matches"
              >
                <div className="howpage-card-top">
                  <div className="howpage-step-badge-wrap">
                    <span className="howpage-step-badge">02</span>
                    <span className="howpage-step-cat">Step 2 • Discovery</span>
                  </div>
                  <span className="howpage-score-pill">
                    96% Match
                  </span>
                </div>

                {/* Step 2 Visual Illustration */}
                <div className="howpage-visual-box">
                  <div className="step2-discovery-mockup">
                    <div className="step2-filter-bar">
                      <span className="step2-filter-label"><Filter size={11} /> AP and TS • 25–29 yrs</span>
                      <span className="step2-filter-count">Verified</span>
                    </div>

                    <div className="step2-card-stack">
                      <div className="step2-back-card"></div>
                      <div className="step2-front-card">
                        <div className="step2-match-header">
                          <div className="step2-avatar-thumb">
                            <Heart size={14} color="#7A1635" />
                          </div>
                          <div className="step2-match-info">
                            <span className="step2-match-name">Compatible Match</span>
                            <span className="step2-match-sub">B.Tech + MBA • Software</span>
                          </div>
                          <span className="step2-badge-gold">Top Match</span>
                        </div>

                        <div className="step2-criteria-list">
                          <div className="step2-criteria-row">
                            <Check size={11} color="#059669" />
                            <span>Family and Community Roots</span>
                          </div>
                          <div className="step2-criteria-row">
                            <Check size={11} color="#059669" />
                            <span>Lifestyle and Career Aspirations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="howpage-card-body">
                  <h2 className="howpage-card-title">Set Preferences and Discover Matches</h2>
                  <p className="howpage-card-desc">
                    Set your partner preferences and discover Telugu profiles that match your values, lifestyle and expectations.
                  </p>
                  <span className="howpage-card-cta">
                    Explore Matches <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              {/* Connector 2 -> 3 */}
              <div className="howpage-connector" aria-hidden="true">
                <div className="howpage-connector-line"></div>
                <div className="howpage-connector-node">
                  <ArrowRight size={14} className="node-icon" />
                </div>
              </div>
            </div>

            {/* ================= STEP 03 ================= */}
            <div className="howpage-step-item">
              <div
                className="howpage-card"
                onClick={() => setActiveStepModal(3)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStepModal(3);
                  }
                }}
                aria-haspopup="dialog"
                aria-label="Click to view details for Step 3: Express Interest and Connect"
              >
                <div className="howpage-card-top">
                  <div className="howpage-step-badge-wrap">
                    <span className="howpage-step-badge">03</span>
                    <span className="howpage-step-cat">Step 3 • Connect</span>
                  </div>
                  <span className="howpage-secure-pill">
                    <Lock size={11} /> 100% Private
                  </span>
                </div>

                {/* Step 3 Visual Illustration */}
                <div className="howpage-visual-box">
                  <div className="step3-connect-mockup">
                    <div className="step3-nodes-row">
                      <div className="step3-node step3-node-left">
                        <User size={13} color="#7A1635" />
                      </div>
                      <div className="step3-connect-pulse">
                        <Heart size={14} color="#C9A24A" />
                        <span className="step3-mutual-text">Mutual Interest</span>
                      </div>
                      <div className="step3-node step3-node-right">
                        <User size={13} color="#7A1635" />
                      </div>
                    </div>

                    <div className="step3-chat-box">
                      <div className="step3-bubble step3-bubble-in">
                        <span>Namaste! Glad we connected. Looking forward to knowing your family traditions.</span>
                      </div>
                      <div className="step3-bubble step3-bubble-out">
                        <span>Mutual connection accepted! Let's connect.</span>
                      </div>
                    </div>

                    <div className="step3-secure-tag">
                      <ShieldCheck size={11} color="#059669" />
                      <span>Privacy Protected • Verified Exchange</span>
                    </div>
                  </div>
                </div>

                <div className="howpage-card-body">
                  <h2 className="howpage-card-title">Express Interest and Connect</h2>
                  <p className="howpage-card-desc">
                    Express interest in profiles you like. When interest is mutual, securely connect and start a conversation.
                  </p>
                  <span className="howpage-card-cta">
                    Start Connecting <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              {/* Connector 3 -> 4 */}
              <div className="howpage-connector" aria-hidden="true">
                <div className="howpage-connector-line"></div>
                <div className="howpage-connector-node">
                  <ArrowRight size={14} className="node-icon" />
                </div>
              </div>
            </div>

            {/* ================= STEP 04 ================= */}
            <div className="howpage-step-item">
              <div
                className="howpage-card"
                onClick={() => setActiveStepModal(4)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStepModal(4);
                  }
                }}
                aria-haspopup="dialog"
                aria-label="Click to view details for Step 4: Build a Meaningful Relationship"
              >
                <div className="howpage-card-top">
                  <div className="howpage-step-badge-wrap">
                    <span className="howpage-step-badge">04</span>
                    <span className="howpage-step-cat">Step 4 • Relationship</span>
                  </div>
                  <span className="howpage-bond-pill">
                    <Heart size={11} /> Lifelong Bond
                  </span>
                </div>

                {/* Step 4 Visual Illustration */}
                <div className="howpage-visual-box">
                  <div className="step4-relationship-mockup">
                    <div className="step4-emblem-wrap">
                      <div className="step4-emblem-circle">
                        <div className="step4-couple-icon-group">
                          <div className="step4-icon-avatar step4-bride">👰</div>
                          <div className="step4-icon-heart">❤️</div>
                          <div className="step4-icon-avatar step4-groom">🤵</div>
                        </div>
                      </div>
                    </div>

                    <div className="step4-harmony-badge">
                      <span className="step4-badge-title">Two Families • One Journey</span>
                      <span className="step4-badge-sub">Rooted in Telugu Heritage and Trust</span>
                    </div>

                    <div className="step4-pillars-row">
                      <span className="step4-pillar">✓ Shared Values</span>
                      <span className="step4-pillar">✓ Family Blessings</span>
                      <span className="step4-pillar">✓ True Love</span>
                    </div>
                  </div>
                </div>

                <div className="howpage-card-body">
                  <h2 className="howpage-card-title">Build a Meaningful Relationship</h2>
                  <p className="howpage-card-desc">
                    Move beyond profiles and conversations toward a genuine relationship built on shared values, family and trust.
                  </p>
                  <span className="howpage-card-cta">
                    Find Your Partner <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TRUST ROW */}
          <div className="howpage-trust-row" aria-label="Key Trust Commitments">
            <div className="howpage-trust-item">
              <CheckCircle2 size={18} className="trust-check-icon" />
              <span>Profile Verification</span>
            </div>
            <div className="howpage-trust-item">
              <CheckCircle2 size={18} className="trust-check-icon" />
              <span>Privacy Controls</span>
            </div>
            <div className="howpage-trust-item">
              <CheckCircle2 size={18} className="trust-check-icon" />
              <span>Secure Connections</span>
            </div>
            <div className="howpage-trust-item">
              <CheckCircle2 size={18} className="trust-check-icon" />
              <span>Telugu Community Focus</span>
            </div>
          </div>

          {/* 4. FINAL CTA (Only visible when user is not logged in) */}
          {!isAuthenticated && (
            <div className="howpage-cta-box">
              <h2 className="howpage-cta-title">Ready to Find Your Match?</h2>
              <p className="howpage-cta-desc">
                Create your free TeluguBandham profile and take the first step toward a meaningful life connection.
              </p>
              <div className="howpage-cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Profile
                </Link>
                <Link to="/discover" className="btn btn-secondary btn-lg">
                  Explore Matches <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Interactive Step Popup Window */}
      {activeStepModal && (
        <StepDetailModal
          stepNumber={activeStepModal}
          onClose={() => setActiveStepModal(null)}
          onSelectStep={(num) => setActiveStepModal(num)}
        />
      )}
    </div>
  );
}
