/**
 * Admin Logs Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';

/**
 * Log an administrative action
 */
export async function createAdminLog(adminId, action, targetId = '', details = '') {
  const id = `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const log = {
    id,
    adminId: String(adminId || 'admin_1'),
    action: String(action),
    targetId: String(targetId),
    details: String(details),
    createdAt: new Date().toISOString()
  };

  await putInStore(STORES.ADMIN_LOGS, log);
  return log;
}

/**
 * Get all admin logs
 */
export async function getAllAdminLogs() {
  const logs = await getAllFromStore(STORES.ADMIN_LOGS);
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
