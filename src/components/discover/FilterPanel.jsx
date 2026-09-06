import React, { useState, useMemo } from 'react';
import {
  Filter,
  RotateCcw,
  X,
  ShieldCheck,
  Globe,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Users,
  GraduationCap,
  Utensils,
  HeartHandshake
} from 'lucide-react';

const COMMUNITIES_LIST = [
  "Reddy", "Kamma", "Brahmin - Niyogi", "Brahmin - Vaidiki",
  "Kapu", "Arya Vysya", "Balija", "Padmashali", "Velama", "Yadav", "Mudiraj"
];

export default function FilterPanel({
  filters,
  setFilters,
  onReset,
  isOpenMobile,
  onCloseMobile
}) {
  const [openSection, setOpenSection] = useState(null);

  const [communitySearch, setCommunitySearch] = useState('');

  const filteredCommunities = useMemo(() => {
    if (!communitySearch.trim()) return COMMUNITIES_LIST;
    return COMMUNITIES_LIST.filter((c) =>
      c.toLowerCase().includes(communitySearch.toLowerCase().trim())
    );
  }, [communitySearch]);

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const handleCheckboxChange = (group, value) => {
    const current = filters[group] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setFilters((prev) => ({ ...prev, [group]: updated }));
  };

  const handleAgePreset = (min, max) => {
    setFilters((prev) => ({
      ...prev,
      minAge: min || '',
      maxAge: max || ''
    }));
  };

  // Calculate active filter count
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.verifiedOnly) count += 1;
    if (filters.nriOnly) count += 1;
    if (filters.minAge || filters.maxAge) count += 1;
    if (filters.communities?.length > 0) count += filters.communities.length;
    if (filters.education?.length > 0) count += filters.education.length;
    if (filters.foodHabits?.length > 0) count += filters.foodHabits.length;
    if (filters.maritalStatus?.length > 0) count += filters.maritalStatus.length;
    return count;
  }, [filters]);

  return (
    <aside className={`filter-panel ${isOpenMobile ? 'mobile-open' : ''} animate-fade-in`}>
      {/* Header Bar */}
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={18} className="text-burgundy" />
          <span>Refine Search</span>
          {activeCount > 0 && (
            <span className="filter-active-pill animate-scale-up">
              {activeCount} active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {activeCount > 0 && (
            <button
              type="button"
              className="filter-reset-btn"
              onClick={onReset}
              title="Reset all filters"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
          {isOpenMobile && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onCloseMobile}
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Trust & Safety Toggles */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('trust')}
        >
          <div className="filter-group-title">
            <span>Verification & Status</span>
          </div>
          {openSection === 'trust' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'trust' && (
          <div className="filter-toggles-wrap animate-fade-in">
            <label className={`filter-toggle-card ${filters.verifiedOnly ? 'active-verified' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={16} color="#059669" />
                <span className="filter-toggle-label">100% ID Verified Only</span>
              </div>
              <input
                type="checkbox"
                checked={filters.verifiedOnly || false}
                onChange={(e) => setFilters((prev) => ({ ...prev, verifiedOnly: e.target.checked }))}
              />
            </label>

            <label className={`filter-toggle-card ${filters.nriOnly ? 'active-nri' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Globe size={16} color="#2563EB" />
                <span className="filter-toggle-label">NRI Telugu (USA / Global)</span>
              </div>
              <input
                type="checkbox"
                checked={filters.nriOnly || false}
                onChange={(e) => setFilters((prev) => ({ ...prev, nriOnly: e.target.checked }))}
              />
            </label>
          </div>
        )}
      </div>

      {/* 2. Age Range Filter */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('age')}
        >
          <div className="filter-group-title">
            <span>Age Range</span>
            {(filters.minAge || filters.maxAge) && (
              <span className="filter-tag-hint">
                {filters.minAge || 21} – {filters.maxAge || 60} yrs
              </span>
            )}
          </div>
          {openSection === 'age' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'age' && (
          <div className="filter-content-body animate-fade-in">
            {/* Quick Age Presets */}
            <div className="age-preset-chips">
              <button
                type="button"
                className={`age-chip ${(!filters.minAge && !filters.maxAge) ? 'active' : ''}`}
                onClick={() => handleAgePreset('', '')}
              >
                All
              </button>
              <button
                type="button"
                className={`age-chip ${(filters.minAge === 21 && filters.maxAge === 25) ? 'active' : ''}`}
                onClick={() => handleAgePreset(21, 25)}
              >
                21–25
              </button>
              <button
                type="button"
                className={`age-chip ${(filters.minAge === 26 && filters.maxAge === 30) ? 'active' : ''}`}
                onClick={() => handleAgePreset(26, 30)}
              >
                26–30
              </button>
              <button
                type="button"
                className={`age-chip ${(filters.minAge === 31 && filters.maxAge === 35) ? 'active' : ''}`}
                onClick={() => handleAgePreset(31, 35)}
              >
                31–35
              </button>
              <button
                type="button"
                className={`age-chip ${(filters.minAge === 36 && !filters.maxAge) ? 'active' : ''}`}
                onClick={() => handleAgePreset(36, '')}
              >
                36+
              </button>
            </div>

            {/* Custom Inputs */}
            <div className="age-inputs-row">
              <div className="age-field">
                <span className="age-field-lbl">Min Age</span>
                <input
                  type="number"
                  min="21"
                  max="60"
                  placeholder="21"
                  value={filters.minAge ?? ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minAge: e.target.value ? parseInt(e.target.value, 10) : '' }))}
                  className="filter-num-input"
                />
              </div>
              <span className="age-separator">to</span>
              <div className="age-field">
                <span className="age-field-lbl">Max Age</span>
                <input
                  type="number"
                  min="21"
                  max="60"
                  placeholder="60"
                  value={filters.maxAge ?? ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: e.target.value ? parseInt(e.target.value, 10) : '' }))}
                  className="filter-num-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Community Filter */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('community')}
        >
          <div className="filter-group-title">
            <Users size={14} className="text-burgundy" />
            <span>Telugu Community</span>
            {filters.communities?.length > 0 && (
              <span className="filter-count-bubble">{filters.communities.length}</span>
            )}
          </div>
          {openSection === 'community' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'community' && (
          <div className="filter-content-body animate-fade-in">
            {/* Quick search input */}
            <div className="filter-search-mini">
              <Search size={13} className="text-muted" />
              <input
                type="text"
                placeholder="Search community..."
                value={communitySearch}
                onChange={(e) => setCommunitySearch(e.target.value)}
                className="filter-mini-input"
              />
              {communitySearch && (
                <button
                  type="button"
                  onClick={() => setCommunitySearch('')}
                  className="filter-mini-clear"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="filter-checkbox-list">
              {filteredCommunities.map((comm) => {
                const isSelected = (filters.communities || []).includes(comm);
                return (
                  <label key={comm} className={`filter-checkbox-item ${isSelected ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange('communities', comm)}
                    />
                    <div className="custom-check-box">
                      {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span>{comm}</span>
                  </label>
                );
              })}
              {filteredCommunities.length === 0 && (
                <div className="filter-empty-subtext">No matching community found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Education Filter */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('education')}
        >
          <div className="filter-group-title">
            <GraduationCap size={14} className="text-burgundy" />
            <span>Education Level</span>
            {filters.education?.length > 0 && (
              <span className="filter-count-bubble">{filters.education.length}</span>
            )}
          </div>
          {openSection === 'education' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'education' && (
          <div className="filter-checkbox-list animate-fade-in">
            {educationList.map((edu) => {
              const isSelected = (filters.education || []).includes(edu);
              return (
                <label key={edu} className={`filter-checkbox-item ${isSelected ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckboxChange('education', edu)}
                  />
                  <div className="custom-check-box">
                    {isSelected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
                  </div>
                  <span>{edu}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Food Habits / Diet */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('diet')}
        >
          <div className="filter-group-title">
            <Utensils size={14} className="text-burgundy" />
            <span>Food Habits</span>
            {filters.foodHabits?.length > 0 && (
              <span className="filter-count-bubble">{filters.foodHabits.length}</span>
            )}
          </div>
          {openSection === 'diet' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'diet' && (
          <div className="filter-pills-row animate-fade-in">
            {["Vegetarian", "Non-Vegetarian", "Eggetarian"].map((diet) => {
              const isSelected = (filters.foodHabits || []).includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  className={`filter-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCheckboxChange('foodHabits', diet)}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Marital Status */}
      <div className="filter-group">
        <div
          className="filter-group-header"
          onClick={() => toggleSection('marital')}
        >
          <div className="filter-group-title">
            <HeartHandshake size={14} className="text-burgundy" />
            <span>Marital Status</span>
            {filters.maritalStatus?.length > 0 && (
              <span className="filter-count-bubble">{filters.maritalStatus.length}</span>
            )}
          </div>
          {openSection === 'marital' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {openSection === 'marital' && (
          <div className="filter-pills-row animate-fade-in">
            {["Never Married", "Divorced", "Widowed", "Awaiting Divorce"].map((status) => {
              const isSelected = (filters.maritalStatus || []).includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  className={`filter-pill-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCheckboxChange('maritalStatus', status)}
                >
                  {status}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isOpenMobile && (
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={onCloseMobile}
          style={{ marginTop: '1.25rem' }}
        >
          Apply Filters ({activeCount})
        </button>
      )}
    </aside>
  );
}
