import React, { useState, useMemo, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { RevenueBarChart } from '../../components/admin/AdminCharts';
import { AddPlanModal, ConfirmActionModal } from '../../components/admin/AdminModals';
import {
  CreditCard,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Crown,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight,
  Plus,
  Star,
  Trash2,
  Users
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminMemberships() {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('transactions'); // transactions | plans | subscribers | refunds
  const [transactions, setTransactions] = useState(() => mockDb.getTransactions());
  const [plans, setPlans] = useState(() => mockDb.getPlans());
  const [profiles] = useState(() => mockDb.getProfiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = mockDb.subscribe(() => {
      setPlans(mockDb.getPlans());
      setTransactions(mockDb.getTransactions());
    });
    return () => unsubscribe();
  }, []);

  // Modals State
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [deletePlanTarget, setDeletePlanTarget] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // Plan Edit Modal State
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    period: '',
    tagline: '',
    popular: false,
    featuresText: ''
  });

  const handleTogglePopular = (planId, planName) => {
    mockDb.togglePlanPopular(planId);
    setPlans(mockDb.getPlans());
    showToast(`Updated "Most Popular" badge for ${planName}! ⭐`, "info");
  };

  const handleDeletePlanConfirm = () => {
    if (!deletePlanTarget) return;
    if (deletePlanTarget.id === 'plan_free' || deletePlanTarget.id === 'plan_gold') {
      showToast("Baseline platform tier cannot be deleted.", "warning");
      setDeletePlanTarget(null);
      return;
    }
    mockDb.deletePlan(deletePlanTarget.id);
    setPlans(mockDb.getPlans());
    showToast(`Plan tier "${deletePlanTarget.name}" removed successfully.`, "info");
    setDeletePlanTarget(null);
  };

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name || '',
      price: plan.price ?? 0,
      period: plan.period || '3 Months',
      tagline: plan.tagline || '',
      popular: Boolean(plan.popular),
      featuresText: Array.isArray(plan.features) ? plan.features.join('\n') : ''
    });
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    const parsedFeatures = planForm.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const updated = mockDb.updatePlan(editingPlan.id, {
      name: planForm.name.trim(),
      price: Number(planForm.price) || 0,
      period: planForm.period.trim(),
      tagline: planForm.tagline.trim(),
      popular: planForm.popular,
      features: parsedFeatures
    });

    if (updated) {
      setPlans(mockDb.getPlans());
      showToast(`${planForm.name} parameters updated successfully! ✨`, "success");
    }
    setEditingPlan(null);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterStatus !== 'all' && t.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (t.userName || '').toLowerCase().includes(q);
        const matchId = (t.id || '').toLowerCase().includes(q);
        const matchRef = (t.referenceId || '').toLowerCase().includes(q);
        const matchPlan = (t.planName || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchRef && !matchPlan) return false;
      }
      return true;
    });
  }, [transactions, filterStatus, searchQuery]);

  const handleProcessRefund = (e) => {
    e.preventDefault();
    if (!refundTarget) return;

    mockDb.processRefund(refundTarget.id, refundReason);
    setTransactions(mockDb.getTransactions());
    showToast(`Refund processed for ${refundTarget.id} (₹${refundTarget.amount})! 💸`, "success");
    setRefundTarget(null);
  };

  const handleExportCSV = () => {
    const res = mockDb.exportDataToCSV('transactions');
    showToast(`Exported ${res.filename}! 📥`, "success");
  };

  // Subscribers list
  const paidSubscribers = profiles.filter((p) => p.isPremium || p.membershipTier !== 'Free');

  return (
    <AdminLayout
      title="Memberships and Payments"
      description="Manage membership tiers, billing ledgers, Razorpay/UPI gateway transactions, and refunds"
    >
      {/* 4 Top KPI Cards */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <TrendingUp size={20} />
            </div>
            <span className="admin-badge success">+14.6% MoM</span>
          </div>
          <div>
            <div className="admin-kpi-number">₹48,75,230</div>
            <div className="admin-kpi-label">Monthly Gross Revenue</div>
            <div className="admin-kpi-subtext">₹41.5L previous month</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)' }}>
              <Crown size={20} />
            </div>
            <span className="admin-badge gold">18.4K Paid</span>
          </div>
          <div>
            <div className="admin-kpi-number">18,420</div>
            <div className="admin-kpi-label">Active Paid Subscribers</div>
            <div className="admin-kpi-subtext">Across Gold, Diamond & VIP</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-success-bg)', color: 'var(--admin-success)' }}>
              <CheckCircle2 size={20} />
            </div>
            <span className="admin-badge success">99.2% Rate</span>
          </div>
          <div>
            <div className="admin-kpi-number">99.2%</div>
            <div className="admin-kpi-label">Payment Success Ratio</div>
            <div className="admin-kpi-subtext">Razorpay & UPI Smart Routing</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <RotateCcw size={20} />
            </div>
            <span className="admin-badge info">0.4% Low</span>
          </div>
          <div>
            <div className="admin-kpi-number">₹17,495</div>
            <div className="admin-kpi-label">Refunds Dispatched</div>
            <div className="admin-kpi-subtext">5 total transactions</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <CreditCard size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Billing and Subscription Platform</h3>
              <p className="admin-card-subtitle">Real-time payment logs, tier management, and refund processing</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="admin-tab-bar">
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribers')}
              >
                Active Subscribers
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
                onClick={() => setActiveTab('plans')}
              >
                Plan Tiers
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

        {/* ================= TAB 1: TRANSACTIONS ================= */}
        {activeTab === 'transactions' && (
          <>
            <div className="admin-toolbar">
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '100%', paddingLeft: '2rem' }}
                  placeholder="Search user, txn ID, plan or gateway..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="admin-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Payment Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '18%' }}>Transaction ID</th>
                    <th style={{ width: '18%' }}>Customer Name</th>
                    <th style={{ width: '15%' }}>Membership Plan</th>
                    <th style={{ width: '12%' }}>Amount Paid</th>
                    <th style={{ width: '14%' }}>Payment Method</th>
                    <th style={{ width: '11%' }}>Date & Time</th>
                    <th style={{ width: '6%' }}>Status</th>
                    <th style={{ width: '6%', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{t.id}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>
                            Ref: {t.referenceId}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>{t.userName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{t.userEmail}</div>
                      </td>

                      <td>
                        <span className="admin-badge gold" style={{ fontWeight: 700 }}>
                          {t.planName}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--admin-text-primary)' }}>₹{t.amount.toLocaleString('en-IN')}</div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
                          <span>{t.method}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)' }}>({t.gateway})</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{t.date}</span>
                      </td>

                      <td>
                        {t.status === 'Success' && <span className="admin-badge success">Success</span>}
                        {t.status === 'Failed' && <span className="admin-badge danger">Failed</span>}
                        {t.status === 'Refunded' && <span className="admin-badge warning">Refunded</span>}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {t.status === 'Success' && (
                          <button
                            type="button"
                            className="admin-action-btn delete"
                            title="Process Refund"
                            onClick={() => {
                              setRefundTarget(t);
                              setRefundReason('Customer Satisfaction');
                            }}
                          >
                            <RotateCcw size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--admin-text-muted)' }}>
                        <CreditCard size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>No transactions found</div>
                        <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>No payment records match your search query or filter selection.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= TAB 2: ACTIVE SUBSCRIBERS ================= */}
        {activeTab === 'subscribers' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Subscriber</th>
                  <th>Location</th>
                  <th>Current Plan</th>
                  <th>Status</th>
                  <th>Auto-Renew</th>
                  <th>Next Billing Date</th>
                </tr>
              </thead>
              <tbody>
                {paidSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--admin-text-muted)' }}>
                      <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4, display: 'block' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No active paid subscribers found</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Currently no active members match the subscription criteria.</div>
                    </td>
                  </tr>
                ) : (
                  paidSubscribers.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <img
                            src={(p.photos && p.photos[0]) || '/assets/branding/Default_Male_Avatar.svg'}
                            alt={p.name}
                            className="admin-table-avatar"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/assets/branding/Default_Male_Avatar.svg';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 800 }}>{p.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.city}</td>
                      <td>
                        <span className="admin-badge gold">{p.membershipTier}</span>
                      </td>
                      <td>
                        <span className="admin-badge success">Active Subscription</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--admin-success)', fontSize: '0.8125rem' }}>Enabled (UPI Autopay)</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>May 24, 2026</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: PLAN TIERS CONFIG ================= */}
        {activeTab === 'plans' && (
          <div className="admin-card-body" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Platform Subscription Tiers ({plans.length})</h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Changes update the public website & upgrade modal instantly in real-time</p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={() => setIsAddPlanOpen(true)}
                style={{ gap: '0.4rem' }}
              >
                <Plus size={15} />
                Create New Plan Tier
              </button>
            </div>

            <div className="admin-plans-grid">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`admin-plan-card ${p.popular ? 'popular' : ''}`}
                >
                  {/* Plan Header */}
                  <div className="admin-plan-header">
                    <div className="admin-plan-title-row">
                      <h4 className="admin-plan-title">{p.name}</h4>
                      {p.popular && (
                        <span className="admin-badge gold" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                          Most Popular ⭐
                        </span>
                      )}
                    </div>
                    <p className="admin-plan-tagline" title={p.tagline}>
                      {p.tagline}
                    </p>
                  </div>

                  {/* Price Section */}
                  <div className="admin-plan-price-wrap">
                    <span className="admin-plan-price">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="admin-plan-period">/ {p.period}</span>
                  </div>

                  {/* Features Bullet List */}
                  <div className="admin-plan-features">
                    {p.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="admin-plan-feature-item">
                        <CheckCircle2 size={15} className="admin-plan-feature-icon" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action Button */}
                  <div className="admin-plan-footer" style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="admin-plan-action-btn"
                      style={{ flex: 1 }}
                      onClick={() => handleOpenEditPlan(p)}
                    >
                      Edit Tier
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      style={{
                        width: '34px',
                        height: '34px',
                        color: p.popular ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                        backgroundColor: p.popular ? 'var(--admin-gold-tint)' : 'var(--admin-surface-subtle)',
                        border: '1px solid var(--admin-border-subtle)'
                      }}
                      onClick={() => handleTogglePopular(p.id, p.name)}
                      title={p.popular ? "Remove Most Popular flag" : "Set as Most Popular tier ⭐"}
                    >
                      <Star size={15} fill={p.popular ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      disabled={p.id === 'plan_free' || p.id === 'plan_gold'}
                      style={{
                        width: '34px',
                        height: '34px',
                        color: (p.id === 'plan_free' || p.id === 'plan_gold') ? 'var(--admin-text-muted)' : 'var(--admin-danger)',
                        border: '1px solid var(--admin-border-subtle)',
                        opacity: (p.id === 'plan_free' || p.id === 'plan_gold') ? 0.35 : 1,
                        cursor: (p.id === 'plan_free' || p.id === 'plan_gold') ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => {
                        if (p.id !== 'plan_free' && p.id !== 'plan_gold') {
                          setDeletePlanTarget(p);
                        }
                      }}
                      title={(p.id === 'plan_free' || p.id === 'plan_gold') ? "Baseline platform tier (cannot be deleted)" : `Delete ${p.name} Tier`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Plan Tier Modal */}
      {editingPlan && (
        <div className="admin-modal-overlay" onClick={() => setEditingPlan(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Crown size={18} style={{ color: 'var(--admin-gold)' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Edit {editingPlan.name} Parameters
                </h3>
              </div>
            </div>

            <form onSubmit={handleSavePlan}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-modal-grid-2col" style={{ gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Plan Name
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ width: '100%' }}
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      className="admin-input"
                      style={{ width: '100%' }}
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-modal-grid-2col" style={{ gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Billing Period
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      style={{ width: '100%' }}
                      placeholder="e.g. 3 Months, Forever"
                      value={planForm.period}
                      onChange={(e) => setPlanForm({ ...planForm, period: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', paddingTop: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={planForm.popular}
                        onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                        style={{ flexShrink: 0, cursor: 'pointer' }}
                      />
                      <span>Mark as Most Popular</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    style={{ width: '100%' }}
                    value={planForm.tagline}
                    onChange={(e) => setPlanForm({ ...planForm, tagline: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Included Features (1 per line)
                  </label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                    value={planForm.featuresText}
                    onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })}
                    placeholder="Enter each feature on a separate line..."
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-md"
                  onClick={() => setEditingPlan(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  Save Tier Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Process Refund Modal */}
      {refundTarget && (
        <div className="admin-modal-overlay" onClick={() => setRefundTarget(null)}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={18} style={{ color: 'var(--admin-warning)' }} />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Process Payment Refund</h3>
              </div>
            </div>

            <form onSubmit={handleProcessRefund}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--admin-surface-subtle)', border: '1px solid var(--admin-border-subtle)', fontSize: '0.8125rem' }}>
                  <div>Transaction: <strong>{refundTarget.id}</strong></div>
                  <div>Customer: <strong>{refundTarget.userName}</strong></div>
                  <div>Refund Amount: <strong style={{ color: 'var(--admin-primary)' }}>₹{refundTarget.amount}</strong></div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Refund Rationale</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  >
                    <option value="Customer Satisfaction">Customer Satisfaction Request</option>
                    <option value="Accidental Duplicate Billing">Accidental Duplicate Billing</option>
                    <option value="Horoscope Match Dispute">Horoscope Match Dispute / Match Cancelled</option>
                    <option value="Technical Gateway Error">Technical Payment Gateway Error</option>
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary btn-md" onClick={() => setRefundTarget(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-md">
                  Confirm and Dispatch Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create New Plan Modal */}
      <AddPlanModal
        isOpen={isAddPlanOpen}
        onClose={() => setIsAddPlanOpen(false)}
        showToast={showToast}
      />

      {/* Delete Plan Tier Confirmation Modal */}
      <ConfirmActionModal
        isOpen={!!deletePlanTarget}
        title={`Delete "${deletePlanTarget?.name}" Tier?`}
        message={`Are you sure you want to permanently delete the "${deletePlanTarget?.name}" plan tier? Existing users on this plan may be affected.`}
        confirmText="Yes, Delete Tier"
        confirmVariant="danger"
        onConfirm={handleDeletePlanConfirm}
        onClose={() => setDeletePlanTarget(null)}
      />
    </AdminLayout>
  );
}
