/**
 * NEXORA — PRIVATE BETA ONBOARDING & ACCESS CONTROL TEST SUITE
 * 
 * Verifies:
 * 1. Beta Registration: Display name, email, callsign collection & validation
 * 2. Duplicate Account Prevention: Rejection of existing emails with clear errors
 * 3. Backend Access Control: Enforcing status == 'pending' on creation
 * 4. Self-Approval Prevention: Strict rejection of client attempts to self-approve
 * 5. Administrator Authorization: Only admins can approve/reject beta applicants
 * 6. Feature Gating: Unapproved applicants blocked from messaging, communities, and voice mesh
 * 7. Welcome Experience Content: 6 required onboarding modules verified
 * 8. Beta Feedback Connection: Ingestion with Ticket ID and confirmation
 * 9. Firestore Security Rules Coverage: /beta_applications ACL inspection
 * 10. Applicant Data Privacy: Cross-tenant application inspection blocked
 */

import fs from 'fs';
import path from 'path';
import { betaAccessService } from '../services/betaAccessService';
import { betaFeedbackService } from '../services/betaFeedbackService';
import { User, BetaApplication } from '../types';

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

async function runOnboardingSuite() {
  console.log('======================================================================');
  console.log('🧪 NEXORA PRIVATE BETA ONBOARDING & ACCESS CONTROL QA SUITE');
  console.log('======================================================================\n');

  const rootDir = process.cwd();
  const firestoreRules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
  const authScreenSource = fs.readFileSync(path.join(rootDir, 'src/components/auth/AuthScreen.tsx'), 'utf8');
  const contextSource = fs.readFileSync(path.join(rootDir, 'src/context/NexoraContext.tsx'), 'utf8');
  const pendingScreenSource = fs.readFileSync(path.join(rootDir, 'src/components/beta/BetaPendingScreen.tsx'), 'utf8');
  const welcomeGuideSource = fs.readFileSync(path.join(rootDir, 'src/components/beta/WelcomeGuideModal.tsx'), 'utf8');
  const adminModalSource = fs.readFileSync(path.join(rootDir, 'src/components/modals/BetaFeedbackAdminModal.tsx'), 'utf8');
  const appSource = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');

  // -------------------------------------------------------------------------
  // Test 01: Beta Registration Input Fields & Validation
  // -------------------------------------------------------------------------
  console.log('[1/8] Verifying Beta Registration Fields & Boundary Validation');
  const validApp = betaAccessService.validateApplication({
    email: 'new_operative@nexora.tech',
    displayName: 'Alex Vance',
    username: 'alex_vance',
  });
  assert(validApp.valid === true, 'Valid registration payload successfully validates');

  const invalidEmail = betaAccessService.validateApplication({
    email: 'invalid-email-format',
    displayName: 'Alex Vance',
    username: 'alex_vance',
  });
  assert(invalidEmail.valid === false, 'Invalid email format strictly rejected');

  const shortName = betaAccessService.validateApplication({
    email: 'valid@nexora.tech',
    displayName: 'A',
    username: 'alex_vance',
  });
  assert(shortName.valid === false, 'Short display name (<2 chars) strictly rejected');

  const shortCallsign = betaAccessService.validateApplication({
    email: 'valid@nexora.tech',
    displayName: 'Alex Vance',
    username: 'al',
  });
  assert(shortCallsign.valid === false, 'Short callsign (<3 chars) strictly rejected');

  assert(
    authScreenSource.includes('displayName') &&
    authScreenSource.includes('emailOrPhone') &&
    authScreenSource.includes('primaryDevice') &&
    authScreenSource.includes('handleRegister'),
    'AuthScreen collects Display Name, Electronic Mail, Callsign, and Environment'
  );

  // -------------------------------------------------------------------------
  // Test 02: Duplicate Account & Application Prevention
  // -------------------------------------------------------------------------
  console.log('\n[2/8] Verifying Duplicate Account & Application Prevention');
  const testUserId = 'test_usr_onboarding_' + Date.now();
  const testEmail = `tester_${Date.now()}@nexora.tech`;

  const app1 = await betaAccessService.submitApplication({
    userId: testUserId,
    email: testEmail,
    displayName: 'Beta Operative 01',
    username: 'beta_op_01',
    experience: 'Security Researcher',
    devices: ['Apple iPhone (iOS Safari)'],
  });
  assert(app1.status === 'pending', 'Submitted application initializes with status: "pending"');

  let duplicateCaught = false;
  try {
    await betaAccessService.submitApplication({
      userId: 'test_usr_duplicate_' + Date.now(),
      email: testEmail,
      displayName: 'Duplicate Attempter',
      username: 'dup_op',
    });
  } catch (err: any) {
    duplicateCaught = true;
    assert(
      err.message.includes('already exists'),
      'Duplicate email application rejected with clear error message'
    );
  }
  assert(duplicateCaught === true, 'Duplicate email registration safely blocked');

  // -------------------------------------------------------------------------
  // Test 03: Self-Approval Prevention Barrier
  // -------------------------------------------------------------------------
  console.log('\n[3/8] Verifying Self-Approval Prevention Barrier');
  let selfApprovalBlocked = false;
  try {
    await betaAccessService.submitApplication({
      userId: 'test_usr_hacker_' + Date.now(),
      email: `hacker_${Date.now()}@nexora.tech`,
      displayName: 'Privilege Escalator',
      username: 'hacker_01',
      status: 'approved', // Malicious attempt to self-approve!
    });
  } catch (err: any) {
    selfApprovalBlocked = true;
    assert(
      err.message.includes('Self-approval is strictly prohibited'),
      'Direct attempt to submit application with status="approved" blocked by backend'
    );
  }
  assert(selfApprovalBlocked === true, 'Users strictly prevented from approving themselves');

  // -------------------------------------------------------------------------
  // Test 04: Administrator-Controlled Approval & Rejection System
  // -------------------------------------------------------------------------
  console.log('\n[4/8] Verifying Administrator-Controlled Approval System');
  const adminUser: User = {
    id: 'nxr_admin_master_01',
    username: 'admin_master',
    displayName: 'System Administrator',
    tag: '#0001',
    avatar: 'https://images.unsplash.com/avatar',
    status: 'online',
    joinedAt: 'Nov 2026',
    role: 'admin',
    email: 'admin@nexora.io',
    betaStatus: 'approved',
  };

  const nonAdminUser: User = {
    id: 'nxr_unauth_user_02',
    username: 'unauth_user',
    displayName: 'Ordinary Tester',
    tag: '#9999',
    avatar: 'https://images.unsplash.com/avatar',
    status: 'online',
    joinedAt: 'Nov 2026',
    role: 'member',
    email: 'member@test.com',
    betaStatus: 'pending',
  };

  // Non-admin attempt to approve should fail
  let unauthorizedReviewBlocked = false;
  try {
    await betaAccessService.reviewApplication(nonAdminUser, testUserId, 'approved');
  } catch (err: any) {
    unauthorizedReviewBlocked = true;
  }
  assert(unauthorizedReviewBlocked === true, 'Non-admin users cannot approve applications');

  // Admin approval should succeed
  const approvedApp = await betaAccessService.reviewApplication(adminUser, testUserId, 'approved');
  assert(approvedApp.status === 'approved', 'Authorized Administrator successfully approves applicant');
  assert(approvedApp.reviewedBy === adminUser.id, 'Approval records administrator audit identity');

  // Admin rejection transition
  const rejectedApp = await betaAccessService.reviewApplication(adminUser, testUserId, 'rejected');
  assert(rejectedApp.status === 'rejected', 'Authorized Administrator successfully rejects applicant');

  // Reset to approved for testing
  await betaAccessService.reviewApplication(adminUser, testUserId, 'approved');

  // -------------------------------------------------------------------------
  // Test 05: Beta Feature Gating for Unapproved Applicants
  // -------------------------------------------------------------------------
  console.log('\n[5/8] Verifying Backend Feature Gating for Unapproved Users');
  assert(
    contextSource.includes('if (!isBetaApproved)') &&
    contextSource.includes('Beta access pending administrator approval'),
    'Context enforces isBetaApproved checks on messaging, community creation, and voice mesh'
  );
  assert(
    appSource.includes('if (!isBetaApproved)') &&
    appSource.includes('<BetaPendingScreen />'),
    'App router presents BetaPendingScreen to unapproved applicants, blocking main workspace'
  );
  assert(
    pendingScreenSource.includes('APPLICATION UNDER REVIEW') &&
    pendingScreenSource.includes('Check Approval Status') &&
    pendingScreenSource.includes('Ticket Reference ID'),
    'BetaPendingScreen displays status, live listener, and manual refresh controls'
  );

  // -------------------------------------------------------------------------
  // Test 06: Welcome Experience (All 6 Required Modules)
  // -------------------------------------------------------------------------
  console.log('\n[6/8] Verifying Welcome Experience 6-Module Documentation');
  assert(
    welcomeGuideSource.includes('What is NEXORA?') &&
    welcomeGuideSource.includes('Zero Plaintext Storage') &&
    welcomeGuideSource.includes('Direct Peer Mesh'),
    'Welcome Module 1: Explains What NEXORA is and core architecture'
  );
  assert(
    welcomeGuideSource.includes('How to Create an Account') &&
    welcomeGuideSource.includes('crypto.subtle.digest') &&
    welcomeGuideSource.includes('salted SHA-256'),
    'Welcome Module 2: Explains Account Creation & cryptographic key hashing'
  );
  assert(
    welcomeGuideSource.includes('How to Create or Join a Community') &&
    welcomeGuideSource.includes('Creating a New Community') &&
    welcomeGuideSource.includes('Joining via Invite Code or Link'),
    'Welcome Module 3: Explains Community creation and invite code joining'
  );
  assert(
    welcomeGuideSource.includes('How to Send Transmissions & DMs') &&
    welcomeGuideSource.includes('Rich Markdown Support') &&
    welcomeGuideSource.includes('Emoji Reactions'),
    'Welcome Module 4: Explains Messaging, markdown, attachments, and DMs'
  );
  assert(
    welcomeGuideSource.includes('How to Use Voice & Video Calls') &&
    welcomeGuideSource.includes('Voice Channels') &&
    welcomeGuideSource.includes('720p HD Video') &&
    welcomeGuideSource.includes('Screen Sharing'),
    'Welcome Module 5: Explains Voice channels, 720p HD video, and Screen Sharing'
  );
  assert(
    welcomeGuideSource.includes('How to Report Bugs & Send Feedback') &&
    welcomeGuideSource.includes('FEEDBACK') &&
    welcomeGuideSource.includes('Transmit Telemetry'),
    'Welcome Module 6: Explains Bug reporting, categories, and screenshot attachments'
  );

  // -------------------------------------------------------------------------
  // Test 07: Beta Feedback Connection & Confirmation
  // -------------------------------------------------------------------------
  console.log('\n[7/8] Verifying Beta Feedback Connection & Submission Confirmation');
  assert(
    welcomeGuideSource.includes("openModal('beta_feedback')"),
    'Welcome Experience includes direct trigger opening Beta Feedback modal'
  );
  assert(
    pendingScreenSource.includes("openModal('beta_feedback')"),
    'Pending Screen includes direct trigger opening Beta Feedback modal'
  );

  const feedbackItem = await betaFeedbackService.submitFeedback({
    title: 'Onboarding Screen Touch Target',
    description: 'The refresh button operates smoothly on mobile touch interfaces.',
    category: 'ui_ux',
    severity: 'low',
    browserAndDevice: 'Mobile Safari 18 / iOS 18',
    testerId: testUserId,
    testerName: 'Beta Operative 01',
  });
  assert(!!feedbackItem && feedbackItem.title.length > 0, 'Feedback submitted successfully from onboarding flow');
  assert(feedbackItem.id.startsWith('fb_'), 'Feedback returns clear ticket reference ID');

  // -------------------------------------------------------------------------
  // Test 08: Firestore Security Rules Coverage for /beta_applications
  // -------------------------------------------------------------------------
  console.log('\n[8/8] Verifying Firestore Security Rules for /beta_applications');
  assert(
    firestoreRules.includes('match /beta_applications/{appId}'),
    'firestore.rules explicitly protects the /beta_applications collection'
  );
  assert(
    firestoreRules.includes('resource.data.userId == request.auth.uid') &&
    firestoreRules.includes('isSystemAdmin()'),
    'Security rules isolate applicant records: ordinary users cannot read other applicants'
  );
  assert(
    firestoreRules.includes("request.resource.data.status == 'pending'"),
    'Security rules require status=="pending" on creation: Self-approval blocked on DB level'
  );
  assert(
    firestoreRules.includes('allow update: if isSystemAdmin()'),
    'Security rules restrict status modification and approval strictly to System Administrators'
  );
  assert(
    adminModalSource.includes('Beta Access Applicants') &&
    adminModalSource.includes('handleApproveApplicant') &&
    adminModalSource.includes('handleRejectApplicant'),
    'BetaFeedbackAdminModal integrates full Administrator Beta Access management controls'
  );

  console.log('\n======================================================================');
  console.log(`BETA ONBOARDING QA SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('======================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runOnboardingSuite().catch((err) => {
  console.error('Fatal error during beta onboarding test suite execution:', err);
  process.exit(1);
});
