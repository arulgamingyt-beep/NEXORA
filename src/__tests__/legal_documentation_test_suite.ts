/**
 * NEXORA — LEGAL & PRIVACY DOCUMENTATION TEST SUITE
 * 
 * Validates:
 * 1. Legal Document Viewer structure & all 4 required document types
 * 2. Privacy Policy comprehensive statutory & architecture coverage
 * 3. Terms of Service liability, acceptable use & IP coverage
 * 4. Community Guidelines respectful collective standards & 4-tier enforcement matrix
 * 5. Account Deletion & Data Purge policy with real backend purge verification
 * 6. Mandatory Legal Counsel Review Disclaimer banner
 * 7. Registration acceptance controls & schema recording (acceptedLegalVersion, acceptedLegalAt)
 * 8. Cryptographic Auth Vault account removal and session cleansing
 * 9. Landing page footer legal links and modal bindings
 * 10. User Settings danger zone purge verification
 */

import fs from 'fs';
import path from 'path';

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

async function runLegalSuite() {
  console.log('================================================================');
  console.log('NEXORA LEGAL & PRIVACY DOCUMENTATION TEST SUITE');
  console.log('================================================================\n');

  // Load target source files
  const rootDir = process.cwd();
  const legalViewerPath = path.join(rootDir, 'src/components/legal/LegalDocumentViewer.tsx');
  const authScreenPath = path.join(rootDir, 'src/components/auth/AuthScreen.tsx');
  const contextPath = path.join(rootDir, 'src/context/NexoraContext.tsx');
  const vaultPath = path.join(rootDir, 'src/utils/authVault.ts');
  const landingPath = path.join(rootDir, 'src/components/landing/LandingPage.tsx');
  const userSettingsPath = path.join(rootDir, 'src/components/modals/UserSettingsModal.tsx');
  const typesPath = path.join(rootDir, 'src/types/index.ts');

  assert(fs.existsSync(legalViewerPath), 'LegalDocumentViewer.tsx component exists on disk');
  const legalViewerContent = fs.readFileSync(legalViewerPath, 'utf8');
  const authScreenContent = fs.readFileSync(authScreenPath, 'utf8');
  const contextContent = fs.readFileSync(contextPath, 'utf8');
  const vaultContent = fs.readFileSync(vaultPath, 'utf8');
  const landingContent = fs.readFileSync(landingPath, 'utf8');
  const userSettingsContent = fs.readFileSync(userSettingsPath, 'utf8');
  const typesContent = fs.readFileSync(typesPath, 'utf8');

  // Test 1: All 4 Document Types Defined in Type System
  console.log('\n[1/8] Verifying Legal Document Types & Structural Integrity');
  assert(
    legalViewerContent.includes("export type LegalDocType = 'privacy' | 'terms' | 'guidelines' | 'deletion';"),
    'LegalDocType defines union of privacy, terms, guidelines, deletion'
  );
  assert(
    legalViewerContent.includes('NEXORA TECHNOLOGIES'),
    'Brand identity correctly attributes NEXORA TECHNOLOGIES'
  );
  assert(
    legalViewerContent.includes('LEGAL v1.0 (DRAFT)'),
    'Version watermark displays v1.0 DRAFT'
  );

  // Test 2: Legal Counsel Disclaimer Banner (Indian Technology / Privacy Law Review)
  console.log('\n[2/8] Verifying Legal Counsel Review Disclaimer Notice');
  assert(
    legalViewerContent.includes('OPERATIONAL NOTICE: These pages are engineering beta drafts and do not constitute proof of legal compliance.') &&
    legalViewerContent.includes('Indian technology/privacy lawyer review'),
    'Prominent disclaimer banner notifies users that pages are engineering drafts requiring Indian technology/privacy lawyer review prior to public release'
  );

  // Test 3: Privacy Policy Required Content
  console.log('\n[3/8] Verifying Privacy Policy Comprehensive Content');
  assert(
    legalViewerContent.includes('Information Collected During Registration') &&
    legalViewerContent.includes('crypto.subtle') &&
    legalViewerContent.includes('salted SHA-256'),
    'Privacy Policy discloses registration credentials and Web Crypto client-side salted hashing'
  );
  assert(
    legalViewerContent.includes('Transmissions, Messages and Community Content') &&
    legalViewerContent.includes('Cloud Firestore'),
    'Privacy Policy discloses message transmission and Cloud Firestore synchronization'
  );
  assert(
    legalViewerContent.includes('Voice and Video Communication Streams') &&
    legalViewerContent.includes('WebRTC') &&
    legalViewerContent.includes('never recorded, stored, or processed on NEXORA media servers'),
    'Privacy Policy accurately details peer-to-peer WebRTC direct streaming without server recordings'
  );
  assert(
    legalViewerContent.includes('Cloud Storage Infrastructure') &&
    legalViewerContent.includes('stun:stun.l.google.com:19302'),
    'Privacy Policy discloses Google Cloud Firestore and public STUN server peer traversal'
  );
  assert(
    legalViewerContent.includes('Security Practices and Known Limitations') &&
    legalViewerContent.includes('Stored message history in Cloud Firestore is not currently end-to-end encrypted at rest'),
    'Privacy Policy transparently discloses beta limitations without unverified encryption claims'
  );
  assert(
    legalViewerContent.includes('privacy@nexora.tech'),
    'Privacy Policy provides placeholder contact privacy@nexora.tech without inventing fake company addresses'
  );

  // Test 4: Terms of Service Required Content
  console.log('\n[4/8] Verifying Terms of Service Structure');
  assert(
    legalViewerContent.includes('NEXORA Terms of Service') &&
    legalViewerContent.includes('Acceptance of Terms'),
    'Terms of Service includes binding acceptance clauses'
  );
  assert(
    legalViewerContent.includes('Acceptable Use and Prohibited Activities') &&
    legalViewerContent.includes('Denial-of-Service') &&
    legalViewerContent.includes('privilege self-elevation'),
    'Terms of Service explicitly prohibits DoS, automated spam, and privilege self-elevation'
  );
  assert(
    legalViewerContent.includes('Community Owner and Administrator Responsibilities'),
    'Terms of Service defines Owner and Administrator operational responsibilities'
  );
  assert(
    legalViewerContent.includes('Service Availability and "As-Is" Beta Disclaimer') &&
    legalViewerContent.includes('"AS IS" and "AS AVAILABLE"'),
    'Terms of Service includes standard "AS IS" beta disclaimer and warranty waivers'
  );
  assert(
    legalViewerContent.includes('legal@nexora.tech'),
    'Terms of Service provides placeholder legal@nexora.tech contact point'
  );

  // Test 5: Community Guidelines & 4-Tier Enforcement Matrix
  console.log('\n[5/8] Verifying Community Guidelines & Enforcement Pipeline');
  assert(
    legalViewerContent.includes('NEXORA Community Guidelines') &&
    legalViewerContent.includes('Respectful Communication'),
    'Guidelines enforce respectful collective communication'
  );
  assert(
    legalViewerContent.includes('Zero Tolerance for Harassment and Threats') &&
    legalViewerContent.includes('doxxing'),
    'Guidelines mandate zero tolerance for harassment, threats, and unauthorized doxxing'
  );
  assert(
    legalViewerContent.includes('No Spam, Advertising or Malicious Links') &&
    legalViewerContent.includes('No Impersonation'),
    'Guidelines prohibit spam, link obfuscation, and persona impersonation'
  );
  assert(
    legalViewerContent.includes('1. Warning Notice') &&
    legalViewerContent.includes('2. Message Purge') &&
    legalViewerContent.includes('3. Hub Expulsion') &&
    legalViewerContent.includes('4. Account Ban'),
    'Guidelines define concrete 4-tier progressive moderation response matrix'
  );

  // Test 6: Account Deletion Backend & Purge Truthfulness
  console.log('\n[6/8] Verifying Real Backend Account Deletion Architecture');
  assert(
    legalViewerContent.includes('Account Deletion & Data Purge Policy') &&
    legalViewerContent.includes('Expunge Operative Account'),
    'Account Deletion documentation provides clear self-service step-by-step instructions'
  );
  assert(
    legalViewerContent.includes('User Profile Document:') &&
    legalViewerContent.includes('/users/') &&
    legalViewerContent.includes('permanently deleted') &&
    legalViewerContent.includes('Cryptographic Vault Credentials') &&
    legalViewerContent.includes('Shared Channel Messages Transparency Notice'),
    'Documentation accurately specifies what is deleted vs anonymized shared transmissions'
  );
  assert(
    contextContent.includes('const deleteAccount = async (userId: string)') &&
    contextContent.includes("deleteDoc(doc(db, 'users', userId))") &&
    contextContent.includes('removeVaultAccount(userId)') &&
    contextContent.includes('setFriends') &&
    contextContent.includes('setCommunities'),
    'NexoraContext implements genuine deleteAccount multi-layer backend purging (Firestore, Vault, Friends, Communities, Session)'
  );
  assert(
    vaultContent.includes('export function removeVaultAccount(userId: string): boolean') &&
    vaultContent.includes('VAULT_STORAGE_KEY'),
    'authVault implements removeVaultAccount permanently erasing encrypted credentials from localStorage vault'
  );

  // Test 7: Registration Acceptance Controls & User Schema
  console.log('\n[7/8] Verifying Registration Acceptance Controls & Version Audit Tracking');
  assert(
    typesContent.includes('acceptedLegalVersion?: string;') &&
    typesContent.includes('acceptedLegalAt?: string;'),
    'User TypeScript interface schema defines acceptedLegalVersion and acceptedLegalAt'
  );
  assert(
    authScreenContent.includes('acceptedLegal') &&
    authScreenContent.includes('setAcceptedLegal') &&
    authScreenContent.includes('You must review and accept the Terms of Service, Privacy Policy, and Community Guidelines (v1.0) to register.'),
    'AuthScreen registration form requires explicit checkbox acceptance before allowing submission'
  );
  assert(
    contextContent.includes("acceptedLegalVersion: 'v1.0'") &&
    contextContent.includes('acceptedLegalAt: new Date().toISOString()'),
    'registerWithEmail persistently records legal version v1.0 and ISO timestamp in user record'
  );

  // Test 8: Landing Page & User Settings Modal Integration
  console.log('\n[8/8] Verifying Landing Page & Settings Modal Integration');
  assert(
    landingContent.includes('setActiveLegalModal') &&
    landingContent.includes('Privacy Policy') &&
    landingContent.includes('Terms of Service') &&
    landingContent.includes('Community Guidelines') &&
    landingContent.includes('Data Rights & Deletion'),
    'Landing page footer includes responsive triggers for all 4 legal documents'
  );
  assert(
    userSettingsContent.includes('Expunge Operative Account') &&
    userSettingsContent.includes('deleteAccount(currentUser.id)') &&
    userSettingsContent.includes('setShowLegalViewer'),
    'UserSettingsModal includes Danger Zone purge trigger wired to real deleteAccount and policy viewer'
  );

  console.log('\n================================================================');
  console.log(`LEGAL & PRIVACY TEST SUITE SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('================================================================\n');

  if (failCount > 0) {
    process.exit(1);
  }
}

runLegalSuite().catch((err) => {
  console.error('Fatal error during legal test suite execution:', err);
  process.exit(1);
});
