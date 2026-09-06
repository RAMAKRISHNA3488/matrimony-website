import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartHandshake,
  Compass,
  Lock,
  CheckCircle2,
  ArrowRight,
  Shield,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages.css';

export default function About() {
  const { isAuthenticated } = useAuth();
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  return (
    <div className="about-page-wrapper">
      {/* 1. HERO SECTION */}
      <section className="about-hero-section" aria-labelledby="about-hero-heading">
        <div className="container-wide">
          <div className="about-hero-content">
            <span className="about-eyebrow-pill">OUR STORY • OUR VALUES</span>
            <h1 id="about-hero-heading" className="about-hero-title">
              About TeluguBandham
            </h1>
            <p className="about-hero-subtitle">
              Bringing Telugu families and individuals together through meaningful, respectful and modern matchmaking.
            </p>
          </div>
        </div>
      </section>

      {/* 2. WHY TELUGUBANDHAM / PURPOSE */}
      <section className="about-purpose-section" aria-labelledby="about-purpose-heading">
        <div className="container-wide">
          <div className="about-purpose-grid">
            {/* Left Content */}
            <div className="about-purpose-content">
              <span className="about-sub-eyebrow">WHY TELUGUBANDHAM</span>
              <h2 id="about-purpose-heading" className="about-section-title">
                Built for meaningful connections, not casual dating.
              </h2>
              <p className="about-paragraph">
                TeluguBandham is designed for individuals and families looking for genuine, marriage-focused relationships rooted in trust, compatibility and shared values.
              </p>
              <p className="about-paragraph">
                Modern matchmaking should respect both personal preferences and family cultural heritage. We provide a thoughtful space where individual aspirations and enduring Telugu traditions unite seamlessly.
              </p>
            </div>

            {/* Right Visual */}
            <div className="about-purpose-visual">
              <div className="about-image-card-wrapper">
                <img
                  src="/assets/couples/story_karthik_ananya.jpg"
                  alt="Telugu couple celebrating a meaningful connection"
                  className="about-purpose-img"
                  loading="lazy"
                />
                {/* Floating Badges */}
                <div className="about-floating-badge badge-top">
                  <ShieldCheck size={15} className="badge-icon-burgundy" aria-hidden="true" />
                  <span>Built Around Trust</span>
                </div>
                <div className="about-floating-badge badge-bottom">
                  <Lock size={15} className="badge-icon-burgundy" aria-hidden="true" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHAT WE BELIEVE / CORE PILLARS */}
      <section className="about-beliefs-section" aria-labelledby="about-beliefs-heading">
        <div className="container-wide">
          <div className="about-section-header">
            <span className="about-sub-eyebrow">CORE PILLARS</span>
            <h2 id="about-beliefs-heading" className="about-section-title">
              What We Believe
            </h2>
            <p className="about-section-subtitle">
              Technology should make finding the right person simpler — without losing the values that matter.
            </p>
          </div>

          <div className="about-beliefs-system-wrapper">
            <div className="about-beliefs-grid">
              {/* Card 01: Trust */}
              <div className="about-belief-card">
                <div className="about-card-top">
                  <span className="about-card-number">01</span>
                  <div className="about-card-icon-wrap" aria-hidden="true">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="about-card-divider" aria-hidden="true"></div>
                <div className="about-card-body">
                  <div className="pillar-heading-wrap">
                    <span className="pillar-accent-bar" aria-hidden="true"></span>
                    <h3 className="about-card-heading">TRUST</h3>
                  </div>
                  <p className="about-card-text">
                    Authentic profiles, transparent information and thoughtful verification help create a safer matchmaking environment.
                  </p>
                </div>
              </div>

              {/* Connected Step Indicator 1->2 */}
              <div className="about-beliefs-connector" aria-hidden="true">
                <span className="connector-dot"></span>
              </div>

              {/* Card 02: Compatibility */}
              <div className="about-belief-card">
                <div className="about-card-top">
                  <span className="about-card-number">02</span>
                  <div className="about-card-icon-wrap" aria-hidden="true">
                    <HeartHandshake size={18} />
                  </div>
                </div>
                <div className="about-card-divider" aria-hidden="true"></div>
                <div className="about-card-body">
                  <div className="pillar-heading-wrap">
                    <span className="pillar-accent-bar" aria-hidden="true"></span>
                    <h3 className="about-card-heading">COMPATIBILITY</h3>
                  </div>
                  <p className="about-card-text">
                    Meaningful relationships begin with shared values, expectations, lifestyle preferences and long-term goals.
                  </p>
                </div>
              </div>

              {/* Connected Step Indicator 2->3 */}
              <div className="about-beliefs-connector" aria-hidden="true">
                <span className="connector-dot"></span>
              </div>

              {/* Card 03: Cultural Connection */}
              <div className="about-belief-card">
                <div className="about-card-top">
                  <span className="about-card-number">03</span>
                  <div className="about-card-icon-wrap" aria-hidden="true">
                    <Compass size={18} />
                  </div>
                </div>
                <div className="about-card-divider" aria-hidden="true"></div>
                <div className="about-card-body">
                  <div className="pillar-heading-wrap">
                    <span className="pillar-accent-bar" aria-hidden="true"></span>
                    <h3 className="about-card-heading">CULTURAL CONNECTION</h3>
                  </div>
                  <p className="about-card-text">
                    Telugu traditions and family values can coexist with modern expectations and individual choices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRADITIONAL VALUES. MODERN MATCHMAKING. */}
      <section className="about-approach-section" aria-labelledby="about-approach-heading">
        <div className="container-wide">
          <div className="about-section-header">
            <span className="about-sub-eyebrow">OUR PROGRESSION</span>
            <h2 id="about-approach-heading" className="about-section-title">
              Traditional Values. Modern Matchmaking.
            </h2>
            <p className="about-section-subtitle">
              A balanced journey from cultural heritage to lifelong companionship.
            </p>
          </div>

          <div className="about-progression-wrapper">
            <div className="about-progression-line" aria-hidden="true"></div>
            <div className="about-progression-track">
              {/* Step 1 */}
              <div className="about-progression-step">
                <div className="progression-node">1</div>
                <div className="progression-content">
                  <div className="progression-label">TRADITION</div>
                  <p className="progression-desc">Rooted in heritage and family respect</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="about-progression-step">
                <div className="progression-node">2</div>
                <div className="progression-content">
                  <div className="progression-label">VALUES</div>
                  <p className="progression-desc">Grounded in integrity and mutual dignity</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="about-progression-step">
                <div className="progression-node">3</div>
                <div className="progression-content">
                  <div className="progression-label">COMPATIBILITY</div>
                  <p className="progression-desc">Lifestyle, career and mindset alignment</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="about-progression-step">
                <div className="progression-node">4</div>
                <div className="progression-content">
                  <div className="progression-label">CONNECTION</div>
                  <p className="progression-desc">Meaningful conversations and family consent</p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="about-progression-step">
                <div className="progression-node">5</div>
                <div className="progression-content">
                  <div className="progression-label">LIFELONG PARTNERSHIP</div>
                  <p className="progression-desc">A sacred bond of two happy families</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROOTED IN TELUGU VALUES */}
      <section className="about-heritage-section" aria-labelledby="about-heritage-heading">
        <div className="container-wide">
          <div className="about-heritage-grid">
            {/* Left Visual */}
            <div className="about-heritage-visual">
              <img
                src="/assets/couples/story_rahul_sravani.jpg"
                alt="Telugu family bond and cultural understanding"
                className="about-heritage-img"
                loading="lazy"
              />
            </div>

            {/* Right Content */}
            <div className="about-heritage-content">
              <span className="about-sub-eyebrow">CULTURAL CONTEXT</span>
              <h2 id="about-heritage-heading" className="about-section-title">
                Rooted in Telugu Values
              </h2>
              <p className="about-paragraph">
                From Andhra Pradesh and Telangana to Telugu communities around the world, TeluguBandham is designed to understand the cultural context that makes every family and every relationship unique.
              </p>
              
              <div className="about-highlights-list">
                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h3 className="highlight-title">Family Values</h3>
                    <p className="highlight-desc">Honoring parental involvement and shared matrimonial respect.</p>
                  </div>
                </div>

                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h3 className="highlight-title">Cultural Connection</h3>
                    <p className="highlight-desc">Catering with nuanced cultural understanding to diverse Telugu regional backgrounds.</p>
                  </div>
                </div>

                <div className="about-highlight-item">
                  <div className="highlight-bullet">✓</div>
                  <div>
                    <h3 className="highlight-title">Modern Preferences</h3>
                    <p className="highlight-desc">Empowering contemporary career, education, and lifestyle choices.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & SAFETY */}
      <section className="about-safety-section" aria-labelledby="about-safety-heading">
        <div className="container-wide">
          <div className="about-section-header">
            <span className="about-sub-eyebrow">PRIVACY AND CONTROL</span>
            <h2 id="about-safety-heading" className="about-section-title">
              Your Trust Comes First
            </h2>
            <p className="about-section-subtitle">
              Finding a life partner requires confidence. TeluguBandham is designed with privacy, profile authenticity and user control at its core.
            </p>
          </div>

          <div className="about-safety-grid">
            <div className="about-safety-card">
              <div className="about-safety-icon-box">
                <CheckCircle2 size={20} className="text-burgundy" aria-hidden="true" />
              </div>
              <h3 className="about-safety-card-title">Profile Authenticity</h3>
              <p className="about-safety-card-desc">
                Thoughtful profile checks to help ensure authentic identities and accurate background details.
              </p>
            </div>

            <div className="about-safety-card">
              <div className="about-safety-icon-box">
                <Lock size={20} className="text-burgundy" aria-hidden="true" />
              </div>
              <h3 className="about-safety-card-title">Privacy First</h3>
              <p className="about-safety-card-desc">
                Granular visibility controls for photos, contact numbers, and horoscope details with custom permission settings.
              </p>
            </div>

            <div className="about-safety-card">
              <div className="about-safety-icon-box">
                <Sliders size={20} className="text-burgundy" aria-hidden="true" />
              </div>
              <h3 className="about-safety-card-title">User Control</h3>
              <p className="about-safety-card-desc">
                Full autonomy to accept interests, manage communication preferences, block, or report unverified activity.
              </p>
            </div>

            <div className="about-safety-card">
              <div className="about-safety-icon-box">
                <Shield size={20} className="text-burgundy" aria-hidden="true" />
              </div>
              <h3 className="about-safety-card-title">Safety Guidelines</h3>
              <p className="about-safety-card-desc">
                Clear advisory frameworks, community safety tips, and active moderation to support respectful interactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL COMPACT CTA (Only visible when user is not logged in) */}
      {!isAuthenticated && (
        <section className="about-cta-section" aria-labelledby="about-cta-heading">
          <div className="container-wide">
            <div className="about-cta-card">
              <h2 id="about-cta-heading" className="about-cta-title">
                Find a Meaningful Connection
              </h2>
              <p className="about-cta-desc">
                Create your TeluguBandham profile and take the first step toward meeting someone who shares your values and vision for the future.
              </p>
              <div className="about-cta-buttons">
                <Link to="/register" onClick={handleScrollTop} className="btn btn-primary btn-lg">
                  Create Free Profile <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to="/discover" onClick={handleScrollTop} className="btn btn-secondary btn-lg">
                  Explore Matches <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
