import React, { useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { AddAdminModal, ConfirmActionModal } from '../../components/admin/AdminModals';
import {
  UserCog,
  Shield,
  ShieldCheck,
  Plus,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  KeyRound,
  UserCheck
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminManagement() {
  const { showToast } = useApp();

  const [adminTeam, setAdminTeam] = useState(() => mockDb.getAdminTeam());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAdminAdded = (newAdmin) => {
    setAdminTeam(mockDb.getAdminTeam());
  };

  const handleToggleStatus = (admin) => {
    const nextStatus = admin.status === 'Active' ? 'Disabled' : 'Active';
    mockDb.updateAdminMember(admin.id, { status: nextStatus });
    setAdminTeam(mockDb.getAdminTeam());
    showToast(`Admin account for ${admin.name} is now ${nextStatus}.`, "info");
  };

  const handleDeleteAdmin = () => {
    if (!deleteTarget) return;
    mockDb.deleteAdminMember(deleteTarget.id);
    setAdminTeam(mockDb.getAdminTeam());
    showToast(`Admin account ${deleteTarget.name} removed.`, "info");
    setDeleteTarget(null);
  };

  return (
    <AdminLayout
      title="Admin Team and RBAC Permissions"
      description="Super Admin console for staff permissions, departmental clearances, and two-factor authentication"
    >
      {/* Super Admin Notice Banner */}
      <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--admin-gold-tint)', border: '1px solid var(--admin-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={20} style={{ color: 'var(--admin-gold)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--admin-text-primary)' }}>
              Super Administrator Clearance Active
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>
              All administrative operations are recorded in the immutable system audit log with IP tracking.
            </div>
          </div>
        </div>
        <span className="admin-badge gold">RBAC Enforcement On</span>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserCog size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Authorized Administrators ({adminTeam.length})</h3>
              <p className="admin-card-subtitle">Manage role allocations and security access keys</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setIsAddOpen(true)}
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            Add Administrator
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>2FA Security</th>
                <th>Last Active</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminTeam.map((adm) => (
                <tr key={adm.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="admin-avatar">
                        {adm.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{adm.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{adm.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`admin-badge ${adm.role === 'Super Admin' ? 'gold' : adm.role === 'Moderator' ? 'primary' : adm.role === 'Finance Admin' ? 'warning' : 'info'}`}>
                      {adm.role}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)' }}>
                      {adm.department}
                    </div>
                  </td>

                  <td>
                    {adm.twoFactorEnabled ? (
                      <span className="admin-badge success">2FA Enabled 🔒</span>
                    ) : (
                      <span className="admin-badge warning">2FA Pending</span>
                    )}
                  </td>

                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {adm.lastLogin ? new Date(adm.lastLogin).toLocaleString('en-IN') : 'Active'}
                    </div>
                  </td>

                  <td>
                    {adm.status === 'Active' ? (
                      <span className="admin-badge success">Active</span>
                    ) : (
                      <span className="admin-badge danger">Disabled</span>
                    )}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleToggleStatus(adm)}
                      >
                        {adm.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>

                      {adm.role !== 'Super Admin' && (
                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '28px', height: '28px', color: 'var(--admin-danger)' }}
                          onClick={() => setDeleteTarget(adm)}
                          title="Remove admin"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdminAdded={handleAdminAdded}
        showToast={showToast}
      />

      {/* Confirm Delete Modal */}
      <ConfirmActionModal
        isOpen={!!deleteTarget}
        title="Revoke Admin Access"
        message={`Are you sure you want to remove administrator ${deleteTarget?.name} (${deleteTarget?.email})? All administrative permissions will be revoked immediately.`}
        confirmLabel="Revoke Access"
        confirmVariant="danger"
        onConfirm={handleDeleteAdmin}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
