# NEXORA — Complete User Authentication & Identity System

Deliver a production-grade, secure authentication and user profile management system for NEXORA, powered by Firebase Authentication and Cloud Firestore, adhering strictly to the cyberpunk violet/black/white aesthetic and zero-pill design discipline.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1:
> - **Authentication Gateway Layout**: Full-screen cyber gateway with toggleable modal overlay.
> - **Access Model**: Strict gateway requiring login or registration before entering the NEXORA workspace.
> - **Originality & Branding**: 100% preservation of NEXORA's violet/purple/black cyberpunk theme (`cyber-glass`, hexagonal avatars, monospace telemetry, and audio SFX).

- **Confirmed Decision 1**: Unauthenticated visitors are greeted by a full-screen Cyber Gateway (`AuthGatewayModal`) providing Register, Login, and Password Reset tabs, plus one-click Google Sign-In and a Guest Operative demo bypass.
- **Confirmed Decision 2**: Authenticated users have persistent sessions stored in Firebase Auth (`browserLocalPersistence`) and synced real-time with Firestore `/users/{userId}` documents.
- **Confirmed Decision 3**: Profile page in `UserSettingsModal` provides live username editing, avatar management (presets + custom URL upload), bio, status toggling (Online, Idle, DND, Offline), and secure logout.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms NEXORA into a multi-user communication network where users can register with unique usernames/emails, securely log in, reset forgotten passwords, sign in with Google, manage their operative profile (avatar, bio, custom status), and have their authentication state preserved across page reloads.
- **Target Audience**: Operatives, architects, engineers, and community members collaborating in real time across Hubs and Frequencies.
- **Key Value**: Replaces transient persona switching with authentic cryptographic user accounts and persistent cloud profiles in Cloud Firestore, guaranteeing that users can only edit or delete their own transmissions.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Gateway Initialization**:
   - On initial load, Firebase Auth checks for an active session (`onAuthStateChanged`).
   - If no authenticated session exists, the full-screen **Cyber Gateway** mounts with hexagonal neon backdrop pulses, animated particle grid, and high-contrast inputs.
2. **Registration Flow**:
   - Form fields: `Display Name`, `Unique Username` (auto-formatted to lowercase alphanumeric), `Email Address`, `Password` (with live strength meter), and `Confirm Password`.
   - On submission: creates Firebase Auth account via `createUserWithEmailAndPassword`, assigns a randomized cyberpunk hexagonal avatar, generates a 4-digit operative tag (`#7421`), and creates a Firestore document in `/users/{userId}`.
3. **Login Flow**:
   - Form fields: `Email Address` and `Master Passphrase`.
   - Option: "Remember Operative Session" checkbox.
   - Option: One-click "Authorize with Google" via `signInWithPopup`.
   - Link: "Forgot Master Key / Reset Password".
4. **Password Reset Flow**:
   - Clean single-field modal: `Operative Email Address`.
   - Dispatches password reset link via `sendPasswordResetEmail` and displays confirmation feedback with countdown.
5. **Session Management & Logout**:
   - Sessions persist in browser `IndexedDB`/`localStorage`.
   - Top-right Operative pill and Console Settings offer a "Disconnect Session" button that invokes `signOut(auth)` and smoothly returns to the Cyber Gateway.

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: High-tech cyberpunk glassmorphism with neon violet/purple glows, dark space backdrop (`#070810`), and hexagonal badge geometry (`.hex-clip`).
- **Color Palette**:
  - Background: Deep Obsidian (`#070810` / `#0d0f1c`)
  - Elevated Glass: `#141628` with 20% opacity borders (`border-violet-500/20`)
  - Violet Accents: Neon Violet (`#8b5cf6`), Purple Glow (`#a855f7`), Electric Indigo (`#6366f1`)
  - Status Accents: Emerald (`#10b981` Online), Amber (`#f59e0b` Idle), Crimson (`#f43f5e` DND), Slate (`#94a3b8` Offline)
