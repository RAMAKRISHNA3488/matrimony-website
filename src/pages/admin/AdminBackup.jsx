import React, { useState } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { SystemBackupModal } from '../../components/admin/AdminModals';
import {
  Database,
  Shield,
  Download,
  Lock,
  Server,
  CheckCircle2,
  HardDrive,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminBackup() {
  const { showToast } = useApp();

  const [backups, setBackups] = useState(() => mockDb.getBackupRecords());
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleDownloadBackup = (b) => {
    const sqlContent = `-- TeluguBandham Production Database Dump\n-- Generated on: ${b.createdAt}\n-- Snapshot: ${b.filename}\n-- Cluster: AWS RDS PostgreSQL\n-- Verification: SHA-256 Validated\n\nBEGIN;\n-- Dump payload verified\nCOMMIT;\n`;
    const element = document.createElement("a");
    const file = new Blob([sqlContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = b.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloading ${b.filename}... 📥`, "info");
  };

  return (
    <AdminLayout
      title="Backup and System Security"
      description="Manage automated database snapshots, disaster recovery restore points, and multi-region AWS S3 archival"
    >
      {/* 3 Top Security & Backup KPI Cards */}
      <div className="admin-kpi-3-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Database size={20} />
            </div>
            <span className="admin-badge success">Healthy</span>
          </div>
          <div>
            <div className="admin-kpi-number">482 MB</div>
            <div className="admin-kpi-label">Latest Snapshot Size</div>
            <div className="admin-kpi-subtext">PostgreSQL + Media DB</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <Lock size={20} />
            </div>
            <span className="admin-badge success">256-Bit</span>
          </div>
          <div>
            <div className="admin-kpi-number">AES-256</div>
            <div className="admin-kpi-label">At-Rest Encryption</div>
            <div className="admin-kpi-subtext">AWS KMS Managed Keys</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)' }}>
              <Clock size={20} />
            </div>
            <span className="admin-badge gold">Nightly</span>
          </div>
          <div>
            <div className="admin-kpi-number">04:00 AM</div>
            <div className="admin-kpi-label">Automated Schedule</div>
            <div className="admin-kpi-subtext">Daily snapshot interval</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <HardDrive size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Database Snapshot Archives ({backups.length})</h3>
              <p className="admin-card-subtitle">Encrypted snapshots stored in AWS S3 Multi-Region Glacier</p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={() => setIsBackupModalOpen(true)}
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            Create Immediate Backup
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Snapshot Filename</th>
                <th>Backup Type</th>
                <th>Archive Size</th>
                <th>Storage Location</th>
                <th>Created Timestamp</th>
                <th>Integrity Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.84rem' }}>
                      {b.filename}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                      ID: {b.id}
                    </div>
                  </td>

                  <td>
                    <span className="admin-badge primary">{b.type}</span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{b.size}</div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)' }}>
                      {b.location}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(b.createdAt).toLocaleString('en-IN')}
                    </div>
                  </td>

                  <td>
                    <span className="admin-badge success">
                      <CheckCircle2 size={11} /> {b.status}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownloadBackup(b)}
                      style={{ gap: '0.35rem', fontSize: '0.75rem' }}
                    >
                      <Download size={13} />
                      Download SQL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immediate Backup Modal */}
      <SystemBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => {
          setIsBackupModalOpen(false);
          setBackups(mockDb.getBackupRecords());
        }}
        showToast={showToast}
      />
    </AdminLayout>
  );
}
