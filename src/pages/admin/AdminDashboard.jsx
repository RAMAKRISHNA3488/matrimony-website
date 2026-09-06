import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  RegistrationAreaChart,
  PlanDonutChart,
  RevenueBarChart,
  CityDistributionBars,
  GenderRatioWidget
} from '../../components/admin/AdminCharts';
import {
  AddAdminModal,
  AddMemberModal,
  AnnouncementModal,
  BulkMessageModal,
  ExportDataModal,
  SystemBackupModal,
  UserProfileViewerModal
} from '../../components/admin/AdminModals';
import {
  Users,
  UserPlus,
  Activity,
  CreditCard,
  Heart,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Server,
  ArrowUpRight,
  UserCheck,
  Send,
  Download,
  Database,
  Eye,
  ChevronRight,
  Ban
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminDashboard() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  // Modals state
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isBulkMessageOpen, setIsBulkMessageOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [selectedUserForModal, setSelectedUserForModal] = useState(null);

  // Dynamic real-time datasets
  const [profiles, setProfiles] = useState(() => mockDb.getProfiles());
  const [verifications, setVerifications] = useState(() => mockDb.getVerifications());
  const [reports, setReports] = useState(() => mockDb.getReports());
  const [systemServices, setSystemServices] = useState(() => mockDb.getSystemServices());
  const [auditLogs, setAuditLogs] = useState(() => mockDb.getAuditLogs().slice(0, 6));

  // Subscribe to instant mockDb mutations across all tabs and components
  useEffect(() => {
    const handleSync = () => {
      setProfiles(mockDb.getProfiles());
      setVerifications(mockDb.getVerifications());
      setReports(mockDb.getReports());
      setSystemServices(mockDb.getSystemServices());
      setAuditLogs(mockDb.getAuditLogs().slice(0, 6));
    };

    const unsubscribe = mockDb.subscribe(() => {
      handleSync();
    });

    return () => unsubscribe();
  }, []);

  const pendingVerifsCount = verifications.filter((v) => v.status === 'Pending').length;
  const openReportsCount = reports.filter((r) => r.status === 'Under Review').length;

  // 1-Click Quick Actions directly from Recent Registrations
  const handleQuickVerify = (e, m) => {
    e.stopPropagation();
    const nextStatus = !m.isVerified;
    mockDb.adminVerifyUser(m.id, nextStatus);
    setProfiles(mockDb.getProfiles());
    mockDb.addAuditLog({
      action: nextStatus ? "Verified Candidate Profile" : "Revoked Verification",
      target: `${m.name} (${m.id})`,
      targetType: "User Profile",
      details: nextStatus ? "Instant 1-click verification via Dashboard." : "Verification badge removed."
    });
    showToast(
      nextStatus ? `${m.name} verified instantly! ✅` : `Verification revoked for ${m.name}`,
      nextStatus ? "success" : "info"
    );
  };

  const handleQuickToggleStatus = (e, m) => {
    e.stopPropagation();
    const willSuspend = !m.isSuspended;
    mockDb.adminToggleUserStatus(m.id, willSuspend);
    setProfiles(mockDb.getProfiles());
    mockDb.addAuditLog({
      action: willSuspend ? "Account Suspended by Admin" : "Account Reactivated",
      target: `${m.name} (${m.id})`,
      targetType: "User Profile",
      details: willSuspend ? "Instant 1-click suspension from Dashboard." : "Account restored to active."
    });
    showToast(
      willSuspend ? `Account for ${m.name} suspended.` : `Account for ${m.name} reactivated!`,
      willSuspend ? "danger" : "success"
    );
  };

  // 6 Top KPI Metrics with navigation routes
  const kpis = [
    {
      id: 'kpi-1',
      label: 'Total Members',
      value: '158,732',
      change: '+12.5%',
      period: 'vs last month',
      icon: Users,
      color: 'var(--admin-primary)',
      bg: 'var(--admin-primary-tint)',
      path: '/admin/users'
    },
    {
      id: 'kpi-2',
      label: 'New Registrations',
      value: '2,842',
      change: '+18.7%',
      period: 'vs last month',
      icon: UserPlus,
      color: 'var(--admin-info)',
      bg: 'var(--admin-info-bg)',
      path: '/admin/analytics'
    },
    {
      id: 'kpi-3',
      label: 'Active Members',
      value: '74,563',
      change: '+9.3%',
      period: 'vs last month',
      icon: Activity,
      color: 'var(--admin-success)',
      bg: 'var(--admin-success-bg)',
      path: '/admin/users'
    },
    {
      id: 'kpi-4',
      label: 'Paid Members',
      value: '18,450',
      change: '+15.2%',
      period: 'vs last month',
      icon: CreditCard,
      color: 'var(--admin-gold)',
      bg: 'var(--admin-gold-tint)',
      path: '/admin/memberships'
    },
    {
      id: 'kpi-5',
      label: 'Successful Matches',
      value: '1,256',
      change: '+11.8%',
      period: 'vs last month',
      icon: Heart,
      color: 'var(--admin-primary)',
      bg: 'var(--admin-primary-tint)',
      path: '/admin/matches'
    },
    {
      id: 'kpi-6',
      label: 'Gross Revenue',
      value: '₹48,75,230',
      change: '+14.6%',
      period: 'vs last month',
      icon: TrendingUp,
      color: 'var(--admin-primary)',
      bg: 'var(--admin-primary-tint)',
      path: '/admin/memberships'
    }
  ];

  // 5 Recent Members
  const recentMembers = profiles.slice(0, 5);

  return (
    <AdminLayout
      title="System Overview"
      description="TeluguBandham Executive Operations and Matrimonial Analytics Console"
    >
      {/* ================= 1. 6 TOP KPI CARDS ================= */}
      <section className="admin-kpi-6-grid">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.id}
              className="admin-kpi-card"
              onClick={() => navigate(k.path)}
              role="button"
              tabIndex={0}
              title={`Click to open ${k.label} page`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(k.path);
                }
              }}
            >
              <ArrowUpRight size={15} className="admin-kpi-action-hint" />
              <div className="admin-kpi-top">
                <div className="admin-kpi-icon-box" style={{ backgroundColor: k.bg, color: k.color }}>
                  <Icon size={18} />
                </div>
                <span className="admin-kpi-trend positive">
                  <TrendingUp size={11} /> {k.change}
                </span>
              </div>
              <div>
                <div className="admin-kpi-number">{k.value}</div>
                <div className="admin-kpi-label">{k.label}</div>
                <div className="admin-kpi-subtext">{k.period}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================= 2. MAIN ANALYTICS AREA (ROW 1) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card 1: Registrations Overview */}
        <div className="admin-card" style={{ minWidth: 0, flex: 1.4 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Activity size={16} style={{ color: 'var(--admin-primary)' }} />
                Registrations Overview
              </h3>
              <p className="admin-card-subtitle">Candidate onboarding velocity and active member trends</p>
            </div>
            <Link to="/admin/analytics" className="admin-card-action-link">
              View Analytics →
            </Link>
          </div>
          <div className="admin-card-body">
            <RegistrationAreaChart />
          </div>
        </div>

        {/* Card 2: Members by Plan */}
        <div className="admin-card" style={{ minWidth: 0, flex: 1 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <CreditCard size={16} style={{ color: 'var(--admin-gold)' }} />
                Members by Plan
              </h3>
              <p className="admin-card-subtitle">Active subscription tier distribution</p>
            </div>
            <Link to="/admin/memberships" className="admin-card-action-link">
              Manage Plans →
            </Link>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <PlanDonutChart />
          </div>
        </div>
      </div>

      {/* Row 1 Lower: Recent Registrations + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Card 3: Recent Registrations */}
        <div className="admin-card" style={{ minWidth: 0, flex: 1.4 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <UserPlus size={16} style={{ color: 'var(--admin-primary)' }} />
                Recent Registrations
              </h3>
              <p className="admin-card-subtitle">Latest candidate profiles registered on platform</p>
            </div>
            <Link to="/admin/users" className="admin-card-action-link">
              View All Users →
            </Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Community & City</th>
                  <th style={{ textAlign: 'center' }}>Tier</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedUserForModal(m)}
                    style={{ cursor: 'pointer' }}
                    title="Click to preview candidate details"
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img
                          src={(m.photos && m.photos[0]) || '/assets/branding/Default_Male_Avatar.svg'}
                          alt={m.name}
                          className="admin-table-avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/assets/branding/Default_Male_Avatar.svg';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>{m.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{m.id} • {m.age} yrs</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{m.community}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>{m.city}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin-badge ${m.membershipTier === 'Elite VIP' ? 'gold' : m.membershipTier === 'Diamond' ? 'primary' : m.membershipTier === 'Gold' ? 'gold' : 'neutral'}`}>
                        {m.membershipTier || 'Free'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {m.isVerified ? (
                        <span className="admin-badge success">Verified ✅</span>
                      ) : (
                        <span className="admin-badge warning">Pending ID</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: m.isVerified ? 'var(--admin-success-bg)' : 'var(--admin-surface-subtle)',
                            color: m.isVerified ? 'var(--admin-success)' : 'var(--admin-text-muted)'
                          }}
                          onClick={(e) => handleQuickVerify(e, m)}
                          title={m.isVerified ? "Revoke Verification" : "1-Click Quick Verify ✅"}
                        >
                          <ShieldCheck size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: m.isSuspended ? 'var(--admin-danger-bg)' : 'var(--admin-surface-subtle)',
                            color: m.isSuspended ? 'var(--admin-danger)' : 'var(--admin-text-muted)'
                          }}
                          onClick={(e) => handleQuickToggleStatus(e, m)}
                          title={m.isSuspended ? "1-Click Reactivate" : "1-Click Suspend"}
                        >
                          <Ban size={13} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '28px', height: '28px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserForModal(m);
                          }}
                          title="Preview Candidate Profile"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 4: Quick Actions */}
        <div className="admin-card" style={{ minWidth: 0, flex: 1 }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                Quick Actions
              </h3>
              <p className="admin-card-subtitle">Direct administrative triggers and utility operations</p>
            </div>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsAddMemberOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Add New Member</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Quickly register & publish candidate biodata</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsAddAdminOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Add New Admin</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Grant RBAC roles to team member</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsAnnouncementOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Send Announcement</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Broadcast banner alert to candidates</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsBulkMessageOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Bulk Push Notification</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Target segmented city/career cohorts</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsExportOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>Export Data to CSV</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Download users, transactions or logs</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              style={{ justifyContent: 'space-between', padding: '0.75rem 0.85rem' }}
              onClick={() => setIsBackupOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Database size={16} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8125rem' }}>System Backup Snapshot</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)' }}>Generate instant verified DB backup</div>
                </div>
              </div>
              <ArrowUpRight size={15} style={{ color: 'var(--admin-text-muted)', transition: 'transform 0.18s ease' }} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 3. SECOND ANALYTICS ROW ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Recent Reports */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <AlertTriangle size={15} style={{ color: 'var(--admin-danger)' }} />
                Recent Reports
              </h3>
              <p className="admin-card-subtitle">{openReportsCount} safety flags pending</p>
            </div>
            <Link to="/admin/reports" className="admin-card-action-link">
              View All →
            </Link>
          </div>
          <div className="admin-card-body" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {reports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate('/admin/reports')}
                  className="admin-interactive-item"
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--admin-surface-subtle)',
                    border: '1px solid var(--admin-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px'
                  }}
                  title="Click to investigate report"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--admin-text-primary)' }}>
                      {r.reportedUserName}
                    </span>
                    <span className={`admin-badge ${r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'neutral'}`} style={{ fontSize: '0.625rem' }}>
                      {r.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)' }}>
                    {r.category}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', fontSize: '0.65rem', color: 'var(--admin-text-muted)' }}>
                    <span>By: {r.reportedBy.split(' ')[0]}</span>
                    <span style={{ color: 'var(--admin-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      Review →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Membership Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <TrendingUp size={15} style={{ color: 'var(--admin-gold)' }} />
                Revenue Trend
              </h3>
              <p className="admin-card-subtitle">Monthly plan collection</p>
            </div>
            <Link to="/admin/memberships" className="admin-card-action-link">
              Billing →
            </Link>
          </div>
          <div className="admin-card-body">
            <RevenueBarChart />
          </div>
        </div>

        {/* Matches Overview */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Heart size={15} style={{ color: 'var(--admin-primary)' }} />
                Matches Engine
              </h3>
              <p className="admin-card-subtitle">Algorithm performance</p>
            </div>
            <Link to="/admin/matches" className="admin-card-action-link">
              Explore →
            </Link>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.85rem 1rem' }}>
            {/* Top 3 Metric Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
              <div
                onClick={() => navigate('/admin/matches')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem 0.35rem', borderRadius: '8px', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)', textAlign: 'center' }}
                title="Click to view all algorithmic matches"
              >
                <div style={{ fontSize: '0.625rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>GENERATED</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginTop: '2px' }}>42.8K</div>
              </div>
              <div
                onClick={() => navigate('/admin/matches')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem 0.35rem', borderRadius: '8px', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)', textAlign: 'center' }}
                title="Click to view mutual matches"
              >
                <div style={{ fontSize: '0.625rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>MUTUAL</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '2px' }}>8,640</div>
              </div>
              <div
                onClick={() => navigate('/admin/stories')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem 0.35rem', borderRadius: '8px', backgroundColor: 'var(--admin-primary-tint)', border: '1px solid var(--admin-primary-border)', textAlign: 'center' }}
                title="Click to view weddings & success stories"
              >
                <div style={{ fontSize: '0.625rem', color: 'var(--admin-primary)', fontWeight: 700 }}>WEDDINGS</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '2px' }}>1,256</div>
              </div>
            </div>

            {/* Quality & Conversion Progress Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.55rem 0.65rem', borderRadius: '8px', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Algorithm Match Accuracy</span>
                  <span style={{ color: 'var(--admin-success)' }}>86.4% High</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--admin-border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '86.4%', height: '100%', backgroundColor: 'var(--admin-success)', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: 'var(--admin-text-secondary)' }}>Engagement Conversion</span>
                  <span style={{ color: 'var(--admin-primary)' }}>18.4%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--admin-border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '18.4%', height: '100%', backgroundColor: 'var(--admin-primary)', borderRadius: '999px' }} />
                </div>
              </div>
            </div>

            {/* Detailed funnel rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
              <div
                onClick={() => navigate('/admin/matches')}
                className="admin-interactive-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--admin-border-subtle)' }}
                title="Click to view astrological match distributions"
              >
                <span style={{ color: 'var(--admin-text-secondary)' }}>Avg Kundali Guna Score:</span>
                <strong style={{ color: 'var(--admin-text-primary)' }}>28.5 / 36 (Uttama)</strong>
              </div>

              <div
                onClick={() => navigate('/admin/messages')}
                className="admin-interactive-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--admin-border-subtle)', backgroundColor: 'var(--admin-surface-subtle)' }}
                title="Click to view live message conversations"
              >
                <span style={{ color: 'var(--admin-text-secondary)' }}>In-Progress Chats:</span>
                <strong style={{ color: 'var(--admin-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  5,410 Cases →
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Clock size={15} style={{ color: 'var(--admin-primary)' }} />
                Live Audit Log
              </h3>
              <p className="admin-card-subtitle">Platform admin events</p>
            </div>
            <Link to="/admin/audit-logs" className="admin-card-action-link">
              Audit Trail →
            </Link>
          </div>
          <div className="admin-card-body" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  onClick={() => navigate('/admin/audit-logs')}
                  className="admin-interactive-item"
                  style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', padding: '0.4rem 0.5rem', borderRadius: '6px' }}
                  title="Click to inspect audit trail"
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircle2 size={13} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--admin-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.action}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.target}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--admin-text-muted)' }}>
                      {log.adminName.split(' ')[0]} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. THIRD ANALYTICS ROW ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
        {/* Profile Verification Breakdown */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <ShieldCheck size={15} style={{ color: 'var(--admin-success)' }} />
                Verifications
              </h3>
              <p className="admin-card-subtitle">Identity proof stats</p>
            </div>
            <Link to="/admin/verifications" className="admin-card-action-link">
              Queue ({pendingVerifsCount}) →
            </Link>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem', textAlign: 'center' }}>
              <div
                onClick={() => navigate('/admin/verifications')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--admin-warning-bg)' }}
                title="Click to review pending verifications"
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--admin-warning)', fontWeight: 700 }}>Pending</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-warning)' }}>{pendingVerifsCount}</div>
              </div>
              <div
                onClick={() => navigate('/admin/verifications')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--admin-success-bg)' }}
                title="Click to view approved verifications"
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--admin-success)', fontWeight: 700 }}>Approved</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-success)' }}>1,084</div>
              </div>
              <div
                onClick={() => navigate('/admin/verifications')}
                className="admin-interactive-item"
                style={{ padding: '0.45rem', borderRadius: '6px', backgroundColor: 'var(--admin-danger-bg)' }}
                title="Click to view rejected proofs"
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--admin-danger)', fontWeight: 700 }}>Rejected</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-danger)' }}>38</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Aadhaar / Govt ID:</span>
                <strong>78.4%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Corporate Employment:</span>
                <strong>64.2%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-secondary)' }}>Selfie Photo Matched:</span>
                <strong>92.1%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Top Cities */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Users size={15} style={{ color: 'var(--admin-primary)' }} />
                Top Cities
              </h3>
              <p className="admin-card-subtitle">Candidate density</p>
            </div>
            <Link to="/admin/analytics" className="admin-card-action-link">
              Metrics →
            </Link>
          </div>
          <div className="admin-card-body">
            <CityDistributionBars />
          </div>
        </div>

        {/* Gender Ratio */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Users size={15} style={{ color: 'var(--admin-info)' }} />
                Gender Ratio
              </h3>
              <p className="admin-card-subtitle">Bride & Groom balance</p>
            </div>
            <Link to="/admin/users" className="admin-card-action-link">
              Directory →
            </Link>
          </div>
          <div className="admin-card-body" style={{ display: 'flex', alignItems: 'center' }}>
            <GenderRatioWidget />
          </div>
        </div>

        {/* System Services Status */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Server size={15} style={{ color: 'var(--admin-success)' }} />
                System Health
              </h3>
              <p className="admin-card-subtitle">Infrastructure telemetry</p>
            </div>
            <Link to="/admin/backup" className="admin-card-action-link">
              Backups →
            </Link>
          </div>
          <div className="admin-card-body" style={{ padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {systemServices.map((svc, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/admin/backup')}
                  className="admin-interactive-item"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', padding: '0.35rem 0.5rem', borderRadius: '6px' }}
                  title="Click to view database health & backups"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--admin-success)', display: 'inline-block' }} />
                    <span style={{ fontWeight: 600, color: 'var(--admin-text-primary)' }}>{svc.name.split('(')[0]}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                    {svc.latency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL DIALOGS ================= */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        showToast={showToast}
      />

      <AddAdminModal
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        showToast={showToast}
      />

      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        showToast={showToast}
      />

      <BulkMessageModal
        isOpen={isBulkMessageOpen}
        onClose={() => setIsBulkMessageOpen(false)}
        showToast={showToast}
      />

      <ExportDataModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        showToast={showToast}
      />

      <SystemBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        showToast={showToast}
      />

      <UserProfileViewerModal
        user={selectedUserForModal}
        isOpen={!!selectedUserForModal}
        onClose={() => setSelectedUserForModal(null)}
      />
    </AdminLayout>
  );
}
