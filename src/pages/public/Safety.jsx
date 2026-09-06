import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  MessageSquare,
  UserX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import '../../styles/pages.css';

export default function Safety() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [safetyRules, setSafetyRules] = useState(() => mockDb.getSafetyRules());

  useEffect(() => {
    const handleContentUpdate = () => {
      setSafetyRules(mockDb.getSafetyRules());
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'safety' || type === 'storage_sync') {
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

  // Modals for Report & Block Guidance
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [reportProfileIdentifier, setReportProfileIdentifier] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleOpenReport = () => {
    if (!isAuthenticated) {
      showToast('Please log in to your account to report a profile.', 'info');
      navigate('/login', { state: { from: { pathname: '/safety' } } });
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleOpenBlock = () => {
    if (!isAuthenticated) {
      showToast('Please log in to your account to block a profile.', 'info');
      navigate('/login', { state: { from: { pathname: '/safety' } } });
      return;
    }
    setIsBlockModalOpen(true);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportProfileIdentifier.trim()) {
      showToast('Please enter the Profile Name or ID to report', 'warning');
      return;
    }
    if (!reportReason) {
      showToast('Please select a reason for reporting', 'warning');
      return;
    }

    setIsSubmittingReport(true);
    setTimeout(() => {
      mockDb.submitReport({
        reportedProfile: { name: reportProfileIdentifier, id: 'manual-report-' + Date.now() },
        reporter: user || { name: 'Anonymous Member', email: 'guest@telugubandham.com' },
        category: reportReason,
        reason: reportDetails || reportReason
      });

      setIsSubmittingReport(false);
      showToast('Report submitted successfully. Our Trust and Safety team will review it within 2 hours.', 'success');
      setIsReportModalOpen(false);
      setReportProfileIdentifier('');
      setReportReason('');
      setReportDetails('');
    }, 400);
  };

  const principles = [
    {
      number: '01',
      title: 'AUTHENTICITY',
      icon: <ShieldCheck size={20} className="sp-icon" />,
      desc: 'Review profiles carefully and look for consistent information.'
    },
    {
      number: '02',
      title: 'PRIVACY',
      icon: <Lock size={20} className="sp-icon" />,
      desc: 'Share personal information only when you feel comfortable.'
    },
    {
      number: '03',
      title: 'RESPECT',
      icon: <MessageSquare size={20} className="sp-icon" />,
      desc: 'Take conversations at your own pace and respect boundaries.'
    },
    {
      number: '04',
      title: 'CONTROL',
      icon: <UserX size={20} className="sp-icon" />,
      desc: 'Use reporting and blocking tools when something feels wrong.'
    }
  ];

  const beforeConnectTips = [
    'Review the complete profile',
    'Look for consistent information',
    'Ask questions naturally',
    'Take your time',
    'Meet in a public place',
    "Tell someone you trust where you're going"
  ];

  const sensitiveChips = [
    'Passwords',
    'OTPs',
    'Bank Details',
    'UPI PINs',
    'Card Details',
    'Government ID Numbers',
    'Home Address',
    'Private Financial Information'
  ];

  const warningSigns = [
    {
      title: 'Requests for money',
      desc: 'Someone asks for money, loans, emergency funds or financial assistance.'
    },
    {
      title: 'Pressure to move too quickly',
      desc: 'Someone pushes for immediate commitment or tries to bypass normal communication.'
    },
    {
      title: 'Inconsistent information',
      desc: 'Profile details, employment, location or personal stories do not match.'
    },
    {
      title: 'Avoiding reasonable verification',
      desc: 'Someone repeatedly refuses normal identity or profile verification when applicable.'
    },
    {
      title: 'Urgent financial emergencies',
      desc: 'Someone creates an emergency story and asks you to transfer money.'
    },
    {
      title: 'Suspicious links or files',
      desc: 'Someone sends unexpected links, downloads or requests for sensitive information.'
    }
  ];

  const communityStandards = [
    {
      num: '01',
      name: 'RESPECT',
      desc: 'Treat members and families with dignity.'
    },
    {
      num: '02',
      name: 'HONESTY',
      desc: 'Provide accurate information about yourself.'
    },
    {
      num: '03',
      name: 'CONSENT',
      desc: "Respect another person's decisions and boundaries."
    },
    {
      num: '04',
      name: 'NO HARASSMENT',
      desc: 'Threatening, abusive or inappropriate behavior is not acceptable.'
    },
    {
      num: '05',
      name: 'NO FRAUD',
      desc: 'Do not deceive, impersonate or financially exploit another member.'
    }
  ];

  return (
    <div className="safetypage-wrapper">
      {/* =========================================================================
          1. HERO SECTION (Compact 300–360px desktop)
          ========================================================================= */}
      <section className="safety-hero-compact">
        <div className="safety-bg-decor safety-bg-decor-left" aria-hidden="true"></div>
        <div className="safety-bg-decor safety-bg-decor-right" aria-hidden="true"></div>

        <div className="safety-container">
          <div className="safety-hero-inner">
            <span className="safety-eyebrow-tag">SAFETY AND TRUST</span>
            <h1 className="safety-hero-heading">Your Safety Comes First</h1>
            <p className="safety-hero-subtext">
              Build meaningful matrimonial connections while keeping your privacy, boundaries and personal information under your control.
            </p>
            <div className="safety-badge-wrap">
              <span className="safety-trust-badge">
                <Shield size={14} className="badge-shield-icon" />
                <span>Thoughtful matchmaking • Clear boundaries • Safer connections</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. SAFETY PRINCIPLES (Compact 4-Column Horizontal Grid)
          ========================================================================= */}
      <section className="safety-section-block">
        <div className="safety-container">
          <div className="safety-block-header">
            <h2 className="safety-block-title">Built Around Your Safety</h2>
            <p className="safety-block-subtitle">
              Simple principles that help you make confident decisions.
            </p>
          </div>

          <div className="principles-compact-grid">
            {safetyRules.map((rule, idx) => (
              <div key={rule.id || idx} className="principle-compact-card">
                <div className="p-card-top">
                  <span className="p-card-num">0{idx + 1}</span>
                  <div className="p-card-icon">
                    {idx === 0 ? <ShieldCheck size={20} className="sp-icon" /> :
                     idx === 1 ? <Lock size={20} className="sp-icon" /> :
                     idx === 2 ? <MessageSquare size={20} className="sp-icon" /> :
                     <UserX size={20} className="sp-icon" />}
                  </div>
                </div>
                <h3 className="p-card-title">{rule.title?.toUpperCase()}</h3>
                <p className="p-card-text">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. STAY SAFE — COMBINED PRACTICAL GUIDANCE (Two-Column Layout)
          ========================================================================= */}
      <section className="safety-section-block">
        <div className="safety-container">
          <div className="safety-block-header">
            <h2 className="safety-block-title">Stay Safe While You Connect</h2>
          </div>

          <div className="stay-safe-two-col">
            {/* Left: Before You Connect Checklist */}
            <div className="stay-safe-card">
              <h3 className="stay-safe-card-title">Before You Connect</h3>
              <ul className="connect-checklist">
                {beforeConnectTips.map((tip, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} className="checklist-check-icon" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Keep Personal Information Private */}
            <div className="stay-safe-card">
              <h3 className="stay-safe-card-title">Keep Personal Information Private</h3>
              <div className="privacy-chips-grid">
                {sensitiveChips.map((chip, idx) => (
                  <span key={idx} className="privacy-chip">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="privacy-warning-callout">
                <AlertTriangle size={16} className="warning-callout-icon" />
                <span>
                  Never share passwords, OTPs or financial credentials with another member.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. WARNING SIGNS + WHAT TO DO (3x2 Grid + Action Bar)
          ========================================================================= */}
      <section className="safety-section-block">
        <div className="safety-container">
          <div className="safety-block-header">
            <h2 className="safety-block-title">Know the Warning Signs</h2>
            <p className="safety-block-subtitle">
              Take a step back when something doesn't feel right.
            </p>
          </div>

          <div className="warning-signs-grid">
            {warningSigns.map((item, idx) => (
              <div key={idx} className="warning-sign-card">
                <h3 className="warning-card-title">{item.title}</h3>
                <p className="warning-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Compact Horizontal Action Bar */}
          <div className="safety-action-bar">
            <div className="action-bar-text">
              <h3 className="action-bar-title">Something doesn't feel right?</h3>
              <p className="action-bar-desc">
                Stop communication, don't send money, preserve relevant messages and report the profile.
              </p>
            </div>
            <div className="action-bar-buttons">
              <button
                type="button"
                className="btn-safety-primary"
                onClick={handleOpenReport}
                title={!isAuthenticated ? 'Please log in to report a profile' : 'Report a profile'}
              >
                <ShieldAlert size={15} /> Report a Profile
              </button>
              <button
                type="button"
                className="btn-safety-outline"
                onClick={handleOpenBlock}
                title={!isAuthenticated ? 'Please log in to block a profile' : 'Block a profile'}
              >
                <UserX size={15} /> Block a Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMMUNITY STANDARDS + FINAL CTA
          ========================================================================= */}
      <section className="safety-section-block">
        <div className="safety-container">
          <div className="safety-block-header">
            <h2 className="safety-block-title">Our Community Standards</h2>
            <p className="safety-block-subtitle">
              Respect, honesty and consent are the foundation of meaningful matchmaking.
            </p>
          </div>

          {/* 5 Row Compact List */}
          <div className="community-standards-table">
            {communityStandards.map((std) => (
              <div key={std.num} className="standard-table-row">
                <span className="standard-row-num">{std.num}</span>
                <span className="standard-row-name">{std.name}</span>
                <span className="standard-row-desc">{std.desc}</span>
              </div>
            ))}
          </div>

          {/* Compact Final CTA (Only visible when user is not logged in) */}
          {!isAuthenticated && (
            <div className="safety-cta-compact">
              <h2 className="safety-cta-title">Find Meaningful Connections With Confidence</h2>
              <p className="safety-cta-subtitle">
                Take your time, protect your privacy and connect with people who respect your values and boundaries.
              </p>
              <div className="safety-cta-btn-row">
                <Link to="/register" className="btn btn-primary btn-md">
                  Create Free Profile
                </Link>
                <Link to="/discover" className="btn btn-secondary btn-md">
                  Explore Matches <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          REPORT MODAL
          ========================================================================= */}
      {isReportModalOpen && (
        <div className="story-modal-overlay" onClick={() => setIsReportModalOpen(false)} role="dialog" aria-modal="true">
          <div className="safety-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="safety-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="#7A1635" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#5B1229', fontFamily: 'var(--font-serif)' }}>
                  Report a Profile
                </h3>
              </div>
              <button
                type="button"
                className="safety-modal-close"
                onClick={() => setIsReportModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="safety-modal-body">
              <p style={{ fontSize: '0.85rem', color: '#5A5751', marginBottom: '1rem', lineHeight: 1.5 }}>
                Our Trust and Safety team reviews all reports confidentially within 2 hours.
              </p>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5B1229', marginBottom: '0.3rem' }}>
                  Member Name or Profile ID *
                </label>
                <input
                  type="text"
                  placeholder="Enter Member Name or Matrimony ID"
                  value={reportProfileIdentifier}
                  onChange={(e) => setReportProfileIdentifier(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(201, 162, 74, 0.4)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5B1229', marginBottom: '0.3rem' }}>
                  Reason for Report *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(201, 162, 74, 0.4)',
                    fontSize: '0.875rem',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select a reason</option>
                  <option value="fake">Fake profile or misleading photos</option>
                  <option value="money">Requested money, loan or financial transfer</option>
                  <option value="marital">Misleading marital status</option>
                  <option value="inappropriate">Inappropriate or abusive behavior</option>
                  <option value="commercial">Commercial promotion or agent</option>
                  <option value="other">Other safety concern</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#5B1229', marginBottom: '0.3rem' }}>
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(201, 162, 74, 0.4)',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Confidential Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BLOCK GUIDANCE MODAL
          ========================================================================= */}
      {isBlockModalOpen && (
        <div className="story-modal-overlay" onClick={() => setIsBlockModalOpen(false)} role="dialog" aria-modal="true">
          <div className="safety-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="safety-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserX size={20} color="#7A1635" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#5B1229', fontFamily: 'var(--font-serif)' }}>
                  How Blocking Works
                </h3>
              </div>
              <button
                type="button"
                className="safety-modal-close"
                onClick={() => setIsBlockModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="safety-modal-body">
              <p style={{ fontSize: '0.875rem', color: '#4A4642', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                You have total control over who can view your profile and contact you:
              </p>

              <div style={{ background: '#FAF7F2', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1rem', border: '1px solid rgba(201, 162, 74, 0.25)' }}>
                <h4 style={{ fontSize: '0.825rem', color: '#5B1229', margin: '0 0 0.4rem 0', fontWeight: 700 }}>
                  To Block Any Profile:
                </h4>
                <ol style={{ paddingLeft: '1.15rem', margin: 0, fontSize: '0.825rem', color: '#5A5751', lineHeight: 1.55 }}>
                  <li>Open the member's profile card or chat conversation.</li>
                  <li>Click the <strong>Options (•••)</strong> icon.</li>
                  <li>Select <strong>Block Profile</strong>.</li>
                </ol>
              </div>

              <p style={{ fontSize: '0.775rem', color: '#8A6D3B', margin: 0, fontStyle: 'italic' }}>
                * Blocked members cannot send messages, view contact details, or browse your photos.
              </p>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsBlockModalOpen(false)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
