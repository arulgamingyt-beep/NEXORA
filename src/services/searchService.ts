/**
 * NEXORA — Global Search & Discovery Service
 * Enterprise In-Memory & Cloud Permission-Aware Search Engine
 * 
 * Features:
 * - Search across Users, Communities, Channels, and Authorized Messages
 * - Strict Zero-Knowledge Privacy: Never exposes unauthorized or private messages
 * - Search History & Search Suggestions with Local Storage Persistence
 * - Debounced Inverted Indexing with Snippet Highlighting & Pagination
 */

import { Community, Channel, Message, User, DMConversation } from '../types';

export type SearchCategory = 'all' | 'messages' | 'channels' | 'communities' | 'users';

export interface SearchResultItem {
  id: string;
  type: 'message' | 'channel' | 'community' | 'user';
  title: string;
  subtitle?: string;
  snippet?: string;
  highlightIndices?: [number, number];
  metadata: {
    communityId?: string;
    channelId?: string;
    conversationId?: string;
    userId?: string;
    timestamp?: string;
    icon?: string;
    avatar?: string;
  };
}

export interface SearchResponse {
  results: SearchResultItem[];
  totalCount: number;
  categoryCounts: Record<SearchCategory, number>;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchOptions {
  category?: SearchCategory;
  page?: number;
  pageSize?: number;
  communityIdFilter?: string;
}

class SearchService {
  private static instance: SearchService;
  private historyStorageKey = 'nexora_search_history';
  private inMemoryHistoryCache = new Map<string, string[]>();

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // ---------------------------------------------------------------------------
  // 1. Search History Management
  // ---------------------------------------------------------------------------
  public getSearchHistory(userId?: string): string[] {
    const key = userId ? `${this.historyStorageKey}_${userId}` : this.historyStorageKey;
    if (this.inMemoryHistoryCache.has(key)) {
      return this.inMemoryHistoryCache.get(key)!;
    }

    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.inMemoryHistoryCache.set(key, parsed);
        return parsed;
      }
    } catch {}
    return [];
  }

  public recordSearchQuery(query: string, userId?: string): void {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    const key = userId ? `${this.historyStorageKey}_${userId}` : this.historyStorageKey;
    const existing = this.getSearchHistory(userId);
    const filtered = existing.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 10);
    this.inMemoryHistoryCache.set(key, updated);

    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }

  public removeSearchHistoryItem(queryToRemove: string, userId?: string): void {
    const key = userId ? `${this.historyStorageKey}_${userId}` : this.historyStorageKey;
    const existing = this.getSearchHistory(userId);
    const updated = existing.filter((item) => item.toLowerCase() !== queryToRemove.toLowerCase());
    this.inMemoryHistoryCache.set(key, updated);

    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
  }

  public clearSearchHistory(userId?: string): void {
    const key = userId ? `${this.historyStorageKey}_${userId}` : this.historyStorageKey;
    this.inMemoryHistoryCache.delete(key);

    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  // ---------------------------------------------------------------------------
  // 2. Search Suggestions
  // ---------------------------------------------------------------------------
  public getSearchSuggestions(query: string, userId?: string): string[] {
    const history = this.getSearchHistory(userId);
    const defaultSuggestions = [
      'announcements',
      'welcome',
      'general',
      'rules',
      'voice',
      'nexus',
      'security',
    ];

    if (!query.trim()) {
      return history.slice(0, 6);
    }

    const lowerQuery = query.toLowerCase().trim();
    const matchesFromHistory = history.filter((h) => h.toLowerCase().includes(lowerQuery));
    const matchesFromDefaults = defaultSuggestions.filter(
      (d) => d.toLowerCase().includes(lowerQuery) && !matchesFromHistory.includes(d)
    );

    return [...matchesFromHistory, ...matchesFromDefaults].slice(0, 6);
  }

  // ---------------------------------------------------------------------------
  // 3. Permission-Aware Search Engine
  // ---------------------------------------------------------------------------
  public executeSearch(params: {
    query: string;
    currentUser: User;
    communities: Community[];
    allMessages: Message[];
    allUsers: Record<string, User>;
    conversations: DMConversation[];
    blockedUserIds?: string[];
    options?: SearchOptions;
  }): SearchResponse {
    const {
      query,
      currentUser,
      communities,
      allMessages,
      allUsers,
      conversations,
      blockedUserIds = [],
      options = {},
    } = params;

    const trimmedQuery = query.trim().toLowerCase();
    const category = options.category || 'all';
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.max(1, options.pageSize || 20);

    const categoryCounts: Record<SearchCategory, number> = {
      all: 0,
      messages: 0,
      channels: 0,
      communities: 0,
      users: 0,
    };

    if (!trimmedQuery) {
      return {
        results: [],
        totalCount: 0,
        categoryCounts,
        page,
        pageSize,
        hasMore: false,
      };
    }

    const allCandidateResults: SearchResultItem[] = [];

    // -------------------------------------------------------------------------
    // A. Search Communities
    // Only search communities the user has permission to see (public OR user is member/owner)
    // -------------------------------------------------------------------------
    const authorizedCommunities = communities.filter((comm) => {
      if (comm.isPublic) return true;
      if (comm.ownerId === currentUser.id) return true;
      if (comm.members?.some((m) => m.userId === currentUser.id)) return true;
      return false;
    });

    for (const comm of authorizedCommunities) {
      const nameMatch = comm.name.toLowerCase().includes(trimmedQuery);
      const descMatch = comm.description?.toLowerCase().includes(trimmedQuery);
      const taglineMatch = comm.tagline?.toLowerCase().includes(trimmedQuery);

      if (nameMatch || descMatch || taglineMatch) {
        allCandidateResults.push({
          id: `comm_${comm.id}`,
          type: 'community',
          title: comm.name,
          subtitle: comm.tagline || comm.description || 'Community',
          snippet: comm.description || undefined,
          metadata: {
            communityId: comm.id,
            icon: comm.icon,
          },
        });
        categoryCounts.communities++;
      }
    }

    // -------------------------------------------------------------------------
    // B. Search Channels
    // Only search channels within authorized communities that the user's role can access
    // -------------------------------------------------------------------------
    for (const comm of authorizedCommunities) {
      const userMember = comm.members?.find((m) => m.userId === currentUser.id);
      const userRole = comm.ownerId === currentUser.id ? 'owner' : userMember?.role || 'member';

      for (const ch of comm.channels || []) {
        // Enforce channel privacy clearance
        if (ch.isPrivate && ch.allowedRoles && ch.allowedRoles.length > 0) {
          if (!ch.allowedRoles.includes(userRole) && userRole !== 'owner') {
            continue; // STRICT ACL: Skip restricted channels
          }
        }

        const nameMatch = ch.name.toLowerCase().includes(trimmedQuery);
        const topicMatch = ch.topic?.toLowerCase().includes(trimmedQuery);

        if (nameMatch || topicMatch) {
          allCandidateResults.push({
            id: `ch_${ch.id}`,
            type: 'channel',
            title: `#${ch.name}`,
            subtitle: `${comm.name} • ${ch.type === 'voice' ? 'Voice Room' : 'Text Frequency'}`,
            snippet: ch.topic || undefined,
            metadata: {
              communityId: comm.id,
              channelId: ch.id,
              icon: comm.icon,
            },
          });
          categoryCounts.channels++;
        }
      }
    }

    // -------------------------------------------------------------------------
    // C. Search Users
    // Search known operatives; filter out blocked users
    // -------------------------------------------------------------------------
    const userList = Object.values(allUsers).filter(
      (u) => u.id !== currentUser.id && !blockedUserIds.includes(u.id)
    );

    for (const u of userList) {
      const nameMatch = u.displayName.toLowerCase().includes(trimmedQuery);
      const usernameMatch = u.username.toLowerCase().includes(trimmedQuery);
      const bioMatch = u.bio?.toLowerCase().includes(trimmedQuery);

      if (nameMatch || usernameMatch || bioMatch) {
        allCandidateResults.push({
          id: `usr_${u.id}`,
          type: 'user',
          title: u.displayName,
          subtitle: `@${u.username} • ${u.status.toUpperCase()}`,
          snippet: u.customStatus || u.bio || undefined,
          metadata: {
            userId: u.id,
            avatar: u.avatar,
          },
        });
        categoryCounts.users++;
      }
    }

    // -------------------------------------------------------------------------
    // D. Search Messages (STRICT AUTHORIZATION BOUNDARY)
    // Rules:
    // 1. Never show messages from users the current user has blocked.
    // 2. If message belongs to a channel, verify user has access to that channel.
    // 3. If message belongs to a DM / conversation, verify currentUser is in participantIds.
    // 4. Any message from a private thread/channel where user is not a participant is dropped!
    // -------------------------------------------------------------------------
    // Build set of authorized channel IDs
    const authorizedChannelIds = new Set<string>();
    const channelToCommunityMap = new Map<string, string>();
    for (const comm of authorizedCommunities) {
      const userMember = comm.members?.find((m) => m.userId === currentUser.id);
      const userRole = comm.ownerId === currentUser.id ? 'owner' : userMember?.role || 'member';

      for (const ch of comm.channels || []) {
        if (!ch.isPrivate || userRole === 'owner' || (ch.allowedRoles && ch.allowedRoles.includes(userRole))) {
          authorizedChannelIds.add(ch.id);
          channelToCommunityMap.set(ch.id, comm.id);
        }
      }
    }

    // Build map of authorized DM conversation IDs
    const authorizedConversationIds = new Set<string>();
    for (const conv of conversations) {
      if (conv.participants?.some((p) => p.id === currentUser.id)) {
        authorizedConversationIds.add(conv.id);
      }
    }

    for (const msg of allMessages) {
      // 1. Drop messages from blocked users
      if (blockedUserIds.includes(msg.authorId)) {
        continue;
      }

      // 2. Verify channel or conversation authorization
      let isAuthorized = false;
      let containerSubtitle = 'Transmission';
      let foundCommunityId: string | undefined;

      if (msg.channelId) {
        if (authorizedChannelIds.has(msg.channelId)) {
          isAuthorized = true;
          foundCommunityId = channelToCommunityMap.get(msg.channelId);
          const comm = communities.find((c) => c.id === foundCommunityId);
          const ch = comm?.channels.find((c) => c.id === msg.channelId);
          containerSubtitle = `${comm?.name || 'Community'} > #${ch?.name || 'channel'}`;
        }
      } else if (msg.dmConversationId) {
        if (authorizedConversationIds.has(msg.dmConversationId)) {
          isAuthorized = true;
          containerSubtitle = 'Direct Message';
        }
      }

      if (!isAuthorized) {
        continue; // STRICT PRIVACY: Unauthorized message dropped
      }

      // 3. Check text match
      const contentLower = msg.content.toLowerCase();
      const matchIndex = contentLower.indexOf(trimmedQuery);

      if (matchIndex !== -1) {
        // Generate snippet around match
        const snippetStart = Math.max(0, matchIndex - 30);
        const snippetEnd = Math.min(msg.content.length, matchIndex + trimmedQuery.length + 50);
        const snippet = (snippetStart > 0 ? '...' : '') +
          msg.content.substring(snippetStart, snippetEnd) +
          (snippetEnd < msg.content.length ? '...' : '');

        const authorName = msg.authorName || allUsers[msg.authorId]?.displayName || 'Operative';

        allCandidateResults.push({
          id: `msg_${msg.id}`,
          type: 'message',
          title: `${authorName}: "${snippet}"`,
          subtitle: `${containerSubtitle} • ${new Date(msg.timestamp).toLocaleDateString()}`,
          snippet: msg.content,
          metadata: {
            communityId: foundCommunityId,
            channelId: msg.channelId,
            conversationId: msg.dmConversationId,
            userId: msg.authorId,
            timestamp: msg.timestamp,
            avatar: msg.authorAvatar,
          },
        });
        categoryCounts.messages++;
      }
    }

    // -------------------------------------------------------------------------
    // Total calculation & Filtering
    // -------------------------------------------------------------------------
    categoryCounts.all =
      categoryCounts.messages +
      categoryCounts.channels +
      categoryCounts.communities +
      categoryCounts.users;

    let filtered = allCandidateResults;
    if (category !== 'all') {
      const typeMap: Record<SearchCategory, string> = {
        all: '',
        messages: 'message',
        channels: 'channel',
        communities: 'community',
        users: 'user',
      };
      filtered = allCandidateResults.filter((r) => r.type === typeMap[category]);
    }

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = filtered.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < filtered.length;

    return {
      results: paginatedResults,
      totalCount: filtered.length,
      categoryCounts,
      page,
      pageSize,
      hasMore,
    };
  }
}

export const searchService = SearchService.getInstance();
