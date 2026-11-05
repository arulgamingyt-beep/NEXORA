import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Community,
  Channel,
  ChannelCategory,
  Message,
  DMConversation,
  AuditLogEntry,
  CommunityInvite,
  VoiceState,
  UserRole,
  UserStatus,
  ChannelType,
  Attachment,
  Reaction,
  FriendRequest,
  Friendship,
  BlockedUser,
  FriendsTab,
  CallSession,
  CallType,
  CallParticipant,
} from '../types';
import {
  CURRENT_USER,
  MOCK_USERS,
  INITIAL_COMMUNITIES,
  INITIAL_MESSAGES,
  INITIAL_DM_CONVERSATIONS,
  INITIAL_INVITES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FRIENDSHIPS,
  INITIAL_FRIEND_REQUESTS,
  INITIAL_BLOCKED_USERS,
} from '../mock/initialData';
import { auth, db, googleProvider } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import { getRandomCyberAvatar } from '../utils/avatars';
import {
  hashSecurityKey,
  generateOperativeUID,
  saveVaultAccount,
  findVaultAccount,
  findVaultAccountByEmail,
  verifyVaultCredentials,
  updateVaultUserProfile,
  getActiveVaultSession,
  setActiveVaultSession,
  resetVaultAccountPassword,
  getOrCreateDemoAccount,
} from '../utils/authVault';
import { webrtcVoiceService } from '../utils/webrtcVoice';
import { callSignalingService } from '../services/callSignaling';

export type ModalType =
  | 'user_settings'
  | 'community_settings'
  | 'create_community'
  | 'create_channel'
  | 'create_group_dm'
  | 'edit_group_dm'
  | 'invite'
  | 'join_invite'
  | 'search'
  | 'auth'
  | null;

interface ToastInfo {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

interface NexoraContextType {
  currentUser: User;
  authUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  allUsers: Record<string, User>;
  communities: Community[];
  activeCommunity: Community | null;
  activeCommunityId: string | null;
  activeChannel: Channel | null;
  activeChannelId: string | null;
  activeDM: DMConversation | null;
  activeDMId: string | null;
  messages: Message[];
  dmConversations: DMConversation[];
  communityInvites: CommunityInvite[];
  auditLogs: AuditLogEntry[];
  voiceState: VoiceState;
  isMemberListOpen: boolean;
  replyingTo: Message | null;
  editingMessageId: string | null;
  activeModal: ModalType;
  modalPayload: any;
  selectedUserForProfile: User | null;
  toast: ToastInfo | null;
  soundEnabled: boolean;
  channelMutes: Record<string, boolean>;
  isMobileSidebarOpen: boolean;
  isMobileChannelOpen: boolean;
  isFirestoreConnected: boolean;
  isCloudSyncing: boolean;
  connectionError: string | null;

