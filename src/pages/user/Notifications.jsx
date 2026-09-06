import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Heart,
  MessageCircle,
  Eye,
  ShieldCheck,
  CheckCircle2,
  CheckCheck
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'interest_received':
        return <Heart size={20} color="var(--primary-700)" fill="var(--primary-100)" />;
      case 'interest_accepted':
        return <CheckCircle2 size={20} color="var(--gold-600)" />;
      case 'message':
        return <MessageCircle size={20} color="var(--info)" />;
      case 'verification_success':
        return <ShieldCheck size={20} color="var(--success)" />;
      case 'profile_view':
        return <Eye size={20} color="var(--primary-800)" />;
      default:
        return <Bell size={20} color="var(--primary-700)" />;
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-950)' }}>
            Notification Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Stay updated with interests, messages, profile views, and matchmaking alerts.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={markAllNotificationsRead}
          >
            <CheckCheck size={16} /> Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="We will notify you whenever someone expresses interest, sends a message, or views your profile."
          icon={Bell}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card animate-fade-in tb-notif-item-card"
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                backgroundColor: notif.read ? '#FFFFFF' : 'var(--primary-50)',
                borderLeft: notif.read ? '1px solid var(--border-light)' : '4px solid var(--primary-800)'
              }}
            >
              <div
                className="tb-notif-item-icon"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-900)' }}>
                    {notif.title}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
