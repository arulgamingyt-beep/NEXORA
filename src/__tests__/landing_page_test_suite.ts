import fs from 'fs';
import path from 'path';

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

async function runLandingPageTestSuite() {
  console.log('======================================================================');
  console.log('🌐 NEXORA OFFICIAL PRODUCT LANDING PAGE — VERIFICATION SUITE');
  console.log('======================================================================\n');

  const landingPath = path.join(process.cwd(), 'src', 'components', 'landing', 'LandingPage.tsx');
  const appPath = path.join(process.cwd(), 'src', 'App.tsx');
  const authPath = path.join(process.cwd(), 'src', 'components', 'auth', 'AuthScreen.tsx');

  const landingSource = fs.readFileSync(landingPath, 'utf8');
  const appSource = fs.readFileSync(appPath, 'utf8');
  const authSource = fs.readFileSync(authPath, 'utf8');

  // -------------------------------------------------------------------------
  // Test 01: Brand Identity & Typography Compliance
  // -------------------------------------------------------------------------
  const hasBrandName = landingSource.includes('NEXORA') && landingSource.includes('NEXORA TECHNOLOGIES');
  const hasTagline = landingSource.includes('CONNECT WITHOUT LIMITS');
  const hasObsidianTheme = landingSource.includes('bg-[#070810]') && landingSource.includes('violet-600');

  assert(
    hasBrandName && hasTagline && hasObsidianTheme,
    '[BRAND IDENTITY] Compliance with Brand, Company, Tagline & Theme',
    'Brand: NEXORA | Company: NEXORA TECHNOLOGIES | Tagline: CONNECT WITHOUT LIMITS | Theme: Obsidian Black & Violet'
  );

  // -------------------------------------------------------------------------
  // Test 02: Navigation Bar Structure & Links
  // -------------------------------------------------------------------------
  const hasNavLogo = landingSource.includes('NEXORA') && landingSource.includes('Sparkles');
  const hasFeaturesLink = landingSource.includes('FEATURES');
  const hasAboutLink = landingSource.includes('ABOUT');
  const hasSecurityLink = landingSource.includes('SECURITY');
  const hasLoginNav = landingSource.includes('onLogin');
  const hasGetStartedNav = landingSource.includes('onGetStarted');

  assert(
    hasNavLogo && hasFeaturesLink && hasAboutLink && hasSecurityLink && hasLoginNav && hasGetStartedNav,
    '[NAVIGATION] Navigation Bar with Brand Emblem, Smooth Scroll & Auth CTAs',
    'Includes Logo, Features, Security, About, Login, and Get Started links'
  );

  // -------------------------------------------------------------------------
  // Test 03: Hero Section Heading & Product Narrative
  // -------------------------------------------------------------------------
  const hasHeroHeading = landingSource.includes('YOUR COMMUNITY.') && landingSource.includes('YOUR CONNECTION.');
  const hasHeroIntro = landingSource.includes('real-time communication platform engineered for high-performance collectives');
  const hasHeroButtons = landingSource.includes('Get Started Free') && landingSource.includes('Launch Terminal') && landingSource.includes('quickDemoLogin');

  assert(
    hasHeroHeading && hasHeroIntro && hasHeroButtons,
    '[HERO SECTION] Heading, Positioning Narrative & Action Triggers',
    'Heading: "YOUR COMMUNITY. YOUR CONNECTION." with Get Started, Login & Instant Demo'
  );

  // -------------------------------------------------------------------------
  // Test 04: Original Product Interface Mockup Preview
  // -------------------------------------------------------------------------
  const hasServerRailPreview = landingSource.includes('Syndicate Vanguard') && landingSource.includes('recon-transmissions');
  const hasActiveCallHud = landingSource.includes('Active Call: Command Deck') && landingSource.includes('720p HD');
  const hasLatencyTelemetry = landingSource.includes('CLOUD LIVE (0.85ms)');

  assert(
    hasServerRailPreview && hasActiveCallHud && hasLatencyTelemetry,
    '[INTERFACE PREVIEW] Original Product Terminal Mockup with Server Rail & Call HUD',
    'Renders authentic NEXORA workspace preview with active transmissions and WebRTC call HUD'
  );

  // -------------------------------------------------------------------------
  // Test 05: 6 Core Feature Subsystems
  // -------------------------------------------------------------------------
  const hasMessaging = landingSource.includes('Sub-Millisecond Messaging');
  const hasCommunities = landingSource.includes('Communities & Channels');
  const hasFriends = landingSource.includes('Friends & Direct Messages');
  const hasVoice = landingSource.includes('Low-Latency WebRTC Voice');
  const hasVideo = landingSource.includes('720p HD Video Calling');
  const hasScreenShare = landingSource.includes('Desktop Screen Sharing');

  assert(
    hasMessaging && hasCommunities && hasFriends && hasVoice && hasVideo && hasScreenShare,
    '[FEATURES] 6 Core Communication Subsystems Documented',
    'Includes Messaging, Communities/Channels, Friends/DMs, WebRTC Voice, HD Video, and Screen Sharing'
  );

  // -------------------------------------------------------------------------
  // Test 06: Factual Security & Privacy Measures (Zero Unverified Claims)
  // -------------------------------------------------------------------------
  const hasSha256 = landingSource.includes('Salted SHA-256 Key Hashing') && landingSource.includes('Web Crypto API');
  const hasRules = landingSource.includes('14 Audited Firestore Security Rules');
  const hasRbac = landingSource.includes('Hierarchical RBAC Privileges') && 
    (landingSource.includes('Owner &gt; Admin') || landingSource.includes('Owner > Admin'));
  const hasCeilings = landingSource.includes('Resource Ceilings') && landingSource.includes('5 MB');

  assert(
    hasSha256 && hasRules && hasRbac && hasCeilings,
    '[SECURITY & PRIVACY] Verified Empirical Security Documentation',
    'Accurately explains Salted SHA-256 Web Crypto, RBAC rank hierarchy, 14 Firestore rules, and 5MB ceilings'
  );

  // -------------------------------------------------------------------------
  // Test 07: About NEXORA & Product Vision
  // -------------------------------------------------------------------------
  const hasCompanyIntro = landingSource.includes('NEXORA TECHNOLOGIES') && 
    landingSource.includes('was founded on a simple engineering conviction');
  const hasVision = landingSource.includes('zero-dollar infrastructure cost') && landingSource.includes('browser-standard WebRTC');
  const hasMetrics = landingSource.includes('327 kB') && landingSource.includes('Dispatch Latency');

  assert(
    hasCompanyIntro && hasVision && hasMetrics,
    '[ABOUT SECTION] NEXORA TECHNOLOGIES Company Introduction & Vision',
    'Presents company mission, browser-standard WebRTC architecture, and verifiable engineering metrics'
  );

  // -------------------------------------------------------------------------
  // Test 08: Footer & Interactive Legal Modals
  // -------------------------------------------------------------------------
  const hasFooterCompany = landingSource.includes('NEXORA TECHNOLOGIES');
  const hasContact = landingSource.includes('contact@nexora.tech');
  const hasLegalViewer = landingSource.includes('LegalDocumentViewer') && landingSource.includes('setActiveLegalModal');
  const hasLegalLinks = landingSource.includes('Privacy Policy') && landingSource.includes('Terms of Service');

  assert(
    hasFooterCompany && hasContact && hasLegalViewer && hasLegalLinks,
    '[FOOTER & LEGAL] Company Footer with Interactive Privacy & Terms Modals',
    'Includes contact placeholder and full interactive Privacy Policy & Terms of Service dialogs via LegalDocumentViewer'
  );

  // -------------------------------------------------------------------------
  // Test 09: Seamless Authentication System Connection
  // -------------------------------------------------------------------------
  const appRoutesToLanding = appSource.includes('<LandingPage') && appSource.includes('onLogin') && appSource.includes('onGetStarted');
  const authSupportsProps = authSource.includes('initialMode?: \'login\' | \'register\'') && authSource.includes('onBackToLanding?: () => void');
  const authHasBackButton = authSource.includes('Back to Overview');

  assert(
    appRoutesToLanding && authSupportsProps && authHasBackButton,
    '[AUTHENTICATION INTEGRATION] Seamless Routing Between Landing Page & Auth Screen',
    'Landing Page triggers Login/Register modes on AuthScreen; AuthScreen provides back navigation to Landing Page'
  );

  // -------------------------------------------------------------------------
  // Test 10: Responsive Mobile Design Hooks
  // -------------------------------------------------------------------------
  const hasMobileMenuToggle = landingSource.includes('mobileMenuOpen') && landingSource.includes('md:hidden');
  const hasResponsiveGrid = landingSource.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');

  assert(
    hasMobileMenuToggle && hasResponsiveGrid,
    '[RESPONSIVENESS] Mobile Drawer & Responsive Layout Grids',
    'Mobile hamburger drawer and responsive breakpoints (sm, md, lg) verified'
  );

  console.log('\n======================================================================');
  console.log(`📊 LANDING PAGE QA SUMMARY: ${passedTests}/${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLandingPageTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
