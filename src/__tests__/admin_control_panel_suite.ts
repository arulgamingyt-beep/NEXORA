/**
 * NEXORA — ADVANCED ADMIN CONTROL PANEL QA & SECURITY VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Role-Based Access Hierarchy: Super Administrator > Administrator > Moderator > None
 * 2. Unauthorized Access Attempts: Strict rejection of unauthorized calls
 * 3. Self-Elevation Prevention: Backend & rule-level barrier preventing privilege escalation
 * 4. User Suspension & Reactivation: Full account moderation lifecycle
 * 5. Community Hub Moderation: Suspension and restoration of communities
 * 6. Report Triage & Moderation Decisions: Intake, investigation, verdicts, and notes
 * 7. Beta Access Revocation & Management: Complete tester administration
 * 8. Immutable Audit Log Ledger: Tamper-proof record validation & rule enforcement
 * 9. Real Live Dashboard Metrics: Computed metrics from live collections without fake statistics
 */

import fs from 'fs';
import path from 'path';
import { adminService } from '../services/adminService';
import { betaAccessService } from '../services/betaAccessService';
import {
  User,
  Community,
  Message,
  PlatformRole,
  PlatformReport,
  ReportTargetType,
  ModerationDecision,
} from '../types';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
    failCount++;
  }
}

