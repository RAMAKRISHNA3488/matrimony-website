import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Phone,
  FileCheck,
  Upload,
  Save,
  CheckCircle2,
  FileText,
  Trash2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const DOC_CONFIGS = {
  'Govt Aadhaar Card': {
    label: 'Aadhaar Number (12 Digits or Masked)',
    placeholder: 'Enter 12-digit Aadhaar number',
    hint: '🔒 Masked Aadhaar is accepted. Only the last 4 digits need to be visible for verification.',
    format: (val) => {
      const raw = val.replace(/[^0-9xX]/g, '').slice(0, 12);
      let masked = '';
      for (let i = 0; i < raw.length; i++) {
        if (i < 8) {
          masked += 'X';
        } else {
          masked += raw[i];
        }
      }
      const parts = masked.match(/.{1,4}/g);
      return parts ? parts.join(' ') : masked;
    },
    validate: (val) => {
      const clean = val.replace(/[\s-]/g, '').toUpperCase();
      return /^[X0-9]{8}[0-9]{4}$/.test(clean);
    },
    uploadPrompt: 'Upload front side copy of your Aadhaar Card (JPEG, PNG or PDF)'
  },
  'Indian Passport': {
    label: 'Passport Number (1 Letter + 7 Digits)',
    placeholder: 'Enter 8-character Passport number',
    hint: '🔒 Enter your 8-character Indian Passport booklet number.',
    format: (val) => {
      return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    },
    validate: (val) => {
      return /^[A-Z][0-9]{7}$/.test(val.trim().toUpperCase());
    },
    uploadPrompt: 'Upload photo of Passport Bio / Photo Page'
  },
  'PAN Card': {
    label: 'PAN Card Number (10 Characters)',
    placeholder: 'Enter 10-character PAN number',
    hint: '🔒 Standard 10-character alphanumeric Permanent Account Number.',
    format: (val) => {
      return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    },
    validate: (val) => {
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.trim().toUpperCase());
    },
    uploadPrompt: 'Upload clear photo of your PAN Card'
  },
  'Voter ID Card': {
    label: 'Voter ID / EPIC Number',
    placeholder: 'Enter Voter ID / EPIC number',
    hint: '🔒 Enter Election Commission of India (ECI) EPIC identification number.',
    format: (val) => val.toUpperCase().slice(0, 16),
    validate: (val) => val.trim().length >= 6,
    uploadPrompt: 'Upload front photo of your Voter ID / EPIC Card'
  },
  'Driving License': {
    label: 'Driving License (DL) Number',
    placeholder: 'Enter Driving License number',
    hint: '🔒 Enter State Transport Department Driving License Number.',
    format: (val) => val.toUpperCase().slice(0, 20),
    validate: (val) => val.trim().length >= 8,
    uploadPrompt: 'Upload front side photo of your Driving License'
  },
  'Corporate / IT Company ID': {
    label: 'Employee ID or Corporate Badge No.',
    placeholder: 'Enter Corporate / Employee ID',
    hint: '🔒 Enter Official Corporate Work Employee ID or Badge number.',
    format: (val) => val.slice(0, 24),
    validate: (val) => val.trim().length >= 4,
    uploadPrompt: 'Upload photo of your Company Employee ID Badge'
  }
};

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [privacySettings, setPrivacySettings] = useState({
    photoVisibility: user?.privacySettings?.photoVisibility || 'All Members',
    phoneVisibility: user?.privacySettings?.phoneVisibility || 'Accepted Interests Only',
    stealthMode: user?.privacySettings?.stealthMode || false
  });

  const [docType, setDocType] = useState(user?.verificationDocType || 'Govt Aadhaar Card');
  const [docNumber, setDocNumber] = useState(user?.verificationDocNumber || '');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);

  const fileInputRef = useRef(null);

  const currentConfig = DOC_CONFIGS[docType] || DOC_CONFIGS['Govt Aadhaar Card'];
  const isValidNumber = currentConfig.validate(docNumber);

  const handleDocTypeChange = (newType) => {
    setDocType(newType);
    setDocNumber('');
  };

  const handleDocNumberChange = (e) => {
    const rawVal = e.target.value;
    const formatted = currentConfig.format ? currentConfig.format(rawVal) : rawVal;
    setDocNumber(formatted);
  };

  const processFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    setAttachedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      isImage,
      previewUrl
    });
    showToast(`Document "${file.name}" attached successfully 📎`, "info");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    if (attachedFile?.previewUrl) {
      URL.revokeObjectURL(attachedFile.previewUrl);
    }
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast("Attached document removed", "info");
  };

  const handleSavePrivacy = (e) => {
    e.preventDefault();
    updateProfile({ privacySettings });
    showToast("Privacy settings updated successfully", "success");
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!docType) {
      showToast("Please select document type", "warning");
      return;
    }
    if (!docNumber.trim()) {
      showToast(`Please enter a valid ${currentConfig.label}`, "warning");
      return;
    }
    if (!isValidNumber) {
      showToast(`Please enter a valid number format for ${docType}`, "warning");
      return;
    }

    setIsSubmittingVerif(true);
    setTimeout(() => {
      // 1. Submit to verification queue in mockDb
      mockDb.submitVerification(user, docType, `${docType}: ${docNumber}`);
      
      // 2. Mark user verified in mockDb
      if (user?.id) {
        mockDb.adminVerifyUser(user.id, true);
      }

      // 3. Update AuthContext profile state
      updateProfile({
        isVerified: true,
        verificationStatus: 'Verified',
        verificationDocType: docType,
        verificationDocNumber: docNumber,
        verifiedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });

      setIsSubmittingVerif(false);
      setIsReverifying(false);
      showToast("ID Verification Successful! 🛡️ Your green Trust Badge is activated and all platform capabilities are unlocked!", "success");

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#C99A3A', '#8B1235']
        });
      } catch (err) {}

      // Redirect user to home / dashboard page upon completion
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }, 700);
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-950)' }}>
          Privacy, Safety and Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Control who views your contact details, photos, and submit verification documents.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* 1. ID Verification Submission */}
        <div className="card tb-settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={24} color="var(--success, #059669)" />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                Profile Trust and 100% ID Verification
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Verified profiles get a Green Trust Badge, higher authenticity, and full access to Express Interest and Messages.
              </p>
            </div>
          </div>

          {user?.isVerified && !isReverifying ? (
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(5, 150, 105, 0.08)',
                border: '1.5px solid rgba(5, 150, 105, 0.25)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#065F46', fontSize: '1rem', fontWeight: 800 }}>
                      Your Profile is 100% ID Verified & Approved!
                    </strong>
                    <span style={{ background: '#059669', color: '#FFFFFF', fontSize: '0.725rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                      Active
                    </span>
                  </div>
                  <p style={{ fontSize: '0.835rem', color: '#047857', marginTop: '0.2rem', margin: 0 }}>
                    {user.verificationDocType || 'Govt ID Proof'} ({user.verificationDocNumber || 'Verified ID'}) verified. Full platform access unlocked.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReverifying(true)}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.8rem', borderColor: '#059669', color: '#065F46', padding: '0.4rem 0.85rem' }}
              >
                Update / Re-verify
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.15rem' }}>
                {/* 1. Document Type Selector */}
                <div>
                  <label className="search-input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <span>Select ID Document Type</span>
                    <span style={{ color: '#E11D48' }}>*</span>
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => handleDocTypeChange(e.target.value)}
                    required
                    style={{ width: '100%', height: '42px', borderRadius: '8px', padding: '0 0.75rem' }}
                  >
                    <option value="Govt Aadhaar Card">Govt Aadhaar Card</option>
                    <option value="Indian Passport">Indian Passport</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Voter ID Card">Voter ID Card</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Corporate / IT Company ID">Corporate / IT Company ID</option>
                  </select>
                </div>

                {/* 2. Dynamic Beside Input */}
                <div>
                  <label className="search-input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                    <span>
                      {currentConfig.label} <span style={{ color: '#E11D48' }}>*</span>
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder={currentConfig.placeholder}
                      value={docNumber}
                      onChange={handleDocNumberChange}
                      required
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '8px',
                        padding: '0 0.75rem',
                        borderColor: 'var(--border-medium)',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #6B6368)', marginTop: '0.3rem' }}>
                    {currentConfig.hint}
                  </div>
                </div>
              </div>

              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                style={{ display: 'none' }}
              />

              {/* Interactive Upload / Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${isDragging ? '#8B1235' : attachedFile ? '#059669' : 'var(--border-medium, #D1D5DB)'}`,
                  borderRadius: '10px',
                  padding: attachedFile ? '1rem 1.25rem' : '1.5rem',
                  textAlign: 'center',
                  backgroundColor: isDragging ? '#FFF5F7' : attachedFile ? 'rgba(5, 150, 105, 0.04)' : 'var(--bg-warm, #FAF7F2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {attachedFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      {attachedFile.isImage && attachedFile.previewUrl ? (
                        <img
                          src={attachedFile.previewUrl}
                          alt="Document Preview"
                          style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                        />
                      ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                      )}
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>{attachedFile.name}</strong>
                          <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.725rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                            Attached
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, marginTop: '2px' }}>
                          Size: {attachedFile.size} • Click to replace file
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#DC2626', borderColor: '#FECDD3', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      title="Remove attached document"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFF5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1235' }}>
                      <Upload size={20} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: '#1E293B', display: 'block' }}>
                        {currentConfig.uploadPrompt}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Drag and drop file here, or browse device (Max 10 MB: JPEG, PNG, PDF)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                {isReverifying && (
                  <button
                    type="button"
                    onClick={() => setIsReverifying(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingVerif || (docNumber && !isValidNumber)}
                  style={{
                    backgroundColor: 'var(--primary-700, #901B2C)',
                    color: '#FFFFFF',
                    padding: '0.75rem 1.6rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(144, 27, 44, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: (docNumber && !isValidNumber) ? 'not-allowed' : 'pointer',
                    opacity: (docNumber && !isValidNumber) ? 0.65 : 1
                  }}
                >
                  <FileCheck size={16} />
                  {isSubmittingVerif ? "Verifying Profile..." : "Submit for Verification Badge"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 2. Privacy Settings */}
        <form onSubmit={handleSavePrivacy} className="card tb-settings-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Lock size={22} className="text-burgundy" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-900)' }}>
              Privacy and Visibility Controls
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="search-input-label">Photo Visibility</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                {[
                  "All Members",
                  "Visible only to Members I Accept Interest From",
                  "Hidden (Visible on direct request only)"
                ].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="photoVisibility"
                      value={opt}
                      checked={privacySettings.photoVisibility === opt}
                      onChange={(e) => setPrivacySettings((prev) => ({ ...prev, photoVisibility: e.target.value }))}
                      style={{ flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="search-input-label">Phone and Contact Number Privacy</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                {[
                  "Accepted Interests Only (Recommended)",
                  "Verified Premium Members",
                  "Hidden from All (Must request manually)"
                ].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="phoneVisibility"
                      value={opt}
                      checked={privacySettings.phoneVisibility === opt}
                      onChange={(e) => setPrivacySettings((prev) => ({ ...prev, phoneVisibility: e.target.value }))}
                      style={{ flexShrink: 0, cursor: 'pointer' }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Privacy Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
