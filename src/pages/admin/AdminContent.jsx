import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import AdminLayout from '../../components/admin/AdminLayout';
import { ConfirmActionModal } from '../../components/admin/AdminModals';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Save,
  X,
  Eye,
  ArrowRight
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminContent() {
  const { showToast } = useApp();

  const [activeSection, setActiveSection] = useState('faqs'); // faqs | banners | safety

  // Datasets lazily initialized from mockDb
  const [faqs, setFaqs] = useState(() => mockDb.getFAQs() || []);
  const [heroBanner, setHeroBanner] = useState(() => mockDb.getHeroBanner() || {
    title: '',
    subtitle: '',
    badgeText: '',
    ctaText: '',
    ctaLink: '',
    isActive: false
  });
  const [safetyRules, setSafetyRules] = useState(() => mockDb.getSafetyRules() || []);

  // Modal / Form state for FAQs
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'Trust & Verification'
  });

  // Modal for Safety Rules
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    title: '',
    description: '',
    severity: 'High',
    category: 'Financial Safety'
  });
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Filter for FAQs
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('All');

  const loadAllContent = () => {
    setFaqs(mockDb.getFAQs() || []);
    setHeroBanner(mockDb.getHeroBanner() || {});
    setSafetyRules(mockDb.getSafetyRules() || []);
  };

  useEffect(() => {
    const handleContentUpdated = () => {
      loadAllContent();
    };

    window.addEventListener('telugubandham_content_updated', handleContentUpdated);
    return () => {
      window.removeEventListener('telugubandham_content_updated', handleContentUpdated);
    };
  }, []);

  // FAQ Handlers
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqForm({
      question: '',
      answer: '',
      category: 'Trust & Verification'
    });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category
    });
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!faqForm.question.trim()) {
      showToast('Please enter the question text.', 'warning');
      return;
    }
    if (!faqForm.answer.trim()) {
      showToast('Please enter the answer explanation.', 'warning');
      return;
    }

    if (editingFaq) {
      mockDb.updateFAQ(editingFaq.id, faqForm);
      showToast('FAQ updated successfully! Re-synced in real time.', 'success');
    } else {
      mockDb.addFAQ(faqForm);
      showToast('New FAQ published! Now live across TeluguBandham public pages.', 'success');
    }

    setIsFaqModalOpen(false);
    loadAllContent();
  };

  const handleDeleteFaq = (f) => {
    setDeleteConfirmTarget({
      type: 'faq',
      id: f.id,
      title: 'FAQ Question',
      message: `Are you sure you want to remove the FAQ "${f.question}"? It will be removed from the public website immediately.`
    });
  };

  // Banner Handlers
  const handleSaveBanner = (e) => {
    e.preventDefault();
    if (!heroBanner.title.trim()) {
      showToast('Please enter a banner title.', 'warning');
      return;
    }
    mockDb.updateHeroBanner(heroBanner);
    showToast(
      heroBanner.isActive
        ? 'Hero Announcement Banner activated and live across the platform! 📢'
        : 'Hero Announcement Banner turned off and hidden from website.',
      'success'
    );
    loadAllContent();
  };

  // Safety Rules Handlers
  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleForm({
      title: '',
      description: '',
      severity: 'High',
      category: 'General Safety'
    });
    setIsRuleModalOpen(true);
  };

  const handleOpenEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      title: rule.title,
      description: rule.description,
      severity: rule.severity,
      category: rule.category
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!ruleForm.title.trim()) {
      showToast('Please enter a rule title.', 'warning');
      return;
    }
    if (!ruleForm.description.trim()) {
      showToast('Please enter rule guidelines.', 'warning');
      return;
    }

    if (editingRule) {
      const updated = safetyRules.map((r) => (r.id === editingRule.id ? { ...r, ...ruleForm } : r));
      mockDb.updateSafetyRules(updated);
      showToast('Safety guideline updated and synchronized live!', 'success');
    } else {
      mockDb.addSafetyRule(ruleForm);
      showToast('New safety guideline added and synchronized!', 'success');
    }

    setIsRuleModalOpen(false);
    loadAllContent();
  };

  const handleDeleteRule = (rule) => {
    setDeleteConfirmTarget({
      type: 'rule',
      id: rule.id,
      title: 'Safety Guideline',
      message: `Are you sure you want to remove the safety guideline "${rule.title}"?`
    });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'faq') {
      mockDb.deleteFAQ(deleteConfirmTarget.id);
      showToast('FAQ removed from knowledgebase.', 'info');
      loadAllContent();
    } else if (deleteConfirmTarget.type === 'rule') {
      mockDb.deleteSafetyRule(deleteConfirmTarget.id);
      showToast('Safety guideline removed.', 'info');
      loadAllContent();
    }
    setDeleteConfirmTarget(null);
  };

  const filteredFaqs = faqCategoryFilter === 'All'
    ? faqs
    : faqs.filter((f) => f.category.toLowerCase().includes(faqCategoryFilter.toLowerCase()));

  const categories = ['All', 'Trust & Verification', 'Matchmaking', 'Horoscope', 'Privacy & Security', 'Memberships', 'General'];

  return (
    <AdminLayout
      title="Content Management"
      description="Manage public FAQ knowledgebase, live announcement banners, and safety guidance rules in real time"
    >
      <div className="admin-page-container">
        <div className="admin-card">
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Platform Content and Localizations</h3>
              <p className="admin-card-subtitle">Public web copy, guidance rules, and FAQs updated in real-time</p>
            </div>
          </div>

          <div className="admin-tab-bar">
            <button
              type="button"
              className={`admin-tab-btn ${activeSection === 'faqs' ? 'active' : ''}`}
              onClick={() => setActiveSection('faqs')}
            >
              FAQs Knowledgebase ({faqs.length})
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeSection === 'banners' ? 'active' : ''}`}
              onClick={() => setActiveSection('banners')}
            >
              Hero Banners {heroBanner.isActive ? '🟢 Live' : '(Off)'}
            </button>
            <button
              type="button"
              className={`admin-tab-btn ${activeSection === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveSection('safety')}
            >
              Safety Rules ({safetyRules.length})
            </button>
          </div>
        </div>

        {/* ================= SECTION 1: FAQS ================= */}
        {activeSection === 'faqs' && (
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            {/* Header and Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
              {/* Category Filter Chips */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategoryFilter(cat)}
                    className="admin-badge"
                    style={{
                      cursor: 'pointer',
                      border: faqCategoryFilter === cat ? '1px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                      backgroundColor: faqCategoryFilter === cat ? 'var(--admin-primary-tint)' : 'var(--admin-surface)',
                      color: faqCategoryFilter === cat ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
                      fontWeight: faqCategoryFilter === cat ? 800 : 600,
                      padding: '0.35rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddFaq}
                style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={15} /> Add Question
              </button>
            </div>

            {/* Grid of Published Questions */}
            {filteredFaqs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--admin-text-muted)', backgroundColor: 'var(--admin-surface-subtle)', borderRadius: '12px' }}>
                <HelpCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <div style={{ fontWeight: 700 }}>No FAQs found for this category</div>
                <p style={{ fontSize: '0.8125rem' }}>Click "+ Add Question" to publish an FAQ item.</p>
              </div>
            ) : (
              <div className="admin-content-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', width: '100%' }}>
                {filteredFaqs.map((f) => (
                  <div
                    key={f.id}
                    className="admin-interactive-item"
                    style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--admin-surface-subtle)',
                      border: '1px solid var(--admin-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span className="admin-badge primary" style={{ fontSize: '0.6875rem' }}>
                          {f.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{ width: '28px', height: '28px', color: 'var(--admin-primary)' }}
                            onClick={() => handleOpenEditFaq(f)}
                            title="Edit FAQ"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-btn"
                            style={{ width: '28px', height: '28px', color: 'var(--admin-danger)' }}
                            onClick={() => handleDeleteFaq(f)}
                            title="Delete FAQ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--admin-text-primary)' }}>
                        {f.question}
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                        {f.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: HERO BANNERS ================= */}
        {activeSection === 'banners' && (
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {/* Live Webpage Banner Preview */}
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--admin-text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Eye size={16} style={{ color: 'var(--admin-primary)' }} />
                Real-Time Public Webpage Banner Preview:
              </div>
              <div
                style={{
                  width: '100%',
                  padding: '1.25rem 1.65rem',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7A1635 0%, #4D091F 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 24px rgba(122, 22, 53, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  opacity: heroBanner.isActive ? 1 : 0.5,
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  {heroBanner.badgeText && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        backgroundColor: '#FFD700',
                        color: '#4D091F',
                        padding: '2px 9px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        marginBottom: '6px',
                        letterSpacing: '0.02em'
                      }}
                    >
                      {heroBanner.badgeText}
                    </span>
                  )}
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {heroBanner.title || 'Ugadi 2026 Special: Premium VIP Matchmaking Discount'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '4px', lineHeight: 1.4 }}>
                    {heroBanner.subtitle || 'Join over 150,000+ verified Telugu brides & grooms with 50% extra contact views and complimentary Astro Kundali reports!'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFD700',
                      color: '#4D091F',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    {heroBanner.ctaText || 'Explore VIP Plans'} <ArrowRight size={14} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.85, whiteSpace: 'nowrap' }}>
                    {heroBanner.isActive ? '🟢 Active on Webpage' : '⚪ Inactive (Turned Off)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Banner Configuration Form */}
            <form onSubmit={handleSaveBanner} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.15rem', backgroundColor: 'var(--admin-surface-subtle)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--admin-border-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Banner Main Headline *
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={heroBanner.title}
                    onChange={(e) => setHeroBanner({ ...heroBanner, title: e.target.value })}
                    placeholder="e.g. Ugadi 2026 Special: Premium VIP Matchmaking Discount"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Supporting Subtitle & Tagline
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={heroBanner.subtitle}
                    onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })}
                    placeholder="e.g. Join over 150,000+ verified Telugu brides & grooms with 50% extra contact views!"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Badge Tag Text
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={heroBanner.badgeText}
                    onChange={(e) => setHeroBanner({ ...heroBanner, badgeText: e.target.value })}
                    placeholder="e.g. Ugadi Offer 🪔"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Call-to-Action (CTA) Label
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={heroBanner.ctaText}
                    onChange={(e) => setHeroBanner({ ...heroBanner, ctaText: e.target.value })}
                    placeholder="e.g. Explore VIP Plans"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Destination Link Route
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={heroBanner.ctaLink}
                    onChange={(e) => setHeroBanner({ ...heroBanner, ctaLink: e.target.value })}
                    placeholder="e.g. /membership"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--admin-border-subtle)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={heroBanner.isActive}
                    onChange={(e) => setHeroBanner({ ...heroBanner, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)' }}
                  />
                  <span style={{ fontWeight: 700, color: 'var(--admin-text-primary)' }}>
                    Publish and display this announcement banner live across public & user platform pages
                  </span>
                </label>

                <button type="submit" className="btn btn-primary btn-md" style={{ gap: '0.4rem', padding: '0.6rem 1.35rem' }}>
                  <Save size={16} /> Save & Broadcast Banner Live
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= SECTION 3: SAFETY RULES ================= */}
        {activeSection === 'safety' && (
          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', width: '100%' }}>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 800 }}>Telugu Matrimonial Safety Guidelines</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                  These rules appear directly on the public Safety Guidelines page and during chat interactions
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleOpenAddRule}
                style={{ gap: '0.35rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> Add Guideline
              </button>
            </div>

            {/* Balanced 2-Column Responsive Grid */}
            <div className="admin-content-responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1rem', width: '100%' }}>
              {safetyRules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="admin-interactive-item"
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--admin-surface-subtle)',
                    border: '1px solid var(--admin-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="admin-badge gold" style={{ fontSize: '0.6875rem' }}>
                          Rule #{idx + 1}
                        </span>
                        <span className={`admin-badge ${rule.severity === 'Critical' ? 'danger' : 'primary'}`} style={{ fontSize: '0.6875rem' }}>
                          {rule.severity}
                        </span>
                        {rule.category && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>
                            • {rule.category}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '28px', height: '28px', color: 'var(--admin-primary)' }}
                          onClick={() => handleOpenEditRule(rule)}
                          title="Edit Guideline"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '28px', height: '28px', color: 'var(--admin-danger)' }}
                          onClick={() => handleDeleteRule(rule)}
                          title="Delete Guideline"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--admin-text-primary)' }}>
                      {rule.title}
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                      {rule.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* ================= MODAL: ADD / EDIT FAQ ================= */}
      {isFaqModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsFaqModalOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '560px', backgroundColor: 'var(--admin-surface)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: '0 20px 48px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.35rem', borderBottom: '1px solid var(--admin-border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Question'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Changes will reflect live on the homepage FAQ accordion
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsFaqModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Category *
                  </label>
                  <select
                    className="admin-input"
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Trust & Verification">Trust & Verification</option>
                    <option value="Matchmaking">Matchmaking</option>
                    <option value="Horoscope">Horoscope & Kundali</option>
                    <option value="Privacy & Security">Privacy & Security</option>
                    <option value="Memberships">Memberships & Billing</option>
                    <option value="General">General Questions</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Question Text *
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    placeholder="e.g. How does TeluguBandham verify candidate documents?"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Answer Explanation *
                  </label>
                  <textarea
                    className="admin-input"
                    rows={4}
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    placeholder="Provide a clear, reassuring answer for prospective brides, grooms, and parents..."
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsFaqModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '4px' }}
                >
                  <Save size={14} /> {editingFaq ? 'Save Changes' : 'Publish Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT SAFETY RULE ================= */}
      {isRuleModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsRuleModalOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            className="admin-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '540px', backgroundColor: 'var(--admin-surface)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: '0 20px 48px rgba(0,0,0,0.25)', overflow: 'hidden' }}
          >
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.35rem', borderBottom: '1px solid var(--admin-border)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  {editingRule ? 'Edit Safety Guideline' : 'Add New Safety Guideline'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                  Published directly to matrimonial safety advisory
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-btn"
                onClick={() => setIsRuleModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRule}>
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Category *
                    </label>
                    <input
                      type="text"
                      className="admin-input"
                      value={ruleForm.category}
                      onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
                      placeholder="e.g. Financial Safety"
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                      Severity Level *
                    </label>
                    <select
                      className="admin-input"
                      value={ruleForm.severity}
                      onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Rule Title *
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={ruleForm.title}
                    onChange={(e) => setRuleForm({ ...ruleForm, title: e.target.value })}
                    placeholder="e.g. Financial Safeguard"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                    Detailed Guideline *
                  </label>
                  <textarea
                    className="admin-input"
                    rows={3}
                    value={ruleForm.description}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    placeholder="Explain the safety measure clearly..."
                    required
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface-subtle)' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsRuleModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ gap: '4px' }}
                >
                  <Save size={14} /> {editingRule ? 'Save Changes' : 'Add Guideline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Content Item Confirmation Modal */}
      <ConfirmActionModal
        isOpen={!!deleteConfirmTarget}
        title={deleteConfirmTarget?.title ? `Delete ${deleteConfirmTarget.title}?` : 'Confirm Deletion'}
        message={deleteConfirmTarget?.message || 'Are you sure you want to permanently remove this content item?'}
        confirmText="Yes, Delete"
        confirmVariant="danger"
        onConfirm={handleExecuteDelete}
        onClose={() => setDeleteConfirmTarget(null)}
      />
    </AdminLayout>
  );
}