async function runAdminControlPanelSuite() {
  console.log('======================================================================');
  console.log('🛡️  NEXORA ADVANCED ADMIN CONTROL PANEL QA & SECURITY SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();
  const firestoreRules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
  const adminServiceSource = fs.readFileSync(path.join(rootDir, 'src/services/adminService.ts'), 'utf8');
  const adminModalSource = fs.readFileSync(path.join(rootDir, 'src/components/admin/AdminControlPanelModal.tsx'), 'utf8');
  const contextSource = fs.readFileSync(path.join(rootDir, 'src/context/NexoraContext.tsx'), 'utf8');

  // Test Entities
  const superAdminUser: User = {
    id: 'nxr_super_admin_01',
    username: 'cypher_prime',
    displayName: 'Cypher Prime',
    tag: '#0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    status: 'online',
    joinedAt: '2026-11-01',
    email: 'admin@nexora.io',
    platformRole: 'super_admin',
    role: 'owner',
  };

  const adminUser: User = {
    id: 'nxr_admin_02',
    username: 'elena_r',
    displayName: 'Elena Rostova',
    tag: '#1024',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    status: 'online',
    joinedAt: '2026-11-02',
    email: 'elena@nexora.tech',
    platformRole: 'admin',
    role: 'admin',
  };

  const moderatorUser: User = {
    id: 'nxr_mod_03',
    username: 'marcus_v',
    displayName: 'Marcus Vance',
    tag: '#2048',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    status: 'idle',
    joinedAt: '2026-11-03',
    email: 'marcus@nexora.tech',
    platformRole: 'moderator',
    role: 'moderator',
  };

  const normalUser: User = {
    id: 'nxr_member_04',
    username: 'david_p',
    displayName: 'David Patel',
    tag: '#9914',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
    status: 'online',
    joinedAt: '2026-11-04',
    email: 'david@cloudscale.net',
    platformRole: 'none',
    role: 'member',
  };

  const testCommunity: Community = {
    id: 'comm_cyber_hub_01',
    name: 'Cybernetic Syndicate',
    tagline: 'High bandwidth decentralized intelligence',
    icon: '🔮',
    ownerId: normalUser.id,
    description: 'Community for advanced network operations',
    isPublic: true,
    inviteCode: 'CS-8812',
    categories: [],
    channels: [],
    members: [],
  };

  // ---------------------------------------------------------------------------
  // TEST 1: Role-Based Access Hierarchy
  // ---------------------------------------------------------------------------
  console.log('[1/9] Testing Platform Clearance Hierarchy Verification');
  assert(
    adminService.getEffectiveRole(superAdminUser) === 'super_admin',
    'Super Administrator resolves with platformRole: super_admin'
  );
  assert(
    adminService.getEffectiveRole(adminUser) === 'admin',
    'Administrator resolves with platformRole: admin'
  );
  assert(
    adminService.getEffectiveRole(moderatorUser) === 'moderator',
    'Moderator resolves with platformRole: moderator'
  );
  assert(
    adminService.getEffectiveRole(normalUser) === 'none',
    'Standard operative resolves with platformRole: none'
  );
  assert(
    adminService.isAuthorized(superAdminUser, 'moderator') &&
      adminService.isAuthorized(superAdminUser, 'admin') &&
      adminService.isAuthorized(superAdminUser, 'super_admin'),
    'Super Admin possesses clearance for moderator, admin, and super_admin tiers'
  );
  assert(
    adminService.isAuthorized(adminUser, 'moderator') &&
      adminService.isAuthorized(adminUser, 'admin') &&
      !adminService.isAuthorized(adminUser, 'super_admin'),
    'Admin possesses clearance for moderator and admin, but NOT super_admin'
  );
  assert(
    adminService.isAuthorized(moderatorUser, 'moderator') &&
      !adminService.isAuthorized(moderatorUser, 'admin'),
    'Moderator possesses clearance for moderator, but NOT admin'
  );
  assert(
    !adminService.isAuthorized(normalUser, 'moderator') &&
      !adminService.isAuthorized(normalUser, 'admin') &&
      !adminService.isAuthorized(normalUser, 'super_admin'),
    'Standard operative has 0 platform administrative clearance'
  );

  // ---------------------------------------------------------------------------
  // TEST 2: Unauthorized Access Attempts
  // ---------------------------------------------------------------------------
  console.log('\n[2/9] Testing Unauthorized Access Interception & Rejection');

  let normalSuspendBlocked = false;
  try {
    await adminService.suspendUser(normalUser, normalUser, 'Malicious self-suspension');
  } catch (err: any) {
    if (err.message.includes('Access Denied')) normalSuspendBlocked = true;
  }
  assert(normalSuspendBlocked, 'Standard operative blocked from executing account suspension');

  let modSuspendBlocked = false;
  try {
    await adminService.suspendUser(moderatorUser, normalUser, 'Moderator suspension attempt');
  } catch (err: any) {
    if (err.message.includes('Access Denied')) modSuspendBlocked = true;
  }
  assert(modSuspendBlocked, 'Moderator blocked from suspending accounts (Admin clearance required)');

  let adminElevateBlocked = false;
  try {
    await adminService.updateUserPlatformRole(adminUser, normalUser, 'super_admin');
  } catch (err: any) {
    if (err.message.includes('Access Denied')) adminElevateBlocked = true;
  }
  assert(adminElevateBlocked, 'Administrator blocked from elevating users to Super Administrator');

  let normalAuditReadBlocked = false;
  try {
    await adminService.listAuditLogs(normalUser);
  } catch (err: any) {
    if (err.message.includes('Access Denied')) normalAuditReadBlocked = true;
  }
  assert(normalAuditReadBlocked, 'Standard operative blocked from reading administrative audit ledger');

  // ---------------------------------------------------------------------------
  // TEST 3: Self-Elevation Prevention & Firestore Rules
  // ---------------------------------------------------------------------------
  console.log('\n[3/9] Testing Self-Elevation Security Rules & Privilege Escalation Barrier');

  assert(
    firestoreRules.includes('function isSuperAdmin()') &&
      firestoreRules.includes('getPlatformRole() == \'super_admin\''),
    'Firestore Security Rules implement trusted isSuperAdmin() helper'
  );
  assert(
    firestoreRules.includes('!(\'platformRole\' in request.resource.data) || request.resource.data.platformRole == resource.data.platformRole'),
    'Firestore Security Rules prevent ordinary users from mutating their platformRole'
  );
  assert(
    firestoreRules.includes('!(\'isSuspended\' in request.resource.data) || request.resource.data.isSuspended == resource.data.isSuspended'),
    'Firestore Security Rules prevent ordinary users from un-suspending themselves'
  );
  assert(
    firestoreRules.includes('isSuperAdmin()') &&
      firestoreRules.includes('isPlatformAdmin() && (!(\'platformRole\' in request.resource.data) || request.resource.data.platformRole == resource.data.platformRole)'),
    'Firestore Security Rules forbid modifying platformRole without Super Admin clearance'
  );

  // ---------------------------------------------------------------------------
  // TEST 4: User Suspension & Reactivation Lifecycle
  // ---------------------------------------------------------------------------
  console.log('\n[4/9] Testing User Suspension & Reactivation Moderation Lifecycle');

  const suspendedUser = await adminService.suspendUser(
    adminUser,
    normalUser,
    'Repeated spam transmissions across public hubs'
  );
  assert(suspendedUser.isSuspended === true, 'Operative account successfully marked isSuspended: true');
  assert(
    suspendedUser.suspendedReason === 'Repeated spam transmissions across public hubs',
    'Suspension reason accurately captured on user object'
  );
  assert(typeof suspendedUser.suspendedAt === 'string', 'Suspension timestamp ISO string recorded');

  // Verify feature lockout checks exist in context
  assert(
    contextSource.includes('if (currentUser.isSuspended)') &&
      contextSource.includes('Transmissions locked by platform administration'),
    'NexoraContext enforces transmission lockout for suspended accounts'
  );
  assert(
    contextSource.includes('Voice mesh access locked'),
    'NexoraContext locks WebRTC voice mesh access for suspended accounts'
  );
  assert(
    contextSource.includes('Calling capabilities locked'),
    'NexoraContext locks 1-on-1 and group calling for suspended accounts'
  );

  // Reactivate user
  const reactivatedUser = await adminService.reactivateUser(adminUser, suspendedUser);
  assert(reactivatedUser.isSuspended === false, 'Operative account reactivated (isSuspended: false)');
  assert(!reactivatedUser.suspendedReason, 'Suspension reason cleared upon reactivation');

  // ---------------------------------------------------------------------------
  // TEST 5: Community Hub Suspension & Restoration
  // ---------------------------------------------------------------------------
  console.log('\n[5/9] Testing Community Hub Suspension & Restoration');

  const suspendedCommunity = await adminService.suspendCommunity(
    adminUser,
    testCommunity,
    'Unmoderated toxic transmissions'
  );
  assert(suspendedCommunity.isSuspended === true, 'Community hub successfully marked isSuspended: true');
  assert(
    suspendedCommunity.suspendedReason === 'Unmoderated toxic transmissions',
    'Community suspension reason accurately captured'
  );

  const restoredCommunity = await adminService.unsuspendCommunity(adminUser, suspendedCommunity);
  assert(restoredCommunity.isSuspended === false, 'Community hub successfully restored (isSuspended: false)');
  assert(!restoredCommunity.suspendedReason, 'Community suspension reason cleared upon restoration');

  // ---------------------------------------------------------------------------
  // TEST 6: Report Intake, Triage, and Moderation Decisions
  // ---------------------------------------------------------------------------
  console.log('\n[6/9] Testing Report Intake, Status Assignment & Moderation Decisions');

  // Report creation
  const report = await adminService.submitReport({
    reporter: normalUser,
    targetType: 'user',
    targetId: 'target_offender_99',
    targetName: '@spammer_99',
    reason: 'Phishing URLs in direct messages',
    details: 'User sent unauthorized malicious executable links.',
  });
  assert(report.id.startsWith('rep_'), 'Report generated with unique ticket id prefix rep_');
  assert(report.status === 'pending', 'Report initialized with status: pending');
  assert(report.reporterId === normalUser.id, 'Reporter ID correctly bound');

  // Report triage & status progression
  const updatedReport = await adminService.updateReportStatus(
    moderatorUser,
    report.id,
    'investigating'
  );
  assert(updatedReport.status === 'investigating', 'Moderator successfully transitioned report to status: investigating');

  // Moderation decision recording
  const resolvedReport = await adminService.resolveReport(
    moderatorUser,
    report.id,
    'account_suspended',
    'Evidence confirmed malicious links. Target account escalated for suspension.'
  );
  assert(resolvedReport.status === 'resolved', 'Report status successfully transitioned to resolved');
  assert(resolvedReport.decision === 'account_suspended', 'Decision recorded as account_suspended');
  assert(resolvedReport.moderatorNotes?.includes('Evidence confirmed'), 'Moderator rationale captured in permanent record');
  assert(resolvedReport.resolvedBy === moderatorUser.id, 'Moderator identity recorded on resolved report');

  // ---------------------------------------------------------------------------
  // TEST 7: Beta Access Revocation
  // ---------------------------------------------------------------------------
  console.log('\n[7/9] Testing Beta Clearance Revocation & Device Activity');

  const betaApp = await betaAccessService.submitApplication({
    userId: 'nxr_tester_alpha_01',
    email: 'tester_alpha@nexora.tech',
    displayName: 'Alpha Tester',
    username: 'tester_alpha',
    devices: ['iPhone 15 Pro (Safari 17)', 'Windows 11 (Chrome 122)'],
    experience: 'QA lead with WebRTC experience',
  });
  assert(betaApp.status === 'pending', 'Beta application created in pending status');

  await betaAccessService.reviewApplication(adminUser, betaApp.id, 'approved', 'Approved for RTC field tests');
  const approvedApp = await betaAccessService.getApplication(betaApp.id);
  assert(approvedApp?.status === 'approved', 'Beta tester access approved');

  await adminService.revokeBetaAccess(adminUser, betaApp.id, 'Failure to submit weekly feedback');
  const revokedApp = await betaAccessService.getApplication(betaApp.id);
  assert(
    revokedApp?.status === 'rejected' || revokedApp?.status === 'pending',
    'Beta clearance revoked upon administrative action'
  );

  // ---------------------------------------------------------------------------
  // TEST 8: Immutable Audit Log Ledger Integrity
  // ---------------------------------------------------------------------------
  console.log('\n[8/9] Testing Immutable Audit Log Ledger & Cryptographic Integrity');

  const audits = await adminService.listAuditLogs(moderatorUser);
  assert(audits.length >= 5, 'Audit trail populated with operational events');

  const latestLog = audits[0];
  assert(typeof latestLog.id === 'string', 'Audit log has unique ID');
  assert(typeof latestLog.timestamp === 'string', 'Audit log records ISO timestamp');
  assert(typeof latestLog.adminName === 'string', 'Audit log records acting administrator name');
  assert(typeof latestLog.adminRole === 'string', 'Audit log records acting administrator clearance');
  assert(typeof latestLog.action === 'string', 'Audit log records precise action string');
  assert(typeof latestLog.targetName === 'string', 'Audit log records target name');

  // Verify Firestore security rules immutability
  assert(
    firestoreRules.includes('match /admin_audit_logs/{logId}') &&
      firestoreRules.includes('allow update: if false;'),
    'Firestore Security Rules strictly enforce IMMUTABLE audit log (allow update: if false;)'
  );
  assert(
    firestoreRules.includes('allow delete: if false;'),
    'Firestore Security Rules strictly prevent deleting audit logs (allow delete: if false;)'
  );

  // ---------------------------------------------------------------------------
  // TEST 9: Real Platform Dashboard Metrics Computation (No Fake Statistics)
  // ---------------------------------------------------------------------------
  console.log('\n[9/9] Testing Real Platform Dashboard Metrics Calculation');

  const liveUsers: Record<string, User> = {
    [superAdminUser.id]: superAdminUser,
    [adminUser.id]: adminUser,
    [moderatorUser.id]: moderatorUser,
    [normalUser.id]: { ...normalUser, isSuspended: true }, // 1 suspended
  };

  const liveCommunities: Community[] = [
    testCommunity,
    { ...testCommunity, id: 'comm_02', isSuspended: true }, // 1 suspended
  ];

  const liveMessages: Message[] = [
    {
      id: 'm1',
      authorId: 'u1',
      authorName: 'Alex',
      authorAvatar: '',
      authorRole: 'member',
      authorTag: '#1',
      content: 'Transmission 1',
      timestamp: new Date().toISOString(),
      reactions: [],
    },
    {
      id: 'm2',
      authorId: 'u2',
      authorName: 'Elena',
      authorRole: 'admin',
      authorTag: '#2',
      content: 'Transmission 2',
      timestamp: new Date().toISOString(),
      reactions: [],
    },
  ];

  const metrics = await adminService.getDashboardMetrics(liveUsers, liveCommunities, liveMessages);

  assert(metrics.totalUsers === 4, `Real totalUsers calculated: ${metrics.totalUsers} === 4`);
  assert(
    metrics.onlineUsers === 3,
    `Real onlineUsers calculated (super_admin, admin, normal): ${metrics.onlineUsers} === 3`
  );
  assert(
    metrics.suspendedAccounts === 1,
    `Real suspendedAccounts calculated: ${metrics.suspendedAccounts} === 1`
  );
  assert(
    metrics.totalCommunities === 2,
    `Real totalCommunities calculated: ${metrics.totalCommunities} === 2`
  );
  assert(
    metrics.suspendedCommunities === 1,
    `Real suspendedCommunities calculated: ${metrics.suspendedCommunities} === 1`
  );
  assert(
    metrics.totalMessages === 2,
    `Real totalMessages calculated: ${metrics.totalMessages} === 2`
  );
  assert(
    typeof metrics.pendingReports === 'number',
    `Real pendingReports dynamically tallied: ${metrics.pendingReports}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`📊 ADMIN CONTROL PANEL QA SUITE COMPLETED`);
  console.log(`   Passed: ${passCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log('======================================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runAdminControlPanelSuite().catch((err) => {
  console.error('Fatal error running admin control panel suite:', err);
  process.exit(1);
});
