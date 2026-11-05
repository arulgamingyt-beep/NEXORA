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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  BetaFeedbackItem,
  BetaFeedbackCategory,
  BetaFeedbackSeverity,
  BetaFeedbackStatus,
} from '../types';

export const VALID_CATEGORIES: BetaFeedbackCategory[] = [
  'voice_video',
  'messaging',
  'communities',
  'auth',
  'performance',
  'ui_ux',
  'other',
];

export const VALID_SEVERITIES: BetaFeedbackSeverity[] = ['low', 'medium', 'high', 'critical'];

export const VALID_STATUSES: BetaFeedbackStatus[] = [
  'new',
  'reviewing',
  'in_progress',
  'fixed',
  'closed',
];

// Maximum allowed screenshot size (2MB in bytes)
export const MAX_SCREENSHOT_BYTES = 2 * 1024 * 1024; // 2,097,152 bytes

const LOCAL_STORAGE_KEY = 'nexora_beta_feedback_cache_v1';

export class BetaFeedbackService {
  private localCache: Map<string, BetaFeedbackItem> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.hydrateFromStorage();
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexora_beta_feedback_bus');
      } catch {}
    }
  }

  private hydrateFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BetaFeedbackItem[];
        parsed.forEach((item) => this.localCache.set(item.id, item));
      }
    } catch (err) {
      console.warn('[BetaFeedback] Failed to hydrate local cache:', err);
    }
  }

  private persistToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.localCache.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      this.broadcastChannel?.postMessage({ type: 'feedback_updated', count: list.length });
    } catch (err) {
      console.warn('[BetaFeedback] Failed to persist to storage:', err);
    }
  }

  /**
   * Validate all submitted feedback fields according to strict specification
   */
  public validateSubmission(data: {
    title: string;
    description: string;
    category: string;
    severity: string;
    browserAndDevice: string;
    screenshot?: string;
  }): { valid: boolean; error?: string } {
    const trimmedTitle = data.title?.trim() || '';
    if (trimmedTitle.length < 3) {
      return { valid: false, error: 'Issue title must be at least 3 characters long.' };
    }
    if (trimmedTitle.length > 100) {
      return { valid: false, error: 'Issue title cannot exceed 100 characters.' };
    }

    const trimmedDesc = data.description?.trim() || '';
    if (trimmedDesc.length < 10) {
      return { valid: false, error: 'Issue description must be at least 10 characters long.' };
    }
    if (trimmedDesc.length > 2000) {
      return { valid: false, error: 'Issue description cannot exceed 2000 characters.' };
    }

    if (!VALID_CATEGORIES.includes(data.category as BetaFeedbackCategory)) {
      return {
        valid: false,
        error: `Invalid category: "${data.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      };
    }

    if (!VALID_SEVERITIES.includes(data.severity as BetaFeedbackSeverity)) {
      return {
        valid: false,
        error: `Invalid severity: "${data.severity}". Must be one of: ${VALID_SEVERITIES.join(', ')}`,
      };
    }

    const trimmedDevice = data.browserAndDevice?.trim() || '';
    if (trimmedDevice.length < 3) {
      return { valid: false, error: 'Browser and device diagnostics must be specified.' };
    }
    if (trimmedDevice.length > 200) {
      return { valid: false, error: 'Browser and device text cannot exceed 200 characters.' };
    }

    if (data.screenshot) {
      // Calculate byte length of base64 data URL
      const byteSize = Math.round((data.screenshot.length * 3) / 4);
      if (byteSize > MAX_SCREENSHOT_BYTES) {
        const sizeMb = (byteSize / (1024 * 1024)).toFixed(2);
        return {
          valid: false,
          error: `Screenshot file size (${sizeMb} MB) exceeds maximum allowed limit of 2.00 MB.`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Submits a new beta tester bug report or feedback item
   */
  public async submitFeedback(payload: {
    title: string;
    description: string;
    category: BetaFeedbackCategory;
    severity: BetaFeedbackSeverity;
    browserAndDevice: string;
    screenshot?: string;
    testerId: string;
    testerName: string;
    testerTag?: string;
    testerAvatar?: string;
  }): Promise<BetaFeedbackItem> {
    const validation = this.validateSubmission(payload);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newItem: BetaFeedbackItem = {
      id: feedbackId,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category,
      severity: payload.severity,
      browserAndDevice: payload.browserAndDevice.trim(),
      screenshot: payload.screenshot,
      testerId: payload.testerId,
      testerName: payload.testerName,
      testerTag: payload.testerTag || '',
      testerAvatar: payload.testerAvatar || '',
      status: 'new',
      createdAt: nowIso,
    };

    // 1. Store in local cache for immediate feedback
    this.localCache.set(feedbackId, newItem);
    this.persistToStorage();

    // 2. Synchronize to Firestore
    try {
      const firestorePayload: Record<string, any> = {
        id: newItem.id,
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        severity: newItem.severity,
        browserAndDevice: newItem.browserAndDevice,
        testerId: newItem.testerId,
        testerName: newItem.testerName,
        testerTag: newItem.testerTag || '',
        testerAvatar: newItem.testerAvatar || '',
        status: newItem.status,
        createdAt: newItem.createdAt,
        serverCreatedAt: serverTimestamp(),
      };
      if (newItem.screenshot) {
        firestorePayload.screenshot = newItem.screenshot;
      }

      await setDoc(doc(db, 'beta_feedback', feedbackId), firestorePayload);
    } catch (err) {
      console.warn('[BetaFeedback] Firestore sync notice (saved to local sandbox cache):', err);
    }

    return newItem;
  }

  /**
   * Retrieves feedback items. Ordinary testers see only their own; Admins see all.
   */
  public async getFeedbackList(
    userId: string,
    isAdmin: boolean = false
  ): Promise<BetaFeedbackItem[]> {
    this.hydrateFromStorage();
    const localItems = Array.from(this.localCache.values());

    try {
      const q = isAdmin
        ? query(collection(db, 'beta_feedback'), orderBy('createdAt', 'desc'))
        : query(
            collection(db, 'beta_feedback'),
            where('testerId', '==', userId),
            orderBy('createdAt', 'desc')
          );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const cloudItems: BetaFeedbackItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as BetaFeedbackItem;
          cloudItems.push(item);
          this.localCache.set(item.id, item);
        });
        this.persistToStorage();
        return cloudItems;
      }
    } catch (err) {
      // Gracefully fall back to local cache if network/offline
    }

    // Filter local cache according to role clearance
    const filtered = isAdmin
      ? localItems
      : localItems.filter((i) => i.testerId === userId);

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Realtime listener for feedback items with role-based filtering
   */
  public listenToFeedback(
    userId: string,
    isAdmin: boolean,
    callback: (items: BetaFeedbackItem[]) => void
  ): () => void {
    let unsubFirestore: (() => void) | null = null;

    try {
      const q = isAdmin
        ? collection(db, 'beta_feedback')
        : query(collection(db, 'beta_feedback'), where('testerId', '==', userId));

      unsubFirestore = onSnapshot(
        q,
        (snapshot) => {
          const items: BetaFeedbackItem[] = [];
          snapshot.forEach((d) => {
            const item = d.data() as BetaFeedbackItem;
            items.push(item);
            this.localCache.set(item.id, item);
          });
          this.persistToStorage();
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(items);
        },
        (err) => {
          // If firestore permission or index error occurs, use local cache
          const fallback = this.getFilteredLocalItems(userId, isAdmin);
          callback(fallback);
        }
      );
    } catch (err) {
      const fallback = this.getFilteredLocalItems(userId, isAdmin);
      callback(fallback);
    }

    return () => {
      if (unsubFirestore) {
        unsubFirestore();
      }
    };
  }

  /**
   * Helper to return locally cached items by role
   */
  public getFilteredLocalItems(userId: string, isAdmin: boolean): BetaFeedbackItem[] {
    this.hydrateFromStorage();
    const items = Array.from(this.localCache.values());
    const filtered = isAdmin ? items : items.filter((i) => i.testerId === userId);
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Updates feedback status and optional resolution notes (ADMIN ONLY)
   */
  public async updateFeedbackStatus(
    feedbackId: string,
    newStatus: BetaFeedbackStatus,
    adminNotes?: string,
    isAdmin: boolean = false
  ): Promise<BetaFeedbackItem> {
    if (!isAdmin) {
      throw new Error('UNAUTHORIZED: Administrator clearance is required to modify feedback status.');
    }

    if (!VALID_STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: "${newStatus}". Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const item = this.localCache.get(feedbackId);
    if (!item) {
      throw new Error(`Feedback report "${feedbackId}" not found.`);
    }

    const nowIso = new Date().toISOString();
    const updated: BetaFeedbackItem = {
      ...item,
      status: newStatus,
      adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
      updatedAt: nowIso,
    };

    this.localCache.set(feedbackId, updated);
    this.persistToStorage();

    try {
      await updateDoc(doc(db, 'beta_feedback', feedbackId), {
        status: newStatus,
        adminNotes: updated.adminNotes || '',
        updatedAt: nowIso,
      });
    } catch (err) {
      console.warn('[BetaFeedback] Firestore update warning:', err);
    }

    return updated;
  }

  /**
   * Deletes a feedback item (ADMIN ONLY)
   */
  public async deleteFeedback(feedbackId: string, isAdmin: boolean = false): Promise<void> {
    if (!isAdmin) {
      throw new Error('UNAUTHORIZED: Administrator clearance is required to delete feedback reports.');
    }

    this.localCache.delete(feedbackId);
    this.persistToStorage();

    try {
      await deleteDoc(doc(db, 'beta_feedback', feedbackId));
    } catch (err) {
      console.warn('[BetaFeedback] Firestore delete notice:', err);
    }
  }

  /**
   * Resets the feedback service cache (used during testing)
   */
  public clearCache() {
    this.localCache.clear();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {}
    }
  }
}

export const betaFeedbackService = new BetaFeedbackService();
