export type UserRole = 'owner' | 'admin' | 'moderator' | 'member';

export type PlatformRole = 'super_admin' | 'admin' | 'moderator' | 'none';

export type ExecutiveCategory = 'founder' | 'ceo' | 'managing_director';

export interface ExecutiveRoleInfo {
  category: ExecutiveCategory;
  title: string;
  badge: string;
  scope: string;
  rank: number; // 3 = Chairman & Founder, 2 = CEO, 1 = Managing Director
  platformRole: PlatformRole;
  description: string;
  approvalPrivileges: string[];
  accentColor: string;
  borderColor: string;
  bgGlow: string;
}

export const EXECUTIVE_ROLES: Record<ExecutiveCategory, ExecutiveRoleInfo> = {
  founder: {
    category: 'founder',
    title: 'Chairman and Founder',
    badge: '👑 Chairman & Founder',
    scope: 'Full Access (Platform Sovereign)',
    rank: 3,
    platformRole: 'super_admin',
    description: 'Supreme executive clearance with unrestricted platform sovereignty. Holds exclusive authority to appoint/demote executives, sanction communities, configure security architecture, and approve all platform beta requests.',
    approvalPrivileges: [
      'Approve & revoke all platform beta access applications',
      'Appoint or reassign CEO and Managing Director credentials',
      'Assign & revoke Super Admin & Admin platform roles',
      'Sanction, lock, or permanently purge communities',
      'Manage legal compliance, terms, and privacy protocols',
      'Unrestricted access to immutable security audit logs',
    ],
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/50',
    bgGlow: 'bg-amber-500/10',
  },
  ceo: {
    category: 'ceo',
    title: 'CEO',
    badge: '💼 Chief Executive Officer',
    scope: 'Executive Access (Strategic Operations)',
    rank: 2,
    platformRole: 'admin',
    description: 'Chief Executive Officer directing platform operations, strategic partnerships, and community verification. Holds full approval authority over beta candidates and platform policy enforcement.',
    approvalPrivileges: [
      'Approve & review platform beta access candidates',
      'Approve verified community partner badges',
      'Execute account suspensions & emergency actions',
      'Inspect comprehensive platform health metrics',
      'Review executive audit trails & incident reports',
    ],
    accentColor: '#a855f7',
    borderColor: 'border-violet-500/50',
    bgGlow: 'bg-violet-500/10',
  },
  managing_director: {
    category: 'managing_director',
    title: 'Managing Director',
    badge: '🏛️ Managing Director',
    scope: 'Operational Access (Community & Moderation)',
    rank: 1,
    platformRole: 'admin',
    description: 'Managing Director directing community moderation, user safety, and beta onboarding. Holds direct authority to approve beta applications and adjudicate moderation appeals.',
    approvalPrivileges: [
      'Approve & onboard platform beta candidates',
      'Adjudicate user safety reports & abuse escalations',
      'Manage community warnings & suspension appeals',
      'Supervise operational moderation queue',
      'Contribute to executive audit ledger',
    ],
    accentColor: '#06b6d4',
    borderColor: 'border-cyan-500/50',
    bgGlow: 'bg-cyan-500/10',
  },
};

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

export type BetaAccessStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  username: string;
  displayName: string;
  tag: string;
  avatar: string;
  bannerColor?: string;
  status: UserStatus;
  lastSeenAt?: string;
  customStatus?: string;
  bio?: string;
  email?: string;
  phone?: string;
  pronouns?: string;
  joinedAt: string;
  role?: UserRole; // within current community
  platformRole?: PlatformRole;
  executiveCategory?: ExecutiveCategory;
  executiveTitle?: string;
  isSuspended?: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  reportedCount?: number;
  acceptedLegalVersion?: string;
  acceptedLegalAt?: string;
  betaStatus?: BetaAccessStatus;
}

export type ChannelType = 'text' | 'voice' | 'announcement';

export interface Channel {
  id: string;
  communityId: string;
  name: string;
  topic?: string;
  type: ChannelType;
  categoryId?: string;
  isPrivate?: boolean;
  allowedRoles?: UserRole[];
  unreadCount?: number;
  lastMessageAt?: string;
}

export interface ChannelCategory {
  id: string;
  communityId: string;
  name: string;
  order: number;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'audio';
  size?: string;
}

export interface MessageReply {
  messageId: string;
  authorName: string;
  content: string;
}

export interface Message {
  id: string;
  channelId?: string; // either channelId or dmConversationId
  dmConversationId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  authorTag: string;
  content: string;
  timestamp: string;
  editedAt?: string;
  pinned?: boolean;
  replyTo?: MessageReply;
  reactions: Reaction[];
  attachments?: Attachment[];
  readBy?: string[]; // user IDs who have read this message
}

export interface CommunityMember {
  userId: string;
  user: User;
  role: UserRole;
  joinedAt: string;
  nickname?: string;
}

export interface Community {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  banner?: string;
  ownerId: string;
  description: string;
  isPublic: boolean;
  inviteCode: string;
  categories: ChannelCategory[];
  channels: Channel[];
  members: CommunityMember[];
  unreadCount?: number;
  isSuspended?: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  reportedCount?: number;
  serverTag?: string;
  traits?: string[];
  customBanner?: string;
  verificationLevel?: 'none' | 'low' | 'medium' | 'high';
  boostCount?: number;
  boostLevel?: 0 | 1 | 2 | 3;
  customEmojis?: { id: string; name: string; url: string }[];
  customStickers?: { id: string; name: string; url: string }[];
  customSounds?: { id: string; name: string; url: string }[];
  bannedUserIds?: string[];
}

