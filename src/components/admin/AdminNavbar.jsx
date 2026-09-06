import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import {
  Search,
  Menu,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Calendar,
  LifeBuoy,
  X,
  User,
  Users,
  CreditCard,
  Flag,
  ArrowRight
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminNavbar({
  title = "Overview",
  description = "TeluguBandham Administrative Management System",
  onOpenMobile,
  onDateChange
}) {
  const { adminUser, adminLogout } = useAuth();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  // Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tb_admin_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', theme);
    localStorage.setItem('tb_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const dateRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const pendingVerifs = mockDb.getVerifications().filter((v) => v.status === 'Pending');
  const openReports = mockDb.getReports().filter((r) => r.status === 'Under Review');
  const openTickets = mockDb.getSupportTickets().filter((t) => t.status === 'Open');
  const totalNotifs = pendingVerifs.length + openReports.length + openTickets.length;

  // Search Results Computation
  const q = globalSearch.trim().toLowerCase();
  const allProfiles = mockDb.getProfiles() || [];
  const allVerifications = mockDb.getVerifications() || [];
  const allReports = mockDb.getReports() || [];

  const matchedProfiles = q ? allProfiles.filter(p => 
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.id && p.id.toLowerCase().includes(q)) ||
    (p.city && p.city.toLowerCase().includes(q)) ||
    (p.community && p.community.toLowerCase().includes(q)) ||
    (p.profession && p.profession.toLowerCase().includes(q))
  ).slice(0, 4) : [];

  const matchedVerifs = q ? allVerifications.filter(v =>
    (v.userName && v.userName.toLowerCase().includes(q)) ||
    (v.id && v.id.toLowerCase().includes(q)) ||
    (v.documentType && v.documentType.toLowerCase().includes(q))
  ).slice(0, 2) : [];

  const matchedReports = q ? allReports.filter(r =>
    (r.reportedUserName && r.reportedUserName.toLowerCase().includes(q)) ||
    (r.reason && r.reason.toLowerCase().includes(q)) ||
    (r.id && r.id.toLowerCase().includes(q))
  ).slice(0, 2) : [];

  // Global Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target)) {
        setDateDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/admin/users?q=${encodeURIComponent(globalSearch.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleSelectResult = (path) => {
    setIsSearchOpen(false);
    navigate(path);
  };

  const handleDateSelect = (range) => {
    setSelectedDateRange(range);
    setDateDropdownOpen(false);
    if (onDateChange) onDateChange(range);
  };

  return (
    <header className="admin-topbar">
      {/* Left: Hamburger Button, Breadcrumb & Title */}
      <div className="admin-topbar-left">
        {onOpenMobile && (
          <button
            type="button"
            className="admin-mobile-menu-btn d-lg-none"
            onClick={onOpenMobile}
            aria-label="Open Admin Navigation Menu"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="admin-topbar-title-wrap">
          <div className="admin-breadcrumb-group d-none d-sm-flex">
            <span>TeluguBandham</span>
            <span>/</span>
            <span style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>Admin Portal</span>
          </div>
          <h1 className="admin-breadcrumb-title">{title}</h1>
        </div>
      </div>

      {/* Right: Search, Date Filter, Theme, Notifications, Profile */}
      <div className="admin-topbar-actions">
        {/* Global Search with Live Results Popover */}
        <div ref={searchRef} className="admin-search-wrapper admin-topbar-search-wrap">
          <form onSubmit={handleGlobalSearch}>
            <div className="admin-search-pill">
              <Search size={15} style={{ color: 'var(--admin-primary)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search candidate, ID, phone, city..."
                value={globalSearch}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setIsSearchOpen(true);
                }}
              />
              {globalSearch && (
                <button
                  type="button"
                  className="admin-search-clear-btn"
                  onClick={() => {
                    setGlobalSearch('');
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>

          {/* Live Search Dropdown */}
          {isSearchOpen && (
            <div className="admin-search-results-popover">
              {q ? (
                <div>
                  {matchedProfiles.length > 0 && (
                    <div className="admin-search-section">
                      <div className="admin-search-section-header">Matched Profiles ({matchedProfiles.length})</div>
                      {matchedProfiles.map((p) => (
                        <div
                          key={p.id}
                          className="admin-search-result-row"
                          onClick={() => handleSelectResult(`/admin/users?q=${encodeURIComponent(p.name)}`)}
                        >
                          <div className="admin-search-result-left">
                            <div className="admin-search-avatar">
                              {p.photos?.[0] ? (
                                <img src={p.photos[0]} alt={p.name} />
                              ) : (
                                p.name?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                                {p.name} <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>({p.id})</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-secondary)' }}>
                                {p.community} • {p.city} • {p.profession}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: p.isVerified ? 'var(--admin-success)' : 'var(--admin-text-muted)', background: p.isVerified ? 'var(--admin-success-bg)' : 'var(--admin-surface-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                            {p.membershipTier || 'Free'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedVerifs.length > 0 && (
                    <div className="admin-search-section">
                      <div className="admin-search-section-header">Verification Records</div>
                      {matchedVerifs.map((v) => (
                        <div
                          key={v.id}
                          className="admin-search-result-row"
                          onClick={() => handleSelectResult('/admin/verifications')}
                        >
                          <div className="admin-search-result-left">
                            <ShieldCheck size={16} color="var(--admin-primary)" />
                            <div>
                              <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{v.userName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{v.documentType} • {v.status}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--admin-warning)', fontWeight: 700 }}>Queue →</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedReports.length > 0 && (
                    <div className="admin-search-section">
                      <div className="admin-search-section-header">Safety & Reports</div>
                      {matchedReports.map((r) => (
                        <div
                          key={r.id}
                          className="admin-search-result-row"
                          onClick={() => handleSelectResult('/admin/reports')}
                        >
                          <div className="admin-search-result-left">
                            <Flag size={16} style={{ color: 'var(--admin-danger)' }} />
                            <div>
                              <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{r.reportedUserName}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--admin-danger)' }}>{r.reason}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--admin-danger)', fontWeight: 700 }}>Review →</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchedProfiles.length === 0 && matchedVerifs.length === 0 && matchedReports.length === 0 && (
                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '0.825rem' }}>
                      No matching records found for "{globalSearch}"
                    </div>
                  )}

                  <div
                    className="admin-search-footer"
                    onClick={() => handleSelectResult(`/admin/users?q=${encodeURIComponent(globalSearch.trim())}`)}
                  >
                    <span>Press <strong>Enter</strong> to search all users in management</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Quick Admin Navigation</div>
                    <div className="admin-search-result-row" onClick={() => handleSelectResult('/admin/users')}>
                      <div className="admin-search-result-left">
                        <Users size={16} color="var(--admin-primary)" />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>User Management</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>158.7K Members</span>
                    </div>

                    <div className="admin-search-result-row" onClick={() => handleSelectResult('/admin/verifications')}>
                      <div className="admin-search-result-left">
                        <ShieldCheck size={16} style={{ color: 'var(--admin-success)' }} />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Verification Queue</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: 'var(--admin-warning-bg)', color: 'var(--admin-warning)', border: '1px solid var(--admin-warning-border)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {pendingVerifs.length} Pending
                      </span>
                    </div>

                    <div className="admin-search-result-row" onClick={() => handleSelectResult('/admin/reports')}>
                      <div className="admin-search-result-left">
                        <AlertTriangle size={16} style={{ color: 'var(--admin-danger)' }} />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Reports & Safety</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: 'var(--admin-danger-bg)', color: 'var(--admin-danger)', border: '1px solid var(--admin-danger-border)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {openReports.length} Review
                      </span>
                    </div>

                    <div className="admin-search-result-row" onClick={() => handleSelectResult('/admin/memberships')}>
                      <div className="admin-search-result-left">
                        <CreditCard size={16} color="#8B5CF6" />
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Memberships & Plans</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>Revenue & Tiering</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Range Selector */}
        <div ref={dateRef} style={{ position: 'relative' }} className="admin-topbar-date-wrap">
          <button
            type="button"
            className="admin-quick-action-btn"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            onClick={() => {
              setDateDropdownOpen(!dateDropdownOpen);
              setNotifDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
          >
            <Calendar size={13} style={{ color: 'var(--admin-primary)' }} />
            <span>{selectedDateRange}</span>
            <ChevronDown size={12} style={{ color: 'var(--admin-text-muted)' }} />
          </button>

          {dateDropdownOpen && (
            <div className="admin-dropdown-menu" style={{ width: '165px' }}>
              {['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date', 'All Time'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className="admin-dropdown-item"
                  style={{ fontWeight: selectedDateRange === r ? 800 : 500, color: selectedDateRange === r ? 'var(--admin-primary)' : 'inherit' }}
                  onClick={() => handleDateSelect(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switcher (Light / Dark) */}
        <button
          type="button"
          className="admin-icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon size={16} style={{ color: 'var(--admin-text-secondary)' }} />
          ) : (
            <Sun size={16} style={{ color: 'var(--admin-gold)' }} />
          )}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setProfileDropdownOpen(false);
              setDateDropdownOpen(false);
            }}
            title="Administrative Alerts & Tasks"
          >
            <Bell size={16} />
            {totalNotifs > 0 && <span className="admin-notif-dot" />}
          </button>

          {notifDropdownOpen && (
            <div
              className="admin-dropdown-menu admin-notif-dropdown"
              style={{ padding: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--admin-border-subtle)', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>Action Alerts</span>
                <span className="admin-badge danger" style={{ fontSize: '0.65rem' }}>
                  {totalNotifs} pending
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {pendingVerifs.length > 0 && (
                  <Link
                    to="/admin/verifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--admin-warning-bg)',
                      border: '1px solid var(--admin-warning-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: 'var(--admin-warning)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{pendingVerifs.length} ID Proofs Awaiting Review</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)' }}>Aadhaar & Passport verification</div>
                    </div>
                  </Link>
                )}

                {openReports.length > 0 && (
                  <Link
                    to="/admin/reports"
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--admin-danger-bg)',
                      border: '1px solid var(--admin-danger-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <AlertTriangle size={16} style={{ color: 'var(--admin-danger)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{openReports.length} Safety Complaints</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)' }}>Member reports requiring review</div>
                    </div>
                  </Link>
                )}

                {openTickets.length > 0 && (
                  <Link
                    to="/admin/support"
                    onClick={() => setNotifDropdownOpen(false)}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--admin-info-bg)',
                      border: '1px solid var(--admin-info-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      textDecoration: 'none',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.78rem'
                    }}
                  >
                    <LifeBuoy size={16} style={{ color: 'var(--admin-info)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800 }}>{openTickets.length} Open Support Tickets</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)' }}>Horoscope & Account questions</div>
                    </div>
                  </Link>
                )}

                {totalNotifs === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.25rem 0', color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={22} style={{ color: 'var(--admin-success)', margin: '0 auto 0.4rem' }} />
                    <div>All queues clear! Zero pending tasks.</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            className="admin-profile-pill"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotifDropdownOpen(false);
              setDateDropdownOpen(false);
            }}
          >
            <div className="admin-avatar">
              {(adminUser?.name || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }} className="admin-profile-meta">
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--admin-text-primary)', lineHeight: 1.2 }}>
                {adminUser?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--admin-gold)' }}>
                {adminUser?.role || 'Super Admin'}
              </div>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--admin-text-muted)' }} />
          </button>

          {profileDropdownOpen && (
            <div className="admin-dropdown-menu" style={{ width: '210px' }}>
              <div style={{ padding: '0.5rem 0.65rem', borderBottom: '1px solid var(--admin-border-subtle)', marginBottom: '0.2rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800 }}>{adminUser?.name || 'Master Admin'}</div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {adminUser?.email || 'admin@telugubandham.com'}
                </div>
              </div>

              <Link
                to="/admin/settings"
                className="admin-dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <Settings size={14} />
                <span>System Settings</span>
              </Link>

              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-dropdown-item"
                onClick={() => setProfileDropdownOpen(false)}
              >
                <ExternalLink size={14} style={{ color: 'var(--admin-gold)' }} />
                <span>View Public Site</span>
              </Link>

              <div style={{ height: '1px', backgroundColor: 'var(--admin-border-subtle)', margin: '3px 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                className="admin-dropdown-item danger"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
