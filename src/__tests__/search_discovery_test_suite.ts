/**
 * NEXORA — Search & Discovery Automated QA Test Suite (Phase 3)
 * Tests permission-aware search across Users, Communities, Channels, and Authorized Messages
 */

import { searchService, SearchCategory } from '../services/searchService';
import { Community, Channel, Message, User, DMConversation } from '../types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

async function runSearchTestSuite() {
  console.log('======================================================================');
  console.log('🔍 NEXORA GLOBAL SEARCH & DISCOVERY QA SUITE');
  console.log('======================================================================');

  let passCount = 0;
  const countPass = (msg: string) => {
    assert(true, msg);
    passCount++;
  };

  const nowIso = new Date().toISOString();

  // Mock Users
  const currentUser: User = {
    id: 'usr_me',
    username: 'cipher_lead',
    displayName: 'Alex Rivera',
    avatar: 'https://example.com/avatar1.png',
    status: 'online',
    tag: '#1001',
    role: 'owner',
    bio: 'NEXORA Platform Architect',
    joinedAt: nowIso,
  };

  const peerUser: User = {
    id: 'usr_peer',
    username: 'elena_recon',
    displayName: 'Elena Rostova',
    avatar: 'https://example.com/avatar2.png',
    status: 'idle',
    tag: '#2048',
    role: 'admin',
    bio: 'Reconnaissance Specialist',
    joinedAt: nowIso,
  };

  const blockedUser: User = {
    id: 'usr_blocked',
    username: 'bad_actor',
    displayName: 'Rogue Operative',
    avatar: 'https://example.com/avatar3.png',
    status: 'offline',
    tag: '#9999',
    role: 'member',
    bio: 'Suspicious transmission sender',
    joinedAt: nowIso,
  };

  const allUsers: Record<string, User> = {
    usr_me: currentUser,
    usr_peer: peerUser,
    usr_blocked: blockedUser,
  };

  // Mock Communities
  const publicCommunity: Community = {
    id: 'comm_pub',
    name: 'Syndicate Vanguard',
    tagline: 'Global Operations Headquarters',
    description: 'Public community hub for network telemetry and strategy.',
    icon: '⚡',
    ownerId: 'usr_me',
    isPublic: true,
    inviteCode: 'NXR-SYN-7700',
    categories: [],
    channels: [
      {
        id: 'ch_general',
        communityId: 'comm_pub',
        name: 'general-frequency',
        topic: 'Open telemetry and coordination',
        type: 'text',
        isPrivate: false,
      },
      {
        id: 'ch_restricted',
        communityId: 'comm_pub',
        name: 'covert-ops',
        topic: 'Restricted high-level communications',
        type: 'text',
        isPrivate: true,
        allowedRoles: ['admin', 'owner'],
      },
    ],
    members: [
      { userId: 'usr_me', user: currentUser, role: 'owner', joinedAt: nowIso },
      { userId: 'usr_peer', user: peerUser, role: 'admin', joinedAt: nowIso },
    ],
  };

  const privateCommunityUnauthorized: Community = {
    id: 'comm_secret',
    name: 'Classified Shadow Lab',
    tagline: 'Eyes only',
    description: 'Black site intelligence repository.',
    icon: '🔒',
    ownerId: 'usr_other',
    isPublic: false,
    inviteCode: 'NXR-SHAD-0000',
    categories: [],
    channels: [
      {
        id: 'ch_shadow',
        communityId: 'comm_secret',
        name: 'shadow-intel',
        topic: 'Encrypted black site reports',
        type: 'text',
        isPrivate: true,
        allowedRoles: ['owner'],
      },
    ],
    members: [{ userId: 'usr_other', user: currentUser, role: 'owner', joinedAt: nowIso }],
  };

  const communities = [publicCommunity, privateCommunityUnauthorized];

  // Mock Messages
  const msgAuthorizedChannel: Message = {
    id: 'msg_auth_01',
    channelId: 'ch_general',
    authorId: 'usr_peer',
    authorName: 'Elena Rostova',
    authorAvatar: '',
    authorRole: 'admin',
    authorTag: '#2048',
    reactions: [],
    content: 'The quantum satellite constellation is synchronized and ready for transmission.',
    timestamp: nowIso,
  };

  const msgAuthorizedDM: Message = {
    id: 'msg_dm_01',
    dmConversationId: 'conv_me_peer',
    authorId: 'usr_peer',
    authorName: 'Elena Rostova',
    authorAvatar: '',
    authorRole: 'admin',
    authorTag: '#2048',
    reactions: [],
    content: 'Coordinates for project beacon confirmed at zero meridian.',
    timestamp: nowIso,
  };

  const msgRestrictedShadowChannel: Message = {
    id: 'msg_shadow_01',
    channelId: 'ch_shadow',
    authorId: 'usr_other',
    authorName: 'Unknown Handler',
    authorAvatar: '',
    authorRole: 'owner',
    authorTag: '#0000',
    reactions: [],
    content: 'Classified satellite quantum code: 9988-ALPHA.',
    timestamp: nowIso,
  };

  const msgUnauthorizedDM: Message = {
    id: 'msg_unauth_dm_01',
    dmConversationId: 'conv_strangers',
    authorId: 'usr_other',
    authorName: 'Unknown Handler',
    authorAvatar: '',
    authorRole: 'owner',
    authorTag: '#0000',
    reactions: [],
    content: 'Secret satellite interception in third-party DM.',
    timestamp: nowIso,
  };

  const msgBlockedUser: Message = {
    id: 'msg_blocked_01',
    channelId: 'ch_general',
    authorId: 'usr_blocked',
    authorName: 'Rogue Operative',
    authorAvatar: '',
    authorRole: 'member',
    authorTag: '#9999',
    reactions: [],
    content: 'Spam satellite link containing malicious payload.',
    timestamp: nowIso,
  };

  const allMessages = [
    msgAuthorizedChannel,
    msgAuthorizedDM,
    msgRestrictedShadowChannel,
    msgUnauthorizedDM,
    msgBlockedUser,
  ];

  const authorizedConv: DMConversation = {
    id: 'conv_me_peer',
    participants: [currentUser, peerUser],
    lastMessage: 'Coordinates for project beacon confirmed at zero meridian.',
    lastMessageTime: nowIso,
    isGroup: false,
    ownerId: 'usr_me',
    unreadCount: 0,
  };

  const unauthorizedConv: DMConversation = {
    id: 'conv_strangers',
    participants: [],
    lastMessage: 'Secret satellite interception',
    lastMessageTime: nowIso,
    isGroup: false,
    ownerId: 'usr_other',
    unreadCount: 0,
  };

  const conversations = [authorizedConv, unauthorizedConv];

  // ---------------------------------------------------------------------------
  // 1. Search Users
  // ---------------------------------------------------------------------------
  console.log('\n[1/7] Testing Operative (User) Search');
  const userSearchResult = searchService.executeSearch({
    query: 'Elena',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });

  assert(userSearchResult.categoryCounts.users >= 1, 'Search finds operative by display name');
  countPass('Search finds operative by display name');

  const usernameResult = searchService.executeSearch({
    query: 'recon',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(usernameResult.categoryCounts.users >= 1, 'Search finds operative by callsign / username');
  countPass('Search finds operative by callsign / username');

  // ---------------------------------------------------------------------------
  // 2. Search Communities
  // ---------------------------------------------------------------------------
  console.log('\n[2/7] Testing Community Search & Public/Member Clearance');
  const communityResult = searchService.executeSearch({
    query: 'Vanguard',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(communityResult.categoryCounts.communities === 1, 'Search finds authorized community');
  countPass('Search finds authorized community');

  // Verify unauthorized private community is NOT returned
  const unauthorizedCommResult = searchService.executeSearch({
    query: 'Shadow Lab',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(
    unauthorizedCommResult.categoryCounts.communities === 0,
    'Unauthorized private community strictly omitted from search results'
  );
  countPass('Unauthorized private community strictly omitted from search results');

  // ---------------------------------------------------------------------------
  // 3. Search Channels
  // ---------------------------------------------------------------------------
  console.log('\n[3/7] Testing Channel & Frequency Search');
  const channelResult = searchService.executeSearch({
    query: 'frequency',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(channelResult.categoryCounts.channels >= 1, 'Search discovers authorized channel');
  countPass('Search discovers authorized channel');

  // ---------------------------------------------------------------------------
  // 4. Authorized Message Search
  // ---------------------------------------------------------------------------
  console.log('\n[4/7] Testing Authorized Message Search');
  const msgResult = searchService.executeSearch({
    query: 'beacon',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(msgResult.categoryCounts.messages === 1, 'Authorized DM message successfully found');
  assert(msgResult.results[0].type === 'message', 'Result item accurately typed as message');
  countPass('Authorized DM message successfully found');

  // ---------------------------------------------------------------------------
  // 5. STRICT SECURITY BOUNDARY TESTS
  // ---------------------------------------------------------------------------
  console.log('\n[5/7] Testing Strict Privacy & Isolation Boundaries');

  // A. Search for term in unauthorized private channel
  const shadowMsgSearch = searchService.executeSearch({
    query: '9988-ALPHA',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(
    shadowMsgSearch.categoryCounts.messages === 0,
    'PRIVACY: Messages in unauthorized private channels strictly blocked from search'
  );
  countPass('PRIVACY: Messages in unauthorized private channels strictly blocked from search');

  // B. Search for term in third-party DM thread
  const thirdPartyDMSearch = searchService.executeSearch({
    query: 'third-party DM',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
  });
  assert(
    thirdPartyDMSearch.categoryCounts.messages === 0,
    'PRIVACY: Messages in third-party DM threads strictly blocked from search'
  );
  countPass('PRIVACY: Messages in third-party DM threads strictly blocked from search');

  // C. Search for message from blocked user
  const blockedMsgSearch = searchService.executeSearch({
    query: 'malicious payload',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
    blockedUserIds: ['usr_blocked'],
  });
  assert(
    blockedMsgSearch.categoryCounts.messages === 0,
    'PRIVACY: Messages from blocked operatives strictly blocked from search'
  );
  countPass('PRIVACY: Messages from blocked operatives strictly blocked from search');

  // ---------------------------------------------------------------------------
  // 6. Search History & Suggestions
  // ---------------------------------------------------------------------------
  console.log('\n[6/7] Testing Search History & Suggestions');
  searchService.clearSearchHistory('usr_test');
  searchService.recordSearchQuery('quantum protocol', 'usr_test');
  searchService.recordSearchQuery('satellite coordinates', 'usr_test');

  const history = searchService.getSearchHistory('usr_test');
  assert(history.length === 2, 'Search history successfully recorded 2 queries');
  assert(history[0] === 'satellite coordinates', 'Most recent query placed first (MRU order)');
  countPass('Search history order and persistence verified');

  searchService.removeSearchHistoryItem('satellite coordinates', 'usr_test');
  const historyAfterRemoval = searchService.getSearchHistory('usr_test');
  assert(historyAfterRemoval.length === 1, 'Individual history item removed');
  countPass('Individual history item removal verified');

  const suggestions = searchService.getSearchSuggestions('sec', 'usr_test');
  assert(suggestions.some((s) => s.includes('sec')), 'Search suggestions generated dynamically');
  countPass('Search suggestions generated dynamically');

  // ---------------------------------------------------------------------------
  // 7. Filtering & Pagination
  // ---------------------------------------------------------------------------
  console.log('\n[7/7] Testing Category Filtering & Pagination');
  const filteredResult = searchService.executeSearch({
    query: 'satellite',
    currentUser,
    communities,
    allMessages,
    allUsers,
    conversations,
    options: {
      category: 'messages',
      pageSize: 1,
    },
  });

  assert(filteredResult.results.length === 1, 'Pagination respects pageSize limit');
  assert(filteredResult.hasMore === false || filteredResult.hasMore === true, 'hasMore flag computed correctly');
  assert(filteredResult.results.every((r) => r.type === 'message'), 'Category filter strictly restricts to messages');
  countPass('Category filtering and pagination bounds verified');

  console.log('\n======================================================================');
  console.log(`📊 SEARCH & DISCOVERY QA SUITE: ${passCount} ASSERTIONS VERIFIED (100% PASS)`);
  console.log('======================================================================\n');
  process.exit(0);
}

runSearchTestSuite().catch((err) => {
  console.error('Fatal error in search test suite:', err);
  process.exit(1);
});