export interface DMConversation {
  id: string;
  isGroup?: boolean;
  name?: string; // Group Name
  avatar?: string; // Group custom avatar
  ownerId?: string; // Creator / Owner for Group DMs
  participants: User[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  createdAt: string;
}

export interface Friendship {
  id: string;
  userIds: [string, string];
  friend: User; // Relative to current user
  createdAt: string;
  lastInteractionAt?: string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  blockedUser: User;
  blockedAt: string;
}

export type FriendsTab = 'online' | 'all' | 'pending' | 'blocked' | 'add_friend';

export interface AuditLogEntry {
  id: string;
  communityId: string;
  actorName: string;
  actorRole: UserRole;
  action: 'channel_create' | 'channel_delete' | 'member_kick' | 'member_ban' | 'role_update' | 'community_edit';
  details: string;
  timestamp: string;
}

export interface CommunityInvite {
  id: string;
  code: string;
  communityId: string;
  communityName: string;
  communityIcon: string;
  communityDescription: string;
  memberCount: number;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  expiresAt: string; // '30m' | '1d' | '7d' | 'never'
  maxUses: number; // 0 = unlimited
  usesCount: number;
  isDirectInvite?: boolean;
  targetUserId?: string;
  targetUserName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
}

export interface VoiceState {
  isConnected: boolean;
  channelId: string | null;
  communityId: string | null;
  channelName: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  activeUsers: {
    userId: string;
    displayName: string;
    avatar: string;
    isSpeaking: boolean;
    isMuted?: boolean;
    isDeafened?: boolean;
    isCameraOn?: boolean;
    isScreenSharing?: boolean;
  }[];
}

export type CallType = 'voice' | 'video';
export type CallScope = 'direct' | 'group' | 'channel';
export type CallStatus = 'ringing' | 'connected' | 'declined' | 'ended' | 'missed';

export interface CallParticipant {
  userId: string;
  displayName: string;
  avatar: string;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  joinedAt?: string;
}

export interface CallSession {
  id: string;
  type: CallType;
  scope: CallScope;
  targetId: string; // recipient userId, groupId, or channelId
  targetName?: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  participantIds: string[];
  status: CallStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
}

export type BetaFeedbackCategory =
  | 'voice_video'
  | 'messaging'
  | 'communities'
  | 'auth'
  | 'performance'
  | 'ui_ux'
  | 'other';

export type BetaFeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';

export type BetaFeedbackStatus = 'new' | 'reviewing' | 'in_progress' | 'fixed' | 'closed';

export interface BetaFeedbackItem {
  id: string;
  title: string;
  description: string;
  category: BetaFeedbackCategory;
  severity: BetaFeedbackSeverity;
  browserAndDevice: string;
  screenshot?: string; // Base64 data URL (max 2MB)
  testerId: string;
  testerName: string;
  testerTag?: string;
  testerAvatar?: string;
  status: BetaFeedbackStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BetaApplication {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  username: string;
  status: BetaAccessStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedByTitle?: string;
  reviewedByCategory?: ExecutiveCategory;
  experience?: string;
  devices?: string[];
  adminNotes?: string;
}

export type ReportTargetType = 'user' | 'message' | 'community';
export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';
export type ModerationDecision =
  | 'warning_issued'
  | 'account_suspended'
  | 'community_suspended'
  | 'message_purged'
  | 'no_violation';

export interface PlatformReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetName?: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  decision?: ModerationDecision;
  moderatorNotes?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: PlatformRole;
  executiveCategory?: ExecutiveCategory;
  executiveTitle?: string;
  action: string;
  targetType: 'user' | 'community' | 'report' | 'beta_application' | 'system';
  targetId: string;
  targetName?: string;
  details: string;
  previousValue?: string;
  updatedValue?: string;
  timestamp: string;
}

export interface PlatformDashboardMetrics {
  totalUsers: number;
  onlineUsers: number;
  totalCommunities: number;
  totalMessages: number;
  pendingReports: number;
  suspendedAccounts: number;
  suspendedCommunities: number;
  pendingBetaApplications: number;
}

// ---------------------------------------------------------------------------
// Notification & Activity Center Schemas
// ---------------------------------------------------------------------------
export type NotificationType =
  | 'dm_message'
  | 'friend_request'
  | 'friend_accept'
  | 'community_invite'
  | 'announcement'
  | 'mention'
  | 'call_voice'
  | 'call_video'
  | 'moderation_action';

export type NotificationCategory = 'all' | 'direct' | 'mentions' | 'community' | 'calls' | 'system';

export interface NexoraNotification {
  id: string;
  recipientId: string;
  senderId?: string;
  senderName: string;
  senderAvatar?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  targetCommunityId?: string;
  targetChannelId?: string;
  targetConversationId?: string;
  targetUserId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  soundEnabled: boolean;
  desktopEnabled: boolean;
  categories: {
    direct: boolean;
    mentions: boolean;
    community: boolean;
    calls: boolean;
    system: boolean;
  };
  mutedCommunities: Record<string, boolean>;
  mutedConversations: Record<string, boolean>;
}





