/**
 * NEXORA — EXECUTIVE LEADERSHIP HIERARCHY & SPECIFIC ADMIN LOGIN QA SUITE
 *
 * Verifies:
 * 1. Three Executive Clearance Categories:
 *    - Chairman and Founder (Full Access / Platform Sovereign)
 *    - CEO (Executive Strategic Operations)
 *    - Managing Director (Operational Community & Moderation)
 * 2. Exclusive Approval Gate:
 *    - Only Chairman & Founder, CEO, and Managing Director can approve beta access and verified assets.
 *    - Ordinary members and regular moderators are strictly rejected from approving beta testers.
 * 3. Identity & Audit Recording:
 *    - Approval actions record the reviewer's Executive Title and Executive Category.
 * 4. Executive One-Click Evaluation Accounts & Authentication Flow.
 * 5. UI & Security Defense-in-Depth Verification.
 */

import fs from 'fs';
import path from 'path';
import { adminService } from '../services/adminService';
import { betaAccessService } from '../services/betaAccessService';
import { getOrCreateExecutiveAccount } from '../utils/authVault';
import {
  User,
  ExecutiveCategory,
  EXECUTIVE_ROLES,
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

async function runExecutiveHierarchySuite() {
  console.log('======================================================================');
  console.log('👑 NEXORA EXECUTIVE LEADERSHIP & SPECIFIC ADMIN LOGIN SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();
  const authScreenSource = fs.readFileSync(path.join(rootDir, 'src/components/auth/AuthScreen.tsx'), 'utf8');
  const adminModalSource = fs.readFileSync(path.join(rootDir, 'src/components/admin/AdminControlPanelModal.tsx'), 'utf8');
  const contextSource = fs.readFileSync(path.join(rootDir, 'src/context/NexoraContext.tsx'), 'utf8');
  const typesSource = fs.readFileSync(path.join(rootDir, 'src/types/index.ts'), 'utf8');

  // Test User Identities
  const founderUser: User = {
    id: 'nxr_test_founder',
    username: 'alex_vance',
    displayName: 'Alex Vance',
    tag: '#0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    status: 'online',
    joinedAt: '2026-11-01',
    email: 'founder@nexora.io',
    executiveCategory: 'founder',
    executiveTitle: 'Chairman and Founder',
    platformRole: 'super_admin',
    role: 'owner',
  };

  const ceoUser: User = {
    id: 'nxr_test_ceo',
    username: 'cypher_ceo',
    displayName: 'Elena Rostova',
    tag: '#0002',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    status: 'online',
    joinedAt: '2026-11-02',
    email: 'ceo@nexora.io',
    executiveCategory: 'ceo',
    executiveTitle: 'CEO',
    platformRole: 'admin',
    role: 'admin',
  };

  const mdUser: User = {
    id: 'nxr_test_md',
    username: 'vanguard_md',
    displayName: 'Marcus Kane',
    tag: '#0003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    status: 'online',
    joinedAt: '2026-11-03',
    email: 'md@nexora.io',
    executiveCategory: 'managing_director',
    executiveTitle: 'Managing Director',
    platformRole: 'admin',
    role: 'admin',
  };

  const regularUser: User = {
    id: 'nxr_test_member',
    username: 'standard_operative',
    displayName: 'Standard Operative',
    tag: '#4444',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
    status: 'online',
    joinedAt: '2026-11-04',
    email: 'operative@nexora.tech',
    platformRole: 'none',
    role: 'member',
  };

  // -------------------------------------------------------------------------
  // [1/5] Schema & 3 Executive Category Definitions
  // -------------------------------------------------------------------------
  console.log('[1/5] Verifying 3 Executive Categories & Roles Schema');
  assert(
    EXECUTIVE_ROLES.founder.title === 'Chairman and Founder',
    'Category 1: Title matches "Chairman and Founder"'
  );
  assert(
    EXECUTIVE_ROLES.founder.scope.includes('Full Access'),
    'Category 1: Scope provides Full Access (Platform Sovereign)'
  );
  assert(
    EXECUTIVE_ROLES.founder.platformRole === 'super_admin' && EXECUTIVE_ROLES.founder.rank === 3,
    'Category 1: Resolves to platformRole: super_admin with rank 3'
  );

  assert(
    EXECUTIVE_ROLES.ceo.title === 'CEO',
    'Category 2: Title matches "CEO"'
  );
  assert(
    EXECUTIVE_ROLES.ceo.scope.includes('Executive Access'),
    'Category 2: Scope provides Executive Access (Strategic Operations)'
  );
  assert(
    EXECUTIVE_ROLES.ceo.platformRole === 'admin' && EXECUTIVE_ROLES.ceo.rank === 2,
    'Category 2: Resolves to platformRole: admin with rank 2'
  );

  assert(
    EXECUTIVE_ROLES.managing_director.title === 'Managing Director',
    'Category 3: Title matches "Managing Director"'
  );
  assert(
    EXECUTIVE_ROLES.managing_director.scope.includes('Operational Access'),
    'Category 3: Scope provides Operational Access (Community & Moderation)'
  );
  assert(
    EXECUTIVE_ROLES.managing_director.platformRole === 'admin' && EXECUTIVE_ROLES.managing_director.rank === 1,
    'Category 3: Resolves to platformRole: admin with rank 1'
  );

  // -------------------------------------------------------------------------
  // [2/5] Role Hierarchy & Sovereign Approval Authority
  // -------------------------------------------------------------------------
  console.log('\n[2/5] Verifying Role Hierarchy & Approval Clearance Engine');
  assert(
    adminService.getEffectiveRole(founderUser) === 'super_admin',
    'Founder resolves with super_admin platform clearance'
  );
  assert(
    adminService.getEffectiveRole(ceoUser) === 'admin',
    'CEO resolves with admin platform clearance'
  );
  assert(
    adminService.getEffectiveRole(mdUser) === 'admin',
    'Managing Director resolves with admin platform clearance'
  );
  assert(
    adminService.canApproveEverything(founderUser) === true,
    'Chairman & Founder has sovereign permission to approve everything'
  );
  assert(
    adminService.canApproveEverything(ceoUser) === false,
    'CEO cannot alter root sovereign configuration (Founder only)'
  );
  assert(
    adminService.canApprove(founderUser) === true,
    'Founder holds approval clearance'
  );
  assert(
    adminService.canApprove(ceoUser) === true,
    'CEO holds approval clearance'
  );
  assert(
    adminService.canApprove(mdUser) === true,
    'Managing Director holds approval clearance'
  );
  assert(
    adminService.canApprove(regularUser) === false,
    'Regular member strictly blocked from executing approvals'
  );

  // -------------------------------------------------------------------------
  // [3/5] Exclusive Beta Approval Gate Enforcement
  // -------------------------------------------------------------------------
  console.log('\n[3/5] Testing Exclusive Beta Approval Gate ("They Can Only Approve Everything")');
  const testApplicantId = 'app_exec_test_' + Date.now();
  await betaAccessService.submitApplication({
    userId: testApplicantId,
    email: 'candidate@nexora.io',
    displayName: 'Candidate Tester',
    username: 'candidate_tester',
    experience: 'QA Engineer',
    devices: ['Windows PC', 'Android Phone'],
  });

  // Verify ordinary user is rejected
  let blocked = false;
  try {
    await betaAccessService.reviewApplication(regularUser, testApplicantId, 'approved', 'Unauthorized approval attempt');
  } catch (err: any) {
    blocked = true;
    assert(
      err.message.includes('Access Denied') || err.message.includes('Executive'),
      'Ordinary user rejection error explains executive authority requirement'
    );
  }
  assert(blocked, 'Ordinary user strictly prevented from approving beta applicants');

  // Verify Managing Director approval
  const approvedByMD = await betaAccessService.reviewApplication(
    mdUser,
    testApplicantId,
    'approved',
    'Approved by Managing Director'
  );
  assert(approvedByMD.status === 'approved', 'Managing Director successfully approved beta candidate');
  assert(
    approvedByMD.reviewedByTitle === 'Managing Director',
    'Approval record captures reviewedByTitle: "Managing Director"'
  );
  assert(
    approvedByMD.reviewedByCategory === 'managing_director',
    'Approval record captures reviewedByCategory: "managing_director"'
  );

  // Verify CEO approval update
  const approvedByCEO = await betaAccessService.reviewApplication(
    ceoUser,
    testApplicantId,
    'approved',
    'Reviewed & confirmed by CEO'
  );
  assert(
    approvedByCEO.reviewedByTitle === 'CEO',
    'Approval record captures reviewedByTitle: "CEO"'
  );

  // Verify Chairman and Founder approval update
  const approvedByFounder = await betaAccessService.reviewApplication(
    founderUser,
    testApplicantId,
    'approved',
    'Sovereign confirmation by Founder'
  );
  assert(
    approvedByFounder.reviewedByTitle === 'Chairman and Founder',
    'Approval record captures reviewedByTitle: "Chairman and Founder"'
  );

  // -------------------------------------------------------------------------
  // [4/5] Executive User IDs & Normal Authentication Flow
  // -------------------------------------------------------------------------
  console.log('\n[4/5] Testing Executive User IDs & Normal Authentication Flow');
  const founderAcc = await getOrCreateExecutiveAccount('founder');
  assert(
    founderAcc.executiveCategory === 'founder' && founderAcc.username === 'founderofnxr',
    'Founder user ID/callsign is strictly "founderofnxr"'
  );
  assert(
    founderAcc.email === 'founderofnxr@nexora.io',
    'Founder electronic mail is "founderofnxr@nexora.io"'
  );
  assert(
    founderAcc.platformRole === 'super_admin' && founderAcc.betaStatus === 'approved',
    'Founder account initialized with platformRole: super_admin and approved beta'
  );

  const ceoAcc = await getOrCreateExecutiveAccount('ceo');
  assert(
    ceoAcc.executiveCategory === 'ceo' && ceoAcc.username === 'ceoofnxr',
    'CEO user ID/callsign is "ceoofnxr"'
  );
  assert(
    ceoAcc.platformRole === 'admin' && ceoAcc.betaStatus === 'approved',
    'CEO account initialized with platformRole: admin and approved beta'
  );

  const mdAcc = await getOrCreateExecutiveAccount('managing_director');
  assert(
    mdAcc.executiveCategory === 'managing_director' && mdAcc.username === 'mdofnxr',
    'Managing Director user ID/callsign is "mdofnxr"'
  );
  assert(
    mdAcc.platformRole === 'admin' && mdAcc.betaStatus === 'approved',
    'Managing Director account initialized with platformRole: admin and approved beta'
  );

  // -------------------------------------------------------------------------
  // [5/5] Unified Standard Login Verification (No Separate Dashboard)
  // -------------------------------------------------------------------------
  console.log('\n[5/5] Verifying Unified Standard Login (Normal Access Flow)');
  assert(
    contextSource.includes('lowerClean === \'founderofnxr\''),
    'NexoraContext loginWithEmail authenticates "founderofnxr" directly via normal login form'
  );
  assert(
    contextSource.includes('lowerClean === \'ceoofnxr\'') && contextSource.includes('lowerClean === \'mdofnxr\''),
    'NexoraContext loginWithEmail authenticates "ceoofnxr" and "mdofnxr" directly via normal login form'
  );
  assert(
    !authScreenSource.includes('EXECUTIVE COMMAND GATEWAY'),
    'AuthScreen has NO separate dashboard or separate gateway banner (unified standard login)'
  );
  assert(
    adminModalSource.includes('Chairman') &&
    adminModalSource.includes('Founder') &&
    adminModalSource.includes('CEO') &&
    adminModalSource.includes('Managing Director') &&
    adminModalSource.includes('Executive Leadership Hierarchy'),
    'AdminControlPanelModal displays Executive Leadership Clearance Matrix with all 3 categories'
  );
  assert(
    adminModalSource.includes('Exclusive Executive Authority') || adminModalSource.includes('Exclusive Executive Approval Gate'),
    'AdminControlPanelModal Beta tab highlights Exclusive Executive Authority gate'
  );

  console.log('\n======================================================================');
  console.log(`👑 EXECUTIVE LEADERSHIP SUITE COMPLETED: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runExecutiveHierarchySuite().catch((err) => {
  console.error('Fatal error during executive hierarchy suite execution:', err);
  process.exit(1);
});
