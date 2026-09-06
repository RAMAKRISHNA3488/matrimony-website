import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  Phone,
  FileText,
  CheckCircle2,
  Trash2,
  HelpCircle,
  Mail,
  ShieldCheck,
  Server,
  UserCheck,
  Clock,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import '../../styles/pages.css';

const TOC_SECTIONS = [
  { id: 'info-collect', num: '1', title: 'Information We Collect' },
  { id: 'data-usage', num: '2', title: 'How We Use Your Data' },
  { id: 'visibility-controls', num: '3', title: 'Visibility and Contact Privacy' },
  { id: 'photo-horoscope', num: '4', title: 'Photo and Horoscope Security' },
  { id: 'data-sharing', num: '5', title: 'Third Parties and Sharing' },
  { id: 'retention-delete', num: '6', title: 'Retention and Deletion' },
  { id: 'user-rights', num: '7', title: 'Your Rights (DPDP Act)' },
  { id: 'dpo-contact', num: '8', title: 'Grievance and DPO Officer' }
];

export default function PrivacyPolicy() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { showToast } = useApp();

  const [activeSection, setActiveSection] = useState(null);

  // Interactive privacy preview state
  const [photoPrivacyMode, setPhotoPrivacyMode] = useState('connections');
  const [phonePrivacyMode, setPhonePrivacyMode] = useState('verified');

  // If user is authenticated, sync with their actual profile privacy preferences
  useEffect(() => {
    if (isAuthenticated && user?.privacySettings) {
      if (user.privacySettings.photoVisibility) {
        setPhotoPrivacyMode(user.privacySettings.photoVisibility);
      }
      if (user.privacySettings.phoneVisibility) {
        setPhonePrivacyMode(user.privacySettings.phoneVisibility);
      }
    }
  }, [isAuthenticated, user]);

  const handlePhotoPrivacyChange = (e) => {
    if (!isAuthenticated) {
      showToast('Please log in to your account to customize and save your privacy settings.', 'info');
      return;
    }
    const val = e.target.value;
    setPhotoPrivacyMode(val);
    if (updateProfile) {
      updateProfile({
        privacySettings: {
          ...(user?.privacySettings || {}),
          photoVisibility: val
        }
      });
    }
    showToast('Photo visibility settings updated successfully.', 'success');
  };

  const handlePhonePrivacyChange = (e) => {
    if (!isAuthenticated) {
      showToast('Please log in to your account to customize and save your privacy settings.', 'info');
      return;
    }
    const val = e.target.value;
    setPhonePrivacyMode(val);
    if (updateProfile) {
      updateProfile({
        privacySettings: {
          ...(user?.privacySettings || {}),
          phoneVisibility: val
        }
      });
    }
    showToast('Phone reveal settings updated successfully.', 'success');
  };

  // Real-time ScrollSpy: only appears when user scrolls down into the content
  useEffect(() => {
    const handleScroll = () => {
      const firstSection = document.getElementById(TOC_SECTIONS[0].id);
      if (!firstSection) return;

      const scrollPosition = window.scrollY + 140;

      // If user is at the top of the page above the first section, no item is highlighted
      if (scrollPosition < firstSection.offsetTop) {
        setActiveSection(null);
        return;
      }

      for (let i = TOC_SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(TOC_SECTIONS[i].id);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(TOC_SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="privacy-page-wrapper">
      {/* 1. COMPACT HERO SECTION */}
      <section className="privacy-hero" aria-labelledby="privacy-heading">
        <div className="container">
          <div className="privacy-hero-content">
            <h1 id="privacy-heading" className="privacy-hero-title">
              Privacy Policy
            </h1>
            <p className="privacy-hero-subtitle">
              Your trust is our highest priority. Learn how TeluguBandham collects, protects, and gives you total control over your personal and matrimonial data.
            </p>
            <div className="privacy-meta-badge-row">
              <span className="privacy-meta-badge">
                <Clock size={13} /> Updated February 2026
              </span>
              <span className="privacy-meta-badge">
                <ShieldCheck size={13} /> DPDP Act 2023 Compliant
              </span>
              <span className="privacy-meta-badge">
                <Lock size={13} /> 256-Bit SSL Secured
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PRIVACY PROMISES (4 TILES) */}
      <section className="privacy-promises-section" aria-label="Core Privacy Commitments">
        <div className="container">
          <div className="privacy-promises-grid">
            <div className="privacy-promise-card">
              <div className="promise-icon-wrap">
                <Lock size={20} />
              </div>
              <h3 className="promise-title">Zero Data Selling</h3>
              <p className="promise-desc">
                We never sell, rent, or trade your personal, contact, or horoscope data to third-party advertisers.
              </p>
            </div>

            <div className="privacy-promise-card">
              <div className="promise-icon-wrap">
                <ShieldCheck size={20} />
              </div>
              <h3 className="promise-title">Encrypted Documents</h3>
              <p className="promise-desc">
                Government verification IDs (Aadhaar, PAN, Passport) are encrypted and stored in isolated security vaults.
              </p>
            </div>

            <div className="privacy-promise-card">
              <div className="promise-icon-wrap">
                <Eye size={20} />
              </div>
              <h3 className="promise-title">Fine-Grained Controls</h3>
              <p className="promise-desc">
                You decide exactly who can view your photos, horoscope, family details, and contact numbers.
              </p>
            </div>

            <div className="privacy-promise-card">
              <div className="promise-icon-wrap">
                <Trash2 size={20} />
              </div>
              <h3 className="promise-title">Right to Erasure</h3>
              <p className="promise-desc">
                Permanently delete your profile and personal data at any time from your account settings with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN POLICY CONTENT WITH SIDEBAR NAV */}
      <section className="privacy-main-section">
        <div className="container">
          <div className="privacy-layout-grid">
            {/* Left Column: Sticky Table of Contents */}
            <aside className="privacy-toc-sidebar" aria-label="Policy Table of Contents">
              <div className="privacy-toc-sticky">
                <span className="privacy-toc-heading">Table of Contents</span>
                <nav className="privacy-toc-nav">
                  {TOC_SECTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`privacy-toc-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <span className="toc-link-num">{item.num}</span>
                      <span className="toc-link-text">{item.title}</span>
                    </button>
                  ))}
                </nav>

                <div className="privacy-toc-help-box">
                  <div className="privacy-toc-help-content">
                    <div className="privacy-toc-help-icon-wrap" aria-hidden="true">
                      <HelpCircle size={14} />
                    </div>
                    <div className="privacy-toc-help-texts">
                      <span className="privacy-toc-help-title">Questions on Privacy?</span>
                      <span className="privacy-toc-help-subtitle">Our compliance team is here to assist.</span>
                    </div>
                  </div>
                  <Link to="/contact" className="privacy-toc-contact-btn">
                    <span>Contact Privacy Team</span>
                    <ArrowRight size={13} className="privacy-btn-arrow" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Column: Policy Content */}
            <article className="privacy-content-article">
              {/* SECTION 1 */}
              <section id="info-collect" className="privacy-doc-section">
                <h2 className="privacy-section-h2">1. Information We Collect</h2>
                <p className="privacy-text">
                  To provide verified, high-quality Telugu matrimonial matchmaking services, TeluguBandham collects information you voluntarily submit during registration and profile completion:
                </p>
                <div className="privacy-table-wrap">
                  <table className="privacy-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Data Fields Collected</th>
                        <th>Purpose and Visibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Basic Account</strong></td>
                        <td>Full Name, Mobile Number, Email, Gender, Date of Birth</td>
                        <td>Account authentication, OTP verification, age validation (18+ only).</td>
                      </tr>
                      <tr>
                        <td><strong>Matrimonial Profile</strong></td>
                        <td>Education, Occupation, Income, Height, Marital Status, City, Native Roots</td>
                        <td>Displayed to authenticated registered members seeking compatible partner matches.</td>
                      </tr>
                      <tr>
                        <td><strong>Cultural and Horoscope</strong></td>
                        <td>Telugu Community, Gothram, Raasi, Nakshatram, Paadam</td>
                        <td>Assisting horoscope compatibility matching and family cultural alignment.</td>
                      </tr>
                      <tr>
                        <td><strong>Verification Documents</strong></td>
                        <td>Government Photo ID (Aadhaar, Passport, Driving License, Voter ID)</td>
                        <td>100% confidential. Used solely for relationship advisor verification badge; never shared publicly.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 2 */}
              <section id="data-usage" className="privacy-doc-section">
                <h2 className="privacy-section-h2">2. How We Use Your Data</h2>
                <p className="privacy-text">
                  We process personal data strictly in accordance with your explicit consent and applicable Indian data protection regulations (Digital Personal Data Protection Act, 2023):
                </p>
                <ul className="privacy-check-list">
                  <li>
                    <CheckCircle2 size={16} className="privacy-check-icon" />
                    <span><strong>Matchmaking Compatibility:</strong> Computing compatibility scores based on cultural preferences, education, location, and astrological factors.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-check-icon" />
                    <span><strong>Fraud Prevention and Trust:</strong> Preventing fake profiles, commercial spam, and bad actors through manual ID audits and phone verification.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-check-icon" />
                    <span><strong>Communication Facilitation:</strong> Enabling in-app messaging, interest exchange, and notifications for member responses.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="privacy-check-icon" />
                    <span><strong>Relationship Manager Assistance:</strong> Permitting relationship advisors to provide personalized match recommendations.</span>
                  </li>
                </ul>
              </section>

              {/* SECTION 3: VISIBILITY & CONTACT CONTROLS */}
              <section id="visibility-controls" className="privacy-doc-section">
                <h2 className="privacy-section-h2">3. Visibility and Contact Privacy Controls</h2>
                <p className="privacy-text">
                  You maintain 100% control over how your contact information and identity are presented across TeluguBandham:
                </p>
                
                {/* Interactive Privacy Controls Box */}
                <div className={`privacy-sandbox-box ${!isAuthenticated ? 'locked' : 'unlocked'}`}>
                  <div className="sandbox-header">
                    <div className="sandbox-header-left">
                      <h4>Your Account Privacy Controls</h4>
                      {isAuthenticated ? (
                        <span className="sandbox-status-badge active">
                          <CheckCircle2 size={12} color="#15803D" /> Active Profile Settings
                        </span>
                      ) : (
                        <span className="sandbox-status-badge locked">
                          <Lock size={12} /> Log In Required to Use
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="sandbox-desc">
                    {isAuthenticated
                      ? `Customize and save your live visibility rules below for your profile (${user?.fullName || user?.name || 'Member'}):`
                      : "Customize and test fine-grained visibility rules for your profile. Please log in to your account to use and save these privacy settings:"}
                  </p>

                  <div className="sandbox-controls-grid">
                    <div className="sandbox-control-group">
                      <label className="sandbox-label">Photo Visibility</label>
                      <select
                        className="sandbox-select"
                        value={photoPrivacyMode}
                        onChange={handlePhotoPrivacyChange}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Please log in to change photo visibility" : "Change photo visibility"}
                      >
                        <option value="all">Visible to All Registered Members</option>
                        <option value="connections">Visible Only to Accepted Connections</option>
                        <option value="request">Hidden / Protected with Password</option>
                      </select>
                    </div>

                    <div className="sandbox-control-group">
                      <label className="sandbox-label">Phone Number Reveal</label>
                      <select
                        className="sandbox-select"
                        value={phonePrivacyMode}
                        onChange={handlePhonePrivacyChange}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? "Please log in to change phone number reveal settings" : "Change phone number reveal settings"}
                      >
                        <option value="verified">Verified Premium Members Only</option>
                        <option value="mutual">Only Upon Mutual Interest Acceptance</option>
                        <option value="hidden">Hide Completely (Chat Only)</option>
                      </select>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <div className="sandbox-result-badge">
                      <span>Active Settings:</span>
                      <strong>
                        Photos: {photoPrivacyMode === 'all' ? 'Public to Members' : photoPrivacyMode === 'connections' ? 'Connected Members Only' : 'Password Protected'} | Phone: {phonePrivacyMode === 'verified' ? 'Premium Members' : phonePrivacyMode === 'mutual' ? 'Mutual Accept Only' : 'In-App Chat Only'}
                      </strong>
                    </div>
                  ) : (
                    <div className="sandbox-login-prompt">
                      <div className="sandbox-prompt-left">
                        <div className="sandbox-prompt-icon">
                          <Lock size={18} />
                        </div>
                        <div className="sandbox-prompt-text">
                          <strong>Log in to use and apply privacy settings</strong>
                          <span>Please sign in to customize photo visibility, contact reveals, and manage your account privacy.</span>
                        </div>
                      </div>
                      <div className="sandbox-prompt-actions">
                        <Link to="/login" className="btn btn-primary btn-sm">
                          <LogIn size={13} /> Log In
                        </Link>
                        <Link to="/register" className="btn btn-secondary btn-sm">
                          Create Profile
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* SECTION 4: PHOTO & HOROSCOPE SECURITY */}
              <section id="photo-horoscope" className="privacy-doc-section">
                <h2 className="privacy-section-h2">4. Photo and Horoscope Security</h2>
                <div className="privacy-card-split">
                  <div className="privacy-inner-card">
                    <div className="inner-card-head">
                      <Shield size={18} />
                      <h4>Photo Safeguards</h4>
                    </div>
                    <p>
                      All uploaded matrimonial photos receive automated watermarking with your TeluguBandham Profile ID to prevent unauthorized redistribution or misuse. Direct right-click image downloads are restricted.
                    </p>
                  </div>
                  <div className="privacy-inner-card">
                    <div className="inner-card-head">
                      <FileText size={18} />
                      <h4>Horoscope Confidentiality</h4>
                    </div>
                    <p>
                      Horoscope charts and birth details can be set to confidential mode so that only members whose interest you have approved can generate Janmapathrika compatibility reports.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION 5: THIRD PARTIES & SHARING */}
              <section id="data-sharing" className="privacy-doc-section">
                <h2 className="privacy-section-h2">5. Third Parties and Data Sharing</h2>
                <p className="privacy-text">
                  TeluguBandham does <strong>not</strong> share your personal data with third parties, except in the limited circumstances described below:
                </p>
                <ul className="privacy-bullet-list">
                  <li><strong>Payment Gateways (Razorpay, UPI, Cards):</strong> Encrypted financial transactions are processed by RBI-certified payment gateways. TeluguBandham never stores your credit card numbers or UPI PINs.</li>
                  <li><strong>Transactional SMS and WhatsApp:</strong> Limited to delivering login OTPs, match alerts, and direct safety notifications.</li>
                  <li><strong>Legal Obligations:</strong> In compliance with court orders, law enforcement requests, or to protect the vital safety of community members.</li>
                </ul>
              </section>

              {/* SECTION 6: RETENTION & DELETION */}
              <section id="retention-delete" className="privacy-doc-section">
                <h2 className="privacy-section-h2">6. Retention and Account Deletion</h2>
                <p className="privacy-text">
                  You are in complete control of your matrimonial data lifespan:
                </p>
                <div className="privacy-alert-box info">
                  <div className="alert-box-icon"><Trash2 size={20} /></div>
                  <div className="alert-box-content">
                    <h5>Instant Profile Deactivation and Deletion</h5>
                    <p>
                      You can hide your profile anytime from <strong>Settings and Privacy Settings</strong>. If you get married or wish to permanently delete your account, click <strong>"Delete My Profile"</strong> in settings. All profile information, photos, and match records will be permanently expunged from our production databases within 48 hours.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION 7: USER RIGHTS */}
              <section id="user-rights" className="privacy-doc-section">
                <h2 className="privacy-section-h2">7. Your Rights Under DPDP Act 2023</h2>
                <p className="privacy-text">
                  As a registered member on TeluguBandham, you possess statutory data rights:
                </p>
                <div className="privacy-rights-grid">
                  <div className="right-item">
                    <span className="right-badge">Right to Access</span>
                    <p>Request a complete export of your personal and interaction data.</p>
                  </div>
                  <div className="right-item">
                    <span className="right-badge">Right to Correction</span>
                    <p>Update, correct, or amend profile and verification records at any time.</p>
                  </div>
                  <div className="right-item">
                    <span className="right-badge">Right to Erasure</span>
                    <p>Request permanent deletion of all stored personal information and logs.</p>
                  </div>
                  <div className="right-item">
                    <span className="right-badge">Right to Grievance</span>
                    <p>Receive prompt redressal from our designated Data Protection Officer.</p>
                  </div>
                </div>
              </section>

              {/* SECTION 8: DPO CONTACT */}
              <section id="dpo-contact" className="privacy-doc-section">
                <h2 className="privacy-section-h2">8. Data Protection and Grievance Redressal</h2>
                <p className="privacy-text">
                  If you have any questions, privacy concerns, or grievance requests, please contact our dedicated Data Protection Officer:
                </p>
                <div className="privacy-dpo-card">
                  <div className="dpo-card-header">
                    <div className="dpo-avatar-wrap">
                      <UserCheck size={22} />
                    </div>
                    <div>
                      <h4 className="dpo-name">Grievance Redressal Officer</h4>
                      <span className="dpo-role">TeluguBandham Trust and Safety Compliance Team</span>
                    </div>
                  </div>
                  <div className="dpo-details-list">
                    <div className="dpo-detail-item">
                      <Mail size={15} />
                      <span>Email: <a href="mailto:privacy@telugubandham.com">privacy@telugubandham.com</a></span>
                    </div>
                    <div className="dpo-detail-item">
                      <Phone size={15} />
                      <span>Helpline: <a href="tel:+919876543210">+91 98765 43210</a> (9:00 AM – 8:00 PM IST)</span>
                    </div>
                    <div className="dpo-detail-item">
                      <Server size={15} />
                      <span>Address: Level 4, Cyber Towers, Hitec City, Madhapur, Hyderabad, TS 500081</span>
                    </div>
                  </div>
                  <div className="dpo-footer-note">
                    <span>Average Grievance Resolution Time: <strong>Within 24 to 48 Hours</strong></span>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
