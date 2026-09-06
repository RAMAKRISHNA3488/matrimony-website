import React, { useState, useMemo, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Ban,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  RotateCcw,
  Clock,
  UserX,
  History,
  Send
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminReports() {
  const { showToast } = useApp();

  const [reports, setReports] = useState(() => mockDb.getReports());
  const [activeTab, setActiveTab] = useState('Under Review'); // Under Review | Resolved | Dismissed | All
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = mockDb.subscribe(() => {
      setReports(mockDb.getReports());
    });
    return () => unsubscribe();
  }, []);

  const openReports = reports.filter((r) => r.status === 'Under Review');
  const resolvedReports = reports.filter((r) => r.status === 'Suspended' || r.status === 'Resolved');
  const dismissedReports = reports.filter((r) => r.status === 'Dismissed');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (activeTab !== 'All') {
        if (activeTab === 'Under Review' && r.status !== 'Under Review') return false;
        if (activeTab === 'Resolved' && r.status !== 'Suspended' && r.status !== 'Resolved') return false;
        if (activeTab === 'Dismissed' && r.status !== 'Dismissed') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = (r.reportedUserName || '').toLowerCase().includes(q);
        const matchBy = (r.reportedBy || '').toLowerCase().includes(q);
        const matchReason = (r.reason || '').toLowerCase().includes(q);
        const matchCat = (r.category || '').toLowerCase().includes(q);
        if (!matchUser && !matchBy && !matchReason && !matchCat) return false;
      }
      return true;
    });
  }, [reports, activeTab, searchQuery]);

  const handleQuickSuspend = (report) => {
    mockDb.moderateReport(report.id, 'suspend', `Account suspended instantly following verified report (${report.category}).`);
    mockDb.addAuditLog({
      action: "1-Click Suspended Account from Report",
      target: `${report.reportedUserName} (${report.reportedUserId})`,
      targetType: "User Account",
      details: `Account suspended via 1-click action. Reason: ${report.reason}`
    });
    setReports(mockDb.getReports());
    showToast(`Account for ${report.reportedUserName} has been SUSPENDED! 🚫`, "danger");
  };

  const handleQuickDismiss = (report) => {
    mockDb.moderateReport(report.id, 'dismiss', 'Report reviewed and dismissed via quick action.');
    mockDb.addAuditLog({
      action: "1-Click Dismissed Safety Report",
      target: `${report.reportedUserName} (${report.id})`,
      targetType: "Safety Report",
      details: "Investigation dismissed with clean standing."
    });
    setReports(mockDb.getReports());
    showToast("Report reviewed and dismissed. Clean standing preserved.", "info");
  };

  const handleModerateAction = (actionType) => {
    if (!selectedReport) return;

    if (actionType === 'dismiss') {
      mockDb.moderateReport(selectedReport.id, 'dismiss', actionNotes || 'Report dismissed after investigative review.');
      mockDb.addAuditLog({
        action: "Dismissed Safety Report",
        target: `${selectedReport.reportedUserName} (${selectedReport.id})`,
        targetType: "Safety Report",
        details: actionNotes || "Investigation found no guideline violation."
      });
      showToast("Report reviewed and dismissed. Clean standing preserved.", "info");
    } else if (actionType === 'warn') {
      mockDb.addAuditLog({
        action: "Issued Official Safety Warning",
        target: `${selectedReport.reportedUserName} (${selectedReport.id})`,
        targetType: "User Account",
        details: `Official warning issued. Reason: ${selectedReport.reason}`
      });
      showToast(`Official warning dispatched to ${selectedReport.reportedUserName}! ⚠️`, "warning");
    } else if (actionType === 'suspend') {
      mockDb.moderateReport(selectedReport.id, 'suspend', actionNotes || 'Account suspended following verified harassment/scam report.');
      mockDb.addAuditLog({
        action: "Suspended Account from Report",
        target: `${selectedReport.reportedUserName} (${selectedReport.reportedUserId})`,
        targetType: "User Account",
        details: `Account suspended following safety investigation. Reason: ${selectedReport.reason}`
      });
      showToast(`Account for ${selectedReport.reportedUserName} has been SUSPENDED! 🚫`, "danger");
    }

    setReports(mockDb.getReports());
    setSelectedReport(null);
    setActionNotes('');
  };

  return (
    <AdminLayout
      title="Safety and Moderation"
      description="Process member harassment reports, fake profile investigations, and fraud prevention enforcement"
    >
      {/* 4 Top KPI Cards */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card" onClick={() => setActiveTab('Under Review')} style={{ cursor: 'pointer', borderColor: activeTab === 'Under Review' ? 'var(--admin-danger)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <span className="admin-badge danger">Action Required</span>
          </div>
          <div>
            <div className="admin-kpi-number">{openReports.length}</div>
            <div className="admin-kpi-label">Open Complaints</div>
            <div className="admin-kpi-subtext">Requires moderation review</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-warning-bg)', color: 'var(--admin-warning)' }}>
              <ShieldAlert size={20} />
            </div>
            <span className="admin-badge warning">Critical</span>
          </div>
          <div>
            <div className="admin-kpi-number">1</div>
            <div className="admin-kpi-label">Fake Profile Alerts</div>
            <div className="admin-kpi-subtext">Stock photo/impersonation</div>
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
            <div className="admin-kpi-number">{resolvedReports.length + 84}</div>
            <div className="admin-kpi-label">Resolved Complaints</div>
            <div className="admin-kpi-subtext">Action completed this month</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Clock size={20} />
            </div>
            <span className="admin-badge primary">Fast SLA</span>
          </div>
          <div>
            <div className="admin-kpi-number">45 mins</div>
            <div className="admin-kpi-label">Resolution Turnaround</div>
            <div className="admin-kpi-subtext">Avg. time to action</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={20} style={{ color: 'var(--admin-danger)' }} />
            <div>
              <h3 className="admin-card-title">Safety and Member Complaints Ledger</h3>
              <p className="admin-card-subtitle">Detailed allegations and enforcement actions</p>
            </div>
          </div>

          <div className="admin-tab-bar">
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'Under Review' ? 'active' : ''}`}
              onClick={() => setActiveTab('Under Review')}
            >
              Under Review ({openReports.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'Resolved' ? 'active' : ''}`}
              onClick={() => setActiveTab('Resolved')}
            >
              Resolved / Suspended
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'Dismissed' ? 'active' : ''}`}
              onClick={() => setActiveTab('Dismissed')}
            >
              Dismissed
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeTab === 'All' ? 'active' : ''}`}
              onClick={() => setActiveTab('All')}
            >
              All Reports
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              className="admin-input"
              style={{ width: '100%', paddingLeft: '2rem' }}
              placeholder="Search user, category or complaint text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>Reported Member</th>
                <th style={{ width: '18%' }}>Report Category</th>
                <th style={{ width: '14%' }}>Reported By</th>
                <th style={{ width: '22%' }}>Allegation Details</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Severity</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '11%', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={r.reportedUserPhoto || '/assets/branding/Default_Male_Avatar.svg'}
                        alt={r.reportedUserName}
                        className="admin-table-avatar"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/assets/branding/Default_Male_Avatar.svg';
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{r.reportedUserName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{r.reportedUserId}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="admin-badge primary">{r.category}</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{r.reportedBy}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(r.reportedAt).toLocaleDateString('en-IN')}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', maxWidth: '280px' }}>
                      {r.reason}
                    </div>
                    {r.actionTaken && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-success)', fontWeight: 600, marginTop: '2px' }}>
                        Action: {r.actionTaken}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className={`admin-badge ${r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'neutral'}`}>
                      {r.severity || 'Medium'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    {r.status === 'Under Review' && <span className="admin-badge warning">Under Review</span>}
                    {r.status === 'Suspended' && <span className="admin-badge danger">Suspended</span>}
                    {r.status === 'Resolved' && <span className="admin-badge success">Resolved</span>}
                    {r.status === 'Dismissed' && <span className="admin-badge neutral">Dismissed</span>}
                  </td>

                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {r.status === 'Under Review' && (
                        <>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: 'var(--admin-danger-bg)',
                              color: 'var(--admin-danger)'
                            }}
                            onClick={() => handleQuickSuspend(r)}
                            title="1-Click Quick Suspend Account 🚫"
                          >
                            <Ban size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: 'var(--admin-success-bg)',
                              color: 'var(--admin-success)'
                            }}
                            onClick={() => handleQuickDismiss(r)}
                            title="1-Click Dismiss Report ✅"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedReport(r)}
                        style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', padding: '0.35rem 0.65rem' }}
                      >
                        Investigate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--admin-text-muted)' }}>
                    <CheckCircle2 size={32} style={{ color: 'var(--admin-success)', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>No active reports</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Platform safety health is clean.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Investigation Modal */}
      {selectedReport && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="admin-modal-container large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Investigate Report: {selectedReport.reportedUserName}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Complaint ID: {selectedReport.id} • Candidate ID: {selectedReport.reportedUserId}</p>
                </div>
              </div>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div>Category: <strong style={{ color: 'var(--admin-primary)' }}>{selectedReport.category}</strong></div>
                  <div>Reported By: <strong>{selectedReport.reportedBy}</strong></div>
                  <div>Report Date: <strong>{new Date(selectedReport.reportedAt).toLocaleString('en-IN')}</strong></div>
                  <div>Severity Level: <strong style={{ color: 'var(--admin-danger)' }}>{selectedReport.severity || 'High'}</strong></div>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Allegation Statement:</span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-primary)', margin: '4px 0 0', lineHeight: 1.45 }}>
                    "{selectedReport.reason}"
                  </p>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Moderator Action Notes
                </label>
                <textarea
                  className="admin-input"
                  rows="3"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Enter audit notes regarding this enforcement decision..."
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedReport(null)}
                style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
              >
                Cancel
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleModerateAction('dismiss')}
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
                >
                  Dismiss Report
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: 'var(--admin-warning)', fontSize: '0.8125rem', padding: '0.45rem 0.85rem' }}
                  onClick={() => handleModerateAction('warn')}
                >
                  <AlertTriangle size={14} /> Send Official Warning
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => handleModerateAction('suspend')}
                  style={{ fontSize: '0.8125rem', padding: '0.45rem 0.95rem' }}
                >
                  <Ban size={14} /> Suspend Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