  // Friends & DM Extensions
  friends: Friendship[];
  friendRequests: FriendRequest[];
  blockedUsers: BlockedUser[];
  friendsTab: FriendsTab;
  setFriendsTab: (tab: FriendsTab) => void;
  typingUsers: Record<string, string[]>;
  sendFriendRequest: (usernameOrTag: string) => { success: boolean; message: string };
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  cancelFriendRequest: (requestId: string) => void;
  removeFriend: (friendUserId: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  isUserBlocked: (targetUserId: string) => boolean;
  isUserBlockedBy: (targetUserId: string) => boolean;
  createGroupDM: (name: string, participantUserIds: string[], avatar?: string) => string;
  updateGroupDM: (conversationId: string, updates: { name?: string; avatar?: string }) => void;
  addGroupParticipant: (conversationId: string, userId: string) => void;
  removeGroupParticipant: (conversationId: string, userId: string) => void;
  leaveGroupDM: (conversationId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  markConversationAsRead: (conversationId: string) => void;

  // Actions & Auth
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, username: string, avatarUrl?: string) => Promise<void>;
  loginWithGoogle: (customIdentity?: { email: string; displayName: string; avatar?: string }) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  toggleChannelMute: (channelId: string) => void;
  setCurrentUser: (user: User) => void;
  switchUser: (userId: string) => void;
  setActiveCommunity: (communityId: string | null) => void;
  setActiveChannel: (channelId: string) => void;
  setActiveDM: (dmId: string | null) => void;
  openDMWithUser: (targetUserId: string) => void;
  sendMessage: (content: string, attachments?: Attachment[]) => void;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  toggleReaction: (messageId: string, emoji: string) => void;
  togglePinMessage: (messageId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  setEditingMessageId: (messageId: string | null) => void;
  createCommunity: (name: string, tagline: string, description: string, icon: string, isPublic: boolean) => string;
  updateCommunity: (communityId: string, updates: Partial<Community>) => void;
  deleteCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  createChannel: (communityId: string, name: string, type: ChannelType, topic?: string, categoryId?: string, isPrivate?: boolean) => void;
  updateChannel: (communityId: string, channelId: string, updates: Partial<Channel>) => void;
  deleteChannel: (communityId: string, channelId: string) => void;
  createChannelCategory: (communityId: string, name: string) => void;
  canUserAccessChannel: (channel: Channel) => boolean;
  createInvite: (communityId: string, options: { expiresAt: string; maxUses: number; directUserId?: string }) => CommunityInvite;
  acceptInvite: (inviteCodeOrId: string) => boolean;
  declineInvite: (inviteId: string) => void;
  revokeInvite: (inviteId: string) => void;
  updateMemberRole: (communityId: string, targetUserId: string, newRole: UserRole) => void;
  kickMember: (communityId: string, targetUserId: string, reason?: string) => void;
  banMember: (communityId: string, targetUserId: string, reason?: string) => void;
  connectVoice: (channelId: string, channelName: string, communityId: string) => void;
  disconnectVoice: () => void;
  toggleVoiceMute: () => void;
  toggleVoiceDeafen: () => void;
  updateUserStatus: (status: UserStatus, customStatus?: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  openModal: (modal: ModalType, payload?: any) => void;
  closeModal: () => void;
  setSelectedUserForProfile: (user: User | null) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
  toggleMemberList: () => void;
  toggleSound: () => void;
  toggleMobileSidebar: () => void;
  toggleMobileChannel: () => void;
  getCurrentUserRoleInActiveCommunity: () => UserRole;

  // Real-Time Calling & Video Mesh
  incomingCall: CallSession | null;
  activeCall: CallSession | null;
  startCall: (targetUserId: string, type: CallType) => Promise<void>;
  startGroupCall: (conversationId: string, type: CallType) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  declineIncomingCall: () => Promise<void>;
  endActiveCall: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
}

const NexoraContext = createContext<NexoraContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nexora_app_state_v1';

export const NexoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state or local storage
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === 'google_operative@gmail.com') {
          return CURRENT_USER;
        }
        return parsed;
      }
    } catch {}
    return CURRENT_USER;
  });

  const [allUsers, setAllUsers] = useState<Record<string, User>>(MOCK_USERS);
  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [activeCommunityId, setActiveCommunityId] = useState<string | null>('comm_nexora_hq');
  const [activeChannelId, setActiveChannelId] = useState<string | null>('chan_general');
  const [activeDMId, setActiveDMId] = useState<string | null>(null);

  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [dmConversations, setDmConversations] = useState<DMConversation[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_dms');
    return saved ? JSON.parse(saved) : INITIAL_DM_CONVERSATIONS;
  });

  const [friends, setFriends] = useState<Friendship[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_friends');
      return saved ? JSON.parse(saved) : INITIAL_FRIENDSHIPS;
    } catch {
      return INITIAL_FRIENDSHIPS;
    }
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_friend_requests');
      return saved ? JSON.parse(saved) : INITIAL_FRIEND_REQUESTS;
    } catch {
      return INITIAL_FRIEND_REQUESTS;
    }
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_blocked_users');
      return saved ? JSON.parse(saved) : INITIAL_BLOCKED_USERS;
    } catch {
      return INITIAL_BLOCKED_USERS;
    }
  });

  const [friendsTab, setFriendsTab] = useState<FriendsTab>('online');
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const [communityInvites, setCommunityInvites] = useState<CommunityInvite[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_invites');
    return saved ? JSON.parse(saved) : INITIAL_INVITES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isConnected: false,
    channelId: null,
    communityId: null,
    channelName: null,
    isMuted: false,
    isDeafened: false,
    isSpeaking: false,
    isCameraOn: false,
    isScreenSharing: false,
    activeUsers: [],
  });

  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);

  const [isMemberListOpen, setIsMemberListOpen] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [channelMutes, setChannelMutes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY + '_channel_mutes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Mobile layout toggles
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileChannelOpen, setIsMobileChannelOpen] = useState(false);

  // Authentication State
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [vaultUser, setVaultUser] = useState<User | null>(() => {
    const session = getActiveVaultSession();
    if (session?.email === 'google_operative@gmail.com') {
      setActiveVaultSession(null);
      return null;
    }
    return session;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const isAuthenticated = !!authUser || !!vaultUser;

  // Real-time Firestore sync and connection states
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Configure browser local persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase Auth persistence setup note:', err);
    });
  }, []);

  // Monitor Firebase Authentication State & Hydrate Firestore / Vault Profile
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setAuthUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const profileData = docSnap.data() as User;
            const updatedProfile = {
              ...profileData,
              id: fbUser.uid,
              email: fbUser.email || profileData.email || '',
              status: (profileData.status === 'offline' ? 'online' : profileData.status) as UserStatus,
            };
            setCurrentUser(updatedProfile);
            setAllUsers((prev) => ({ ...prev, [fbUser.uid]: updatedProfile }));

            // Mark online in Firestore if was offline
            if (profileData.status === 'offline') {
              updateDoc(userDocRef, {
                status: 'online',
                lastSeen: new Date().toISOString(),
              }).catch(() => {});
            }
          } else {
            // Document does not exist yet (create default profile)
            const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;
            const cleanUsername = (fbUser.displayName || fbUser.email?.split('@')[0] || 'operative')
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, '')
              .slice(0, 20) || 'operative';

            const newProfile: User = {
              id: fbUser.uid,
              username: cleanUsername,
              displayName: fbUser.displayName || cleanUsername,
              tag,
              avatar: fbUser.photoURL || getRandomCyberAvatar(),
              bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
              status: 'online',
              customStatus: 'Operative active in Nexora',
              bio: 'Nexora operative. Transmitting without limits.',
              email: fbUser.email || '',
              joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              role: 'member',
            };

            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
            setAllUsers((prev) => ({ ...prev, [fbUser.uid]: newProfile }));
          }
        } catch (err: any) {
          console.warn('Error fetching user profile from Firestore:', err);
        }
      } else {
        // Check for active local cryptographic vault session
        const activeVault = getActiveVaultSession();
        if (
          activeVault &&
          (activeVault.email === 'google_operative@gmail.com' ||
           activeVault.username === 'google_operative')
        ) {
          setActiveVaultSession(null);
          setVaultUser(null);
        } else if (activeVault) {
          setVaultUser(activeVault);
          setCurrentUser(activeVault);
          setAllUsers((prev) => ({ ...prev, [activeVault.id]: activeVault }));
        } else {
          setVaultUser(null);
        }
      }
      setIsAuthLoading(false);
    });

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setIsFirestoreConnected(true);
        setConnectionError(null);
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          setConnectionError('Client offline: Check Firestore network configuration.');
          setIsFirestoreConnected(false);
        } else {
          setIsFirestoreConnected(true);
          setConnectionError(null);
        }
      }
    };
    testConnection();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Real-time synchronization of all users from Firestore
  useEffect(() => {
    if (!authUser) return;

    const usersCollRef = collection(db, 'users');
    const usersQuery = query(usersCollRef, limit(100));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const remoteUsers: Record<string, User> = {};
        snapshot.docs.forEach((docSnap) => {
          remoteUsers[docSnap.id] = { ...docSnap.data(), id: docSnap.id } as User;
        });

        setAllUsers((prev) => ({
          ...prev,
          ...remoteUsers,
        }));
      },
      (error) => {
        console.warn('Real-time users directory notice:', error);
      }
    );

    return () => unsubscribe();
  }, [authUser]);

  // Set user offline on page unload
  useEffect(() => {
    if (!currentUser?.id || !authUser) return;

    const handleBeforeUnload = () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.id);
        updateDoc(userDocRef, {
          status: 'offline',
          lastSeen: new Date().toISOString(),
        });
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser?.id, authUser]);

  // Save changes to localStorage with 300ms debounce to prevent main-thread stutter
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY + '_communities', JSON.stringify(communities));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_messages', JSON.stringify(allMessages));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_invites', JSON.stringify(communityInvites));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_dms', JSON.stringify(dmConversations));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_friends', JSON.stringify(friends));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_friend_requests', JSON.stringify(friendRequests));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_blocked_users', JSON.stringify(blockedUsers));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_user', JSON.stringify(currentUser));
        localStorage.setItem(LOCAL_STORAGE_KEY + '_channel_mutes', JSON.stringify(channelMutes));
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    communities,
    allMessages,
    communityInvites,
    dmConversations,
    friends,
    friendRequests,
    blockedUsers,
    currentUser,
    channelMutes,
  ]);

  // Real-time Cross-Tab synchronization listener (ensures 100% instant sync across tabs in local/vault mode)
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === LOCAL_STORAGE_KEY + '_messages') {
          const parsed = JSON.parse(e.newValue);
          setAllMessages(parsed);
        } else if (e.key === LOCAL_STORAGE_KEY + '_dms') {
          const parsed = JSON.parse(e.newValue);
          setDmConversations(parsed);
        } else if (e.key === LOCAL_STORAGE_KEY + '_communities') {
          const parsed = JSON.parse(e.newValue);
          setCommunities(parsed);
        } else if (e.key === LOCAL_STORAGE_KEY + '_invites') {
          const parsed = JSON.parse(e.newValue);
          setCommunityInvites(parsed);
        }
      } catch (err) {
        console.warn('Cross-tab sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  const rawCommunity = communities.find((c) => c.id === activeCommunityId) || null;
  const activeCommunity = rawCommunity
    ? {
        ...rawCommunity,
        members:
          currentUser && rawCommunity.members.some((m) => m.userId === currentUser.id)
            ? rawCommunity.members.map((m) =>
                m.userId === currentUser.id ? { ...m, user: currentUser } : m
              )
            : currentUser
            ? [
                ...rawCommunity.members,
                {
                  userId: currentUser.id,
                  user: currentUser,
                  role: (rawCommunity.ownerId === currentUser.id ? 'owner' : 'member') as UserRole,
                  joinedAt: 'Today',
                },
              ]
            : rawCommunity.members,
      }
    : null;

  const activeChannel = activeCommunity?.channels.find((ch) => ch.id === activeChannelId) || null;

  const activeDM = dmConversations.find((dm) => dm.id === activeDMId) || null;

  // Real-time Firestore message listener for the currently selected community channel
  useEffect(() => {
    if (!activeCommunityId || !activeChannelId) return;

    setIsCloudSyncing(true);
    const messagesCollRef = collection(
      db,
      'communities',
      activeCommunityId,
      'channels',
      activeChannelId,
      'messages'
    );
    const messagesQuery = query(messagesCollRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setIsFirestoreConnected(true);
        setIsCloudSyncing(false);
        setConnectionError(null);

        if (!snapshot.empty) {
          const remoteMessages: Message[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              channelId: data.channelId || activeChannelId,
              authorId: data.authorId || '',
              authorName: data.authorName || 'Operative',
              authorAvatar: data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              authorRole: data.authorRole || 'member',
              authorTag: data.authorTag || '#0000',
              content: data.content || '',
              timestamp: data.timestamp || '',
              editedAt: data.editedAt || undefined,
              pinned: !!data.pinned,
              replyTo: data.replyTo || undefined,
              reactions: Array.isArray(data.reactions) ? data.reactions : [],
              attachments: Array.isArray(data.attachments) ? data.attachments : [],
            };
          });

          setAllMessages((prev) => ({
            ...prev,
            [activeChannelId]: remoteMessages,
          }));
        }
      },
      (error) => {
        console.warn('Firestore real-time listener error:', error);
        setIsCloudSyncing(false);
        if (error.code === 'permission-denied') {
          setConnectionError('Access restricted by security rules');
        } else {
          setConnectionError(error.message);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeCommunityId, activeChannelId]);

  // Real-time listener for Direct Messages
  useEffect(() => {
    if (activeCommunityId || !activeDMId) return;

    setIsCloudSyncing(true);
    const dmMessagesRef = collection(db, 'dm_threads', activeDMId, 'messages');
    const dmMessagesQuery = query(dmMessagesRef, orderBy('timestamp', 'asc'), limit(50));

    const unsubscribe = onSnapshot(
      dmMessagesQuery,
      (snapshot) => {
        setIsFirestoreConnected(true);
        setIsCloudSyncing(false);
        setConnectionError(null);

        if (!snapshot.empty) {
          const remoteDMs: Message[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              dmConversationId: activeDMId,
              authorId: data.authorId || '',
              authorName: data.authorName || 'Operative',
              authorAvatar: data.authorAvatar || '',
              authorRole: data.authorRole || 'member',
              authorTag: data.authorTag || '#0000',
              content: data.content || '',
              timestamp: data.timestamp || '',
              editedAt: data.editedAt || undefined,
              pinned: !!data.pinned,
              replyTo: data.replyTo || undefined,
              reactions: Array.isArray(data.reactions) ? data.reactions : [],
              attachments: Array.isArray(data.attachments) ? data.attachments : [],
            };
          });

          setAllMessages((prev) => ({
            ...prev,
            [activeDMId]: remoteDMs,
          }));
        }
      },
      (error) => {
        setIsCloudSyncing(false);
        console.warn('DM listener error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeCommunityId, activeDMId]);

  // Active messages list depends on whether community channel or DM is selected
  const currentFeedKey = activeCommunityId ? (activeChannelId || '') : (activeDMId || '');
  const messages = allMessages[currentFeedKey] || [];

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const playSoundEffect = (type: 'send' | 'receive' | 'join' | 'leave') => {
    if (!soundEnabled) return;
    try {
      // Audio synth via Web Audio API - no external file download required!
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'join') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'leave') {
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(270, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Browser audio context restricted before user interaction
    }
  };

  const getCurrentUserRoleInActiveCommunity = (): UserRole => {
    if (!activeCommunity) return 'member';
    if (activeCommunity.ownerId === currentUser.id) return 'owner';
    const memberRecord = activeCommunity.members.find((m) => m.userId === currentUser.id);
    return memberRecord?.role || 'member';
  };

  const switchUser = (userId: string) => {
    if (authUser) {
      showToast('Account impersonation is blocked for active cloud sessions. Sign out first.', 'warning');
      return;
    }
    const targetUser = allUsers[userId];
    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(`Switched user identity to ${targetUser.displayName} (${targetUser.role?.toUpperCase() || 'MEMBER'})`, 'info');
    }
  };

  const setActiveCommunity = (communityId: string | null) => {
    setActiveCommunityId(communityId);
    setIsMobileSidebarOpen(false);
    if (communityId === null) {
      // Home / DMs mode
      setActiveChannelId(null);
      if (dmConversations.length > 0 && !activeDMId) {
        setActiveDMId(dmConversations[0].id);
      }
    } else {
      setActiveDMId(null);
      const comm = communities.find((c) => c.id === communityId);
      if (comm && comm.channels.length > 0) {
        // default to first text channel
        const firstTextChannel = comm.channels.find((ch) => ch.type === 'text') || comm.channels[0];
        setActiveChannelId(firstTextChannel.id);
      }
    }
  };

  const setActiveChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setIsMobileChannelOpen(false);
    // clear unread on clicked channel
    if (activeCommunityId) {
      setCommunities((prev) =>
        prev.map((c) => {
          if (c.id !== activeCommunityId) return c;
          return {
            ...c,
            channels: c.channels.map((ch) => (ch.id === channelId ? { ...ch, unreadCount: 0 } : ch)),
          };
        })
      );
    }
  };

  const setActiveDM = (dmId: string | null) => {
    setActiveDMId(dmId);
    setActiveCommunityId(null);
    setActiveChannelId(null);
    setIsMobileChannelOpen(false);
    if (dmId) {
      markConversationAsRead(dmId);
    }
  };

  const openDMWithUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) {
      showToast("You cannot start a direct message conversation with yourself.", "warning");
      return;
    }
    if (isUserBlocked(targetUserId)) {
      showToast("Cannot open transmission with a blocked operative.", "warning");
      return;
    }
    const targetUser = allUsers[targetUserId] || MOCK_USERS[targetUserId];
    if (!targetUser) return;

    // Check if DM exists
    let existingDM = dmConversations.find((dm) =>
      dm.participants.some((p) => p.id === targetUserId)
    );

    if (!existingDM) {
      const newDMId = 'dm_' + targetUserId + '_' + Date.now().toString().slice(-4);
      const newDM: DMConversation = {
        id: newDMId,
        participants: [currentUser, targetUser],
        lastMessage: 'Conversation started',
        lastMessageTime: 'Just now',
        unreadCount: 0,
      };
      setDmConversations((prev) => [newDM, ...prev]);
      setActiveCommunityId(null);
      setActiveDMId(newDMId);
      // initialize empty messages or greeting
      setAllMessages((prev) => ({
        ...prev,
        [newDMId]: [
          {
            id: 'msg_greet_' + Date.now(),
            dmConversationId: newDMId,
            authorId: targetUserId,
            authorName: targetUser.displayName,
            authorAvatar: targetUser.avatar,
            authorRole: 'member',
            authorTag: targetUser.tag,
            content: `Hey @${currentUser.displayName}! Direct message line open.`,
            timestamp: 'Just now',
            reactions: [],
          },
        ],
      }));
    } else {
      setActiveCommunityId(null);
      setActiveDMId(existingDM.id);
    }
    showToast(`Direct message with ${targetUser.displayName} opened`, 'success');
  };

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const feedKey = activeCommunityId ? activeChannelId : activeDMId;
    if (!feedKey) return;

    if (activeDMId) {
      const currentDM = dmConversations.find((d) => d.id === activeDMId);
      if (currentDM && !currentDM.isGroup) {
        const other = currentDM.participants.find((p) => p.id !== currentUser.id);
        if (other && (isUserBlocked(other.id) || isUserBlockedBy(other.id))) {
          showToast('You cannot send transmissions to a blocked operative.', 'warning');
          return;
        }
      }
    }

    const role = getCurrentUserRoleInActiveCommunity();
    const now = new Date();
    const timeString = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const messageDocId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newMessage: Message = {
      id: messageDocId,
      channelId: activeCommunityId ? activeChannelId! : undefined,
      dmConversationId: !activeCommunityId ? activeDMId! : undefined,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      authorRole: role,
      authorTag: currentUser.tag,
      content: content.trim(),
      timestamp: timeString,
      replyTo: replyingTo
        ? {
            messageId: replyingTo.id,
            authorName: replyingTo.authorName,
            content: replyingTo.content.slice(0, 100),
          }
        : undefined,
      reactions: [],
      attachments: attachments || [],
      readBy: [currentUser.id],
    };

    // 1. Optimistic local state update
    setAllMessages((prev) => ({
      ...prev,
      [feedKey]: [...(prev[feedKey] || []), newMessage],
    }));

    setReplyingTo(null);
    playSoundEffect('send');

    // If DM, update last message
    if (activeDMId) {
      setDmConversations((prev) =>
        prev.map((dm) =>
          dm.id === activeDMId
            ? { ...dm, lastMessage: content.slice(0, 40), lastMessageTime: 'Just now' }
            : dm
        )
      );
    }

    // 2. Persistent Firestore write
    try {
      if (activeCommunityId && activeChannelId) {
        const msgDocRef = doc(
          db,
          'communities',
          activeCommunityId,
          'channels',
          activeChannelId,
          'messages',
          messageDocId
        );
        await setDoc(msgDocRef, {
          id: messageDocId,
          communityId: activeCommunityId,
          channelId: activeChannelId,
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          authorAvatar: currentUser.avatar,
          authorRole: role,
          authorTag: currentUser.tag,
          content: content.trim(),
          timestamp: timeString,
          replyTo: newMessage.replyTo || null,
          reactions: [],
          attachments: attachments || [],
          readBy: [currentUser.id],
        });
      } else if (activeDMId) {
        const currentDM = dmConversations.find((d) => d.id === activeDMId);
        const participantIds = currentDM?.participants.map((p) => p.id) || [currentUser.id];
        const threadDocRef = doc(db, 'dm_threads', activeDMId);
        await setDoc(
          threadDocRef,
          {
            id: activeDMId,
            participantIds,
            lastMessage: content.trim(),
            lastMessageTime: timeString,
          },
          { merge: true }
        ).catch(() => {});

        const dmDocRef = doc(db, 'dm_threads', activeDMId, 'messages', messageDocId);
        await setDoc(dmDocRef, {
          id: messageDocId,
          dmConversationId: activeDMId,
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          authorAvatar: currentUser.avatar,
          authorRole: role,
          authorTag: currentUser.tag,
          content: content.trim(),
          timestamp: timeString,
          replyTo: newMessage.replyTo || null,
          reactions: [],
          attachments: attachments || [],
          readBy: [currentUser.id],
        });

        // Also sync to conversations collection
        const convDocRef = doc(db, 'conversations', activeDMId);
        await setDoc(
          convDocRef,
          {
            id: activeDMId,
            participantIds,
            lastMessage: content.trim(),
            lastMessageTime: timeString,
          },
          { merge: true }
        ).catch(() => {});

        const convMsgRef = doc(db, 'conversations', activeDMId, 'messages', messageDocId);
        await setDoc(convMsgRef, {
          id: messageDocId,
          dmConversationId: activeDMId,
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          authorAvatar: currentUser.avatar,
          authorRole: role,
          authorTag: currentUser.tag,
          content: content.trim(),
          timestamp: timeString,
          replyTo: newMessage.replyTo || null,
          reactions: [],
          attachments: attachments || [],
          readBy: [currentUser.id],
        }).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Persistent message save notice:', err);
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    const feedKey = activeCommunityId ? activeChannelId : activeDMId;
    if (!feedKey || !newContent.trim()) return;

    const msg = (allMessages[feedKey] || []).find((m) => m.id === messageId);
    if (!msg) return;

    if (msg.authorId !== currentUser.id) {
      showToast('You can only edit your own transmissions.', 'warning');
      return;
    }

    const editedAtTime = `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    // 1. Optimistic update
    setAllMessages((prev) => ({
      ...prev,
      [feedKey]: (prev[feedKey] || []).map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: newContent.trim(),
              editedAt: editedAtTime,
            }
          : m
      ),
    }));
    setEditingMessageId(null);
    showToast('Message edited', 'info');

    // 2. Persistent Firestore update
    try {
      if (activeCommunityId && activeChannelId) {
        const msgRef = doc(
          db,
          'communities',
          activeCommunityId,
          'channels',
          activeChannelId,
          'messages',
          messageId
        );
        await updateDoc(msgRef, {
          content: newContent.trim(),
          editedAt: editedAtTime,
        });
      } else if (activeDMId) {
        const dmMsgRef = doc(db, 'dm_threads', activeDMId, 'messages', messageId);
        await updateDoc(dmMsgRef, {
          content: newContent.trim(),
          editedAt: editedAtTime,
        }).catch(() => {});
        const convMsgRef = doc(db, 'conversations', activeDMId, 'messages', messageId);
        await updateDoc(convMsgRef, {
          content: newContent.trim(),
          editedAt: editedAtTime,
        }).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Firestore message edit update notice:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    const feedKey = activeCommunityId ? activeChannelId : activeDMId;
    if (!feedKey) return;

    const msg = (allMessages[feedKey] || []).find((m) => m.id === messageId);
    if (!msg) return;

    const isAuthor = msg.authorId === currentUser.id;
    const isCommStaff =
      activeCommunityId &&
      (getCurrentUserRoleInActiveCommunity() === 'owner' ||
        getCurrentUserRoleInActiveCommunity() === 'admin');
    const isGroupOwner =
      activeDMId &&
      dmConversations.find((d) => d.id === activeDMId)?.ownerId === currentUser.id;

    if (!isAuthor && !isCommStaff && !isGroupOwner) {
      showToast('You lack clearance to delete this transmission.', 'warning');
      return;
    }

    // 1. Optimistic update
    setAllMessages((prev) => ({
      ...prev,
      [feedKey]: (prev[feedKey] || []).filter((m) => m.id !== messageId),
    }));
    showToast('Message deleted', 'warning');

    // 2. Persistent Firestore delete
    try {
      if (activeCommunityId && activeChannelId) {
        const msgRef = doc(
          db,
          'communities',
          activeCommunityId,
          'channels',
          activeChannelId,
          'messages',
          messageId
        );
        await deleteDoc(msgRef);
      } else if (activeDMId) {
        const dmMsgRef = doc(db, 'dm_threads', activeDMId, 'messages', messageId);
        await deleteDoc(dmMsgRef).catch(() => {});
        const convMsgRef = doc(db, 'conversations', activeDMId, 'messages', messageId);
        await deleteDoc(convMsgRef).catch(() => {});
      }
    } catch (err: any) {
      console.warn('Firestore message delete notice:', err);
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    const feedKey = activeCommunityId ? activeChannelId : activeDMId;
    if (!feedKey) return;

    let updatedReactions: Reaction[] = [];

    // 1. Optimistic update
    setAllMessages((prev) => ({
      ...prev,
      [feedKey]: (prev[feedKey] || []).map((msg) => {
        if (msg.id !== messageId) return msg;

        const existingReactionIndex = msg.reactions.findIndex((r) => r.emoji === emoji);
        let newReactions = [...msg.reactions];

        if (existingReactionIndex > -1) {
          const current = newReactions[existingReactionIndex];
          const hasUser = current.users.includes(currentUser.id);
          if (hasUser) {
            // Remove reaction
            const newUsers = current.users.filter((u) => u !== currentUser.id);
            if (newUsers.length === 0) {
              newReactions = newReactions.filter((r) => r.emoji !== emoji);
            } else {
              newReactions[existingReactionIndex] = {
                ...current,
                count: newUsers.length,
                users: newUsers,
              };
            }
          } else {
            // Add reaction
            newReactions[existingReactionIndex] = {
              ...current,
              count: current.count + 1,
              users: [...current.users, currentUser.id],
            };
          }
        } else {
          // New reaction emoji
          newReactions.push({
            emoji,
            count: 1,
            users: [currentUser.id],
          });
        }
        updatedReactions = newReactions;
        return { ...msg, reactions: newReactions };
      }),
    }));

    // 2. Persistent Firestore update
    try {
      if (activeCommunityId && activeChannelId) {
        const msgRef = doc(
          db,
          'communities',
          activeCommunityId,
          'channels',
          activeChannelId,
          'messages',
          messageId
        );
        await updateDoc(msgRef, {
          reactions: updatedReactions,
        });
      }
    } catch (err: any) {
      console.warn('Firestore reaction update notice:', err);
    }
  };

  const togglePinMessage = async (messageId: string) => {
    const feedKey = activeCommunityId ? activeChannelId : activeDMId;
    if (!feedKey) return;

    let newPinnedState = false;

    // 1. Optimistic update
    setAllMessages((prev) => ({
      ...prev,
      [feedKey]: (prev[feedKey] || []).map((msg) => {
        if (msg.id !== messageId) return msg;
        newPinnedState = !msg.pinned;
        showToast(newPinnedState ? 'Message pinned to channel' : 'Message unpinned', 'info');
        return { ...msg, pinned: newPinnedState };
      }),
    }));

    // 2. Persistent Firestore update
    try {
      if (activeCommunityId && activeChannelId) {
        const msgRef = doc(
          db,
          'communities',
          activeCommunityId,
          'channels',
          activeChannelId,
          'messages',
          messageId
        );
        await updateDoc(msgRef, {
          pinned: newPinnedState,
        });
      }
    } catch (err: any) {
      console.warn('Firestore pin update notice:', err);
    }
  };

  const createCommunity = (
    name: string,
    tagline: string,
    description: string,
    icon: string,
    isPublic: boolean
  ): string => {
    const newId = 'comm_' + Date.now().toString(36);
    const inviteCode = `NXR-${name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCommunity: Community = {
      id: newId,
      name,
      tagline: tagline || 'CONNECT WITHOUT LIMITS',
      icon: icon || '⚡',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      ownerId: currentUser.id,
      description: description || 'A community space powered by NEXORA.',
      isPublic,
      inviteCode,
      categories: [
        { id: `cat_${newId}_text`, communityId: newId, name: 'TEXT CHANNELS', order: 0 },
        { id: `cat_${newId}_voice`, communityId: newId, name: 'VOICE CHANNELS', order: 1 },
      ],
      channels: [
        {
          id: `chan_${newId}_general`,
          communityId: newId,
          name: 'general',
          topic: `Welcome to the ${name} community!`,
          type: 'text',
          categoryId: `cat_${newId}_text`,
        },
        {
          id: `chan_${newId}_voice`,
          communityId: newId,
          name: 'Voice Lounge',
          topic: 'Open voice room',
          type: 'voice',
          categoryId: `cat_${newId}_voice`,
        },
      ],
      members: [
        {
          userId: currentUser.id,
          user: currentUser,
          role: 'owner',
          joinedAt: 'Today',
        },
      ],
    };

    setCommunities((prev) => [...prev, newCommunity]);

    // Initial welcome message in new channel
    setAllMessages((prev) => ({
      ...prev,
      [`chan_${newId}_general`]: [
        {
          id: 'msg_welcome_' + newId,
          channelId: `chan_${newId}_general`,
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          authorAvatar: currentUser.avatar,
          authorRole: 'owner',
          authorTag: currentUser.tag,
          content: `🎉 Welcome to **${name}**! Invite your team and start building communities without limits.`,
          timestamp: 'Just now',
          reactions: [{ emoji: '🚀', count: 1, users: [currentUser.id] }],
        },
      ],
    }));

    // Add audit log
    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId: newId,
      actorName: currentUser.displayName,
      actorRole: 'owner',
      action: 'community_edit',
      details: `Created community "${name}" with invite code ${inviteCode}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    setActiveCommunityId(newId);
    setActiveChannelId(`chan_${newId}_general`);
    showToast(`Community "${name}" successfully created!`, 'success');
    closeModal();

    try {
      setDoc(doc(db, 'communities', newId), {
        id: newId,
        name,
        tagline: tagline || 'CONNECT WITHOUT LIMITS',
        icon: icon || '⚡',
        banner: newCommunity.banner,
        ownerId: currentUser.id,
        description: description || 'A community space powered by NEXORA.',
        isPublic,
        inviteCode,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    } catch {}

    return newId;
  };

  const updateCommunity = (communityId: string, updates: Partial<Community>) => {
    const role = getCurrentUserRoleInActiveCommunity();
    if (role !== 'owner' && role !== 'admin') {
      showToast('Only Administrators and Owners can update community settings.', 'warning');
      return;
    }

    setCommunities((prev) =>
      prev.map((c) => (c.id === communityId ? { ...c, ...updates } : c))
    );

    try {
      updateDoc(doc(db, 'communities', communityId), updates).catch(() => {});
    } catch {}

    showToast('Community settings updated', 'success');
  };

  const deleteCommunity = (communityId: string) => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    if (comm.ownerId !== currentUser.id) {
      showToast('Only the community Owner can dissolve this space.', 'warning');
      return;
    }

    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    if (activeCommunityId === communityId) {
      const remaining = communities.filter((c) => c.id !== communityId);
      if (remaining.length > 0) {
        setActiveCommunityId(remaining[0].id);
        setActiveChannelId(remaining[0].channels[0]?.id || null);
      } else {
        setActiveCommunityId(null);
        setActiveDMId(dmConversations[0]?.id || null);
      }
    }

    try {
      deleteDoc(doc(db, 'communities', communityId)).catch(() => {});
    } catch {}

    closeModal();
    showToast(`Community "${comm.name}" has been dissolved.`, 'info');
  };

  const leaveCommunity = (communityId: string) => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    if (comm.ownerId === currentUser.id) {
      showToast('Owners cannot leave their own community without transferring ownership.', 'warning');
      return;
    }

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          members: c.members.filter((m) => m.userId !== currentUser.id),
        };
      })
    );

    setActiveCommunityId(null);
    setActiveDMId(dmConversations[0]?.id || null);
    showToast(`You have left ${comm.name}`, 'info');
  };

  const createChannel = (
    communityId: string,
    name: string,
    type: ChannelType,
    topic?: string,
    categoryId?: string,
    isPrivate?: boolean
  ) => {
    const role = getCurrentUserRoleInActiveCommunity();
    if (role !== 'owner' && role !== 'admin') {
      showToast('Only Administrators and Owners can create channels.', 'warning');
      return;
    }

    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!cleanName) return;

    const newChannelId = `chan_${Date.now().toString(36)}`;
    const newChannel: Channel = {
      id: newChannelId,
      communityId,
      name: cleanName,
      type,
      topic: topic || `Discussion channel for #${cleanName}`,
      categoryId,
      isPrivate: !!isPrivate,
      allowedRoles: isPrivate ? ['owner', 'admin', 'moderator'] : undefined,
    };

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return { ...c, channels: [...c.channels, newChannel] };
      })
    );

    // Initial message
    if (type !== 'voice') {
      setAllMessages((prev) => ({
        ...prev,
        [newChannelId]: [
          {
            id: 'msg_start_' + newChannelId,
            channelId: newChannelId,
            authorId: currentUser.id,
            authorName: currentUser.displayName,
            authorAvatar: currentUser.avatar,
            authorRole: getCurrentUserRoleInActiveCommunity(),
            authorTag: currentUser.tag,
            content: `👋 Welcome to the start of the #${cleanName} channel!`,
            timestamp: 'Just now',
            reactions: [{ emoji: '💜', count: 1, users: [currentUser.id] }],
          },
        ],
      }));
    }

    // Add audit log
    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: getCurrentUserRoleInActiveCommunity(),
      action: 'channel_create',
      details: `Created ${type} channel #${cleanName}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    setActiveChannelId(newChannelId);
    showToast(`Channel #${cleanName} created!`, 'success');
    closeModal();
  };

  const deleteChannel = (communityId: string, channelId: string) => {
    const role = getCurrentUserRoleInActiveCommunity();
    if (role !== 'owner' && role !== 'admin') {
      showToast('Only Administrators and Owners can delete channels.', 'warning');
      return;
    }

    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    if (comm.channels.length <= 1) {
      showToast('Communities must retain at least one channel.', 'warning');
      return;
    }

    const channelToDelete = comm.channels.find((ch) => ch.id === channelId);
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          channels: c.channels.filter((ch) => ch.id !== channelId),
        };
      })
    );

    // Switch active channel if we deleted the current one
    if (activeChannelId === channelId) {
      const remaining = comm.channels.filter((ch) => ch.id !== channelId);
      setActiveChannelId(remaining[0]?.id || null);
    }

    // Log action
    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: getCurrentUserRoleInActiveCommunity(),
      action: 'channel_delete',
      details: `Deleted channel #${channelToDelete?.name || channelId}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    showToast(`Channel #${channelToDelete?.name} deleted`, 'info');
  };

  const updateChannel = (communityId: string, channelId: string, updates: Partial<Channel>) => {
    const role = getCurrentUserRoleInActiveCommunity();
    if (role !== 'owner' && role !== 'admin') {
      showToast('Only Administrators and Owners can edit channels.', 'warning');
      return;
    }

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          channels: c.channels.map((ch) => {
            if (ch.id !== channelId) return ch;
            return { ...ch, ...updates };
          }),
        };
      })
    );

    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: role,
      action: 'channel_create',
      details: `Updated channel #${updates.name || channelId}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    try {
      updateDoc(doc(db, 'communities', communityId, 'channels', channelId), updates).catch(() => {});
    } catch {}

    showToast('Channel settings updated', 'success');
  };

  const createChannelCategory = (communityId: string, name: string) => {
    const cleanName = name.trim().toUpperCase();
    if (!cleanName) return;
    const newCatId = 'cat_' + Date.now().toString(36);

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        const newCat: ChannelCategory = {
          id: newCatId,
          communityId,
          name: cleanName,
          order: c.categories.length,
        };
        return { ...c, categories: [...c.categories, newCat] };
      })
    );
    showToast(`Category "${cleanName}" created`, 'success');
  };

  const canUserAccessChannel = (channel: Channel): boolean => {
    if (!channel.isPrivate) return true;
    const role = getCurrentUserRoleInActiveCommunity();
    if (role === 'owner') return true;
    if (channel.allowedRoles && channel.allowedRoles.includes(role)) return true;
    return false;
  };

  // COMMUNITY INVITATION SYSTEM
  const createInvite = (
    communityId: string,
    options: { expiresAt: string; maxUses: number; directUserId?: string }
  ): CommunityInvite => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) throw new Error('Community not found');

    const code = `NXR-${comm.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'C')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const targetUser = options.directUserId ? allUsers[options.directUserId] : undefined;

    const newInvite: CommunityInvite = {
      id: 'inv_' + Date.now(),
      code,
      communityId: comm.id,
      communityName: comm.name,
      communityIcon: comm.icon,
      communityDescription: comm.description,
      memberCount: comm.members.length,
      creatorId: currentUser.id,
      creatorName: currentUser.displayName,
      createdAt: 'Just now',
      expiresAt: options.expiresAt,
      maxUses: options.maxUses,
      usesCount: 0,
      isDirectInvite: !!options.directUserId,
      targetUserId: options.directUserId,
      targetUserName: targetUser?.displayName,
      status: 'pending',
    };

    setCommunityInvites((prev) => [newInvite, ...prev]);

    if (options.directUserId) {
      showToast(`Direct invite sent to ${targetUser?.displayName}!`, 'success');
    } else {
      showToast(`Invite link generated: ${code}`, 'success');
    }

    return newInvite;
  };

  const acceptInvite = (inviteCodeOrId: string): boolean => {
    // Extract code if a full URL or query parameter was provided
    let raw = inviteCodeOrId.trim();
    if (raw.includes('invite=')) {
      raw = raw.split('invite=')[1]?.split('&')[0] || raw;
    } else if (raw.includes('/invite/')) {
      raw = raw.split('/invite/')[1]?.split('?')[0] || raw;
    }
    const cleanSearch = raw.trim().toUpperCase();

    const invite = communityInvites.find(
      (inv) =>
        (inv.code.toUpperCase() === cleanSearch ||
          inv.id === inviteCodeOrId ||
          inv.id === raw ||
          inv.code.toUpperCase().replace('HTTPS://NEXORA.APP/INVITE/', '') === cleanSearch) &&
        inv.status !== 'revoked' &&
        inv.status !== 'declined'
    );

    let targetCommunity: Community | undefined;

    if (invite) {
      // Check max uses limit
      if (invite.maxUses > 0 && invite.usesCount >= invite.maxUses) {
        showToast('This invitation link has reached its maximum usage limit.', 'warning');
        return false;
      }

      // Check expiration
      if (invite.expiresAt && invite.expiresAt !== 'never') {
        const expTime = new Date(invite.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          showToast('This invitation link has expired.', 'warning');
          return false;
        }
      }

      targetCommunity = communities.find((c) => c.id === invite.communityId);
    } else {
      // Also match direct community inviteCode
      targetCommunity = communities.find((c) => c.inviteCode.toUpperCase() === cleanSearch);
    }

    if (!targetCommunity) {
      showToast('Invalid or expired invitation link / code.', 'warning');
      return false;
    }

    // Check if already a member
    const alreadyMember = targetCommunity.members.some((m) => m.userId === currentUser.id);
    if (alreadyMember) {
      showToast(`You are already a member of ${targetCommunity.name}!`, 'info');
      setActiveCommunityId(targetCommunity.id);
      setActiveChannelId(targetCommunity.channels[0]?.id || null);
      closeModal();
      return true;
    }

    // Add user to community
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== targetCommunity!.id) return c;
        return {
          ...c,
          members: [
            ...c.members,
            {
              userId: currentUser.id,
              user: currentUser,
              role: 'member',
              joinedAt: 'Today',
            },
          ],
        };
      })
    );

    // Update invite uses
    if (invite) {
      setCommunityInvites((prev) =>
        prev.map((inv) =>
          inv.id === invite.id ? { ...inv, usesCount: inv.usesCount + 1, status: 'accepted' } : inv
        )
      );
    }

    // Post welcome message in general channel
    const generalChannel = targetCommunity.channels.find((ch) => ch.name.includes('general')) || targetCommunity.channels[0];
    if (generalChannel) {
      setAllMessages((prev) => ({
        ...prev,
        [generalChannel.id]: [
          ...(prev[generalChannel.id] || []),
          {
            id: 'msg_join_' + Date.now(),
            channelId: generalChannel.id,
            authorId: currentUser.id,
            authorName: currentUser.displayName,
            authorAvatar: currentUser.avatar,
            authorRole: 'member',
            authorTag: currentUser.tag,
            content: `👋 Hop in! **${currentUser.displayName}** just joined the community using invite **${invite ? invite.code : targetCommunity!.inviteCode}**. Welcome!`,
            timestamp: 'Just now',
            reactions: [{ emoji: '🎉', count: 2, users: [currentUser.id] }],
          },
        ],
      }));
    }

    playSoundEffect('join');
    showToast(`You have joined ${targetCommunity.name}!`, 'success');
    setActiveCommunityId(targetCommunity.id);
    setActiveChannelId(generalChannel?.id || null);
    closeModal();
    return true;
  };

  const declineInvite = (inviteId: string) => {
    setCommunityInvites((prev) =>
      prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'declined' } : inv))
    );
    showToast('Community invite declined', 'info');
  };

  const revokeInvite = (inviteId: string) => {
    setCommunityInvites((prev) =>
      prev.map((inv) => (inv.id === inviteId ? { ...inv, status: 'revoked' } : inv))
    );
    showToast('Invite code revoked and invalidated', 'info');
  };

  const updateMemberRole = (communityId: string, targetUserId: string, newRole: UserRole) => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    const actorRole = getCurrentUserRoleInActiveCommunity();
    if (actorRole !== 'owner' && actorRole !== 'admin') {
      showToast('Only Administrators and Owners can manage roles.', 'warning');
      return;
    }

    const targetMember = comm.members.find((m) => m.userId === targetUserId);
    const targetCurrentRole = targetMember?.role || 'member';

    // Cannot modify the owner unless you are the owner
    if (targetUserId === comm.ownerId && currentUser.id !== comm.ownerId) {
      showToast('Cannot modify the Community Owner.', 'warning');
      return;
    }

    // Admins cannot demote or promote other admins or owners, and cannot grant owner role
    if (actorRole === 'admin') {
      if (targetCurrentRole === 'admin' || targetCurrentRole === 'owner' || newRole === 'owner') {
        showToast('Administrators cannot modify other Administrators or assign Owner role.', 'warning');
        return;
      }
    }

    const targetUser = allUsers[targetUserId];

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          members: c.members.map((m) =>
            m.userId === targetUserId ? { ...m, role: newRole } : m
          ),
        };
      })
    );

    // If current user updated
    if (targetUserId === currentUser.id) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }

    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: getCurrentUserRoleInActiveCommunity(),
      action: 'role_update',
      details: `Updated role for ${targetUser?.displayName || targetUserId} to ${newRole.toUpperCase()}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    showToast(`Updated role for ${targetUser?.displayName} to ${newRole.toUpperCase()}`, 'success');
  };

  const kickMember = (communityId: string, targetUserId: string, reason?: string) => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    const actorRole = getCurrentUserRoleInActiveCommunity();
    if (actorRole !== 'owner' && actorRole !== 'admin' && actorRole !== 'moderator') {
      showToast('You lack permission to kick members.', 'warning');
      return;
    }
    const targetMember = comm.members.find((m) => m.userId === targetUserId);
    const targetRole = targetMember?.role || 'member';
    const roleHierarchy: Record<UserRole, number> = { owner: 4, admin: 3, moderator: 2, member: 1 };
    if (roleHierarchy[actorRole] <= roleHierarchy[targetRole]) {
      showToast('You cannot kick someone with equal or higher clearance.', 'warning');
      return;
    }

    const targetUser = allUsers[targetUserId];
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          members: c.members.filter((m) => m.userId !== targetUserId),
        };
      })
    );

    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: getCurrentUserRoleInActiveCommunity(),
      action: 'member_kick',
      details: `Kicked ${targetUser?.displayName || targetUserId}. Reason: ${reason || 'Violation of community guidelines'}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    showToast(`Kicked ${targetUser?.displayName || 'member'} from community`, 'warning');
  };

  const banMember = (communityId: string, targetUserId: string, reason?: string) => {
    const comm = communities.find((c) => c.id === communityId);
    if (!comm) return;
    const actorRole = getCurrentUserRoleInActiveCommunity();
    if (actorRole !== 'owner' && actorRole !== 'admin') {
      showToast('Only Administrators and Owners can ban members.', 'warning');
      return;
    }
    const targetMember = comm.members.find((m) => m.userId === targetUserId);
    const targetRole = targetMember?.role || 'member';
    const roleHierarchy: Record<UserRole, number> = { owner: 4, admin: 3, moderator: 2, member: 1 };
    if (roleHierarchy[actorRole] <= roleHierarchy[targetRole]) {
      showToast('You cannot ban someone with equal or higher clearance.', 'warning');
      return;
    }

    const targetUser = allUsers[targetUserId];
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        return {
          ...c,
          members: c.members.filter((m) => m.userId !== targetUserId),
        };
      })
    );

    const auditLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      communityId,
      actorName: currentUser.displayName,
      actorRole: getCurrentUserRoleInActiveCommunity(),
      action: 'member_ban',
      details: `Banned ${targetUser?.displayName || targetUserId}. Reason: ${reason || 'Severe breach of conduct'}`,
      timestamp: 'Just now',
    };
    setAuditLogs((prev) => [auditLog, ...prev]);

    showToast(`Permanently banned ${targetUser?.displayName || 'member'}`, 'warning');
  };

  const connectVoice = async (channelId: string, channelName: string, communityId: string) => {
    playSoundEffect('join');

    // Initialize real WebRTC peer mesh callbacks
    webrtcVoiceService.init({
      onUsersChanged: (users) => {
        setVoiceState((prev) => ({
          ...prev,
          activeUsers: users.map((u) => ({
            userId: u.userId,
            displayName: u.displayName,
            avatar: u.avatar,
            isSpeaking: Boolean(u.isSpeaking),
          })),
        }));
      },
      onSpeakingChanged: (isSpeaking) => {
        setVoiceState((prev) => ({
          ...prev,
          isSpeaking,
          activeUsers: prev.activeUsers.map((u) =>
            u.userId === currentUser.id ? { ...u, isSpeaking } : u
          ),
        }));
      },
      onConnectionStateChanged: (state) => {
        if (state === 'disconnected') {
          setVoiceState((prev) => ({ ...prev, isConnected: false }));
        }
      },
    });

    setVoiceState({
      isConnected: true,
      channelId,
      channelName,
      communityId,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      activeUsers: [
        {
          userId: currentUser.id,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          isSpeaking: false,
        },
      ],
    });

    try {
      await webrtcVoiceService.joinChannel(channelId, {
        id: currentUser.id,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
      });
    } catch (err) {
      console.warn('[WebRTC Voice] joinChannel notice:', err);
    }

    showToast(`Connected to Voice: ${channelName} (WebRTC 48kHz Mesh)`, 'success');
  };

  const disconnectVoice = () => {
    playSoundEffect('leave');
    webrtcVoiceService.leaveChannel();
    setVoiceState({
      isConnected: false,
      channelId: null,
      channelName: null,
      communityId: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      activeUsers: [],
    });
    showToast('Disconnected from voice channel', 'info');
  };

  const toggleVoiceMute = () => {
    setVoiceState((prev) => {
      const nextMute = !prev.isMuted;
      webrtcVoiceService.setMute(nextMute);
      showToast(nextMute ? 'Microphone Muted' : 'Microphone Unmuted', 'info');
      return { ...prev, isMuted: nextMute };
    });
  };

  const toggleVoiceDeafen = () => {
    setVoiceState((prev) => {
      const nextDeafen = !prev.isDeafened;
      webrtcVoiceService.setDeafen(nextDeafen);
      showToast(nextDeafen ? 'Audio Deafen On' : 'Audio Deafen Off', 'info');
      return { ...prev, isDeafened: nextDeafen, isMuted: nextDeafen ? true : prev.isMuted };
    });
  };

  // ==========================================
  // REAL-TIME CALLING & VIDEO MESH LIFECYCLE
  // ==========================================

  // Listen for incoming call notifications
  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = callSignalingService.listenToIncomingCalls(currentUser.id, (call) => {
      setIncomingCall(call);
    });
    return () => unsub();
  }, [currentUser?.id]);

  // Listen for active call status updates
  useEffect(() => {
    if (!activeCall) return;
    const unsub = callSignalingService.listenToCallSession(activeCall.id, (updatedCall) => {
      if (!updatedCall || updatedCall.status === 'ended' || updatedCall.status === 'declined') {
        endActiveCall();
      }
    });
    return () => unsub();
  }, [activeCall?.id]);

  const startCall = async (targetUserId: string, type: CallType) => {
    if (isUserBlocked(targetUserId) || isUserBlockedBy(targetUserId)) {
      showToast('Cannot initiate transmission. Operative is blocked.', 'warning');
      return;
    }

    const targetUser = allUsers[targetUserId] || MOCK_USERS[targetUserId];
    if (!targetUser) return;

    showToast(`Calling ${targetUser.displayName}...`, 'info');
    webrtcVoiceService.startRingtone('outgoing');

    const newCall = await callSignalingService.initiateCall({
      type,
      scope: 'direct',
      targetId: targetUserId,
      targetName: targetUser.displayName,
      callerId: currentUser.id,
      callerName: currentUser.displayName,
      callerAvatar: currentUser.avatar,
      participantIds: [currentUser.id, targetUserId],
    });

    setActiveCall(newCall);

    await webrtcVoiceService.joinChannel(
      newCall.id,
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
      },
      { video: type === 'video' }
    );

    setVoiceState({
      isConnected: true,
      channelId: newCall.id,
      channelName: targetUser.displayName,
      communityId: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      isCameraOn: type === 'video',
      isScreenSharing: false,
      activeUsers: [
        {
          userId: currentUser.id,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          isSpeaking: false,
          isCameraOn: type === 'video',
          isScreenSharing: false,
        },
      ],
    });
  };

  const startGroupCall = async (conversationId: string, type: CallType) => {
    const group = dmConversations.find((d) => d.id === conversationId);
    if (!group) return;

    const participantIds = group.participants.map((p) => p.id);
    const newCall = await callSignalingService.initiateCall({
      type,
      scope: 'group',
      targetId: conversationId,
      targetName: group.name || 'Group Transmission',
      callerId: currentUser.id,
      callerName: currentUser.displayName,
      callerAvatar: currentUser.avatar,
      participantIds,
    });

    setActiveCall(newCall);

    await webrtcVoiceService.joinChannel(
      newCall.id,
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
      },
      { video: type === 'video' }
    );

    setVoiceState({
      isConnected: true,
      channelId: newCall.id,
      channelName: group.name || 'Group Call',
      communityId: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      isCameraOn: type === 'video',
      isScreenSharing: false,
      activeUsers: [
        {
          userId: currentUser.id,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          isSpeaking: false,
          isCameraOn: type === 'video',
          isScreenSharing: false,
        },
      ],
    });
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    webrtcVoiceService.stopRingtone();
    const callToAccept = incomingCall;
    setIncomingCall(null);
    setActiveCall(callToAccept);

    await callSignalingService.acceptCall(callToAccept.id, currentUser.id);

    await webrtcVoiceService.joinChannel(
      callToAccept.id,
      {
        id: currentUser.id,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar,
      },
      { video: callToAccept.type === 'video' }
    );

    setVoiceState({
      isConnected: true,
      channelId: callToAccept.id,
      channelName: callToAccept.callerName,
      communityId: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      isCameraOn: callToAccept.type === 'video',
      isScreenSharing: false,
      activeUsers: [
        {
          userId: currentUser.id,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          isSpeaking: false,
          isCameraOn: callToAccept.type === 'video',
          isScreenSharing: false,
        },
      ],
    });

    showToast(`Connected to ${callToAccept.type} call with ${callToAccept.callerName}`, 'success');
  };

  const declineIncomingCall = async () => {
    if (!incomingCall) return;
    webrtcVoiceService.stopRingtone();
    const callToDecline = incomingCall;
    setIncomingCall(null);
    await callSignalingService.declineCall(callToDecline.id, currentUser.id);
    showToast(`Call from ${callToDecline.callerName} declined`, 'info');
  };

  const endActiveCall = async () => {
    webrtcVoiceService.stopRingtone();
    if (activeCall) {
      await callSignalingService.endCall(activeCall.id);
      setActiveCall(null);
    }
    webrtcVoiceService.leaveChannel();
    setVoiceState({
      isConnected: false,
      channelId: null,
      communityId: null,
      channelName: null,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      isCameraOn: false,
      isScreenSharing: false,
      activeUsers: [],
    });
    showToast('Call ended', 'info');
  };

  const toggleCamera = async () => {
    const isNowOn = await webrtcVoiceService.toggleCamera();
    setVoiceState((prev) => ({
      ...prev,
      isCameraOn: isNowOn,
      activeUsers: prev.activeUsers.map((u) =>
        u.userId === currentUser.id ? { ...u, isCameraOn: isNowOn } : u
      ),
    }));
    showToast(isNowOn ? 'Camera enabled' : 'Camera disabled', 'info');
  };

  const toggleScreenShare = async () => {
    if (voiceState.isScreenSharing) {
      await webrtcVoiceService.stopScreenShare();
      setVoiceState((prev) => ({
        ...prev,
        isScreenSharing: false,
        activeUsers: prev.activeUsers.map((u) =>
          u.userId === currentUser.id ? { ...u, isScreenSharing: false } : u
        ),
      }));
      showToast('Screen sharing stopped', 'info');
    } else {
      const stream = await webrtcVoiceService.startScreenShare();
      if (stream) {
        setVoiceState((prev) => ({
          ...prev,
          isScreenSharing: true,
          activeUsers: prev.activeUsers.map((u) =>
            u.userId === currentUser.id ? { ...u, isScreenSharing: true } : u
          ),
        }));
        showToast('Screen sharing started', 'success');
      }
    }
  };

  // ==========================================
  // MODULE 1 & 5: FRIEND & BLOCKING SYSTEM
  // ==========================================

  const isUserBlocked = (targetUserId: string): boolean => {
    return blockedUsers.some(
      (b) => b.blockerId === currentUser.id && b.blockedId === targetUserId
    );
  };

  const isUserBlockedBy = (targetUserId: string): boolean => {
    return blockedUsers.some(
      (b) => b.blockerId === targetUserId && b.blockedId === currentUser.id
    );
  };

  const sendFriendRequest = (usernameOrTag: string): { success: boolean; message: string } => {
    const raw = usernameOrTag.trim().toLowerCase().replace(/^@/, '');
    if (!raw) {
      return { success: false, message: 'Please enter a username or operative tag.' };
    }

    // Search user in allUsers or MOCK_USERS
    const targetUser = Object.values(allUsers).find((u) => {
      const uName = u.username.toLowerCase();
      const dName = u.displayName.toLowerCase();
      const fullTag = `${u.username}${u.tag}`.toLowerCase();
      return (
        uName === raw ||
        dName === raw ||
        fullTag === raw ||
        u.id.toLowerCase() === raw ||
        u.tag.toLowerCase() === raw
      );
    });

    if (!targetUser) {
      return { success: false, message: 'Operative not found in the Nexora registry.' };
    }

    if (targetUser.id === currentUser.id) {
      return { success: false, message: 'You cannot send a friend request to yourself.' };
    }

    // Check if blocked
    if (isUserBlocked(targetUser.id) || isUserBlockedBy(targetUser.id)) {
      return { success: false, message: 'Cannot send request: operative is blocked.' };
    }

    // Check if already friends
    const alreadyFriends = friends.some((f) => f.userIds.includes(targetUser.id));
    if (alreadyFriends) {
      return { success: false, message: `You are already friends with ${targetUser.displayName}.` };
    }

    // Check if duplicate request
    const existingPending = friendRequests.find(
      (r) =>
        r.status === 'pending' &&
        ((r.senderId === currentUser.id && r.receiverId === targetUser.id) ||
          (r.senderId === targetUser.id && r.receiverId === currentUser.id))
    );

    if (existingPending) {
      if (existingPending.senderId === targetUser.id) {
        // Mutual request -> auto accept
        acceptFriendRequest(existingPending.id);
        return {
          success: true,
          message: `Mutual request! You are now friends with ${targetUser.displayName}.`,
        };
      }
      return { success: false, message: 'A friend request is already pending with this operative.' };
    }

    const newRequestId =
      'freq_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newRequest: FriendRequest = {
      id: newRequestId,
      senderId: currentUser.id,
      sender: currentUser,
      receiverId: targetUser.id,
      receiver: targetUser,
      status: 'pending',
      createdAt: 'Just now',
    };

    setFriendRequests((prev) => [newRequest, ...prev]);

    try {
      setDoc(doc(db, 'friend_requests', newRequestId), {
        id: newRequestId,
        senderId: currentUser.id,
        receiverId: targetUser.id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    } catch {}

    showToast(`Friend request transmitted to ${targetUser.displayName}!`, 'success');
    return { success: true, message: `Friend request sent to ${targetUser.displayName}!` };
  };

  const acceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (!req) return;

    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const otherUser = req.senderId === currentUser.id ? req.receiver : req.sender;
    const friendshipId = 'fr_' + [currentUser.id, otherUser.id].sort().join('_');

    const newFriendship: Friendship = {
      id: friendshipId,
      userIds: [currentUser.id, otherUser.id],
      friend: otherUser,
      createdAt: 'Just now',
      lastInteractionAt: 'Just now',
    };

    setFriends((prev) => {
      if (prev.some((f) => f.userIds.includes(otherUser.id))) return prev;
      return [newFriendship, ...prev];
    });

    try {
      updateDoc(doc(db, 'friend_requests', requestId), { status: 'accepted' }).catch(() => {});
      setDoc(doc(db, 'friendships', friendshipId), {
        id: friendshipId,
        userIds: [currentUser.id, otherUser.id],
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    } catch {}

    showToast(`You and ${otherUser.displayName} are now friends!`, 'success');
  };

  const rejectFriendRequest = (requestId: string) => {
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );
    try {
      updateDoc(doc(db, 'friend_requests', requestId), { status: 'rejected' }).catch(() => {});
    } catch {}
    showToast('Friend request rejected', 'info');
  };

  const cancelFriendRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    try {
      deleteDoc(doc(db, 'friend_requests', requestId)).catch(() => {});
    } catch {}
    showToast('Outgoing friend request canceled', 'info');
  };

  const removeFriend = (friendUserId: string) => {
    const friendObj = friends.find((f) => f.userIds.includes(friendUserId))?.friend;
    setFriends((prev) => prev.filter((f) => !f.userIds.includes(friendUserId)));
    const friendshipId = 'fr_' + [currentUser.id, friendUserId].sort().join('_');
    try {
      deleteDoc(doc(db, 'friendships', friendshipId)).catch(() => {});
    } catch {}
    showToast(`Removed ${friendObj?.displayName || 'operative'} from friends list`, 'info');
  };

  const blockUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) {
      showToast('You cannot block yourself.', 'warning');
      return;
    }
    const targetUser = allUsers[targetUserId] || MOCK_USERS[targetUserId];
    if (!targetUser) return;

    // Remove from friends
    setFriends((prev) => prev.filter((f) => !f.userIds.includes(targetUserId)));
    // Clear friend requests
    setFriendRequests((prev) =>
      prev.filter(
        (r) =>
          !(
            (r.senderId === currentUser.id && r.receiverId === targetUserId) ||
            (r.senderId === targetUserId && r.receiverId === currentUser.id)
          )
      )
    );

    const blockId = 'block_' + currentUser.id + '_' + targetUserId;
    const newBlock: BlockedUser = {
      id: blockId,
      blockerId: currentUser.id,
      blockedId: targetUserId,
      blockedUser: targetUser,
      blockedAt: 'Just now',
    };

    setBlockedUsers((prev) => {
      if (prev.some((b) => b.blockedId === targetUserId)) return prev;
      return [newBlock, ...prev];
    });

    try {
      setDoc(doc(db, 'blocked_users', blockId), {
        id: blockId,
        blockerId: currentUser.id,
        blockedId: targetUserId,
        blockedAt: new Date().toISOString(),
      }).catch(() => {});
    } catch {}

    showToast(`Blocked ${targetUser.displayName}. They can no longer transmit to you.`, 'warning');
  };

  const unblockUser = (targetUserId: string) => {
    const block = blockedUsers.find((b) => b.blockedId === targetUserId);
    setBlockedUsers((prev) => prev.filter((b) => b.blockedId !== targetUserId));
    const blockId = 'block_' + currentUser.id + '_' + targetUserId;
    try {
      deleteDoc(doc(db, 'blocked_users', blockId)).catch(() => {});
    } catch {}
    showToast(`Unblocked ${block?.blockedUser.displayName || 'operative'}`, 'info');
  };

  // ==========================================
  // MODULE 3: GROUP MESSAGING SYSTEM
  // ==========================================

  const createGroupDM = (name: string, participantUserIds: string[], avatar?: string): string => {
    const validUsers = participantUserIds
      .map((id) => allUsers[id] || MOCK_USERS[id])
      .filter((u): u is User => Boolean(u && u.id !== currentUser.id));

    if (validUsers.length === 0) {
      showToast('Select at least one operative to form a group conversation.', 'warning');
      return '';
    }

    const participants = [currentUser, ...validUsers];
    const cleanName =
      name.trim() ||
      `Group: ${participants
        .map((p) => p.displayName.split(' ')[0])
        .slice(0, 3)
        .join(', ')}${participants.length > 3 ? ` +${participants.length - 3}` : ''}`;

    const newGroupId =
      'dm_group_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newGroupDM: DMConversation = {
      id: newGroupId,
      isGroup: true,
      name: cleanName,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      ownerId: currentUser.id,
      participants,
      lastMessage: 'Group conversation initialized',
      lastMessageTime: 'Just now',
      unreadCount: 0,
    };

    setDmConversations((prev) => [newGroupDM, ...prev]);

    // Initial group broadcast message
    const welcomeMsg: Message = {
      id: 'msg_grp_welcome_' + Date.now(),
      dmConversationId: newGroupId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      authorRole: 'owner',
      authorTag: currentUser.tag,
      content: `👥 **${currentUser.displayName}** initialized the group **${cleanName}**. Welcome operatives!`,
      timestamp: 'Just now',
      reactions: [{ emoji: '🎉', count: 1, users: [currentUser.id] }],
      readBy: [currentUser.id],
    };

    setAllMessages((prev) => ({
      ...prev,
      [newGroupId]: [welcomeMsg],
    }));

    setActiveCommunityId(null);
    setActiveChannelId(null);
    setActiveDMId(newGroupId);

    try {
      setDoc(doc(db, 'conversations', newGroupId), {
        id: newGroupId,
        isGroup: true,
        name: cleanName,
        avatar: newGroupDM.avatar,
        ownerId: currentUser.id,
        participantIds: participants.map((p) => p.id),
        createdAt: new Date().toISOString(),
        lastMessage: welcomeMsg.content,
      }).catch(() => {});
    } catch {}

    closeModal();
    showToast(`Group "${cleanName}" created!`, 'success');
    return newGroupId;
  };

  const updateGroupDM = (conversationId: string, updates: { name?: string; avatar?: string }) => {
    const group = dmConversations.find((d) => d.id === conversationId && d.isGroup);
    if (!group) return;

    if (group.ownerId !== currentUser.id) {
      showToast('Only the Group Owner can edit group details.', 'warning');
      return;
    }

    setDmConversations((prev) =>
      prev.map((d) => (d.id === conversationId ? { ...d, ...updates } : d))
    );

    try {
      updateDoc(doc(db, 'conversations', conversationId), updates).catch(() => {});
    } catch {}

    showToast('Group details updated', 'success');
  };

  const addGroupParticipant = (conversationId: string, userId: string) => {
    const group = dmConversations.find((d) => d.id === conversationId && d.isGroup);
    if (!group) return;

    const userToAdd = allUsers[userId] || MOCK_USERS[userId];
    if (!userToAdd) return;

    if (group.participants.some((p) => p.id === userId)) {
      showToast('Operative is already in this group.', 'info');
      return;
    }

    const updatedParticipants = [...group.participants, userToAdd];
    setDmConversations((prev) =>
      prev.map((d) => (d.id === conversationId ? { ...d, participants: updatedParticipants } : d))
    );

    // Announce in chat
    const sysMsg: Message = {
      id: 'msg_sys_' + Date.now(),
      dmConversationId: conversationId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      authorRole: 'member',
      authorTag: currentUser.tag,
      content: `➕ **${userToAdd.displayName}** was added to the group by **${currentUser.displayName}**.`,
      timestamp: 'Just now',
      reactions: [],
      readBy: [currentUser.id],
    };

    setAllMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), sysMsg],
    }));

    try {
      updateDoc(doc(db, 'conversations', conversationId), {
        participantIds: updatedParticipants.map((p) => p.id),
      }).catch(() => {});
    } catch {}

    showToast(`Added ${userToAdd.displayName} to group`, 'success');
  };

  const removeGroupParticipant = (conversationId: string, userId: string) => {
    const group = dmConversations.find((d) => d.id === conversationId && d.isGroup);
    if (!group) return;

    if (group.ownerId !== currentUser.id && userId !== currentUser.id) {
      showToast('Only the Group Owner can remove participants.', 'warning');
      return;
    }

    const userToRemove = group.participants.find((p) => p.id === userId);
    const updatedParticipants = group.participants.filter((p) => p.id !== userId);

    setDmConversations((prev) =>
      prev.map((d) => (d.id === conversationId ? { ...d, participants: updatedParticipants } : d))
    );

    // Announce
    const sysMsg: Message = {
      id: 'msg_sys_' + Date.now(),
      dmConversationId: conversationId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      authorRole: 'member',
      authorTag: currentUser.tag,
      content: `🚪 **${userToRemove?.displayName || 'Operative'}** was removed from the group.`,
      timestamp: 'Just now',
      reactions: [],
      readBy: [currentUser.id],
    };

    setAllMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), sysMsg],
    }));

    try {
      updateDoc(doc(db, 'conversations', conversationId), {
        participantIds: updatedParticipants.map((p) => p.id),
      }).catch(() => {});
    } catch {}

    showToast(`Removed ${userToRemove?.displayName || 'participant'} from group`, 'info');
  };

  const leaveGroupDM = (conversationId: string) => {
    const group = dmConversations.find((d) => d.id === conversationId && d.isGroup);
    if (!group) return;

    const remaining = group.participants.filter((p) => p.id !== currentUser.id);

    if (remaining.length === 0) {
      // Discard conversation
      setDmConversations((prev) => prev.filter((d) => d.id !== conversationId));
    } else {
      // Transfer owner if current user was owner
      const newOwnerId = group.ownerId === currentUser.id ? remaining[0].id : group.ownerId;
      setDmConversations((prev) =>
        prev.map((d) =>
          d.id === conversationId
            ? { ...d, participants: remaining, ownerId: newOwnerId }
            : d
        )
      );
    }

    if (activeDMId === conversationId) {
      setActiveDMId(null);
    }

    showToast('You have left the group conversation', 'info');
  };

  // ==========================================
  // MODULE 4: PRESENCE & TYPING INDICATORS
  // ==========================================

  const setTypingStatus = (conversationId: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const currentList = prev[conversationId] || [];
      if (isTyping) {
        if (!currentList.includes(currentUser.displayName)) {
          return { ...prev, [conversationId]: [...currentList, currentUser.displayName] };
        }
        return prev;
      } else {
        return {
          ...prev,
          [conversationId]: currentList.filter((name) => name !== currentUser.displayName),
        };
      }
    });
  };

  const markConversationAsRead = (conversationId: string) => {
    setDmConversations((prev) =>
      prev.map((d) => (d.id === conversationId ? { ...d, unreadCount: 0 } : d))
    );
    setAllMessages((prev) => {
      const msgs = prev[conversationId] || [];
      if (msgs.length === 0) return prev;
      return {
        ...prev,
        [conversationId]: msgs.map((m) => {
          if (!m.readBy?.includes(currentUser.id)) {
            return { ...m, readBy: [...(m.readBy || []), currentUser.id] };
          }
          return m;
        }),
      };
    });
  };

  // AUTHENTICATION PROTOCOLS (Cloud Firebase Auth + Cryptographic Vault Fallback)
  const loginWithEmail = async (identifier: string, password: string) => {
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      throw new Error('Please enter both your electronic mail or callsign and security key.');
    }

    // 1. Check local cryptographic vault first (handles email, username, and ID)
    const verifiedVaultUser = await verifyVaultCredentials(cleanId, password);
    if (verifiedVaultUser) {
      const onlineProfile: User = { ...verifiedVaultUser, status: 'online' };
      updateVaultUserProfile(onlineProfile.id, { status: 'online' });
      setActiveVaultSession(onlineProfile);
      setVaultUser(onlineProfile);
      setCurrentUser(onlineProfile);
      setAllUsers((prev) => ({ ...prev, [onlineProfile.id]: onlineProfile }));
      showToast(`Welcome back, Operative ${onlineProfile.displayName}! Authenticated via Cryptographic Vault.`, 'success');
      return;
    }

    // If identifier exists in vault but password didn't match:
    if (findVaultAccount(cleanId)) {
      throw new Error('Authentication rejected: Incorrect security key. Please check your password or use Reset.');
    }

    // 2. If it's an email address, try Firebase Cloud Auth
    if (cleanId.includes('@')) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanId, password);
        const fbUser = userCredential.user;
        setAuthUser(fbUser);
        setVaultUser(null);

        const userDocRef = doc(db, 'users', fbUser.uid);
        const docSnap = await getDoc(userDocRef);
        let profile: User;

        if (docSnap.exists()) {
          profile = docSnap.data() as User;
          profile.status = 'online';
          await updateDoc(userDocRef, {
            status: 'online',
            lastSeen: new Date().toISOString(),
          }).catch(() => {});
        } else {
          const cleanUsername = (fbUser.displayName || fbUser.email?.split('@')[0] || 'operative')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '')
            .slice(0, 20) || 'operative';
          const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

          profile = {
            id: fbUser.uid,
            username: cleanUsername,
            displayName: fbUser.displayName || cleanUsername,
            tag,
            avatar: fbUser.photoURL || getRandomCyberAvatar(),
            bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
            status: 'online',
            customStatus: 'Operative active in Nexora',
            bio: 'Nexora operative. Transmitting without limits.',
            email: fbUser.email || cleanId,
            joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            role: 'member',
          };
          await setDoc(userDocRef, profile).catch(() => {});
        }

        setCurrentUser(profile);
        setAllUsers((prev) => ({ ...prev, [profile.id]: profile }));
        showToast(`Welcome back, Operative ${profile.displayName}! Connection re-established.`, 'success');
        return;
      } catch (firebaseErr: any) {
        if (firebaseErr?.code === 'auth/wrong-password') {
          throw new Error('Authentication rejected: Incorrect security key. Please check your password.');
        }
        throw new Error(`Operative account not found for "${cleanId}". Click below to register.`);
      }
    } else {
      throw new Error(`Operative callsign "@${cleanId}" not found. Click below to register.`);
    }
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    username: string,
    avatarUrl?: string
  ) => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'operative';
    const cleanEmail = email.trim().toLowerCase();
    const chosenAvatar = avatarUrl || getRandomCyberAvatar();
    const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const uid = generateOperativeUID();
    const newProfile: User = {
      id: uid,
      username: cleanUsername,
      displayName: username.trim(),
      tag,
      avatar: chosenAvatar,
      bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
      status: 'online',
      customStatus: 'Operative active in Nexora',
      bio: 'Nexora operative. Transmitting without limits.',
      email: cleanEmail,
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      role: 'member',
    };

    // Save in Vault so registration ALWAYS succeeds immediately!
    const passHash = await hashSecurityKey(password);
    saveVaultAccount({ user: newProfile, passwordHash: passHash });

    // Also attempt Firebase registration in the background if possible
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = userCredential.user;
      setAuthUser(fbUser);
      newProfile.id = fbUser.uid;
      await updateProfile(fbUser, { displayName: cleanUsername, photoURL: chosenAvatar }).catch(() => {});
      await setDoc(doc(db, 'users', fbUser.uid), newProfile).catch(() => {});
    } catch {}

    setActiveVaultSession(newProfile);
    setVaultUser(newProfile);
    setCurrentUser(newProfile);
    setAllUsers((prev) => ({ ...prev, [newProfile.id]: newProfile }));
    showToast(`Transmission secure! Welcome to NEXORA, Operative @${cleanUsername}.`, 'success');
  };

  const loginWithGoogle = async (customIdentity?: { email: string; displayName: string; avatar?: string }) => {
    // 1. If customIdentity was provided by the user (from Google Identity Dialog)
    if (customIdentity?.email) {
      const targetEmail = customIdentity.email.trim();
      const cleanUsername = (customIdentity.displayName || targetEmail.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') || 'operative';
      const displayName = customIdentity.displayName.trim() || cleanUsername;
      const avatar = customIdentity.avatar || getRandomCyberAvatar();
      const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

      let profile: User = {
        id: generateOperativeUID(),
        username: cleanUsername,
        displayName,
        tag,
        avatar,
        bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
        status: 'online',
        customStatus: 'Verified Google Operative',
        bio: 'Operative linked via Google Authentication Node.',
        email: targetEmail,
        joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        role: 'member',
      };

      const passHash = await hashSecurityKey('google_auth_' + targetEmail);
      saveVaultAccount({ user: profile, passwordHash: passHash });
      setActiveVaultSession(profile);
      setVaultUser(profile);
      setCurrentUser(profile);
      setAllUsers((prev) => ({ ...prev, [profile.id]: profile }));
      showToast(`Google link verified. Welcome, ${profile.displayName}!`, 'success');
      return;
    }

    // 2. Otherwise, attempt genuine live Firebase Google Popup:
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      setAuthUser(fbUser);
      setVaultUser(null);

      const userDocRef = doc(db, 'users', fbUser.uid);
      const docSnap = await getDoc(userDocRef);
      let profile: User;

      if (docSnap.exists()) {
        profile = docSnap.data() as User;
        profile.status = 'online';
        await updateDoc(userDocRef, {
          status: 'online',
          lastSeen: new Date().toISOString(),
        });
      } else {
        const cleanUsername = (fbUser.displayName || fbUser.email?.split('@')[0] || 'operative')
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '')
          .slice(0, 20) || 'operative';
        const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

        profile = {
          id: fbUser.uid,
          username: cleanUsername,
          displayName: fbUser.displayName || cleanUsername,
          tag,
          avatar: fbUser.photoURL || getRandomCyberAvatar(),
          bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
          status: 'online',
          customStatus: 'Operative active in Nexora',
          bio: 'Nexora operative. Transmitting without limits.',
          email: fbUser.email || '',
          joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          role: 'member',
        };
        await setDoc(userDocRef, profile);
      }

      setCurrentUser(profile);
      setAllUsers((prev) => ({ ...prev, [profile.id]: profile }));
      showToast(`Google link verified. Welcome, ${profile.displayName}!`, 'success');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in popup was closed before completion.');
      }
      // Re-throw so the UI can catch auth/unauthorized-domain and open the customized Google Connection Modal
      throw err;
    }
  };

  const quickDemoLogin = async () => {
    const demo = await getOrCreateDemoAccount();
    const onlineProfile: User = { ...demo, status: 'online' };
    updateVaultUserProfile(onlineProfile.id, { status: 'online' });
    setActiveVaultSession(onlineProfile);
    setVaultUser(onlineProfile);
    setCurrentUser(onlineProfile);
    setAllUsers((prev) => ({ ...prev, [onlineProfile.id]: onlineProfile }));
    showToast(`Instant access granted. Welcome, Operative ${onlineProfile.displayName}!`, 'success');
  };

  const logout = async () => {
    if (currentUser?.id) {
      updateVaultUserProfile(currentUser.id, { status: 'offline' });
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          status: 'offline',
          lastSeen: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Logout status update notice:', e);
      }
    }

    setActiveVaultSession(null);
    setVaultUser(null);
    setAuthUser(null);

    try {
      await firebaseSignOut(auth);
    } catch {}

    localStorage.removeItem(LOCAL_STORAGE_KEY + '_user');
    showToast('Terminal session disconnected securely. Returning to Gateway.', 'info');
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast(`Password recovery link dispatched to ${email}`, 'success');
    } catch (err: any) {
      if (
        err?.code === 'auth/operation-not-allowed' ||
        err?.code === 'auth/admin-restricted-operation' ||
        findVaultAccountByEmail(email.trim())
      ) {
        const ok = await resetVaultAccountPassword(email.trim());
        if (ok) {
          showToast(`Password reset transmission confirmed! Security key reset to default: Nexora2026!`, 'success');
          return;
        } else {
          throw new Error('No operative account found matching this electronic mail address.');
        }
      }
      throw err;
    }
  };

  const updateUserStatus = (status: UserStatus, customStatus?: string) => {
    const updated = { ...currentUser, status, customStatus: customStatus ?? currentUser.customStatus };
    setCurrentUser(updated);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updated }));

    if (currentUser?.id) {
      updateVaultUserProfile(currentUser.id, {
        status,
        ...(customStatus !== undefined ? { customStatus } : {}),
      });

      // Persist to Firestore if cloud authenticated
      if (authUser) {
        const userDocRef = doc(db, 'users', currentUser.id);
        updateDoc(userDocRef, {
          status,
          ...(customStatus !== undefined ? { customStatus } : {}),
          lastSeen: new Date().toISOString(),
        }).catch((err) => console.warn('Firestore status sync notice:', err));
      }
    }

    showToast(`Status updated to ${status.toUpperCase()}`, 'info');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updated }));

    if (currentUser?.id) {
      updateVaultUserProfile(currentUser.id, updates);

      // Persist to Firestore if cloud authenticated
      if (authUser) {
        const userDocRef = doc(db, 'users', currentUser.id);
        setDoc(userDocRef, updates, { merge: true }).catch((err) =>
          console.warn('Firestore profile sync notice:', err)
        );
      }
    }

    showToast('User profile updated successfully', 'success');
  };

  const openModal = (modal: ModalType, payload?: any) => {
    setActiveModal(modal);
    setModalPayload(payload || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  const toggleMemberList = () => setIsMemberListOpen((prev) => !prev);
  const toggleSound = () => {
    setSoundEnabled((prev) => {
      showToast(!prev ? 'Audio FX Enabled' : 'Audio FX Muted', 'info');
      return !prev;
    });
  };

  const toggleChannelMute = (channelId: string) => {
    setChannelMutes((prev) => {
      const isCurrentlyMuted = !!prev[channelId];
      const updated = { ...prev, [channelId]: !isCurrentlyMuted };
      showToast(
        !isCurrentlyMuted ? 'Frequency alerts muted' : 'Frequency alerts active',
        'info'
      );
      return updated;
    });
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const toggleMobileChannel = () => setIsMobileChannelOpen((prev) => !prev);

  return (
    <NexoraContext.Provider
      value={{
        currentUser,
        authUser,
        isAuthenticated,
        isAuthLoading,
        allUsers,
        communities,
        activeCommunity,
        activeCommunityId,
        activeChannel,
        activeChannelId,
        activeDM,
        activeDMId,
        messages,
        dmConversations,
        communityInvites,
        auditLogs,
        voiceState,
        isMemberListOpen,
        replyingTo,
        editingMessageId,
        activeModal,
        modalPayload,
        selectedUserForProfile,
        toast,
        soundEnabled,
        channelMutes,
        toggleChannelMute,
        isMobileSidebarOpen,
        isMobileChannelOpen,
        isFirestoreConnected,
        isCloudSyncing,
        connectionError,

        // Friends, Groups & Blocking
        friends,
        friendRequests,
        blockedUsers,
        friendsTab,
        setFriendsTab,
        typingUsers,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        cancelFriendRequest,
        removeFriend,
        blockUser,
        unblockUser,
        isUserBlocked,
        isUserBlockedBy,
        createGroupDM,
        updateGroupDM,
        addGroupParticipant,
        removeGroupParticipant,
        leaveGroupDM,
        setTypingStatus,
        markConversationAsRead,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        quickDemoLogin,
        logout,
        resetPassword,
        setCurrentUser,
        switchUser,
        setActiveCommunity,
        setActiveChannel,
        setActiveDM,
        openDMWithUser,
        sendMessage,
        editMessage,
        deleteMessage,
        toggleReaction,
        togglePinMessage,
        setReplyingTo,
        setEditingMessageId,
        createCommunity,
        updateCommunity,
        deleteCommunity,
        leaveCommunity,
        createChannel,
        updateChannel,
        deleteChannel,
        createChannelCategory,
        canUserAccessChannel,
        createInvite,
        acceptInvite,
        declineInvite,
        revokeInvite,
        updateMemberRole,
        kickMember,
        banMember,
        connectVoice,
        disconnectVoice,
        toggleVoiceMute,
        toggleVoiceDeafen,
        updateUserStatus,
        updateUserProfile,
        openModal,
        closeModal,
        setSelectedUserForProfile,
        showToast,
        toggleMemberList,
        toggleSound,
        toggleMobileSidebar,
        toggleMobileChannel,
        getCurrentUserRoleInActiveCommunity,

        // Real-Time Calling & Video Mesh
        incomingCall,
        activeCall,
        startCall,
        startGroupCall,
        acceptIncomingCall,
        declineIncomingCall,
        endActiveCall,
        toggleCamera,
        toggleScreenShare,
      }}
    >
      {children}
    </NexoraContext.Provider>
  );
};

export const useNexora = () => {
  const context = useContext(NexoraContext);
  if (!context) {
    throw new Error('useNexora must be used within a NexoraProvider');
  }
  return context;
};
