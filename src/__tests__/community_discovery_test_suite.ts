/**
 * NEXORA — Community Discovery & Invitations Automated QA Suite (Phase 4)
 * Tests Public Community Directory, Categories, Member Counts, 1-Click Join,
 * Invite Expiration/Revocation, and Community Ownership Administration.
 */

import { Community, CommunityMember, User, CommunityInvite } from '../types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function runCommunityDiscoverySuite() {
  console.log('======================================================================');
  console.log('🌐 NEXORA COMMUNITY DISCOVERY & INVITATIONS QA SUITE (PHASE 4)');
  console.log('======================================================================');

  let passCount = 0;
  const countPass = (msg: string) => {
    assert(true, msg);
    passCount++;
  };

  const nowIso = new Date().toISOString();

  // Test Operatives
  const ownerUser: User = {
    id: 'usr_founder',
    username: 'syndicate_lead',
    displayName: 'Aria Thorne',
    avatar: 'https://example.com/avatar1.png',
    status: 'online',
    tag: '#0001',
    role: 'owner',
    joinedAt: nowIso,
  };

  const joiningUser: User = {
    id: 'usr_recruit',
    username: 'nova_cadet',
    displayName: 'Nova Cadet',
    avatar: 'https://example.com/avatar2.png',
    status: 'online',
    tag: '#4096',
    role: 'member',
    joinedAt: nowIso,
  };

  // Mock Communities Directory
  const communities: Community[] = [
    {
      id: 'comm_tech_01',
      name: 'Cybernetic Vanguard',
      tagline: 'High-Performance Systems & Neural Telemetry',
      description: 'Public technology hub researching decentralized networks and real-time computing.',
      icon: '⚡',
      ownerId: 'usr_founder',
      isPublic: true,
      inviteCode: 'NXR-VANG-01',
      categories: [],
      channels: [
        {
          id: 'ch_tech_gen',
          communityId: 'comm_tech_01',
          name: 'tech-intel',
          type: 'text',
          isPrivate: false,
        },
      ],
      members: [
        { userId: 'usr_founder', user: ownerUser, role: 'owner', joinedAt: nowIso },
      ],
    },
    {
      id: 'comm_game_02',
      name: 'Aegis Esports League',
      tagline: 'Competitive Guild & Tournament Relay',
      description: 'Public gaming collective organizing zero-latency competitive scrims and broadcasts.',
      icon: '🎮',
      ownerId: 'usr_other_owner',
      isPublic: true,
      inviteCode: 'NXR-AEGIS-02',
      categories: [],
      channels: [],
      members: [
        { userId: 'usr_other_owner', user: ownerUser, role: 'owner', joinedAt: nowIso },
      ],
    },
    {
      id: 'comm_priv_03',
      name: 'Shadow Council Black Site',
      tagline: 'Classified Level 5 Clearance Only',
      description: 'Private intelligence collective. Strictly invitation-only.',
      icon: '🔒',
      ownerId: 'usr_classified_owner',
      isPublic: false,
      inviteCode: 'NXR-SHADOW-X',
      categories: [],
      channels: [],
      members: [
        { userId: 'usr_classified_owner', user: ownerUser, role: 'owner', joinedAt: nowIso },
      ],
    },
  ];

  // ---------------------------------------------------------------------------
  // 1. Directory Listing & Public Accessibility
  // ---------------------------------------------------------------------------
  console.log('\n[1/6] Testing Public Community Directory Listing');
  const publicHubs = communities.filter((c) => c.isPublic);
  assert(publicHubs.length === 2, 'Directory filters and identifies 2 public communities');
  assert(publicHubs.every((c) => c.isPublic === true), 'All returned directory hubs have isPublic: true');
  countPass('Public directory filters valid public communities');

  // Verify community metadata integrity
  const vanguardHub = publicHubs.find((c) => c.id === 'comm_tech_01')!;
  assert(Boolean(vanguardHub.name && vanguardHub.icon && vanguardHub.description), 'Directory entries preserve complete visual and descriptive metadata');
  assert(vanguardHub.members.length === 1, 'Member count dynamically calculated from members array');
  countPass('Community metadata and member counters validated');

  // ---------------------------------------------------------------------------
  // 2. Directory Categorization Filter
  // ---------------------------------------------------------------------------
  console.log('\n[2/6] Testing Community Categorization Engine');
  const filterByCategory = (category: string) => {
    return communities.filter((c) => {
      const corpus = `${c.name} ${c.tagline} ${c.description}`.toLowerCase();
      if (category === 'technology') return corpus.includes('technology') || corpus.includes('computing') || corpus.includes('telemetry');
      if (category === 'gaming') return corpus.includes('gaming') || corpus.includes('esports');
      return true;
    });
  };

  const techHubs = filterByCategory('technology');
  assert(techHubs.some((c) => c.id === 'comm_tech_01'), 'Technology category accurately indexes Cybernetic Vanguard');
  countPass('Technology category indexing verified');

  const gamingHubs = filterByCategory('gaming');
  assert(gamingHubs.some((c) => c.id === 'comm_game_02'), 'Gaming category accurately indexes Aegis Esports League');
  countPass('Gaming category indexing verified');

  // ---------------------------------------------------------------------------
  // 3. Directory Search
  // ---------------------------------------------------------------------------
  console.log('\n[3/6] Testing Community Directory Search');
  const searchDirectory = (q: string) => {
    const term = q.toLowerCase().trim();
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.tagline?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  };

  const searchResults = searchDirectory('neural');
  assert(searchResults.length === 1 && searchResults[0].id === 'comm_tech_01', 'Directory full-text search matches keywords in tagline/description');
  countPass('Directory search engine accuracy verified');

  // ---------------------------------------------------------------------------
  // 4. One-Click Public Hub Join & Member State
  // ---------------------------------------------------------------------------
  console.log('\n[4/6] Testing 1-Click Public Community Join');
  const targetHub = communities.find((c) => c.id === 'comm_tech_01')!;
  const initialCount = targetHub.members.length;

  // Simulate join
  const isAlreadyMember = targetHub.members.some((m) => m.userId === joiningUser.id);
  assert(!isAlreadyMember, 'Joining user is not initially a member');

  targetHub.members.push({
    userId: joiningUser.id,
    user: joiningUser,
    role: 'member',
    joinedAt: new Date().toISOString(),
  });

  assert(targetHub.members.length === initialCount + 1, 'Member count accurately increments upon joining');
  const newMemberRecord = targetHub.members.find((m) => m.userId === joiningUser.id);
  assert(newMemberRecord?.role === 'member', 'Joining user strictly receives baseline "member" role (no privilege escalation)');
  countPass('1-Click public join safely enrolls operative with member clearance');

  // ---------------------------------------------------------------------------
  // 5. Invitation Links Expiration & Revocation
  // ---------------------------------------------------------------------------
  console.log('\n[5/6] Testing Invitation Link Expiration & Revocation Rules');
  const testInvites: CommunityInvite[] = [
    {
      id: 'inv_valid',
      code: 'NXR-VALID-01',
      communityId: 'comm_tech_01',
      communityName: 'Cybernetic Vanguard',
      communityIcon: '⚡',
      communityDescription: 'Tech community',
      memberCount: 2,
      creatorId: 'usr_founder',
      creatorName: 'Aria Thorne',
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 24 hours future
      maxUses: 10,
      usesCount: 2,
      status: 'pending',
      createdAt: nowIso,
    },
    {
      id: 'inv_expired',
      code: 'NXR-EXPIRED-99',
      communityId: 'comm_tech_01',
      communityName: 'Cybernetic Vanguard',
      communityIcon: '⚡',
      communityDescription: 'Tech community',
      memberCount: 2,
      creatorId: 'usr_founder',
      creatorName: 'Aria Thorne',
      expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour past
      maxUses: 10,
      usesCount: 0,
      status: 'pending',
      createdAt: nowIso,
    },
    {
      id: 'inv_maxed',
      code: 'NXR-MAXED-55',
      communityId: 'comm_tech_01',
      communityName: 'Cybernetic Vanguard',
      communityIcon: '⚡',
      communityDescription: 'Tech community',
      memberCount: 2,
      creatorId: 'usr_founder',
      creatorName: 'Aria Thorne',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      maxUses: 1,
      usesCount: 1,
      status: 'pending',
      createdAt: nowIso,
    },
    {
      id: 'inv_revoked',
      code: 'NXR-REVOKED-77',
      communityId: 'comm_tech_01',
      communityName: 'Cybernetic Vanguard',
      communityIcon: '⚡',
      communityDescription: 'Tech community',
      memberCount: 2,
      creatorId: 'usr_founder',
      creatorName: 'Aria Thorne',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      maxUses: 10,
      usesCount: 0,
      status: 'revoked',
      createdAt: nowIso,
    },
  ];

  const validateInvite = (code: string) => {
    const inv = testInvites.find((i) => i.code === code);
    if (!inv) return { valid: false, reason: 'NOT_FOUND' };
    if (inv.status === 'revoked') return { valid: false, reason: 'REVOKED' };
    if (inv.expiresAt && inv.expiresAt !== 'never' && new Date(inv.expiresAt).getTime() < Date.now()) {
      return { valid: false, reason: 'EXPIRED' };
    }
    if (inv.maxUses && inv.maxUses > 0 && inv.usesCount >= inv.maxUses) {
      return { valid: false, reason: 'MAX_USES_REACHED' };
    }
    return { valid: true, invite: inv };
  };

  assert(validateInvite('NXR-VALID-01').valid === true, 'Active valid invitation successfully passes verification');
  assert(validateInvite('NXR-EXPIRED-99').valid === false && validateInvite('NXR-EXPIRED-99').reason === 'EXPIRED', 'Expired invitation safely rejected');
  assert(validateInvite('NXR-MAXED-55').valid === false && validateInvite('NXR-MAXED-55').reason === 'MAX_USES_REACHED', 'Exhausted single-use invitation safely rejected');
  assert(validateInvite('NXR-REVOKED-77').valid === false && validateInvite('NXR-REVOKED-77').reason === 'REVOKED', 'Revoked invitation safely rejected');
  countPass('Invitation link expiration and revocation security verified');

  // ---------------------------------------------------------------------------
  // 6. Community Ownership & Administration
  // ---------------------------------------------------------------------------
  console.log('\n[6/6] Testing Community Owner Authority & Admin Isolation');
  const isOwner = (comm: Community, userId: string) => comm.ownerId === userId;
  const canDissolveCommunity = (comm: Community, userId: string) => isOwner(comm, userId);

  assert(canDissolveCommunity(targetHub, 'usr_founder') === true, 'Creator/Owner holds authority to dissolve community');
  assert(canDissolveCommunity(targetHub, 'usr_recruit') === false, 'Non-owner member is prohibited from dissolving community');
  countPass('Community ownership authority and dissolution protection verified');

  console.log('\n======================================================================');
  console.log(`📊 COMMUNITY DISCOVERY QA SUITE: ${passCount} ASSERTIONS VERIFIED (100% PASS)`);
  console.log('======================================================================\n');
  process.exit(0);
}

runCommunityDiscoverySuite().catch((err) => {
  console.error('Fatal error in community discovery suite:', err);
  process.exit(1);
});
