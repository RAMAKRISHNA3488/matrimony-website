import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import '../../styles/footer.css';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container-wide">
        {/* Main Footer 5-Column Grid */}
        <div className="footer-main-grid">
          {/* Column 1: Brand & Identity */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand-wrap" onClick={handleScrollTop} aria-label="TeluguBandham Home">
              <img
                src="/assets/branding/TeluguBandham_Logo_Primary.png"
                alt="TeluguBandham"
                className="footer-brand-logo-img"
              />
            </Link>

            <div className="footer-tagline">Find Your Perfect Life Partner</div>

            <p className="footer-desc">
              TeluguBandham is a modern matrimonial platform built to help Telugu individuals and families discover meaningful, respectful and marriage-focused connections.
            </p>

            {/* Social Follow */}
            <div className="footer-social-wrap">
              <span className="footer-social-label">FOLLOW TELUGUBANDHAM SOCIAL MEDIA</span>
              <div className="footer-social-icons">
                {/* Instagram */}
                <Link
                  to="/social/instagram"
                  className="footer-social-link social-instagram"
                  aria-label="TeluguBandham on Instagram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="tbIgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFDC80" />
                        <stop offset="25%" stopColor="#FCAF45" />
                        <stop offset="50%" stopColor="#F77737" />
                        <stop offset="75%" stopColor="#E1306C" />
                        <stop offset="100%" stopColor="#833AB4" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#tbIgGrad)" strokeWidth="2.2" fill="none"/>
                    <circle cx="12" cy="12" r="4.2" stroke="url(#tbIgGrad)" strokeWidth="2.2" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1.3" fill="url(#tbIgGrad)"/>
                  </svg>
                </Link>

                {/* Facebook */}
                <Link
                  to="/social/facebook"
                  className="footer-social-link social-facebook"
                  aria-label="TeluguBandham on Facebook"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>

                {/* YouTube */}
                <Link
                  to="/social/youtube"
                  className="footer-social-link social-youtube"
                  aria-label="TeluguBandham on YouTube"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Column 2: TeluguBandham */}
          <div className="footer-nav-col">
            <h3 className="footer-heading-desktop">TELUGUBANDHAM</h3>
            <button
              type="button"
              className="footer-accordion-btn footer-mobile-only"
              onClick={() => toggleSection('telugubandham')}
              aria-expanded={openSection === 'telugubandham'}
              aria-controls="footer-links-telugubandham"
            >
              <span className="footer-heading">TELUGUBANDHAM</span>
              <ChevronDown size={16} className={`footer-chevron ${openSection === 'telugubandham' ? 'open' : ''}`} aria-hidden="true" />
            </button>
            <ul id="footer-links-telugubandham" className={`footer-links-list ${openSection === 'telugubandham' ? 'open' : ''}`}>
              <li>
                <NavLink to="/about" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/how-it-works" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  How It Works
                </NavLink>
              </li>
              <li>
                <NavLink to="/success-stories" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Success Stories
                </NavLink>
              </li>
              <li>
                <NavLink to="/safety-guidelines" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Safety Guidelines
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Discover */}
          <div className="footer-nav-col">
            <h3 className="footer-heading-desktop">DISCOVER</h3>
            <button
              type="button"
              className="footer-accordion-btn footer-mobile-only"
              onClick={() => toggleSection('discover')}
              aria-expanded={openSection === 'discover'}
              aria-controls="footer-links-discover"
            >
              <span className="footer-heading">DISCOVER</span>
              <ChevronDown size={16} className={`footer-chevron ${openSection === 'discover' ? 'open' : ''}`} aria-hidden="true" />
            </button>
            <ul id="footer-links-discover" className={`footer-links-list ${openSection === 'discover' ? 'open' : ''}`}>
              <li>
                <NavLink to="/discover" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Find Matches
                </NavLink>
              </li>
              <li>
                <NavLink to="/matches" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Browse Profiles
                </NavLink>
              </li>
              <li>
                <NavLink to="/discover" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Telugu Communities
                </NavLink>
              </li>
              <li>
                <NavLink to="/membership" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Membership Plans
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Help & Support */}
          <div className="footer-nav-col">
            <h3 className="footer-heading-desktop">HELP AND SUPPORT</h3>
            <button
              type="button"
              className="footer-accordion-btn footer-mobile-only"
              onClick={() => toggleSection('support')}
              aria-expanded={openSection === 'support'}
              aria-controls="footer-links-support"
            >
              <span className="footer-heading">HELP AND SUPPORT</span>
              <ChevronDown size={16} className={`footer-chevron ${openSection === 'support' ? 'open' : ''}`} aria-hidden="true" />
            </button>
            <ul id="footer-links-support" className={`footer-links-list ${openSection === 'support' ? 'open' : ''}`}>
              <li>
                <NavLink to="/help" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/faq" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  FAQs
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Contact Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/settings" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Privacy and Settings
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div className="footer-nav-col">
            <h3 className="footer-heading-desktop">LEGAL</h3>
            <button
              type="button"
              className="footer-accordion-btn footer-mobile-only"
              onClick={() => toggleSection('legal')}
              aria-expanded={openSection === 'legal'}
              aria-controls="footer-links-legal"
            >
              <span className="footer-heading">LEGAL</span>
              <ChevronDown size={16} className={`footer-chevron ${openSection === 'legal' ? 'open' : ''}`} aria-hidden="true" />
            </button>
            <ul id="footer-links-legal" className={`footer-links-list ${openSection === 'legal' ? 'open' : ''}`}>
              <li>
                <NavLink to="/privacy" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink to="/cookies" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Cookie Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/refunds" onClick={handleScrollTop} className={({ isActive }) => `footer-link ${isActive ? 'active' : ''}`}>
                  Refund and Cancellation
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-matrimonial-notice">
            TeluguBandham is a matrimonial platform created for meaningful, marriage-focused connections — not a dating service.
          </p>
          <div className="footer-bottom-row">
            <div className="footer-copyright">
              © {new Date().getFullYear()} TeluguBandham. All rights reserved.
            </div>
            <div className="footer-admin-wrap">
              <Link to="/admin/login" onClick={handleScrollTop} className="footer-admin-link">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
