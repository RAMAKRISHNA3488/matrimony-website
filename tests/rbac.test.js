import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_ADMIN_USER } from '../src/services/mockData.js';

describe('Admin RBAC & Access Control Suite', () => {
  it('verifies DEFAULT_ADMIN_USER is properly configured as Super Admin with ALL_ACCESS', () => {
    assert.equal(DEFAULT_ADMIN_USER.role, 'Super Admin');
    assert.ok(Array.isArray(DEFAULT_ADMIN_USER.permissions));
    assert.ok(DEFAULT_ADMIN_USER.permissions.includes('ALL_ACCESS'));
  });

  it('correctly evaluates permission guards for Super Admin vs Moderator', () => {
    const checkClearance = (adminUser, requiredRole, requiredPermission) => {
      if (!adminUser) return false;
      const isSuperAdmin = adminUser.role === 'Super Admin' || adminUser.permissions?.includes('ALL_ACCESS');
      if (isSuperAdmin) return true;
      if (requiredRole && adminUser.role !== requiredRole) return false;
      if (requiredPermission && !adminUser.permissions?.includes(requiredPermission)) return false;
      return true;
    };

    const superAdmin = {
      role: 'Super Admin',
      permissions: ['ALL_ACCESS']
    };

    const moderator = {
      role: 'Moderator',
      permissions: ['MANAGE_USERS', 'VERIFY_PROFILES']
    };

    const supportAgent = {
      role: 'Support Agent',
      permissions: ['VIEW_TICKETS', 'RESOLVE_TICKETS']
    };

    // Super Admin access tests
    assert.equal(checkClearance(superAdmin, 'Super Admin'), true);
    assert.equal(checkClearance(superAdmin, null, 'MANAGE_SETTINGS'), true);
    assert.equal(checkClearance(superAdmin, null, 'SYSTEM_BACKUP'), true);

    // Moderator access tests
    assert.equal(checkClearance(moderator, 'Super Admin'), false, 'Moderator must be denied Super Admin sections');
    assert.equal(checkClearance(moderator, null, 'SYSTEM_BACKUP'), false, 'Moderator must not access system backup');
    assert.equal(checkClearance(moderator, null, 'VERIFY_PROFILES'), true, 'Moderator can verify profiles');

    // Support Agent access tests
    assert.equal(checkClearance(supportAgent, 'Super Admin'), false, 'Support Agent must be denied Super Admin sections');
    assert.equal(checkClearance(supportAgent, null, 'RESOLVE_TICKETS'), true);
    assert.equal(checkClearance(supportAgent, null, 'ALL_ACCESS'), false);
  });

  it('correctly filters sidebar navigation items according to role', () => {
    const navItems = [
      { label: 'Dashboard', path: '/admin/dashboard' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Admin Team & RBAC', path: '/admin/admins', superAdminOnly: true },
      { label: 'System Settings', path: '/admin/settings', superAdminOnly: true },
      { label: 'Backup & Security', path: '/admin/backup', superAdminOnly: true }
    ];

    const filterNav = (adminUser) => {
      const isSuperAdmin = adminUser.role === 'Super Admin' || adminUser.permissions?.includes('ALL_ACCESS');
      return navItems.filter(item => !item.superAdminOnly || isSuperAdmin);
    };

    const superAdminNav = filterNav({ role: 'Super Admin', permissions: ['ALL_ACCESS'] });
    assert.equal(superAdminNav.length, 5, 'Super Admin should see all 5 items');

    const moderatorNav = filterNav({ role: 'Moderator', permissions: ['MANAGE_USERS'] });
    assert.equal(moderatorNav.length, 2, 'Moderator should only see non-superAdmin items');
    assert.equal(moderatorNav.some(i => i.superAdminOnly), false);
  });
});
