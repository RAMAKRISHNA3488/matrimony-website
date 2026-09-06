import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockDb } from '../../services/mockDb';
import { calculateCompatibility } from '../../services/matchingAlgorithm';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Search,
  ShieldCheck,
  Globe,
  Flame,
  Crown,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import SearchBar from '../../components/discover/SearchBar';
import FilterPanel from '../../components/discover/FilterPanel';
import ProfileCard from '../../components/discover/ProfileCard';
import { EmptyState } from '../../components/common/EmptyState';
import '../../styles/discover.css';

export default function Discover() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Target partner gender based on user's selected profile gender
  const targetGender = user?.gender === 'female' ? 'male' : user?.gender === 'male' ? 'female' : 'all';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState(() => searchParams.get('gender') || targetGender);
  const [selectedCommunity, setSelectedCommunity] = useState(searchParams.get('community') || 'all');
  const [customCommunity, setCustomCommunity] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [customCity, setCustomCity] = useState('');
  const [quickChip, setQuickChip] = useState('all');

  // Advanced Filters
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    communities: searchParams.get('community') ? [searchParams.get('community')] : [],
    education: [],
    foodHabits: [],
    maritalStatus: [],
    verifiedOnly: false,
    nriOnly: false
  });

  // View Mode & Sort
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('compatibility');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [allProfiles, setAllProfiles] = useState(() => mockDb.getProfiles() || []);

  // Real-time synchronization for profile updates & admin status toggles
  useEffect(() => {
    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'profiles' || type === 'user_updated' || type === 'storage_sync') {
        setAllProfiles(mockDb.getProfiles() || []);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter & Search computation
  const filteredProfiles = useMemo(() => {
    return allProfiles.filter((profile) => {
      // Don't show current logged in user in results
      if (user && profile.id === user.id) return false;

      // Don't show suspended or banned accounts
      if (profile.isSuspended) return false;

      // Gender filter
      if (selectedGender !== 'all' && profile.gender !== selectedGender) return false;

      // Keyword / ID / Profession
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (profile.name || '').toLowerCase().includes(q);
        const matchesId = (profile.id || '').toLowerCase().includes(q);
        const matchesProfession = (profile.profession || '').toLowerCase().includes(q);
        const matchesCompany = (profile.company || '').toLowerCase().includes(q);
        const matchesEdu = (profile.education || '').toLowerCase().includes(q);
        const matchesCity = (profile.city || '').toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesProfession && !matchesCompany && !matchesEdu && !matchesCity) {
          return false;
        }
      }

      // Quick Community (Standard selection or Custom 'Other' entry)
      if (selectedCommunity === 'other') {
        if (customCommunity.trim()) {
          const qComm = customCommunity.toLowerCase().trim();
          const matchesComm = (profile.community || '').toLowerCase().includes(qComm);
          const matchesSub = (profile.subCaste || '').toLowerCase().includes(qComm);
          if (!matchesComm && !matchesSub) return false;
        }
      } else if (selectedCommunity !== 'all') {
        if (!(profile.community || '').toLowerCase().includes(selectedCommunity.toLowerCase())) {
          return false;
        }
      }

      // Quick City / Region (Standard selection or Custom 'Other' entry)
      if (selectedCity === 'other') {
        if (customCity.trim()) {
          const qCity = customCity.toLowerCase().trim();
          const matchesCity = (profile.city || '').toLowerCase().includes(qCity);
          const matchesState = (profile.state || '').toLowerCase().includes(qCity);
          const matchesCountry = (profile.country || '').toLowerCase().includes(qCity);
          const matchesNative = (profile.nativePlace || '').toLowerCase().includes(qCity);
          if (!matchesCity && !matchesState && !matchesCountry && !matchesNative) return false;
        }
      } else if (selectedCity !== 'all') {
        if (!(profile.city || '').toLowerCase().includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Quick Chips Presets
      if (quickChip === 'top80') {
        const comp = calculateCompatibility(user, profile)?.score || 82;
        if (comp < 80) return false;
      } else if (quickChip === 'verified') {
        if (!profile.isVerified) return false;
      } else if (quickChip === 'premium') {
        if (!profile.isPremium) return false;
      } else if (quickChip === 'nri') {
        if (profile.country === 'India' && !profile.residenceStatus?.toLowerCase().includes('h1')) return false;
      } else if (quickChip === 'under30') {
        if (profile.age > 29) return false;
      } else if (quickChip === 'never_married') {
        if (profile.maritalStatus && profile.maritalStatus !== 'Never Married') return false;
      }

      // Age range
      if (filters.minAge && profile.age < parseInt(filters.minAge, 10)) {
        return false;
      }
      if (filters.maxAge && profile.age > parseInt(filters.maxAge, 10)) {
        return false;
      }

      // Advanced Communities
      if (filters.communities.length > 0 && !filters.communities.some((c) => (profile.community || '').toLowerCase().includes(c.toLowerCase()))) {
        return false;
      }

      // Verified only
      if (filters.verifiedOnly && !profile.isVerified) {
        return false;
      }

      // NRI only
      if (filters.nriOnly && profile.country === 'India') {
        return false;
      }

      // Food habits
      if (filters.foodHabits.length > 0 && !filters.foodHabits.includes(profile.foodHabits)) {
        return false;
      }

      // Marital status
      if (filters.maritalStatus.length > 0 && !filters.maritalStatus.includes(profile.maritalStatus)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'compatibility') {
        const compA = calculateCompatibility(user, a)?.score || 82;
        const compB = calculateCompatibility(user, b)?.score || 82;
        return compB - compA;
      }
      if (sortBy === 'age_asc') return a.age - b.age;
      if (sortBy === 'age_desc') return b.age - a.age;
      if (sortBy === 'income') return (b.incomeNum || 0) - (a.incomeNum || 0);
      if (sortBy === 'verified') return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
      return 0;
    });
  }, [allProfiles, user, searchQuery, selectedGender, selectedCommunity, customCommunity, selectedCity, customCity, quickChip, filters, sortBy]);

  const handleResetFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      communities: [],
      education: [],
      foodHabits: [],
      maritalStatus: [],
      verifiedOnly: false,
      nriOnly: false
    });
    setSelectedCommunity('all');
    setCustomCommunity('');
    setSelectedCity('all');
    setCustomCity('');
    setSelectedGender('all');
    setSearchQuery('');
    setQuickChip('all');
  };

  // Compile active filters list for interactive chip dismissal
  const activeFilterList = useMemo(() => {
    const list = [];
    if (selectedGender === 'female') list.push({ key: 'gender', label: 'Bride (Female)', onRemove: () => setSelectedGender('all') });
    if (selectedGender === 'male') list.push({ key: 'gender', label: 'Groom (Male)', onRemove: () => setSelectedGender('all') });
    
    if (selectedCommunity === 'other' && customCommunity.trim()) {
      list.push({ key: 'comm', label: `Community: ${customCommunity}`, onRemove: () => { setSelectedCommunity('all'); setCustomCommunity(''); } });
    } else if (selectedCommunity !== 'all' && selectedCommunity !== 'other') {
      list.push({ key: 'comm', label: `Community: ${selectedCommunity}`, onRemove: () => setSelectedCommunity('all') });
    }

    if (selectedCity === 'other' && customCity.trim()) {
      list.push({ key: 'city', label: `Location: ${customCity}`, onRemove: () => { setSelectedCity('all'); setCustomCity(''); } });
    } else if (selectedCity !== 'all' && selectedCity !== 'other') {
      list.push({ key: 'city', label: `City: ${selectedCity}`, onRemove: () => setSelectedCity('all') });
    }

    if (searchQuery.trim()) {
      list.push({ key: 'query', label: `"${searchQuery}"`, onRemove: () => setSearchQuery('') });
    }

    if (filters.minAge || filters.maxAge) {
      list.push({
        key: 'age',
        label: `Age: ${filters.minAge || 21}–${filters.maxAge || 60} yrs`,
        onRemove: () => setFilters((prev) => ({ ...prev, minAge: '', maxAge: '' }))
      });
    }

    if (filters.verifiedOnly) {
      list.push({ key: 'ver', label: '100% ID Verified', onRemove: () => setFilters((prev) => ({ ...prev, verifiedOnly: false })) });
    }

    if (filters.nriOnly) {
      list.push({ key: 'nri', label: 'NRI Profiles', onRemove: () => setFilters((prev) => ({ ...prev, nriOnly: false })) });
    }

    (filters.communities || []).forEach((c) => {
      list.push({
        key: `comm_${c}`,
        label: c,
        onRemove: () => setFilters((prev) => ({ ...prev, communities: prev.communities.filter((item) => item !== c) }))
      });
    });

    (filters.education || []).forEach((edu) => {
      list.push({
        key: `edu_${edu}`,
        label: edu,
        onRemove: () => setFilters((prev) => ({ ...prev, education: prev.education.filter((item) => item !== edu) }))
      });
    });

    (filters.foodHabits || []).forEach((diet) => {
      list.push({
        key: `diet_${diet}`,
        label: diet,
        onRemove: () => setFilters((prev) => ({ ...prev, foodHabits: prev.foodHabits.filter((item) => item !== diet) }))
      });
    });

    (filters.maritalStatus || []).forEach((m) => {
      list.push({
        key: `marital_${m}`,
        label: m,
        onRemove: () => setFilters((prev) => ({ ...prev, maritalStatus: prev.maritalStatus.filter((item) => item !== m) }))
      });
    });

    return list;
  }, [selectedGender, selectedCommunity, customCommunity, selectedCity, customCity, searchQuery, filters]);

  return (
    <div className="container-wide" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
      {/* 1. Search Bar Header */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        selectedCommunity={selectedCommunity}
        setSelectedCommunity={setSelectedCommunity}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        customCommunity={customCommunity}
        setCustomCommunity={setCustomCommunity}
        customCity={customCity}
        setCustomCity={setCustomCity}
      />

      {/* 2. Interactive Quick Match Presets Banner */}
      <div className="discover-presets-bar no-scrollbar">
        <button
          type="button"
          className={`preset-chip ${quickChip === 'all' ? 'active' : ''}`}
          onClick={() => setQuickChip('all')}
        >
          <span>All Profiles</span>
          <span className="preset-count">{allProfiles.length}</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'top80' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'top80' ? 'all' : 'top80')}
        >
          <Flame size={14} className="text-gold" />
          <span>High Match (80%+)</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'verified' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'verified' ? 'all' : 'verified')}
        >
          <ShieldCheck size={14} color="#059669" />
          <span>100% ID Verified</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'premium' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'premium' ? 'all' : 'premium')}
        >
          <Crown size={14} color="#D4AF37" />
          <span>Premium VIP</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'nri' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'nri' ? 'all' : 'nri')}
        >
          <Globe size={14} color="#2563EB" />
          <span>NRI Telugu (USA / Global)</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'under30' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'under30' ? 'all' : 'under30')}
        >
          <span>🎂 Under 30 yrs</span>
        </button>

        <button
          type="button"
          className={`preset-chip ${quickChip === 'never_married' ? 'active' : ''}`}
          onClick={() => setQuickChip(quickChip === 'never_married' ? 'all' : 'never_married')}
        >
          <span>💍 Never Married</span>
        </button>
      </div>

      {/* 3. Main Content Layout */}
      <div className="discover-layout">
        {/* Left Filter Sidebar */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Results Column */}
        <div>
          {/* Active Filter Tags Row (Interactive Dismissal) */}
          {activeFilterList.length > 0 && (
            <div className="active-filters-bar animate-fade-in">
              <span className="active-filters-label">Active Filters:</span>
              <div className="active-filters-list">
                {activeFilterList.map((item, idx) => (
                  <button
                    key={`${item.key}_${idx}`}
                    type="button"
                    className="active-filter-tag animate-scale-up"
                    onClick={item.onRemove}
                    title="Click to remove filter"
                  >
                    <span>{item.label}</span>
                    <X size={12} className="tag-remove-icon" />
                  </button>
                ))}

                <button
                  type="button"
                  className="clear-all-tags-btn"
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={11} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Toolbar */}
          <div className="discover-toolbar">
            <div className="results-count-wrap">
              <span className="live-status-dot" />
              <div className="results-count-text">
                Showing <strong>{filteredProfiles.length}</strong> Telugu Matrimonial Profiles
              </div>
            </div>

            <div className="view-sort-controls">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                className="mobile-filter-btn"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <SlidersHorizontal size={15} />
                <span>Filters {activeFilterList.length > 0 ? `(${activeFilterList.length})` : ''}</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="sort-dropdown-wrap">
                <ArrowUpDown size={14} className="text-gold" />
                <span className="sort-label">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="compatibility">Highest Compatibility (80%+ first)</option>
                  <option value="age_asc">Age: Youngest First</option>
                  <option value="age_desc">Age: Senior First</option>
                  <option value="income">Highest Package / Income</option>
                  <option value="verified">Verified Profiles First</option>
                </select>
              </div>

              {/* Grid vs List View Toggle */}
              <div className="view-toggle-btns">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  aria-label="Switch to Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                  aria-label="Switch to List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid / List */}
          {filteredProfiles.length === 0 ? (
            <div className="empty-state-card animate-fade-in">
              <EmptyState
                title="No matching Telugu profiles found"
                description="Try relaxing your filters, widening the age range, or selecting 'All Communities' to see more prospective brides and grooms."
                actionText="Reset All Filters"
                onAction={handleResetFilters}
              />
              <div className="empty-suggestions-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedCommunity('all');
                    setCustomCommunity('');
                  }}
                >
                  Show All Communities
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedCity('all');
                    setCustomCity('');
                  }}
                >
                  Show All Locations
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setFilters((prev) => ({ ...prev, minAge: '', maxAge: '' }))}
                >
                  Clear Age Limits
                </button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'profiles-grid' : 'profiles-list'}>
              {filteredProfiles.map((candidate) => (
                <ProfileCard
                  key={candidate.id}
                  profile={candidate}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
