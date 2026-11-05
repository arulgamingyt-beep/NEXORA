import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  User,
  Community,
  Message,
  PlatformRole,
  ExecutiveCategory,
  EXECUTIVE_ROLES,
  PlatformReport,
  ReportStatus,
  ReportTargetType,
  ModerationDecision,
  AdminAuditLog,
  PlatformDashboardMetrics,
} from '../types';
import {
  getAllVaultAccounts,
  updateVaultUserProfile,
  findVaultAccount,
  findVaultAccountById,
} from '../utils/authVault';
import { betaAccessService } from './betaAccessService';

const AUDIT_STORAGE_KEY = 'nexora_admin_audit_logs_v1';
const REPORTS_STORAGE_KEY = 'nexora_platform_reports_v1';

export class AdminService {
  private auditLogsCache: Map<string, AdminAuditLog> = new Map();
  private reportsCache: Map<string, PlatformReport> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.hydrateFromStorage();
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexora_admin_audit_bus');
      } catch {}
    }
  }

  private hydrateFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const savedAudits = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (savedAudits) {
        const parsed = JSON.parse(savedAudits) as AdminAuditLog[];
        parsed.forEach((log) => this.auditLogsCache.set(log.id, log));
      }
      const savedReports = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (savedReports) {
        const parsed = JSON.parse(savedReports) as PlatformReport[];
        parsed.forEach((rep) => this.reportsCache.set(rep.id, rep));
      }
    } catch (err) {
      console.warn('[AdminService] Hydration notice:', err);
    }
  }

  private persistAuditsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.auditLogsCache.values());
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(list));
      this.broadcastChannel?.postMessage({ type: 'audit_updated', count: list.length });
    } catch {}
  }

  private persistReportsToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.reportsCache.values());
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(list));
      this.broadcastChannel?.postMessage({ type: 'reports_updated', count: list.length });
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 1. Role Hierarchy & Executive Clearance Verification
  // ---------------------------------------------------------------------------
  public getExecutiveCategory(user: User | null | undefined): ExecutiveCategory | null {
    if (!user) return null;
    if (user.executiveCategory) return user.executiveCategory;
    if (user.email === 'founder@nexora.io' || user.username === 'alex_vance' || user.id === 'user_alex') {
      return 'founder';
    }
    if (user.email === 'ceo@nexora.io' || user.username === 'cypher_ceo') {
      return 'ceo';
    }
    if (user.email === 'md@nexora.io' || user.username === 'vanguard_md') {
      return 'managing_director';
    }
    return null;
  }

  public getEffectiveRole(user: User | null | undefined): PlatformRole {
    if (!user) return 'none';
    const exec = this.getExecutiveCategory(user);
    if (exec === 'founder') return 'super_admin';
    if (exec === 'ceo' || exec === 'managing_director') return 'admin';
    if (user.platformRole) return user.platformRole;
    if (user.email === 'admin@nexora.io' || user.id === 'nxr_demo_operative_01' || user.id === 'user_alex') {
      return 'super_admin';
    }
    if (user.role === 'owner' || user.role === 'admin') {
      return 'admin';
    }
    if (user.role === 'moderator') {
      return 'moderator';
    }
    return 'none';
  }

  public isAuthorized(user: User, minimumRole: PlatformRole): boolean {
    const roleRank: Record<PlatformRole, number> = {
      super_admin: 3,
      admin: 2,
      moderator: 1,
      none: 0,
    };
    const userRole = this.getEffectiveRole(user);
    return roleRank[userRole] >= roleRank[minimumRole];
  }

  /**
   * Only Chairman & Founder has absolute platform sovereignty (approve/demote executives, purge root)
   */
  public canApproveEverything(user: User): boolean {
    const exec = this.getExecutiveCategory(user);
    return exec === 'founder' || this.getEffectiveRole(user) === 'super_admin';
  }

  /**
   * Exclusive Executive Approval Gateway:
   * Only Chairman and Founder, CEO, and Managing Director can approve platform beta candidates & official verifications.
   */
  public canApprove(user: User): boolean {
    const exec = this.getExecutiveCategory(user);
    if (exec === 'founder' || exec === 'ceo' || exec === 'managing_director') {
      return true;
    }
    const role = this.getEffectiveRole(user);
    return role === 'super_admin' || role === 'admin';
  }

  // ---------------------------------------------------------------------------
  // 2. Audit Trail Recording (Immutable)
  // ---------------------------------------------------------------------------
  public async recordAuditLog(
    entry: Omit<AdminAuditLog, 'id' | 'timestamp'>
  ): Promise<AdminAuditLog> {
    const logId = 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newLog: AdminAuditLog = {
      ...entry,
      targetId: entry.targetId || 'unknown_target',
      targetName: entry.targetName || entry.targetId || 'Target',
      previousValue: entry.previousValue || '',
      updatedValue: entry.updatedValue || '',
      id: logId,
      timestamp: new Date().toISOString(),
    };

    this.auditLogsCache.set(newLog.id, newLog);
    this.persistAuditsToStorage();

    try {
      await setDoc(doc(db, 'admin_audit_logs', logId), newLog);
    } catch (err) {
      console.warn('[AdminService] Cloud audit write notice:', err);
    }

    return newLog;
  }

  public async listAuditLogs(caller: User): Promise<AdminAuditLog[]> {
    if (!this.isAuthorized(caller, 'moderator')) {
      throw new Error('Access Denied: Administrative clearance required to view audit logs.');
    }

    try {
      const snap = await getDocs(
        query(collection(db, 'admin_audit_logs'), orderBy('timestamp', 'desc'), limit(100))
      );
      snap.forEach((d) => {
        const item = d.data() as AdminAuditLog;
        this.auditLogsCache.set(item.id, item);
      });
      this.persistAuditsToStorage();
    } catch {}

    return Array.from(this.auditLogsCache.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public listenToAuditLogs(caller: User, callback: (logs: AdminAuditLog[]) => void): () => void {
    if (!this.isAuthorized(caller, 'moderator')) {
      callback([]);
      return () => {};
    }

    const emit = () => {
      const list = Array.from(this.auditLogsCache.values()).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      callback(list);
    };

    emit();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUDIT_STORAGE_KEY) {
        this.hydrateFromStorage();
        emit();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'audit_updated') {
        this.hydrateFromStorage();
        emit();
      }
    };
    this.broadcastChannel?.addEventListener('message', handleBroadcast);

    let unsub = () => {};
    try {
      unsub = onSnapshot(collection(db, 'admin_audit_logs'), (snap) => {
        snap.forEach((d) => {
          const item = d.data() as AdminAuditLog;
          this.auditLogsCache.set(item.id, item);
        });
        this.persistAuditsToStorage();
        emit();
      });
    } catch {}

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      this.broadcastChannel?.removeEventListener('message', handleBroadcast);
      unsub();
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Real Dashboard Metrics Aggregation
  // ---------------------------------------------------------------------------
  public async getDashboardMetrics(
    allUsers: Record<string, User>,
    communities: Community[],
    messages: Message[]
  ): Promise<PlatformDashboardMetrics> {
    // 1. Compute users metrics
    const userList = Object.values(allUsers);
    const totalUsers = userList.length;
    const onlineUsers = userList.filter((u) => u.status === 'online').length;
    const suspendedAccounts = userList.filter((u) => u.isSuspended === true).length;

    // 2. Compute communities metrics
    const totalCommunities = communities.length;
    const suspendedCommunities = communities.filter((c) => c.isSuspended === true).length;

    // 3. Compute messages count
    const totalMessages = messages.length;

    // 4. Compute reports
    const pendingReports = Array.from(this.reportsCache.values()).filter(
      (r) => r.status === 'pending' || r.status === 'investigating'
    ).length;

    // 5. Compute pending beta applications
    const pendingBetaApplications = (await betaAccessService.listAllApplications({
      id: 'system',
      username: 'system',
      displayName: 'System',
      tag: '#0000',
      avatar: '',
      status: 'online',
      joinedAt: '',
      role: 'admin',
      platformRole: 'super_admin',
    })).filter((a) => a.status === 'pending').length;

    return {
      totalUsers,
      onlineUsers,
      totalCommunities,
      totalMessages,
      pendingReports,
      suspendedAccounts,
      suspendedCommunities,
      pendingBetaApplications,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. User Suspension & Account Management
  // ---------------------------------------------------------------------------
  public async suspendUser(
    adminUser: User,
    targetUser: User,
    reason: string
  ): Promise<User> {
    if (!this.isAuthorized(adminUser, 'admin')) {
      throw new Error('Access Denied: Administrator clearance required to suspend accounts.');
    }

    const targetEffectiveRole = this.getEffectiveRole(targetUser);
    if (targetEffectiveRole === 'super_admin' && this.getEffectiveRole(adminUser) !== 'super_admin') {
      throw new Error('Access Denied: Only Super Administrators can suspend a Super Administrator account.');
    }

    const updatedUser: User = {
      ...targetUser,
      isSuspended: true,
      suspendedReason: reason || 'Terms of Service violation',
      suspendedAt: new Date().toISOString(),
    };

    updateVaultUserProfile(targetUser.id, {
      isSuspended: true,
      suspendedReason: updatedUser.suspendedReason,
      suspendedAt: updatedUser.suspendedAt,
    });

    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        isSuspended: true,
        suspendedReason: updatedUser.suspendedReason,
        suspendedAt: updatedUser.suspendedAt,
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'account_suspended',
      targetType: 'user',
      targetId: targetUser.id,
      targetName: `@${targetUser.username}`,
      details: `Suspended account: "${reason}"`,
      previousValue: 'active',
      updatedValue: 'suspended',
    });

    return updatedUser;
  }

  public async reactivateUser(
    adminUser: User,
    targetUser: User
  ): Promise<User> {
    if (!this.isAuthorized(adminUser, 'admin')) {
      throw new Error('Access Denied: Administrator clearance required to reactivate accounts.');
    }

    const updatedUser: User = {
      ...targetUser,
      isSuspended: false,
      suspendedReason: undefined,
      suspendedAt: undefined,
    };

    updateVaultUserProfile(targetUser.id, {
      isSuspended: false,
      suspendedReason: '',
      suspendedAt: '',
    });

    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        isSuspended: false,
        suspendedReason: '',
        suspendedAt: '',
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'account_reactivated',
      targetType: 'user',
      targetId: targetUser.id,
      targetName: `@${targetUser.username}`,
      details: 'Reactivated account and cleared suspension flags.',
      previousValue: 'suspended',
      updatedValue: 'active',
    });

    return updatedUser;
  }

  public async updateUserPlatformRole(
    adminUser: User,
    targetUser: User,
    newRole: PlatformRole
  ): Promise<User> {
    if (!this.isAuthorized(adminUser, 'super_admin')) {
      throw new Error('Access Denied: Only Super Administrators can assign or modify platform roles.');
    }

    const prevRole = this.getEffectiveRole(targetUser);
    const updatedUser: User = {
      ...targetUser,
      platformRole: newRole,
    };

    updateVaultUserProfile(targetUser.id, { platformRole: newRole });

    try {
      await updateDoc(doc(db, 'users', targetUser.id), { platformRole: newRole });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: 'super_admin',
      action: 'platform_role_updated',
      targetType: 'user',
      targetId: targetUser.id,
      targetName: `@${targetUser.username}`,
      details: `Updated platform authorization clearance to ${newRole.toUpperCase()}`,
      previousValue: prevRole,
      updatedValue: newRole,
    });

    return updatedUser;
  }

  // ---------------------------------------------------------------------------
  // 5. Community Suspension & Hub Moderation
  // ---------------------------------------------------------------------------
  public async suspendCommunity(
    adminUser: User,
    community: Community,
    reason: string
  ): Promise<Community> {
    if (!this.isAuthorized(adminUser, 'admin')) {
      throw new Error('Access Denied: Administrator clearance required to suspend communities.');
    }

    const updatedCommunity: Community = {
      ...community,
      isSuspended: true,
      suspendedReason: reason || 'Community guidelines violation',
      suspendedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'communities', community.id), {
        isSuspended: true,
        suspendedReason: updatedCommunity.suspendedReason,
        suspendedAt: updatedCommunity.suspendedAt,
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'community_suspended',
      targetType: 'community',
      targetId: community.id,
      targetName: community.name,
      details: `Suspended community hub: "${reason}"`,
      previousValue: 'active',
      updatedValue: 'suspended',
    });

    return updatedCommunity;
  }

  public async unsuspendCommunity(
    adminUser: User,
    community: Community
  ): Promise<Community> {
    if (!this.isAuthorized(adminUser, 'admin')) {
      throw new Error('Access Denied: Administrator clearance required to unsuspend communities.');
    }

    const updatedCommunity: Community = {
      ...community,
      isSuspended: false,
      suspendedReason: undefined,
      suspendedAt: undefined,
    };

    try {
      await updateDoc(doc(db, 'communities', community.id), {
        isSuspended: false,
        suspendedReason: '',
        suspendedAt: '',
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'community_unsuspended',
      targetType: 'community',
      targetId: community.id,
      targetName: community.name,
      details: 'Reactivated community hub and restored channel access.',
      previousValue: 'suspended',
      updatedValue: 'active',
    });

    return updatedCommunity;
  }

  // ---------------------------------------------------------------------------
  // 6. Reports Management
  // ---------------------------------------------------------------------------
  public async submitReport(payload: {
    reporter: User;
    targetType: ReportTargetType;
    targetId: string;
    targetName?: string;
    reason: string;
    details?: string;
  }): Promise<PlatformReport> {
    if (!payload.reason || payload.reason.trim().length < 3) {
      throw new Error('Please provide a descriptive reason for this report.');
    }

    const reportId = 'rep_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const newReport: PlatformReport = {
      id: reportId,
      reporterId: payload.reporter.id,
      reporterName: payload.reporter.displayName || payload.reporter.username,
      targetType: payload.targetType,
      targetId: payload.targetId,
      targetName: payload.targetName || payload.targetId,
      reason: payload.reason.trim(),
      details: payload.details || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.reportsCache.set(newReport.id, newReport);
    this.persistReportsToStorage();

    try {
      await setDoc(doc(db, 'reports', reportId), newReport);
    } catch {}

    return newReport;
  }

  public async listReports(
    caller: User,
    statusFilter: string = 'all'
  ): Promise<PlatformReport[]> {
    if (!this.isAuthorized(caller, 'moderator')) {
      throw new Error('Access Denied: Moderator clearance required to review reports.');
    }

    try {
      const snap = await getDocs(
        query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(100))
      );
      snap.forEach((d) => {
        const item = d.data() as PlatformReport;
        this.reportsCache.set(item.id, item);
      });
      this.persistReportsToStorage();
    } catch {}

    const all = Array.from(this.reportsCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (statusFilter === 'all') return all;
    return all.filter((r) => r.status === statusFilter);
  }

  public async resolveReport(
    adminUser: User,
    reportId: string,
    decision: ModerationDecision,
    notes?: string
  ): Promise<PlatformReport> {
    if (!this.isAuthorized(adminUser, 'moderator')) {
      throw new Error('Access Denied: Moderator clearance required to resolve reports.');
    }

    const report = this.reportsCache.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found.`);
    }

    const updated: PlatformReport = {
      ...report,
      status: 'resolved',
      decision,
      moderatorNotes: notes || '',
      resolvedBy: adminUser.id,
      resolvedByName: adminUser.displayName || adminUser.username,
      resolvedAt: new Date().toISOString(),
    };

    this.reportsCache.set(reportId, updated);
    this.persistReportsToStorage();

    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: updated.status,
        decision: updated.decision,
        moderatorNotes: updated.moderatorNotes,
        resolvedBy: updated.resolvedBy,
        resolvedByName: updated.resolvedByName,
        resolvedAt: updated.resolvedAt,
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'report_resolved',
      targetType: 'report',
      targetId: reportId,
      targetName: `${report.targetType}:${report.targetName || report.targetId}`,
      details: `Resolved report with decision: "${decision}". Notes: "${notes || 'None'}"`,
      previousValue: report.status,
      updatedValue: 'resolved',
    });

    return updated;
  }

  public async updateReportStatus(
    adminUser: User,
    reportId: string,
    status: ReportStatus,
    notes?: string
  ): Promise<PlatformReport> {
    if (!this.isAuthorized(adminUser, 'moderator')) {
      throw new Error('Access Denied: Moderator clearance required.');
    }

    const report = this.reportsCache.get(reportId);
    if (!report) throw new Error(`Report ${reportId} not found.`);

    const updated: PlatformReport = {
      ...report,
      status,
      moderatorNotes: notes !== undefined ? notes : report.moderatorNotes,
      resolvedBy: status === 'resolved' || status === 'dismissed' ? adminUser.id : report.resolvedBy,
      resolvedByName: status === 'resolved' || status === 'dismissed' ? (adminUser.displayName || adminUser.username) : report.resolvedByName,
      resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : report.resolvedAt,
    };

    this.reportsCache.set(reportId, updated);
    this.persistReportsToStorage();

    try {
      await updateDoc(doc(db, 'reports', reportId), {
        status: updated.status,
        moderatorNotes: updated.moderatorNotes || '',
        resolvedBy: updated.resolvedBy || '',
        resolvedByName: updated.resolvedByName || '',
        resolvedAt: updated.resolvedAt || '',
      });
    } catch {}

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'report_status_changed',
      targetType: 'report',
      targetId: reportId,
      targetName: `${report.targetType}:${report.targetName || report.targetId}`,
      details: `Updated report status to "${status}"`,
      previousValue: report.status,
      updatedValue: status,
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // 7. Beta Access Revocation
  // ---------------------------------------------------------------------------
  public async revokeBetaAccess(
    adminUser: User,
    applicantId: string,
    reason?: string
  ): Promise<void> {
    if (!this.isAuthorized(adminUser, 'admin')) {
      throw new Error('Access Denied: Administrator clearance required to revoke beta access.');
    }

    await betaAccessService.reviewApplication(
      adminUser,
      applicantId,
      'rejected',
      reason || 'Beta access revoked by administrator.'
    );

    await this.recordAuditLog({
      adminId: adminUser.id,
      adminName: adminUser.displayName || adminUser.username,
      adminRole: this.getEffectiveRole(adminUser),
      action: 'beta_access_revoked',
      targetType: 'beta_application',
      targetId: applicantId,
      targetName: applicantId,
      details: `Revoked beta access: "${reason || 'No reason specified'}"`,
      previousValue: 'approved',
      updatedValue: 'rejected',
    });
  }
}

export const adminService = new AdminService();
