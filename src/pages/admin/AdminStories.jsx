import React, { useState, useEffect } from 'react';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Plus,
  Edit2,
  Trash2,
  Heart,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  X,
  CheckCircle2
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminStories() {
  const { showToast } = useApp();

  const [stories, setStories] = useState(() => mockDb.getStories());

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = mockDb.subscribe(() => {
      setStories(mockDb.getStories());
    });
    return () => unsubscribe();
  }, []);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStory, setEditStory] = useState(null);

  // Form State
  const [coupleName, setCoupleName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [location, setLocation] = useState('');
  const [community, setCommunity] = useState('');
  const [storyText, setStoryText] = useState('');
  const [groomJob, setGroomJob] = useState('');
  const [brideJob, setBrideJob] = useState('');
  const [quote, setQuote] = useState('');

  const handleOpenAdd = () => {
    setCoupleName('');
    setWeddingDate('');
    setLocation('');
    setCommunity('');
    setStoryText('');
    setGroomJob('');
    setBrideJob('');
    setQuote('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditStory(s);
    setCoupleName(s.coupleName);
    setWeddingDate(s.weddingDate);
    setLocation(s.location);
    setCommunity(s.community);
    setStoryText(s.story);
    setGroomJob(s.groomJob);
    setBrideJob(s.brideJob);
    setQuote(s.quote);
  };

  const handleSaveStory = (e) => {
    e.preventDefault();
    if (!coupleName || !storyText) return;

    if (editStory) {
      mockDb.updateStory(editStory.id, {
        coupleName,
        weddingDate,
        location,
        community,
        story: storyText,
        groomJob,
        brideJob,
        quote
      });
      showToast("Success story updated! ✨", "success");
      setEditStory(null);
    } else {
      mockDb.addStory({
        coupleName,
        weddingDate,
        location,
        community,
        story: storyText,
        groomJob,
        brideJob,
        quote,
        photo: "/assets/couples/Success_Story_01.jpg"
      });
      showToast("New wedding story published! 💍", "success");
      setIsAddOpen(false);
    }

    setStories(mockDb.getStories());
  };

  const handleDeleteStory = (storyId) => {
    mockDb.deleteStory(storyId);
    setStories(mockDb.getStories());
    showToast("Story deleted from showcase.", "info");
  };

  const handleToggleFeatured = (storyId, name) => {
    mockDb.toggleStoryFeatured(storyId);
    setStories(mockDb.getStories());
    showToast(`Updated spotlight status for ${name}! ⭐`, "info");
  };

  return (
    <AdminLayout
      title="Success Stories"
      description="Curate, feature, and edit real TeluguBandham marriage milestones and couple testimonials"
    >
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Featured Wedding Stories ({stories.length})</h3>
            <p className="admin-card-subtitle">Showcase genuine Telugu matchmaking success journeys</p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleOpenAdd}
            style={{ gap: '0.4rem' }}
          >
            <Plus size={16} />
            Add New Story
          </button>
        </div>

        <div className="admin-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
          {stories.map((s) => (
            <div
              key={s.id}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--admin-border)',
                backgroundColor: 'var(--admin-surface-subtle)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '210px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--admin-surface-subtle)' }}>
                <img
                  src={s.photo || '/assets/couples/Success_Story_01.jpg'}
                  alt={s.coupleName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: s.id === 'STORY-1' ? 'center 8%' : s.id === 'STORY-4' ? 'center 10%' : 'center 18%',
                    display: 'block'
                  }}
                />
                <span className="admin-badge gold" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  {s.weddingDate}
                </span>
                {s.featured && (
                  <span className="admin-badge gold" style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} fill="currentColor" /> Spotlight
                  </span>
                )}
              </div>

              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{s.coupleName}</h4>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      {s.community} • {s.location}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary)', lineHeight: 1.45, margin: '0.25rem 0', flex: 1 }}>
                  "{s.quote || s.story.slice(0, 110)}..."
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--admin-border-subtle)' }}>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    style={{
                      width: '32px',
                      height: '32px',
                      color: s.featured ? 'var(--admin-gold)' : 'var(--admin-text-muted)',
                      backgroundColor: s.featured ? 'var(--admin-gold-tint)' : 'var(--admin-surface-subtle)',
                      border: '1px solid var(--admin-border-subtle)'
                    }}
                    onClick={() => handleToggleFeatured(s.id, s.coupleName)}
                    title={s.featured ? "Remove from Featured Spotlight" : "1-Click Feature on Home Spotlight ⭐"}
                  >
                    <Star size={14} fill={s.featured ? "currentColor" : "none"} />
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(s)}
                      style={{ gap: '0.35rem' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--admin-danger)' }}
                      onClick={() => handleDeleteStory(s.id)}
                      title="Delete Story"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editStory) && (
        <div className="admin-modal-overlay" onClick={() => { setIsAddOpen(false); setEditStory(null); }}>
          <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  {editStory ? 'Edit Wedding Story' : 'Publish Success Story'}
                </h3>
              </div>
              <button type="button" className="admin-icon-btn" onClick={() => { setIsAddOpen(false); setEditStory(null); }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStory}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Couple Names</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Couple Names"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Wedding Month and Year</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Wedding Month and Year"
                      value={weddingDate}
                      onChange={(e) => setWeddingDate(e.target.value)}
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Location / City</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Community</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Community Details"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Couple Testimonial Quote</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Couple testimonial quote"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Full Story Journey</label>
                  <textarea
                    className="admin-input"
                    rows="3"
                    placeholder="Write detailed background of how they connected..."
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    style={{ width: '100%', resize: 'vertical' }}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-secondary btn-md" onClick={() => { setIsAddOpen(false); setEditStory(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  {editStory ? 'Save Changes' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
