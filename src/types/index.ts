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
  customStatus?: string;
  bio?: string;
  email?: string;
  phone?: string;
  pronouns?: string;
  joinedAt: string;
  role?: UserRole; // within current community
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
  participants: User[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

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
  activeUsers: {
    userId: string;
    displayName: string;
    avatar: string;
    isSpeaking: boolean;
  }[];
}

