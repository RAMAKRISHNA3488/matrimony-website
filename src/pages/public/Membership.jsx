import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';
import {
  Crown,
  Check,
  X,
  ShieldCheck,
  Lock,
  Phone,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Search,
  MessageSquare,
  ArrowRight,
  Shield,
  Heart,
  CheckCircle2,
  Award,
  Zap,
  Eye,
  Sliders,
  CreditCard
} from 'lucide-react';
import UpgradeModal from '../../components/common/UpgradeModal';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages.css';

// Universal benefits included with every plan
const UNIVERSAL_BENEFITS = [
  {
    icon: CheckCircle2,
    title: "100% Detailed Matrimonial Profile",
    desc: "Create comprehensive personal, professional, education and family background profiles with verified badges."
  },
  {
    icon: Lock,
    title: "Strict Privacy and Photo Controls",
    desc: "You control who views your photos, contact details and horoscope with fine-grained privacy settings."
  },
  {
    icon: Sliders,
    title: "Telugu Community and Sub-caste Search",
    desc: "Filter prospective matches by Telugu districts, Gothram, education, profession and lifestyle preferences."
  },
  {
    icon: Heart,
    title: "Mutual Match Discovery",
    desc: "Express interest and discover compatible life partners with shared Telugu cultural and family values."
  },
  {
    icon: Shield,
    title: "Safety and Fraud Protection",
    desc: "24/7 profile monitoring, photo moderation and instant report/block tools to keep your search secure."
  },
  {
    icon: Award,
    title: "Horoscope Compatibility Preview",
    desc: "Compare Raasi, Nakshatram and basic horoscope parameters with prospective Telugu matches."
  }
];

// Comparison Table Data
const COMPARISON_ROWS = [
  {
    feature: "Detailed Matrimonial Profile",
    free: true,
    gold: true,
    diamond: true,
    elite: true
  },
  {
    feature: "Verified Phone Numbers View",
    free: "0 Contacts",
    gold: "50 Contacts",
    diamond: "120 Contacts",
    elite: "Unlimited"
  },
  {
    feature: "Direct Chat and Messaging",
    free: "On Mutual Accept",
    gold: "Instant Direct Chat",
    diamond: "Unlimited Chat and Calls",
    elite: "VIP Concierge and Chat"
  },
  {
    feature: "Search Placement and Visibility",
    free: "Standard",
    gold: "3× Visibility Boost",
    diamond: "Top 1st Page Guaranteed",
    elite: "VIP Priority Highlight"
  },
  {
    feature: "Detailed Kundali Matching",
    free: "Basic Preview",
    gold: "Full 36-Guna Report",
    diamond: "Full 36-Guna Report",
    elite: "Vedic Pundit Consultation"
  },
  {
    feature: "USA and Global NRI Matches",
    free: "Limited",
    gold: "Standard Access",
    diamond: "Full Priority Access",
    elite: "VIP Exclusive Pool"
  },
  {
    feature: "Dedicated Relationship Advisor",
    free: false,
    gold: false,
    diamond: "Onboarding Advisor",
    elite: "Senior Matchmaker VIP"
  }
];

// Trust Pillars Data
const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Contacts",
    desc: "Every contact number and profile is authenticated with mobile OTP and document verification."
  },
  {
    icon: Lock,
    title: "Privacy Protected",
    desc: "Your phone number and photographs are shared only when you give explicit authorization."
  },
  {
    icon: Zap,
    title: "Safe and Encrypted Payments",
    desc: "Support for UPI, Credit/Debit Cards and NetBanking with secure 256-bit bank-grade encryption."
  },
  {
    icon: Phone,
    title: "Dedicated Telugu Helpline",
    desc: "Speak with our caring relationship managers in Telugu for personalized guidance and support."
  }
];

