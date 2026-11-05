import React, { useState, useEffect, useRef } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { toNumericUID } from '../../utils/authVault';
import {
  X,
  User,
  Palette,
  Volume2,
  Users,
  Shield,
  Check,
  Sparkles,
  Camera,
  Bell,
  Lock,
  Keyboard,
  Globe,
  Code,
  LogOut,
  Sliders,
  Radio,
  Mic,
  MicOff,
  Phone,
  Mail,
  Key,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Smartphone,
  AlertTriangle,
  RotateCcw,
  Upload,
  Copy,
  Fingerprint,
} from 'lucide-react';
import { UserStatus } from '../../types';
import { CYBER_AVATARS, compressImageFile } from '../../utils/avatars';

type SettingsTab =
  | 'account'
  | 'profile'
  | 'privacy'
  | 'appearance'
  | 'voice'
  | 'notifications'
  | 'keybinds'
  | 'language'
  | 'advanced'
  | 'personas'
  | 'logout';

export const UserSettingsModal: React.FC = () => {
  const {
    activeModal,
    openModal,
    closeModal,
    currentUser,
    updateUserProfile,
    updateUserStatus,
    allUsers,
    switchUser,
    soundEnabled,
    toggleSound,
    showToast,
    logout,
    resetPassword,
  } = useNexora();

  // All state hooks declared unconditionally at the top level
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  // Account & Profile State
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email || 'alex.rivera@nexora.tech');
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 019-2834');
  const [pronouns, setPronouns] = useState(currentUser.pronouns || 'he/him');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [customStatus, setCustomStatus] = useState(currentUser.customStatus || '');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [bannerColor, setBannerColor] = useState(
    currentUser.bannerColor || 'from-violet-800 via-purple-900 to-indigo-950'
  );
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Appearance State
  const [themeStyle, setThemeStyle] = useState<'obsidian' | 'violet' | 'oled' | 'light'>('obsidian');
  const [messageDisplay, setMessageDisplay] = useState<'cozy' | 'compact'>('cozy');
  const [fontSize, setFontSize] = useState<number>(14);
  const [zoomLevel, setZoomLevel] = useState<string>('100%');

  // Voice & Audio State
  const [inputDevice, setInputDevice] = useState('Default - Studio Condenser (USB)');
  const [outputDevice, setOutputDevice] = useState('Default - High-Definition Headphones');
  const [inputVolume, setInputVolume] = useState<number>(85);
  const [outputVolume, setOutputVolume] = useState<number>(90);
  const [inputMode, setInputMode] = useState<'activity' | 'ptt'>('activity');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(true);
  const [isMicTesting, setIsMicTesting] = useState(false);
  const [testDecibels, setTestDecibels] = useState<number>(0);
  const testIntervalRef = useRef<any>(null);

  // Privacy & Safety State
  const [safeDirectMessaging, setSafeDirectMessaging] = useState<'all' | 'friends' | 'none'>('all');
  const [allowDMsFromHubOperatives, setAllowDMsFromHubOperatives] = useState(true);
  const [allowUplinkInvites, setAllowUplinkInvites] = useState<'everyone' | 'friends'>('everyone');
  const [encryptionVerification, setEncryptionVerification] = useState(true);
  const [telemetryOptOut, setTelemetryOptOut] = useState(true);

  // Notifications State
  const [desktopPushAlerts, setDesktopPushAlerts] = useState(true);
  const [unreadBadgeCount, setUnreadBadgeCount] = useState(true);
  const [inactivityTimeout, setInactivityTimeout] = useState('5m');

  // Language & Time State
  const [language, setLanguage] = useState('en-US');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');

  // Advanced & Developer State
  const [developerMode, setDeveloperMode] = useState(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);

  // Has unsaved changes check
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isDirty =
      displayName !== currentUser.displayName ||
      username !== currentUser.username ||
      bio !== (currentUser.bio || '') ||
      customStatus !== (currentUser.customStatus || '') ||
      status !== currentUser.status ||
      pronouns !== (currentUser.pronouns || 'he/him') ||
      avatar !== currentUser.avatar ||
      bannerColor !== (currentUser.bannerColor || 'from-violet-800 via-purple-900 to-indigo-950');
    setHasChanges(isDirty);
  }, [displayName, username, bio, customStatus, status, pronouns, avatar, bannerColor, currentUser]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  // Mic test simulator
  const toggleMicTest = () => {
    if (isMicTesting) {
      clearInterval(testIntervalRef.current);
      setIsMicTesting(false);
      setTestDecibels(0);
    } else {
      setIsMicTesting(true);
      testIntervalRef.current = setInterval(() => {
        // simulate natural voice input meter jumping between 20% and 85%
        const level = Math.floor(25 + Math.random() * 60);
        setTestDecibels(level);
      }, 100);
    }
  };

  useEffect(() => {
    return () => {
      if (testIntervalRef.current) clearInterval(testIntervalRef.current);
    };
  }, []);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const sampleAvatars = CYBER_AVATARS.map((a) => a.url);

  const bannerPresets = [
    { name: 'Cyber Violet', gradient: 'from-violet-800 via-purple-900 to-indigo-950' },
    { name: 'Neon Plasma', gradient: 'from-fuchsia-700 via-purple-800 to-pink-900' },
    { name: 'Cyan Grid', gradient: 'from-cyan-800 via-blue-900 to-indigo-950' },
    { name: 'Emerald Flux', gradient: 'from-emerald-800 via-teal-900 to-slate-950' },
    { name: 'Amber Sol', gradient: 'from-amber-700 via-orange-900 to-stone-950' },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const compressed = await compressImageFile(file, 256, 0.85);
      setAvatar(compressed);
      showToast('Custom avatar compressed and applied', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to process avatar file', 'warning');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveAll = () => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      showToast('Callsign must be at least 3 characters (letters, numbers, hyphens, underscores).', 'warning');
      return;
    }

    updateUserProfile({
      displayName: displayName.trim() || cleanUsername,
      username: cleanUsername,
      email: email.trim(),
      phone: phone.trim(),
      pronouns: pronouns.trim(),
      bio: bio.trim(),
      customStatus: customStatus.trim(),
      avatar,
      bannerColor,
    });
    updateUserStatus(status, customStatus.trim());
    setHasChanges(false);
    showToast('Operative profile saved successfully', 'success');
  };

  const handleResetAll = () => {
    setDisplayName(currentUser.displayName);
    setUsername(currentUser.username);
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setPronouns(currentUser.pronouns || 'he/him');
    setBio(currentUser.bio || '');
    setCustomStatus(currentUser.customStatus || '');
    setStatus(currentUser.status);
    setAvatar(currentUser.avatar);
    setBannerColor(currentUser.bannerColor || 'from-violet-800 via-purple-900 to-indigo-950');
    setHasChanges(false);
    showToast('Changes reverted', 'info');
  };

  // Registered hotkeys list
  const hotkeysList = [
    { action: 'Quick Frequency & Hub Switcher', keys: ['Ctrl', 'K'] },
    { action: 'Mute Microphone', keys: ['Ctrl', 'Shift', 'M'] },
    { action: 'Deafen Audio Output', keys: ['Ctrl', 'Shift', 'D'] },
    { action: 'Toggle Operatives Panel', keys: ['Ctrl', 'U'] },
    { action: 'Focus Transmission Composer', keys: ['/'] },
    { action: 'Close Modal / Escape Focus', keys: ['Esc'] },
    { action: 'Send Transmission', keys: ['Enter'] },
    { action: 'New Line in Composer', keys: ['Shift', 'Enter'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={closeModal} />

      {/* Main Full-Size Settings Window (Discord layout) */}
      <div className="relative w-full max-w-5xl h-[90vh] cyber-glass-elevated rounded-3xl border border-violet-500/30 shadow-2xl flex overflow-hidden z-10">
        {/* LEFT SETTINGS SIDEBAR */}
        <div className="w-64 bg-[#0a0c18]/90 border-r border-violet-500/20 p-4 flex flex-col shrink-0 select-none overflow-y-auto">
          {/* Header */}
          <div className="px-3 pb-3 mb-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-extrabold text-white tracking-wider flex items-center gap-2 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              NEXORA CONSOLE
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-600/30 text-violet-300">
              v1.0
            </span>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            {/* GROUP 1: USER SETTINGS */}
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold px-3 py-1">
                User Settings
              </div>
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'account'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-violet-300" />
                <span>My Account</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'profile'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span>Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'privacy'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-violet-300" />
                <span>Privacy & Safety</span>
              </button>
            </div>

            {/* GROUP 2: APP SETTINGS */}
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold px-3 py-1">
                App Settings
              </div>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'appearance'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Palette className="w-4 h-4 text-violet-300" />
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'voice'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4 text-violet-300" />
                <span>Voice & Audio</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'notifications'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4 text-violet-300" />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab('keybinds')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'keybinds'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Keyboard className="w-4 h-4 text-violet-300" />
                <span>Keybinds</span>
              </button>

              <button
                onClick={() => setActiveTab('language')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'language'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4 text-violet-300" />
                <span>Language & Time</span>
              </button>
            </div>

            {/* GROUP 3: SYSTEM & ADVANCED */}
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold px-3 py-1">
                Advanced
              </div>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'advanced'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4 text-violet-300" />
                <span>Developer Settings</span>
              </button>

              <button
                onClick={() => setActiveTab('personas')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeTab === 'personas'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-violet-300" />
                <span>Switch Operative Persona</span>
              </button>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setActiveTab('logout')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SETTINGS CONTENT PANE */}
        <div className="flex-1 flex flex-col h-full bg-[#0d0f1e]/80 overflow-hidden relative">
          {/* Header Close Bar (with Discord-style ESC circle button) */}
          <div className="h-14 px-8 border-b border-violet-500/15 flex items-center justify-between shrink-0">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
              {activeTab === 'account' && 'My Account'}
              {activeTab === 'profile' && 'Operative Profile Customization'}
              {activeTab === 'privacy' && 'Privacy & Safe Relays'}
              {activeTab === 'appearance' && 'Appearance & Font Scaling'}
              {activeTab === 'voice' && 'Voice & Audio Processing'}
              {activeTab === 'notifications' && 'Transmission Alerts & Sounds'}
              {activeTab === 'keybinds' && 'Keybinds & Shortcut Matrix'}
              {activeTab === 'language' && 'Language & Clock Configuration'}
              {activeTab === 'advanced' && 'Developer & Protocol Settings'}
              {activeTab === 'personas' && 'Live Multi-Role Testing Personas'}
              {activeTab === 'logout' && 'Log Out Confirmation'}
            </h2>

            {/* Signature Discord ESC close button */}
            <div className="flex flex-col items-center">
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full border border-violet-400/30 bg-violet-600/10 hover:bg-violet-600 hover:border-violet-400 text-slate-300 hover:text-white flex items-center justify-center transition shadow-lg group"
                title="Close (ESC)"
              >
                <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              <span className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">ESC</span>
            </div>
          </div>

          {/* Scrollable Tab Content Viewport */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 pb-24">
            {/* 1. MY ACCOUNT */}
            {activeTab === 'account' && (
              <div className="space-y-6 max-w-2xl">
                {/* Account Card Banner Preview */}
                <div className="rounded-2xl border border-violet-500/25 overflow-hidden bg-[#131528] shadow-xl">
                  <div className={`h-24 bg-gradient-to-r ${bannerColor} relative`}>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="absolute top-3 right-3 px-3 py-1 bg-black/60 hover:bg-black/80 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 backdrop-blur-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      Edit Profile
                    </button>
                  </div>
                  <div className="p-4 pt-0 relative flex items-end justify-between">
                    <div className="flex items-end gap-3.5 -mt-8">
                      <div className="w-16 h-16 hex-clip bg-gradient-to-tr from-violet-600 to-purple-600 p-0.5 shadow-xl">
                        <img src={avatar} alt="avatar" className="w-full h-full object-cover hex-clip" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base leading-tight">
                          {displayName}
                        </h3>
                        <p className="text-xs text-violet-400 font-mono">
                          @{username} <span className="opacity-70">{currentUser.tag}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Credentials Form */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Display Name
                      </span>
                      <span className="text-sm font-semibold text-white">{displayName}</span>
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-[#0b0c16] border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 w-48 text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Operative Unique ID (UID)
                      </span>
                      <span className="text-xs font-mono text-slate-300 tracking-wide select-all">{toNumericUID(currentUser.id)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const numericId = toNumericUID(currentUser.id);
                        navigator.clipboard.writeText(numericId);
                        showToast(`Copied Operative ID: ${numericId}`, 'info');
                      }}
                      className="px-3 py-1 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-xl text-xs font-mono text-violet-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UID</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Username
                      </span>
                      <span className="text-sm font-mono text-white">@{username}</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-[#0b0c16] border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 w-48 text-right font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Email Address
                      </span>
                      <span className="text-sm text-slate-300 font-mono">{email}</span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#0b0c16] border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 w-56 text-right font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                        Phone Number
                      </span>
                      <span className="text-sm text-slate-300 font-mono">{phone}</span>
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#0b0c16] border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 w-48 text-right font-mono"
                    />
                  </div>
                </div>

                {/* Password & Two-Factor Authentication */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-400" />
                    <span>Password & Authentication</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</p>
                      <p className="text-[11px] text-slate-400">
                        Protect your account with an authenticator app code on login
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setTwoFactorEnabled((prev) => {
                          showToast(!prev ? '2FA Protection Enabled' : '2FA Protection Disabled', 'info');
                          return !prev;
                        });
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                        twoFactorEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 hover:bg-white/15 text-slate-300'
                      }`}
                    >
                      {twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Password Reset Transmission</p>
                      <p className="text-[11px] text-slate-400">
                        Transmit an official Firebase password reset link to {currentUser.email || 'your registered email'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (currentUser.email) {
                          await resetPassword(currentUser.email);
                        } else {
                          showToast('No electronic mail address linked to this profile', 'warning');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 hover:text-white border border-violet-500/30 transition flex items-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-violet-400" />
                      <span>Send Reset Link</span>
                    </button>
                  </div>
                </div>

                {/* Account Removal Section */}
                <div className="p-5 bg-rose-950/20 rounded-2xl border border-rose-500/20 space-y-3">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Account Removal
                  </span>
                  <p className="text-xs text-slate-300">
                    Disabling your account means you can recover it at any time. Deleting permanently purges all operative logs.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => showToast('Account deactivation requested', 'warning')}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-xl text-xs font-semibold border border-rose-500/30 transition"
                    >
                      Disable Account
                    </button>
                    <button
                      onClick={() => showToast('Account deletion confirmation sent to email', 'warning')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROFILES (Discord Profiles Customization with Live Card) */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left controls */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={pronouns}
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. they/them, he/him, she/her"
                      className="w-full bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Operative Avatar
                      </label>
                      <label className="text-[10px] text-violet-400 hover:text-violet-300 cursor-pointer flex items-center gap-1 font-mono">
                        <Upload className="w-3 h-3" />
                        <span>Upload Custom Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-6 gap-2">
                      {sampleAvatars.slice(0, 12).map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`aspect-square hex-clip transition p-0.5 ${
                            avatar === url
                              ? 'bg-violet-400 scale-105 shadow-lg shadow-violet-600/40 ring-1 ring-violet-400'
                              : 'bg-white/10 hover:scale-105 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover hex-clip" />
                        </button>
                      ))}
                    </div>

                    {isUploadingAvatar && (
                      <div className="text-[10px] font-mono text-violet-400 flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 animate-spin" />
                        <span>Compressing image file on client canvas...</span>
                      </div>
                    )}

                    {/* Direct Image URL input */}
                    <div className="pt-1">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="Or paste direct image URL (https://...)"
                          value={avatar.startsWith('data:') ? '' : avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="flex-1 bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Presets */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                      Profile Banner
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {bannerPresets.map((bp) => (
                        <button
                          key={bp.name}
                          type="button"
                          onClick={() => setBannerColor(bp.gradient)}
                          className={`h-12 rounded-xl bg-gradient-to-r ${bp.gradient} border text-left p-2 transition ${
                            bannerColor === bp.gradient
                              ? 'border-violet-300 ring-2 ring-violet-500/50'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-white drop-shadow">{bp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* About Me Bio */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      About Me
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a brief overview of yourself..."
                      className="w-full bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right LIVE PREVIEW CARD */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block mb-2">
                    Live Profile Preview
                  </span>
                  <div className="cyber-glass-elevated rounded-3xl overflow-hidden border border-violet-500/35 shadow-2xl">
                    <div className={`h-28 bg-gradient-to-r ${bannerColor} relative p-3 flex justify-between`}>
                      <span className="text-[10px] font-mono text-white/80 uppercase font-bold tracking-wider">
                        NEXORA OPERATIVE
                      </span>
                    </div>

                    <div className="px-5 pb-5 pt-0 relative">
                      <div className="relative -mt-10 mb-3 inline-block">
                        <div className="w-20 h-20 hex-clip bg-gradient-to-tr from-violet-500 to-purple-600 p-1 shadow-2xl">
                          <img src={avatar} alt={displayName} className="w-full h-full object-cover hex-clip" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-extrabold text-white">{displayName}</h4>
                        <p className="text-xs text-violet-300 font-mono">
                          @{username} <span className="opacity-70">{currentUser.tag}</span>
                        </p>
                        {pronouns && (
                          <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                            {pronouns}
                          </span>
                        )}
                      </div>

                      <div className="h-[1px] bg-white/10 my-3" />

                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                          About Me
                        </span>
                        <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                          {bio || 'Connected without limits on NEXORA.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PRIVACY & SAFETY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Safe Direct Transmission Screening
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically scan and filter media packets sent to you in Private Relays
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'all',
                        title: 'Filter all direct transmissions (Recommended)',
                        desc: 'Scan direct transmissions from everyone, including contacts',
                      },
                      {
                        id: 'friends',
                        title: 'Do not filter transmissions from contacts',
                        desc: 'Only scan direct transmissions from unknown operatives',
                      },
                      {
                        id: 'none',
                        title: 'Do not filter any transmissions',
                        desc: 'Transmissions will not be scanned for safety alerts',
                      },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSafeDirectMessaging(opt.id as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          safeDirectMessaging === opt.id
                            ? 'bg-violet-600/20 border-violet-400'
                            : 'bg-[#0a0c18] border-white/5 hover:border-violet-500/30'
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">{opt.title}</p>
                        <p className="text-[10px] text-slate-400">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hub direct messages & Uplinks */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Allow Direct Comms from Hub Operatives
                      </p>
                      <p className="text-[11px] text-slate-400">
                        This allows operatives in mutual Hubs to send you private relays
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowDMsFromHubOperatives}
                      onChange={(e) => setAllowDMsFromHubOperatives(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Zero-Knowledge Relay Encryption</p>
                      <p className="text-[11px] text-slate-400">
                        Enforce client-side cryptographic protocol verification
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={encryptionVerification}
                      onChange={(e) => setEncryptionVerification(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. APPEARANCE (Discord Appearance + Live Scaling Preview) */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-2xl">
                {/* Theme Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Theme Palette
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'obsidian', title: 'Deep Obsidian', color: 'bg-[#0b0c14] border-violet-500' },
                      { id: 'violet', title: 'Cyber Violet', color: 'bg-[#14162e] border-violet-400' },
                      { id: 'oled', title: 'Midnight OLED', color: 'bg-black border-slate-700' },
                      { id: 'light', title: 'Frosted Glass', color: 'bg-slate-800 border-white/20' },
                    ].map((thm) => (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => {
                          setThemeStyle(thm.id as any);
                          showToast(`Theme set to ${thm.title}`, 'info');
                        }}
                        className={`p-3 rounded-2xl border text-left transition ${thm.color} ${
                          themeStyle === thm.id ? 'ring-2 ring-violet-400 shadow-lg' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-violet-500 mb-2" />
                        <p className="text-xs font-bold text-white">{thm.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Display: Cozy vs Compact */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-3">
                  <label className="text-xs font-bold text-white uppercase tracking-wider block">
                    Message Display Density
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMessageDisplay('cozy')}
                      className={`p-3 rounded-xl border text-left transition ${
                        messageDisplay === 'cozy'
                          ? 'bg-violet-600/25 border-violet-400 text-white'
                          : 'bg-[#0a0c18] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">Cozy Mode</p>
                      <p className="text-[10px] text-slate-400">Spacious with full avatars and transmission cards</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMessageDisplay('compact')}
                      className={`p-3 rounded-xl border text-left transition ${
                        messageDisplay === 'compact'
                          ? 'bg-violet-600/25 border-violet-400 text-white'
                          : 'bg-[#0a0c18] border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">Compact Mode</p>
                      <p className="text-[10px] text-slate-400">High density single-line IRC terminal view</p>
                    </button>
                  </div>
                </div>

                {/* Font Scaling Slider & Live Chat Preview */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">
                        Transmission Font Scaling
                      </span>
                      <span className="text-[11px] text-slate-400">Scale chat font across all frequencies</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-300">{fontSize}px</span>
                  </div>

                  <input
                    type="range"
                    min={12}
                    max={20}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />

                  {/* Live Chat Bubble Preview */}
                  <div className="p-3 bg-[#0a0c18] rounded-xl border border-violet-500/20">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-violet-400 block mb-1">
                      Live Scaling Preview
                    </span>
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 hex-clip bg-violet-600 p-0.5 shrink-0">
                        <img src={currentUser.avatar} alt="preview" className="w-full h-full object-cover hex-clip" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{currentUser.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Today at 10:45 AM</span>
                        </div>
                        <p style={{ fontSize: `${fontSize}px` }} className="text-slate-200 mt-0.5 leading-relaxed">
                          Testing transmission font scaling on NEXORA. Connect without limits!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. VOICE & AUDIO (With Interactive Mic Test Meter) */}
            {activeTab === 'voice' && (
              <div className="space-y-6 max-w-2xl">
                {/* Device Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Input Device (Microphone)
                    </label>
                    <select
                      value={inputDevice}
                      onChange={(e) => setInputDevice(e.target.value)}
                      className="w-full bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option>Default - Studio Condenser (USB)</option>
                      <option>MacBook Built-in Microphone</option>
                      <option>High-Definition Array Mic</option>
                    </select>

                    <div className="mt-2">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Input Sensitivity</span>
                        <span className="font-mono">{inputVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={inputVolume}
                        onChange={(e) => setInputVolume(Number(e.target.value))}
                        className="w-full accent-violet-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Output Device (Headphones)
                    </label>
                    <select
                      value={outputDevice}
                      onChange={(e) => setOutputDevice(e.target.value)}
                      className="w-full bg-[#121424] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option>Default - High-Definition Headphones</option>
                      <option>External Studio Reference Monitors</option>
                      <option>System Default Audio Output</option>
                    </select>

                    <div className="mt-2">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Output Volume</span>
                        <span className="font-mono">{outputVolume}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={outputVolume}
                        onChange={(e) => setOutputVolume(Number(e.target.value))}
                        className="w-full accent-violet-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Interactive Mic Test Meter (Signature Discord Feature!) */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-violet-400" />
                        Mic Test: Check Input Modulation
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click the button below to test your microphone levels
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMicTest}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                        isMicTesting
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-600/30'
                      }`}
                    >
                      {isMicTesting ? 'Stop Test' : "Let's Check"}
                    </button>
                  </div>

                  {/* Meter Bar */}
                  <div className="h-4 bg-[#0a0c18] rounded-full overflow-hidden p-0.5 border border-violet-500/20 flex items-center">
                    <div
                      style={{ width: `${isMicTesting ? testDecibels : 0}%` }}
                      className={`h-full rounded-full transition-all duration-100 ${
                        testDecibels > 70
                          ? 'bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-500 to-violet-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-60 dB (Silence)</span>
                    <span>-18 dB (Nominal Speech)</span>
                    <span>0 dB (Clipping)</span>
                  </div>
                </div>

                {/* Audio Processing Toggles */}
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Crisp Audio Noise Suppression</p>
                      <p className="text-[11px] text-slate-400">Eliminates background keyboard clicks and room noise</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={noiseSuppression}
                      onChange={(e) => setNoiseSuppression(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Echo Cancellation</p>
                      <p className="text-[11px] text-slate-400">Prevents acoustic feedback loop from speakers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={echoCancellation}
                      onChange={(e) => setEchoCancellation(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Automatic Gain Control (AGC)</p>
                      <p className="text-[11px] text-slate-400">Automatically normalizes quiet speech levels</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoGain}
                      onChange={(e) => setAutoGain(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Enable Desktop Push Notifications</p>
                      <p className="text-[11px] text-slate-400">Receive toasts when mentions or private relays arrive</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={desktopPushAlerts}
                      onChange={(e) => setDesktopPushAlerts(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Unread Transmission Badges</p>
                      <p className="text-[11px] text-slate-400">Display numerical badge counters on Hubs and Frequencies</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={unreadBadgeCount}
                      onChange={(e) => setUnreadBadgeCount(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Interface Sound FX Synthesizer</p>
                      <p className="text-[11px] text-slate-400">Play low-latency oscillator audio chimes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleSound}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                          soundEnabled ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {soundEnabled ? 'Active' : 'Muted'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. KEYBINDS */}
            {activeTab === 'keybinds' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    NEXORA Keybind Matrix
                  </h3>
                  <p className="text-xs text-slate-400">Standardized shortcuts for terminal navigation</p>
                </div>

                <div className="p-2 bg-[#121424] rounded-2xl border border-violet-500/15 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-mono text-violet-400 uppercase">
                        <th className="p-3">Action Description</th>
                        <th className="p-3 text-right">Key Combination</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {hotkeysList.map((hk, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-medium text-slate-200">{hk.action}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1 font-mono">
                              {hk.keys.map((k) => (
                                <kbd
                                  key={k}
                                  className="px-2 py-0.5 rounded bg-[#0b0c16] border border-violet-500/25 text-[10px] text-violet-300 shadow"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. LANGUAGE & REGION */}
            {activeTab === 'language' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Interface Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#0b0c16] border border-violet-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="en-GB">English (United Kingdom)</option>
                      <option value="es-ES">Español (Spanish)</option>
                      <option value="fr-FR">Français (French)</option>
                      <option value="de-DE">Deutsch (German)</option>
                      <option value="ja-JP">日本語 (Japanese)</option>
                      <option value="hi-IN">हिन्दी (Hindi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Timestamp Clock Format
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTimeFormat('12h')}
                        className={`p-3 rounded-xl border text-left transition font-mono ${
                          timeFormat === '12h'
                            ? 'bg-violet-600/25 border-violet-400 text-white'
                            : 'bg-[#0a0c18] border-white/5 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">12-Hour</span>
                        <span className="text-[10px] text-slate-400">10:45 AM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTimeFormat('24h')}
                        className={`p-3 rounded-xl border text-left transition font-mono ${
                          timeFormat === '24h'
                            ? 'bg-violet-600/25 border-violet-400 text-white'
                            : 'bg-[#0a0c18] border-white/5 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold block">24-Hour</span>
                        <span className="text-[10px] text-slate-400">22:45</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. ADVANCED & DEVELOPER */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 max-w-2xl">
                <div className="p-5 bg-[#121424] rounded-2xl border border-violet-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">Developer Mode</p>
                      <p className="text-[11px] text-slate-400">
                        Exposes raw cryptographic Hub IDs, Frequency IDs, and Operative Tokens on context menus
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={developerMode}
                      onChange={(e) => setDeveloperMode(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Hardware Acceleration</p>
                      <p className="text-[11px] text-slate-400">
                        Uses GPU compositor for 60fps glassmorphic blur and audio wave visualizers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={hardwareAcceleration}
                      onChange={(e) => setHardwareAcceleration(e.target.checked)}
                      className="w-4 h-4 text-violet-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs font-semibold text-white">Private Beta Feedback Telemetry</p>
                      <p className="text-[11px] text-slate-400">
                        File diagnostic bug reports with screenshots, browser telemetry, and severity tracking
                      </p>
                    </div>
                    <button
                      onClick={() => openModal('beta_feedback')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-mono text-xs font-bold transition cursor-pointer border border-amber-500/30 shrink-0"
                    >
                      Report Anomaly
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. PERSONAS (Test Personas Switcher) */}
            {activeTab === 'personas' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Multi-Role Operative Testing Console
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly simulate administrative and operative permissions across all Hubs
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.values(allUsers).map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        closeModal();
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                        currentUser.id === u.id
                          ? 'bg-violet-600/25 border-violet-400 shadow-md'
                          : 'bg-[#121424] border-violet-500/15 hover:border-violet-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.displayName} className="w-10 h-10 hex-clip object-cover" />
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            <span className="text-[10px] text-violet-400 font-mono">({u.tag})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                            {u.customStatus || u.bio}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-violet-300 border border-violet-500/25">
                          {u.role ? u.role.toUpperCase() : 'OPERATIVE'}
                        </span>
                        {currentUser.id === u.id && (
                          <span className="text-xs text-emerald-400 font-semibold font-mono">ACTIVE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 11. LOG OUT */}
            {activeTab === 'logout' && (
              <div className="space-y-4 max-w-md p-6 bg-[#121424] rounded-3xl border border-rose-500/30">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <LogOut className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Sever Active Session?</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Are you sure you want to log out of NEXORA? You will need to re-authenticate with your security token.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('account')}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      closeModal();
                      await logout();
                    }}
                    className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Discord-style "Careful — you have unsaved changes!" Bar */}
          {hasChanges && (
            <div className="absolute bottom-4 left-8 right-8 bg-[#16182e] border border-violet-400/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between z-30 animate-in slide-in-from-bottom-4 duration-150 backdrop-blur-xl">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Careful — you have unsaved changes!
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-violet-600/40 transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
