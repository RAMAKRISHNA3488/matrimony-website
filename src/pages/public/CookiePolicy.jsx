import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cookie,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  Sliders,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import '../../styles/pages.css';

export default function CookiePolicy() {
  const { showToast } = useApp();

  // Interactive Cookie Preferences
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    functional: true,
    analytics: false
  });

  const handleToggle = (key) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    localStorage.setItem('tb_cookie_preferences', JSON.stringify(preferences));
    showToast('Cookie preferences saved successfully.', 'success');
  };

  return (
    <div className="cookie-page-wrapper">
      {/* 1. HERO */}
      <section className="cookie-hero" aria-labelledby="cookie-heading">
        <div className="container">
          <div className="cookie-hero-content">
            <div className="cookie-icon-badge">
              <Cookie size={24} />
            </div>
            <h1 id="cookie-heading" className="cookie-hero-title">
              Cookie Policy
            </h1>
            <p className="cookie-hero-subtitle">
              Learn how TeluguBandham uses cookies and similar technologies to provide a secure, personalized matchmaking experience.
            </p>
            <div className="cookie-meta-badge-row">
              <span className="cookie-meta-badge">
                <Clock size={13} /> Updated February 2026
              </span>
              <span className="cookie-meta-badge">
                <ShieldCheck size={13} /> DPDP Act 2023 Compliant
              </span>
              <span className="cookie-meta-badge">
                <Lock size={13} /> No Third-Party Ad Trackers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT (BALANCED 2-COLUMN FULL-WIDTH LAYOUT) */}
      <section className="cookie-main-section">
        <div className="container">
          <div className="cookie-two-col-grid">
            {/* Left Column: Explanations, Types, and Browser Guides */}
            <div className="cookie-left-col">
              {/* What are cookies */}
              <div className="cookie-card">
                <h2 className="cookie-section-h2">1. What Are Cookies?</h2>
                <p className="cookie-text">
                  Cookies are small, secure text files stored on your device when you visit websites. They help keep you logged in safely, remember your search preferences, and ensure optimal matchmaking performance without storing sensitive passwords or financial credentials.
                </p>
              </div>

              {/* Cookie Types Breakdown */}
              <div className="cookie-card">
                <h2 className="cookie-section-h2">2. Types of Cookies We Use</h2>
                <div className="cookie-types-grid">
                  <div className="cookie-type-item">
                    <div className="cookie-type-head">
                      <span className="cookie-type-title">Essential Cookies</span>
                      <span className="cookie-badge required">Required</span>
                    </div>
                    <p className="cookie-type-desc">
                      Necessary for core functionality such as user authentication, session security, OTP verification, and CSRF protection. These cannot be disabled.
                    </p>
                  </div>

                  <div className="cookie-type-item">
                    <div className="cookie-type-head">
                      <span className="cookie-type-title">Preference Cookies</span>
                      <span className="cookie-badge optional">Optional</span>
                    </div>
                    <p className="cookie-type-desc">
                      Remembers your partner search filters, regional Telugu dialect preferences, notification choices, and interface view modes.
                    </p>
                  </div>

                  <div className="cookie-type-item">
                    <div className="cookie-type-head">
                      <span className="cookie-type-title">Analytics Cookies</span>
                      <span className="cookie-badge optional">Optional</span>
                    </div>
                    <p className="cookie-type-desc">
                      Collects aggregated, anonymous telemetry to help us measure site speed, fix broken pages, and improve matchmaking algorithms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Browser Controls & Contact */}
              <div className="cookie-card">
                <h2 className="cookie-section-h2">4. Browser Controls and Inquiries</h2>
                <p className="cookie-text">
                  You can also manage or clear cookies at any time through your browser settings (Chrome, Safari, Firefox, Edge). For inquiries regarding our cookie practices, reach our data privacy team at{' '}
                  <a href="mailto:privacy@telugubandham.com" className="cookie-link">
                    privacy@telugubandham.com
                  </a>{' '}
                  or visit our <Link to="/contact" className="cookie-link">Help Center</Link>.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Preference Manager & Trust Summary */}
            <div className="cookie-right-col">
              {/* Interactive Cookie Preference Manager */}
              <div className="cookie-card cookie-manager-card">
                <div className="cookie-manager-head">
                  <Sliders size={20} className="manager-icon" />
                  <div>
                    <h2 className="cookie-section-h2" style={{ margin: 0 }}>3. Manage Your Preferences</h2>
                    <p className="cookie-manager-sub">Customize which optional cookies you allow during your visit:</p>
                  </div>
                </div>

                <div className="cookie-toggles-list">
                  {/* Essential */}
                  <div className="cookie-toggle-row">
                    <div className="toggle-info">
                      <strong>Strictly Necessary Cookies</strong>
                      <span>Always active to maintain your secure account session.</span>
                    </div>
                    <div className="toggle-switch disabled">
                      <input type="checkbox" checked={true} disabled aria-label="Essential Cookies (Always active)" />
                      <span className="slider round"></span>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className="cookie-toggle-row">
                    <div className="toggle-info">
                      <strong>Preferences and Filter Memory</strong>
                      <span>Save your partner search filters and UI view states.</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => handleToggle('functional')}
                        aria-label="Toggle Preferences Cookies"
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {/* Analytics */}
                  <div className="cookie-toggle-row">
                    <div className="toggle-info">
                      <strong>Anonymous Performance Telemetry</strong>
                      <span>Help us diagnose errors and improve load speed.</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => handleToggle('analytics')}
                        aria-label="Toggle Analytics Cookies"
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="cookie-save-wrap">
                  <button type="button" className="cookie-save-btn" onClick={handleSavePreferences}>
                    Save Preferences
                  </button>
                </div>
              </div>

              {/* Trust Callout */}
              <div className="cookie-card cookie-trust-card">
                <div className="cookie-trust-content">
                  <ShieldCheck size={20} className="trust-icon" />
                  <div>
                    <h4 className="trust-title">Our Privacy Commitment</h4>
                    <p className="trust-text">
                      TeluguBandham will never sell or monetize your cookie data to third-party ad networks. Read our full{' '}
                      <Link to="/privacy" className="cookie-link">Privacy Policy</Link> for details.
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