- **Zero-Pill Discipline**:
  - Tags and metadata formatted as clean text with dots (`@cipher · #9102 · Online`).
  - Segmented interactive switchers used for tabs (`Login`, `Register`, `Reset`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Firestore & Auth Profile Model**:
  - *Chosen Approach*: Firebase Auth handles credentials and session tokens; Cloud Firestore `/users/{userId}` stores public profile metadata (`username`, `displayName`, `tag`, `avatar`, `status`, `bio`, `bannerColor`).
  - *Why*: Enables rich querying, member lists, and role management in Firestore without exposing email or security credentials.
- **Decision 2: Seamless Guest / Test Persona Fallback**:
  - *Chosen Approach*: Provide a "Continue as Guest Operative" button on the login screen for testing role switching without requiring immediate email verification.
  - *Why*: Allows instant inspection of owner/moderator roles while keeping full email/password authentication as the primary gateway.
- **Decision 3: Real-Time Presence Status Sync**:
  - *Chosen Approach*: When the authenticated user changes status (Online, Idle, DND, Offline) in the UI or closes the window, their status updates directly in Firestore so all members see live presence in the Operatives sidebar.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXORA AUTHENTICATION ARCHITECTURE              │
└────────────────────────────────────────────────────────────────────────┘

 [ Unauthenticated Visitor ]               [ Authenticated Operative ]
            │                                           │
            ▼                                           ▼
┌─────────────────────────┐                 ┌────────────────────────────┐
│   AuthGatewayModal      │                 │    Nexora Core Workspace   │
│  - Tab: Login           │                 │  - Top Hub Header          │
│  - Tab: Register        │                 │  - Floating Pods Sidebar   │
│  - Tab: Reset Password  │                 │  - Main Transmission Stream│
│  - Google Sign-In       │                 │  - Operatives Deck         │
│  - Guest Demo Bypass    │                 │  - Profile & Console Modal │
└───────────┬─────────────┘                 └─────────────┬──────────────┘
            │                                             │
            ├──────────── Firebase Auth SDK ──────────────┤
            │  - createUserWithEmailAndPassword()         │
            │  - signInWithEmailAndPassword()             │
            │  - signInWithPopup(googleProvider)          │
            │  - sendPasswordResetEmail()                 │
            │  - signOut() & onAuthStateChanged()         │
            ▼                                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Cloud Firestore Database                        │
│                                                                        │
│  Collection: /users/{userId}                                           │
│  - id: string (Auth UID)                                               │
│  - username: string (unique handle)                                    │
│  - displayName: string                                                 │
│  - tag: string (e.g. "#4092")                                          │
│  - avatar: string (URL or hex preset)                                  │
│  - status: "online" | "idle" | "dnd" | "offline"                       │
│  - bio: string                                                         │
│  - joinedAt: string (ISO timestamp)                                    │
│  - lastSeen: string                                                    │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Changes

1. **`src/firebase.ts`**:
   - Export `auth`, `db`, and `googleProvider`.
2. **`src/components/modals/AuthGatewayModal.tsx`**:
   - Create full-screen gateway with tabs:
     - **Login**: Email + Password with password reveal toggle and Google Auth button.
     - **Register**: Display name, username, email, password, confirm password, avatar picker.
     - **Password Reset**: Email input with instant reset link dispatch.
     - **Demo Bypass**: Quick guest login for automated tests.
3. **`src/context/NexoraContext.tsx`**:
   - Wire `onAuthStateChanged` to fetch or initialize the user's Firestore `/users/{uid}` document.
   - Provide `loginWithEmail(email, password)`, `registerWithEmail(email, password, displayName, username, avatar)`, `loginWithGoogle()`, `resetPassword(email)`, and `logoutUser()`.
   - Update `currentUser` state upon login/logout.
4. **`src/components/modals/UserSettingsModal.tsx`**:
   - Ensure the "My Account" and "Profiles" tabs update the authenticated user's Firestore profile, avatar, username, and bio.
   - Wire "Log Out" button to `logoutUser()`.
5. **`firestore.rules`**:
   - Verify rules allow authenticated users to read profiles in `/users` and write only to their own `/users/{request.auth.uid}` document.

---

## 5. Verification Plan

- [ ] **Registration Test**: Register a new user with valid email, username, and password; verify profile creation in Cloud Firestore.
- [ ] **Logout & Re-Login Test**: Click "Disconnect Session" in profile menu; confirm return to Cyber Gateway; log in with registered credentials.
- [ ] **Session Persistence Test**: Refresh the browser while logged in; verify session remains active and user profile is immediately restored without re-login.
- [ ] **Password Reset Test**: Trigger password reset flow for email address; verify success feedback.
- [ ] **Profile & Status Edit Test**: Change username, bio, and presence status in settings; verify real-time update in Operatives roster.
- [ ] **Build & Lint Verification**: Run `compile_applet` and `lint_applet` ensuring zero TypeScript/ESLint errors.
