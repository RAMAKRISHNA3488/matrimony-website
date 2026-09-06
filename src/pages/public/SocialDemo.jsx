import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ArrowLeft,
  Heart,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
  Users,
  Search,
  Grid,
  Bookmark,
  Bell,
  Play,
  ShieldCheck,
  Building,
  MapPin,
  Home,
  Compass,
  Film,
  Send,
  PlusSquare,
  Menu,
  Tv,
  Store,
  Share2,
  MoreHorizontal,
  Clock,
  ThumbsDown,
  Video,
  ListFilter,
  Sparkles,
  Flame,
  Radio
} from 'lucide-react';
import '../../styles/pages.css';

export default function SocialDemo() {
  const { platform = 'instagram' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  const toggleLike = (id) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReturn = (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const currentPlatform = platform.toLowerCase();

  return (
    <div className={`social-fullscreen-wrapper ${currentPlatform}-theme`}>
      {/* Top Demo Bar */}
      <header className="social-demo-topbar">
        <div className="demo-topbar-left">
          <button
            type="button"
            onClick={handleReturn}
            className="demo-back-link"
            aria-label="Return to previous page"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Return to TeluguBandham</span>
          </button>
          <span className="demo-badge">Official Social Media Profile Demo</span>
        </div>
        <div className="demo-topbar-right">
          <span
            className={`platform-pill active ${
              currentPlatform === 'instagram'
                ? 'ig'
                : currentPlatform === 'facebook'
                ? 'fb'
                : 'yt'
            }`}
          >
            {currentPlatform === 'instagram'
              ? 'Instagram'
              : currentPlatform === 'facebook'
              ? 'Facebook'
              : 'YouTube'}
          </span>
        </div>
      </header>

      {/* =========================================================================
          1. FULL-SCREEN INSTAGRAM DEMO
          ========================================================================= */}
      {currentPlatform === 'instagram' && (
        <div className="ig-fullscreen-app">
          {/* Left Sidebar */}
          <aside className="ig-fullscreen-sidebar">
            <div className="ig-sidebar-logo">
              <span className="ig-script-logo">Instagram</span>
            </div>
            <nav className="ig-sidebar-nav">
              <div className="ig-nav-item"><Home size={22} /> <span>Home</span></div>
              <div className="ig-nav-item"><Search size={22} /> <span>Search</span></div>
              <div className="ig-nav-item"><Compass size={22} /> <span>Explore</span></div>
              <div className="ig-nav-item"><Film size={22} /> <span>Reels</span></div>
              <div className="ig-nav-item"><Send size={22} /> <span>Messages</span></div>
              <div className="ig-nav-item"><Heart size={22} /> <span>Notifications</span></div>
              <div className="ig-nav-item"><PlusSquare size={22} /> <span>Create</span></div>
              <div className="ig-nav-item active">
                <img
                  src="/assets/branding/TeluguBandham_Logo_Primary.png"
                  alt="Profile"
                  className="ig-nav-avatar"
                />
                <span>Profile</span>
              </div>
            </nav>
            <div className="ig-sidebar-bottom">
              <div className="ig-nav-item"><Menu size={22} /> <span>More</span></div>
            </div>
          </aside>

          {/* Main Profile Canvas */}
          <main className="ig-fullscreen-main">
            <div className="ig-content-container">
              {/* Header Profile Info */}
              <div className="ig-header-layout">
                <div className="ig-avatar-column">
                  <div className="ig-story-ring">
                    <img
                      src="/assets/branding/TeluguBandham_Logo_Primary.png"
                      alt="TeluguBandham Profile"
                      className="ig-main-avatar"
                    />
                  </div>
                </div>

                <div className="ig-info-column">
                  <div className="ig-user-action-row">
                    <h1 className="ig-user-handle">telugubandham.official</h1>
                    <span className="ig-blue-check" title="Verified Account">✓</span>
                    <div className="ig-btn-group">
                      <button
                        type="button"
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`ig-primary-action-btn ${isFollowing ? 'following' : ''}`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <Link to="/register" className="ig-secondary-action-btn">
                        Create Profile
                      </Link>
                      <button type="button" className="ig-icon-action-btn"><MoreHorizontal size={18} /></button>
                    </div>
                  </div>

                  <ul className="ig-stats-list">
                    <li><strong>328</strong> posts</li>
                    <li><strong>48.6K</strong> followers</li>
                    <li><strong>112</strong> following</li>
                  </ul>

                  <div className="ig-bio-section">
                    <h2 className="ig-display-name">TeluguBandham — Matrimonial Sanctuary</h2>
                    <p className="ig-bio-lines">
                      💍 Sacred Matrimonial Sanctuary for Telugu Brides and Grooms<br />
                      🌸 Celebrating Telugu Traditions, Gothrams and Family Lineage<br />
                      🔒 Verified Profiles • 100% Privacy First Matchmaking<br />
                      📍 Hyderabad • Vizag • Vijayawada • Bangalore • USA • Worldwide
                    </p>
                    <a href="https://telugubandham.com" className="ig-bio-url" target="_blank" rel="noreferrer">
                      🔗 telugubandham.com/register
                    </a>
                  </div>
                </div>
              </div>

              {/* Story Highlights */}
              <div className="ig-highlights-carousel">
                {[
                  { title: 'Success', icon: '💖' },
                  { title: 'Traditions', icon: '🏛️' },
                  { title: 'Safety', icon: '🔒' },
                  { title: 'Telugu Brides', icon: '💍' },
                  { title: 'Telugu Grooms', icon: '🤵' },
                  { title: 'Events', icon: '🌟' },
                  { title: 'Reviews', icon: '✨' },
                ].map((item, i) => (
                  <div key={i} className="ig-highlight-node">
                    <div className="ig-highlight-ring">
                      <span className="ig-highlight-emoji">{item.icon}</span>
                    </div>
                    <span className="ig-highlight-title">{item.title}</span>
                  </div>
                ))}
              </div>

              {/* Tab Navigation */}
              <div className="ig-tab-bar">
                <button
                  type="button"
                  className={`ig-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  <Grid size={13} /> <span>POSTS</span>
                </button>
                <button
                  type="button"
                  className={`ig-tab-btn ${activeTab === 'reels' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reels')}
                >
                  <Film size={13} /> <span>REELS</span>
                </button>
                <button
                  type="button"
                  className={`ig-tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Bookmark size={13} /> <span>SAVED</span>
                </button>
              </div>

              {/* Post Grid */}
              <div className="ig-grid-container">
                {[
                  { id: 1, img: '/assets/couples/story_karthik_ananya.jpg', caption: 'Karthik and Ananya: Two families, one beautiful Telugu union. ❤️', likes: '1,420', comments: '64' },
                  { id: 2, img: '/assets/couples/story_rahul_sravani.jpg', caption: 'Rooted in Andhra and Telangana traditions. Find your life partner with TeluguBandham.', likes: '2,890', comments: '112' },
                  { id: 3, img: '/assets/couples/story_sai_divya.jpg', caption: 'From first conversation to lifelong companionship. 🌸', likes: '3,110', comments: '98' },
                  { id: 4, img: '/assets/couples/story_vamsi_harika.jpg', caption: 'Vedic harmony, mutual respect and shared dreams.', likes: '1,980', comments: '45' },
                  { id: 5, img: '/assets/couples/story_arjun_keerthi.jpg', caption: 'Global Telugu community connecting across Hyderabad and USA. 💍', likes: '2,450', comments: '78' },
                  { id: 6, img: '/assets/couples/story_rohit_meghana.jpg', caption: 'Every sacred journey begins with a verified, meaningful introduction.', likes: '1,760', comments: '53' },
                ].map((post) => (
                  <div key={post.id} className="ig-grid-cell">
                    <img src={post.img} alt={post.caption} className="ig-cell-img" loading="lazy" />
                    <div className="ig-cell-overlay">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        className="ig-overlay-metric"
                      >
                        <Heart size={18} fill={likedPosts[post.id] ? '#FF3040' : '#FFFFFF'} />
                        <span>{likedPosts[post.id] ? parseInt(post.likes.replace(',', '')) + 1 : post.likes}</span>
                      </button>
                      <div className="ig-overlay-metric">
                        <MessageCircle size={18} fill="#FFFFFF" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instagram Footer */}
              <footer className="ig-site-footer">
                <div className="ig-footer-links">
                  <span>Meta</span>
                  <span>About</span>
                  <span>Blog</span>
                  <span>Jobs</span>
                  <span>Help</span>
                  <span>API</span>
                  <span>Privacy</span>
                  <span>Terms</span>
                  <span>Locations</span>
                  <span>Instagram Lite</span>
                  <span>Threads</span>
                </div>
                <div className="ig-footer-copy">
                  © 2026 Instagram from Meta • TeluguBandham Official Account
                </div>
              </footer>
            </div>
          </main>
        </div>
      )}

      {/* =========================================================================
          2. FULL-SCREEN FACEBOOK DEMO
          ========================================================================= */}
      {currentPlatform === 'facebook' && (
        <div className="fb-fullscreen-app">
          {/* Top FB Header */}
          <header className="fb-global-header">
            <div className="fb-header-left">
              <div className="fb-circle-logo">f</div>
              <div className="fb-search-input-wrap">
                <Search size={15} />
                <input type="text" placeholder="Search Facebook" readOnly />
              </div>
            </div>
            <div className="fb-header-center">
              <div className="fb-center-tab active"><Home size={22} /></div>
              <div className="fb-center-tab"><Users size={22} /></div>
              <div className="fb-center-tab"><Tv size={22} /></div>
              <div className="fb-center-tab"><Store size={22} /></div>
            </div>
            <div className="fb-header-right">
              <Link to="/register" className="fb-top-cta">Sign Up Free</Link>
            </div>
          </header>

          <div className="fb-scroll-body">
            {/* Top Hero Card (Full Width Background with Centered Content) */}
            <div className="fb-top-hero-card">
              <div className="fb-hero-inner">
                {/* Cover Banner */}
                <div className="fb-full-cover">
                  <div className="fb-cover-overlay">
                    <span className="fb-cover-eyebrow">TELUGU MATRIMONIAL PLATFORM</span>
                    <h1 className="fb-cover-title">Traditional Values. Modern Matchmaking.</h1>
                    <p className="fb-cover-desc">Connecting Telugu Families Worldwide with Trust and Reverence</p>
                  </div>
                </div>

                {/* Profile Identity & Action Strip */}
                <div className="fb-profile-strip">
                  <div className="fb-avatar-and-identity">
                    <div className="fb-strip-avatar-wrap">
                      <img
                        src="/assets/branding/TeluguBandham_Logo_Primary.png"
                        alt="TeluguBandham Facebook"
                        className="fb-strip-avatar"
                      />
                    </div>

                    <div className="fb-identity-text">
                      <div className="fb-name-heading-row">
                        <h2 className="fb-strip-name">TeluguBandham Matrimony</h2>
                        <span className="fb-blue-tick">✓</span>
                      </div>
                      <p className="fb-strip-meta">
                        Matrimonial Service • <strong>58K likes</strong> • <strong>64K followers</strong> • 4.9 ★ (1,420 Reviews)
                      </p>
                    </div>
                  </div>

                  <div className="fb-strip-actions">
                    <Link to="/register" className="fb-btn-blue">Sign Up / Register</Link>
                    <Link to="/contact" className="fb-btn-gray"><MessageCircle size={15} /> Message</Link>
                    <button
                      type="button"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`fb-btn-gray ${isFollowing ? 'active-like' : ''}`}
                    >
                      <ThumbsUp size={15} /> {isFollowing ? 'Liked' : 'Like'}
                    </button>
                    <button type="button" className="fb-btn-gray icon-only" aria-label="Share page"><Share2 size={15} /></button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="fb-nav-tabs-bar">
                  <span className="fb-nav-tab active">Posts</span>
                  <span className="fb-nav-tab">About</span>
                  <span className="fb-nav-tab">Reviews</span>
                  <span className="fb-nav-tab">Followers</span>
                  <span className="fb-nav-tab">Photos</span>
                  <span className="fb-nav-tab">Videos</span>
                  <span className="fb-nav-tab">More ▾</span>
                </div>
              </div>
            </div>

            {/* 2-Column Content Layout */}
            <div className="fb-page-wrapper">
              <div className="fb-content-columns">
                {/* Left Info Column */}
                <aside className="fb-info-column">
                  {/* About Card */}
                  <div className="fb-card">
                    <h3 className="fb-card-heading">Intro</h3>
                    <p className="fb-intro-text">
                      Dedicated matrimonial platform connecting verified Telugu brides, grooms, and families with Vedic reverence and modern matching.
                    </p>
                    <div className="fb-detail-list">
                      <div className="fb-detail-row">💼 <span>Page • Matrimonial and Matchmaking</span></div>
                      <div className="fb-detail-row">📍 <span>HITEC City, Hyderabad, Telangana</span></div>
                      <div className="fb-detail-row">🌐 <a href="https://telugubandham.com" target="_blank" rel="noreferrer">telugubandham.com</a></div>
                      <div className="fb-detail-row">🛡️ <span>100% Privacy First and Verified Profiles</span></div>
                      <div className="fb-detail-row">⭐ <span>Rating: <strong>4.9 / 5</strong> (1,420 Reviews)</span></div>
                    </div>
                  </div>

                  {/* Photos Preview Card */}
                  <div className="fb-card">
                    <div className="fb-card-head-row">
                      <h3 className="fb-card-heading">Photos</h3>
                      <span className="fb-card-link">See all photos</span>
                    </div>
                    <div className="fb-photo-grid-preview">
                      <img src="/assets/couples/story_karthik_ananya.jpg" alt="Story 1" />
                      <img src="/assets/couples/story_rahul_sravani.jpg" alt="Story 2" />
                      <img src="/assets/couples/story_sai_divya.jpg" alt="Story 3" />
                      <img src="/assets/couples/story_vamsi_harika.jpg" alt="Story 4" />
                      <img src="/assets/couples/story_arjun_keerthi.jpg" alt="Story 5" />
                      <img src="/assets/couples/story_rohit_meghana.jpg" alt="Story 6" />
                    </div>
                  </div>
                </aside>

                {/* Right Feed Column */}
                <main className="fb-feed-column">
                  {/* Pinned Post */}
                  <article className="fb-card fb-post-card">
                    <div className="fb-post-header">
                      <img
                        src="/assets/branding/TeluguBandham_Logo_Primary.png"
                        alt="TeluguBandham"
                        className="fb-post-avatar"
                      />
                      <div>
                        <div className="fb-author-row">
                          <h4 className="fb-author-name">TeluguBandham Matrimony</h4>
                          <span className="fb-blue-tick">✓</span>
                        </div>
                        <span className="fb-post-time">📌 Pinned Post • 2 hrs ago • 🌍</span>
                      </div>
                    </div>

                    <p className="fb-post-text">
                      "Finding a life partner is about discovering someone who shares your values, family respect, and vision for the future." ✨<br /><br />
                      Celebrate genuine matrimonial connections with verified profiles across Hyderabad, Vijayawada, Vizag, and global Telugu communities. Start your meaningful journey today on TeluguBandham.
                    </p>

                    <div className="fb-post-media-wrap">
                      <img
                        src="/assets/couples/story_karthik_ananya.jpg"
                        alt="Karthik and Ananya"
                        className="fb-post-photo"
                      />
                    </div>

                    <div className="fb-post-metrics">
                      <span>👍 ❤️ 🌸 2,840</span>
                      <span>194 Comments • 86 Shares</span>
                    </div>

                    <div className="fb-post-interaction-bar">
                      <button
                        type="button"
                        onClick={() => toggleLike('fb1')}
                        className={`fb-interact-btn ${likedPosts['fb1'] ? 'liked' : ''}`}
                      >
                        <ThumbsUp size={16} /> <span>Like</span>
                      </button>
                      <button type="button" className="fb-interact-btn">
                        <MessageCircle size={16} /> <span>Comment</span>
                      </button>
                      <button type="button" className="fb-interact-btn">
                        <Share2 size={16} /> <span>Share</span>
                      </button>
                    </div>
                  </article>

                  {/* Second Feed Post */}
                  <article className="fb-card fb-post-card">
                    <div className="fb-post-header">
                      <img
                        src="/assets/branding/TeluguBandham_Logo_Primary.png"
                        alt="TeluguBandham"
                        className="fb-post-avatar"
                      />
                      <div>
                        <div className="fb-author-row">
                          <h4 className="fb-author-name">TeluguBandham Matrimony</h4>
                          <span className="fb-blue-tick">✓</span>
                        </div>
                        <span className="fb-post-time">Yesterday at 18:30 • 🌍</span>
                      </div>
                    </div>

                    <p className="fb-post-text">
                      Celebrating the sacred bond of Rahul and Sravani! Wishing both families eternal happiness, harmony, and joy. 💍✨
                    </p>

                    <div className="fb-post-media-wrap">
                      <img
                        src="/assets/couples/story_rahul_sravani.jpg"
                        alt="Rahul and Sravani"
                        className="fb-post-photo"
                      />
                    </div>

                    <div className="fb-post-metrics">
                      <span>👍 ❤️ 3,420</span>
                      <span>248 Comments • 115 Shares</span>
                    </div>

                    <div className="fb-post-interaction-bar">
                      <button
                        type="button"
                        onClick={() => toggleLike('fb2')}
                        className={`fb-interact-btn ${likedPosts['fb2'] ? 'liked' : ''}`}
                      >
                        <ThumbsUp size={16} /> <span>Like</span>
                      </button>
                      <button type="button" className="fb-interact-btn">
                        <MessageCircle size={16} /> <span>Comment</span>
                      </button>
                      <button type="button" className="fb-interact-btn">
                        <Share2 size={16} /> <span>Share</span>
                      </button>
                    </div>
                  </article>
                </main>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. FULL-SCREEN YOUTUBE DEMO
          ========================================================================= */}
      {currentPlatform === 'youtube' && (
        <div className="yt-fullscreen-app">
          {/* Top YouTube Nav */}
          <header className="yt-global-header">
            <div className="yt-header-left">
              <button type="button" className="yt-icon-btn"><Menu size={20} /></button>
              <div className="yt-logo-block">
                <div className="yt-red-badge"><Play size={13} fill="white" /></div>
                <span className="yt-logo-text">YouTube</span>
                <span className="yt-in-badge">IN</span>
              </div>
            </div>

            <div className="yt-header-center">
              <div className="yt-search-container">
                <input type="text" placeholder="Search TeluguBandham videos" readOnly />
                <button type="button" className="yt-search-action"><Search size={16} /></button>
              </div>
            </div>

            <div className="yt-header-right">
              <Link to="/register" className="yt-header-cta-btn">Create Profile</Link>
            </div>
          </header>

          <div className="yt-app-layout">
            {/* Left Sidebar Drawer */}
            <aside className="yt-sidebar-drawer">
              <div className="yt-drawer-item active"><Home size={20} /> <span>Home</span></div>
              <div className="yt-drawer-item"><Flame size={20} /> <span>Shorts</span></div>
              <div className="yt-drawer-item"><Radio size={20} /> <span>Subscriptions</span></div>
              <div className="yt-drawer-divider"></div>
              <div className="yt-drawer-item"><Film size={20} /> <span>Library</span></div>
              <div className="yt-drawer-item"><Clock size={20} /> <span>History</span></div>
              <div className="yt-drawer-divider"></div>
              <div className="yt-subscriptions-label">OFFICIAL CHANNEL</div>
              <div className="yt-drawer-item active-channel">
                <img src="/assets/branding/TeluguBandham_Logo_Primary.png" alt="TeluguBandham" className="yt-drawer-avatar" />
                <span>TeluguBandham</span>
              </div>
            </aside>

            {/* Main Channel Canvas */}
            <main className="yt-main-content">
              {/* Full Channel Banner */}
              <div className="yt-full-banner">
                <div className="yt-banner-text-box">
                  <h1 className="yt-banner-heading">TeluguBandham Official Channel</h1>
                  <p className="yt-banner-sub">Real Telugu Wedding Stories • Vedic Rituals • Matrimonial Guidance</p>
                </div>
              </div>

              {/* Channel Profile Info */}
              <div className="yt-channel-summary">
                <div className="yt-avatar-large-wrap">
                  <img
                    src="/assets/branding/TeluguBandham_Logo_Primary.png"
                    alt="TeluguBandham Channel Avatar"
                    className="yt-avatar-large"
                  />
                </div>

                <div className="yt-channel-meta-block">
                  <div className="yt-channel-title-row">
                    <h2 className="yt-channel-headline">TeluguBandham Official</h2>
                    <CheckCircle size={16} className="yt-check" />
                  </div>
                  <div className="yt-channel-stats-row">
                    <span>@TeluguBandhamOfficial</span> • <span><strong>92.4K</strong> subscribers</span> • <span><strong>164</strong> videos</span>
                  </div>
                  <p className="yt-channel-desc">
                    Welcome to the official TeluguBandham YouTube channel. Watch verified success stories, Telugu wedding rituals explained (Jeelakarra Bellam, Saptapadi), horoscope matching insights, and relationship advice for Telugu families.
                  </p>
                  <div className="yt-action-buttons-row">
                    <button
                      type="button"
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`yt-subscribe-action ${isFollowing ? 'subscribed' : ''}`}
                    >
                      <Bell size={16} /> {isFollowing ? 'Subscribed' : 'Subscribe'}
                    </button>
                    <Link to="/discover" className="yt-find-matches-btn">Find Matches</Link>
                  </div>
                </div>
              </div>

              {/* Channel Tabs */}
              <div className="yt-channel-tabs">
                <span className="yt-tab active">HOME</span>
                <span className="yt-tab">VIDEOS</span>
                <span className="yt-tab">SHORTS</span>
                <span className="yt-tab">PLAYLISTS</span>
                <span className="yt-tab">COMMUNITY</span>
                <span className="yt-tab">ABOUT</span>
              </div>

              {/* Featured Showcase Video */}
              <div className="yt-featured-section">
                <div className="yt-featured-card">
                  <div className="yt-featured-thumbnail-wrap">
                    <img src="/assets/couples/story_karthik_ananya.jpg" alt="Featured Story" className="yt-featured-thumb" />
                    <span className="yt-badge-duration">14:28</span>
                    <div className="yt-play-center"><Play size={28} fill="white" /></div>
                  </div>
                  <div className="yt-featured-details">
                    <h3 className="yt-featured-title">Karthik and Ananya: Two Families, One Sacred Telugu Wedding Story</h3>
                    <p className="yt-featured-views">142K views • 2 weeks ago</p>
                    <p className="yt-featured-snippet">
                      Watch how Karthik and Ananya discovered each other on TeluguBandham, brought their families together with mutual respect, and celebrated a traditional Telugu wedding in Hyderabad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Grid Section */}
              <div className="yt-grid-section">
                <h3 className="yt-section-heading">Latest Uploads and Success Stories</h3>
                <div className="yt-videos-layout-grid">
                  {[
                    { id: 1, img: '/assets/couples/story_rahul_sravani.jpg', title: 'Telugu Wedding Rituals Explained: Jeelakarra Bellam and Saptapadi', views: '280K views', time: '1 month ago', duration: '18:20' },
                    { id: 2, img: '/assets/couples/story_sai_divya.jpg', title: 'How Modern Telugu Professionals Balance Career and Traditional Matrimony', views: '95K views', time: '3 weeks ago', duration: '12:45' },
                    { id: 3, img: '/assets/couples/story_vamsi_harika.jpg', title: 'Verified Profiles on TeluguBandham: How We Ensure Safety and Authenticity', views: '64K views', time: '2 months ago', duration: '08:35' },
                    { id: 4, img: '/assets/couples/story_arjun_keerthi.jpg', title: 'From USA to Hyderabad: Arjun and Keerthi Cross-Continental Matchmaking', views: '118K views', time: '3 weeks ago', duration: '15:10' },
                    { id: 5, img: '/assets/couples/story_rohit_meghana.jpg', title: 'Astrological Horoscope Matching (Kundali) in Telugu Traditions', views: '82K views', time: '1 month ago', duration: '11:50' },
                    { id: 6, img: '/assets/couples/story_karthik_ananya.jpg', title: 'Family Values in 2026: Finding Meaningful Connections on TeluguBandham', views: '74K views', time: '5 days ago', duration: '09:40' },
                  ].map((video) => (
                    <div key={video.id} className="yt-card-item">
                      <div className="yt-card-thumbnail">
                        <img src={video.img} alt={video.title} loading="lazy" />
                        <span className="yt-time-badge">{video.duration}</span>
                        <div className="yt-hover-play"><Play size={22} fill="white" /></div>
                      </div>
                      <div className="yt-card-info-row">
                        <img src="/assets/branding/TeluguBandham_Logo_Primary.png" alt="Channel" className="yt-small-avatar" />
                        <div>
                          <h4 className="yt-card-title">{video.title}</h4>
                          <p className="yt-card-channel-name">TeluguBandham Official ✓</p>
                          <p className="yt-card-meta">{video.views} • {video.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
