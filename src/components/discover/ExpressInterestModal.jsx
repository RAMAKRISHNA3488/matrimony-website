import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Check } from 'lucide-react';
import '../../styles/interest-modal.css';

const ICEBREAKERS = [
  "Namaskaram! I came across your profile and found our values and preferences to be very aligned. Would love to connect.",
  "Hello! I liked your bio-data and educational background. My parents and I are interested in taking the conversation forward.",
  "Namaskaram! Our horoscopes and lifestyle preferences seem to match wonderfully. Looking forward to getting to know each other.",
  "Hi! Impressed by your career journey and cultural interests. Would be delighted to connect."
];

export default function ExpressInterestModal({ isOpen, onClose, candidate, onSend }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  const handleSend = useCallback(() => {
    if (!candidate) return;
    const msgToSend =
      customMessage.trim() ||
      (selectedTemplate !== null
        ? ICEBREAKERS[selectedTemplate]
        : 'Namaskaram! I am interested in connecting with your profile.');
    onSend(candidate, msgToSend);
    onClose();
  }, [candidate, customMessage, selectedTemplate, onSend, onClose]);

  // Close on Escape key, Submit on Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        if (e.target.tagName === 'TEXTAREA' && !e.ctrlKey && !e.metaKey) {
          // Allow multi-line typing in textarea unless Ctrl/Cmd+Enter is pressed
          return;
        }
        e.preventDefault();
        handleSend();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleSend]);

  if (!isOpen || !candidate) return null;

  const handleSelect = (idx) => {
    setSelectedTemplate(idx);
    setCustomMessage(ICEBREAKERS[idx]);
  };


  const avatarSrc =
    (candidate.photos && candidate.photos[0]) ||
    (candidate.gender === 'male'
      ? '/assets/profiles/male/Male_Profile_01.jpg'
      : '/assets/profiles/female/Female_Profile_01.jpg');

  const modalContent = (
    <div
      className="tb-interest-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-modal-title"
    >
      <div
        className="tb-interest-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="tb-interest-modal-header">
          <h2 id="interest-modal-title" className="tb-interest-modal-title">
            <Send size={18} className="tb-interest-modal-title-icon" aria-hidden="true" />
            <span>Express Interest in {candidate.name}</span>
          </h2>
          <button
            type="button"
            className="tb-interest-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="tb-interest-modal-body">
          {/* Candidate Card preview */}
          <div className="tb-interest-candidate-card">
            <img
              src={avatarSrc}
              alt={candidate.name}
              className="tb-interest-candidate-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  candidate.gender === 'male'
                    ? '/assets/profiles/male/Male_Profile_01.jpg'
                    : '/assets/profiles/female/Female_Profile_01.jpg';
              }}
            />
            <div>
              <div className="tb-interest-candidate-name">{candidate.name}</div>
              <div className="tb-interest-candidate-meta">
                {candidate.age} yrs • {candidate.community || 'Telugu Community'} • {candidate.city || 'Hyderabad'}
              </div>
            </div>
          </div>

          <div>
            <label className="tb-interest-section-label">
              Choose an Icebreaker Message or Custom Note:
            </label>

            <div className="tb-interest-template-list">
              {ICEBREAKERS.map((text, idx) => (
                <div
                  key={idx}
                  tabIndex={0}
                  role="button"
                  onClick={() => handleSelect(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(idx);
                    }
                  }}
                  className={`tb-interest-template-item ${selectedTemplate === idx ? 'active' : ''}`}
                >
                  <div className="tb-interest-check-dot">
                    {selectedTemplate === idx && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                  </div>
                  <span className="tb-interest-template-text">
                    "{text}"
                  </span>
                </div>
              ))}
            </div>

            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Or write your personal introductory message..."
              className="tb-interest-textarea"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="tb-interest-modal-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSend}
          >
            <Send size={15} />
            <span>Send Free Interest</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
