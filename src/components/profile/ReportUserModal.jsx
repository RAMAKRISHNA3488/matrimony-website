import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Send } from 'lucide-react';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const REPORT_REASONS = [
  { id: 'fake', label: 'Fake profile, photo impersonation, or incorrect details' },
  { id: 'money', label: 'Requesting money, financial favors, or investment schemes' },
  { id: 'marital', label: 'Already married / misleading marital status' },
  { id: 'inappropriate', label: 'Inappropriate or abusive chat behavior' },
  { id: 'commercial', label: 'Commercial promotion or third-party agent' }
];

export default function ReportUserModal({ isOpen, onClose, reportedProfile, reportedUser, onSubmit }) {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetProfile = reportedProfile || reportedUser;

  if (!isOpen || !targetProfile) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      showToast("Please select a reason for the report", "warning");
      return;
    }

    const reporterUser = user || { id: 'TB-USER-01', name: 'Verified Member' };
    setIsSubmitting(true);

    setTimeout(() => {
      const reportPayload = {
        reportedProfile: targetProfile,
        reporter: reporterUser,
        category: selectedReason,
        reason: description || selectedReason
      };

      if (typeof onSubmit === 'function') {
        onSubmit(reportPayload);
      } else {
        mockDb.submitReport(reportPayload);
      }

      setIsSubmitting(false);
      showToast("Report submitted successfully. Our Trust and Safety team has flagged this profile for review. 🛡️", "success");
      setSelectedReason('');
      setDescription('');
      onClose();
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 25, 31, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 'var(--z-modal, 1000)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          padding: '0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light, #E8E0D9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--danger, #DC2626)',
            color: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={22} color="#FFFFFF" />
            <h3 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Report Profile: {targetProfile.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ color: 'rgba(255, 255, 255, 0.85)', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg, #FEF2F2)',
              border: '1px solid var(--danger-border, #F87171)',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: '#991B1B'
            }}
          >
            <AlertTriangle size={20} color="var(--danger, #DC2626)" style={{ flexShrink: 0 }} />
            <span>
              TeluguBandham maintains zero tolerance for fraudulent profiles, harassment, or financial solicitation.
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'block' }}>
              Reason for Report:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: '0.4rem 0.5rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: selectedReason === r.label ? 'var(--primary-50, #FDF2F4)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.label}
                    checked={selectedReason === r.label}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
              Additional Details / Evidence (Optional):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe any specific messages, phone calls, or observations..."
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit Confidential Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
