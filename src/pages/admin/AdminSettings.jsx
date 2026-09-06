import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import { resetDatabase } from '../../services/database/index.js';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmActionModal } from '../../components/admin/AdminModals';
import {
  Settings,
  Shield,
  Lock,
  Mail,
  Smartphone,
  CreditCard,
  Save,
  AlertTriangle,
  Server,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminSettings() {
  const { showToast } = useApp();

  const [settings, setSettings] = useState(() => mockDb.getSystemSettings());
  const [activeTab, setActiveTab] = useState('general'); // general | security | payments | gateways | moderation
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'settings' || type === 'storage_sync') {
        setSettings(mockDb.getSystemSettings());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    mockDb.updateSystemSettings(settings);
    showToast("System settings saved and applied across platform! ⚙️", "success");
  };

  return (
    <AdminLayout
      title="System Settings"
      description="Configure core TeluguBandham platform parameters, gateway credentials, and moderation policies"
    >
      <div className="admin-page-container">
        <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Settings size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Platform Configuration Console</h3>
              <p className="admin-card-subtitle">Global settings and infrastructure flags</p>
            </div>
          </div>

          <div className="admin-tab-bar">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security and 2FA
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payment Gateways
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'gateways' ? 'active' : ''}`}
              onClick={() => setActiveTab('gateways')}
            >
              Email and SMS
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
              onClick={() => setActiveTab('moderation')}
            >
              Moderation Rules
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'testdata' ? 'active' : ''}`}
              onClick={() => setActiveTab('testdata')}
              style={{ color: activeTab === 'testdata' ? '#FFFFFF' : 'var(--admin-danger)', backgroundColor: activeTab === 'testdata' ? 'var(--admin-danger)' : 'transparent' }}
            >
              Test Data Reset
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSettings}>
          <div className="admin-card-body" style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Platform Title
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="admin-modal-grid-2col" style={{ gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Primary Support Email
                    </label>
                    <input
                      type="email"
                      className="admin-input"
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Helpline Phone Number
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settings.helplinePhone}
                      onChange={(e) => handleChange('helplinePhone', e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Maintenance Mode Toggle */}
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: settings.maintenanceMode ? 'var(--admin-danger-bg)' : 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: settings.maintenanceMode ? 'var(--admin-danger)' : 'var(--admin-text-primary)' }}>
                      Maintenance Mode {settings.maintenanceMode ? '(ACTIVE)' : '(Disabled)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      When enabled, public visitors will see a scheduled maintenance notice.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`btn ${settings.maintenanceMode ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                    onClick={() => handleToggle('maintenanceMode')}
                  >
                    {settings.maintenanceMode ? 'Turn Off' : 'Enable Maintenance'}
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Enforce Two-Factor Authentication (2FA) for Admins</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Require TOTP authenticator codes on every administrative login.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.requireTwoFactor}
                    onChange={() => handleToggle('requireTwoFactor')}
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>Strict Chat Safety Word Interceptor</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Automatically flag unsolicited phone numbers and unauthorized solicitations.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.chatSafetyFilterStrict || false}
                    onChange={() => handleToggle('chatSafetyFilterStrict')}
                    style={{ flexShrink: 0, cursor: 'pointer' }}
                  />
                </label>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Active Merchant Gateway
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.paymentGateway}
                    onChange={(e) => handleChange('paymentGateway', e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}

            {/* GATEWAYS TAB */}
            {activeTab === 'gateways' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    AWS SES / SMTP Host
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.smtpHost}
                    onChange={(e) => handleChange('smtpHost', e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
            )}

            {/* MODERATION TAB */}
            {activeTab === 'moderation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Automated Suspicion Thresholds</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', lineHeight: 1.45 }}>
                    Candidates who receive 3 or more independent user complaints within 48 hours are automatically placed in the High-Priority Moderation Queue.
                  </div>
                </div>
              </div>
            )}

            {/* TEST DATA RESET TAB */}
            {activeTab === 'testdata' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-danger-bg)', border: '1.5px solid var(--admin-danger-border)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--admin-danger)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} style={{ color: 'var(--admin-danger)' }} /> Temporary IndexedDB Database Reset
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    Reset all 10 temporary IndexedDB object stores (users, profiles, interests, matches, messages, notifications, memberships, reports, blockedUsers, adminLogs) back to clean initial demo state.
                  </p>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: 'var(--admin-danger)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setIsResetConfirmOpen(true)}
                  >
                    Reset Temporary Test Data
                  </button>
                </div>
              </div>
            )}

            {/* Save Button */}
            {activeTab !== 'testdata' && (
              <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--admin-border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-md" style={{ gap: '0.4rem' }}>
                  <Save size={16} /> Save Configuration Changes
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
      </div>
      {/* Confirm Test Data Reset Modal */}
      <ConfirmActionModal
        isOpen={isResetConfirmOpen}
        title="Reset All Temporary Test Data?"
        message="This will wipe all 10 temporary IndexedDB stores and reset all local and session mock database records (profiles, plans, tickets, verification queue, FAQs, and audit logs) back to clean initial demo state. The application will reload."
        confirmText="Yes, Reset Test Data"
        confirmVariant="danger"
        onConfirm={async () => {
          setIsResetConfirmOpen(false);
          await resetDatabase();
          showToast("All temporary databases and mock stores reset successfully! Reloading...", "success");
          setTimeout(() => window.location.reload(), 700);
        }}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </AdminLayout>
  );
}
