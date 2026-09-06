import React, { useState, useEffect } from 'react';
import { X, Save, User, ShieldCheck } from 'lucide-react';
import '../../styles/admin.css';

export default function UserEditModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    age: user?.age ?? '',
    profession: user?.profession || '',
    company: user?.company || '',
    community: user?.community || '',
    city: user?.city || '',
    income: user?.income || '',
    membershipTier: user?.membershipTier || '',
    isVerified: user?.isVerified || false,
    isSuspended: user?.isSuspended || false
  }));

  const [prevUserId, setPrevUserId] = useState(user?.id);
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setFormData({
      name: user.name || '',
      age: user.age ?? '',
      profession: user.profession || '',
      company: user.company || '',
      community: user.community || '',
      city: user.city || '',
      income: user.income || '',
      membershipTier: user.membershipTier || '',
      isVerified: user.isVerified || false,
      isSuspended: user.isSuspended || false
    });
  }

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--admin-primary-tint)',
                color: 'var(--admin-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-primary)', margin: 0 }}>
                Edit Profile: {user.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                ID: {user.id}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            style={{ width: '28px', height: '28px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-form-grid-2col">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Age
                </label>
                <input
                  type="number"
                  className="admin-input"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 18 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            <div className="admin-form-grid-2col">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Community / Caste
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.community}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Location / City
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div className="admin-form-grid-2col">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Profession
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Company / Organization
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div className="admin-form-grid-2col">
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Membership Tier
                </label>
                <select
                  className="admin-input"
                  value={formData.membershipTier}
                  onChange={(e) => setFormData({ ...formData, membershipTier: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">Select Tier</option>
                  <option value="Free">Free</option>
                  <option value="Gold">Gold</option>
                  <option value="Diamond">Diamond VIP</option>
                  <option value="Elite VIP">Elite VIP</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Annual Income
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="Annual Income Package"
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--admin-border)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'var(--admin-surface-subtle)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                />
                <span>ID Verified Badge</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-danger)' }}>
                <input
                  type="checkbox"
                  checked={formData.isSuspended}
                  onChange={(e) => setFormData({ ...formData, isSuspended: e.target.checked })}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                />
                <span>Suspended Account</span>
              </label>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ gap: '0.4rem' }}
            >
              <Save size={14} /> Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