// Membership FAQ Data
const MEMBERSHIP_FAQS = [
  {
    id: "faq-m-1",
    question: "Can I use TeluguBandham without a paid membership?",
    answer: "Yes. You can create your detailed profile, upload photos, browse all verified Telugu profiles, and receive incoming interests completely free. A paid plan is required to unlock direct verified phone numbers and initiate instant real-time conversations."
  },
  {
    id: "faq-m-2",
    question: "What is included in the Gold Membership?",
    answer: "Gold is our most popular plan for active match searches. It gives you 50 verified contact views, 3x search visibility boost, instant direct messaging with matches, full 36-Guna Kundali reports, and WhatsApp/SMS alerts for 3 full months."
  },
  {
    id: "faq-m-3",
    question: "How long does my membership remain active?",
    answer: "Your plan remains active for the full duration of your chosen period (3 months for Gold, 6 months for Diamond, and 12 months for Telugu Elite VIP). Any unused contact credits rollover if you renew your membership before expiry."
  },
  {
    id: "faq-m-4",
    question: "Can I upgrade my membership plan later?",
    answer: "Absolutely. You can upgrade from Free to Gold, or from Gold to Diamond/Elite at any time. When upgrading, your previous contact balance is automatically combined with your new plan's allocation."
  },
  {
    id: "faq-m-5",
    question: "Are payments refundable?",
    answer: "TeluguBandham strives to provide the highest quality matchmaking service. Once contact views or premium features are utilized, memberships are generally non-refundable. If you experience technical issues, our Telugu support team is available 7 days a week to assist."
  },
  {
    id: "faq-m-6",
    question: "How are my privacy settings handled when I upgrade?",
    answer: "Your privacy settings remain completely under your control at all times. Upgrading does not automatically expose your phone number or photos without your consent; you decide who gets access."
  }
];

