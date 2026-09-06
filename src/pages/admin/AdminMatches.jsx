import React, { useState, useMemo } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Heart,
  Search,
  CheckCircle2,
  Users,
  Star,
  Send,
  Filter,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminMatches() {
  const { showToast } = useApp();

  const [matches, setMatches] = useState(() => mockDb.getMatches());
  const [profiles] = useState(() => mockDb.getProfiles());
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Matchmaker Tool State
  const [selectedGroom, setSelectedGroom] = useState('');
  const [selectedBride, setSelectedBride] = useState('');
  const [matchmakerNotes, setMatchmakerNotes] = useState('');

  const grooms = useMemo(() => profiles.filter((p) => p.gender === 'male'), [profiles]);
  const brides = useMemo(() => profiles.filter((p) => p.gender === 'female'), [profiles]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchGroom = (m.groomName || '').toLowerCase().includes(q);
        const matchBride = (m.brideName || '').toLowerCase().includes(q);
        const matchGroomComm = (m.groomCommunity || '').toLowerCase().includes(q);
        const matchBrideComm = (m.brideCommunity || '').toLowerCase().includes(q);
        if (!matchGroom && !matchBride && !matchGroomComm && !matchBrideComm) return false;
      }
      return true;
    });
  }, [matches, searchQuery]);

  const handleCreateManualMatch = (e) => {
    e.preventDefault();
    if (!selectedGroom || !selectedBride) {
      showToast("Please select both a Groom and a Bride candidate.", "warning");
      return;
    }

    const groomObj = profiles.find((p) => p.id === selectedGroom);
    const brideObj = profiles.find((p) => p.id === selectedBride);

    if (groomObj && brideObj) {
      const newMatch = mockDb.createManualMatch(groomObj, brideObj, matchmakerNotes);
      setMatches(mockDb.getMatches());
      showToast(`Matchmaker introduction created between ${groomObj.name} and ${brideObj.name}! 💍`, "success");
      setSelectedGroom('');
      setSelectedBride('');
      setMatchmakerNotes('');
    }
  };

  return (
    <AdminLayout
      title="Matchmaking and Matches"
      description="Algorithmic compatibility metrics, Vedic horoscope evaluations, and manual concierge matchmaker tools"
    >
      {/* 4 Stats Cards */}
      <div className="admin-kpi-4-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <Heart size={20} />
            </div>
            <span className="admin-badge success">+11.8% MoM</span>
          </div>
          <div>
            <div className="admin-kpi-number">1,256</div>
            <div className="admin-kpi-label">Successful Marriages</div>
            <div className="admin-kpi-subtext">Couples engaged/wedded</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-primary-tint)', color: 'var(--admin-primary)' }}>
              <TrendingUp size={20} />
            </div>
            <span className="admin-badge primary">High Quality</span>
          </div>
          <div>
            <div className="admin-kpi-number">91.4%</div>
            <div className="admin-kpi-label">Avg. Compatibility Score</div>
            <div className="admin-kpi-subtext">Gothram, Career and Lifestyle</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-gold-tint)', color: 'var(--admin-gold)' }}>
              <Star size={20} />
            </div>
            <span className="admin-badge gold">VIP Concierge</span>
          </div>
          <div>
            <div className="admin-kpi-number">480</div>
            <div className="admin-kpi-label">Curated Introductions</div>
            <div className="admin-kpi-subtext">Senior matchmaker assisted</div>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-top">
            <div className="admin-kpi-icon-box" style={{ backgroundColor: 'var(--admin-info-bg)', color: 'var(--admin-info)' }}>
              <Users size={20} />
            </div>
            <span className="admin-badge info">Active</span>
          </div>
          <div>
            <div className="admin-kpi-number">5,410</div>
            <div className="admin-kpi-label">In-Progress Family Chats</div>
            <div className="admin-kpi-subtext">Mutual interests connecting</div>
          </div>
        </div>
      </div>

      <div className="admin-split-12-grid">
        {/* Left Column: Live Matches Ledger (7 Cols) */}
        <div className="admin-card col-span-7">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                <Heart size={18} style={{ color: 'var(--admin-primary)' }} />
                Matrimonial Matches Generated
              </h3>
              <p className="admin-card-subtitle">Recent algorithm and relationship advisor matched pairs</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                className="admin-input"
                style={{ width: '100%', paddingLeft: '2rem' }}
                placeholder="Search groom, bride or community..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--admin-surface-subtle)',
                  border: '1px solid var(--admin-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Couple Top */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Groom */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={m.groomPhoto || '/assets/branding/Default_Male_Avatar.svg'}
                      alt={m.groomName}
                      className="admin-table-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/branding/Default_Male_Avatar.svg';
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{m.groomName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {m.groomCommunity} • {m.groomLocation}
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Badge */}
                  <div style={{ textAlign: 'center' }}>
                    <span className="admin-badge success" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                      {m.compatibilityScore}% Compatibility
                    </span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      {m.horoscopeMatch}
                    </div>
                  </div>

                  {/* Bride */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{m.brideName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {m.brideCommunity} • {m.brideLocation}
                      </div>
                    </div>
                    <img
                      src={m.bridePhoto || '/assets/branding/Default_Female_Avatar.svg'}
                      alt={m.brideName}
                      className="admin-table-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/branding/Default_Female_Avatar.svg';
                      }}
                    />
                  </div>
                </div>

                {/* Match Bottom Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--admin-border-subtle)', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>
                    Status: <strong style={{ color: 'var(--admin-primary)' }}>{m.status}</strong>
                  </span>
                  <span style={{ color: 'var(--admin-text-muted)' }}>
                    Created: {new Date(m.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Senior Matchmaker Tool (5 Cols) */}
        <div className="admin-card col-span-5">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">
                Concierge Matchmaker Assist
              </h3>
              <p className="admin-card-subtitle">Curate custom introductions for Telugu Elite VIPs</p>
            </div>
          </div>

          <form onSubmit={handleCreateManualMatch}>
            <div className="admin-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Groom Candidate</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={selectedGroom}
                  onChange={(e) => setSelectedGroom(e.target.value)}
                  required
                >
                  <option value="">-- Choose Groom Profile --</option>
                  {grooms.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id}) • {g.community} • {g.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Select Bride Candidate</label>
                <select
                  className="admin-select"
                  style={{ width: '100%' }}
                  value={selectedBride}
                  onChange={(e) => setSelectedBride(e.target.value)}
                  required
                >
                  <option value="">-- Choose Bride Profile --</option>
                  {brides.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.id}) • {b.community} • {b.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Matchmaker Recommendation Note</label>
                <textarea
                  className="admin-input"
                  rows="3"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Matchmaker recommendation and compatibility note..."
                  value={matchmakerNotes}
                  onChange={(e) => setMatchmakerNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-md"
                style={{ width: '100%', justifyContent: 'center', gap: '0.4rem' }}
              >
                <Send size={16} />
                Generate Matchmaker Introduction
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
