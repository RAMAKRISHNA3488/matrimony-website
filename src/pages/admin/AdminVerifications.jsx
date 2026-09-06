import React, { useState, useMemo, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import VerificationReviewModal from '../../components/admin/VerificationReviewModal';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  FileText,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminVerifications() {
  const { showToast } = useApp();

  const [verifications, setVerifications] = useState(() => mockDb.getVerifications());
  const [activeTab, setActiveTab] = useState('Pending'); // Pending | Approved | Rejected | All
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerif, setSelectedVerif] = useState(null);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = mockDb.subscribe(() => {
      setVerifications(mockDb.getVerifications());
    });
    return () => unsubscribe();
  }, []);

  const pendingCount = verifications.filter((v) => v.status === 'Pending').length;
  const approvedCount = verifications.filter((v) => v.status === 'Approved').length;
  const rejectedCount = verifications.filter((v) => v.status === 'Rejected' || v.status === 'Correction Requested').length;

  const filteredQueue = useMemo(() => {
    return verifications.filter((v) => {
      if (activeTab !== 'All' && v.status !== activeTab) {
        if (activeTab === 'Rejected' && v.status === 'Correction Requested') {
          // group with rejected/corrections
        } else {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (v.userName || '').toLowerCase().includes(q);
        const matchId = (v.userId || '').toLowerCase().includes(q);
        const matchDoc = (v.documentType || '').toLowerCase().includes(q);
        const matchCity = (v.userCity || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchDoc && !matchCity) return false;
      }
      return true;
    });
  }, [verifications, activeTab, searchQuery]);

  const handleAction = (verifId, status, reviewNotes) => {
    mockDb.reviewVerification(verifId, status, reviewNotes);
    const updated = mockDb.getVerifications();
    setVerifications(updated);

    mockDb.addAuditLog({
      action: `Processed Verification (${status})`,
      target: `Verification ID: ${verifId}`,
      targetType: "Verification Queue",
      details: reviewNotes || `Decision: ${status}`
    });

    showToast(
      status === 'Approved'
        ? "Candidate ID verified and Trust badge awarded! ✅"
        : `Verification marked as ${status}.`,
      status === 'Approved' ? "success" : "info"
    );
  };

  const handleExportCSV = () => {
    const res = mockDb.exportDataToCSV('verifications');
    showToast(`Exported ${res.filename}! 📥`, "success");
  };

  return (
    <AdminLayout
      title="Profiles and Verification"
      description="Review candidate government identity documents, tax filings, and corporate badges"
    >
      {/* 3 Top Verification Summary Cards */}
      <div className="admin-kpi-3-grid">
        <div className="admin-kpi-card" onClick={() => setActiveTab('Pending')} style={{ cursor: 'pointer', borderColor: activeTab === 'Pending' ? 'var(--admin-warning)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-warning-bg)', color: 'var(--admin-warning)' }}>
              <Clock size={20} />
            </div>
            <span className="admin-badge warning">Queue</span>
          </div>
          <div>
            <div className="admin-kpi-number">{pendingCount}</div>
            <div className="admin-kpi-label">Pending Reviews</div>
            <div className="admin-kpi-subtext">Requires auditor verification</div>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveTab('Approved')} style={{ cursor: 'pointer', borderColor: activeTab === 'Approved' ? 'var(--admin-success)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <ShieldCheck size={20} />
            </div>
            <span className="admin-badge success">Verified</span>
          </div>
          <div>
            <div className="admin-kpi-number">{approvedCount + 1080}</div>
            <div className="admin-kpi-label">Approved Profiles</div>
            <div className="admin-kpi-subtext">Government proof confirmed</div>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveTab('Rejected')} style={{ cursor: 'pointer', borderColor: activeTab === 'Rejected' ? 'var(--admin-danger)' : 'var(--admin-border)' }}>
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>
              <XCircle size={20} />
            </div>
            <span className="admin-badge danger">Flagged</span>
          </div>
          <div>
            <div className="admin-kpi-number">{rejectedCount + 38}</div>
            <div className="admin-kpi-label">Rejected / Correction</div>
            <div className="admin-kpi-subtext">Incomplete or blurry scans</div>
          </div>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Verification Approval Queue</h3>
              <p className="admin-card-subtitle">Manage government and employment credentials review</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="admin-tab-bar">
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('Pending')}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Approved' ? 'active' : ''}`}
                onClick={() => setActiveTab('Approved')}
              >
                Approved
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'Rejected' ? 'active' : ''}`}
                onClick={() => setActiveTab('Rejected')}
              >
                Rejected / Resubmit
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'All' ? 'active' : ''}`}
                onClick={() => setActiveTab('All')}
              >
                All Records
              </button>
            </div>

            <button
              type="button"
              className="admin-quick-action-btn"
              onClick={handleExportCSV}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              className="admin-input"
              style={{ width: '100%', paddingLeft: '2rem' }}
              placeholder="Search candidate name, ID or document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '19%' }}>Candidate</th>
                <th style={{ width: '13%' }}>Location</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Submitted Proof</th>
                <th style={{ width: '23%' }}>Document Details</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Submitted On</th>
                <th style={{ width: '8%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '12%', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{v.userName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                        ID: {v.userId}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{v.userCity}</div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <span className="admin-badge primary" style={{ fontWeight: 700 }}>
                      {v.documentType}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)' }}>
                      {v.documentPreview}
                    </div>
                    {v.notes && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                        Note: {v.notes}
                      </div>
                    )}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(v.submittedAt).toLocaleDateString('en-IN')}
                    </div>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    {v.status === 'Approved' && <span className="admin-badge success">Approved ✅</span>}
                    {v.status === 'Pending' && <span className="admin-badge warning">Under Review</span>}
                    {v.status === 'Rejected' && <span className="admin-badge danger">Rejected</span>}
                    {v.status === 'Correction Requested' && <span className="admin-badge neutral">Re-upload</span>}
                  </td>

                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {v.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: 'var(--admin-success-bg)',
                              color: 'var(--admin-success)'
                            }}
                            onClick={() => handleAction(v.id, 'Approved', 'Approved via 1-click quick review.')}
                            title="1-Click Quick Approve ✅"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: 'var(--admin-danger-bg)',
                              color: 'var(--admin-danger)'
                            }}
                            onClick={() => handleAction(v.id, 'Rejected', 'Document unclear or invalid.')}
                            title="1-Click Quick Reject ❌"
                          >
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedVerif(v)}
                        style={{ gap: '0.35rem', fontSize: '0.78rem', whiteSpace: 'nowrap', padding: '0.35rem 0.65rem' }}
                        title="Inspect Document"
                      >
                        <Eye size={13} />
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--admin-text-muted)' }}>
                    <ShieldCheck size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>Queue is clear</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>No verification requests matching selected filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Review Modal */}
      <VerificationReviewModal
        isOpen={!!selectedVerif}
        verification={selectedVerif}
        onClose={() => setSelectedVerif(null)}
        onAction={handleAction}
      />
    </AdminLayout>
  );
}
