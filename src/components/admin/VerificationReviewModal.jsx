import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  AlertCircle,
  RotateCcw,
  Eye,
  FileSearch
} from 'lucide-react';
import '../../styles/admin.css';

export default function VerificationReviewModal({ isOpen, onClose, verification, onAction }) {
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomDoc, setZoomDoc] = useState(false);

  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store previous focused element to restore on modal close
    previousActiveElement.current = document.activeElement;

    // Focus the first interactive element or modal container
    const focusTimer = setTimeout(() => {
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !verification) return null;

  const handleAction = (status) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onAction(verification.id, status, reviewNotes);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="admin-modal-container large"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verif-modal-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--admin-warning-bg)',
                color: 'var(--admin-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 id="verif-modal-title" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: 0 }}>
                Review Verification Proof: {verification.userName}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                Queue ID: {verification.id} • Candidate ID: {verification.userId}
              </div>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Close verification modal">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', padding: '0.85rem 1rem', backgroundColor: 'var(--admin-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--admin-border-subtle)', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>CANDIDATE</span>
              <div style={{ fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '2px' }}>{verification.userName}</div>
            </div>

            <div>
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>LOCATION</span>
              <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', marginTop: '2px' }}>{verification.userCity}</div>
            </div>

            <div>
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>DOCUMENT TYPE</span>
              <div style={{ fontWeight: 800, color: 'var(--admin-primary)', marginTop: '2px' }}>{verification.documentType}</div>
            </div>

            <div>
              <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>SUBMISSION DATE</span>
              <div style={{ fontWeight: 600, color: 'var(--admin-text-primary)', marginTop: '2px' }}>
                {new Date(verification.submittedAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>

          {/* Document Preview Box */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                Submitted Document Inspection
              </label>
              <button
                type="button"
                className="admin-tab-btn"
                style={{ fontSize: '0.72rem' }}
                onClick={() => setZoomDoc(!zoomDoc)}
              >
                <Eye size={13} style={{ marginRight: '4px' }} />
                {zoomDoc ? 'Standard View' : 'Zoom Document'}
              </button>
            </div>

            <div
              style={{
                padding: zoomDoc ? '2rem' : '1.5rem',
                backgroundColor: 'var(--admin-surface)',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed var(--admin-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--admin-gold-tint)',
                  color: 'var(--admin-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileSearch size={28} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>
                  {verification.documentPreview}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                  Government Encrypted Record • Watermarked for TeluguBandham Trust Audit
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="admin-badge success">
                  <CheckCircle2 size={11} /> Cryptographic Signature Intact
                </span>
                <span className="admin-badge info">
                  Candidate Photo Matched 96%
                </span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              Verification Auditor Notes and Instructions
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="Government Aadhaar / Tax document verified by Trust team"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Footer with 3 Actions */}
        <div className="admin-modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-md"
            onClick={() => handleAction('Correction Requested')}
            disabled={isSubmitting}
            style={{ gap: '0.35rem', color: 'var(--admin-warning)' }}
          >
            <RotateCcw size={14} /> Request Re-upload
          </button>

          <button
            type="button"
            className="btn btn-danger btn-md"
            onClick={() => handleAction('Rejected')}
            disabled={isSubmitting}
            style={{ gap: '0.35rem' }}
          >
            <XCircle size={14} /> Reject Proof
          </button>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => handleAction('Approved')}
            disabled={isSubmitting}
            style={{ gap: '0.35rem', backgroundColor: 'var(--admin-success)', borderColor: 'var(--admin-success)' }}
          >
            <Check size={15} /> Approve and Grant Verified Badge
          </button>
        </div>
      </div>
    </div>
  );
}
