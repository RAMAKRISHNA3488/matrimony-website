import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Quote,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import '../../styles/pages.css';

// 6 Curated Demo Success Stories
const DEMO_SUCCESS_STORIES = [
  {
    id: 'story-1',
    coupleName: 'Rahul and Sravani',
    city: 'Hyderabad, Telangana',
    photo: '/assets/couples/story_rahul_sravani.jpg',
    title: 'From a Meaningful Match to a Lifetime Together',
    excerpt: 'TeluguBandham helped us find someone who shared our values, family traditions and vision for the future. What started as a simple connection became something truly special.',
    fullStory: 'Both of our families were looking for a grounded and culturally compatible alliance in Hyderabad. We connected in April 2025 on TeluguBandham, discovered our shared love for Telugu traditions and tech careers, and our families celebrated our engagement in Jubilee Hills. The verified profiles and honest communication made our journey effortless.',
    quote: 'TeluguBandham gave us genuine verified profiles where we could speak honestly about our values and dreams.',
    weddingDate: 'December 2025',
    community: 'Telugu Community • Hyderabad'
  },
  {
    id: 'story-2',
    coupleName: 'Karthik and Ananya',
    city: 'Vijayawada, Andhra Pradesh',
    photo: '/assets/couples/story_karthik_ananya.jpg',
    title: 'Shared Values and Cherished Family Traditions',
    excerpt: 'Finding someone who respects our roots while embracing future ambitions was our top priority. TeluguBandham made discovery natural and effortless.',
    fullStory: 'Connecting across the Krishna district, our parents bonded immediately over shared family principles and cultural outlook. TeluguBandham’s district filters and detailed family background verification gave both our families 100% peace of mind. Within four months, we celebrated our traditional Telugu wedding surrounded by loved ones.',
    quote: 'Finding someone with matching lifestyle and cultural harmony felt so natural and comforting.',
    weddingDate: 'November 2025',
    community: 'Telugu Community • Vijayawada'
  },
  {
    id: 'story-3',
    coupleName: 'Vamsi and Harika',
    city: 'Visakhapatnam, Andhra Pradesh',
    photo: '/assets/couples/story_vamsi_harika.jpg',
    title: 'Bridging Distance with Genuine Cultural Harmony',
    excerpt: 'Living in different cities seemed challenging until TeluguBandham’s verified compatibility engine matched our preferences and family outlook.',
    fullStory: 'Our initial interest request turned into heartfelt weekend conversations about life goals, traditions, and family values. When our families met in Visakhapatnam, the connection was instant. TeluguBandham made bridging geographic distance feel completely seamless.',
    quote: 'The detailed background verification and secure connect gave both our families complete peace of mind.',
    weddingDate: 'January 2026',
    community: 'Telugu Community • Visakhapatnam'
  },
  {
    id: 'story-4',
    coupleName: 'Arjun and Keerthi',
    city: 'Tirupati, Andhra Pradesh',
    photo: '/assets/couples/story_arjun_keerthi.jpg',
    title: 'Rooted in Telugu Culture, Built for the Future',
    excerpt: 'TeluguBandham’s verified Telugu profiles made finding someone with identical family ethics and life priorities a joyous experience.',
    fullStory: 'Our families were introduced through TeluguBandham’s personalized community recommendations. From the first conversation, our shared devotion to Telugu culture and individual aspirations aligned perfectly. We tied the knot in Tirupati with blessings from both families.',
    quote: 'TeluguBandham made discovering someone who respects tradition while encouraging ambitions effortless.',
    weddingDate: 'February 2026',
    community: 'Telugu Community • Tirupati'
  },
  {
    id: 'story-5',
    coupleName: 'Sai and Divya',
    city: 'Warangal, Telangana',
    photo: '/assets/couples/story_sai_divya.jpg',
    title: 'Honest Conversations and A Blessed Union',
    excerpt: 'Transparent biodata details and prompt responsiveness allowed us to take confident steps forward from day one.',
    fullStory: 'We both valued honesty, traditional family upbringing, and strong professional focus. TeluguBandham’s platform enabled transparent, safe interactions. Our families connected with mutual respect and joy, leading to our beautiful marriage celebration in Warangal.',
    quote: 'Verified accounts and authentic family details made our decision clear and worry-free.',
    weddingDate: 'January 2026',
    community: 'Telugu Community • Warangal'
  },
  {
    id: 'story-6',
    coupleName: 'Naveen and Pranavi',
    city: 'Bengaluru, Karnataka',
    photo: '/assets/couples/Success_Story_06.jpg',
    title: 'Modern Ambitions with Traditional Family Ties',
    excerpt: 'Finding a partner who shares both professional ambitions and traditional Telugu family warmth was everything we hoped for.',
    fullStory: 'Working in tech in Bengaluru, we wanted a life partner with common Telugu roots and modern outlook. TeluguBandham’s career and lifestyle preferences helped us connect smoothly. Today, we are happily building our future together with deep gratitude to the platform.',
    quote: 'TeluguBandham bridged the modern urban lifestyle with timeless Telugu family values.',
    weddingDate: 'October 2025',
    community: 'Telugu Community • Bengaluru'
  }
];

