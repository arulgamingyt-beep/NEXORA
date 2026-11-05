export type UserRole = 'owner' | 'admin' | 'moderator' | 'member';

export type PlatformRole = 'super_admin' | 'admin' | 'moderator' | 'none';

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





