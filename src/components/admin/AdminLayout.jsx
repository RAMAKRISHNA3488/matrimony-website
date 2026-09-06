import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';

// Module-level persistent state so navigating between routes within the SPA never resets the sidebar
let globalSidebarCollapsed = null;

function getInitialSidebarCollapsed() {
  if (globalSidebarCollapsed !== null) {
    return globalSidebarCollapsed;
  }
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('tb_admin_sidebar_collapsed');
      if (saved !== null) {
        globalSidebarCollapsed = saved === 'true';
        return globalSidebarCollapsed;
      }
    } catch {}
  }
  globalSidebarCollapsed = false;
  return false;
}

export default function AdminLayout({
  children,
  title = "Overview",
  description = "TeluguBandham Administrative Management System",
  onDateChange
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getInitialSidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('tb_admin_theme') || 'light';
    document.documentElement.setAttribute('data-admin-theme', savedTheme);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Prevent background scrolling and interaction when mobile drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileSidebarOpen]);

  // Keep state synchronized with global cache across route changes
  useEffect(() => {
    if (globalSidebarCollapsed !== null && globalSidebarCollapsed !== sidebarCollapsed) {
      setSidebarCollapsed(globalSidebarCollapsed);
    }
  }, [location.pathname, sidebarCollapsed]);

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      globalSidebarCollapsed = next;
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('tb_admin_sidebar_collapsed', String(next));
        } catch {}
      }
      return next;
    });
  }, []);

  return (
    <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="admin-main">
        <AdminNavbar
          title={title}
          description={description}
          onOpenMobile={() => setMobileSidebarOpen(true)}
          onDateChange={onDateChange}
        />

        <main className="admin-content-body">
          {children}
        </main>
      </div>
    </div>
  );
}