// Modal shown when unauthenticated users attempt to select or apply any membership plan
function MembershipAuthModal({ isOpen, onClose, selectedPlan }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const planName = selectedPlan?.name || 'Membership Plan';
  const planPrice = selectedPlan?.price ? `₹${selectedPlan.price.toLocaleString('en-IN')}` : 'Free';
  const planPeriod = selectedPlan?.period ? `/ ${selectedPlan.period}` : '';

  const handleLogin = () => {
    onClose();
    navigate('/login', {
      state: {
        from: {
          pathname: '/membership',
          search: selectedPlan?.id ? `?plan=${selectedPlan.id}` : ''
        },
        planId: selectedPlan?.id
      }
    });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', {
      state: {
        from: {
          pathname: '/membership',
          search: selectedPlan?.id ? `?plan=${selectedPlan.id}` : ''
        },
        selectedPlan: selectedPlan?.id
      }
    });
  };

  return createPortal(
    <div
      className="animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-auth-title"
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
          maxWidth: '490px',
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
            padding: '1.25rem 1.5rem',
            position: 'relative',
            borderBottom: '1px solid rgba(201, 162, 74, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(201, 162, 74, 0.22)',
                border: '1.5px solid #C9A24A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E8D4A2',
                flexShrink: 0
              }}
            >
              <Crown size={20} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#E8D4A2',
                  display: 'block',
                  marginBottom: '2px'
                }}
              >
                Account Required
              </span>
              <h3
                id="membership-auth-title"
                style={{
                  margin: 0,
                  fontSize: '1.18rem',
                  fontWeight: '700',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-serif, "Playfair Display", Georgia, serif)'
                }}
              >
                Log In or Create Account
              </h3>
            </div>
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

        {/* Modal Body */}
        <div style={{ padding: '1.35rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Selected Plan Highlight Card */}
          {selectedPlan && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#FAF7F2',
                border: '1px solid rgba(201, 162, 74, 0.35)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#7A1635" />
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#6A636D', fontWeight: '600' }}>Chosen Plan:</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#5B1229' }}>
                    {planName}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#7A1635' }}>{planPrice}</span>
                <span style={{ fontSize: '0.74rem', color: '#6A636D', marginLeft: '2px' }}>{planPeriod}</span>
              </div>
            </div>
          )}

          <p style={{ margin: 0, fontSize: '0.88rem', color: '#4A4348', lineHeight: 1.55 }}>
            Membership plans are personalized and linked directly to your verified matrimonial profile. Please log in to your account or create a free profile before choosing a membership plan.
          </p>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(201, 162, 74, 0.1)',
              border: '1px dashed rgba(201, 162, 74, 0.55)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#7A1635" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#655018', fontWeight: '600', lineHeight: 1.35 }}>
              Your selected plan ({planName}) will be ready to activate immediately after you sign in or complete registration.
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: '#7A1635',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 3px 12px rgba(122, 22, 53, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#931B40';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7A1635';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Log In to Your Account</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '11px 18px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: '#7A1635',
                border: '1.5px solid #7A1635',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FAF0F2';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Create Free Profile</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7E767B',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Continue Browsing Plans
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Membership() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState(() => mockDb.getPlans());
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [authPromptPlan, setAuthPromptPlan] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleContentUpdate = () => {
      setPlans(mockDb.getPlans());
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'plans' || type === 'storage_sync') {
        handleContentUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
    };
  }, []);

  // When returning from login / register with a pre-selected plan, auto-open UpgradeModal for logged in user
  useEffect(() => {
    if (isAuthenticated) {
      const searchParams = new URLSearchParams(location.search);
      const planQuery = searchParams.get('plan') || location.state?.planId;
      if (planQuery && planQuery !== 'plan_free') {
        setSelectedPlanId(planQuery);
        setIsUpgradeOpen(true);
      }
    }
  }, [isAuthenticated, location]);

  const handleSelectPlan = (planId) => {
    setActiveCardId(planId);
    if (!isAuthenticated) {
      const planObj = plans.find((p) => p.id === planId) || { id: planId, name: 'Membership Plan' };
      setAuthPromptPlan(planObj);
      setIsAuthModalOpen(true);
      return;
    }
    if (planId === 'plan_free') {
      navigate('/discover');
      return;
    }
    setSelectedPlanId(planId);
    setIsUpgradeOpen(true);
  };

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="membership-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="membership-hero-compact" aria-labelledby="membership-hero-heading">
        <div className="container">
          <div className="membership-hero-content">
            <h1 id="membership-hero-heading" className="membership-hero-title">
              Choose Your Matchmaking Plan
            </h1>
            <p className="membership-hero-subtitle">
              Connect faster with verified phone numbers, direct messaging, and priority horoscope matching.
            </p>

            {!isAuthenticated && (
              <div
                style={{
                  marginTop: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(201, 162, 74, 0.15)',
                  border: '1px solid rgba(201, 162, 74, 0.4)',
                  color: '#655018',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}
              >
                <Lock size={13} color="#7A1635" />
                <span>Membership plans apply to your account. Log in or create a profile to activate.</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. 4-CARD PRICING SECTION */}
      <section className="membership-pricing-section" aria-label="Membership Pricing Plans">
        <div className="container">
          <div className="membership-pricing-grid">
            {plans.map((plan) => {
              const isPopular = plan.popular || plan.id === 'plan_gold';
              const isElite = plan.id === 'plan_elite';
              const isDiamond = plan.id === 'plan_diamond';
              const isFree = plan.price === 0;
              const isActive = activeCardId === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setActiveCardId(plan.id)}
                  className={`pricing-card ${
                    isPopular ? 'pricing-card-popular' : ''
                  } ${isElite ? 'pricing-card-elite' : ''} ${
                    isDiamond ? 'pricing-card-diamond' : ''
                  } ${isFree ? 'pricing-card-free' : ''} ${
                    isActive ? 'active' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setActiveCardId(plan.id);
                    }
                  }}
                  aria-pressed={isActive}
                >
                  {/* Card Header */}
                  <div className="pricing-card-top">
                    <span
                      className={`pricing-tier-pill ${
                        isFree
                          ? 'pill-free'
                          : isPopular
                          ? 'pill-gold'
                          : isDiamond
                          ? 'pill-diamond'
                          : 'pill-elite'
                      }`}
                    >
                      {plan.badge || (isFree ? 'Basic' : 'Premium')}
                    </span>
                    <h3 className="pricing-plan-name">{plan.name}</h3>
                    <p className="pricing-plan-tagline">{plan.tagline}</p>
                  </div>

                  {/* Pricing Block - Clean Stacked Layout */}
                  <div className="pricing-price-wrap">
                    <div className="pricing-main-price-row">
                      <span className="pricing-price-amount">
                        {isFree ? 'Free' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="pricing-price-period">/ {plan.period}</span>
                    </div>

                    <div className="pricing-sub-price-row">
                      {plan.originalPrice ? (
                        <>
                          <span className="pricing-price-original">
                            ₹{plan.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="pricing-save-badge">
                            {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="pricing-free-subtext">No payment required</span>
                      )}
                    </div>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    type="button"
                    className={`pricing-cta-btn ${
                      isPopular
                        ? 'cta-btn-gold-plan'
                        : isElite
                        ? 'cta-btn-elite-plan'
                        : isDiamond
                        ? 'cta-btn-diamond-plan'
                        : 'cta-btn-free-plan'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(plan.id);
                    }}
                    aria-label={isFree ? 'Explore free matches' : `Select ${plan.name} for ₹${plan.price}`}
                  >
                    {isFree ? (
                      <>
                        Explore Matches <ArrowRight size={14} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Select and Upgrade <ArrowRight size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>

                  {/* Features List */}
                  <div className="pricing-features-list">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="pricing-feature-item">
                        <Check size={16} className="pricing-feature-icon" aria-hidden="true" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {plan.limitations?.map((limit, idx) => (
                      <div key={idx} className="pricing-limitation-item">
                        <X size={16} className="pricing-limitation-icon" aria-hidden="true" />
                        <span>{limit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. UNIVERSAL INCLUSIONS ("What's Included With Every Plan") */}
      <section className="membership-universal-section" aria-labelledby="universal-heading">
        <div className="container">
          <div className="universal-header">
            <h2 id="universal-heading" className="universal-section-title">
              What's Included With Every Plan
            </h2>
            <p className="universal-section-desc">
              Every TeluguBandham member enjoys core trust, verified matchmaking, and privacy protections from day one.
            </p>
          </div>

          <div className="universal-features-grid">
            {UNIVERSAL_BENEFITS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="universal-feature-card">
                  <div className="universal-card-icon" aria-hidden="true">
                    <IconComp size={22} />
                  </div>
                  <div className="universal-card-content">
                    <h3 className="universal-card-title">{item.title}</h3>
                    <p className="universal-card-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURE COMPARISON MATRIX TABLE */}
      <section className="membership-comparison-section" aria-labelledby="comparison-heading">
        <div className="container">
          <div className="comparison-header">
            <h2 id="comparison-heading" className="universal-section-title">
              Compare Plan Capabilities
            </h2>
            <p className="universal-section-desc">
              Clear, transparent comparison to help you choose the best match search journey.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <div className="comparison-table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th style={{ width: '32%' }}>Feature</th>
                    <th style={{ width: '17%' }} className="comparison-cell-center">Free</th>
                    <th style={{ width: '17%' }} className="comparison-cell-center col-popular">Gold (Popular)</th>
                    <th style={{ width: '17%' }} className="comparison-cell-center">Diamond</th>
                    <th style={{ width: '17%' }} className="comparison-cell-center">Elite VIP</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx}>
                      <td className="comparison-feature-name">{row.feature}</td>

                      {/* Free */}
                      <td className="comparison-cell-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <Check size={18} className="comparison-check-icon" aria-label="Included" />
                          ) : (
                            <span className="comparison-dash" aria-label="Not Included">—</span>
                          )
                        ) : (
                          <span className="comparison-cell-text text-muted">{row.free}</span>
                        )}
                      </td>

                      {/* Gold */}
                      <td className="comparison-cell-center col-popular">
                        {typeof row.gold === 'boolean' ? (
                          row.gold ? (
                            <Check size={18} className="comparison-check-icon" aria-label="Included" />
                          ) : (
                            <span className="comparison-dash" aria-label="Not Included">—</span>
                          )
                        ) : (
                          <span className="comparison-cell-text text-popular">{row.gold}</span>
                        )}
                      </td>

                      {/* Diamond */}
                      <td className="comparison-cell-center">
                        {typeof row.diamond === 'boolean' ? (
                          row.diamond ? (
                            <Check size={18} className="comparison-check-icon" aria-label="Included" />
                          ) : (
                            <span className="comparison-dash" aria-label="Not Included">—</span>
                          )
                        ) : (
                          <span className="comparison-cell-text text-diamond">{row.diamond}</span>
                        )}
                      </td>

                      {/* Elite VIP */}
                      <td className="comparison-cell-center">
                        {typeof row.elite === 'boolean' ? (
                          row.elite ? (
                            <Check size={18} className="comparison-check-icon" aria-label="Included" />
                          ) : (
                            <span className="comparison-dash" aria-label="Not Included">—</span>
                          )
                        ) : (
                          <span className="comparison-cell-text text-elite">{row.elite}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST & CONFIDENCE SECTION ("Choose With Confidence") */}
      <section className="membership-trust-section" aria-labelledby="trust-heading">
        <div className="container">
          <div className="universal-header">
            <h2 id="trust-heading" className="universal-section-title">
              Choose With Confidence
            </h2>
            <p className="universal-section-desc">
              Your privacy, security and control remain at the heart of every TeluguBandham membership.
            </p>
          </div>

          <div className="trust-confidence-grid">
            {TRUST_PILLARS.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="trust-confidence-card">
                  <div className="trust-card-icon" aria-hidden="true">
                    <IconComp size={24} />
                  </div>
                  <h3 className="trust-card-title">{item.title}</h3>
                  <p className="trust-card-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. MEMBERSHIP FAQ ACCORDION SECTION */}
      <section className="membership-faq-section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="universal-header">
            <h2 id="faq-heading" className="universal-section-title">
              Membership FAQs
            </h2>
            <p className="universal-section-desc">
              Have questions regarding plan benefits or upgrade options? Here are answers to frequent queries.
            </p>
          </div>

          <div className="membership-faq-accordion" role="region" aria-label="Membership Frequently Asked Questions">
            {MEMBERSHIP_FAQS.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className={`membership-faq-card ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="membership-faq-trigger"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <span className="membership-faq-question">{faq.question}</span>
                    <div className="membership-faq-icon" aria-hidden="true">
                      <ChevronDown size={17} />
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${faq.id}`}
                    className={`membership-faq-answer-wrap ${isOpen ? 'show' : ''}`}
                  >
                    <div className="membership-faq-answer-inner">
                      <p className="membership-faq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL ACTION CTA (Only visible when user is not logged in) */}
      {!isAuthenticated && (
        <section className="membership-cta-section" aria-label="Call to Action">
          <div className="container">
            <div className="membership-cta-card">
              <h2 className="membership-cta-title">Ready to Take the Next Step?</h2>
              <p className="membership-cta-desc">
                Create your profile and start discovering meaningful Telugu connections tailored to your family and life goals.
              </p>
              <div className="membership-cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Profile <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <Link to="/discover" className="btn btn-secondary btn-lg">
                  Explore Matches
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upgrade Live Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => {
          setIsUpgradeOpen(false);
          setSelectedPlanId(null);
        }}
        selectedPlanId={selectedPlanId}
      />

      {/* Account Required / Login Prompt Modal */}
      <MembershipAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        selectedPlan={authPromptPlan}
      />
    </div>
  );
}

