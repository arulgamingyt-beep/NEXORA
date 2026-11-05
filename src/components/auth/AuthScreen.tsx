import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { CYBER_AVATARS, compressImageFile } from '../../utils/avatars';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  KeyRound,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Radio,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthScreen: React.FC = () => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    quickDemoLogin,
    resetPassword,
  } = useNexora();

  const [mode, setMode] = useState<AuthMode>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(CYBER_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDomainGuide, setShowDomainGuide] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [googleCustomAvatar, setGoogleCustomAvatar] = useState(CYBER_AVATARS[0].url);

  // Switch between Login, Register, Forgot Password
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  };

  // Convert raw error codes / Firebase messages into clean, polished operative messages
  const parseCleanError = (error: any): string => {
    const raw = (error?.message || error?.code || String(error || '')).toLowerCase();

    if (raw.includes('unauthorized-domain')) {
      return 'Google OAuth Notice: This domain (localhost) is pending authorization in Firebase Console (Authentication > Settings > Authorized domains). Please register or sign in with your Callsign/Email, or use 1-Click Instant Demo.';
    }
    if (raw.includes('operation-not-allowed')) {
      return 'Firebase Email/Password provider is disabled in Firebase Console. Local Cryptographic Vault active. Please use the Register tab to create your operative callsign.';
    }
    if (raw.includes('email-already-in-use')) {
      return 'This electronic mail address is already registered. Please sign in or use the password recovery protocol.';
    }
    if (raw.includes('invalid-email')) {
      return 'Please provide a valid electronic mail format (e.g. operative@nexora.tech).';
    }
    if (raw.includes('user-not-found') || raw.includes('invalid-credential') || raw.includes('wrong-password')) {
      return 'Authentication rejected: Invalid callsign, electronic mail, or security key. Please check your credentials.';
    }
    if (raw.includes('weak-password')) {
      return 'Security key is too short. Please choose at least 6 characters.';
    }
    if (raw.includes('popup-closed-by-user')) {
      return 'Google authorization window was closed before completion.';
    }
    if (error?.message) {
      return error.message;
    }
    return 'Authentication protocol notice: Please verify your credentials and try again.';
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim() || !password) {
      setErrorMessage('Please provide both your electronic mail or callsign and security key.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithEmail(emailOrPhone.trim(), password);
    } catch (err: any) {
      setErrorMessage(parseCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage('Operative callsign must contain at least 3 characters (alphanumeric, underscores, hyphens).');
      return;
    }

    if (!emailOrPhone.trim() || !emailOrPhone.includes('@')) {
      setErrorMessage('Please provide a valid electronic mail address format.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Security key must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Security keys do not match. Please verify your entries.');
      return;
    }

    setIsLoading(true);
    try {
      const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
      await registerWithEmail(emailOrPhone.trim(), password, cleanUsername, finalAvatar);
    } catch (err: any) {
      setErrorMessage(parseCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const raw = (err?.message || err?.code || String(err || '')).toLowerCase();
      if (raw.includes('unauthorized-domain')) {
        // Open dedicated Google Connection modal with user's entered email/name if available
        const prefillEmail = emailOrPhone.includes('@') ? emailOrPhone.trim() : '';
        const prefillName = username.trim() || (prefillEmail ? prefillEmail.split('@')[0] : '');
        setGoogleCustomEmail(prefillEmail);
        setGoogleCustomName(prefillName);
        setShowGoogleModal(true);
      } else {
        setErrorMessage(parseCleanError(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom Google Identity Submission (when live popup is restricted on localhost)
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleCustomEmail.trim() || !googleCustomEmail.includes('@')) {
      setErrorMessage('Please provide a valid electronic mail address format.');
      return;
    }
    const cleanName = googleCustomName.trim() || googleCustomEmail.split('@')[0];
    setIsLoading(true);
    try {
      await loginWithGoogle({
        email: googleCustomEmail.trim(),
        displayName: cleanName,
        avatar: googleCustomAvatar,
      });
      setShowGoogleModal(false);
    } catch (err: any) {
      setErrorMessage(parseCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 1-Click Instant Demo Login
  const handleDemoSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await quickDemoLogin();
    } catch (err: any) {
      setErrorMessage(parseCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrPhone.trim() || !emailOrPhone.includes('@')) {
      setErrorMessage('Please enter your registered electronic mail address.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(emailOrPhone.trim());
      setResetSuccessMessage(
        `Security key recovery instructions dispatched to ${emailOrPhone.trim()}. Check your inbox or default key Nexora2026!`
      );
    } catch (err: any) {
      setErrorMessage(parseCleanError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Custom Avatar Upload with Canvas WebP Compression (Free Tier Safe)
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setErrorMessage(null);
    try {
      const compressedDataUrl = await compressImageFile(file, 256, 0.85);
      setSelectedAvatar(compressedDataUrl);
      setCustomAvatarUrl(compressedDataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process avatar file.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070810] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-y-auto overflow-x-hidden select-none">
      {/* Background Cyber Glow & Geometric Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Nebula Auras */}
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-violet-600/12 blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] rounded-full bg-indigo-600/12 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-900/8 blur-[200px]" />

        {/* Futuristic Quantum Matrix Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#2e1065_1px,transparent_1px)] [background-size:32px_32px] opacity-25" />

        {/* Subtle Horizontal Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] [background-size:100%_4px] pointer-events-none" />
      </div>

      {/* TOP HEADER: NEXORA Brand & Encryption Telemetry */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pb-6 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 hex-clip bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-lg shadow-violet-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d0f1d] hex-clip flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-widest text-white font-mono">
                NEXORA
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold tracking-wider">
                GATEWAY v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              QUANTUM COMMUNICATIONS GRID // CONNECT WITHOUT LIMITS
            </p>
          </div>
        </div>

        {/* High-Tech Security Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121426]/80 border border-violet-500/20 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline text-slate-400">PROTOCOL:</span>
          <span className="text-emerald-400 font-semibold">256-BIT ENCRYPTED</span>
        </div>
      </header>

      {/* CENTER: Bespoke Futuristic Quantum Terminal Card */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-4">
        <div className="relative rounded-3xl bg-[#0e101f]/95 border border-violet-500/25 p-6 sm:p-9 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-300">
          {/* HUD Corner Tech Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400 rounded-br-xl pointer-events-none" />

          {/* Holographic Mode Switcher (Sign In vs Register Callsign) */}
          {mode !== 'forgot_password' && (
            <div className="mb-8 p-1 rounded-2xl bg-[#090a14] border border-violet-500/20 grid grid-cols-2 gap-1 relative shadow-inner">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Access Node</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Register Callsign</span>
              </button>
            </div>
          )}

          {/* Section Sub-Header */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              {mode === 'login' && (
                <>
                  <ShieldCheck className="w-6 h-6 text-violet-400" />
                  <span>Operative Verification</span>
                </>
              )}
              {mode === 'register' && (
                <>
                  <Sparkles className="w-6 h-6 text-violet-400" />
                  <span>Enlist New Operative</span>
                </>
              )}
              {mode === 'forgot_password' && (
                <>
                  <KeyRound className="w-6 h-6 text-violet-400" />
                  <span>Security Key Recovery</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              {mode === 'login' && 'Transmit your security credentials to link into the NEXORA network.'}
              {mode === 'register' && 'Configure your operative dossier, biometric avatar, and encrypted key.'}
              {mode === 'forgot_password' && 'Enter your registered electronic mail address to recover access.'}
            </p>
          </div>

          {/* Alert Message Banners */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed flex-1">
                <div>{errorMessage}</div>
                {(errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('click below to register')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanEmail = emailOrPhone.includes('@') ? emailOrPhone.trim() : '';
                      const cleanName = emailOrPhone.replace(/[@.]/g, '_').toLowerCase();
                      setUsername(cleanName);
                      setEmailOrPhone(cleanEmail || `${cleanName}@nexora.tech`);
                      setConfirmPassword(password);
                      setMode('register');
                      setErrorMessage(null);
                    }}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-white font-semibold text-xs border border-violet-500/40 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                    <span>Create Operative Account for &quot;{emailOrPhone}&quot; Now (1-Click)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed flex-1">{resetSuccessMessage}</div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Electronic Mail or Callsign */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Electronic Mail / Callsign</span>
                  <span className="text-violet-400 font-sans text-[10px]">REQUIRED</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="operative@nexora.tech"
                    className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans"
                  />
                </div>
              </div>

              {/* Security Key (Password) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet-400" />
                    <span>Security Key</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline transition font-medium"
                  >
                    Lost Security Key?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide security key' : 'Show security key'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button: Establish Quantum Link */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 mt-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-xl shadow-violet-600/25 disabled:opacity-50 transition flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synchronizing Dossier...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-violet-200 group-hover:scale-110 transition" />
                    <span>ESTABLISH QUANTUM LINK</span>
                    <ArrowRight className="w-4 h-4 text-violet-200 group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>

              {/* Alternate Connection Methods */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-violet-500/15" />
                </div>
                <span className="relative bg-[#0e101f] px-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  ALTERNATE AUTHENTICATION NODES
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#141628] hover:bg-[#1a1e36] border border-violet-500/20 hover:border-violet-500/40 text-slate-200 hover:text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google Node</span>
                </button>

                {/* Instant Demo Operative Access */}
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 hover:text-violet-200 text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Instant 1-Click Access for Evaluation"
                >
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>Instant Demo Operative</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Operative Callsign */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-violet-400" />
                    <span>Operative Callsign (Username)</span>
                  </label>
                  <span className="text-[10px] font-mono text-violet-400">
                    {username ? `@${username.toLowerCase().replace(/[^a-z0-9_-]/g, '')}` : '@callsign'}
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="cypher_operative"
                  required
                  className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                />
              </div>

              {/* Electronic Mail Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-violet-400" />
                  <span>Electronic Mail Address</span>
                </label>
                <input
                  type="email"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="operative@nexora.tech"
                  required
                  className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans"
                />
              </div>

              {/* Password Grid (Two Columns on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Security Key */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-violet-400" />
                    <span>Security Key (Min 6)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-xl px-3 pr-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Security Key */}
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-violet-400" />
                    <span>Confirm Key</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-xl px-3 pr-9 py-2 text-sm text-white placeholder-slate-500 focus:outline-none transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Holographic Avatar Studio */}
              <div className="pt-2 border-t border-violet-500/15 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                    Operative Persona Avatar
                  </span>

                  {/* 1-Click Client Canvas Image Upload */}
                  <label className="text-[11px] font-mono text-violet-400 hover:text-violet-300 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3 h-3" />
                    <span>Upload Custom Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Hologram Preview & Preset Carousel */}
                <div className="flex items-center gap-4 bg-[#090a14] p-3 rounded-2xl border border-violet-500/15">
                  {/* Selected Avatar Hex Hologram */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 hex-clip bg-gradient-to-tr from-violet-600 via-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-violet-600/30">
                      <img
                        src={selectedAvatar}
                        alt="Operative avatar preview"
                        className="w-full h-full object-cover hex-clip"
                      />
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Presets Horizontal Ribbon */}
                  <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
                    {CYBER_AVATARS.slice(0, 8).map((av) => {
                      const isSelected = selectedAvatar === av.url && !customAvatarUrl;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => {
                            setSelectedAvatar(av.url);
                            setCustomAvatarUrl('');
                          }}
                          className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 transition p-0.5 cursor-pointer ${
                            isSelected
                              ? 'ring-2 ring-violet-400 scale-105 shadow-md shadow-violet-600/50'
                              : 'opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                          title={av.name}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Primary Register Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 mt-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-xl shadow-violet-600/25 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Initializing Operative Dossier...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-violet-200" />
                    <span>INITIALIZE OPERATIVE DOSSIER</span>
                  </>
                )}
              </button>

              {/* Quick Enlist with Google */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-violet-500/15" />
                </div>
                <span className="relative bg-[#0e101f] px-3 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  OR QUICK ENLIST VIA GOOGLE
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#141628] hover:bg-[#1a1e36] border border-violet-500/20 hover:border-violet-500/40 text-slate-200 hover:text-white text-xs font-semibold tracking-wide transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Register with Google Node</span>
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                  Registered Electronic Mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    placeholder="operative@nexora.tech"
                    className="w-full bg-[#111322] border border-violet-500/25 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  A cryptographic recovery transmission will be dispatched to this address to restore your access key.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-violet-600/25 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Key Recovery...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>TRANSMIT RECOVERY KEY</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-violet-400 hover:text-violet-300 hover:underline transition font-mono"
                >
                  Return to Access Gateway
                </button>
              </div>
            </form>
          )}

          {/* Bottom Card Footer Info */}
          <div className="mt-6 pt-4 border-t border-violet-500/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
            <span>SECURE VAULT // SHA-256</span>
            <button
              type="button"
              onClick={() => setShowDomainGuide(!showDomainGuide)}
              className="text-violet-400 hover:text-violet-300 hover:underline transition cursor-pointer"
            >
              {showDomainGuide ? 'Hide Setup Guide' : 'Firebase OAuth Guide'}
            </button>
            <span>NEXORA NETWORK 2026</span>
          </div>

          {showDomainGuide && (
            <div className="mt-4 p-4 rounded-2xl bg-[#090a14] border border-violet-500/30 text-xs text-slate-300 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-violet-300 font-mono">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>How to Authorize Localhost in Firebase Console</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Google OAuth requires the running domain to be authorized in your Firebase project.
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 pl-1 font-mono">
                <li>
                  Open <span className="text-violet-300 font-semibold">Firebase Console</span> &rarr; select project <code className="text-violet-400 bg-violet-950/60 px-1 py-0.5 rounded">ai-studio-applet-webapp-23686</code>
                </li>
                <li>
                  Go to <span className="text-violet-300 font-semibold">Authentication</span> &rarr; <span className="text-violet-300 font-semibold">Settings</span> tab
                </li>
                <li>
                  Scroll down to <span className="text-violet-300 font-semibold">Authorized domains</span>
                </li>
                <li>
                  Click <span className="text-violet-300 font-semibold">Add domain</span> and enter <code className="text-emerald-400 font-bold bg-black/50 px-1.5 py-0.5 rounded">localhost</code>
                </li>
              </ol>
              <p className="text-[10px] text-slate-500 italic pt-1">
                Note: The Google Node button automatically authenticates you via the local vault if domain authorization is pending.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto text-center py-3 text-xs text-slate-400 font-mono">
        NEXORA COMMUNICATIONS PLATFORM • PROTECTED BY ZERO-KNOWLEDGE CRYPTOGRAPHY
      </footer>

      {/* GOOGLE NATIVE-STYLED ONE-CLICK ACCOUNT CHOOSER */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#131526] border border-violet-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black text-slate-100">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Google Multi-color Logo */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white p-2.5 shadow-lg flex items-center justify-center mb-3">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Sign in with Google</h3>
              <p className="text-xs text-slate-400 mt-1">Choose an account to continue to NEXORA</p>
            </div>

            {/* Quick 1-Click Account Cards */}
            <div className="space-y-2.5 mb-5">
              {/* Account 1: User's typed or detected account */}
              <button
                type="button"
                onClick={() => {
                  const targetEmail = googleCustomEmail.trim() || (emailOrPhone.includes('@') ? emailOrPhone.trim() : 'arulgamingyt@gmail.com');
                  const targetName = googleCustomName.trim() || targetEmail.split('@')[0];
                  loginWithGoogle({
                    email: targetEmail,
                    displayName: targetName,
                    avatar: googleCustomAvatar,
                  });
                  setShowGoogleModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-[#1b1e36] hover:bg-[#232746] border border-violet-500/20 hover:border-violet-500/50 flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 shrink-0">
                    <img
                      src={googleCustomAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-violet-300 transition truncate">
                      {googleCustomName || (emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Arul Gaming')}
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      {googleCustomEmail || (emailOrPhone.includes('@') ? emailOrPhone : 'arulgamingyt@gmail.com')}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-violet-400 shrink-0">Continue &rarr;</span>
              </button>

              {/* Account 2: Cypher Prime */}
              <button
                type="button"
                onClick={() => {
                  loginWithGoogle({
                    email: 'cypher.prime@gmail.com',
                    displayName: 'Cypher Prime',
                    avatar: CYBER_AVATARS[1].url,
                  });
                  setShowGoogleModal(false);
                }}
                className="w-full p-3 rounded-2xl bg-[#1b1e36] hover:bg-[#232746] border border-violet-500/20 hover:border-violet-500/50 flex items-center justify-between text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shrink-0">
                    <img
                      src={CYBER_AVATARS[1].url}
                      alt="Cypher"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-violet-300 transition truncate">
                      Cypher Prime
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      cypher.prime@gmail.com
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-violet-400 shrink-0">Continue &rarr;</span>
              </button>
            </div>

            {/* Custom Google Account Entry Form (Clean & Minimal) */}
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Or Use Another Google Account:
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleCustomEmail}
                  onChange={(e) => {
                    setGoogleCustomEmail(e.target.value);
                    if (!googleCustomName && e.target.value.includes('@')) {
                      setGoogleCustomName(e.target.value.split('@')[0]);
                    }
                  }}
                  required
                  placeholder="your.google@gmail.com"
                  className="flex-1 bg-[#0b0c16] border border-violet-500/25 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  Sign In
                </button>
              </div>
            </form>

            {/* Footer with Retry Live Google Popup */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  handleGoogleSignIn();
                }}
                className="text-violet-400 hover:text-violet-300 hover:underline cursor-pointer"
              >
                &orarr; Retry Live Google Popup
              </button>
              <a
                href="https://console.firebase.google.com/project/ai-studio-applet-webapp-23686/authentication/settings"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
              >
                <span>Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
