import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Send,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import '../../styles/pages.css';

export default function RefundCancellation() {
  const { user } = useAuth();
  const { showToast } = useApp();

  // Interactive Refund Request Form State
  const [formData, setFormData] = useState({
    name: user?.fullName || user?.name || '',
    email: user?.email || '',
    transactionId: '',
    reason: '',
    otherReason: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Strict Validation Logic
  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case 'name': {
        const trimmed = value.trim();
        if (!trimmed) return 'Full name is required.';
        if (trimmed.length < 3) return 'Name must be at least 3 characters.';
        if (trimmed.length > 40) return 'Name cannot exceed 40 characters.';
        if (!/^[a-zA-Z\s.']{3,40}$/.test(trimmed)) return 'Name should contain letters and spaces only.';
        if (/(.)\1{3,}/.test(trimmed)) return 'Please enter a valid real name.';
        return '';
      }
      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) return 'Registered email is required.';
        if (trimmed.length > 50) return 'Email cannot exceed 50 characters.';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
        return '';
      }
      case 'transactionId': {
        const trimmed = value.trim();
        if (!trimmed) return 'Transaction / Order ID is required.';
        if (trimmed.length < 8) return 'Order ID must be at least 8 characters long.';
        if (trimmed.length > 22) return 'Order ID cannot exceed 22 characters.';
        if (!/^[a-zA-Z0-9_-]{8,22}$/.test(trimmed)) return 'Valid characters: letters, numbers, hyphens, underscores.';
        if (/(.)\1{5,}/.test(trimmed)) return 'Please enter a genuine transaction reference number without repetitive digits.';
        const lower = trimmed.toLowerCase();
        if (['12345678', 'abcdefgh', 'testtest', 'nullnull', 'nonenone', '00000000', '11111111'].includes(lower)) {
          return 'Please provide a genuine bank / UPI / payment gateway transaction ID.';
        }
        return '';
      }
      case 'otherReason': {
        if (allData.reason === 'other') {
          const trimmed = value.trim();
          if (!trimmed) return 'Please specify your question or query.';
          if (trimmed.length < 6) return 'Please describe your query (minimum 6 characters).';
          if (trimmed.length > 120) return 'Query cannot exceed 120 characters.';
          if (/(.)\1{5,}/.test(trimmed)) return 'Please enter a valid question.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;

    const txnErr = validateField('transactionId', formData.transactionId);
    if (txnErr) newErrors.transactionId = txnErr;

    if (formData.reason === 'other') {
      const otherErr = validateField('otherReason', formData.otherReason);
      if (otherErr) newErrors.otherReason = otherErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    if (touched[field]) {
      const fieldErr = validateField(field, value, updatedData);
      setErrors((prev) => ({ ...prev, [field]: fieldErr }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErr = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: fieldErr }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      transactionId: true,
      reason: true,
      otherReason: true
    });

    if (!validateAll()) {
      showToast('Please correct the highlighted fields before submitting.', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const generatedTicket = 'REF-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedTicket);
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast('Refund ticket submitted successfully.', 'success');
    }, 500);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setErrors({});
    setTouched({});
    setFormData({
      name: user?.fullName || user?.name || '',
      email: user?.email || '',
      transactionId: '',
      reason: '',
      otherReason: '',
      description: ''
    });
  };

  return (
    <div className="refund-page-wrapper">
      {/* 1. HERO */}
      <section className="refund-hero" aria-labelledby="refund-heading">
        <div className="container">
          <div className="refund-hero-content">
            <div className="refund-icon-badge">
              <RotateCcw size={24} />
            </div>
            <h1 id="refund-heading" className="refund-hero-title">
              Refund and Cancellation Policy
            </h1>
            <p className="refund-hero-subtitle">
              Transparent, fair guidelines regarding your premium subscriptions, payment protections, and cancellation options.
            </p>
            <div className="refund-meta-badge-row">
              <span className="refund-meta-badge">
                <Clock size={13} /> Updated February 2026
              </span>
              <span className="refund-meta-badge">
                <ShieldCheck size={13} /> 100% Double-Charge Protection
              </span>
              <span className="refund-meta-badge">
                <CreditCard size={13} /> 5 to 7 Days Bank Processing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE SUMMARY CARDS */}
      <section className="refund-summary-section">
        <div className="container">
          <div className="refund-summary-grid">
            <div className="refund-summary-card">
              <div className="refund-card-icon">
                <CreditCard size={18} />
              </div>
              <h3 className="refund-card-title">Instant Service Delivery</h3>
              <p className="refund-card-desc">
                Contact credits and chat benefits activate immediately upon successful payment.
              </p>
            </div>

            <div className="refund-summary-card">
              <div className="refund-card-icon">
                <RotateCcw size={18} />
              </div>
              <h3 className="refund-card-title">Duplicate Payment Shield</h3>
              <p className="refund-card-desc">
                Accidental double charges are automatically detected and refunded to your original source.
              </p>
            </div>

            <div className="refund-summary-card">
              <div className="refund-card-icon">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="refund-card-title">Zero Auto-Renewal Lock</h3>
              <p className="refund-card-desc">
                TeluguBandham does not enforce recurring hidden auto-debits without explicit member opt-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN POLICY & INTERACTIVE FORM (2-COLUMN BALANCED GRID) */}
      <section className="refund-main-section">
        <div className="container">
          <div className="refund-two-col-grid">
            {/* Left Column: Policy Terms & Eligibility Matrix */}
            <div className="refund-left-col">
              {/* Section 1: Cancellation Rules */}
              <div className="refund-card">
                <h2 className="refund-section-h2">1. Subscription Cancellation</h2>
                <p className="refund-text">
                  You can cancel your active subscription package or profile at any time through your <strong>Settings</strong> page. When you cancel:
                </p>
                <ul className="refund-bullet-list">
                  <li>Your remaining contact view credits and chat access remain active until the end of your current billing validity.</li>
                  <li>No future recurring charges will be deducted from your payment method.</li>
                  <li>Your profile will automatically switch to standard free status after your plan period concludes.</li>
                </ul>
              </div>

              {/* Section 2: Eligibility Matrix */}
              <div className="refund-card">
                <h2 className="refund-section-h2">2. Refund Eligibility Guidelines</h2>
                <div className="refund-table-wrap">
                  <table className="refund-table">
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>Status</th>
                        <th>Resolution Process</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Duplicate / Multiple Deductions</strong></td>
                        <td><span className="refund-status-tag eligible">Eligible</span></td>
                        <td>100% refunded to source account within 5 to 7 business days.</td>
                      </tr>
                      <tr>
                        <td><strong>Technical Failure to Credit Plan</strong></td>
                        <td><span className="refund-status-tag eligible">Eligible</span></td>
                        <td>Immediate credit allotment or full refund if unresolved within 24 hours.</td>
                      </tr>
                      <tr>
                        <td><strong>Services Partially or Fully Used</strong></td>
                        <td><span className="refund-status-tag non-eligible">Non-Refundable</span></td>
                        <td>Once phone views or chat features are accessed, fees are non-refundable.</td>
                      </tr>
                      <tr>
                        <td><strong>Match Alliance Finalized Offline</strong></td>
                        <td><span className="refund-status-tag non-eligible">Non-Refundable</span></td>
                        <td>Unused balance cannot be prorated or transferred to other accounts.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Processing Mode */}
              <div className="refund-card">
                <h2 className="refund-section-h2">3. Refund Timeline and Mode</h2>
                <p className="refund-text">
                  Approved refunds are credited directly to the original payment source (UPI, Debit/Credit Card, Net Banking) via our RBI-licensed payment gateway partners (Razorpay / Cashfree / Stripe). The standard bank turnaround is <strong>5 to 7 business days</strong> depending on your issuing bank.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Refund Form & Direct Helpline */}
            <div className="refund-right-col">
              {/* Section 4: Interactive Refund Request Ticket Form */}
              <div className="refund-card refund-form-card">
                <div className="refund-form-head">
                  <RotateCcw size={20} className="refund-form-icon" />
                  <div>
                    <h2 className="refund-section-h2" style={{ margin: 0 }}>4. Submit a Billing Ticket</h2>
                    <p className="refund-form-sub">Have a payment discrepancy? Submit details for expedited review:</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <div className="refund-success-box">
                    <div className="success-icon-wrap">
                      <Check size={24} />
                    </div>
                    <h3 className="success-title">Refund Request Received</h3>
                    <p className="success-text">
                      Your ticket reference is <strong>{ticketId}</strong>. Our finance support team will audit your payment logs and contact you at <strong>{formData.email}</strong> within 24 business hours.
                    </p>
                    <button type="button" className="refund-new-ticket-btn" onClick={handleResetForm}>
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="refund-ticket-form" noValidate>
                    <div className="refund-form-grid">
                      <div className="refund-field-group">
                        <label className="refund-label">Full Name *</label>
                        <input
                          type="text"
                          className={`refund-input ${touched.name && errors.name ? 'has-error' : ''}`}
                          maxLength={40}
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                        />
                        {touched.name && errors.name && (
                          <span className="refund-error-msg">{errors.name}</span>
                        )}
                      </div>

                      <div className="refund-field-group">
                        <label className="refund-label">Registered Email *</label>
                        <input
                          type="email"
                          className={`refund-input ${touched.email && errors.email ? 'has-error' : ''}`}
                          maxLength={50}
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                        />
                        {touched.email && errors.email && (
                          <span className="refund-error-msg">{errors.email}</span>
                        )}
                      </div>

                      <div className="refund-field-group full-width">
                        <label className="refund-label">Transaction / Order ID *</label>
                        <input
                          type="text"
                          className={`refund-input ${touched.transactionId && errors.transactionId ? 'has-error' : ''}`}
                          maxLength={22}
                          value={formData.transactionId}
                          onChange={(e) => handleChange('transactionId', e.target.value)}
                          onBlur={() => handleBlur('transactionId')}
                        />
                        {touched.transactionId && errors.transactionId && (
                          <span className="refund-error-msg">{errors.transactionId}</span>
                        )}
                      </div>

                      <div className="refund-field-group full-width">
                        <label className="refund-label">Reason for Request</label>
                        <select
                          className="refund-select"
                          value={formData.reason}
                          onChange={(e) => handleChange('reason', e.target.value)}
                        >
                          <option value="">-- Select a reason --</option>
                          <option value="duplicate">Accidental Duplicate Payment</option>
                          <option value="technical">Plan Benefits Not Activated</option>
                          <option value="billing">Incorrect Amount Deducted</option>
                          <option value="other">Other Billing Question</option>
                        </select>
                      </div>

                      {/* Dynamic Box when user selects 'other' */}
                      {formData.reason === 'other' && (
                        <div className="refund-field-group full-width refund-animate-field">
                          <label className="refund-label">Specify Your Question / Query *</label>
                          <input
                            type="text"
                            className={`refund-input ${touched.otherReason && errors.otherReason ? 'has-error' : ''}`}
                            maxLength={120}
                            value={formData.otherReason}
                            onChange={(e) => handleChange('otherReason', e.target.value)}
                            onBlur={() => handleBlur('otherReason')}
                            autoFocus
                          />
                          {touched.otherReason && errors.otherReason && (
                            <span className="refund-error-msg">{errors.otherReason}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="refund-field-group full-width">
                      <label className="refund-label">Additional Details (Optional)</label>
                      <textarea
                        className="refund-textarea"
                        rows="2"
                        maxLength={300}
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                      />
                    </div>

                    <div className="refund-form-footer">
                      <span className="refund-form-note">
                        <ShieldCheck size={13} /> Reviewed within 24-48 hours.
                      </span>
                      <button type="submit" className="refund-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <Send size={13} />
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Section 5: Direct Support Contact */}
              <div className="refund-card refund-help-card">
                <div className="refund-help-content">
                  <HelpCircle size={20} className="refund-help-icon" />
                  <div>
                    <h4 className="refund-help-title">Need Direct Billing Assistance?</h4>
                    <p className="refund-help-text">
                      Email our accounts team at{' '}
                      <a href="mailto:billing@telugubandham.com" className="refund-link">
                        billing@telugubandham.com
                      </a>{' '}
                      or call <strong>+91 98765 43210</strong> (Mon–Sat, 9:00 AM – 8:00 PM IST).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
