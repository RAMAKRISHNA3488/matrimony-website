import React, { useState, useMemo } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  User,
  AlertCircle,
  Search,
  Filter,
  X
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminSupport() {
  const { showToast } = useApp();

  const [tickets, setTickets] = useState(() => mockDb.getSupportTickets());
  const [activeTab, setActiveTab] = useState('Open'); // Open | Pending | Resolved | All
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const openTickets = tickets.filter((t) => t.status === 'Open');
  const pendingTickets = tickets.filter((t) => t.status === 'Pending');
  const resolvedTickets = tickets.filter((t) => t.status === 'Resolved');

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (activeTab !== 'All' && t.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (t.userName || '').toLowerCase().includes(q);
        const matchNum = (t.ticketNumber || '').toLowerCase().includes(q);
        const matchSubject = (t.subject || '').toLowerCase().includes(q);
        const matchCat = (t.category || '').toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchSubject && !matchCat) return false;
      }
      return true;
    });
  }, [tickets, activeTab, searchQuery]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    mockDb.replyToSupportTicket(selectedTicket.id, replyText.trim(), "Support Agent");
    setTickets(mockDb.getSupportTickets());
    showToast("Reply sent to member inquiry! 💬", "success");
    setReplyText('');
  };

  const handleResolveTicket = (ticketId) => {
    mockDb.updateSupportTicketStatus(ticketId, 'Resolved');
    setTickets(mockDb.getSupportTickets());
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
    showToast("Support ticket marked as Resolved! ✅", "success");
  };

  return (
    <AdminLayout
      title="Support Tickets and Helpdesk"
      description="Resolve customer horoscope corrections, payment inquiries, and matrimonial assistance requests"
    >
      <div className="admin-page-container">
        {/* 3 Top KPI Cards */}
      <div className="admin-kpi-3-grid">
        <div className="admin-kpi-card" onClick={() => setActiveTab('Open')} style={{ cursor: 'pointer', borderColor: activeTab === 'Open' ? 'var(--admin-warning)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-warning-bg)', color: 'var(--admin-warning)' }}>
              <Clock size={20} />
            </div>
            <span className="admin-badge warning">Action Needed</span>
          </div>
          <div>
            <div className="admin-kpi-number">{openTickets.length}</div>
            <div className="admin-kpi-label">Open Tickets</div>
            <div className="admin-kpi-subtext">Awaiting representative reply</div>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveTab('Pending')} style={{ cursor: 'pointer', borderColor: activeTab === 'Pending' ? 'var(--admin-info)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <LifeBuoy size={20} />
            </div>
            <span className="admin-badge info">In Progress</span>
          </div>
          <div>
            <div className="admin-kpi-number">{pendingTickets.length}</div>
            <div className="admin-kpi-label">Pending Reviews</div>
            <div className="admin-kpi-subtext">Assigned to team specialists</div>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveTab('Resolved')} style={{ cursor: 'pointer', borderColor: activeTab === 'Resolved' ? 'var(--admin-success)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <CheckCircle2 size={20} />
            </div>
            <span className="admin-badge success">Resolved</span>
          </div>
          <div>
            <div className="admin-kpi-number">{resolvedTickets.length + 142}</div>
            <div className="admin-kpi-label">Resolved This Month</div>
            <div className="admin-kpi-subtext">99.2% customer CSAT</div>
          </div>
        </div>
      </div>

      <div className="admin-split-12-grid">
        {/* Left Column: Tickets Table (7 Cols) */}
        <div className="admin-card col-span-7">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <LifeBuoy size={18} style={{ color: 'var(--admin-primary)' }} />
                Support Ticket Queue
              </h3>
            </div>

            <div className="admin-tab-bar">
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Open' ? 'active' : ''}`}
                onClick={() => setActiveTab('Open')}
              >
                Open ({openTickets.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('Pending')}
              >
                Pending ({pendingTickets.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('Resolved')}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="admin-toolbar">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%', paddingLeft: '2rem' }}
                placeholder="Search ticket #, member name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Member</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--admin-text-muted)' }}>
                      <LifeBuoy size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4, display: 'block' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No support tickets found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        {searchQuery ? 'No tickets match your search criteria.' : 'There are currently no tickets in this status queue.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} style={{ backgroundColor: selectedTicket?.id === t.id ? 'var(--admin-surface-hover)' : 'inherit' }}>
                      <td>
                        <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{t.ticketNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                          {new Date(t.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>{t.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{t.userEmail}</div>
                      </td>

                      <td>
                        <span className="admin-badge primary" style={{ fontSize: '0.7rem' }}>
                          {t.category}
                        </span>
                      </td>

                      <td>
                        <span className={`admin-badge ${t.priority === 'High' ? 'danger' : t.priority === 'Medium' ? 'warning' : 'neutral'}`} style={{ fontSize: '0.6875rem' }}>
                          {t.priority}
                        </span>
                      </td>

                      <td>
                        {t.status === 'Open' && <span className="admin-badge warning">Open</span>}
                        {t.status === 'Pending' && <span className="admin-badge info">Pending</span>}
                        {t.status === 'Resolved' && <span className="admin-badge success">Resolved</span>}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => setSelectedTicket(t)}
                        >
                          Open Thread
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread (5 Cols) */}
        <div className="admin-card col-span-5">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <MessageSquare size={17} style={{ color: 'var(--admin-gold)' }} />
                {selectedTicket ? selectedTicket.ticketNumber : "Ticket Thread"}
              </h3>
              <p className="admin-card-subtitle">
                {selectedTicket ? selectedTicket.subject : "Select a ticket from the left to view conversation"}
              </p>
            </div>

            {selectedTicket && selectedTicket.status !== 'Resolved' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ color: 'var(--admin-success)', gap: '0.3rem', fontSize: '0.75rem' }}
                onClick={() => handleResolveTicket(selectedTicket.id)}
              >
                <CheckCircle2 size={14} /> Resolve Ticket
              </button>
            )}
          </div>

          {selectedTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
              <div className="admin-card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)', fontSize: '0.78rem' }}>
                  <div>Category: <strong>{selectedTicket.category}</strong></div>
                  <div>Assigned Agent: <strong>{selectedTicket.assignedTo || 'Unassigned'}</strong></div>
                </div>

                {selectedTicket.messages?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: m.sender === 'admin' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: m.sender === 'admin' ? 'var(--admin-primary)' : 'var(--admin-surface-subtle)',
                      color: m.sender === 'admin' ? '#FFFFFF' : 'var(--admin-text-primary)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.72rem', opacity: 0.85, marginBottom: '2px' }}>
                      {m.name} ({m.sender === 'admin' ? 'TeluguBandham Support' : 'Member'})
                    </div>
                    <div>{m.text}</div>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.75, textAlign: 'right', marginTop: '3px' }}>
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} style={{ padding: '0.85rem', borderTop: '1px solid var(--admin-border-subtle)', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Type official reply to member..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                  <Send size={14} /> Send
                </button>
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--admin-text-muted)' }}>
              <LifeBuoy size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>No Ticket Selected</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Click any ticket in the queue to review and respond.</div>
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
