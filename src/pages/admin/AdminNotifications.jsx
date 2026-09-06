import React, { useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Bell,
  Send,
  Smartphone,
  Mail,
  CheckCircle2,
  Clock,
  Filter,
  Users
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminNotifications() {
  const { showToast } = useApp();

  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [channel, setChannel] = useState('push'); // push | sms | email
  const [audience, setAudience] = useState('all');

  const [campaignLogs, setCampaignLogs] = useState([
    {
      id: 'CMP-01',
      title: 'Ugadi Special 50% Off VIP Diamond Upgrade',
      channel: 'Push + WhatsApp',
      audience: 'Free Members (~122,000)',
      sentAt: '2026-02-24T10:00:00Z',
      delivered: '118,400 (97.0%)',
      opened: '42,100 (35.5%)'
    },
    {
      id: 'CMP-02',
      title: 'Urgent: Aadhaar Document Verification Reminder',
      channel: 'SMS Blast',
      audience: 'Unverified Profiles (~14,200)',
      sentAt: '2026-02-22T14:30:00Z',
      delivered: '13,950 (98.2%)',
      opened: '9,840 (70.5%)'
    },
    {
      id: 'CMP-03',
      title: 'New USA Telugu NRI Profiles Matching Your Criteria',
      channel: 'Email Digest',
      audience: 'Diamond and VIP Members (~18,450)',
      sentAt: '2026-02-20T08:00:00Z',
      delivered: '18,410 (99.8%)',
      opened: '12,300 (66.8%)'
    }
  ]);

  const handleSendCampaign = (e) => {
    e.preventDefault();
    if (!campaignTitle || !campaignMessage) return;

    const newLog = {
      id: `CMP-${String(campaignLogs.length + 1).padStart(2, '0')}`,
      title: campaignTitle,
      channel: channel === 'push' ? 'In-App Push' : channel === 'sms' ? 'SMS Gateway' : 'Email Digest',
      audience: audience === 'all' ? 'All Active Members (~158,700)' : 'Segmented Cohort',
      sentAt: new Date().toISOString(),
      delivered: 'Simulating Transmission (100%)',
      opened: 'Tracking Live...'
    };

    mockDb.addNotification({
      type: 'campaign',
      title: `📢 ${campaignTitle}`,
      message: campaignMessage,
      link: '/dashboard'
    });

    mockDb.addAuditLog({
      action: "Dispatched Broadcast Campaign",
      target: campaignTitle,
      targetType: "Push Notification",
      details: `Channel: ${newLog.channel} • Audience: ${newLog.audience}`
    });

    setCampaignLogs([newLog, ...campaignLogs]);
    showToast("Broadcast notification transmitted successfully! 🚀", "success");
    setCampaignTitle('');
    setCampaignMessage('');
  };

  return (
    <AdminLayout
      title="Notifications and Broadcasts"
      description="Dispatch in-app notifications, SMS alert blasts, and email campaigns to TeluguBandham members"
    >
      <div className="admin-split-12-grid">
        {/* Left: Compose Campaign Form (5 Cols) */}
        <div className="admin-card col-span-5">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Send size={18} style={{ color: 'var(--admin-primary)' }} />
                Compose Broadcast Alert
              </h3>
              <p className="admin-card-subtitle">Broadcast real-time push, SMS, or email</p>
            </div>
          </div>

          <form onSubmit={handleSendCampaign}>
            <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Notification Headline</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Notification Headline / Title"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div className="admin-modal-grid-2col" style={{ gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Delivery Channel</label>
                  <select
                    className="admin-select"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="push">In-App Push Alert</option>
                    <option value="sms">SMS Gateway (Twilio/Karix)</option>
                    <option value="email">Email Digest (AWS SES)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Target Audience</label>
                  <select
                    className="admin-select"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="all">All Members (158.7K)</option>
                    <option value="free">Free Members Only</option>
                    <option value="unverified">Unverified Profiles</option>
                    <option value="diamond">Diamond and VIP Members</option>
                    <option value="hyderabad">Hyderabad / AP Coastal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Message Copy</label>
                <textarea
                  className="admin-input"
                  rows="4"
                  placeholder="Enter message text that will be received by members..."
                  value={campaignMessage}
                  onChange={(e) => setCampaignMessage(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-md"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Send size={16} />
                Transmit Broadcast Alert
              </button>
            </div>
          </form>
        </div>

        {/* Right: Transmission Telemetry (7 Cols) */}
        <div className="admin-card col-span-7">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Bell size={18} style={{ color: 'var(--admin-gold)' }} />
                Transmission History and Telemetry
              </h3>
              <p className="admin-card-subtitle">Delivery rates and member open telemetry</p>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign Title</th>
                  <th>Channel</th>
                  <th>Target Audience</th>
                  <th>Delivery Rate</th>
                  <th>Dispatched</th>
                </tr>
              </thead>
              <tbody>
                {campaignLogs.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{c.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>{c.id}</div>
                    </td>
                    <td>
                      <span className="admin-badge primary">{c.channel}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)' }}>{c.audience}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--admin-success)' }}>{c.delivered}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        {new Date(c.sentAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
