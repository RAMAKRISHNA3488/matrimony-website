import React, { useState, useMemo } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  MessageSquare,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  Send,
  Ban,
  Clock
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminMessages() {
  const { showToast } = useApp();

  const [conversations] = useState(() => mockDb.getConversations());
  const [selectedConv, setSelectedConv] = useState(conversations[0] || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Flagged safety keyword triggers
  const flaggedTriggers = [
    {
      id: 'FLG-1',
      convId: 'CONV-01',
      keyword: 'Phone number exchange before mutual approval',
      severity: 'Low',
      sender: 'Deepika Padmashali',
      time: '10:45 AM',
      status: 'Auto-Monitored'
    },
    {
      id: 'FLG-2',
      convId: 'CONV-02',
      keyword: 'Financial discussion / Bio-data horoscope request',
      severity: 'Info',
      sender: 'Pranathi Arya Vysya',
      time: 'Yesterday',
      status: 'Cleared'
    }
  ];

  const handleIssueWarning = (participantName) => {
    mockDb.addAuditLog({
      action: "Issued Chat Safety Warning",
      target: participantName,
      targetType: "Chat Conversation",
      details: "Dispatched safety reminder regarding platform guidelines."
    });
    showToast(`Official communication guideline warning dispatched to ${participantName}! ⚠️`, "warning");
  };

  return (
    <AdminLayout
      title="Messages and Communication Safety"
      description="Monitor active communication channels, automated trust filters, and sensitive keyword alerts"
    >
      {/* 4 Stats Cards */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <MessageSquare size={20} />
            </div>
            <span className="admin-badge info">Active</span>
          </div>
          <div>
            <div className="admin-kpi-number">28,410</div>
            <div className="admin-kpi-label">Messages Today</div>
            <div className="admin-kpi-subtext">Across 4,200 active chats</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <Lock size={20} />
            </div>
            <span className="admin-badge success">Encrypted</span>
          </div>
          <div>
            <div className="admin-kpi-number">100%</div>
            <div className="admin-kpi-label">End-to-End Privacy</div>
            <div className="admin-kpi-subtext">Zero unmoderated data leaks</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-warning-bg)', color: 'var(--admin-warning)' }}>
              <ShieldAlert size={20} />
            </div>
            <span className="admin-badge warning">2 Triggers</span>
          </div>
          <div>
            <div className="admin-kpi-number">12</div>
            <div className="admin-kpi-label">Safety Keyword Alerts</div>
            <div className="admin-kpi-subtext">Phone/UPI exchange filters</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Clock size={20} />
            </div>
            <span className="admin-badge primary">Fast Response</span>
          </div>
          <div>
            <div className="admin-kpi-number">3.2m</div>
            <div className="admin-kpi-label">Average Reply Time</div>
            <div className="admin-kpi-subtext">Active mutual connections</div>
          </div>
        </div>
      </div>

      <div className="admin-split-12-grid">
        {/* Left Column: Conversations List (5 Cols) */}
        <div className="admin-card col-span-5">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <MessageSquare size={17} style={{ color: 'var(--admin-primary)' }} />
                Active Monitored Channels
              </h3>
            </div>
          </div>

          <div className="admin-card-body" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedConv(c)}
                style={{
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: selectedConv?.id === c.id ? 'var(--admin-surface-hover)' : 'var(--admin-surface-subtle)',
                  border: selectedConv?.id === c.id ? '1.5px solid var(--admin-primary)' : '1px solid var(--admin-border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{c.participantName}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{c.lastMessageTime}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.lastMessage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Chat Inspector & Safety Log (7 Cols) */}
        <div className="admin-card col-span-7">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Lock size={17} style={{ color: 'var(--admin-gold)' }} />
                Channel Safety Inspector: {selectedConv?.participantName}
              </h3>
              <p className="admin-card-subtitle">Channel ID: {selectedConv?.id}</p>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem', color: 'var(--admin-warning)' }}
              onClick={() => handleIssueWarning(selectedConv?.participantName)}
            >
              <AlertTriangle size={14} /> Issue Safety Warning
            </button>
          </div>

          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '340px', overflowY: 'auto' }}>
            {selectedConv?.messages?.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.senderId.includes('USER') ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: m.senderId.includes('USER') ? 'var(--admin-primary)' : 'var(--admin-surface-subtle)',
                  color: m.senderId.includes('USER') ? '#FFFFFF' : 'var(--admin-text-primary)',
                  border: m.senderId.includes('USER') ? 'none' : '1px solid var(--admin-border-subtle)',
                  fontSize: '0.8125rem'
                }}
              >
                <div>{m.text}</div>
                <div style={{ fontSize: '0.6875rem', opacity: 0.8, textAlign: 'right', marginTop: '3px' }}>
                  {m.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
