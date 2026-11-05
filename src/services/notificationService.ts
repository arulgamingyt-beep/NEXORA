import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  NexoraNotification,
  NotificationType,
  NotificationCategory,
  NotificationPreferences,
  User,
} from '../types';

const STORAGE_KEY_PREFIX = 'nexora_notifications_';
const PREFS_KEY_PREFIX = 'nexora_notification_prefs_';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  soundEnabled: true,
  desktopEnabled: false, // Requires explicit user consent
  categories: {
    direct: true,
    mentions: true,
    community: true,
    calls: true,
    system: true,
  },
  mutedCommunities: {},
  mutedConversations: {},
};

export class NotificationService {
  private notificationsCache: Map<string, NexoraNotification[]> = new Map();
  private preferencesCache: Map<string, NotificationPreferences> = new Map();
  private deduplicationFingerprints: Set<string> = new Set();
  private activeListeners: Map<string, Set<(notifications: NexoraNotification[]) => void>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexora_notifications_bus');
      } catch {}
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Storage & Local Persistence
  // ---------------------------------------------------------------------------
  private getStorageKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}`;
  }

  private getPrefsStorageKey(userId: string): string {
    return `${PREFS_KEY_PREFIX}${userId}`;
  }

  public getPreferences(userId: string): NotificationPreferences {
    if (!userId) return { ...DEFAULT_PREFERENCES };

    if (this.preferencesCache.has(userId)) {
      return this.preferencesCache.get(userId)!;
    }

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.getPrefsStorageKey(userId));
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged: NotificationPreferences = {
            ...DEFAULT_PREFERENCES,
            ...parsed,
            categories: {
              ...DEFAULT_PREFERENCES.categories,
              ...(parsed.categories || {}),
            },
            mutedCommunities: parsed.mutedCommunities || {},
            mutedConversations: parsed.mutedConversations || {},
          };
          this.preferencesCache.set(userId, merged);
          return merged;
        }
      } catch (err) {
        console.warn('[NotificationService] Preferences parse notice:', err);
      }
    }

    const defaultPrefs = { ...DEFAULT_PREFERENCES };
    this.preferencesCache.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  public savePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): NotificationPreferences {
    if (!userId) return { ...DEFAULT_PREFERENCES };

    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      categories: {
        ...current.categories,
        ...(updates.categories || {}),
      },
      mutedCommunities: updates.mutedCommunities || current.mutedCommunities,
      mutedConversations: updates.mutedConversations || current.mutedConversations,
    };

    this.preferencesCache.set(userId, updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.getPrefsStorageKey(userId), JSON.stringify(updated));
        this.broadcastChannel?.postMessage({
          type: 'prefs_updated',
          userId,
        });
      } catch {}
    }

    // Attempt cloud persistence in user subcollection
    try {
      setDoc(doc(db, 'users', userId, 'preferences', 'notifications'), updated, { merge: true }).catch(
        () => {}
      );
    } catch {}

    return updated;
  }

  public toggleMuteCommunity(userId: string, communityId: string): boolean {
    const prefs = this.getPreferences(userId);
    const isMuted = Boolean(prefs.mutedCommunities[communityId]);
    const nextMuted = !isMuted;

    const newMutedCommunities = { ...prefs.mutedCommunities };
    if (nextMuted) {
      newMutedCommunities[communityId] = true;
    } else {
      delete newMutedCommunities[communityId];
    }

    this.savePreferences(userId, { mutedCommunities: newMutedCommunities });
    return nextMuted;
  }

  public toggleMuteConversation(userId: string, conversationId: string): boolean {
    const prefs = this.getPreferences(userId);
    const isMuted = Boolean(prefs.mutedConversations[conversationId]);
    const nextMuted = !isMuted;

    const newMutedConversations = { ...prefs.mutedConversations };
    if (nextMuted) {
      newMutedConversations[conversationId] = true;
    } else {
      delete newMutedConversations[conversationId];
    }

    this.savePreferences(userId, { mutedConversations: newMutedConversations });
    return nextMuted;
  }

  // ---------------------------------------------------------------------------
  // 2. Real-Time Listener & Feed Hydration
  // ---------------------------------------------------------------------------
  private loadCachedNotifications(userId: string): NexoraNotification[] {
    if (this.notificationsCache.has(userId)) {
      return this.notificationsCache.get(userId)!;
    }
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(this.getStorageKey(userId));
      if (saved) {
        return JSON.parse(saved) as NexoraNotification[];
      }
    } catch {}
    return [];
  }

  private notifySubscribers(userId: string, list: NexoraNotification[]): void {
    const listeners = this.activeListeners.get(userId);
    if (listeners) {
      listeners.forEach((cb) => {
        try {
          cb(list);
        } catch {}
      });
    }
  }

  private persistCachedNotifications(userId: string, list: NexoraNotification[]): void {
    this.notificationsCache.set(userId, list);
    this.notifySubscribers(userId, list);

    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(list));
      this.broadcastChannel?.postMessage({
        type: 'notifications_updated',
        userId,
        count: list.length,
      });
    } catch {}
  }

  public listenToNotifications(
    userId: string,
    callback: (notifications: NexoraNotification[]) => void
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    if (!this.activeListeners.has(userId)) {
      this.activeListeners.set(userId, new Set());
    }
    this.activeListeners.get(userId)!.add(callback);

    // 1. Initial hydration from cache
    let currentList = this.loadCachedNotifications(userId);
    this.notificationsCache.set(userId, currentList);
    callback(currentList);

    // 2. Cross-tab storage synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === this.getStorageKey(userId)) {
        currentList = this.loadCachedNotifications(userId);
        this.notificationsCache.set(userId, currentList);
        callback(currentList);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'notifications_updated' && e.data?.userId === userId) {
        currentList = this.loadCachedNotifications(userId);
        this.notificationsCache.set(userId, currentList);
        callback(currentList);
      }
    };
    this.broadcastChannel?.addEventListener('message', handleBroadcast);

    // 3. Firestore Real-Time Query (Limited to most recent 50 to avoid excessive reads)
    let unsubscribeFirestore = () => {};
    try {
      const notifQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      unsubscribeFirestore = onSnapshot(
        notifQuery,
        (snapshot) => {
          const remoteList: NexoraNotification[] = [];
          snapshot.forEach((d) => {
            remoteList.push(d.data() as NexoraNotification);
          });

          // Merge remote list with local cache, preserving optimistic read states and deduplication
          const localList = this.loadCachedNotifications(userId);
          const localReadMap = new Map<string, boolean>();
          localList.forEach((n) => {
            if (n.isRead) localReadMap.set(n.id, true);
          });

          const mergedMap = new Map<string, NexoraNotification>();
          remoteList.forEach((n) => {
            const isLocallyRead = localReadMap.get(n.id);
            mergedMap.set(n.id, isLocallyRead ? { ...n, isRead: true } : n);
          });
          localList.forEach((n) => {
            if (!mergedMap.has(n.id)) {
              mergedMap.set(n.id, n);
            }
          });

          const sorted = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.persistCachedNotifications(userId, sorted);
          callback(sorted);
        },
        (error) => {
          console.warn('[NotificationService] Firestore listener notice (using local cache):', error.message);
        }
      );
    } catch (err) {
      console.warn('[NotificationService] Listener initialization notice:', err);
    }

    // 4. Return complete cleanup function
    return () => {
      this.activeListeners.get(userId)?.delete(callback);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      this.broadcastChannel?.removeEventListener('message', handleBroadcast);
      unsubscribeFirestore();
    };
  }

  // ---------------------------------------------------------------------------
  // 3. Notification Dispatch & Deduplication
  // ---------------------------------------------------------------------------
  public async sendNotification(payload: {
    recipientId: string;
    senderId?: string;
    senderName: string;
    senderAvatar?: string;
    type: NotificationType;
    category?: NotificationCategory;
    title: string;
    body: string;
    targetCommunityId?: string;
    targetChannelId?: string;
    targetConversationId?: string;
    targetUserId?: string;
    actionUrl?: string;
    metadata?: Record<string, any>;
  }): Promise<NexoraNotification | null> {
    const { recipientId, type, title, body, senderId } = payload;
    if (!recipientId || !title) return null;

    // Deduplication check: fingerprint generated from recipient, type, target, and body
    const fingerprint = `${recipientId}_${type}_${payload.targetCommunityId || ''}_${payload.targetConversationId || ''}_${body.slice(0, 30)}`;
    if (this.deduplicationFingerprints.has(fingerprint)) {
      return null;
    }
    this.deduplicationFingerprints.add(fingerprint);
    setTimeout(() => {
      this.deduplicationFingerprints.delete(fingerprint);
    }, 30000); // 30-second window to eliminate accidental bursts

    // Determine category automatically if not supplied
    let category: NotificationCategory = payload.category || 'all';
    if (!payload.category) {
      if (type === 'dm_message') category = 'direct';
      else if (type === 'mention') category = 'mentions';
      else if (type === 'call_voice' || type === 'call_video') category = 'calls';
      else if (type === 'announcement' || type === 'community_invite') category = 'community';
      else if (type === 'moderation_action') category = 'system';
      else category = 'direct';
    }

    const notifId =
      'notif_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    const newNotification: NexoraNotification = {
      id: notifId,
      recipientId,
      senderId: senderId || '',
      senderName: payload.senderName || 'NEXORA System',
      senderAvatar: payload.senderAvatar || '',
      type,
      category,
      title: payload.title.trim(),
      body: payload.body.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
      targetCommunityId: payload.targetCommunityId || '',
      targetChannelId: payload.targetChannelId || '',
      targetConversationId: payload.targetConversationId || '',
      targetUserId: payload.targetUserId || '',
      actionUrl: payload.actionUrl || '',
      metadata: payload.metadata || {},
    };

    // 1. Update local cache
    const existing = this.loadCachedNotifications(recipientId);
    const updatedList = [newNotification, ...existing.filter((n) => n.id !== notifId)].slice(0, 100);
    this.persistCachedNotifications(recipientId, updatedList);

    // 2. Evaluate User Preferences for audio & desktop notifications
    const prefs = this.getPreferences(recipientId);
    const isCommunityMuted = payload.targetCommunityId
      ? Boolean(prefs.mutedCommunities[payload.targetCommunityId])
      : false;
    const isConversationMuted = payload.targetConversationId
      ? Boolean(prefs.mutedConversations[payload.targetConversationId])
      : false;

    // Check category preference
    const isCategoryAllowed = prefs.categories[category as keyof typeof prefs.categories] ?? true;

    if (!isCommunityMuted && !isConversationMuted && isCategoryAllowed) {
      if (prefs.soundEnabled) {
        this.triggerNotificationSound(type);
      }
      if (prefs.desktopEnabled) {
        this.triggerBrowserNotification(newNotification, prefs);
      }
    }

    // 3. Write to Cloud Firestore
    try {
      await setDoc(doc(db, 'notifications', notifId), newNotification);
    } catch (err: any) {
      console.warn('[NotificationService] Cloud persistence notice:', err.message);
    }

    return newNotification;
  }

  // ---------------------------------------------------------------------------
  // 4. Read States & Deletion
  // ---------------------------------------------------------------------------
  public async markAsRead(userId: string, notificationId: string): Promise<void> {
    const list = this.loadCachedNotifications(userId);
    const updated = list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
    this.persistCachedNotifications(userId, updated);

    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch {}
  }

  public async markAllAsRead(userId: string): Promise<void> {
    const list = this.loadCachedNotifications(userId);
    const updated = list.map((n) => ({ ...n, isRead: true }));
    this.persistCachedNotifications(userId, updated);

    // Async batch update to cloud
    list.filter((n) => !n.isRead).forEach((n) => {
      updateDoc(doc(db, 'notifications', n.id), { isRead: true }).catch(() => {});
    });
  }

  public async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const list = this.loadCachedNotifications(userId);
    const updated = list.filter((n) => n.id !== notificationId);
    this.persistCachedNotifications(userId, updated);

    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch {}
  }

  public async clearAllNotifications(userId: string): Promise<void> {
    const list = this.loadCachedNotifications(userId);
    this.persistCachedNotifications(userId, []);

    list.forEach((n) => {
      deleteDoc(doc(db, 'notifications', n.id),).catch(() => {});
    });
  }

  // ---------------------------------------------------------------------------
  // 5. Sound & Web Audio Synthesis
  // ---------------------------------------------------------------------------
  public triggerNotificationSound(type: NotificationType): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.08, now);

      if (type === 'dm_message') {
        // High harmonic double-chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'mention') {
        // High alert ping
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.08); // A5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'call_voice' || type === 'call_video') {
        // Ring pulse
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(480, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'moderation_action') {
        // Warning note
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        // Default clean pulse
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // AudioContext policy restrictions before user interaction
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Desktop & Browser Notifications
  // ---------------------------------------------------------------------------
  public async requestBrowserPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch {
      return 'denied';
    }
  }

  public getBrowserPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public triggerBrowserNotification(
    notification: NexoraNotification,
    prefs: NotificationPreferences
  ): void {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted' ||
      !prefs.desktopEnabled
    ) {
      return;
    }

    try {
      const n = new Notification(notification.title, {
        body: notification.body,
        icon: notification.senderAvatar || '/favicon.ico',
        tag: notification.id,
        silent: true, // Audio handled by internal Web Audio synth
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (err) {
      console.warn('[NotificationService] Desktop notification dispatch notice:', err);
    }
  }
}

export const notificationService = new NotificationService();
