import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Scale,
  CreditCard,
  AlertTriangle,
  Clock,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import '../../styles/pages.css';

const TOC_SECTIONS = [
  { id: 'eligibility', num: '1', title: 'Eligibility and Registration' },
  { id: 'profile-accuracy', num: '2', title: 'Account and Profile Authenticity' },
  { id: 'code-of-conduct', num: '3', title: 'Code of Conduct and Prohibitions' },
  { id: 'dowry-safety', num: '4', title: 'Anti-Dowry and Safety Compliance' },
  { id: 'memberships-refunds', num: '5', title: 'Memberships, Payments, and Refunds' },
  { id: 'intellectual-property', num: '6', title: 'Intellectual Property and Content' },
  { id: 'termination', num: '7', title: 'Account Suspension and Termination' },
  { id: 'jurisdiction-grievance', num: '8', title: 'Dispute Resolution and Grievance Redressal' }
];

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState(null);

  // Real-time ScrollSpy to highlight active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const firstSection = document.getElementById(TOC_SECTIONS[0].id);
      if (!firstSection) return;

      const scrollPosition = window.scrollY + 140;

      // If user is above the first section, clear active item
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
    <div className="terms-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="terms-hero" aria-labelledby="terms-heading">
        <div className="container">
          <div className="terms-hero-content">
            <h1 id="terms-heading" className="terms-hero-title">
              Terms of Service
            </h1>
            <p className="terms-hero-subtitle">
              Welcome to TeluguBandham. These terms govern your access, membership, and use of our matrimonial matchmaking platform. Please read them carefully.
            </p>
            <div className="terms-meta-badge-row">
              <span className="terms-meta-badge">
                <Clock size={13} /> Updated February 2026
              </span>
              <span className="terms-meta-badge">
                <Scale size={13} /> IT Act 2000 and DPDP Act 2023
              </span>
              <span className="terms-meta-badge">
                <ShieldCheck size={13} /> Strictly for Matrimonial Intent
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE TERMS HIGHLIGHTS (4 CARDS) */}
      <section className="terms-promises-section" aria-label="Key Terms Highlights">
        <div className="container">
          <div className="terms-promises-grid">
            <div className="terms-promise-card">
              <div className="promise-icon-wrap">
                <UserCheck size={20} />
              </div>
              <h3 className="promise-title">Legal Age and Eligibility</h3>
              <p className="promise-desc">
                Members must be of legal marriageable age (21+ for grooms, 18+ for brides) and legally eligible for marriage.
              </p>
            </div>

            <div className="terms-promise-card">
              <div className="promise-icon-wrap">
                <ShieldCheck size={20} />
              </div>
              <h3 className="promise-title">Genuine Matrimony Only</h3>
              <p className="promise-desc">
                TeluguBandham is exclusively for matchmaking and matrimony. Casual dating, commercial solicitations, or spam are strictly barred.
              </p>
            </div>

            <div className="terms-promise-card">
              <div className="promise-icon-wrap">
                <Scale size={20} />
              </div>
              <h3 className="promise-title">Zero Dowry Tolerance</h3>
              <p className="promise-desc">
                We strictly enforce the Dowry Prohibition Act, 1961. Demanding or soliciting dowry results in immediate permanent bans.
              </p>
            </div>

            <div className="terms-promise-card">
              <div className="promise-icon-wrap">
                <CreditCard size={20} />
              </div>
              <h3 className="promise-title">Clear Pricing and Terms</h3>
              <p className="promise-desc">
                Transparent plan benefits, verified contact quotas, secure payment gateways, and clear refund guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN TERMS CONTENT WITH STICKY TOC */}
      <section className="terms-main-section">
        <div className="container">
          <div className="terms-layout-grid">
            {/* Left Column: Sticky Table of Contents */}
            <aside className="terms-toc-sidebar" aria-label="Terms Table of Contents">
              <div className="terms-toc-sticky">
                <span className="terms-toc-heading">Table of Contents</span>
                <nav className="terms-toc-nav" aria-label="Terms of Service Sections">
                  {TOC_SECTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`terms-toc-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <span className="terms-link-num">{item.num}</span>
                      <span className="terms-link-text">{item.title}</span>
                    </button>
                  ))}
                </nav>

                <div className="terms-toc-help-box">
                  <div className="terms-toc-help-content">
                    <div className="terms-toc-help-icon-wrap" aria-hidden="true">
                      <HelpCircle size={14} />
                    </div>
                    <div className="terms-toc-help-texts">
                      <span className="terms-toc-help-title">Questions on Terms?</span>
                      <span className="terms-toc-help-subtitle">Our compliance team is ready to assist.</span>
                    </div>
                  </div>
                  <Link to="/contact" className="terms-toc-contact-btn">
                    <span>Contact Legal Support</span>
                    <ArrowRight size={13} className="terms-btn-arrow" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Column: Detailed Clauses */}
            <article className="terms-content-article">
              {/* SECTION 1 */}
              <section id="eligibility" className="terms-doc-section">
                <h2 className="terms-section-h2">1. Eligibility and Registration</h2>
                <p className="terms-text">
                  To register as a member of TeluguBandham or use this website, you must be legally competent and eligible to enter into a binding contract under the Indian Contract Act, 1872. By creating an account, you affirm that:
                </p>
                <ul className="terms-check-list">
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span><strong>Legal Age:</strong> You are at least 18 years of age (if female) or 21 years of age (if male) at the time of registration.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span><strong>Marital Status:</strong> You are legally single, divorced with final decree, widowed, or annulled, and legally permitted to marry under applicable personal laws.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span><strong>Authentic Intent:</strong> Your intention is solely to search for a life partner for yourself or on behalf of your family member with their consent.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span><strong>No Prior Suspension:</strong> You have not been previously banned, suspended, or flagged for fraudulent activity on TeluguBandham.</span>
                  </li>
                </ul>
              </section>

              {/* SECTION 2 */}
              <section id="profile-accuracy" className="terms-doc-section">
                <h2 className="terms-section-h2">2. Account and Profile Authenticity</h2>
                <p className="terms-text">
                  You are responsible for maintaining the accuracy and confidentiality of your login credentials and profile details:
                </p>
                <div className="terms-table-wrap">
                  <table className="terms-table">
                    <thead>
                      <tr>
                        <th>Requirement</th>
                        <th>User Responsibility</th>
                        <th>Platform Enforcement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Accurate Information</strong></td>
                        <td>Provide true education, employment, age, marital status, and horoscope details.</td>
                        <td>Profiles with fabricated details are unlisted or permanently terminated.</td>
                      </tr>
                      <tr>
                        <td><strong>Photo Guidelines</strong></td>
                        <td>Upload recent, clear, individual photographs representing your real identity.</td>
                        <td>Celebrity, landscape, animated, or group photos are rejected by moderators.</td>
                      </tr>
                      <tr>
                        <td><strong>Account Security</strong></td>
                        <td>Keep OTPs and passwords confidential; do not share account access with strangers.</td>
                        <td>Automated rate limiting and multi-factor verification protect unauthorized access.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SECTION 3 */}
              <section id="code-of-conduct" className="terms-doc-section">
                <h2 className="terms-section-h2">3. Code of Conduct and Prohibitions</h2>
                <p className="terms-text">
                  To ensure a safe, respectful environment for all Telugu families, all members must abide by our community standards. You agree NOT to:
                </p>
                <ul className="terms-bullet-list">
                  <li>Harass, stalk, intimidate, abuse, or send unsolicited obscene messages or images to any member.</li>
                  <li>Request financial assistance, loans, gifts, cryptocurrency, or bank transfers from any member under any pretext.</li>
                  <li>Create duplicate accounts, impersonate another person, or falsely claim affiliation with any individual or entity.</li>
                  <li>Scrape, extract, copy, or distribute member profiles, photographs, or contact numbers without explicit authorization.</li>
                  <li>Promote commercial products, matrimonial agencies, unauthorized brokerage, or external business services.</li>
                </ul>
              </section>

              {/* SECTION 4 */}
              <section id="dowry-safety" className="terms-doc-section">
                <h2 className="terms-section-h2">4. Anti-Dowry and Safety Compliance</h2>
                <p className="terms-text">
                  TeluguBandham strictly condemns and prohibits any practice of demanding, offering, or negotiating dowry in connection with matrimonial alliances:
                </p>
                <div className="terms-callout-box warning">
                  <div className="terms-callout-head">
                    <AlertTriangle size={18} />
                    <h4>Statutory Compliance: Dowry Prohibition Act, 1961</h4>
                  </div>
                  <p>
                    Demanding or negotiating dowry directly or indirectly is an offense punishable under Indian law. Any profile found soliciting dowry or engaging in coercive financial demands will be immediately terminated and reported to relevant law enforcement authorities.
                  </p>
                </div>
              </section>

              {/* SECTION 5 */}
              <section id="memberships-refunds" className="terms-doc-section">
                <h2 className="terms-section-h2">5. Memberships, Payments, and Refunds</h2>
                <p className="terms-text">
                  TeluguBandham offers both free exploratory access and paid premium subscription packages to accelerate your partner search:
                </p>
                <div className="terms-card-split">
                  <div className="terms-inner-card">
                    <div className="inner-card-head">
                      <CreditCard size={18} />
                      <h4>Subscription Activations</h4>
                    </div>
                    <p>
                      Premium benefits (verified contact view quotas, instant chat, spotlight placement) activate immediately upon successful payment confirmation through our RBI-authorized payment gateways.
                    </p>
                  </div>
                  <div className="terms-inner-card">
                    <div className="inner-card-head">
                      <Scale size={18} />
                      <h4>Refund Policy</h4>
                    </div>
                    <p>
                      Due to the instant delivery of digital contact view credits, subscriptions are non-refundable once activated. In cases of duplicate accidental payments, refunds are processed within 5 to 7 business days.
                    </p>
                  </div>
                </div>
              </section>

              {/* SECTION 6 */}
              <section id="intellectual-property" className="terms-doc-section">
                <h2 className="terms-section-h2">6. Intellectual Property and Content</h2>
                <p className="terms-text">
                  All trademarks, logos, algorithms, user interface designs, website graphics, and proprietary software are the exclusive intellectual property of TeluguBandham. Members retain ownership of their personal bio and photographs, granting TeluguBandham a non-exclusive license solely to host and display content within the platform according to their chosen privacy settings.
                </p>
              </section>

              {/* SECTION 7 */}
              <section id="termination" className="terms-doc-section">
                <h2 className="terms-section-h2">7. Account Suspension and Termination</h2>
                <p className="terms-text">
                  You may delete your account at any time from your profile settings. TeluguBandham reserves the right to immediately suspend or permanently delete any account that:
                </p>
                <ul className="terms-check-list">
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span>Violates any provision of these Terms of Service or community safety rules.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span>Submits falsified government verification documents or impersonates someone else.</span>
                  </li>
                  <li>
                    <CheckCircle2 size={16} className="terms-check-icon" />
                    <span>Receives verified reports of abusive conduct, financial solicitation, or harassment.</span>
                  </li>
                </ul>
              </section>

              {/* SECTION 8 */}
              <section id="jurisdiction-grievance" className="terms-doc-section">
                <h2 className="terms-section-h2">8. Dispute Resolution and Grievance Redressal</h2>
                <p className="terms-text">
                  These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in Hyderabad, Telangana.
                </p>
                
                <div className="terms-grievance-card">
                  <div className="grievance-head">
                    <ShieldCheck size={20} className="grievance-icon" />
                    <div>
                      <h4 className="grievance-title">Grievance Redressal Officer</h4>
                      <span className="grievance-subtitle">Appointed in compliance with the Information Technology Act, 2000</span>
                    </div>
                  </div>
                  <div className="grievance-details-grid">
                    <div className="grievance-detail-item">
                      <span className="g-label">Officer Name</span>
                      <strong className="g-val">Raghavendra Rao K.</strong>
                    </div>
                    <div className="grievance-detail-item">
                      <span className="g-label">Email Address</span>
                      <strong className="g-val">
                        <a href="mailto:grievance@telugubandham.com" className="g-link">grievance@telugubandham.com</a>
                      </strong>
                    </div>
                    <div className="grievance-detail-item">
                      <span className="g-label">Postal Address</span>
                      <strong className="g-val">Level 4, Bandham Towers, Hitec City, Hyderabad, Telangana 500081</strong>
                    </div>
                    <div className="grievance-detail-item">
                      <span className="g-label">Resolution SLA</span>
                      <strong className="g-val">Acknowledged in 24 hours; resolved within 15 days</strong>
                    </div>
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
