import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { calculateCompatibility } from '../../services/matchingAlgorithm';
import {
  Heart,
  ShieldCheck,
  Globe,
  Flame,
  Users,
  Search,
  X,
  LayoutGrid,
  List
} from 'lucide-react';
import ProfileCard from '../../components/discover/ProfileCard';
import { EmptyState } from '../../components/common/EmptyState';
import '../../styles/matches.css';

const TABS = [
  { id: 'all', label: 'All Recommended' },
  { id: 'top', label: 'High Match (80%+)', icon: Heart },
  { id: 'daily', label: 'Daily Handpicked', icon: Flame },
  { id: 'verified', label: '100% ID Verified', icon: ShieldCheck },
  { id: 'nri', label: 'NRI Telugu (USA/UK)', icon: Globe },
  { id: 'community', label: 'Same Community', icon: Users }
];

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State (defaults to 'all' so profiles are always immediately visible)
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [quickChip, setQuickChip] = useState('all');

  const [allProfiles, setAllProfiles] = useState(() => mockDb.getProfiles() || []);

  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'profiles' || type === 'user_updated' || type === 'storage_sync') {
        setAllProfiles(mockDb.getProfiles() || []);
      }
    });
    return () => unsubscribe();
  }, []);

  // Determine user gender and target partner gender
  const userGender = useMemo(() => {
    const raw = (user?.gender || user?.basicInfo?.gender || '').toLowerCase();
    if (raw === 'female' || raw === 'bride' || raw === 'woman') return 'female';
    if (raw === 'male' || raw === 'groom' || raw === 'man') return 'male';
    // Check partner preference hints
    const partnerGen = (user?.partnerPreferences?.gender || '').toLowerCase();
    if (partnerGen === 'male') return 'female';
    if (partnerGen === 'female') return 'male';
    return 'male';
  }, [user]);

  const targetGender = useMemo(() => {
    if (user?.partnerPreferences?.gender) {
      return user.partnerPreferences.gender.toLowerCase();
    }
    return userGender === 'female' ? 'male' : 'female';
  }, [user, userGender]);

  const lookingForLabel = targetGender === 'female'
    ? 'Telugu Brides (Female)'
    : 'Telugu Grooms (Male)';

  // Base pool of candidates with pre-calculated compatibility
  const candidatePool = useMemo(() => {
    const candidates = allProfiles.filter((p) => {
      const pGender = (p.gender || '').toLowerCase();
      return pGender === targetGender && p.id !== user?.id && !p.isSuspended;
    });

    return candidates.map((p) => {
      const comp = calculateCompatibility(user, p);
      return {
        ...p,
        compatibilityScore: comp?.score || 82,
        compatibilityReasons: comp?.reasons || [],
        breakdown: comp?.breakdown || {}
      };
    });
  }, [allProfiles, user, targetGender]);

  // Live count for each category tab
  const tabCounts = useMemo(() => {
    const counts = {
      all: candidatePool.length,
      top: candidatePool.filter((p) => p.compatibilityScore >= 80).length,
      daily: candidatePool.filter((p) => p.isPremium || p.isVerified || p.compatibilityScore >= 80).length,
      verified: candidatePool.filter((p) => p.isVerified).length,
      nri: candidatePool.filter((p) => p.country !== 'India' || p.residenceStatus?.toLowerCase().includes('h1') || p.isNri).length,
      community: user?.community
        ? candidatePool.filter((p) => p.community?.toLowerCase().includes(user.community?.toLowerCase()) || user.community?.toLowerCase().includes(p.community?.toLowerCase())).length
        : candidatePool.length
    };
    return counts;
  }, [candidatePool, user]);

  // Filter & Sort matched profiles
  const displayedProfiles = useMemo(() => {
    return candidatePool
      .filter((p) => {
        // Tab Category Filtering
        if (activeTab === 'top' && p.compatibilityScore < 80) return false;
        if (activeTab === 'daily' && !p.isPremium && !p.isVerified && p.compatibilityScore < 80) return false;
        if (activeTab === 'verified' && !p.isVerified) return false;
        if (activeTab === 'nri' && p.country === 'India' && !p.residenceStatus?.toLowerCase().includes('h1') && !p.isNri) return false;
        if (activeTab === 'community' && user?.community && !p.community?.toLowerCase().includes(user.community?.toLowerCase()) && !user.community?.toLowerCase().includes(p.community?.toLowerCase())) return false;

        // Quick Chip Filtering
        if (quickChip === 'verified' && !p.isVerified) return false;
        if (quickChip === 'premium' && !p.isPremium) return false;
        if (quickChip === 'never_married' && p.maritalStatus !== 'Never Married') return false;

        // Text Search Query Filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name?.toLowerCase().includes(q);
          const matchCity = p.city?.toLowerCase().includes(q);
          const matchState = p.state?.toLowerCase().includes(q);
          const matchComm = p.community?.toLowerCase().includes(q);
          const matchSub = p.subCaste?.toLowerCase().includes(q);
          const matchProf = p.profession?.toLowerCase().includes(q);
          const matchEdu = p.education?.toLowerCase().includes(q);
          if (!matchName && !matchCity && !matchState && !matchComm && !matchSub && !matchProf && !matchEdu) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') {
          return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
        }
        if (sortBy === 'age_asc') {
          return (a.age || 0) - (b.age || 0);
        }
        if (sortBy === 'age_desc') {
          return (b.age || 0) - (a.age || 0);
        }
        if (sortBy === 'recent') {
          return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0);
        }
        return 0;
      });
  }, [candidatePool, activeTab, quickChip, searchQuery, sortBy, user]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams(tabId === 'all' ? {} : { tab: tabId });
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setQuickChip('all');
    setSearchQuery('');
    setSortBy('match');
    setSearchParams({});
  };

  return (
    <div className="container-wide tb-matches-page animate-fade-in">
      {/* 1. CLEAN COMPACT HEADER */}
      <div className="tb-matches-header">
        <h1 className="tb-matches-title">
          Smart Compatibility Matches
          <span className="tb-matches-count-badge">
            {displayedProfiles.length} {displayedProfiles.length === 1 ? 'Profile' : 'Profiles'}
          </span>
        </h1>

        <p className="tb-matches-subtitle">
          <span>Intelligently calculated based on your Partner Preferences (Age, Location, Education and Community).</span>
          <span className="tb-matches-subtitle-dot" aria-hidden="true">•</span>
          <span className="tb-matches-looking-tag">
            Looking for: <strong>{lookingForLabel}</strong>
          </span>
        </p>
      </div>



      {/* 2. CATEGORY TABS WITH LIVE COUNTS */}
      <div className="tb-matches-tabs-container">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = tabCounts[tab.id] ?? 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`tb-matches-tab-btn ${isActive ? 'active' : ''}`}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              <span className="tb-matches-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TOOLSET TOOLBAR (SEARCH, SORT, VIEW SWITCHER) */}
      <div className="tb-matches-toolbar">
        {/* Search Input */}
        <div className="tb-matches-search-wrap">
          <Search size={16} className="tb-matches-search-icon" />
          <input
            type="text"
            placeholder="Search by name, city, caste, education..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tb-matches-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="tb-matches-search-clear"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls Right */}
        <div className="tb-matches-controls-right">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="tb-matches-sort-select"
            aria-label="Sort matching profiles"
          >
            <option value="match">Sort by: Compatibility Score</option>
            <option value="age_asc">Sort by: Age (Youngest First)</option>
            <option value="age_desc">Sort by: Age (Eldest First)</option>
            <option value="recent">Sort by: Featured and Active</option>
          </select>

          {/* View Switcher (Grid / List) */}
          <div className="tb-matches-view-switcher" role="group" aria-label="View mode">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`tb-matches-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`tb-matches-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. QUICK FILTER CHIPS */}
      <div className="tb-matches-quick-chips">
        <span className="tb-matches-chip-label">Quick Filters:</span>
        <button
          type="button"
          onClick={() => setQuickChip('all')}
          className={`tb-matches-chip ${quickChip === 'all' ? 'active' : ''}`}
        >
          All Profiles
        </button>
        <button
          type="button"
          onClick={() => setQuickChip('verified')}
          className={`tb-matches-chip ${quickChip === 'verified' ? 'active' : ''}`}
        >
          Verified Only
        </button>
        <button
          type="button"
          onClick={() => setQuickChip('premium')}
          className={`tb-matches-chip ${quickChip === 'premium' ? 'active' : ''}`}
        >
          Premium Members
        </button>
        <button
          type="button"
          onClick={() => setQuickChip('never_married')}
          className={`tb-matches-chip ${quickChip === 'never_married' ? 'active' : ''}`}
        >
          Never Married
        </button>
      </div>

      {/* 5. MATCH PROFILES GRID / LIST / EMPTY STATE */}
      {displayedProfiles.length === 0 ? (
        <EmptyState
          title="No profiles found for current criteria"
          description="Try switching tabs, clearing search keywords, or resetting your quick filters to see all available Telugu profiles."
          actionText="View All Recommended"
          onAction={handleResetFilters}
          secondaryActionText="Explore Search Directory"
          onSecondaryAction={() => navigate('/discover')}
        />
      ) : (
        <div className={viewMode === 'list' ? 'profiles-list' : 'profiles-grid'}>
          {displayedProfiles.map((candidate) => (
            <ProfileCard
              key={candidate.id}
              profile={candidate}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