export default function SuccessStories() {
  const { isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const [rawStories, setRawStories] = useState(() => mockDb.getStories() || []);

  // Real-time synchronization for stories
  useEffect(() => {
    const handleUpdate = () => {
      setRawStories(mockDb.getStories() || []);
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'stories' || type === 'storage_sync') {
        handleUpdate();
      }
    });

    window.addEventListener('telugubandham_content_updated', handleUpdate);
    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_content_updated', handleUpdate);
    };
  }, []);

  const stories = useMemo(() => {
    const list = Array.isArray(rawStories) && rawStories.length > 0 ? rawStories : DEMO_SUCCESS_STORIES;
    return list.map((s) => ({
      ...s,
      city: s.city || s.location || 'Hyderabad, Telangana',
      title: s.title || `A Beautiful Journey: ${s.coupleName}`,
      excerpt: s.excerpt || s.quote || (s.story ? s.story.slice(0, 140) + '...' : 'A blessed match on TeluguBandham.'),
      fullStory: s.fullStory || s.story || s.excerpt || '',
      quote: s.quote || 'TeluguBandham brought us together with authentic verified matchmaking.',
      photo: s.photo || '/assets/couples/Success_Story_01.jpg',
      weddingDate: s.weddingDate || '2025'
    }));
  }, [rawStories]);

  const activeStory = stories[activeIndex] || stories[0] || DEMO_SUCCESS_STORIES[0];

  const handleSelectStory = (index) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 180);
  };

  const handlePrev = React.useCallback(() => {
    if (isTransitioning || stories.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 180);
  }, [isTransitioning, stories.length]);

  const handleNext = React.useCallback(() => {
    if (isTransitioning || stories.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 180);
  }, [isTransitioning, stories.length]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedStory) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedStory, handlePrev, handleNext]);

  return (
    <div className="success-page-wrapper">
      {/* 1. Success Stories Hero Section */}
      <section className="success-hero-section">
        {/* Subtle Decorative Corner Line Art */}
        <div className="success-bg-decor success-bg-decor-left" aria-hidden="true"></div>
        <div className="success-bg-decor success-bg-decor-right" aria-hidden="true"></div>

        <div className="success-container">
          <div className="success-hero-header">
            <span className="success-eyebrow-pill">REAL STORIES, REAL CONNECTIONS</span>
            <h1 className="success-hero-title">Love Stories That Started With TeluguBandham</h1>
            <p className="success-hero-desc">
              Every meaningful match has a story. Discover couples who found companionship, shared values and a future together through TeluguBandham.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Unified Featured Success Story Showcase Component */}
      <section className="featured-story-section">
        <div className="success-container">
          <div className={`unified-story-showcase ${isTransitioning ? 'showcase-transitioning' : ''}`}>
            {/* Top Stage: Active Story & Photo */}
            <div className="showcase-main-stage">
              {/* Left Column: Story Details */}
              <div className="showcase-content-panel">
                <div className="showcase-badge-row">
                  <span className="featured-pill-tag">
                    <Heart size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                    FEATURED SUCCESS STORY
                  </span>
                  <span className="showcase-counter-tag">
                    {activeIndex + 1} of {stories.length}
                  </span>
                </div>

                <h2 className="showcase-story-title">{activeStory.title}</h2>

                <p className="showcase-story-text">"{activeStory.excerpt}"</p>

                <div className="showcase-couple-meta">
                  <div className="showcase-couple-names">{activeStory.coupleName}</div>
                  <div className="showcase-couple-location">
                    <MapPin size={13} className="location-icon" />
                    <span>{activeStory.city}</span>
                    <span className="meta-separator">•</span>
                    <Calendar size={12} className="calendar-icon" />
                    <span>{activeStory.weddingDate}</span>
                  </div>
                </div>

                <div className="showcase-action-row">
                  <button
                    type="button"
                    className="showcase-read-btn"
                    onClick={() => setSelectedStory(activeStory)}
                    aria-label={`Read full story of ${activeStory.coupleName}`}
                  >
                    Read Their Story <ArrowRight size={15} />
                  </button>

                  <div className="showcase-stage-nav">
                    <button
                      type="button"
                      className="stage-arrow-btn"
                      onClick={handlePrev}
                      aria-label="Previous story"
                      title="Previous story"
                    >
                      <ArrowLeft size={15} />
                    </button>
                    <button
                      type="button"
                      className="stage-arrow-btn"
                      onClick={handleNext}
                      aria-label="Next story"
                      title="Next story"
                    >
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Couple Image */}
              <div className="showcase-image-panel">
                <img
                  src={activeStory.photo}
                  alt={`${activeStory.coupleName} - TeluguBandham Success Story`}
                  className="showcase-main-img"
                  loading="eager"
                />
                <div className="showcase-img-overlay">
                  <span className="img-couple-label">{activeStory.coupleName}</span>
                  <span className="img-city-label">{activeStory.city}</span>
                </div>
              </div>
            </div>

            {/* Bottom Shelf: Integrated Thumbnail Selector Bar */}
            <div className="showcase-shelf-bar" aria-label="Success Stories Selector">
              <div className="shelf-header">
                <span className="shelf-title">Select a Success Story</span>
              </div>

              <div className="showcase-thumbnails-grid">
                {stories.map((story, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={story.id}
                      type="button"
                      className={`showcase-thumb-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectStory(index)}
                      aria-label={`Select story of ${story.coupleName} from ${story.city}`}
                      aria-pressed={isActive}
                    >
                      <div className="showcase-thumb-media">
                        <img src={story.photo} alt={story.coupleName} className="showcase-thumb-img" />
                      </div>
                      <div className="showcase-thumb-meta">
                        <span className="showcase-thumb-name">{story.coupleName}</span>
                        <span className="showcase-thumb-city">{story.city.split(',')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. More Stories Grid */}
      <section className="more-stories-section">
        <div className="success-container">
          <div className="more-stories-header">
            <span className="more-eyebrow">INSPIRING JOURNEYS</span>
            <h2 className="more-stories-title">More Stories of Togetherness</h2>
            <p className="more-stories-desc">
              Discover how couples from all Telugu regions found true companionship through mutual trust and shared values.
            </p>
          </div>

          <div className="stories-grid-container">
            {stories.map((story, index) => (
              <div key={`grid-${story.id}`} className="story-grid-card">
                <div className="grid-card-media">
                  <img
                    src={story.photo}
                    alt={`${story.coupleName} - TeluguBandham`}
                    className="grid-card-img"
                    loading="lazy"
                  />
                </div>

                <div className="grid-card-body">
                  <div className="grid-card-header">
                    <h3 className="grid-couple-name">{story.coupleName}</h3>
                    <div className="grid-location">
                      <MapPin size={13} className="location-icon" />
                      <span>{story.city}</span>
                    </div>
                  </div>

                  <p className="grid-story-snippet">"{story.excerpt}"</p>

                  <div className="grid-card-footer">
                    <button
                      type="button"
                      className="grid-read-link"
                      onClick={() => setSelectedStory(story)}
                      aria-label={`Read story of ${story.coupleName}`}
                    >
                      Read Story <ArrowRight size={14} />
                    </button>
                    <span className="grid-community-tag">{story.weddingDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA Section (Only visible when user is not logged in) */}
      {!isAuthenticated && (
        <section className="success-cta-section">
          <div className="success-container">
            <div className="success-cta-box">
              <h2 className="success-cta-title">Your Story Could Be Next</h2>
              <p className="success-cta-desc">
                Create your TeluguBandham profile and take the first step toward a meaningful connection.
              </p>
              <div className="success-cta-buttons">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Free Profile
                </Link>
                <Link to="/discover" className="btn btn-secondary btn-lg">
                  Explore Matches <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Story Details Modal */}
      {selectedStory && (
        <div className="story-modal-overlay" onClick={() => setSelectedStory(null)} role="dialog" aria-modal="true">
          <div className="story-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedStory(null)}
              aria-label="Close story modal"
            >
              <X size={20} />
            </button>

            <div className="modal-hero-image">
              <img src={selectedStory.photo} alt={selectedStory.coupleName} />
              <div className="modal-image-caption">
                <span className="modal-couple-name">{selectedStory.coupleName}</span>
                <span className="modal-location">
                  <MapPin size={13} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                  {selectedStory.city}
                </span>
              </div>
            </div>

            <div className="modal-body-content">
              <div className="modal-badge-row">
                <span className="featured-pill-tag">
                  <Heart size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                  SUCCESS STORY
                </span>
                <span className="modal-date-badge">
                  <Calendar size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }} />
                  {selectedStory.weddingDate}
                </span>
              </div>

              <h3 className="modal-story-title">{selectedStory.title}</h3>

              <div className="modal-quote-box">
                <p className="modal-quote-text">"{selectedStory.quote}"</p>
              </div>

              <div className="modal-text-block">
                <h4 className="modal-subheading">Their Journey</h4>
                <p>{selectedStory.fullStory}</p>
              </div>

              <div className="modal-footer-action">
                <Link to="/register" className="btn btn-primary w-full" onClick={() => setSelectedStory(null)}>
                  Begin Your Own Story <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
