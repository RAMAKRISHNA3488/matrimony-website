import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  X,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Camera,
  GraduationCap,
  Compass,
  Home,
  Coffee,
  FileText,
  Heart,
  Lock,
  FileCheck
} from 'lucide-react';
import { calculateProfileCompletion } from '../../services/matchingAlgorithm';

export default function ProfileIncompleteModal({
  isOpen,
  onClose,
  user,
  actionType = 'interest', // 'interest' | 'message'
  targetName = 'Member',
  step = 'auto' // 'bio-data' | 'verification' | 'auto'
}) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const completion = calculateProfileCompletion(user);
  const percentage = completion.percentage || 30;
  const missingCheckpoints = completion.missingCheckpoints || [];
  const firstMissingTab = completion.firstMissingTab || 'personal';

  const isBioDataComplete = percentage >= 100 || missingCheckpoints.length === 0;
  const isVerified = Boolean(user?.isVerified);

  const currentStep = step === 'auto'
    ? (!isBioDataComplete ? 'bio-data' : 'verification')
    : step;

  const handleGoToEdit = () => {
    onClose?.();
    navigate(`/profile/edit?tab=${firstMissingTab}`);
  };

  const handleGoToVerification = () => {
    onClose?.();
    navigate('/settings');
  };

  const getTabIcon = (tabId) => {
    switch (tabId) {
      case 'photos': return Camera;
      case 'career': return GraduationCap;
      case 'horoscope': return Compass;
      case 'family': return Home;
      case 'lifestyle': return Coffee;
      case 'about': return FileText;
      case 'preferences': return Heart;
      default: return Sparkles;
    }
  };

  const getActionHeadline = () => {
    switch (actionType) {
      case 'chat':
        return `Complete 100% Profile to Chat with ${targetName || 'Members'}`;
      case 'message':
        return `Complete 100% Profile to Send Messages`;
      case 'shortlist':
        return `Complete 100% Profile to Shortlist Profiles`;
      case 'biodata':
        return `Complete 100% Profile to Download Bio-Data`;
      case 'report':
        return `Complete 100% Profile to Report Profiles`;
      case 'contact':
        return `Complete 100% Profile to View Contact Details`;
      default:
        return 'Complete 100% Profile to Access Features';
    }
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'chat':
        return `Direct chat requires a 100% completed profile to maintain trust and authenticity for Telugu families. Note: Express Interest is available without a 100% profile!`;
      case 'message':
        return `Messaging requires a 100% completed profile to protect members and ensure genuine intent. Note: Express Interest is available without a 100% profile!`;
      case 'shortlist':
        return `Shortlisting profiles requires a 100% completed profile. Note: Express Interest is available without a 100% profile!`;
      case 'biodata':
        return `Downloading official matrimonial bio-data requires a 100% completed profile. Note: Express Interest is available without a 100% profile!`;
      case 'report':
        return `Submitting profile reports requires a 100% completed profile to prevent abuse.`;
      case 'contact':
        return `Viewing verified contact numbers requires a 100% completed profile. Note: Express Interest is available without a 100% profile!`;
      default:
        return `TeluguBandham requires your profile to be 100% completed to unlock this feature. Note that Express Interest is available without a 100% profile.`;
    }
  };

  return (
    <div
      className="modal-overlay animate-fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '540px',
          maxHeight: 'min(92vh, 680px)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          border: '1px solid var(--border-light, #E2E8F0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #8B1235 0%, #5E0C23 100%)',
            padding: '1.25rem 1.4rem',
            color: '#FFFFFF',
            position: 'relative',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(201, 154, 58, 0.25)', border: '1px solid #C99A3A', color: '#FAD88A', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            <Lock size={13} />
            <span>{currentStep === 'verification' ? 'ID Verification Required' : '100% Profile Required'}</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            {currentStep === 'verification'
              ? (actionType === 'chat' || actionType === 'message' ? 'Verify ID to Chat' : 'ID Verification Required')
              : getActionHeadline()}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginTop: '0.4rem', lineHeight: 1.4 }}>
            {currentStep === 'verification'
              ? 'To protect families and maintain 100% authentic matchmaking, verify your ID document to activate your Trust Badge.'
              : getActionDescription()}
          </p>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {currentStep === 'verification' ? (
            /* STEP 2: ID Verification Required State */
            <div>
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <strong style={{ color: '#166534', fontSize: '0.95rem', display: 'block' }}>
                    100% Matrimonial Bio-Data Completed!
                  </strong>
                  <p style={{ fontSize: '0.825rem', color: '#15803D', marginTop: '0.25rem', lineHeight: 1.4, margin: 0 }}>
                    Final step: Submit your Govt ID (Aadhaar, Passport, or PAN) in Settings to activate your verified badge and start connecting with {targetName || 'prospective matches'}.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleGoToVerification}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.975rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary-700, #901B2C)',
                    borderColor: 'var(--primary-700, #901B2C)',
                    boxShadow: '0 4px 14px rgba(144, 27, 44, 0.25)',
                    borderRadius: '8px'
                  }}
                >
                  <ShieldCheck size={18} /> Verify ID Document Now →
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: Bio-Data Incomplete State */
            <div>
              {/* Progress Strip */}
              <div
                style={{
                  background: '#FDF7F8',
                  border: '1px solid #F6D4DC',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary-900, #5E0C23)' }}>
                    Your Profile Completion Score
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#8B1235' }}>
                    {percentage}% Completed
                  </span>
                </div>

                <div style={{ height: '8px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: percentage >= 70
                        ? 'linear-gradient(90deg, #16A34A 0%, #22C55E 100%)'
                        : 'linear-gradient(90deg, #8B1235 0%, #C99A3A 100%)',
                      borderRadius: '10px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748B)', marginTop: '0.4rem' }}>
                  {100 - percentage}% more to reach 100% bio-data status
                </div>
              </div>

              {/* Missing Checklist Items */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary, #1E293B)', marginBottom: '0.6rem' }}>
                  Remaining Sections to Complete:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                  {missingCheckpoints.map((cp, idx) => {
                    const Icon = getTabIcon(cp.id);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          onClose?.();
                          navigate(`/profile/edit?tab=${cp.id}`);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#8B1235';
                          e.currentTarget.style.backgroundColor = '#FFF5F7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <Icon size={16} color="#8B1235" />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                            {cp.name}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8B1235', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          Fill Now <ArrowRight size={12} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleGoToEdit}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem 1.25rem',
                    fontSize: '0.975rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(139, 18, 53, 0.25)',
                    borderRadius: '8px'
                  }}
                >
                  Complete My Profile ({100 - percentage}% Left) →
                </button>

                {actionType !== 'interest' && (
                  <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-700, #901B2C)',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '0.25rem 0.5rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Express Interest instead (Works without 100% profile)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
