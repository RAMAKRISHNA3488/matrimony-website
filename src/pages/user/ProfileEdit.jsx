import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { calculateProfileCompletion } from '../../services/matchingAlgorithm';
import {
  Save,
  User,
  Compass,
  GraduationCap,
  Home,
  Coffee,
  Heart,
  Image,
  FileText,
  CheckCircle2,
  Upload,
  Trash2,
  Star,
  Plus,
  RefreshCw,
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import '../../styles/profile.css';

const TABS = [
  { id: 'personal', label: 'Personal and Physical', icon: User },
  { id: 'horoscope', label: 'Horoscope and Astro', icon: Compass },
  { id: 'career', label: 'Education and Career', icon: GraduationCap },
  { id: 'family', label: 'Family Details', icon: Home },
  { id: 'lifestyle', label: 'Lifestyle and Hobbies', icon: Coffee },
  { id: 'about', label: 'About Me Bio', icon: FileText },
  { id: 'preferences', label: 'Partner Preferences', icon: Heart },
  { id: 'photos', label: 'Manage Photos', icon: Image }
];

export const HEIGHT_OPTIONS = [
  { value: "4'0\"", label: "4'0\" (121 cm)" },
  { value: "4'1\"", label: "4'1\" (124 cm)" },
  { value: "4'2\"", label: "4'2\" (127 cm)" },
  { value: "4'3\"", label: "4'3\" (129 cm)" },
  { value: "4'4\"", label: "4'4\" (132 cm)" },
  { value: "4'5\"", label: "4'5\" (134 cm)" },
  { value: "4'6\"", label: "4'6\" (137 cm)" },
  { value: "4'7\"", label: "4'7\" (139 cm)" },
  { value: "4'8\"", label: "4'8\" (142 cm)" },
  { value: "4'9\"", label: "4'9\" (144 cm)" },
  { value: "4'10\"", label: "4'10\" (147 cm)" },
  { value: "4'11\"", label: "4'11\" (150 cm)" },
  { value: "5'0\"", label: "5'0\" (152 cm)" },
  { value: "5'1\"", label: "5'1\" (155 cm)" },
  { value: "5'2\"", label: "5'2\" (157 cm)" },
  { value: "5'3\"", label: "5'3\" (160 cm)" },
  { value: "5'4\"", label: "5'4\" (162 cm)" },
  { value: "5'5\"", label: "5'5\" (165 cm)" },
  { value: "5'6\"", label: "5'6\" (168 cm)" },
  { value: "5'7\"", label: "5'7\" (170 cm)" },
  { value: "5'8\"", label: "5'8\" (173 cm)" },
  { value: "5'9\"", label: "5'9\" (175 cm)" },
  { value: "5'10\"", label: "5'10\" (178 cm)" },
  { value: "5'11\"", label: "5'11\" (180 cm)" },
  { value: "6'0\"", label: "6'0\" (183 cm)" },
  { value: "6'1\"", label: "6'1\" (185 cm)" },
  { value: "6'2\"", label: "6'2\" (188 cm)" },
  { value: "6'3\"", label: "6'3\" (190 cm)" },
  { value: "6'4\"", label: "6'4\" (193 cm)" },
  { value: "6'5\"", label: "6'5\" (195 cm)" },
  { value: "6'6\"", label: "6'6\" (198 cm)" },
  { value: "6'7\"", label: "6'7\" (201 cm)" },
  { value: "6'8\"", label: "6'8\" (203 cm)" },
  { value: "6'9\"", label: "6'9\" (206 cm)" },
  { value: "6'10\"", label: "6'10\" (208 cm)" },
  { value: "6'11\"", label: "6'11\" (211 cm)" },
  { value: "7'0\"", label: "7'0\" (213 cm)" }
];

export default function ProfileEdit() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const tabFromQuery = searchParams.get('tab') || location.state?.tab;
  const initialTab = tabFromQuery && TABS.some(t => t.id === tabFromQuery) ? tabFromQuery : 'personal';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState('');

  useEffect(() => {
    const currentTab = searchParams.get('tab') || location.state?.tab;
    if (currentTab && TABS.some(t => t.id === currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams, location.state]);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };
  const [formData, setFormData] = useState(() => ({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    height: user?.height || '',
    heightCm: user?.heightCm || '',
    motherTongue: user?.motherTongue || '',
    maritalStatus: user?.maritalStatus || '',
    city: user?.city || '',
    state: user?.state || '',
    country: user?.country || '',
    residenceStatus: user?.residenceStatus || '',

    community: user?.community || '',
    subCaste: user?.subCaste || '',
    gothram: user?.gothram || '',
    raasi: user?.raasi || '',
    nakshatram: user?.nakshatram || '',
    dosham: user?.dosham || '',

    education: user?.education || '',
    college: user?.college || '',
    profession: user?.profession || '',
    company: user?.company || '',
    income: user?.income || '',

    fatherOccupation: user?.fatherOccupation || '',
    motherOccupation: user?.motherOccupation || '',
    brothers: user?.brothers || '',
    sisters: user?.sisters || '',
    familyType: user?.familyType || '',
    familyValues: user?.familyValues || '',
    familyStatus: user?.familyStatus || '',
    nativePlace: user?.nativePlace || '',

    foodHabits: user?.foodHabits || '',
    smoking: user?.smoking || '',
    drinking: user?.drinking || '',
    interests: user?.interests ? user.interests.join(', ') : '',

    aboutMe: user?.aboutMe || '',

    partnerPreferences: {
      ageMin: user?.partnerPreferences?.ageMin || '',
      ageMax: user?.partnerPreferences?.ageMax || '',
      heightMin: user?.partnerPreferences?.heightMin || '',
      communities: user?.partnerPreferences?.communities?.join(', ') || '',
      locations: user?.partnerPreferences?.locations?.join(', ') || '',
      education: user?.partnerPreferences?.education?.join(', ') || '',
      profession: user?.partnerPreferences?.profession?.join(', ') || ''
    },

    photos: user?.photos || []
  }));

  const [isSaving, setIsSaving] = useState(false);

  // Warn on tab reload or closure if dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Intercept navigation link clicks if dirty
  useEffect(() => {
    if (!isDirty) return;

    const handleDocumentClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && !anchor.target) {
        try {
          const targetUrl = new URL(anchor.href);
          const currentUrl = new URL(window.location.href);
          if (targetUrl.pathname !== currentUrl.pathname) {
            e.preventDefault();
            e.stopPropagation();
            setPendingNavigationUrl(targetUrl.pathname + targetUrl.search);
            setShowUnsavedModal(true);
          }
        } catch {}
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [isDirty]);

  const handleChange = (field, value) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrefChange = (field, value) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      partnerPreferences: { ...prev.partnerPreferences, [field]: value }
    }));
  };

  const handleSave = (e, callbackAfterSave) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const processed = {
      ...formData,
      interests: typeof formData.interests === 'string'
        ? formData.interests.split(',').map((i) => i.trim()).filter(Boolean)
        : formData.interests,
      partnerPreferences: {
        ...formData.partnerPreferences,
        communities: typeof formData.partnerPreferences.communities === 'string'
          ? formData.partnerPreferences.communities.split(',').map((c) => c.trim()).filter(Boolean)
          : formData.partnerPreferences.communities,
        locations: typeof formData.partnerPreferences.locations === 'string'
          ? formData.partnerPreferences.locations.split(',').map((l) => l.trim()).filter(Boolean)
          : formData.partnerPreferences.locations,
        education: typeof formData.partnerPreferences.education === 'string'
          ? formData.partnerPreferences.education.split(',').map((e) => e.trim()).filter(Boolean)
          : formData.partnerPreferences.education,
        profession: typeof formData.partnerPreferences.profession === 'string'
          ? formData.partnerPreferences.profession.split(',').map((p) => p.trim()).filter(Boolean)
          : formData.partnerPreferences.profession
      }
    };

    setTimeout(() => {
      updateProfile(processed);
      setIsSaving(false);
      setIsDirty(false);
      showToast("Matrimonial profile updated successfully! 🎉", "success");
      if (typeof callbackAfterSave === 'function') {
        callbackAfterSave();
      }
    }, 400);
  };

  // --- Photo Management Handlers ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    processFiles(files);
    e.target.value = '';
  };

  const processFiles = (files) => {
    const validImageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast?.("Please select valid image files (JPG, PNG, WEBP)", "error");
      return;
    }

    const maxPhotos = 6;
    const currentPhotos = formData.photos || [];

    // If replacing a specific photo
    if (replaceIndexRef.current !== null) {
      const targetIdx = replaceIndexRef.current;
      replaceIndexRef.current = null;
      const file = validImageFiles[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Url = ev.target?.result;
        if (base64Url) {
          const updated = [...currentPhotos];
          updated[targetIdx] = base64Url;
          setIsDirty(true);
          setFormData((prev) => ({ ...prev, photos: updated }));
          showToast?.("Profile photo replaced successfully! ✨", "success");
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    if (currentPhotos.length >= maxPhotos) {
      showToast?.(`Maximum limit of ${maxPhotos} photos reached. Delete one to add more.`, "info");
      return;
    }

    const availableSlots = maxPhotos - currentPhotos.length;
    const filesToRead = validImageFiles.slice(0, availableSlots);

    if (validImageFiles.length > availableSlots) {
      showToast?.(`Adding first ${availableSlots} photos. Maximum is ${maxPhotos} photos.`, "info");
    }

    let loadedCount = 0;
    const newPhotos = [];

    filesToRead.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64Url = ev.target?.result;
        if (base64Url) {
          newPhotos.push(base64Url);
        }
        loadedCount += 1;
        if (loadedCount === filesToRead.length) {
          const finalPhotos = [...currentPhotos, ...newPhotos];
          setIsDirty(true);
          setFormData((prev) => ({ ...prev, photos: finalPhotos }));
          showToast?.(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} uploaded successfully! 📸`, "success");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const triggerUpload = (indexToReplace = null) => {
    replaceIndexRef.current = indexToReplace;
    fileInputRef.current?.click();
  };

  const handleSetMainPhoto = (index) => {
    if (index === 0) return;
    const updated = [...(formData.photos || [])];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, photos: updated }));
    showToast?.("Set as main display photo! ⭐", "success");
  };

  const handleDeletePhoto = (index) => {
    const updated = (formData.photos || []).filter((_, i) => i !== index);
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, photos: updated }));
    showToast?.("Photo removed 🗑️", "info");
  };

  const completion = calculateProfileCompletion(formData);

  return (
    <div className="container-wide" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Header & Completion Meter */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%)',
          color: '#FFFFFF'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.6rem', fontWeight: 800 }}>
              Edit My Matrimonial Bio-Data
            </h1>
            <p style={{ color: 'var(--gold-200)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              A complete and verified profile receives up to 5x more compatible interest responses.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              minWidth: '220px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600 }}>Profile Score</span>
              <span style={{ fontWeight: 800, color: 'var(--gold-400)' }}>{completion.percentage}%</span>
            </div>
            <div className="completion-bar-bg" style={{ margin: '6px 0' }}>
              <div className="completion-bar-fill" style={{ width: `${completion.percentage}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Tabs on Left, Form on Right */}
      <div className="profile-edit-layout">
        {/* Left Side Tab Navigation */}
        <div className="card profile-edit-tabs-card" style={{ padding: '0.75rem', height: 'fit-content' }}>
          <div className="profile-edit-tabs-wrap">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabSelect(tab.id)}
                  className="profile-edit-tab-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--primary-800)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--primary-800)' : '#718096'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side Form Content */}
        <form onSubmit={handleSave} className="card profile-edit-form-card">
          {/* 1. Personal & Physical */}
          {activeTab === 'personal' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Personal and Physical Details
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Full Name</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value.replace(/[^a-zA-Z\s.-]/g, '').slice(0, 50))}
                    required
                  />
                </div>

                <div>
                  <label className="search-input-label">Age (Years: 18 - 70)</label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={formData.age}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        handleChange('age', '');
                      } else {
                        const parsed = parseInt(val, 10);
                        if (!isNaN(parsed)) {
                          handleChange('age', Math.min(100, Math.max(0, parsed)));
                        }
                      }
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="search-input-label">Gender</label>
                  <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male (Groom)</option>
                    <option value="female">Female (Bride)</option>
                  </select>
                </div>

                <div>
                  <label className="search-input-label">Height</label>
                  <select
                    value={formData.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                  >
                    <option value="">Select Height</option>
                    {HEIGHT_OPTIONS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="search-input-label">Marital Status</label>
                  <select value={formData.maritalStatus} onChange={(e) => handleChange('maritalStatus', e.target.value)}>
                    <option value="">Select Marital Status</option>
                    <option value="Never Married">Never Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Awaiting Divorce">Awaiting Divorce</option>
                  </select>
                </div>

                <div>
                  <label className="search-input-label">Mother Tongue</label>
                  <input
                    type="text"
                    value={formData.motherTongue}
                    onChange={(e) => handleChange('motherTongue', e.target.value)}
                  />
                </div>

                <div>
                  <label className="search-input-label">Current City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Current city"
                  />
                </div>

                <div>
                  <label className="search-input-label">State / Country</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="State or Region"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Horoscope & Astro */}
          {activeTab === 'horoscope' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Astrological and Horoscope Information
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Telugu Community / Caste</label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => handleChange('community', e.target.value)}
                    placeholder="Telugu Community / Caste"
                  />
                </div>

                <div>
                  <label className="search-input-label">Sub-Caste</label>
                  <input
                    type="text"
                    value={formData.subCaste}
                    onChange={(e) => handleChange('subCaste', e.target.value)}
                    placeholder="Sub-Caste or Shakha"
                  />
                </div>

                <div>
                  <label className="search-input-label">Gothram (గోత్రం)</label>
                  <input
                    type="text"
                    value={formData.gothram}
                    onChange={(e) => handleChange('gothram', e.target.value)}
                    placeholder="Family Gothram"
                  />
                </div>

                <div>
                  <label className="search-input-label">Raasi (రాశి)</label>
                  <input
                    type="text"
                    value={formData.raasi}
                    onChange={(e) => handleChange('raasi', e.target.value)}
                    placeholder="Raasi (Moon Sign)"
                  />
                </div>

                <div>
                  <label className="search-input-label">Nakshatram (నక్షత్రం)</label>
                  <input
                    type="text"
                    value={formData.nakshatram}
                    onChange={(e) => handleChange('nakshatram', e.target.value)}
                    placeholder="Birth Star / Nakshatram"
                  />
                </div>

                <div>
                  <label className="search-input-label">Dosham</label>
                  <select value={formData.dosham} onChange={(e) => handleChange('dosham', e.target.value)}>
                    <option value="">Select Dosham Status</option>
                    <option value="No Dosham">No Dosham</option>
                    <option value="Kuja Dosham (Mild)">Kuja Dosham (Mild)</option>
                    <option value="Chevvai Dosham">Chevvai Dosham</option>
                    <option value="Sarpa Dosham">Sarpa Dosham</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. Education & Career */}
          {activeTab === 'career' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Education and Career Standing
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Highest Degree</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleChange('education', e.target.value)}
                    placeholder="Highest Degree / Qualification"
                  />
                </div>

                <div>
                  <label className="search-input-label">College / University</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => handleChange('college', e.target.value)}
                    placeholder="College or University Name"
                  />
                </div>

                <div>
                  <label className="search-input-label">Designation / Profession</label>
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => handleChange('profession', e.target.value)}
                    placeholder="Designation or Profession"
                  />
                </div>

                <div>
                  <label className="search-input-label">Employer / Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Company or Employer"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="search-input-label">Annual Income Package</label>
                  <input
                    type="text"
                    value={formData.income}
                    onChange={(e) => handleChange('income', e.target.value)}
                    placeholder="Annual Income Package"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Family */}
          {activeTab === 'family' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Family Background Details
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Father's Occupation</label>
                  <input
                    type="text"
                    value={formData.fatherOccupation}
                    onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                  />
                </div>

                <div>
                  <label className="search-input-label">Mother's Occupation</label>
                  <input
                    type="text"
                    value={formData.motherOccupation}
                    onChange={(e) => handleChange('motherOccupation', e.target.value)}
                  />
                </div>

                <div>
                  <label className="search-input-label">Brothers</label>
                  <input
                    type="text"
                    value={formData.brothers}
                    onChange={(e) => handleChange('brothers', e.target.value)}
                  />
                </div>

                <div>
                  <label className="search-input-label">Sisters</label>
                  <input
                    type="text"
                    value={formData.sisters}
                    onChange={(e) => handleChange('sisters', e.target.value)}
                  />
                </div>

                <div>
                  <label className="search-input-label">Family Type</label>
                  <select value={formData.familyType} onChange={(e) => handleChange('familyType', e.target.value)}>
                    <option value="">Select Family Type</option>
                    <option value="Nuclear">Nuclear</option>
                    <option value="Joint">Joint Family</option>
                  </select>
                </div>

                <div>
                  <label className="search-input-label">Native Place</label>
                  <input
                    type="text"
                    value={formData.nativePlace}
                    onChange={(e) => handleChange('nativePlace', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Lifestyle */}
          {activeTab === 'lifestyle' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Lifestyle and Habits
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Food Habits / Diet</label>
                  <select value={formData.foodHabits} onChange={(e) => handleChange('foodHabits', e.target.value)}>
                    <option value="">Select Food Habits</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                  </select>
                </div>

                <div>
                  <label className="search-input-label">Drinking Habits</label>
                  <select value={formData.drinking} onChange={(e) => handleChange('drinking', e.target.value)}>
                    <option value="">Select Drinking Habit</option>
                    <option value="No">No</option>
                    <option value="Socially">Socially</option>
                    <option value="Occasionally">Occasionally</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="search-input-label">Interests and Hobbies (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.interests}
                    onChange={(e) => handleChange('interests', e.target.value)}
                    placeholder="List interests and hobbies (comma separated)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. About Me */}
          {activeTab === 'about' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                About Me (Biography)
              </h3>

              <div>
                <label className="search-input-label">Express your personality, lifestyle, and what makes you unique</label>
                <textarea
                  rows={6}
                  value={formData.aboutMe}
                  onChange={(e) => handleChange('aboutMe', e.target.value)}
                  placeholder="Share a heartfelt note about your background, passions, outlook on life, and marriage expectations..."
                  style={{ marginTop: '0.5rem' }}
                />
              </div>
            </div>
          )}

          {/* 7. Partner Preferences */}
          {activeTab === 'preferences' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-900)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                Partner Expectations and Preferences
              </h3>

              <div className="grid-responsive-2">
                <div>
                  <label className="search-input-label">Preferred Age Range (Min - Max: 18 - 70)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min={18}
                      max={70}
                      placeholder="Min (18+)"
                      value={formData.partnerPreferences.ageMin}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          handlePrefChange('ageMin', '');
                        } else {
                          const parsed = parseInt(val, 10);
                          handlePrefChange('ageMin', isNaN(parsed) ? '' : Math.max(18, Math.min(70, parsed)));
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== '' && parseInt(val, 10) < 18) {
                          handlePrefChange('ageMin', 18);
                        }
                      }}
                    />
                    <input
                      type="number"
                      min={18}
                      max={70}
                      placeholder="Max (70)"
                      value={formData.partnerPreferences.ageMax}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          handlePrefChange('ageMax', '');
                        } else {
                          const parsed = parseInt(val, 10);
                          handlePrefChange('ageMax', isNaN(parsed) ? '' : Math.max(18, Math.min(70, parsed)));
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (val !== '' && parseInt(val, 10) < 18) {
                          handlePrefChange('ageMax', 18);
                        }
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Minimum eligible partner age is 18 years
                  </span>
                </div>

                <div>
                  <label className="search-input-label">Minimum Height</label>
                  <select
                    value={formData.partnerPreferences.heightMin}
                    onChange={(e) => handlePrefChange('heightMin', e.target.value)}
                  >
                    <option value="">Select Minimum Height</option>
                    {HEIGHT_OPTIONS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Realistic human height range (4'0" to 7'0")
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="search-input-label">Target Preferred Locations (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.partnerPreferences.locations}
                    onChange={(e) => handlePrefChange('locations', e.target.value)}
                    placeholder="Target Preferred Locations (comma separated)"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="search-input-label">Preferred Communities (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.partnerPreferences.communities}
                    onChange={(e) => handlePrefChange('communities', e.target.value)}
                    placeholder="Preferred Communities (comma separated)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. Photos Management */}
          {activeTab === 'photos' && (
            <div className="photo-manager-wrap animate-fade-in">
              <div className="photo-manager-header">
                <div>
                  <h3 className="photo-manager-title">Manage Profile Photos</h3>
                  <p style={{ color: 'var(--text-secondary, #6B6368)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                    Upload and manage your profile photos. The main photo is featured prominently on match recommendations and search results.
                  </p>
                </div>
                <span className="photo-count-badge">
                  {formData.photos?.length || 0} / 6 Photos Uploaded
                </span>
              </div>

              {/* Hidden Local File Input for Local Storage Uploads */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                multiple
                style={{ display: 'none' }}
              />

              {/* Photo Cards Grid */}
              <div className="photo-grid-container">
                {(formData.photos || []).map((photo, i) => {
                  const fallbackAvatar = formData.gender === 'female'
                    ? '/assets/profiles/female/Female_Profile_01.jpg'
                    : '/assets/profiles/male/Male_Profile_01.jpg';

                  return (
                    <div
                      key={i}
                      className={`photo-item-card ${i === 0 ? 'is-main' : ''}`}
                    >
                      <img
                        src={photo}
                        alt={`Profile photo ${i + 1}`}
                        className="photo-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackAvatar;
                        }}
                      />

                      {i === 0 ? (
                        <span className="photo-main-badge">
                          <Star size={11} fill="#FFFFFF" /> Main Photo
                        </span>
                      ) : (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            zIndex: 2
                          }}
                        >
                          Photo #{i + 1}
                        </span>
                      )}

                      {/* Hover Overlay Action Buttons */}
                      <div className="photo-actions-overlay">
                        {i !== 0 && (
                          <button
                            type="button"
                            className="photo-action-btn btn-main"
                            onClick={() => handleSetMainPhoto(i)}
                            title="Set as Main Profile Photo"
                          >
                            <Star size={13} /> Make Main
                          </button>
                        )}
                        <button
                          type="button"
                          className="photo-action-btn"
                          onClick={() => triggerUpload(i)}
                          title="Replace this photo from computer"
                        >
                          <RefreshCw size={13} /> Replace
                        </button>
                        <button
                          type="button"
                          className="photo-action-btn btn-delete"
                          onClick={() => handleDeletePhoto(i)}
                          title="Delete photo"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* + Add Slot Card if under 6 photos */}
                {(formData.photos?.length || 0) < 6 && (
                  <div
                    className="photo-add-slot-card"
                    onClick={() => triggerUpload(null)}
                    title="Click to add another photo"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') triggerUpload(null);
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#FFF0F3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-700, #901B2C)'
                      }}
                    >
                      <Plus size={22} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      + Add Photo
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Slot {(formData.photos?.length || 0) + 1} of 6
                    </span>
                  </div>
                )}
              </div>

              {/* Main Drag & Drop Zone Box */}
              <div
                className={`photo-dropzone-box ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => triggerUpload(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') triggerUpload(null);
                }}
              >
                <div className="photo-dropzone-icon-wrap">
                  <Upload size={26} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary, #29252A)' }}>
                  Upload Photos from Your Computer / Device
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #6B6368)', maxWidth: '440px' }}>
                  Click to open the file selection window, or drag and drop image files directly into this area.
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    color: 'var(--primary-800, #7A1428)',
                    background: '#FFF5F7',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 600
                  }}
                >
                  Supports JPG, JPEG, PNG, WEBP (Max 5MB per photo)
                </div>
              </div>

              {/* Photo Upload Guidelines */}
              <div className="photo-tips-box">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F5132', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} color="#0F5132" /> Matrimonial Photo Guidelines:
                </div>
                <div className="photo-tip-item">
                  <Check size={14} color="#059669" />
                  <span>Clear portrait photos with good lighting receive up to 5x more verified interests.</span>
                </div>
                <div className="photo-tip-item">
                  <Check size={14} color="#059669" />
                  <span>Avoid group photos, sunglasses, or heavy filters for instant trust score approval.</span>
                </div>
                <div className="photo-tip-item">
                  <Check size={14} color="#059669" />
                  <span>Uploaded photos are saved locally and securely displayed on your profile.</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Save Button Footer */}
          <div className="profile-edit-save-row">
            <button
              type="submit"
              className="btn btn-primary btn-lg profile-edit-save-btn"
              disabled={isSaving}
            >
              <Save size={18} />
              {isSaving ? "Saving Bio-Data..." : "Save and Update Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedModal && (
        <div className="admin-modal-overlay" style={{ zIndex: 10000 }} onClick={() => setShowUnsavedModal(false)}>
          <div className="admin-modal-container" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Unsaved Profile Changes
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    You have unsaved edits in your profile
                  </p>
                </div>
              </div>
            </div>
            <div className="admin-modal-body" style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5 }}>
              If you leave now without saving, your recent profile changes will be lost. Are you sure you want to discard your changes?
            </div>
            <div className="admin-modal-footer" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#F9FAFB' }}>
              <button
                type="button"
                className="btn btn-secondary btn-md"
                onClick={() => setShowUnsavedModal(false)}
              >
                Stay & Keep Editing
              </button>
              <button
                type="button"
                className="btn btn-danger btn-md"
                onClick={() => {
                  setIsDirty(false);
                  setShowUnsavedModal(false);
                  if (pendingNavigationUrl) {
                    navigate(pendingNavigationUrl);
                  }
                }}
              >
                Discard & Leave
              </button>
              <button
                type="button"
                className="btn btn-primary btn-md"
                onClick={() => {
                  handleSave(null, () => {
                    setShowUnsavedModal(false);
                    if (pendingNavigationUrl) {
                      navigate(pendingNavigationUrl);
                    }
                  });
                }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
