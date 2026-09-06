import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import { Bookmark, LayoutGrid, List } from 'lucide-react';
import ProfileCard from '../../components/discover/ProfileCard';
import { EmptyState } from '../../components/common/EmptyState';
import '../../styles/matches.css';

export default function Shortlist() {
  const navigate = useNavigate();
  const { shortlist } = useApp();
  const [viewMode, setViewMode] = useState('grid');
  const allProfiles = useMemo(() => mockDb.getProfiles(), []);

  const shortlistedProfiles = useMemo(() => {
    return shortlist.map((item) => {
      const p = allProfiles.find((profile) => profile.id === item.profileId);
      return { profile: p, note: item.note, addedAt: item.addedAt };
    }).filter((item) => item.profile !== undefined);
  }, [shortlist, allProfiles]);

  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bookmark size={24} className="text-gold" fill="currentColor" />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-950)' }}>
              My Shortlisted Profiles ({shortlistedProfiles.length})
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Your bookmarked Telugu bride and groom candidates for family review and discussion.
          </p>
        </div>

        {shortlistedProfiles.length > 0 && (
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
        )}
      </div>

      {shortlistedProfiles.length === 0 ? (
        <EmptyState
          title="No shortlisted profiles"
          description="Click the bookmark icon on any profile card to save candidates for later review."
          icon={Bookmark}
          actionText="Discover Profiles"
          onAction={() => navigate('/discover')}
        />
      ) : (
        <div className={viewMode === 'list' ? 'profiles-list' : 'profiles-grid'}>
          {shortlistedProfiles.map(({ profile }) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

