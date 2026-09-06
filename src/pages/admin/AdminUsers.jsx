import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockDb } from '../../services/mockDb';
import { useApp } from '../../context/AppContext';
import AdminLayout from '../../components/admin/AdminLayout';
import UserEditModal from '../../components/admin/UserEditModal';
import {
  UserProfileViewerModal,
  ConfirmActionModal,
  AddMemberModal
} from '../../components/admin/AdminModals';
import {
  Search,
  ShieldCheck,
  Edit2,
  Trash2,
  Ban,
  MoreVertical,
  Eye,
  Download,
  RotateCcw,
  Users,
  UserPlus,
  X
} from 'lucide-react';
import '../../styles/admin.css';

export default function AdminUsers() {
  const { showToast } = useApp();
  const [searchParams] = useSearchParams();

  const [profiles, setProfiles] = useState(() => mockDb.getProfiles());
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');

  const paramQ = searchParams.get('q');
  const [prevParamQ, setPrevParamQ] = useState(paramQ);
  if (paramQ !== null && paramQ !== prevParamQ) {
    setPrevParamQ(paramQ);
    setSearchQuery(paramQ);
  }
  const [filterGender, setFilterGender] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterCommunity, setFilterCommunity] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterMembership, setFilterMembership] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // Subscribe to real-time events across all tabs and components
  useEffect(() => {
    const unsubscribe = mockDb.subscribe(() => {
      setProfiles(mockDb.getProfiles());
    });
    return () => unsubscribe();
  }, []);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    confirmVariant: 'danger',
    onConfirm: () => {}
  });

  // Action Menu Dropdown state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterGender('all');
    setFilterAge('all');
    setFilterLocation('all');
    setFilterCommunity('all');
    setFilterVerification('all');
    setFilterMembership('all');
    setFilterStatus('all');
    setSortBy('name-asc');
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    let result = profiles.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchId = (p.id || '').toLowerCase().includes(q);
        const matchCity = (p.city || '').toLowerCase().includes(q);
        const matchProf = (p.profession || '').toLowerCase().includes(q);
        const matchEmail = (p.email || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchCity && !matchProf && !matchEmail) return false;
      }
      if (filterGender !== 'all' && (p.gender || 'male').toLowerCase() !== filterGender.toLowerCase()) {
        return false;
      }
      if (filterAge !== 'all') {
        const age = p.age || 25;
        if (filterAge === '21-25' && (age < 21 || age > 25)) return false;
        if (filterAge === '26-30' && (age < 26 || age > 30)) return false;
        if (filterAge === '31-35' && (age < 31 || age > 35)) return false;
        if (filterAge === '36+' && age < 36) return false;
      }
      if (filterLocation !== 'all' && !(p.city || '').toLowerCase().includes(filterLocation.toLowerCase()) && !(p.country || '').toLowerCase().includes(filterLocation.toLowerCase())) {
        return false;
      }
      if (filterCommunity !== 'all' && !(p.community || '').toLowerCase().includes(filterCommunity.toLowerCase())) {
        return false;
      }
      if (filterVerification === 'verified' && !p.isVerified) return false;
      if (filterVerification === 'unverified' && p.isVerified) return false;
      if (filterMembership !== 'all' && (p.membershipTier || 'Free').toLowerCase() !== filterMembership.toLowerCase()) {
        return false;
      }
      if (filterStatus === 'active' && p.isSuspended) return false;
      if (filterStatus === 'suspended' && !p.isSuspended) return false;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'age-asc') return (a.age || 0) - (b.age || 0);
      if (sortBy === 'age-desc') return (b.age || 0) - (a.age || 0);
      if (sortBy === 'trust-desc') return (b.trustScore || 0) - (a.trustScore || 0);
      return 0;
    });

    return result;
  }, [profiles, searchQuery, filterGender, filterAge, filterLocation, filterCommunity, filterVerification, filterMembership, filterStatus, sortBy]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleToggleVerify = (user) => {
    const nextStatus = !user.isVerified;
    mockDb.adminVerifyUser(user.id, nextStatus);
    setProfiles(mockDb.getProfiles());
    mockDb.addAuditLog({
      action: nextStatus ? "Verified Candidate Profile" : "Revoked Verification Status",
      target: `${user.name} (${user.id})`,
      targetType: "User Profile",
      details: nextStatus ? "Trust score upgraded to 98%." : "Verification badge removed."
    });
    showToast(
      nextStatus ? `${user.name} marked as Verified ✅` : `Verification revoked for ${user.name}`,
      nextStatus ? "success" : "info"
    );
    setActiveMenuId(null);
  };

  const handlePromptSuspend = (user) => {
    const willSuspend = !user.isSuspended;
    setActiveMenuId(null);
    setConfirmDialog({
      isOpen: true,
      title: willSuspend ? "Suspend Account" : "Activate Account",
      message: willSuspend
        ? `Are you sure you want to suspend candidate profile ${user.name} (${user.id})? They will no longer appear in search results or be able to send interest requests.`
        : `Activate candidate profile ${user.name} (${user.id}) and restore platform access?`,
      confirmLabel: willSuspend ? "Suspend User" : "Activate User",
      confirmVariant: willSuspend ? "danger" : "primary",
      onConfirm: () => {
        mockDb.adminToggleUserStatus(user.id, willSuspend);
        setProfiles(mockDb.getProfiles());
        mockDb.addAuditLog({
          action: willSuspend ? "Account Suspended by Admin" : "Account Reactivated",
          target: `${user.name} (${user.id})`,
          targetType: "User Profile",
          details: willSuspend ? "Account access temporarily restricted." : "Account restored to active standing."
        });
        showToast(
          willSuspend ? `Account for ${user.name} suspended.` : `Account for ${user.name} reactivated!`,
          willSuspend ? "danger" : "success"
        );
      }
    });
  };

  const handlePromptDelete = (user) => {
    setActiveMenuId(null);
    setConfirmDialog({
      isOpen: true,
      title: "Permanently Delete Profile",
      message: `CAUTION: Are you sure you want to permanently delete profile ${user.name} (${user.id})? This will wipe all biodata, photos, and match history. This action CANNOT be undone.`,
      confirmLabel: "Permanently Delete",
      confirmVariant: "danger",
      onConfirm: () => {
        mockDb.adminDeleteProfile(user.id);
        setProfiles(mockDb.getProfiles());
        mockDb.addAuditLog({
          action: "Permanently Deleted User Profile",
          target: `${user.name} (${user.id})`,
          targetType: "User Profile",
          details: "Deleted biodata and purged from candidate database."
        });
        showToast(`Profile for ${user.name} permanently deleted.`, "info");
      }
    });
  };

  const handleSaveEdit = (userId, updatedData) => {
    mockDb.adminUpdateProfile(userId, updatedData);
    setProfiles(mockDb.getProfiles());
    mockDb.addAuditLog({
      action: "Edited Candidate Biodata",
      target: `${updatedData.name || 'User'} (${userId})`,
      targetType: "User Profile",
      details: "Updated core profile fields via Admin User Management."
    });
    showToast("User profile updated successfully! 💾", "success");
  };

  const handleExportCSV = () => {
    const res = mockDb.exportDataToCSV('users');
    showToast(`Exported ${res.filename} with ${filteredUsers.length} user records! 📥`, "success");
  };

  const activeFiltersCount = useMemo(() => {
    return [
      searchQuery.trim() !== '',
      filterGender !== 'all',
      filterAge !== 'all',
      filterLocation !== 'all',
      filterCommunity !== 'all',
      filterVerification !== 'all',
      filterMembership !== 'all',
      filterStatus !== 'all'
    ].filter(Boolean).length;
  }, [searchQuery, filterGender, filterAge, filterLocation, filterCommunity, filterVerification, filterMembership, filterStatus]);

  const groomsCount = useMemo(() => profiles.filter(p => (p.gender || 'male').toLowerCase() === 'male').length, [profiles]);
  const bridesCount = useMemo(() => profiles.filter(p => (p.gender || '').toLowerCase() === 'female').length, [profiles]);
  const verifiedCount = useMemo(() => profiles.filter(p => p.isVerified).length, [profiles]);
  const paidCount = useMemo(() => profiles.filter(p => p.membershipTier && p.membershipTier !== 'Free').length, [profiles]);

  return (
    <AdminLayout
      title="User Management"
      description="Manage, filter, verify, edit, and moderate TeluguBandham bride and groom profiles"
    >
      <div className="admin-card">
        {/* Card Header with Top Actions */}
        <div className="admin-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Users size={20} style={{ color: 'var(--admin-primary)' }} />
            <div>
              <h3 className="admin-card-title">Candidate Directory</h3>
              <p className="admin-card-subtitle">
                Showing {filteredUsers.length} of {profiles.length} total profiles
                {activeFiltersCount > 0 && (
                  <span style={{ marginLeft: '6px', color: 'var(--admin-primary)', fontWeight: 700 }}>
                    • ({activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Sort:</span>
              <select
                className="admin-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '34px', fontSize: '0.78rem', padding: '0.2rem 0.6rem', width: 'auto', minWidth: '145px' }}
              >
                <option value="name-asc">Name (A - Z)</option>
                <option value="name-desc">Name (Z - A)</option>
                <option value="age-asc">Age (Youngest First)</option>
                <option value="age-desc">Age (Oldest First)</option>
                <option value="trust-desc">Trust Score (Highest)</option>
              </select>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={() => setIsAddMemberOpen(true)}
              style={{ fontSize: '0.8125rem', gap: '0.4rem', padding: '0.4rem 0.85rem' }}
            >
              <UserPlus size={15} />
              Add Member
            </button>

            <button
              type="button"
              className="admin-quick-action-btn"
              onClick={handleExportCSV}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              type="button"
              className="admin-quick-action-btn"
              onClick={handleResetFilters}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* Enhanced Directory Toolbar & Grid */}
        <div className="admin-directory-toolbar">
          {/* Top Row: Search & Quick Presets */}
          <div className="admin-directory-top-row">
            {/* Search */}
            <div className="admin-search-box">
              <Search size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
              <input
                type="text"
                className="admin-input"
                placeholder="Search candidate, ID, city, job..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Filter Tabs */}
            <div className="admin-tab-bar">
              <button
                type="button"
                className={`admin-tab-btn ${filterGender === 'all' && filterVerification === 'all' && filterMembership === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilterGender('all');
                  setFilterVerification('all');
                  setFilterMembership('all');
                  setCurrentPage(1);
                }}
              >
                All ({profiles.length})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${filterGender === 'male' ? 'active' : ''}`}
                onClick={() => {
                  setFilterGender(filterGender === 'male' ? 'all' : 'male');
                  setCurrentPage(1);
                }}
              >
                Grooms ({groomsCount})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${filterGender === 'female' ? 'active' : ''}`}
                onClick={() => {
                  setFilterGender(filterGender === 'female' ? 'all' : 'female');
                  setCurrentPage(1);
                }}
              >
                Brides ({bridesCount})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${filterVerification === 'verified' ? 'active' : ''}`}
                onClick={() => {
                  setFilterVerification(filterVerification === 'verified' ? 'all' : 'verified');
                  setCurrentPage(1);
                }}
              >
                Verified ({verifiedCount})
              </button>
              <button
                type="button"
                className={`admin-tab-btn ${filterMembership !== 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilterMembership(filterMembership === 'all' ? 'gold' : 'all');
                  setCurrentPage(1);
                }}
              >
                Paid VIP ({paidCount})
              </button>
            </div>
          </div>

          {/* Secondary Multi-Filters Grid */}
          <div className="admin-filters-grid">
            {/* Gender */}
            <div className="admin-filter-field">
              <label>Gender</label>
              <select
                className={filterGender !== 'all' ? 'active-filter' : ''}
                value={filterGender}
                onChange={(e) => {
                  setFilterGender(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Genders</option>
                <option value="male">Grooms (Male)</option>
                <option value="female">Brides (Female)</option>
              </select>
            </div>

            {/* Age */}
            <div className="admin-filter-field">
              <label>Age Range</label>
              <select
                className={filterAge !== 'all' ? 'active-filter' : ''}
                value={filterAge}
                onChange={(e) => {
                  setFilterAge(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Ages</option>
                <option value="21-25">21 - 25 Yrs</option>
                <option value="26-30">26 - 30 Yrs</option>
                <option value="31-35">31 - 35 Yrs</option>
                <option value="36+">36+ Yrs</option>
              </select>
            </div>

            {/* Location */}
            <div className="admin-filter-field">
              <label>Location</label>
              <select
                className={filterLocation !== 'all' ? 'active-filter' : ''}
                value={filterLocation}
                onChange={(e) => {
                  setFilterLocation(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Locations</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="vijayawada">Vijayawada</option>
                <option value="visakhapatnam">Visakhapatnam</option>
                <option value="tirupati">Tirupati</option>
                <option value="guntur">Guntur</option>
                <option value="bangalore">Bangalore</option>
                <option value="usa">USA (NRI)</option>
              </select>
            </div>

            {/* Community */}
            <div className="admin-filter-field">
              <label>Community</label>
              <select
                className={filterCommunity !== 'all' ? 'active-filter' : ''}
                value={filterCommunity}
                onChange={(e) => {
                  setFilterCommunity(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Communities</option>
                <option value="kamma">Kamma</option>
                <option value="reddy">Reddy</option>
                <option value="kapu">Kapu / Telaga</option>
                <option value="arya vysya">Arya Vysya</option>
                <option value="brahmin">Brahmin</option>
                <option value="padmashali">Padmashali</option>
                <option value="velama">Velama</option>
                <option value="yadav">Yadav</option>
                <option value="mudiraj">Mudiraj</option>
              </select>
            </div>

            {/* Verification */}
            <div className="admin-filter-field">
              <label>Verification</label>
              <select
                className={filterVerification !== 'all' ? 'active-filter' : ''}
                value={filterVerification}
                onChange={(e) => {
                  setFilterVerification(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Verification</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>

            {/* Membership Tier */}
            <div className="admin-filter-field">
              <label>Membership</label>
              <select
                className={filterMembership !== 'all' ? 'active-filter' : ''}
                value={filterMembership}
                onChange={(e) => {
                  setFilterMembership(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Memberships</option>
                <option value="free">Free Member</option>
                <option value="gold">Gold Member</option>
                <option value="diamond">Diamond Member</option>
                <option value="elite vip">Telugu Elite VIP</option>
              </select>
            </div>

            {/* Status */}
            <div className="admin-filter-field">
              <label>Account Status</label>
              <select
                className={filterStatus !== 'all' ? 'active-filter' : ''}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Accounts</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary Strip */}
          {activeFiltersCount > 0 && (
            <div className="admin-active-filters-strip">
              <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>Active:</span>
              {searchQuery && (
                <span className="admin-filter-chip">
                  Query: "{searchQuery}"
                  <button type="button" onClick={() => setSearchQuery('')}><X size={11} /></button>
                </span>
              )}
              {filterGender !== 'all' && (
                <span className="admin-filter-chip">
                  Gender: {filterGender}
                  <button type="button" onClick={() => setFilterGender('all')}><X size={11} /></button>
                </span>
              )}
              {filterAge !== 'all' && (
                <span className="admin-filter-chip">
                  Age: {filterAge}
                  <button type="button" onClick={() => setFilterAge('all')}><X size={11} /></button>
                </span>
              )}
              {filterLocation !== 'all' && (
                <span className="admin-filter-chip">
                  Location: {filterLocation}
                  <button type="button" onClick={() => setFilterLocation('all')}><X size={11} /></button>
                </span>
              )}
              {filterCommunity !== 'all' && (
                <span className="admin-filter-chip">
                  Community: {filterCommunity}
                  <button type="button" onClick={() => setFilterCommunity('all')}><X size={11} /></button>
                </span>
              )}
              {filterVerification !== 'all' && (
                <span className="admin-filter-chip">
                  Verification: {filterVerification}
                  <button type="button" onClick={() => setFilterVerification('all')}><X size={11} /></button>
                </span>
              )}
              {filterMembership !== 'all' && (
                <span className="admin-filter-chip">
                  Plan: {filterMembership}
                  <button type="button" onClick={() => setFilterMembership('all')}><X size={11} /></button>
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="admin-filter-chip">
                  Status: {filterStatus}
                  <button type="button" onClick={() => setFilterStatus('all')}><X size={11} /></button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ border: 'none', background: 'transparent', color: 'var(--admin-primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginLeft: 'auto' }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* User Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Candidate</th>
                <th style={{ width: '15%' }}>Community & Caste</th>
                <th style={{ width: '13%' }}>Location</th>
                <th style={{ width: '18%' }}>Profession & Income</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Plan Tier</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Trust Score</th>
                <th style={{ width: '6%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '6%', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((u) => {
                const isMenuOpen = activeMenuId === u.id;

                return (
                  <tr key={u.id}>
                    {/* User info */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={(u.photos && u.photos[0]) || (u.gender === 'female' ? '/assets/branding/Default_Female_Avatar.svg' : '/assets/branding/Default_Male_Avatar.svg')}
                          alt={u.name}
                          className="admin-table-avatar"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = u.gender === 'female' ? '/assets/branding/Default_Female_Avatar.svg' : '/assets/branding/Default_Male_Avatar.svg';
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{u.name}</span>
                            {u.isVerified && <ShieldCheck size={14} style={{ color: 'var(--admin-success)' }} />}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                            {u.id} • {u.age} yrs • {u.gender === 'female' ? 'Bride' : 'Groom'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Community */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{u.community}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {u.subCaste || u.gothram || 'General'}
                      </div>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{u.city}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {u.state || u.country}
                      </div>
                    </td>

                    {/* Profession */}
                    <td>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.profession}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>
                        {u.income || '₹25 - 35L PA'}
                      </div>
                    </td>

                    {/* Tier */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin-badge ${u.membershipTier === 'Elite VIP' ? 'gold' : u.membershipTier === 'Diamond' ? 'primary' : u.membershipTier === 'Gold' ? 'gold' : 'neutral'}`}>
                        {u.membershipTier || 'Free'}
                      </span>
                    </td>

                    {/* Trust Score */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--admin-success)' }}>
                          {u.trustScore || 95}%
                        </span>
                        <div style={{ width: '40px', height: '5px', backgroundColor: 'var(--admin-border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${u.trustScore || 95}%`, height: '100%', backgroundColor: 'var(--admin-success)' }} />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      {u.isSuspended ? (
                        <span className="admin-badge danger">Suspended</span>
                      ) : (
                        <span className="admin-badge success">Active</span>
                      )}
                    </td>

                    {/* Actions Menu */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap', position: 'relative' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: u.isVerified ? 'var(--admin-success-bg)' : 'var(--admin-surface-subtle)',
                            color: u.isVerified ? 'var(--admin-success)' : 'var(--admin-text-muted)'
                          }}
                          onClick={() => handleToggleVerify(u)}
                          title={u.isVerified ? "Revoke Verification" : "1-Click Verify Candidate ✅"}
                        >
                          <ShieldCheck size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: u.isSuspended ? 'var(--admin-danger-bg)' : 'var(--admin-surface-subtle)',
                            color: u.isSuspended ? 'var(--admin-danger)' : 'var(--admin-text-muted)'
                          }}
                          onClick={() => handlePromptSuspend(u)}
                          title={u.isSuspended ? "Reactivate Account" : "Suspend Account"}
                        >
                          <Ban size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => setViewUser(u)}
                          title="View Matrimonial Profile"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => setEditUser(u)}
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="admin-icon-btn"
                          style={{ width: '30px', height: '30px' }}
                          onClick={() => setActiveMenuId(isMenuOpen ? null : u.id)}
                          title="More actions"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div ref={menuRef} className="admin-dropdown-menu" style={{ right: '0', top: '100%' }}>
                          <button
                            type="button"
                            className="admin-dropdown-item"
                            onClick={() => handleToggleVerify(u)}
                          >
                            <ShieldCheck size={14} style={{ color: 'var(--admin-success)' }} />
                            <span>{u.isVerified ? 'Revoke Verification' : 'Verify Profile ✅'}</span>
                          </button>

                          <button
                            type="button"
                            className="admin-dropdown-item"
                            onClick={() => handlePromptSuspend(u)}
                          >
                            <Ban size={14} style={{ color: u.isSuspended ? 'var(--admin-success)' : 'var(--admin-warning)' }} />
                            <span>{u.isSuspended ? 'Reactivate Account' : 'Suspend Account'}</span>
                          </button>

                          <div style={{ height: '1px', backgroundColor: 'var(--admin-border-subtle)', margin: '3px 0' }} />

                          <button
                            type="button"
                            className="admin-dropdown-item danger"
                            onClick={() => handlePromptDelete(u)}
                          >
                            <Trash2 size={14} />
                            <span>Delete Profile</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--admin-text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text-primary)' }}>No candidates found</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try relaxing your search terms or filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="admin-pagination">
          <div>
            Showing <strong>{paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</strong> of{' '}
            <strong>{filteredUsers.length}</strong> candidates
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              className="admin-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ padding: '0 0.5rem', fontWeight: 700 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="admin-pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        showToast={showToast}
      />

      <UserProfileViewerModal
        user={viewUser}
        isOpen={!!viewUser}
        onClose={() => setViewUser(null)}
      />

      <UserEditModal
        isOpen={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSave={handleSaveEdit}
      />

      <ConfirmActionModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        confirmVariant={confirmDialog.confirmVariant}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((d) => ({ ...d, isOpen: false }))}
      />
    </AdminLayout>
  );
}
