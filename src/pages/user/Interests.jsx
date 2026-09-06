import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockDb } from '../../services/mockDb';
import {
  Heart,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageCircle,
  Eye,
  LayoutGrid,
  List,
  Search,
  X,
  Bookmark,
  Sparkles,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Users
} from 'lucide-react';
import ProfileCard from '../../components/discover/ProfileCard';
import { EmptyState } from '../../components/common/EmptyState';
import '../../styles/interests.css';
import '../../styles/matches.css';

const EMPTY_ARRAY = [];

function formatInterestDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export default function Interests() {
  const navigate = useNavigate();
  const { interests, shortlist, updateInterestStatus, withdrawInterest } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'accepted' | 'declined'

  // Local synced state for immediate responsiveness and cross-tab real-time sync
  const [localInterests, setLocalInterests] = useState(() => interests || { received: [], sent: [] });
  const [allProfiles, setAllProfiles] = useState(() => mockDb.getProfiles() || []);

  // Synchronize when AppContext updates
  useEffect(() => {
    if (interests) {
      setLocalInterests(interests);
    }
  }, [interests]);

  // Real-time synchronization subscription to mockDb and window events
  useEffect(() => {
    const handleUpdate = () => {
      const activeUser = mockDb.getCurrentUser();
      const activeUserId = activeUser?.id || 'TB-USER-01';
      const freshInterests = mockDb.getInterestsForUser(activeUserId);
      setLocalInterests(freshInterests || { received: [], sent: [] });
      setAllProfiles(mockDb.getProfiles() || []);
    };

    const unsubscribe = mockDb.subscribe((type) => {
      if (type === 'interests' || type === 'shortlist' || type === 'storage_sync' || type === 'profiles' || type === 'user_updated') {
        handleUpdate();
      }
    });

    window.addEventListener('telugubandham_realtime_event', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('telugubandham_realtime_event', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const [withdrawingId, setWithdrawingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleWithdraw = async (interestId, targetId) => {
    if (withdrawingId) return;
    const actionKey = String(interestId || targetId || '').trim();
    setWithdrawingId(actionKey);
    const targetKey = actionKey.toLowerCase();
    try {
      setLocalInterests(prev => ({
        ...prev,
        sent: (prev?.sent || []).filter(i =>
          String(i.id).toLowerCase() !== targetKey &&
          String(i.receiverId || i.targetId || '').toLowerCase() !== targetKey
        )
      }));
      if (withdrawInterest) {
        await withdrawInterest(interestId || targetId);
      }
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleStatusUpdate = async (interestId, newStatus) => {
    if (updatingStatusId) return;
    setUpdatingStatusId(interestId);
    try {
      setLocalInterests(prev => ({
        ...prev,
        received: (prev?.received || []).map(i =>
          String(i.id).toLowerCase() === String(interestId).toLowerCase()
            ? { ...i, status: newStatus }
            : i
        )
      }));
      if (updateInterestStatus) {
        await updateInterestStatus(interestId, newStatus);
      }
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const receivedList = Array.isArray(localInterests?.received) ? localInterests.received : EMPTY_ARRAY;
  const sentList = Array.isArray(localInterests?.sent) ? localInterests.sent : EMPTY_ARRAY;

  const shortlistedProfiles = useMemo(() => {
    const list = Array.isArray(shortlist) ? shortlist : [];
    return list.map((item) => {
      const p = allProfiles.find((profile) => String(profile.id).toLowerCase() === String(item.profileId).toLowerCase());
      return { profile: p, note: item.note, addedAt: item.addedAt };
    }).filter((item) => item.profile !== undefined);
  }, [shortlist, allProfiles]);

  const explicitTab = searchParams.get('tab');
  const activeTab = useMemo(() => {
    if (explicitTab) return explicitTab;
    if (sentList.length > 0 && receivedList.length === 0) return 'sent';
    if (receivedList.length > 0) return 'received';
    if (shortlistedProfiles.length > 0) return 'shortlisted';
    return 'sent';
  }, [explicitTab, receivedList.length, sentList.length, shortlistedProfiles.length]);

  const setTab = (tab) => {
    setSearchParams({ tab });
    setSearchQuery('');
    setStatusFilter('all');
  };

  // Enriched Sent List with full profile data fallback
  const enrichedSentList = useMemo(() => {
    return sentList.map((item) => {
      const candidateProfile = allProfiles.find(
        (p) => String(p.id).toLowerCase() === String(item.receiverId || item.targetId || '').toLowerCase() ||
               (p.name && item.receiverName && p.name.trim().toLowerCase() === item.receiverName.trim().toLowerCase())
      );
      const isMale = candidateProfile?.gender === 'male' || (item.receiverGender === 'male');
      const defaultPortrait = isMale
        ? '/assets/profiles/male/Male_Profile_01.jpg'
        : '/assets/profiles/female/Female_Profile_01.jpg';

      const photo =
        (candidateProfile?.photos && candidateProfile.photos[0]) ||
        item.receiverPhoto ||
        defaultPortrait;

      return {
        ...item,
        candidate: candidateProfile,
        photo,
        name: candidateProfile?.name || item.receiverName || 'Telugu Member',
        age: candidateProfile?.age || item.receiverAge || 26,
        profession: candidateProfile?.profession || item.receiverProfession || 'Professional',
        city: candidateProfile?.city || item.receiverCity || 'Hyderabad',
        community: candidateProfile?.community || item.receiverCommunity || 'Telugu Community',
        subCaste: candidateProfile?.subCaste || '',
        state: candidateProfile?.state || item.receiverState || 'Telangana',
        education: candidateProfile?.education || item.receiverEducation || 'Higher Education',
        isVerified: candidateProfile?.isVerified || false,
        status: item.status || 'pending'
      };
    });
  }, [sentList, allProfiles]);

  // Enriched Received List with full profile data fallback
  const enrichedReceivedList = useMemo(() => {
    return receivedList.map((item) => {
      const candidateProfile = allProfiles.find(
        (p) => String(p.id).toLowerCase() === String(item.senderId || item.userId || '').toLowerCase() ||
               (p.name && item.senderName && p.name.trim().toLowerCase() === item.senderName.trim().toLowerCase())
      );
      const isMale = candidateProfile?.gender === 'male' || (item.senderGender === 'male');
      const defaultPortrait = isMale
        ? '/assets/profiles/male/Male_Profile_01.jpg'
        : '/assets/profiles/female/Female_Profile_01.jpg';

      const photo =
        (candidateProfile?.photos && candidateProfile.photos[0]) ||
        item.senderPhoto ||
        defaultPortrait;

      return {
        ...item,
        candidate: candidateProfile,
        photo,
        name: candidateProfile?.name || item.senderName || 'Telugu Member',
        age: candidateProfile?.age || item.senderAge || 26,
        profession: candidateProfile?.profession || item.senderProfession || 'Professional',
        city: candidateProfile?.city || item.senderCity || 'Hyderabad',
        community: candidateProfile?.community || item.senderCommunity || 'Telugu Community',
        subCaste: candidateProfile?.subCaste || '',
        state: candidateProfile?.state || item.senderState || 'Telangana',
        education: candidateProfile?.education || item.senderEducation || 'Higher Education',
        isVerified: candidateProfile?.isVerified || false,
        status: item.status || 'pending'
      };
    });
  }, [receivedList, allProfiles]);

  // Filtered Sent List based on search and status
  const filteredSentList = useMemo(() => {
    return enrichedSentList.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesComm = item.community.toLowerCase().includes(q);
        const matchesProf = item.profession.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        return matchesName || matchesComm || matchesProf || matchesCity;
      }
      return true;
    });
  }, [enrichedSentList, statusFilter, searchQuery]);

  // Filtered Received List based on search and status
  const filteredReceivedList = useMemo(() => {
    return enrichedReceivedList.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesComm = item.community.toLowerCase().includes(q);
        const matchesProf = item.profession.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        return matchesName || matchesComm || matchesProf || matchesCity;
      }
      return true;
    });
  }, [enrichedReceivedList, statusFilter, searchQuery]);

  // Stats calculation
  const totalReceived = enrichedReceivedList.length;
  const totalSent = enrichedSentList.length;
  const totalAccepted = enrichedSentList.filter(i => i.status === 'accepted').length + enrichedReceivedList.filter(i => i.status === 'accepted').length;
  const totalShortlisted = shortlistedProfiles.length;

  return (
    <div className="container-wide tb-interests-page">
      {/* Header */}
      <div className="tb-interests-header">
        <div className="tb-interests-title-row">
          <h1 className="tb-interests-title">
            <span>Interests & Connection Requests</span>
            <span className="badge badge-gold" style={{ fontSize: '0.85rem' }}>
              <Sparkles size={14} /> Real-Time Live Sync
            </span>
          </h1>
        </div>
        <p className="tb-interests-subtitle">
          Manage your incoming matrimonial interest expressions, track sent proposals, and connect directly with compatible Telugu candidates.
        </p>
      </div>

      {/* Stats Overview Strip */}
      <div className="tb-interests-stats-strip">
        <div className="tb-interests-stat-card" onClick={() => setTab('received')} style={{ cursor: 'pointer' }}>
          <div className="tb-interests-stat-icon-wrap received">
            <Heart size={22} fill="currentColor" />
          </div>
          <div>
            <div className="tb-interests-stat-number">{totalReceived}</div>
            <div className="tb-interests-stat-label">Interests Received</div>
          </div>
        </div>

        <div className="tb-interests-stat-card" onClick={() => setTab('sent')} style={{ cursor: 'pointer' }}>
          <div className="tb-interests-stat-icon-wrap sent">
            <Send size={22} />
          </div>
          <div>
            <div className="tb-interests-stat-number">{totalSent}</div>
            <div className="tb-interests-stat-label">Interests Sent</div>
          </div>
        </div>

        <div className="tb-interests-stat-card">
          <div className="tb-interests-stat-icon-wrap accepted">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="tb-interests-stat-number">{totalAccepted}</div>
            <div className="tb-interests-stat-label">Mutual Connections</div>
          </div>
        </div>

        <div className="tb-interests-stat-card" onClick={() => setTab('shortlisted')} style={{ cursor: 'pointer' }}>
          <div className="tb-interests-stat-icon-wrap shortlist">
            <Bookmark size={22} fill="currentColor" />
          </div>
          <div>
            <div className="tb-interests-stat-number">{totalShortlisted}</div>
            <div className="tb-interests-stat-label">Shortlisted Profiles</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tb-interests-nav-tabs">
        <button
          type="button"
          onClick={() => setTab('sent')}
          className={`tb-interests-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
        >
          <Send size={18} />
          <span>Interests Sent</span>
          <span className="tb-interests-badge-count">{sentList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('received')}
          className={`tb-interests-tab-btn ${activeTab === 'received' ? 'active' : ''}`}
        >
          <Heart size={18} fill={activeTab === 'received' ? 'currentColor' : 'none'} />
          <span>Interests Received</span>
          <span className="tb-interests-badge-count">{receivedList.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('shortlisted')}
          className={`tb-interests-tab-btn ${activeTab === 'shortlisted' ? 'active' : ''}`}
        >
          <Bookmark size={18} fill={activeTab === 'shortlisted' ? 'currentColor' : 'none'} />
          <span>Shortlisted profiles</span>
          <span className="tb-interests-badge-count">{shortlistedProfiles.length}</span>
        </button>
      </div>

      {/* =========================================================================
          SENT TAB
          ========================================================================= */}
      {activeTab === 'sent' && (
        <div className="animate-fade-in">
          {/* Toolbar */}
          {enrichedSentList.length > 0 && (
            <div className="tb-interests-toolbar">
              <div className="tb-interests-search-box">
                <Search size={16} className="tb-interests-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sent requests by name, community..."
                  className="tb-interests-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="tb-interests-clear-search"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="tb-interests-filter-chips">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`tb-interests-chip ${statusFilter === 'all' ? 'active' : ''}`}
                >
                  All ({enrichedSentList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`tb-interests-chip ${statusFilter === 'pending' ? 'active' : ''}`}
                >
                  Awaiting Response ({enrichedSentList.filter(i => i.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('accepted')}
                  className={`tb-interests-chip ${statusFilter === 'accepted' ? 'active' : ''}`}
                >
                  Accepted ({enrichedSentList.filter(i => i.status === 'accepted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('declined')}
                  className={`tb-interests-chip ${statusFilter === 'declined' ? 'active' : ''}`}
                >
                  Declined ({enrichedSentList.filter(i => i.status === 'declined').length})
                </button>
              </div>

              <div className="tb-matches-view-switcher" role="group" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`tb-matches-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`tb-matches-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Results List / Grid */}
          {enrichedSentList.length === 0 ? (
            <EmptyState
              title="You haven't sent any interests yet"
              description="Browse through discovered profiles and express free interest to candidates you like."
              actionText="Browse Matches"
              onAction={() => navigate('/matches')}
            />
          ) : filteredSentList.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1rem' }}>
                No sent interest requests matched your search filters.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredSentList.map((item) => (
                <div key={item.id} className="tb-interest-list-card animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '260px' }}>
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="tb-interest-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/profiles/female/Female_Profile_01.jpg';
                      }}
                    />
                    <div className="tb-interest-details">
                      <div className="tb-interest-name-row">
                        <Link to={`/profile/${item.receiverId || item.targetId}`} className="tb-interest-name-link">
                          {item.name}
                        </Link>
                        {item.status === 'accepted' && <span className="badge badge-success">Accepted 🎉</span>}
                        {item.status === 'declined' && <span className="badge badge-warning">Declined</span>}
                        {item.status === 'pending' && <span className="badge badge-info">Awaiting Response</span>}
                      </div>
                      <div className="tb-interest-meta-line">
                        {item.age} yrs • {item.community}{item.subCaste ? ` (${item.subCaste})` : ''} • {item.profession} • {item.city}
                      </div>
                      {item.message && (
                        <div className="tb-interest-message-box">
                          "{item.message}"
                        </div>
                      )}
                      <div className="tb-interest-date">
                        <Calendar size={13} />
                        <span>Sent on: {formatInterestDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sent Actions */}
                  <div className="tb-interest-actions">
                    <Link to={`/profile/${item.receiverId || item.targetId}`} className="btn btn-secondary btn-sm">
                      <Eye size={15} /> Bio-Data
                    </Link>

                    {item.status === 'accepted' ? (
                      <Link to="/messages" className="btn btn-primary btn-sm">
                        <MessageCircle size={15} /> Chat Now
                      </Link>
                    ) : item.status === 'pending' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleWithdraw(item.id, item.receiverId)}
                        disabled={withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)}
                        style={{
                          color: 'var(--danger, #DC2626)',
                          opacity: (withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? 0.6 : 1
                        }}
                      >
                        <RotateCcw size={14} className={(withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? "spin" : ""} />
                        <span>{(withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? "Withdrawing..." : "Withdraw Request"}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div className="tb-interests-grid">
              {filteredSentList.map((item) => (
                <div key={item.id} className="tb-interest-grid-card animate-fade-in">
                  <div className="tb-interest-grid-img-wrap">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="tb-interest-grid-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/profiles/female/Female_Profile_01.jpg';
                      }}
                    />
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      {item.status === 'accepted' && <span className="badge badge-success">Accepted 🎉</span>}
                      {item.status === 'declined' && <span className="badge badge-warning">Declined</span>}
                      {item.status === 'pending' && <span className="badge badge-info">Awaiting Response</span>}
                    </div>
                  </div>

                  <div className="tb-interest-grid-body">
                    <Link to={`/profile/${item.receiverId || item.targetId}`} className="tb-interest-grid-name">
                      {item.name}, {item.age} yrs
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {item.community} • {item.profession}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {item.city}, {item.state}
                    </div>
                    {item.message && (
                      <div className="tb-interest-message-box" style={{ marginBottom: '1rem' }}>
                        "{item.message.length > 70 ? `${item.message.slice(0, 70)}...` : item.message}"
                      </div>
                    )}

                    <div className="tb-interest-grid-footer">
                      <Link to={`/profile/${item.receiverId || item.targetId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <Eye size={14} /> Bio-Data
                      </Link>
                      {item.status === 'accepted' ? (
                        <Link to="/messages" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                          <MessageCircle size={14} /> Chat
                        </Link>
                      ) : item.status === 'pending' ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleWithdraw(item.id, item.receiverId)}
                          disabled={withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)}
                          style={{
                            color: 'var(--danger, #DC2626)',
                            opacity: (withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? 0.6 : 1
                          }}
                          title="Withdraw request"
                        >
                          <RotateCcw size={14} className={(withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? "spin" : ""} />
                          <span>{(withdrawingId === item.id || withdrawingId === (item.receiverId || item.targetId)) ? "..." : "Withdraw"}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          RECEIVED TAB
          ========================================================================= */}
      {activeTab === 'received' && (
        <div className="animate-fade-in">
          {/* Toolbar */}
          {enrichedReceivedList.length > 0 && (
            <div className="tb-interests-toolbar">
              <div className="tb-interests-search-box">
                <Search size={16} className="tb-interests-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search received requests by name, community..."
                  className="tb-interests-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="tb-interests-clear-search"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="tb-interests-filter-chips">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`tb-interests-chip ${statusFilter === 'all' ? 'active' : ''}`}
                >
                  All ({enrichedReceivedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`tb-interests-chip ${statusFilter === 'pending' ? 'active' : ''}`}
                >
                  Pending ({enrichedReceivedList.filter(i => i.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('accepted')}
                  className={`tb-interests-chip ${statusFilter === 'accepted' ? 'active' : ''}`}
                >
                  Accepted ({enrichedReceivedList.filter(i => i.status === 'accepted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('declined')}
                  className={`tb-interests-chip ${statusFilter === 'declined' ? 'active' : ''}`}
                >
                  Declined ({enrichedReceivedList.filter(i => i.status === 'declined').length})
                </button>
              </div>

              <div className="tb-matches-view-switcher" role="group" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`tb-matches-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="List View"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`tb-matches-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Received Content */}
          {enrichedReceivedList.length === 0 ? (
            <EmptyState
              title="No interests received yet"
              description="Keep your profile complete and active to attract compatible Telugu brides and grooms."
              actionText="Discover Profiles"
              onAction={() => navigate('/discover')}
            />
          ) : filteredReceivedList.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1rem' }}>
                No received interest requests matched your search filters.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReceivedList.map((item) => (
                <div key={item.id} className="tb-interest-list-card animate-fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: '260px' }}>
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="tb-interest-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/profiles/female/Female_Profile_01.jpg';
                      }}
                    />
                    <div className="tb-interest-details">
                      <div className="tb-interest-name-row">
                        <Link to={`/profile/${item.senderId || item.userId}`} className="tb-interest-name-link">
                          {item.name}
                        </Link>
                        {item.status === 'accepted' && <span className="badge badge-success">Accepted 🎉</span>}
                        {item.status === 'declined' && <span className="badge badge-warning">Declined</span>}
                        {item.status === 'pending' && <span className="badge badge-info">Pending Response</span>}
                      </div>
                      <div className="tb-interest-meta-line">
                        {item.age} yrs • {item.community}{item.subCaste ? ` (${item.subCaste})` : ''} • {item.profession} • {item.city}
                      </div>
                      {item.message && (
                        <div className="tb-interest-message-box">
                          "{item.message}"
                        </div>
                      )}
                      <div className="tb-interest-date">
                        <Calendar size={13} />
                        <span>Received on: {formatInterestDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Received Actions */}
                  <div className="tb-interest-actions">
                    <Link to={`/profile/${item.senderId || item.userId}`} className="btn btn-secondary btn-sm">
                      <Eye size={15} /> Bio-Data
                    </Link>

                    {item.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStatusUpdate(item.id, 'accepted')}
                          disabled={updatingStatusId === item.id}
                        >
                          <CheckCircle2 size={15} /> {updatingStatusId === item.id ? "Updating..." : "Accept Interest"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleStatusUpdate(item.id, 'declined')}
                          disabled={updatingStatusId === item.id}
                        >
                          <XCircle size={15} /> Decline
                        </button>
                      </>
                    ) : item.status === 'accepted' ? (
                      <Link to="/messages" className="btn btn-primary btn-sm">
                        <MessageCircle size={15} /> Start Chat
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Received Grid View */
            <div className="tb-interests-grid">
              {filteredReceivedList.map((item) => (
                <div key={item.id} className="tb-interest-grid-card animate-fade-in">
                  <div className="tb-interest-grid-img-wrap">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="tb-interest-grid-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/profiles/female/Female_Profile_01.jpg';
                      }}
                    />
                    <div style={{ position: 'absolute', top: 12, right: 12 }}>
                      {item.status === 'accepted' && <span className="badge badge-success">Accepted 🎉</span>}
                      {item.status === 'declined' && <span className="badge badge-warning">Declined</span>}
                      {item.status === 'pending' && <span className="badge badge-info">Pending Response</span>}
                    </div>
                  </div>

                  <div className="tb-interest-grid-body">
                    <Link to={`/profile/${item.senderId || item.userId}`} className="tb-interest-grid-name">
                      {item.name}, {item.age} yrs
                    </Link>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {item.community} • {item.profession}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {item.city}, {item.state}
                    </div>
                    {item.message && (
                      <div className="tb-interest-message-box" style={{ marginBottom: '1rem' }}>
                        "{item.message.length > 70 ? `${item.message.slice(0, 70)}...` : item.message}"
                      </div>
                    )}

                    <div className="tb-interest-grid-footer">
                      <Link to={`/profile/${item.senderId || item.userId}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <Eye size={14} /> Bio-Data
                      </Link>
                      {item.status === 'pending' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStatusUpdate(item.id, 'accepted')}
                          disabled={updatingStatusId === item.id}
                          style={{ flex: 1 }}
                        >
                          <CheckCircle2 size={14} /> {updatingStatusId === item.id ? "..." : "Accept"}
                        </button>
                      ) : item.status === 'accepted' ? (
                        <Link to="/messages" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                          <MessageCircle size={14} /> Chat
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SHORTLISTED PROFILES TAB
          ========================================================================= */}
      {activeTab === 'shortlisted' && (
        <div className="animate-fade-in">
          {shortlistedProfiles.length === 0 ? (
            <EmptyState
              title="No shortlisted profiles yet"
              description="Click the bookmark icon on any profile card to save candidates to your shortlist for family review."
              actionText="Discover Profiles"
              onAction={() => navigate('/discover')}
            />
          ) : (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Showing {shortlistedProfiles.length} {shortlistedProfiles.length === 1 ? 'Shortlisted Profile' : 'Shortlisted Profiles'}
                </span>

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

              {/* Profiles Grid / List */}
              <div className={viewMode === 'list' ? 'profiles-list' : 'profiles-grid'}>
                {shortlistedProfiles.map(({ profile }) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
