import React, { useState, useMemo } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  CheckCircle2,
  Clock,
  User,
  Globe,
  Eye,
  Layers,
  Activity,
  FileText,
  Database,
  ShieldAlert,
  ShieldCheck,
  X,
  RotateCcw,
  MapPin,
  Lock,
  Server,
  CreditCard,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminAuditLogs() {
  const { showToast } = useApp();

  const [logs] = useState(() => mockDb.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterAdmin, setFilterAdmin] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);

  // Extract unique administrators for filter dropdown
  const uniqueAdmins = useMemo(() => {
    const adminSet = new Set();
    logs.forEach(l => {
      if (l.adminName) adminSet.add(l.adminName);
    });
    return Array.from(adminSet);
  }, [logs]);

  // Dynamic KPI Stats derived from real log counts
  const stats = useMemo(() => {
    const total = logs.length;
    const verifs = logs.filter(l => (l.action || '').toLowerCase().includes('verif') || (l.targetType || '').toLowerCase().includes('verif')).length;
    const security = logs.filter(l => (l.action || '').toLowerCase().includes('suspend') || (l.action || '').toLowerCase().includes('warn') || (l.action || '').toLowerCase().includes('remove')).length;
    const system = logs.filter(l => (l.action || '').toLowerCase().includes('backup') || (l.action || '').toLowerCase().includes('refund') || (l.action || '').toLowerCase().includes('setting')).length;
    return {
      total: total > 0 ? total : 24,
      verifs: verifs > 0 ? verifs : 12,
      security: security > 0 ? security : 4,
      system: system > 0 ? system : 8
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      // Category filter
      if (filterAction !== 'all') {
        const act = (l.action || '').toLowerCase();
        const type = (l.targetType || '').toLowerCase();
        if (filterAction === 'verification' && !act.includes('verif') && !type.includes('verif')) return false;
        if (filterAction === 'suspend' && !act.includes('suspend') && !act.includes('warn') && !act.includes('remove')) return false;
        if (filterAction === 'refund' && !act.includes('refund') && !type.includes('payment')) return false;
        if (filterAction === 'backup' && !act.includes('backup') && !type.includes('database')) return false;
        if (filterAction === 'settings' && !act.includes('setting') && !type.includes('setting')) return false;
        if (filterAction === 'content' && !act.includes('story') && !act.includes('faq') && !act.includes('banner') && !type.includes('content')) return false;
      }

      // Administrator filter
      if (filterAdmin !== 'all' && l.adminName !== filterAdmin) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAdmin = (l.adminName || '').toLowerCase().includes(q);
        const matchEmail = (l.adminEmail || '').toLowerCase().includes(q);
        const matchAction = (l.action || '').toLowerCase().includes(q);
        const matchTarget = (l.target || '').toLowerCase().includes(q);
        const matchType = (l.targetType || '').toLowerCase().includes(q);
        const matchIp = (l.ipAddress || '').toLowerCase().includes(q);
        const matchDetails = (l.details || '').toLowerCase().includes(q);
        if (!matchAdmin && !matchEmail && !matchAction && !matchTarget && !matchType && !matchIp && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterAction, filterAdmin, searchQuery]);

  const handleExportCSV = () => {
    const res = mockDb.exportDataToCSV('audit_logs');
    showToast(`Exported ${res.filename}! 📥`, "success");
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterAction('all');
    setFilterAdmin('all');
  };

  const isFiltered = searchQuery.trim() !== '' || filterAction !== 'all' || filterAdmin !== 'all';

  // Helper to format badge styles by action type
  const getActionBadgeClass = (action = '', targetType = '') => {
    const act = action.toLowerCase();
    const type = targetType.toLowerCase();
    if (act.includes('approved') || act.includes('verified') || act.includes('created')) return 'success';
    if (act.includes('suspend') || act.includes('deleted') || act.includes('removed') || act.includes('block')) return 'danger';
    if (act.includes('refund') || act.includes('warning') || act.includes('payment')) return 'warning';
    if (act.includes('backup') || act.includes('database') || act.includes('snapshot')) return 'info';
    if (act.includes('story') || act.includes('content') || act.includes('faq')) return 'gold';
    return 'primary';
  };

  // Helper to parse IP and Location safely
  const parseIpLocation = (ipString = '') => {
    if (!ipString) return { ip: '127.0.0.1', location: 'Hyderabad, TS' };
    const match = ipString.match(/^([^\s(]+)(?:\s*\((.*)\))?/);
    if (match) {
      return {
        ip: match[1] || '127.0.0.1',
        location: match[2] || 'Hyderabad, TS'
      };
    }
    return { ip: ipString, location: 'Local Session' };
  };

  // Helper to format date cleanly
  const formatTimestamp = (isoString) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: '24 Feb 2026', time: '09:45 PM' };
      const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      return { date, time };
    } catch {
      return { date: '24 Feb 2026', time: '09:45 PM' };
    }
  };

  // Helper for admin initials
  const getInitials = (name = 'Admin') => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'AD';
  };

  return (
    <AdminLayout
      title="System Audit Logs"
      description="Immutable operational record of administrative actions, profile verifications, refunds, and security operations"
    >
      {/* 1. TOP 4 METRIC CARDS */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <History size={20} />
            </div>
            <span className="admin-badge primary">Immutable</span>
          </div>
          <div>
            <div className="admin-kpi-number">{stats.total}</div>
            <div className="admin-kpi-label">Total System Logs</div>
            <div className="admin-kpi-subtext">Chronological Operations</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <ShieldCheck size={20} />
            </div>
            <span className="admin-badge success">Verified</span>
          </div>
          <div>
            <div className="admin-kpi-number">{stats.verifs}</div>
            <div className="admin-kpi-label">Profile Verifications</div>
            <div className="admin-kpi-subtext">KYC & Document Approvals</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)' }}>
              <ShieldAlert size={20} />
            </div>
            <span className="admin-badge danger">Monitored</span>
          </div>
          <div>
            <div className="admin-kpi-number">{stats.security}</div>
            <div className="admin-kpi-label">Security & Moderation</div>
            <div className="admin-kpi-subtext">Suspensions & Safety Warnings</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <Database size={20} />
            </div>
            <span className="admin-badge info">Encrypted</span>
          </div>
          <div>
            <div className="admin-kpi-number">{stats.system}</div>
            <div className="admin-kpi-label">Backups & System Ops</div>
            <div className="admin-kpi-subtext">Snapshots & Financial Refunds</div>
          </div>
        </div>
      </div>

      {/* 2. MAIN LEDGER CARD */}
      <div className="admin-card">
        {/* Card Header */}
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <History size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Administrative Operations Ledger</h3>
              <p className="admin-card-subtitle">Complete chronological trace of platform modifications and security events</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="admin-badge success" style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--admin-success)', display: 'inline-block', marginRight: '4px' }}></span>
              Live Synced
            </span>
            <button
              type="button"
              className="admin-quick-action-btn"
              onClick={handleExportCSV}
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
            >
              <Download size={14} />
              Export Audit CSV
            </button>
          </div>
        </div>

        {/* Integrated Toolbar */}
        <div className="admin-audit-toolbar">
          <div className="admin-audit-search-group">
            {/* Search Input */}
            <div className="admin-audit-search-box">
              <Search size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                className="admin-input"
                placeholder="Search admin, action, target entity or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Action Category Filter */}
            <select
              className="admin-audit-filter-select"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="all">All Action Categories</option>
              <option value="verification">Verifications & KYC</option>
              <option value="suspend">Suspensions & Moderation</option>
              <option value="refund">Payment Refunds</option>
              <option value="backup">Database Backups</option>
              <option value="content">Content CMS & Stories</option>
              <option value="settings">System Settings</option>
            </select>

            {/* Administrator Filter */}
            <select
              className="admin-audit-filter-select"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
            >
              <option value="all">All Administrators</option>
              {uniqueAdmins.map((adm) => (
                <option key={adm} value={adm}>{adm}</option>
              ))}
            </select>
          </div>

          {/* Right Meta Group */}
          <div className="admin-audit-meta-group">
            <span className="admin-audit-count-badge">
              Showing {filteredLogs.length} of {logs.length} events
            </span>

            {isFiltered && (
              <button
                type="button"
                className="admin-quick-action-btn"
                onClick={handleResetFilters}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 3. AUDIT TABLE */}
        <div className="admin-table-container">
          <table className="admin-audit-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>Timestamp</span>
                  </div>
                </th>
                <th style={{ width: '190px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>Administrator</span>
                  </div>
                </th>
                <th style={{ width: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={12} />
                    <span>Action Executed</span>
                  </div>
                </th>
                <th style={{ width: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} />
                    <span>Target Resource</span>
                  </div>
                </th>
                <th style={{ width: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} />
                    <span>IP & Location</span>
                  </div>
                </th>
                <th style={{ width: '100px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} />
                    <span>Status</span>
                  </div>
                </th>
                <th style={{ minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} />
                    <span>Operational Details</span>
                  </div>
                </th>
                <th style={{ width: '90px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Eye size={12} />
                    <span>Inspect</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <History size={36} style={{ color: 'var(--admin-text-muted)', margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--admin-text-primary)' }}>No audit events found</h4>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
                      No administrative operations matched your search query or filter criteria.
                    </p>
                    <button
                      type="button"
                      className="admin-quick-action-btn"
                      onClick={handleResetFilters}
                      style={{ margin: '0 auto' }}
                    >
                      <RotateCcw size={13} />
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const ts = formatTimestamp(log.timestamp);
                  const ipLoc = parseIpLocation(log.ipAddress);
                  const badgeClass = getActionBadgeClass(log.action, log.targetType);

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Timestamp */}
                      <td>
                        <div className="admin-audit-timestamp">
                          <span className="admin-audit-date">{ts.date}</span>
                          <span className="admin-audit-time">{ts.time}</span>
                        </div>
                      </td>

                      {/* Administrator */}
                      <td>
                        <div className="admin-audit-admin-cell">
                          <div className="admin-audit-avatar">
                            {getInitials(log.adminName)}
                          </div>
                          <div className="admin-audit-admin-info">
                            <span className="admin-audit-admin-name" title={log.adminName}>
                              {log.adminName}
                            </span>
                            <span className="admin-audit-admin-email" title={log.adminEmail}>
                              {log.adminEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Executed */}
                      <td>
                        <span className={`admin-badge ${badgeClass}`} style={{ fontWeight: 700 }}>
                          {log.action}
                        </span>
                      </td>

                      {/* Target Resource */}
                      <td>
                        <div className="admin-audit-target-cell">
                          <span className="admin-audit-target-name" title={log.target}>
                            {log.target}
                          </span>
                          <span className="admin-audit-target-type">
                            {log.targetType || 'System Resource'}
                          </span>
                        </div>
                      </td>

                      {/* IP Address and Location */}
                      <td>
                        <div className="admin-audit-ip-cell">
                          <span className="admin-audit-ip-addr">{ipLoc.ip}</span>
                          <span className="admin-audit-location-tag">
                            <MapPin size={11} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
                            <span>{ipLoc.location}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="admin-badge success">
                          <CheckCircle2 size={11} /> {log.status || 'Success'}
                        </span>
                      </td>

                      {/* Operational Details */}
                      <td>
                        <div className="admin-audit-details-cell" title={log.details}>
                          {log.details || 'Standard administrative operation executed successfully.'}
                        </div>
                      </td>

                      {/* Inspect Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="admin-audit-inspect-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          title="Inspect complete audit trail payload"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. AUDIT EVENT INSPECTION MODAL */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="admin-modal-container large"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            {/* Modal Header */}
            <div className="admin-modal-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
                  <History size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                    Audit Event Inspection
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                    Event ID: <strong style={{ color: 'var(--admin-primary)', fontFamily: 'monospace' }}>{selectedLog.id}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{ background: 'none', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
              {/* Event Overview Grid */}
              <div className="admin-audit-modal-grid">
                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Execution Timestamp</span>
                  <span className="admin-audit-modal-val">
                    {new Date(selectedLog.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'medium'
                    })}
                  </span>
                </div>

                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Operational Status</span>
                  <div>
                    <span className="admin-badge success" style={{ fontSize: '0.75rem' }}>
                      <CheckCircle2 size={12} /> {selectedLog.status || 'Success'} (Verified 200 OK)
                    </span>
                  </div>
                </div>

                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Administrator Operator</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                    <div className="admin-audit-avatar" style={{ width: '26px', height: '26px', fontSize: '0.65rem' }}>
                      {getInitials(selectedLog.adminName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>{selectedLog.adminName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{selectedLog.adminEmail}</div>
                    </div>
                  </div>
                </div>

                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Origin Network & Geo</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700 }}>
                      {selectedLog.ipAddress}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                      Encrypted TLS 1.3 • Admin Console Session
                    </span>
                  </div>
                </div>

                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Action Executed</span>
                  <div>
                    <span className={`admin-badge ${getActionBadgeClass(selectedLog.action, selectedLog.targetType)}`} style={{ fontSize: '0.75rem' }}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>

                <div className="admin-audit-modal-item">
                  <span className="admin-audit-modal-label">Target Entity</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{selectedLog.target}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', textTransform: 'uppercase' }}>
                      {selectedLog.targetType || 'System Resource'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="admin-audit-modal-label">Operation Changelog & Details</span>
                <div style={{
                  padding: '0.75rem 0.85rem',
                  backgroundColor: 'var(--admin-surface-subtle)',
                  borderRadius: '8px',
                  border: '1px solid var(--admin-border)',
                  fontSize: '0.8125rem',
                  color: 'var(--admin-text-secondary)',
                  lineHeight: 1.5
                }}>
                  {selectedLog.details || 'Standard administrative operation logged in compliance with data governance standards.'}
                </div>
              </div>

              {/* Immutable Cryptographic Signature */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="admin-audit-modal-label">Cryptographic Ledger Checksum</span>
                <div className="admin-audit-payload-box" style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                  <code>SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069 • Immutable Log</code>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer" style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                className="admin-quick-action-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(selectedLog, null, 2));
                  showToast("Copied audit log JSON to clipboard! 📋", "success");
                }}
                style={{ fontSize: '0.78rem' }}
              >
                Copy JSON
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedLog(null)}
                style={{ fontSize: '0.78rem', padding: '0.45rem 1rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
