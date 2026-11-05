import {
  betaFeedbackService,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  VALID_STATUSES,
  MAX_SCREENSHOT_BYTES,
} from '../services/betaFeedbackService';
import {
  BetaFeedbackItem,
  BetaFeedbackCategory,
  BetaFeedbackSeverity,
  BetaFeedbackStatus,
} from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`🛡️ [PASS] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] Test ${String(totalTests).padStart(2, '0')}: ${testName}`);
    if (details) console.error(`   └─ Error: ${details}`);
  }
}

async function runBetaFeedbackTestSuite() {
  console.log('======================================================================');
  console.log('🧪 NEXORA PRIVATE BETA TESTING SYSTEM — AUTOMATED QA SUITE');
  console.log('======================================================================\n');

  betaFeedbackService.clearCache();

  const testerId1 = 'usr_tester_alpha_99';
  const testerName1 = 'Cipher Scout';
  const testerId2 = 'usr_tester_beta_88';
  const testerName2 = 'Echo Vanguard';
  const adminId = 'usr_admin_master_01';

  let createdItem1: BetaFeedbackItem | null = null;
  let createdItem2: BetaFeedbackItem | null = null;

  // -------------------------------------------------------------------------
  // Test 01: Valid Bug Report Submission
  // -------------------------------------------------------------------------
  try {
    createdItem1 = await betaFeedbackService.submitFeedback({
      title: 'WebRTC audio cuts out during rapid mute toggle',
      description: 'When tapping the mute button rapidly (5+ times in 2 seconds), the local audio track state does not restore properly and peers stop hearing audio until channel is rejoined.',
      category: 'voice_video',
      severity: 'high',
      browserAndDevice: 'Chrome 124 on Windows 11 Desktop (1920x1080)',
      testerId: testerId1,
      testerName: testerName1,
      testerTag: '#0042',
    });

    assert(
      !!createdItem1 &&
        createdItem1.id.startsWith('fb_') &&
        createdItem1.status === 'new' &&
        createdItem1.title === 'WebRTC audio cuts out during rapid mute toggle' &&
        createdItem1.severity === 'high' &&
        createdItem1.category === 'voice_video',
      '[SUBMISSION] Valid Bug Report Submission',
      `Feedback created with ID: ${createdItem1.id}, Status: ${createdItem1.status}`
    );
  } catch (err: any) {
    assert(false, '[SUBMISSION] Valid Bug Report Submission', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 02: Valid Submission with Screenshot Under 2MB Limit
  // -------------------------------------------------------------------------
  try {
    // Generate simulated Base64 image payload (~500 KB)
    const simulatedImageBase64 = 'data:image/png;base64,' + 'A'.repeat(500 * 1024);
    createdItem2 = await betaFeedbackService.submitFeedback({
      title: 'Glassmorphic modal border clipping on mobile Safari',
      description: 'Modal card corners overflow the viewport on iPhone 15 Pro portrait orientation when virtual keyboard opens.',
      category: 'ui_ux',
      severity: 'low',
      browserAndDevice: 'Mobile Safari on iOS 17.4 (393x852)',
      screenshot: simulatedImageBase64,
      testerId: testerId2,
      testerName: testerName2,
      testerTag: '#1337',
    });

    assert(
      !!createdItem2 &&
        !!createdItem2.screenshot &&
        createdItem2.status === 'new',
      '[SUBMISSION] Valid Submission with Attached Screenshot (< 2MB)',
      `Screenshot attached successfully (${Math.round((createdItem2.screenshot?.length || 0) / 1024)} KB)`
    );
  } catch (err: any) {
    assert(false, '[SUBMISSION] Valid Submission with Attached Screenshot (< 2MB)', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 03: Field Validation — Title Boundary Constraints (Min 3 / Max 100)
  // -------------------------------------------------------------------------
  try {
    const tooShort = betaFeedbackService.validateSubmission({
      title: 'Hi',
      description: 'Valid description text here for test.',
      category: 'messaging',
      severity: 'medium',
      browserAndDevice: 'Chrome on Win11',
    });

    const tooLong = betaFeedbackService.validateSubmission({
      title: 'X'.repeat(101),
      description: 'Valid description text here for test.',
      category: 'messaging',
      severity: 'medium',
      browserAndDevice: 'Chrome on Win11',
    });

    assert(
      Boolean(!tooShort.valid && tooShort.error?.includes('at least 3 characters') &&
      !tooLong.valid && tooLong.error?.includes('cannot exceed 100 characters')),
      '[VALIDATION] Title String Boundary Verification',
      'Both < 3 chars and > 100 chars titles strictly rejected'
    );
  } catch (err: any) {
    assert(false, '[VALIDATION] Title String Boundary Verification', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 04: Field Validation — Description Boundary Constraints (Min 10 / Max 2000)
  // -------------------------------------------------------------------------
  try {
    const descShort = betaFeedbackService.validateSubmission({
      title: 'Valid Title Here',
      description: 'Short',
      category: 'auth',
      severity: 'medium',
      browserAndDevice: 'Firefox on Linux',
    });

    const descLong = betaFeedbackService.validateSubmission({
      title: 'Valid Title Here',
      description: 'D'.repeat(2001),
      category: 'auth',
      severity: 'medium',
      browserAndDevice: 'Firefox on Linux',
    });

    assert(
      Boolean(!descShort.valid && descShort.error?.includes('at least 10 characters') &&
      !descLong.valid && descLong.error?.includes('cannot exceed 2000 characters')),
      '[VALIDATION] Description String Boundary Verification',
      'Descriptions < 10 chars and > 2000 chars strictly rejected'
    );
  } catch (err: any) {
    assert(false, '[VALIDATION] Description String Boundary Verification', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 05: Field Validation — Strict Category & Severity Whitelist
  // -------------------------------------------------------------------------
  try {
    const badCategory = betaFeedbackService.validateSubmission({
      title: 'Valid Title Here',
      description: 'Valid description text with enough characters.',
      category: 'malicious_injection' as any,
      severity: 'high',
      browserAndDevice: 'Chrome on Win11',
    });

    const badSeverity = betaFeedbackService.validateSubmission({
      title: 'Valid Title Here',
      description: 'Valid description text with enough characters.',
      category: 'performance',
      severity: 'catastrophic_emergency' as any,
      browserAndDevice: 'Chrome on Win11',
    });

    assert(
      Boolean(!badCategory.valid && badCategory.error?.includes('Invalid category') &&
      !badSeverity.valid && badSeverity.error?.includes('Invalid severity')),
      '[VALIDATION] Category & Severity Enum Whitelist Enforcement',
      'Unlisted categories and severities rejected'
    );
  } catch (err: any) {
    assert(false, '[VALIDATION] Category & Severity Enum Whitelist Enforcement', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 06: Resource Exhaustion Guard — 2MB Screenshot Ceiling
  // -------------------------------------------------------------------------
  try {
    // Generate simulated oversized Base64 image payload (~3.5 MB)
    const oversizedImage = 'data:image/png;base64,' + 'B'.repeat(3500 * 1024);
    const oversizedCheck = betaFeedbackService.validateSubmission({
      title: 'Crash report with massive dump',
      description: 'Valid description text with enough characters for test.',
      category: 'performance',
      severity: 'critical',
      browserAndDevice: 'Chrome on Win11',
      screenshot: oversizedImage,
    });

    assert(
      Boolean(!oversizedCheck.valid && oversizedCheck.error?.includes('exceeds maximum allowed limit of 2.00 MB')),
      '[RESOURCE GUARD] 2MB Screenshot Upload Ceiling Enforcement',
      `Oversized upload safely blocked: "${oversizedCheck.error}"`
    );
  } catch (err: any) {
    assert(false, '[RESOURCE GUARD] 2MB Screenshot Upload Ceiling Enforcement', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 07: Access Control — Ordinary Tester Cannot Access Admin Controls
  // -------------------------------------------------------------------------
  try {
    let unauthUpdateBlocked = false;
    try {
      await betaFeedbackService.updateFeedbackStatus(
        createdItem1!.id,
        'fixed',
        'Unauthorized fix attempt',
        false // isAdmin = false
      );
    } catch (err: any) {
      if (err.message.includes('UNAUTHORIZED: Administrator clearance is required')) {
        unauthUpdateBlocked = true;
      }
    }

    let unauthDeleteBlocked = false;
    try {
      await betaFeedbackService.deleteFeedback(createdItem1!.id, false); // isAdmin = false
    } catch (err: any) {
      if (err.message.includes('UNAUTHORIZED: Administrator clearance is required')) {
        unauthDeleteBlocked = true;
      }
    }

    assert(
      unauthUpdateBlocked && unauthDeleteBlocked,
      '[AUTHORIZATION] Non-Admin Operatives Prohibited From Admin Controls',
      'Ordinary testers blocked from modifying status, adding admin notes, or deleting reports'
    );
  } catch (err: any) {
    assert(false, '[AUTHORIZATION] Non-Admin Operatives Prohibited From Admin Controls', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 08: Data Privacy — Isolation of Feedback Feeds
  // -------------------------------------------------------------------------
  try {
    // Tester 1 queries their feedback
    const tester1List = await betaFeedbackService.getFeedbackList(testerId1, false);
    // Tester 2 queries their feedback
    const tester2List = await betaFeedbackService.getFeedbackList(testerId2, false);

    const tester1SeesOnlyOwn = tester1List.every((i) => i.testerId === testerId1);
    const tester2SeesOnlyOwn = tester2List.every((i) => i.testerId === testerId2);
    const tester1DoesNotSeeTester2 = !tester1List.some((i) => i.id === createdItem2!.id);

    assert(
      tester1SeesOnlyOwn && tester2SeesOnlyOwn && tester1DoesNotSeeTester2,
      '[PRIVACY] Feedback Isolation Between Non-Admin Testers',
      `Tester 1 sees ${tester1List.length} report(s); Tester 2 sees ${tester2List.length} report(s). Cross-tenant inspection blocked.`
    );
  } catch (err: any) {
    assert(false, '[PRIVACY] Feedback Isolation Between Non-Admin Testers', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 09: Admin Privilege — Admin Access to Full Dashboard & Lifecycle Progression
  // -------------------------------------------------------------------------
  try {
    // Admin queries all feedback
    const adminList = await betaFeedbackService.getFeedbackList(adminId, true);
    const adminSeesAll = adminList.length >= 2;

    // Admin transitions item1: new -> reviewing
    const reviewing = await betaFeedbackService.updateFeedbackStatus(
      createdItem1!.id,
      'reviewing',
      'Triaged by lead QA engineer',
      true
    );

    // Admin transitions item1: reviewing -> in_progress
    const inProgress = await betaFeedbackService.updateFeedbackStatus(
      createdItem1!.id,
      'in_progress',
      'Investigating WebRTC audio track enable race condition',
      true
    );

    // Admin transitions item1: in_progress -> fixed
    const fixed = await betaFeedbackService.updateFeedbackStatus(
      createdItem1!.id,
      'fixed',
      'Resolved in engine patch v1.4.1',
      true
    );

    // Admin transitions item1: fixed -> closed
    const closed = await betaFeedbackService.updateFeedbackStatus(
      createdItem1!.id,
      'closed',
      'Verified and closed',
      true
    );

    assert(
      adminSeesAll &&
        reviewing.status === 'reviewing' &&
        inProgress.status === 'in_progress' &&
        fixed.status === 'fixed' &&
        closed.status === 'closed' &&
        closed.adminNotes === 'Verified and closed',
      '[LIFECYCLE] Full Status Lifecycle Progression (New -> Reviewing -> In Progress -> Fixed -> Closed)',
      `Status transitions validated: ${VALID_STATUSES.join(' -> ')}`
    );
  } catch (err: any) {
    assert(false, '[LIFECYCLE] Full Status Lifecycle Progression', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 10: Admin Deletion of Resolved Feedback
  // -------------------------------------------------------------------------
  try {
    await betaFeedbackService.deleteFeedback(createdItem1!.id, true);
    const postDeleteList = await betaFeedbackService.getFeedbackList(adminId, true);
    const isDeleted = !postDeleteList.some((i) => i.id === createdItem1!.id);

    assert(
      isDeleted,
      '[MANAGEMENT] Administrator Permanent Deletion of Feedback Record',
      `Item ${createdItem1!.id} successfully expunged from telemetry cache`
    );
  } catch (err: any) {
    assert(false, '[MANAGEMENT] Administrator Permanent Deletion of Feedback Record', err?.message);
  }

  // -------------------------------------------------------------------------
  // Test 11: Firestore Security Rules Validation for Beta Feedback
  // -------------------------------------------------------------------------
  try {
    const fs = await import('fs');
    const rulesContent = fs.readFileSync('firestore.rules', 'utf8');

    const hasBetaCollection = rulesContent.includes('match /beta_feedback/{feedbackId}');
    const hasAdminHelper = rulesContent.includes('function isSystemAdmin()');
    const hasCreateSchema = rulesContent.includes("request.resource.data.status == 'new'") &&
      rulesContent.includes("request.resource.data.title.size() <= 100") &&
      rulesContent.includes("request.resource.data.description.size() <= 2000");
    const hasAdminOnlyUpdate = rulesContent.includes("allow update: if isSystemAdmin()");
    const hasAdminOnlyDelete = rulesContent.includes("allow delete: if isSystemAdmin()");

    assert(
      hasBetaCollection && hasAdminHelper && hasCreateSchema && hasAdminOnlyUpdate && hasAdminOnlyDelete,
      '[SECURITY RULES] Firestore Security Rules Coverage for /beta_feedback',
      'Schema constraints, status immutability on create, and admin-only updates/deletes encoded in rules'
    );
  } catch (err: any) {
    assert(false, '[SECURITY RULES] Firestore Security Rules Coverage for /beta_feedback', err?.message);
  }

  console.log('\n======================================================================');
  console.log(`📊 BETA FEEDBACK QA SUMMARY: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBetaFeedbackTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
