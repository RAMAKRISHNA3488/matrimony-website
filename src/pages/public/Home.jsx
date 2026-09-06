import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShieldCheck,
  Lock,
  Users,
  CheckCircle2,
  ArrowRight,
  User,
  MapPin,
  ChevronDown,
  MessageCircle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import '../../styles/pages.css';

// Sample Demo Success Stories (For visual demonstration until real verified stories are approved)
const DEMO_STORIES = [
  {
    id: 'rahul-sravani',
    names: 'Rahul and Sravani',
    city: 'Hyderabad, Telangana',
    quoteTitle: 'From a Meaningful Match to a Lifetime Together',
    quoteText: 'What started as a simple connection became something truly special. We found that shared values, family traditions and mutual understanding mattered more than anything else.',
    fullStory: 'We both wanted a partner who cherished Telugu culture while embracing modern career ambitions. TeluguBandham’s thoughtful preference filters and verified profiles made the initial connection comfortable for both our families. After a few meaningful conversations, we realized how deeply our values aligned.',
    image: '/assets/couples/story_rahul_sravani.jpg',
    weddingDate: 'Married Dec 2025',
    tag: 'FEATURED STORY',
    isVerified: true,
    isDemo: true
  },
  {
    id: 'karthik-ananya',
    names: 'Karthik and Ananya',
    city: 'Vijayawada',
    quoteTitle: 'Connecting Traditions Across Modern Aspirations',
    quoteText: 'Finding someone who respected our Telugu cultural heritage while sharing progressive life goals felt effortless. TeluguBandham brought our families together with complete transparency and trust.',
    fullStory: 'Our families appreciated the privacy-first approach and verified background details. From the first phone call arranged with family blessings to our wedding ceremony in Vijayawada, everything flowed naturally.',
    image: '/assets/couples/story_karthik_ananya.jpg',
    weddingDate: 'Married Nov 2025',
    tag: 'SUCCESS STORY',
    isVerified: true,
    isDemo: true
  },
  {
    id: 'vamsi-harika',
    names: 'Vamsi and Harika',
    city: 'Visakhapatnam',
    quoteTitle: 'Mutual Respect and Shared Family Values',
    quoteText: 'The verified profiles and privacy features gave our parents immense confidence. When we spoke, our conversations naturally aligned with our family values and long-term vision.',
    fullStory: 'We connected over our mutual love for coastal Andhra traditions and shared professional passions. TeluguBandham gave us a safe, dignified space to meet and begin our new chapter.',
    image: '/assets/couples/story_vamsi_harika.jpg',
    weddingDate: 'Married Oct 2025',
    tag: 'SUCCESS STORY',
    isVerified: true,
    isDemo: true
  },
  {
    id: 'arjun-keerthi',
    names: 'Arjun and Keerthi',
    city: 'Warangal',
    quoteTitle: 'A Blessed Journey of Togetherness',
    quoteText: 'Our families met with open hearts after discovering our compatibility on TeluguBandham. It felt like destiny guided by shared Telugu traditions and genuine mutual respect.',
    fullStory: 'Finding someone from the same cultural background who understands family responsibilities was paramount. TeluguBandham made discovery respectful and genuine.',
    image: '/assets/couples/story_arjun_keerthi.jpg',
    weddingDate: 'Married Jan 2026',
    tag: 'SUCCESS STORY',
    isVerified: true,
    isDemo: true
  },
  {
    id: 'sai-divya',
    names: 'Sai and Divya',
    city: 'Tirupati',
    quoteTitle: 'A Beautiful Beginning Rooted in Trust',
    quoteText: 'From our first thoughtful message to celebrating our traditional wedding, every step was respectful, genuine, and blessed by our elders. TeluguBandham made it seamless.',
    fullStory: 'Our elders connected through the family contact feature after we found high compatibility. Today, we look back with immense gratitude for this authentic platform.',
    image: '/assets/couples/story_sai_divya.jpg',
    weddingDate: 'Married Feb 2026',
    tag: 'SUCCESS STORY',
    isVerified: true,
    isDemo: true
  }
];

