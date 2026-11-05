import { User } from '../types';
import { getRandomCyberAvatar } from './avatars';

const VAULT_STORAGE_KEY = 'nexora_auth_vault_users_v1';
const ACTIVE_SESSION_KEY = 'nexora_active_session_v1';

export interface VaultAccount {
  user: User;
  passwordHash: string;
}

/**
 * Hash password securely using standard browser Web Crypto API (SHA-256)
 * Never stores plaintext passwords.
 */
export async function hashSecurityKey(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_nexora_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a Discord-compatible 18-digit numeric snowflake UID for operatives.
 * Uses 64-bit BigInt: (timestamp - epoch) << 22 | cryptoRandom22Bits.
 * Guaranteed to be strictly numbers (0-9) with a minimum of 10 digits (18 digits standard).
 */
export function generateOperativeUID(): string {
  const customEpoch = 1704067200000; // Jan 1, 2024 00:00:00 UTC
  const timestampPart = BigInt(Date.now() - customEpoch);
  const randomBytes = new Uint8Array(4);
  crypto.getRandomValues(randomBytes);
  const randomPart = BigInt(
    ((randomBytes[0] << 24) | (randomBytes[1] << 16) | (randomBytes[2] << 8) | randomBytes[3]) >>> 10
  );
  const snowflake = (timestampPart << 22n) | randomPart;
  return snowflake.toString();
}

/**
 * Ensures any user ID is displayed and copied as a strictly numeric string of at least 10 digits (18-digit snowflake standard).
 * Deterministically converts legacy alphanumeric IDs (e.g. 'nxr_47caa73a03f50a0f0e3402de' or 'user_alex')
 * to consistent 18-digit numeric IDs.
 */
export function toNumericUID(rawId?: string | null): string {
  if (!rawId) return '100000000000000000';
  
  // If already purely numeric and at least 10 digits, return directly
  if (/^\d{10,}$/.test(rawId)) {
    return rawId;
  }
  
  // Deterministic 64-bit integer hash for alphanumeric / legacy IDs
  let hash = 0n;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash * 31n + BigInt(rawId.charCodeAt(i))) % 1000000000000000000n;
  }
  
  // Map into guaranteed 18-digit range [100000000000000000, 999999999999999999]
  const base = 100000000000000000n;
  const range = 899999999999999999n;
  return (base + (hash % range)).toString();
}

export function getAllVaultAccounts(): Record<string, VaultAccount> {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveVaultAccount(account: VaultAccount): void {
  try {
    const all = getAllVaultAccounts();
    const emailKey = account.user.email?.trim().toLowerCase();
    const usernameKey = account.user.username?.trim().toLowerCase().replace(/^@/, '');
    const numUid = toNumericUID(account.user.id);
    
    if (emailKey) all[emailKey] = account;
    if (usernameKey) all[usernameKey] = account;
    all[account.user.id] = account;
    if (numUid) all[numUid] = account;
    
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('Vault storage write warning:', err);
  }
}

/**
 * Searches vault by email, username (callsign), display name, user ID, or numeric UID
 */
export function findVaultAccount(identifier: string): VaultAccount | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase().replace(/^@/, '');
  const all = getAllVaultAccounts();

  // 1. Direct key match (email, username, or UID)
  if (all[clean]) return all[clean];

  // 2. Iterate and match any user property
  for (const key of Object.keys(all)) {
    const acc = all[key];
    if (acc?.user) {
      if (acc.user.email?.trim().toLowerCase() === clean) return acc;
      if (acc.user.username?.trim().toLowerCase().replace(/^@/, '') === clean) return acc;
      if (acc.user.displayName?.trim().toLowerCase() === clean) return acc;
      if (acc.user.id?.trim().toLowerCase() === clean) return acc;
      if (toNumericUID(acc.user.id) === clean) return acc;
    }
  }
  return null;
}

export function findVaultAccountByEmail(email: string): VaultAccount | null {
  return findVaultAccount(email);
}

export function findVaultAccountById(userId: string): VaultAccount | null {
  const all = getAllVaultAccounts();
  for (const key of Object.keys(all)) {
    if (all[key]?.user?.id === userId) {
      return all[key];
    }
  }
  return null;
}

export async function verifyVaultCredentials(
  identifier: string,
  password: string
): Promise<User | null> {
  const account = findVaultAccount(identifier);
  if (!account) return null;

  const inputHash = await hashSecurityKey(password);
  if (inputHash === account.passwordHash) {
    return account.user;
  }
  return null;
}

export function updateVaultUserProfile(userId: string, updates: Partial<User>): User | null {
  const all = getAllVaultAccounts();
  for (const key of Object.keys(all)) {
    if (all[key].user.id === userId) {
      all[key].user = { ...all[key].user, ...updates };
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(all));

      // Also update active session if it's the current user
      const active = getActiveVaultSession();
      if (active && active.id === userId) {
        setActiveVaultSession(all[key].user);
      }

      return all[key].user;
    }
  }
  return null;
}

export function getActiveVaultSession(): User | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveVaultSession(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (err) {
    console.warn('Active session write warning:', err);
  }
}

export async function resetVaultAccountPassword(
  email: string,
  newPassword?: string
): Promise<boolean> {
  const account = findVaultAccountByEmail(email);
  if (!account) return false;

  const pass = newPassword || 'Nexora2026!';
  account.passwordHash = await hashSecurityKey(pass);
  saveVaultAccount(account);
  return true;
}

/**
 * Prepares or retrieves a ready-to-test Demo Operative account
 */
export async function getOrCreateDemoAccount(): Promise<User> {
  const demoEmail = 'demo_operative@nexora.tech';
  let account = findVaultAccountByEmail(demoEmail);
  if (!account) {
    const demoUser: User = {
      id: 'nxr_demo_operative_01',
      username: 'cypher_prime',
      displayName: 'Cypher Prime',
      tag: '#7701',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=256&h=256&fit=crop&crop=faces',
      bannerColor: 'from-violet-800 via-purple-900 to-indigo-950',
      status: 'online',
      customStatus: 'Quantum Gateway Operative',
      bio: 'High-clearance security architect for NEXORA Grid.',
      email: demoEmail,
      joinedAt: 'Nov 2026',
      role: 'admin',
    };
    const passwordHash = await hashSecurityKey('Nexora2026!');
    account = { user: demoUser, passwordHash };
    saveVaultAccount(account);
  }
  return account.user;
}

