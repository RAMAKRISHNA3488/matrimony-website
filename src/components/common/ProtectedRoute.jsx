import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import AdminLayout from '../admin/AdminLayout';

/**
 * Guards user routes (requires authenticated user).
 */
export function UserProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Loading TeluguBandham...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AdminAccessDenied({ requiredRole }) {
  const { adminUser } = useAuth();
  return (
    <AdminLayout
      title="Access Denied (403)"
      description="Administrative Role-Based Access Control (RBAC) Enforcement"
    >
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem', borderRadius: '16px', backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-sm)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--admin-danger-bg)', color: 'var(--admin-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text-primary)', margin: '0 0 0.5rem' }}>
          Security Clearance Required
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
          This administrative section is strictly restricted to <strong>{requiredRole || 'Super Administrator'}</strong> clearance.
          Your current account role is <span className="admin-badge primary" style={{ marginLeft: '4px' }}>{adminUser?.role || 'Staff Member'}</span>.
        </p>
        <div style={{ display: 'inline-flex', gap: '0.75rem' }}>
          <Link to="/admin/dashboard" className="btn btn-primary btn-md">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

/**
 * Guards admin routes (requires admin authentication and optional role/permission checks).
 * If normal user or unauthenticated visits /admin/*, redirects them safely to /admin/login.
 * If logged-in admin lacks requiredRole / requiredPermission, renders a 403 Access Denied view.
 */
export function AdminProtectedRoute({ children, requiredRole, requiredPermission }) {
  const { isAdmin, adminUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--primary-700)', fontWeight: 600 }}>Verifying Admin Security Clearance...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check role & permissions if specified
  const isSuperAdmin = adminUser?.role === 'Super Admin' || adminUser?.permissions?.includes('ALL_ACCESS');
  if (requiredRole && !isSuperAdmin && adminUser?.role !== requiredRole) {
    return <AdminAccessDenied requiredRole={requiredRole} />;
  }

  if (requiredPermission && !isSuperAdmin && !adminUser?.permissions?.includes(requiredPermission)) {
    return <AdminAccessDenied requiredRole={`Permission: ${requiredPermission}`} />;
  }

  return children;
}

