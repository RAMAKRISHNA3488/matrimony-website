/**
 * Reports Service - Temporary IndexedDB Database
 */

import {
  STORES,
  getFromStore,
  getAllFromStore,
  putInStore,
  deleteFromStore
} from './db.js';

/**
 * Create a report against a profile
 */
export async function createReport(reporterUserId, reportedUserId, reason, description = '') {
  if (!reporterUserId || !reportedUserId || !reason) {
    throw new Error("Reporter, Reported user, and Reason are required.");
  }

  const id = `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const report = {
    id,
    reporterUserId: String(reporterUserId),
    reportedUserId: String(reportedUserId),
    reason: String(reason),
    description: String(description),
    status: 'Under Review',
    createdAt: now
  };

  await putInStore(STORES.REPORTS, report);
  return report;
}

/**
 * Get all reports (for Admin dashboard)
 */
export async function getAllReports() {
  const [reports, users] = await Promise.all([
    getAllFromStore(STORES.REPORTS),
    getAllFromStore(STORES.USERS)
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));

  return reports.map(r => {
    const reporter = userMap.get(r.reporterUserId) || { fullName: 'Reporter' };
    const reported = userMap.get(r.reportedUserId) || { fullName: 'Reported User' };
    return {
      ...r,
      reporterName: reporter.fullName,
      reportedName: reported.fullName
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Update report status (Admin action)
 */
export async function updateReportStatus(reportId, status, resolutionNotes = '') {
  const report = await getFromStore(STORES.REPORTS, reportId);
  if (!report) return null;

  report.status = status;
  report.resolutionNotes = resolutionNotes;
  report.resolvedAt = new Date().toISOString();

  await putInStore(STORES.REPORTS, report);
  return report;
}