// 6 Curated Homepage FAQ Questions (Full list available on /faqs)
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'How do I create a TeluguBandham profile?',
    answer: 'Click Create Profile and complete your basic details, preferences, education, profession and family information. You can build your profile step by step.'
  },
  {
    id: 'faq-2',
    question: 'Is profile verification required?',
    answer: 'TeluguBandham is designed around trusted profiles. Follow the verification process shown during profile creation to help establish authenticity and build confidence between members.'
  },
  {
    id: 'faq-3',
    question: 'How does TeluguBandham find compatible matches?',
    answer: 'Matches are based on the preferences and information you provide, including location, age, education, profession, family values and other compatibility factors.'
  },
  {
    id: 'faq-4',
    question: 'Can I choose who I want to connect with?',
    answer: 'Yes. You control your preferences and decide which profiles you want to explore and which connections you want to accept.'
  },
  {
    id: 'faq-5',
    question: 'Is my personal information private?',
    answer: "Your privacy is important. Personal information should only be shared according to your privacy settings and the platform's communication and security controls."
  },
  {
    id: 'faq-6',
    question: 'How does messaging work?',
    answer: 'Once a connection is mutually accepted, members can communicate through the available messaging features.'
  }
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeModalStory, setActiveModalStory] = useState(null);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [faqs, setFaqs] = useState(() => mockDb.getFAQs());
  const [heroBanner, setHeroBanner] = useState(() => mockDb.getHeroBanner());
  const [dbStories, setDbStories] = useState(() => mockDb.getStories());

  useEffect(() => {
    const handleContentUpdate = () => {
      setFaqs(mockDb.getFAQs());
      setHeroBanner(mockDb.getHeroBanner());
      setDbStories(mockDb.getStories());
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'faqs' || type === 'banner' || type === 'stories' || type === 'storage_sync') {
        handleContentUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handleContentUpdate);
    window.addEventListener('storage', handleContentUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handleContentUpdate);
      window.removeEventListener('storage', handleContentUpdate);
    };
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleSelectStory = (index) => {
    if (index === activeStoryIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStoryIndex(index);
      setIsTransitioning(false);
    }, 280);
  };

  const activeStory = DEMO_STORIES[activeStoryIndex];

  // 4 preview thumbnails as specified: Karthik & Ananya, Vamsi & Harika, Arjun & Keerthi, Sai & Divya
  const previewThumbnailIndices = [1, 2, 3, 4];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-grid">
            {/* Hero Content */}
            <div className="animate-fade-in hero-content-left">
              <h1 className="hero-headline">
                Where Telugu Traditions <span>Meet True Love</span>
              </h1>

              <p className="hero-subtitle">
                Discover meaningful connections with verified Telugu profiles, thoughtful preferences and compatibility-focused matching.
              </p>

              <div className="hero-cta-group">
                {isAuthenticated ? (
                  <Link to="/discover" className="btn btn-primary btn-lg">
                    Explore Matches <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      Create Free Profile
                    </Link>
                    <Link to="/discover" className="btn btn-secondary btn-lg">
                      Explore Matches <ArrowRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Responsive Couple Image (Renders Below Buttons on Mobile < 768px) */}
          <div className="hero-mobile-image-wrap">
            <img
              src="/assets/backgrounds/TeluguBandham_Hero_Couple_BG_4K.webp"
              alt="Telugu Bride and Groom in Traditional Wedding Attire"
              className="hero-mobile-couple-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 2. Premium Trust & Credibility Strip */}
      <section className="trust-strip-section">
        <div className="trust-strip-container">
          <div className="trust-strip-grid">
            {/* 1. Verified Profiles */}
            <div className="trust-strip-item">
              <div className="trust-strip-icon-box">
                <ShieldCheck size={24} />
              </div>
              <div className="trust-strip-content">
                <h3 className="trust-strip-title">Verified Profiles</h3>
                <p className="trust-strip-desc">Identity-focused profile verification</p>
              </div>
            </div>

            {/* 2. Telugu Community */}
            <div className="trust-strip-item">
              <div className="trust-strip-icon-box">
                <Users size={24} />
              </div>
              <div className="trust-strip-content">
                <h3 className="trust-strip-title">Telugu Community</h3>
                <p className="trust-strip-desc">Connections across Telugu regions</p>
              </div>
            </div>

            {/* 3. Privacy First */}
            <div className="trust-strip-item">
              <div className="trust-strip-icon-box">
                <Lock size={24} />
              </div>
              <div className="trust-strip-content">
                <h3 className="trust-strip-title">Privacy First</h3>
                <p className="trust-strip-desc">Your profile, your control</p>
              </div>
            </div>

            {/* 4. Meaningful Matches */}
            <div className="trust-strip-item">
              <div className="trust-strip-icon-box">
                <Heart size={24} />
              </div>
              <div className="trust-strip-content">
                <h3 className="trust-strip-title">Meaningful Matches</h3>
                <p className="trust-strip-desc">Compatibility-focused discovery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Redesigned Premium "How TeluguBandham Works" Section - 4 Steps */}
      <section className="how-section">
        {/* Subtle Decorative Line Art at Far Edges */}
        <div className="how-bg-decor how-bg-decor-left" aria-hidden="true"></div>
        <div className="how-bg-decor how-bg-decor-right" aria-hidden="true"></div>

        <div className="container-wide">
          {/* Header */}
          <div className="how-header-clean">
            <Link to="/how-it-works" className="how-eyebrow-pill" style={{ textDecoration: 'none' }}>
              HOW IT WORKS
            </Link>
            <h2 className="how-title-large">Your Journey to a Meaningful Match</h2>
            <p className="how-desc-subtitle">
              From creating your profile to finding someone who shares your values, TeluguBandham keeps the journey simple and personal.
            </p>
          </div>

          {/* 4-Step Connected Cards - Clicking any card or CTA navigates to /how-it-works */}
          <div className="how-cards-wrapper">
            {/* Step 1 */}
            <div className="how-step-item">
              <div className="how-card" onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }}>
                <div className="how-card-top-bar">
                  <span className="how-step-badge">01</span>
                  <span className="how-step-category">Step 1 • Profile</span>
                </div>

                <div className="how-visual-container">
                  {/* Step 1 Visual: Generic Profile Setup & Verification */}
                  <div className="step-visual-box step-visual-1">
                    <div className="phone-mockup">
                      <div className="phone-notch"></div>
                      <div className="phone-screen">
                        <div className="phone-user-header">
                          <div className="phone-avatar-circle">
                            <User size={16} color="#FFFFFF" />
                          </div>
                          <div className="phone-user-info">
                            <span className="phone-user-name">Profile Setup</span>
                            <span className="phone-user-status"><ShieldCheck size={10} color="#16A34A" /> Verified Profile</span>
                          </div>
                        </div>
                        <div className="phone-progress-wrap">
                          <div className="phone-progress-label"><span>Profile Details</span><span>Completed</span></div>
                          <div className="phone-progress-bar"><div className="phone-progress-fill"></div></div>
                        </div>
                        <div className="phone-tags-row">
                          <span className="phone-mini-tag">Family and Values</span>
                          <span className="phone-mini-tag">Preferences</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="how-card-body">
                  <h3 className="how-card-title">Create Your Profile</h3>
                  <p className="how-card-desc">
                    Tell us about yourself, your family, education, profession, values and partner preferences.
                  </p>
                  <Link to="/how-it-works" className="how-card-action" onClick={(e) => e.stopPropagation()}>
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Connector 1 -> 2 */}
              <div className="how-step-connector" aria-hidden="true">
                <div className="connector-line"></div>
                <div className="connector-arrow">
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="how-step-item">
              <div className="how-card" onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }}>
                <div className="how-card-top-bar">
                  <span className="how-step-badge">02</span>
                  <span className="how-step-category">Step 2 • Matchmaking</span>
                </div>

                <div className="how-visual-container">
                  {/* Step 2 Visual: Generic Matchmaking & Compatibility */}
                  <div className="step-visual-box step-visual-2">
                    <div className="match-cards-stack">
                      <div className="match-card-back"></div>
                      <div className="match-card-front">
                        <div className="match-card-header">
                          <div className="match-avatar-thumb">
                            <Heart size={13} color="#7A1635" />
                          </div>
                          <div className="match-info">
                            <span className="match-name">Telugu Match</span>
                            <span className="match-loc"><CheckCircle2 size={9} color="#16A34A" /> Verified Profile</span>
                          </div>
                          <div className="match-score-badge">
                            Compatibility
                          </div>
                        </div>
                        <div className="match-tags-row">
                          <span className="match-pill">Family Roots</span>
                          <span className="match-pill">Values Aligned</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="how-card-body">
                  <h3 className="how-card-title">Discover Your Matches</h3>
                  <p className="how-card-desc">
                    Explore compatible Telugu profiles based on your preferences, values, lifestyle and compatibility.
                  </p>
                  <Link to="/how-it-works" className="how-card-action" onClick={(e) => e.stopPropagation()}>
                    Explore Matches <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Connector 2 -> 3 */}
              <div className="how-step-connector" aria-hidden="true">
                <div className="connector-line"></div>
                <div className="connector-arrow">
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="how-step-item">
              <div className="how-card" onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }}>
                <div className="how-card-top-bar">
                  <span className="how-step-badge">03</span>
                  <span className="how-step-category">Step 3 • Connect</span>
                </div>

                <div className="how-visual-container">
                  {/* Step 3 Visual: Secure Messaging & Privacy Protected */}
                  <div className="step-visual-box step-visual-3">
                    <div className="connect-chat-container">
                      <div className="chat-bubble chat-bubble-left">
                        <span>Interest Expressed • Family and Values</span>
                      </div>
                      <div className="chat-bubble chat-bubble-right">
                        <span>Mutual Connection <Heart size={10} color="#FAF6F0" /></span>
                      </div>
                      <div className="connect-secure-tag">
                        <Lock size={11} color="#047857" /> <span>Privacy Protected • Secure Connect</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="how-card-body">
                  <h3 className="how-card-title">Connect Meaningfully</h3>
                  <p className="how-card-desc">
                    Express interest, connect when interest is mutual, and start meaningful conversations securely.
                  </p>
                  <Link to="/how-it-works" className="how-card-action" onClick={(e) => e.stopPropagation()}>
                    Start Connecting <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Connector 3 -> 4 */}
              <div className="how-step-connector" aria-hidden="true">
                <div className="connector-line"></div>
                <div className="connector-arrow">
                  <ArrowRight size={15} />
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="how-step-item">
              <div className="how-card" onClick={() => navigate('/how-it-works')} style={{ cursor: 'pointer' }}>
                <div className="how-card-top-bar">
                  <span className="how-step-badge">04</span>
                  <span className="how-step-category">Step 4 • Relationship</span>
                </div>

                <div className="how-visual-container">
                  {/* Step 4 Visual: Tasteful Telugu Couple & Meaningful Bond */}
                  <div className="step-visual-box step-visual-4">
                    <div className="step4-emblem-wrap">
                      <div className="step4-emblem-circle">
                        <div className="step4-couple-icon-group">
                          <div className="step4-icon-avatar step4-bride">👰</div>
                          <div className="step4-icon-heart">❤️</div>
                          <div className="step4-icon-avatar step4-groom">🤵</div>
                        </div>
                      </div>
                    </div>

                    <div className="step4-harmony-badge">
                      <span className="step4-badge-title">Two Families • One Journey</span>
                      <span className="step4-badge-sub">Rooted in Telugu Heritage and Trust</span>
                    </div>

                    <div className="step4-pillars-row">
                      <span className="step4-pillar">✓ Shared Values</span>
                      <span className="step4-pillar">✓ Family Blessings</span>
                      <span className="step4-pillar">✓ True Love</span>
                    </div>
                  </div>
                </div>

                <div className="how-card-body">
                  <h3 className="how-card-title">Build Your Future Together</h3>
                  <p className="how-card-desc">
                    Move from meaningful conversations toward a genuine relationship built on trust, shared values and family.
                  </p>
                  <Link to="/how-it-works" className="how-card-action" onClick={(e) => e.stopPropagation()}>
                    Begin Your Journey <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEW Success Stories Section (Directly after How It Works) */}
      <section className="stories-section" id="success-stories">
        <div className="container-wide">
          {/* Section Header */}
          <div className="stories-header-clean">
            <div className="stories-eyebrow-pill">
              REAL STORIES. MEANINGFUL CONNECTIONS.
            </div>
            <h2 className="stories-title-large">Stories That Began With TeluguBandham</h2>
            <p className="stories-desc-subtitle">
              Discover meaningful connections built on shared values, family traditions and compatibility.
            </p>
          </div>

          {/* Featured Story Card */}
          <div className={`featured-story-card ${isTransitioning ? 'story-transitioning' : ''}`}>
            {/* Story Details (Left Column on Desktop, Order 2 on Mobile) */}
            <div className="featured-story-content">
              <div className="featured-story-tag-row">
                <span className="featured-story-tag">{activeStory.tag}</span>
              </div>

              <h3 className="featured-story-title">"{activeStory.quoteTitle}"</h3>

              <p className="featured-story-quote">
                "{activeStory.quoteText}"
              </p>

              <div className="featured-story-author">
                <span className="featured-author-names">{activeStory.names}</span>
                <div className="featured-author-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={13} color="#7A1635" /> {activeStory.city}
                  </span>
                  <span className="verified-story-badge">
                    <ShieldCheck size={13} /> Verified Success Story
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-story-read"
                onClick={() => setActiveModalStory(activeStory)}
                aria-label={`Read full story of ${activeStory.names}`}
              >
                Read Their Story <ArrowRight size={15} />
              </button>
            </div>

            {/* Couple Image (Right Column on Desktop, Order 1 on Mobile) */}
            <div className="featured-story-image-wrap">
              <img
                src={activeStory.image}
                alt={`Telugu Couple ${activeStory.names}`}
                className="featured-story-img"
                loading="lazy"
              />
            </div>
          </div>

          {/* Story Thumbnails Preview Selector */}
          <div className="stories-thumbnails-container">
            <div className="stories-thumbnails-grid" role="tablist" aria-label="Success story previews">
              {previewThumbnailIndices.map((idx) => {
                const story = DEMO_STORIES[idx];
                const isActive = activeStoryIndex === idx;
                return (
                  <button
                    key={story.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`story-thumb-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectStory(idx)}
                  >
                    <img
                      src={story.image}
                      alt={story.names}
                      className="story-thumb-img"
                      loading="lazy"
                    />
                    <div className="story-thumb-info">
                      <span className="story-thumb-names">{story.names}</span>
                      <span className="story-thumb-city">{story.city}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA for Stories Section (Only visible when user is not logged in) */}
          {!isAuthenticated && (
            <div className="stories-bottom-cta">
              <h3 className="stories-bottom-cta-title">Your Story Could Be Next</h3>
              <p className="stories-bottom-cta-desc">
                Create your TeluguBandham profile and take the first step toward a meaningful connection.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Profile <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 5. Professional FAQ Accordion Section (Directly after Success Stories) */}
      <section className="faq-section" id="faq" aria-labelledby="faq-main-heading">
        <div className="container-wide">
          {/* Section Header */}
          <div className="faq-header-clean">
            <h2 className="faq-title-large" id="faq-main-heading">
              Frequently Asked Questions
            </h2>
            <p className="faq-desc-subtitle">
              Everything you need to know about creating your profile, finding meaningful matches, and connecting safely.
            </p>
          </div>

          {/* Accordion Container */}
          <div className="faq-accordion-container" role="region" aria-label="Frequently Asked Questions">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`faq-item-card ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, textAlign: 'left' }}>
                      {faq.category && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--color-primary-light, rgba(122, 22, 53, 0.08))', color: 'var(--color-primary, #7A1635)' }}>
                          {faq.category}
                        </span>
                      )}
                      <span className="faq-question-text">{faq.question}</span>
                    </div>
                    <div className="faq-icon-indicator" aria-hidden="true">
                      <ChevronDown size={17} />
                    </div>
                  </button>

                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                    className={`faq-answer-collapse ${isOpen ? 'show' : ''}`}
                  >
                    <div className="faq-answer-inner">
                      <p className="faq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All FAQs Link */}
          <div className="faq-view-all-wrap">
            <Link to="/faqs" className="faq-view-all-link">
              View All Frequently Asked Questions <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. TELUGUBANDHAM MOBILE APP DOWNLOAD SECTION (CLEAN & UNBOXED) */}
      <section className="app-download-section" id="app-download" aria-labelledby="app-download-heading">
        <div className="container-wide">
          <div className="app-download-grid">
            {/* Left Content Column */}
            <div className="app-download-content">
              <div className="app-download-eyebrow">
                TELUGUBANDHAM ON MOBILE
              </div>

              <h2 className="app-download-title" id="app-download-heading">
                Your Search for a Meaningful Match, Wherever You Go
              </h2>

              <p className="app-download-desc">
                Explore compatible Telugu profiles, stay connected and manage your journey from the TeluguBandham mobile experience.
              </p>

              {/* Official Store Badges Group */}
              <div className="app-stores-row">
                {/* Google Play Official Badge */}
                <button
                  type="button"
                  className="store-badge-official"
                  onClick={() => {
                    alert("TeluguBandham Android App is currently in final testing. Continue on Web to explore matches and connect!");
                  }}
                  aria-label="Get it on Google Play"
                >
                  <svg className="store-badge-icon" viewBox="0 0 24 26" width="23" height="25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M0.999756 1.45825C0.679756 1.80825 0.499756 2.34825 0.499756 3.03825V22.9583C0.499756 23.6483 0.679756 24.1883 0.999756 24.5383L1.07976 24.6083L12.2398 13.4483V12.5483L1.07976 1.38825L0.999756 1.45825Z" fill="url(#tb_gp_blue)"/>
                    <path d="M15.9598 17.1683L12.2398 13.4483V12.5483L15.9598 8.82825L16.0398 8.87825L20.4498 11.3883C21.7098 12.0983 21.7098 13.2783 20.4498 13.9983L16.0398 16.5083L15.9598 17.1683Z" fill="url(#tb_gp_yellow)"/>
                    <path d="M16.0398 17.1183L12.2398 13.3183L0.999756 24.5583C1.41976 25.0083 2.11976 25.0683 2.91976 24.6183L16.0398 17.1183Z" fill="url(#tb_gp_red)"/>
                    <path d="M16.0398 8.87825L2.91976 1.37825C2.11976 0.928247 1.41976 0.988247 0.999756 1.43825L12.2398 12.6783L16.0398 8.87825Z" fill="url(#tb_gp_green)"/>
                    <defs>
                      <linearGradient id="tb_gp_blue" x1="11.2" y1="2.2" x2="-2.6" y2="16.1" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00A0FF"/>
                        <stop offset="0.26" stopColor="#00BEFF"/>
                        <stop offset="0.51" stopColor="#00D2FF"/>
                        <stop offset="0.76" stopColor="#00DFFF"/>
                        <stop offset="1" stopColor="#00E3FF"/>
                      </linearGradient>
                      <linearGradient id="tb_gp_yellow" x1="22.1" y1="13" x2="-0.3" y2="13" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFE000"/>
                        <stop offset="0.41" stopColor="#FFBD00"/>
                        <stop offset="0.78" stopColor="#FFA500"/>
                        <stop offset="1" stopColor="#FF9C00"/>
                      </linearGradient>
                      <linearGradient id="tb_gp_red" x1="14.3" y1="15.2" x2="-7.6" y2="37.2" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF3A44"/>
                        <stop offset="1" stopColor="#C31162"/>
                      </linearGradient>
                      <linearGradient id="tb_gp_green" x1="-1.6" y1="-8.4" x2="9.8" y2="3.1" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#32A071"/>
                        <stop offset="0.48" stopColor="#15CF74"/>
                        <stop offset="0.8" stopColor="#06E775"/>
                        <stop offset="1" stopColor="#00F076"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="store-badge-text">
                    <span className="store-badge-subtext">GET IT ON</span>
                    <span className="store-badge-title">Google Play</span>
                  </div>
                </button>

                {/* Apple App Store Official Badge */}
                <button
                  type="button"
                  className="store-badge-official"
                  onClick={() => {
                    alert("TeluguBandham iOS App is currently in final testing. Continue on Web to explore matches and connect!");
                  }}
                  aria-label="Download on the App Store"
                >
                  <svg className="store-badge-icon apple-icon" viewBox="0 0 384 512" width="20" height="24" fill="#000000" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#000000" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                  </svg>
                  <div className="store-badge-text">
                    <span className="store-badge-subtext apple">Download on the</span>
                    <span className="store-badge-title apple">App Store</span>
                  </div>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="app-trust-pills-row">
                <span className="app-trust-pill"><CheckCircle2 size={14} color="#16A34A" /> Secure</span>
                <span className="app-trust-bullet">•</span>
                <span className="app-trust-pill"><Lock size={14} color="#7A1635" /> Private</span>
                <span className="app-trust-bullet">•</span>
                <span className="app-trust-pill"><CheckCircle2 size={14} color="#C9A24A" /> Easy to Use</span>
              </div>
            </div>

            {/* Right Phone Mockup Column */}
            <div className="app-download-visual">
              <div className="app-phone-glow-bg" aria-hidden="true"></div>
              <div className="phone-device-frame">
                <div className="phone-device-notch"></div>

                {/* Inner Mobile Screen Content */}
                <div className="phone-screen-content">
                  {/* In-App Header */}
                  <div className="app-screen-header">
                    <div className="app-screen-brand">
                      <span className="brand-dot"></span> TeluguBandham
                    </div>
                    <div className="app-screen-status">
                      <span className="verified-mini-badge"><ShieldCheck size={10} /> Verified</span>
                    </div>
                  </div>

                  {/* App Screen Subtitle */}
                  <div className="app-screen-subheading">
                    <span>Matches For You</span>
                    <span className="app-badge-active">Online</span>
                  </div>

                  {/* Profile Card Mockup */}
                  <div className="app-profile-card">
                    <div className="app-profile-avatar-wrap">
                      <img
                        src="/assets/couples/story_rahul_sravani.jpg"
                        alt="Telugu Profile Preview"
                        className="app-profile-avatar-img"
                      />
                      <div className="app-compat-chip">
                        94% Match
                      </div>
                    </div>

                    <div className="app-profile-details">
                      <div className="app-profile-name-row">
                        <span className="app-profile-name">Sravani R., 26</span>
                        <CheckCircle2 size={13} color="#16A34A" />
                      </div>
                      <span className="app-profile-occ">Software Engineer • Hyderabad</span>
                      <div className="app-profile-tags">
                        <span className="app-mini-tag">Telugu</span>
                        <span className="app-mini-tag">Family Values</span>
                        <span className="app-mini-tag">Guntur Roots</span>
                      </div>
                    </div>

                    <div className="app-card-actions">
                      <button type="button" className="app-action-btn app-btn-connect">
                        <Heart size={13} /> Connect
                      </button>
                      <button type="button" className="app-action-btn app-btn-msg">
                        <MessageCircle size={13} /> Chat
                      </button>
                    </div>
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="app-bottom-nav">
                    <div className="app-nav-item active"><Heart size={14} /><span>Discover</span></div>
                    <div className="app-nav-item"><Users size={14} /><span>Matches</span></div>
                    <div className="app-nav-item"><MessageCircle size={14} /><span>Chat</span></div>
                    <div className="app-nav-item"><User size={14} /><span>Profile</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Full Modal */}
      {activeModalStory && (
        <div className="story-modal-overlay" onClick={() => setActiveModalStory(null)}>
          <div className="story-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="story-modal-close-btn"
              onClick={() => setActiveModalStory(null)}
              aria-label="Close story modal"
            >
              <X size={18} />
            </button>
            <img
              src={activeModalStory.image}
              alt={activeModalStory.names}
              className="story-modal-img"
            />
            <div className="story-modal-body">
              <div className="featured-story-tag-row">
                <span className="featured-story-tag">{activeModalStory.tag}</span>
                <span className="verified-story-badge"><ShieldCheck size={13} /> Verified Success Story</span>
              </div>
              <h3 className="featured-story-title" style={{ fontSize: '1.45rem', marginBottom: '0.75rem' }}>
                "{activeModalStory.quoteTitle}"
              </h3>
              <p style={{ fontStyle: 'italic', color: '#4A444C', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                "{activeModalStory.quoteText}"
              </p>
              <p style={{ color: '#29242A', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {activeModalStory.fullStory}
              </p>
              <div className="featured-story-author" style={{ marginBottom: '1.25rem' }}>
                <span className="featured-author-names">{activeModalStory.names}</span>
                <span style={{ fontSize: '0.85rem', color: '#665E68' }}>{activeModalStory.city} • {activeModalStory.weddingDate}</span>
              </div>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setActiveModalStory(null)}
              >
                Find Your Match on TeluguBandham <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
