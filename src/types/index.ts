export type UserRole = 'owner' | 'admin' | 'moderator' | 'member';

export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline';

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
  acceptedLegalVersion?: string;
  acceptedLegalAt?: string;
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


