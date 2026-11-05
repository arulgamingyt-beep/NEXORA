import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { BetaApplication, BetaAccessStatus, User } from '../types';
import { getAllVaultAccounts, updateVaultUserProfile, findVaultAccount } from '../utils/authVault';

const LOCAL_STORAGE_KEY = 'nexora_beta_applications_v1';

export class BetaAccessService {
  private localCache: Map<string, BetaApplication> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.hydrateFromStorage();
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('nexora_beta_access_bus');
      } catch {}
    }
  }

  private hydrateFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BetaApplication[];
        parsed.forEach((app) => this.localCache.set(app.id, app));
      }
    } catch (err) {
      console.warn('[BetaAccess] Failed to hydrate local cache:', err);
    }
  }

  private persistToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.localCache.values());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      this.broadcastChannel?.postMessage({ type: 'applications_updated', count: list.length });
    } catch (err) {
      console.warn('[BetaAccess] Failed to persist applications:', err);
    }
  }

  /**
   * Validates beta application data before creation
   */
  public validateApplication(data: {
    email: string;
    displayName: string;
    username: string;
  }): { valid: boolean; error?: string } {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length < 5) {
      return { valid: false, error: 'Please enter a valid electronic mail address format.' };
    }

    const cleanName = (data.displayName || '').trim();
    if (cleanName.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters long.' };
    }

    const cleanUsername = (data.username || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return { valid: false, error: 'Operative callsign must contain at least 3 characters.' };
    }

    return { valid: true };
  }

  /**
   * Check if an applicant or account with this email/username already exists
   */
  public isDuplicateAccount(email: string, username?: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    // 1. Check in local cryptographic vault
    const inVault = findVaultAccount(cleanEmail);
    if (inVault) return true;

    // 2. Check in existing applications cache
    for (const app of this.localCache.values()) {
      if (app.email.toLowerCase() === cleanEmail) return true;
      if (username && app.username.toLowerCase() === username.trim().toLowerCase()) return true;
    }

    return false;
  }

  /**
   * Submit a new Beta Application.
   * STRICT SECURITY: New applications are ALWAYS created with status = 'pending'.
   * Self-approval is strictly forbidden and rejected.
   */
  public async submitApplication(applicantData: {
    userId: string;
    email: string;
    displayName: string;
    username: string;
    experience?: string;
    devices?: string[];
    status?: string; // If user attempts to inject status: 'approved', it will be rejected
  }): Promise<BetaApplication> {
    // 1. Enforce backend security: NEVER allow users to approve themselves!
    if (applicantData.status && applicantData.status !== 'pending') {
      throw new Error('Access Denied: Self-approval is strictly prohibited. Applications must be reviewed by an authorized administrator.');
    }

    // 2. Validate input fields
    const validation = this.validateApplication({
      email: applicantData.email,
      displayName: applicantData.displayName,
      username: applicantData.username,
    });
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 3. Prevent duplicate applications
    const cleanEmail = applicantData.email.trim().toLowerCase();
    const effectiveUserId =
      applicantData.userId ||
      'usr_beta_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    for (const app of this.localCache.values()) {
      if (app.email.toLowerCase() === cleanEmail && app.userId !== effectiveUserId) {
        throw new Error('A beta application with this electronic mail address already exists.');
      }
    }

    const newApp: BetaApplication = {
      id: effectiveUserId,
      userId: effectiveUserId,
      email: cleanEmail,
      displayName: applicantData.displayName.trim(),
      username: applicantData.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      status: 'pending', // ALWAYS pending on initial submission
      appliedAt: new Date().toISOString(),
      experience: applicantData.experience || 'General Beta Tester',
      devices: applicantData.devices || ['Desktop Web'],
    };

    // 4. Save to local cache
    this.localCache.set(newApp.id, newApp);
    this.persistToStorage();

    // 5. Attempt Cloud Firestore persistence
    try {
      await setDoc(doc(db, 'beta_applications', newApp.id), newApp);
    } catch (err) {
      console.warn('[BetaAccess] Firestore write notice (saved in local sandbox):', err);
    }

    return newApp;
  }

  /**
   * Retrieve a specific user's application
   */
  public async getApplication(userId: string): Promise<BetaApplication | null> {
    if (this.localCache.has(userId)) {
      return this.localCache.get(userId)!;
    }

    try {
      const snap = await getDoc(doc(db, 'beta_applications', userId));
      if (snap.exists()) {
        const app = snap.data() as BetaApplication;
        this.localCache.set(app.id, app);
        this.persistToStorage();
        return app;
      }
    } catch {}

    return null;
  }

  /**
   * Listen to real-time status updates for a specific applicant
   */
  public listenToApplication(
    userId: string,
    callback: (app: BetaApplication | null) => void
  ): () => void {
    // Initial emission from local cache
    callback(this.localCache.get(userId) || null);

    // Storage event listener for cross-tab updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        this.hydrateFromStorage();
        callback(this.localCache.get(userId) || null);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    // Broadcast channel listener
    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'applications_updated') {
        this.hydrateFromStorage();
        callback(this.localCache.get(userId) || null);
      }
    };
    this.broadcastChannel?.addEventListener('message', handleBroadcast);

    // Cloud Firestore real-time snapshot
    let unsubFirestore: () => void = () => {};
    try {
      unsubFirestore = onSnapshot(
        doc(db, 'beta_applications', userId),
        (snap) => {
          if (snap.exists()) {
            const data = snap.data() as BetaApplication;
            this.localCache.set(data.id, data);
            this.persistToStorage();
            callback(data);
          }
        },
        () => {}
      );
    } catch {}

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      this.broadcastChannel?.removeEventListener('message', handleBroadcast);
      unsubFirestore();
    };
  }

  /**
   * List all beta applications (Administrator clearance verified)
   */
  public async listAllApplications(adminUser: User): Promise<BetaApplication[]> {
    const isAdmin =
      adminUser.role === 'admin' ||
      adminUser.role === 'owner' ||
      adminUser.email === 'admin@nexora.io';

    if (!isAdmin) {
      throw new Error('Access Denied: Security clearance restriction. Administrator authority required.');
    }

    try {
      const snap = await getDocs(collection(db, 'beta_applications'));
      snap.forEach((d) => {
        const app = d.data() as BetaApplication;
        this.localCache.set(app.id, app);
      });
      this.persistToStorage();
    } catch {}

    return Array.from(this.localCache.values()).sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  }

  /**
   * Listen to all applications (Admin view)
   */
  public listenToAllApplications(
    adminUser: User,
    callback: (apps: BetaApplication[]) => void
  ): () => void {
    const isAdmin =
      adminUser.role === 'admin' ||
      adminUser.role === 'owner' ||
      adminUser.email === 'admin@nexora.io';

    if (!isAdmin) {
      callback([]);
      return () => {};
    }

    const emit = () => {
      const list = Array.from(this.localCache.values()).sort(
        (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );
      callback(list);
    };

    emit();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        this.hydrateFromStorage();
        emit();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'applications_updated') {
        this.hydrateFromStorage();
        emit();
      }
    };
    this.broadcastChannel?.addEventListener('message', handleBroadcast);

    let unsubFirestore: () => void = () => {};
    try {
      unsubFirestore = onSnapshot(
        collection(db, 'beta_applications'),
        (snap) => {
          snap.forEach((d) => {
            const app = d.data() as BetaApplication;
            this.localCache.set(app.id, app);
          });
          this.persistToStorage();
          emit();
        },
        () => {}
      );
    } catch {}

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      this.broadcastChannel?.removeEventListener('message', handleBroadcast);
      unsubFirestore();
    };
  }

  /**
   * Review application: Approve or Reject (Administrator Only)
   */
  public async reviewApplication(
    adminUser: User,
    applicantId: string,
    newStatus: 'approved' | 'rejected',
    notes?: string
  ): Promise<BetaApplication> {
    const isAdmin =
      adminUser.role === 'admin' ||
      adminUser.role === 'owner' ||
      adminUser.email === 'admin@nexora.io';

    if (!isAdmin) {
      throw new Error('Access Denied: Only authorized administrators can approve or reject beta applicants.');
    }

    let existing = this.localCache.get(applicantId);
    if (!existing) {
      const fromCloud = await this.getApplication(applicantId);
      if (!fromCloud) {
        throw new Error(`Application with ID ${applicantId} not found.`);
      }
      existing = fromCloud;
    }

    const updated: BetaApplication = {
      ...existing,
      status: newStatus,
      reviewedAt: new Date().toISOString(),
      reviewedBy: adminUser.id,
      adminNotes: notes !== undefined ? notes : existing.adminNotes,
    };

    // Update in local cache
    this.localCache.set(applicantId, updated);
    this.persistToStorage();

    // Update in local Vault user profile
    updateVaultUserProfile(applicantId, { betaStatus: newStatus });

    // Update in Cloud Firestore
    try {
      await updateDoc(doc(db, 'beta_applications', applicantId), {
        status: newStatus,
        reviewedAt: updated.reviewedAt,
        reviewedBy: updated.reviewedBy,
        adminNotes: updated.adminNotes || '',
      });
      // Also update user profile in Firestore
      await updateDoc(doc(db, 'users', applicantId), {
        betaStatus: newStatus,
      }).catch(() => {});
    } catch (err) {
      console.warn('[BetaAccess] Cloud review update notice:', err);
    }

    return updated;
  }
}

export const betaAccessService = new BetaAccessService();

