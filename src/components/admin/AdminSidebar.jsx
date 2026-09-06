import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CreditCard,
  Heart,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  BookOpen,
  FileText,
  BarChart3,
  Bell,
  LifeBuoy,
  UserCog,
  Settings,
  History,
  Database,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import '../../styles/admin.css';

// Global memory cache to preserve sidebar scroll position across component re-mounts without visual jumping
let persistentSidebarScrollTop = 0;

export default function AdminSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}) {
  const { adminUser } = useAuth();
  const location = useLocation();

  const navRef = useRef(null);
  const activeItemRef = useRef(null);

  const verifications = mockDb.getVerifications().filter((v) => v.status === 'Pending');
  const reports = mockDb.getReports().filter((r) => r.status === 'Under Review');
  const tickets = mockDb.getSupportTickets().filter((t) => t.status === 'Open');

  // Track user's manual scroll position
  const handleNavScroll = (e) => {
    if (e?.currentTarget) {
      persistentSidebarScrollTop = e.currentTarget.scrollTop;
    }
  };

  // Synchronously restore scroll position BEFORE browser paint so the scrollbar NEVER jumps to the top and comes back
  useLayoutEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;

    // 1. Immediately apply the saved scroll position
    if (persistentSidebarScrollTop > 0) {
      nav.scrollTop = persistentSidebarScrollTop;
    }

    // 2. Ensure active item is within visible bounds of the sidebar without causing an animation bounce
    if (activeItemRef.current) {
      const item = activeItemRef.current;
      const navRect = nav.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // Check if item is clipped above or below visible area
      const isAbove = itemRect.top < navRect.top;
      const isBelow = itemRect.bottom > navRect.bottom;

      if (isAbove) {
        nav.scrollTop -= (navRect.top - itemRect.top + 10);
        persistentSidebarScrollTop = nav.scrollTop;
      } else if (isBelow) {
        nav.scrollTop += (itemRect.bottom - navRect.bottom + 10);
        persistentSidebarScrollTop = nav.scrollTop;
      }
    }
  }, [location.pathname]);

  const mainNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'User Management', path: '/admin/users', icon: Users },
    {
      label: 'Verification Queue',
      path: '/admin/verifications',
      icon: ShieldCheck,
      badge: verifications.length > 0 ? verifications.length : null,
      badgeType: 'warning'
    },
    { label: 'Memberships and Billing', path: '/admin/memberships', icon: CreditCard },
    { label: 'Matches', path: '/admin/matches', icon: Heart },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    {
      label: 'Reports and Safety',
      path: '/admin/reports',
      icon: AlertTriangle,
      badge: reports.length > 0 ? reports.length : null,
      badgeType: 'danger'
    },
    { label: 'Success Stories', path: '/admin/stories', icon: BookOpen },
    { label: 'Content Management', path: '/admin/content', icon: FileText }
  ];

  const isSuperAdmin = adminUser?.role === 'Super Admin' || adminUser?.permissions?.includes('ALL_ACCESS');

  const systemNavItems = [
    { label: 'Analytics and Funnels', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Broadcast Alerts', path: '/admin/notifications', icon: Bell },
    {
      label: 'Support Tickets',
      path: '/admin/support',
      icon: LifeBuoy,
      badge: tickets.length > 0 ? tickets.length : null,
      badgeType: 'info'
    },
    { label: 'Admin Team & RBAC', path: '/admin/admins', icon: UserCog, superAdminOnly: true },
    { label: 'System Settings', path: '/admin/settings', icon: Settings, superAdminOnly: true },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Backup & Security', path: '/admin/backup', icon: Database, superAdminOnly: true }
  ].filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header with Clean Logo Lockup */}
        <div className="admin-sidebar-header">
          {!collapsed && (
            <Link
              to="/admin/dashboard"
              className="admin-sidebar-brand"
              onClick={onCloseMobile}
              title="Admin Portal"
            >
              <span className="admin-portal-brand-text">
                Admin Portal
              </span>
            </Link>
          )}

          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="admin-collapse-toggle d-none d-lg-flex"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="admin-sidebar-close-btn d-lg-none"
              title="Close navigation menu"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Admin Profile Mini Snippet */}
        <div className="admin-sidebar-user-card">
          <div className="admin-avatar">
            {(adminUser?.name || 'AD').slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="admin-sidebar-user-info">
              <div className="admin-sidebar-user-name">
                {adminUser?.name || 'Administrator'}
              </div>
              <div className="admin-sidebar-user-role">
                {adminUser?.role || 'Super Admin'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="admin-nav" ref={navRef} onScroll={handleNavScroll}>
          {/* MAIN SECTION */}
          {!collapsed && (
            <div className="admin-nav-section-title">MAIN MENU</div>
          )}

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                ref={isActive ? activeItemRef : null}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
              >
                <span className="admin-nav-icon">
                  <Icon size={17} />
                </span>
                {!collapsed && <span className="admin-nav-label">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`admin-badge-count ${item.badgeType || ''}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* SYSTEM SECTION */}
          <div className="admin-nav-divider" />

          {!collapsed && (
            <div className="admin-nav-section-title">SYSTEM & SECURITY</div>
          )}

          {systemNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                ref={isActive ? activeItemRef : null}
                to={item.path}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
              >
                <span className="admin-nav-icon">
                  <Icon size={17} />
                </span>
                {!collapsed && <span className="admin-nav-label">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="admin-badge-count danger">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="admin-nav-divider" />

          {/* Public Site Link */}
          <Link
            to="/"
            className="admin-nav-item"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? "Open Public Portal" : undefined}
          >
            <span className="admin-nav-icon">
              <ExternalLink size={16} style={{ color: 'var(--admin-gold)' }} />
            </span>
            {!collapsed && (
              <span className="admin-nav-label" style={{ color: 'var(--admin-text-primary)' }}>
                View Public Site
              </span>
            )}
          </Link>
        </nav>
      </aside>
    </>
  );
}
