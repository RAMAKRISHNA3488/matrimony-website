import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import {
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  Crown,
  Settings,
  ShieldCheck,
  HelpCircle,
  LogOut,
  Home,
  Users,
  Search,
  MessageCircle,
  Menu,
  AlertTriangle,
  X,
  Heart
} from 'lucide-react';
import '../../styles/navbar.css';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead, conversations, systemSettings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location?.pathname || '';

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Admin-controlled Hero Announcement Banner state
  const [heroBanner, setHeroBanner] = useState(() => mockDb.getHeroBanner());
  const [isBannerDismissed, setIsBannerDismissed] = useState(() => mockDb.isHeroBannerDismissed());

  const userDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Sync banner in real-time when admin publishes/updates/toggles it
  useEffect(() => {
    const handleBannerUpdate = () => {
      setHeroBanner(mockDb.getHeroBanner());
      setIsBannerDismissed(mockDb.isHeroBannerDismissed());
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'banner' || type === 'settings' || type === 'storage_sync') {
        handleBannerUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handleBannerUpdate);
    window.addEventListener('storage', handleBannerUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handleBannerUpdate);
      window.removeEventListener('storage', handleBannerUpdate);
    };
  }, []);

  // Close dropdowns on outside click & Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdowns on route navigation
  useEffect(() => {
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
    setMobileMenuOpen(false);
    setAvatarError(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Helper for 1st Alphabet
  const getInitial = (name) => {
    if (!name || typeof name !== 'string') return 'M';
    const trimmed = name.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : 'M';
  };

  const getDisplayTier = (tier) => {
    if (!tier) return 'Free Member';
    const trimmed = tier.trim();
    if (trimmed.toLowerCase().endsWith('member')) {
      return trimmed;
    }
    return `${trimmed} Member`;
  };

  const displayName = user?.name || user?.fullName || 'Member';
  const displayTier = getDisplayTier(user?.membershipTier || user?.membershipPlan);
  const userPhoto = user?.photos && user.photos.length > 0 ? user.photos[0] : null;
  const hasCustomPhoto = Boolean(
    userPhoto &&
    !userPhoto.includes('/assets/profiles/') &&
    !userPhoto.includes('unsplash.com')
  );

  // Unread badge count (dynamic from app context)
  const displayBadgeCount = unreadNotifCount > 0 ? unreadNotifCount : 0;

  // Total unread messages count for mobile bottom bar badge
  const totalUnreadMessages = Array.isArray(conversations)
    ? conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
    : 0;

  const handleDismissBanner = (e) => {
    e.preventDefault();
    e.stopPropagation();
    mockDb.dismissHeroBanner();
    setIsBannerDismissed(true);
  };

  return (
    <>
      {/* Real-Time Maintenance Mode Alert Banner (Admin Controlled) */}
      {systemSettings?.maintenanceMode && (
        <div 
          className="system-maintenance-banner"
          style={{
            backgroundColor: '#dc2626',
            color: '#ffffff',
            padding: '10px 16px',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 1100,
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
          }}
          role="alert"
        >
          <AlertTriangle size={18} />
          <span>Notice: TeluguBandham is currently undergoing scheduled maintenance. Some features may be temporarily limited.</span>
        </div>
      )}

      {/* Real-Time Platform Announcement Banner (Controlled by Admin Content Management, Off by default) */}
      {heroBanner?.isActive && !isBannerDismissed && (
        <div className="global-announcement-banner" role="region" aria-label="Announcement Banner">
          <div className="global-announcement-container">
            <div className="global-announcement-content">
              {heroBanner.badgeText && (
                <span className="global-announcement-badge">{heroBanner.badgeText}</span>
              )}
              <span className="global-announcement-text">
                <strong className="global-announcement-title">{heroBanner.title}</strong>
                {heroBanner.subtitle && (
                  <span className="global-announcement-sub"> — {heroBanner.subtitle}</span>
                )}
              </span>
              {heroBanner.ctaText && (
                <Link
                  to={heroBanner.ctaLink || '/membership'}
                  className="global-announcement-cta"
                >
                  {heroBanner.ctaText} →
                </Link>
              )}
            </div>
            <button
              type="button"
              className="global-announcement-dismiss"
              onClick={handleDismissBanner}
              aria-label="Dismiss announcement"
              title="Dismiss announcement"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      <header className="navbar-header">
        <div className="navbar-container">
          <div className="navbar-inner">

            {/* 1. LEFT: TeluguBandham Logo */}
            <div className="navbar-brand-col">
              <Link to={isAuthenticated ? "/dashboard" : "/"} className="brand-logo" aria-label="TeluguBandham Home">
                <img
                  src="/assets/branding/TeluguBandham_Logo_Primary.png"
                  alt="TeluguBandham"
                  className="navbar-brand-img"
                />
              </Link>
            </div>

            {/* 2. CENTER: Navigation Links (Single clean line, no wrapping) */}
            {isAuthenticated ? (
              <nav className="nav-menu-desktop" aria-label="Main Navigation">
                <Link
                  to="/dashboard"
                  className={`nav-link-item ${currentPath === '/dashboard' ? 'active' : ''}`}
                >
                  {t('nav.home', 'Home')}
                </Link>
                <Link
                  to="/matches"
                  className={`nav-link-item ${currentPath === '/matches' || currentPath.startsWith('/matches/') ? 'active' : ''}`}
                >
                  {t('nav.matches', 'Matches')}
                </Link>
                <Link
                  to="/search"
                  className={`nav-link-item ${currentPath === '/search' || currentPath.startsWith('/discover') ? 'active' : ''}`}
                >
                  {t('nav.search', 'Search')}
                </Link>
                <Link
                  to="/interests"
                  className={`nav-link-item ${currentPath === '/interests' || currentPath.startsWith('/interests/') ? 'active' : ''}`}
                >
                  {t('nav.interests', 'Interests')}
                </Link>
                <Link
                  to="/messages"
                  className={`nav-link-item ${currentPath === '/messages' || currentPath.startsWith('/messages/') ? 'active' : ''}`}
                >
                  {t('nav.messages', 'Messages')}
                </Link>
              </nav>
            ) : (
              <nav className="nav-menu-desktop" aria-label="Public Navigation">
                <NavLink to="/" end className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  {t('nav.home', 'Home')}
                </NavLink>
                <NavLink to="/how-it-works" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  {t('nav.howItWorks', 'How It Works')}
                </NavLink>
                <NavLink to="/success-stories" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  {t('nav.successStories', 'Success Stories')}
                </NavLink>
                <NavLink to="/membership" className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}>
                  {t('nav.membership', 'Membership')}
                </NavLink>
              </nav>
            )}

            {/* 3. RIGHT: Controls (Notifications, Language, User Dropdown) */}
            <div className="nav-actions">
              {isAuthenticated ? (
                <>
                  {/* Notifications Icon Button + Dropdown */}
                  <div className="user-menu-wrapper" ref={notifDropdownRef}>
                    <button
                      type="button"
                      className="nav-icon-btn tb-notif-btn"
                      onClick={() => setNotifDropdownOpen((prev) => !prev)}
                      title={t('nav.notifications', 'Notifications')}
                      aria-label="Notifications"
                    >
                      <Bell size={20} className="tb-bell-icon" />
                      {displayBadgeCount > 0 && (
                        <span className="nav-badge-pill">{displayBadgeCount}</span>
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="dropdown-menu notif-dropdown animate-fade-in">
                        <div className="notif-header">
                          <span className="notif-header-title">{t('nav.notifications', 'Notifications')}</span>
                          {unreadNotifCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              className="notif-mark-read-btn"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <ul className="notif-list">
                          {notifications && notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notif) => (
                              <li
                                key={notif.id}
                                className={`notif-item ${!notif.read ? 'unread' : ''}`}
                                onClick={() => {
                                  markNotificationRead(notif.id);
                                  if (notif.link) {
                                    navigate(notif.link);
                                    setNotifDropdownOpen(false);
                                  }
                                }}
                              >
                                {notif.avatar ? (
                                  <img src={notif.avatar} alt="Avatar" className="notif-avatar" />
                                ) : (
                                  <div className="notif-avatar notif-avatar-placeholder">
                                    <Bell size={15} />
                                  </div>
                                )}
                                <div className="notif-content">
                                  <div className="notif-title">{notif.title}</div>
                                  <div className="notif-desc">{notif.message}</div>
                                  <div className="notif-time">{notif.time}</div>
                                </div>
                              </li>
                            ))
                          ) : (
                            <li className="notif-empty-state">
                              No new notifications
                            </li>
                          )}
                        </ul>
                        <div className="notif-footer">
                          <Link
                            to="/notifications"
                            onClick={() => setNotifDropdownOpen(false)}
                            className="notif-view-all-link"
                          >
                            View All Activity →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown Trigger */}
                  <div className="user-menu-wrapper" ref={userDropdownRef}>
                    <button
                      type="button"
                      className="tb-nav-user-profile-btn"
                      onClick={() => setUserDropdownOpen((prev) => !prev)}
                      aria-haspopup="true"
                      aria-expanded={userDropdownOpen}
                      aria-label="Open user profile menu"
                    >
                      {/* Avatar Image (if user uploaded) or Clean Circular 1st Alphabet Avatar */}
                      {hasCustomPhoto && !avatarError ? (
                        <img
                          src={userPhoto}
                          alt={displayName}
                          className="tb-nav-avatar-img"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="tb-nav-avatar-initials" aria-label={`Avatar for ${displayName}`}>
                          {getInitial(displayName)}
                        </div>
                      )}

                      {/* Name & Tier Metadata */}
                      <div className="tb-nav-user-meta">
                        <span className="tb-nav-user-name">{displayName}</span>
                        <span className="tb-nav-user-tier">{displayTier}</span>
                      </div>

                      <ChevronDown
                        size={15}
                        className={`tb-nav-chevron ${userDropdownOpen ? 'rotated' : ''}`}
                      />
                    </button>

                    {/* Authenticated Profile Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="dropdown-menu tb-profile-dropdown animate-fade-in">
                        <div className="dropdown-header">
                          <div className="dropdown-user-name">{displayName}</div>
                          <div className="dropdown-user-id">
                            ID: {user?.id || 'TB-MEMBER'} • <span className="badge badge-gold">{user?.membershipTier || 'Premium'}</span>
                          </div>
                        </div>

                        <Link
                          to={`/profile/${user?.id || 'me'}`}
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User size={16} />
                          <span>{t('nav.myProfile', 'My Profile')}</span>
                        </Link>

                        <Link
                          to="/profile/edit"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <CheckCircle2 size={16} />
                          <span>{t('nav.editProfile', 'Edit Profile')}</span>
                        </Link>

                        <Link
                          to="/membership"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Crown size={16} className="text-gold" />
                          <span>{t('nav.membership', 'Membership')}</span>
                        </Link>

                        <Link
                          to="/settings"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          <span>{t('nav.privacySettings', 'Privacy and Settings')}</span>
                        </Link>

                        <Link
                          to="/safety"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <ShieldCheck size={16} />
                          <span>{t('nav.safetyGuidelines', 'Safety and Guidelines')}</span>
                        </Link>

                        <Link
                          to="/contact"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <HelpCircle size={16} />
                          <span>{t('nav.helpSupport', 'Help and Support')}</span>
                        </Link>

                        <div className="dropdown-divider" />

                        <button
                          type="button"
                          className="dropdown-item tb-logout-item"
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          <span>{t('nav.logOut', 'Logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Hamburger Toggle */}
                  <button
                    type="button"
                    className="tb-mobile-menu-btn d-lg-none"
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    aria-label="Toggle Mobile Menu"
                    aria-expanded={mobileMenuOpen}
                  >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                </>
              ) : (
                <div className="nav-desktop-auth-btns">
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    {t('nav.login', 'Log In')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    {t('nav.createProfile', 'Create Profile')}
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="tb-mobile-drawer-backdrop animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="tb-mobile-drawer animate-slide-right" onClick={(e) => e.stopPropagation()}>
            <div className="tb-drawer-header">
              <div className="tb-drawer-user-info">
                {isAuthenticated ? (
                  <>
                    <div className="tb-nav-avatar-initials" style={{ width: '42px', height: '42px', fontSize: '1.15rem' }}>
                      {getInitial(displayName)}
                    </div>
                    <div>
                      <div className="tb-drawer-user-name">{displayName}</div>
                      <div className="tb-drawer-user-tier">{displayTier}</div>
                    </div>
                  </>
                ) : (
                  <img
                    src="/assets/branding/TeluguBandham_Logo_Primary.png"
                    alt="TeluguBandham"
                    style={{ height: '36px' }}
                  />
                )}
              </div>
              <button
                type="button"
                className="tb-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="tb-drawer-nav-list" aria-label="Mobile Drawer Navigation">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`tb-drawer-nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home size={18} />
                    <span>{t('nav.home', 'Home')}</span>
                  </Link>

                  <Link
                    to="/matches"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/matches') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users size={18} />
                    <span>{t('nav.matches', 'Matches')}</span>
                  </Link>

                  <Link
                    to="/search"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/search') || currentPath.startsWith('/discover') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search size={18} />
                    <span>{t('nav.search', 'Search')}</span>
                  </Link>

                  <Link
                    to="/interests"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/interests') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart size={18} />
                    <span>{t('nav.interests', 'Interests')}</span>
                  </Link>

                  <Link
                    to="/messages"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/messages') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle size={18} />
                    <span>{t('nav.messages', 'Messages')}</span>
                    {totalUnreadMessages > 0 && (
                      <span className="tb-bottom-badge" style={{ position: 'static', marginLeft: 'auto' }}>
                        {totalUnreadMessages}
                      </span>
                    )}
                  </Link>

                  <div className="tb-drawer-divider" />

                  <Link
                    to="/profile/edit"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/profile') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>{t('nav.myProfile', 'Profile')}</span>
                  </Link>

                  <Link
                    to="/membership"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/membership') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Crown size={18} className="text-gold" />
                    <span>{t('nav.membership', 'Membership')}</span>
                  </Link>

                  <Link
                    to="/settings"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/settings') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span>{t('nav.privacySettings', 'Settings')}</span>
                  </Link>

                  <Link
                    to="/help"
                    className={`tb-drawer-nav-item ${currentPath.startsWith('/help') || currentPath.startsWith('/contact') ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HelpCircle size={18} />
                    <span>{t('nav.helpSupport', 'Help and Support')}</span>
                  </Link>

                  <div className="tb-drawer-divider" />

                  <button
                    type="button"
                    className="tb-drawer-nav-item tb-drawer-logout"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={18} />
                    <span>{t('nav.logOut', 'Logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/" end className="tb-drawer-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    <span>{t('nav.home', 'Home')}</span>
                  </NavLink>
                  <NavLink to="/how-it-works" className="tb-drawer-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    <span>{t('nav.howItWorks', 'How It Works')}</span>
                  </NavLink>
                  <NavLink to="/success-stories" className="tb-drawer-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    <span>{t('nav.successStories', 'Success Stories')}</span>
                  </NavLink>
                  <NavLink to="/membership" className="tb-drawer-nav-item" onClick={() => setMobileMenuOpen(false)}>
                    <span>{t('nav.membership', 'Membership')}</span>
                  </NavLink>
                  <div className="tb-drawer-divider" />
                  <Link to="/login" className="btn btn-secondary btn-sm tb-btn-full" onClick={() => setMobileMenuOpen(false)}>
                    {t('nav.login', 'Log In')}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm tb-btn-full" onClick={() => setMobileMenuOpen(false)} style={{ marginTop: '8px' }}>
                    {t('nav.createProfile', 'Create Profile')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Authenticated Mobile Bottom Navigation Bar */}
      {isAuthenticated && (
        <nav className="tb-mobile-bottom-nav" aria-label="Mobile Navigation">
          <Link
            to="/dashboard"
            className={`tb-bottom-nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span className="tb-bottom-nav-label">{t('nav.home', 'Home')}</span>
          </Link>

          <Link
            to="/matches"
            className={`tb-bottom-nav-item ${currentPath === '/matches' || currentPath.startsWith('/matches/') ? 'active' : ''}`}
          >
            <Users size={20} />
            <span className="tb-bottom-nav-label">{t('nav.matches', 'Matches')}</span>
          </Link>

          <Link
            to="/search"
            className={`tb-bottom-nav-item ${currentPath === '/search' || currentPath.startsWith('/discover') ? 'active' : ''}`}
          >
            <Search size={20} />
            <span className="tb-bottom-nav-label">{t('nav.search', 'Search')}</span>
          </Link>

          <Link
            to="/messages"
            className={`tb-bottom-nav-item ${currentPath === '/messages' || currentPath.startsWith('/messages/') ? 'active' : ''}`}
          >
            <div className="tb-bottom-nav-icon-wrap">
              <MessageCircle size={20} />
              {totalUnreadMessages > 0 && (
                <span className="tb-bottom-badge">{totalUnreadMessages}</span>
              )}
            </div>
            <span className="tb-bottom-nav-label">{t('nav.messages', 'Messages')}</span>
          </Link>

          <Link
            to="/profile/edit"
            className={`tb-bottom-nav-item ${currentPath.startsWith('/profile') ? 'active' : ''}`}
          >
            <User size={20} />
            <span className="tb-bottom-nav-label">{t('nav.myProfile', 'Profile')}</span>
          </Link>
        </nav>
      )}
    </>
  );
}

