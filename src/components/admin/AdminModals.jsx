import React, { useState } from 'react';
import {
  X,
  Shield,
  Send,
  MessageSquare,
  Download,
  Database,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  CreditCard,
  Star,
  Briefcase
} from 'lucide-react';
import { mockDb } from '../../services/mockDb';

/**
 * Add New Admin Modal (Super Admin only)
 */
export function AddAdminModal({ isOpen, onClose, onAdminAdded, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Moderator');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) return;

    const newAdmin = mockDb.addAdminMember({
      name,
      email,
      role,
      department
    });

    if (showToast) {
      showToast(`Admin account created for ${name} (${role}) 🎉`, "success");
    }
    if (onAdminAdded) onAdminAdded(newAdmin);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Add New Administrator</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Grant administrative clearance and assign RBAC roles</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Full Name</label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Official Admin Email</label>
              <input
                type="email"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="ramesh.ops@telugubandham.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Assigned Role</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Super Admin">Super Admin (Full System Clearance)</option>
                  <option value="Moderator">Moderator (Safety & Profiles)</option>
                  <option value="Finance Admin">Finance Admin (Billing & Refunds)</option>
                  <option value="Support Agent">Support Agent (Helpdesk & Match Assist)</option>
                  <option value="Content Manager">Content Manager (Stories & Marketing)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Department</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="Department Name"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Temporary Security Password</label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%', fontFamily: 'monospace' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '4px', display: 'block' }}>
                User will be prompted to set up 2FA and change password upon first sign-in.
              </span>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Create Admin Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Add New Candidate Member Modal (Quick Onboarding by Admin)
 */
export function AddMemberModal({ isOpen, onClose, onMemberAdded, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female',
    age: 26,
    community: 'Reddy',
    subCaste: 'Motati',
    city: 'Hyderabad',
    state: 'Telangana',
    profession: 'Software Engineer',
    company: 'Tech Solutions',
    education: 'B.Tech / MS',
    income: '₹20 - 30 Lakhs',
    membershipTier: 'Free',
    isVerified: true
  });

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProfile = mockDb.adminCreateProfile(formData);

    mockDb.addAuditLog({
      action: "Admin Created Candidate Member",
      target: `${newProfile.name} (${newProfile.id})`,
      targetType: "User Profile",
      details: `Direct member onboarded. Gender: ${newProfile.gender}, Community: ${newProfile.community}, City: ${newProfile.city}`
    });

    if (showToast) {
      showToast(`Candidate ${newProfile.name} registered instantly! 🎉`, "success");
    }
    if (onMemberAdded) onMemberAdded(newProfile);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Add New Candidate Member</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Directly register and publish a new matrimonial profile</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '68vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Candidate Full Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Sravani Rao or Srikanth Varma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Gender</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="female">Bride (Female)</option>
                  <option value="male">Groom (Male)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Age</label>
                <input
                  type="number"
                  min="21"
                  max="65"
                  className="admin-input"
                  style={{ width: '100%' }}
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Community</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={formData.community}
                  onChange={(e) => handleChange('community', e.target.value)}
                >
                  <option value="Reddy">Reddy</option>
                  <option value="Kamma">Kamma</option>
                  <option value="Kapu">Kapu / Telaga</option>
                  <option value="Arya Vysya">Arya Vysya</option>
                  <option value="Brahmin">Brahmin</option>
                  <option value="Velama">Velama</option>
                  <option value="Padmashali">Padmashali</option>
                  <option value="Yadava">Yadava</option>
                  <option value="Balija">Balija</option>
                  <option value="Other">Open to All</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Sub-Caste / Gothram</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Motati / Gautama"
                  value={formData.subCaste}
                  onChange={(e) => handleChange('subCaste', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>City</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Hyderabad, Vijayawada"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>State / Country</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="Telangana, India"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Profession</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Lead Software Engineer"
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Annual Income</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. ₹20 - 30 Lakhs"
                  value={formData.income}
                  onChange={(e) => handleChange('income', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Membership Tier</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={formData.membershipTier}
                  onChange={(e) => handleChange('membershipTier', e.target.value)}
                >
                  <option value="Free">Free</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Elite VIP">Elite VIP</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.4rem' }}>
                <input
                  type="checkbox"
                  id="add-member-verified"
                  checked={formData.isVerified}
                  onChange={(e) => handleChange('isVerified', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--admin-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="add-member-verified" style={{ fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
                  Mark as Verified Profile ✅
                </label>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Create & Publish Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Send Platform Announcement Modal
 */
export function AnnouncementModal({ isOpen, onClose, showToast }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!title || !message) return;

    mockDb.addNotification({
      type: 'announcement',
      title: `📢 ${title}`,
      message,
      link: '/dashboard'
    });

    mockDb.addAuditLog({
      action: "Dispatched Platform Announcement",
      target: `Audience: ${targetAudience}`,
      targetType: "Announcement",
      details: `Title: ${title}`
    });

    if (showToast) {
      showToast("Platform announcement broadcasted to selected members! 📢", "success");
    }
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Broadcast Announcement</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Publish system banners & alerts to TeluguBandham members</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Announcement Headline</label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="Announcement Headline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Target Audience</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="all">All Active Members (158,732)</option>
                <option value="free">Free Members (Upgrade Campaign)</option>
                <option value="unverified">Unverified Profiles (Document Reminder)</option>
                <option value="premium">Diamond & VIP Subscribers (Exclusive Events)</option>
                <option value="nri">USA & Global Telugu NRI Profiles</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Announcement Body</label>
              <textarea
                className="admin-input"
                rows="4"
                style={{ width: '100%', resize: 'vertical' }}
                placeholder="Enter message text that will be displayed in member notification trays and banners..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                style={{ flexShrink: 0, cursor: 'pointer' }}
              />
              <span>Also send urgent push alert & WhatsApp summary to opted-in users</span>
            </label>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Send Broadcast Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Bulk Message Dispatcher Modal
 */
export function BulkMessageModal({ isOpen, onClose, showToast }) {
  const [recipientGroup, setRecipientGroup] = useState('hyderabad');
  const [messageContent, setMessageContent] = useState('');

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    mockDb.addAuditLog({
      action: "Dispatched Bulk Notification",
      target: `Audience: ${recipientGroup}`,
      targetType: "Push Broadcast",
      details: `Dispatched campaign to ${recipientGroup}`
    });

    if (showToast) {
      showToast("Bulk notification campaign scheduled for transmission! 🚀", "success");
    }
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Bulk Direct Notification</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Send targeted alerts to segmented candidate cohorts</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSend}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Recipient Cohort</label>
              <select
                className="admin-select"
                style={{ width: '100%' }}
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
              >
                <option value="hyderabad">Hyderabad & Telangana Members (~66,000)</option>
                <option value="andhra">Andhra Pradesh Coastal Districts (~55,000)</option>
                <option value="it_engineers">Software & Tech Professionals (~42,000)</option>
                <option value="doctors">Doctors & Healthcare Professionals (~12,000)</option>
                <option value="unverified_profiles">Members with Unverified ID proof (~14,200)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Direct Notification Text</label>
              <textarea
                className="admin-input"
                rows="4"
                style={{ width: '100%', resize: 'vertical' }}
                placeholder="Enter notification copy here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Dispatch Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Export Data CSV Modal
 */
export function ExportDataModal({ isOpen, onClose, showToast }) {
  const [exportType, setExportType] = useState('users');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const res = mockDb.exportDataToCSV(exportType);
      setIsExporting(false);
      if (showToast) {
        showToast(`Exported ${res.filename} successfully! 📥`, "success");
      }
      onClose();
    }, 600);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Export Platform Data</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Generate secure CSV spreadsheet exports</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Dataset to Export</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'users', label: 'User Directory & Demographics', desc: 'All candidate profiles, age, caste, city, membership, status' },
                { id: 'transactions', label: 'Financial & Membership Transactions', desc: 'Payment gateway logs, Razorpay reference IDs, amounts, GST status' },
                { id: 'verifications', label: 'Verification Queue Records', desc: 'Submitted Aadhaar/Passport proof, verification notes and timestamps' },
                { id: 'audit_logs', label: 'Security & Operations Audit Trail', desc: 'Admin operations, IP addresses, target entities, timestamps' }
              ].map((item) => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: exportType === item.id ? '1.5px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                    backgroundColor: exportType === item.id ? 'var(--admin-primary-tint)' : 'var(--admin-surface-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    type="radio"
                    name="exportType"
                    checked={exportType === item.id}
                    onChange={() => setExportType(item.id)}
                    style={{ marginTop: '2px', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-text-primary)', lineHeight: 1.3 }}>{item.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', marginTop: '2px', lineHeight: 1.4 }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="btn btn-secondary btn-md" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-md" onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Compiling CSV..." : "Download CSV Export"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * System Backup Simulator Modal
 */
export function SystemBackupModal({ isOpen, onClose, showToast }) {
  const [step, setStep] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [latestRecord, setLatestRecord] = useState(null);

  if (!isOpen) return null;

  const handleStartBackup = () => {
    setStep('running');
    setProgress(15);

    setTimeout(() => setProgress(45), 500);
    setTimeout(() => setProgress(80), 1100);
    setTimeout(() => {
      setProgress(100);
      const record = mockDb.triggerSystemBackup("Manual Administrator Snapshot");
      setLatestRecord(record);
      setStep('done');
      if (showToast) {
        showToast("System database backup completed and verified! 💾", "success");
      }
    }, 1800);
  };

  const handleDownloadSnapshot = () => {
    // Generate simulated SQL file download
    const sqlContent = `-- TeluguBandham Production Database Dump\n-- Generated on: ${new Date().toISOString()}\n-- PostgreSQL 16 Cluster + Redis Cache\n-- Profiles: 158,732\n-- Schema: public, auth, moderation, transactions\n\nBEGIN TRANSACTION;\n-- Complete verified snapshot payload\nCOMMIT;\n`;
    const element = document.createElement("a");
    const file = new Blob([sqlContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = latestRecord ? latestRecord.filename : "TeluguBandham_Snapshot.sql.gz";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>System Database Backup</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Complete database cluster snapshot & multi-region archival</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body">
          {step === 'idle' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', lineHeight: 1.45, margin: 0 }}>
                This action will trigger an immediate atomic snapshot of the PostgreSQL database, media storage metadata, and matrimonial matchmaking index.
              </p>

              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Database Cluster:</span>
                  <span style={{ fontWeight: 700 }}>AWS RDS PostgreSQL (Multi-AZ)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Estimated Snapshot Size:</span>
                  <span style={{ fontWeight: 700 }}>~482 MB (GZIP Compressed)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Encryption:</span>
                  <span style={{ fontWeight: 700, color: 'var(--admin-success)' }}>AES-256 Enabled</span>
                </div>
              </div>
            </div>
          )}

          {step === 'running' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: '0.5rem' }}>
                Creating Database Snapshot ({progress}%)
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginBottom: '1.25rem' }}>
                Compressing transaction logs and encrypting user biodatas...
              </p>

              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--admin-border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: 'var(--admin-primary)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={28} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: '0 0 0.35rem' }}>
                Backup Completed Successfully!
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', margin: '0 0 1.25rem' }}>
                Snapshot <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{latestRecord?.filename}</span> has been stored in AWS Glacier and is ready for secure download.
              </p>

              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={handleDownloadSnapshot}
                style={{ gap: '0.4rem', margin: '0 auto' }}
              >
                <Download size={16} />
                Download SQL Snapshot
              </button>
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          {step === 'idle' && (
            <>
              <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-md" onClick={handleStartBackup}>
                Start System Backup
              </button>
            </>
          )}
          {step === 'running' && (
            <button type="button" className="btn btn-secondary btn-md" disabled>
              Processing...
            </button>
          )}
          {step === 'done' && (
            <button type="button" className="btn btn-primary btn-md" onClick={onClose}>
              Done & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Matrimonial Candidate Full Profile Viewer Modal
 */
export function UserProfileViewerModal({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={(user.photos && user.photos[0]) || '/assets/branding/Default_Male_Avatar.svg'}
              alt={user.name}
              style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--admin-border)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{user.name}</h3>
                <span className="admin-badge primary">{user.id}</span>
                {user.isVerified && <span className="admin-badge success">Verified ✅</span>}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                {user.age} yrs • {user.gender === 'female' ? 'Bride' : 'Groom'} • {user.community} ({user.subCaste || 'General'}) • {user.city}, {user.state}
              </p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>MEMBERSHIP</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--admin-gold)', marginTop: '2px' }}>
                {user.membershipTier || 'Free Member'}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>TRUST SCORE</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--admin-success)', marginTop: '2px' }}>
                {user.trustScore || 95}% Verified
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>ACCOUNT STATUS</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 800, color: user.isSuspended ? 'var(--admin-danger)' : 'var(--admin-success)', marginTop: '2px' }}>
                {user.isSuspended ? 'Suspended' : 'Active'}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>REGISTERED</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-text-primary)', marginTop: '2px' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </div>
            </div>
          </div>

          {/* Horoscope & Cultural Attributes */}
          <div style={{ border: '1px solid var(--admin-border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Star size={16} />
              Vedic Horoscope & Family Background
            </h4>
            <div className="admin-modal-detail-grid" style={{ gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Gothram:</span> <strong>{user.gothram || 'Bharadwaja'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Raasi:</span> <strong>{user.raasi || 'Kanya'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Nakshatram:</span> <strong>{user.nakshatram || 'Hasta'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Dosham:</span> <strong>{user.dosham || 'No Dosham'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Father:</span> <strong>{user.fatherOccupation || 'Retired Officer'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Mother:</span> <strong>{user.motherOccupation || 'Homemaker'}</strong></div>
            </div>
          </div>

          {/* Education & Career */}
          <div style={{ border: '1px solid var(--admin-border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: '0 0 0.75rem', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Briefcase size={16} />
              Education & Professional Standing
            </h4>
            <div className="admin-modal-detail-grid" style={{ gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Education:</span> <strong>{user.education}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Profession:</span> <strong>{user.profession}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Company:</span> <strong>{user.company || 'Private Tech/Corporate'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Annual Income:</span> <strong>{user.income || '₹30 - 45 Lakhs PA'}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Native Place:</span> <strong>{user.nativePlace || user.city}</strong></div>
              <div><span style={{ color: 'var(--admin-text-muted)' }}>Residency:</span> <strong>{user.residenceStatus || 'Citizen'}</strong></div>
            </div>
          </div>

          {/* About Me Bio */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Candidate Biography</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, margin: 0, padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)' }}>
              {user.aboutMe || "Profile biography under review."}
            </p>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="btn btn-primary btn-md" onClick={onClose}>
            Close Profile Viewer
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Add New Membership Plan Modal
 */
export function AddPlanModal({ isOpen, onClose, onPlanAdded, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    price: 4999,
    period: '3 Months',
    tagline: 'High engagement matching with relationship manager assist',
    popular: false,
    featuresText: 'Direct phone & WhatsApp contact unlocks\nKundali & Vedic horoscope matching reports\nPriority search ranking & spotlight badge\nDedicated relationship counselor support'
  });

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const parsedFeatures = formData.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const newPlan = mockDb.addPlan({
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      period: formData.period.trim(),
      tagline: formData.tagline.trim(),
      popular: formData.popular,
      features: parsedFeatures
    });

    mockDb.addAuditLog({
      action: "Admin Created Membership Plan",
      target: `${newPlan.name} (₹${newPlan.price})`,
      targetType: "Membership Plan",
      details: `Created new plan tier. Period: ${newPlan.period}, Tagline: ${newPlan.tagline}`
    });

    if (showToast) {
      showToast(`Membership plan "${newPlan.name}" created and live across platform! 💳`, "success");
    }
    if (onPlanAdded) onPlanAdded(newPlan);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Create New Membership Tier</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Publish a new subscription plan with live gateway integration</p>
            </div>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-modal-grid-2col-uneven">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Plan Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. Royal Platinum or NRI Exclusive"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="4999"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-modal-grid-2col">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Validity Duration</label>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%' }}
                  placeholder="e.g. 3 Months, 6 Months, 1 Year"
                  value={formData.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '1.4rem' }}>
                <input
                  type="checkbox"
                  id="add-plan-popular"
                  checked={formData.popular}
                  onChange={(e) => handleChange('popular', e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--admin-gold)', cursor: 'pointer' }}
                />
                <label htmlFor="add-plan-popular" style={{ fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>
                  Mark as "Most Popular" Tier ⭐
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Headline Tagline</label>
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%' }}
                placeholder="e.g. Premium match assistance for distinguished families"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                Included Features (one perk per line)
              </label>
              <textarea
                className="admin-input"
                style={{ width: '100%', minHeight: '90px', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="Enter features, one line each"
                value={formData.featuresText}
                onChange={(e) => handleChange('featuresText', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-md">
              Create & Publish Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Reusable Confirmation Dialog Modal
 */
export function ConfirmActionModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this operation?",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onConfirm,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} style={{ color: confirmVariant === 'danger' ? 'var(--admin-danger)' : 'var(--admin-warning)' }} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{title}</h3>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="admin-modal-body">
          <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-secondary)', lineHeight: 1.45, margin: 0 }}>
            {message}
          </p>
        </div>

        <div className="admin-modal-footer">
          <button type="button" className="btn btn-secondary btn-md" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-${confirmVariant} btn-md`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
