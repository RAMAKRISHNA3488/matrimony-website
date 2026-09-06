import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedGender,
  setSelectedGender,
  selectedCommunity,
  setSelectedCommunity,
  selectedCity,
  setSelectedCity,
  customCommunity = '',
  setCustomCommunity,
  customCity = '',
  setCustomCity,
  onSearch
}) {
  const communities = [
    "All Communities",
    "Reddy",
    "Kamma",
    "Brahmin - Niyogi",
    "Brahmin - Vaidiki",
    "Kapu",
    "Arya Vysya",
    "Balija",
    "Padmashali",
    "Velama",
    "Yadav",
    "Mudiraj",
    "Other"
  ];

  const cities = [
    "All Locations",
    "Hyderabad",
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Tirupati",
    "Bangalore",
    "Dallas",
    "San Jose",
    "Other"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form className="search-bar-card animate-fade-in" onSubmit={handleSubmit}>
      <div className="search-bar-grid">
        {/* Looking For */}
        <div className="search-input-group">
          <label className="search-input-label">Looking for a</label>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">All Brides and Grooms (Female & Male)</option>
            <option value="female">Telugu Bride (Female)</option>
            <option value="male">Telugu Groom (Male)</option>
          </select>
        </div>

        {/* Community */}
        <div className="search-input-group">
          <label className="search-input-label">Community</label>
          <select
            value={selectedCommunity}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCommunity(val);
              if (val !== 'other' && setCustomCommunity) {
                setCustomCommunity('');
              }
            }}
          >
            {communities.map((c) => (
              <option key={c} value={c === "All Communities" ? "all" : c === "Other" ? "other" : c}>
                {c === "Other" ? "Other (Enter Below)" : c}
              </option>
            ))}
          </select>

          {/* New input box if 'Other' is selected */}
          {selectedCommunity === 'other' && (
            <div className="custom-input-wrap animate-fade-in" style={{ marginTop: '0.4rem' }}>
              <input
                type="text"
                className="custom-other-input"
                placeholder="Enter community name..."
                value={customCommunity}
                onChange={(e) => setCustomCommunity && setCustomCommunity(e.target.value)}
                autoFocus
              />
              {customCommunity && (
                <button
                  type="button"
                  onClick={() => setCustomCommunity && setCustomCommunity('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8A8187',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear community"
                  aria-label="Clear community input"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="search-input-group">
          <label className="search-input-label">City / Region</label>
          <select
            value={selectedCity}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCity(val);
              if (val !== 'other' && setCustomCity) {
                setCustomCity('');
              }
            }}
          >
            {cities.map((city) => (
              <option key={city} value={city === "All Locations" ? "all" : city === "Other" ? "other" : city}>
                {city === "Other" ? "Other (Enter Below)" : city}
              </option>
            ))}
          </select>

          {/* New input box if 'Other' is selected */}
          {selectedCity === 'other' && (
            <div className="custom-input-wrap animate-fade-in" style={{ marginTop: '0.4rem' }}>
              <input
                type="text"
                className="custom-other-input"
                placeholder="Enter city, state, or region..."
                value={customCity}
                onChange={(e) => setCustomCity && setCustomCity(e.target.value)}
                autoFocus
              />
              {customCity && (
                <button
                  type="button"
                  onClick={() => setCustomCity && setCustomCity('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8A8187',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Clear city"
                  aria-label="Clear city input"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Keyword or Profile ID */}
        <div className="search-input-group">
          <label className="search-input-label">Keyword / Profession</label>
          <input
            type="text"
            placeholder="Search by profession, company, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Submit Button */}
        <div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            style={{
              marginTop: '1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem'
            }}
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
