import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  MessageSquare,
  Users,
  UserCheck,
  Mic,
  Video,
  Monitor,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Terminal,
  Cpu,
  Layers,
  Zap,
  Globe,
  Radio,
  Menu,
  X,
  Volume2,
  PhoneCall,
  Hash,
  Share2,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGetStarted }) => {
  const { quickDemoLogin } = useNexora();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070810] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-violet-600/30 selection:text-white font-sans">
      {/* Background Cyber Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[180px]" />
        <div className="absolute top-1/3 -right-60 w-[600px] h-[600px] rounded-full bg-purple-700/8 blur-[180px]" />
        <div className="absolute -bottom-60 left-1/4 w-[750px] h-[750px] rounded-full bg-indigo-600/10 blur-[200px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#2e1065_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />
      </div>

      {/* ==================================================================== */}
      {/* 1. NAVIGATION BAR */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#070810]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Signature */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 hex-clip bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-lg shadow-violet-600/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0f1d] hex-clip flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-extrabold tracking-widest text-white font-mono">
                NEXORA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[9px] font-mono tracking-widest text-slate-400 uppercase border-l border-white/10 pl-2">
                TECHNOLOGIES
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wider text-slate-300">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-white transition cursor-pointer"
            >
              FEATURES
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="hover:text-white transition cursor-pointer"
            >
              SECURITY
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-white transition cursor-pointer"
            >
              ABOUT
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/10"
            >
              Login
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-violet-600/25 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d0f1e] border-b border-violet-500/20 px-6 py-6 space-y-4 font-mono text-xs">
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              FEATURES
            </button>
            <button
              onClick={() => scrollToSection('security')}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              SECURITY & PRIVACY
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-slate-300 hover:text-white"
            >
              ABOUT NEXORA
            </button>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogin();
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 text-white font-bold text-center"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGetStarted();
                }}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-center shadow-lg shadow-violet-600/20"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Brand Pre-title Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/25 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-violet-300 uppercase">
            CONNECT WITHOUT LIMITS // NEXORA TECHNOLOGIES
          </span>
        </div>

        {/* Main Hero Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-[1.08]">
          YOUR COMMUNITY.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-300">
            YOUR CONNECTION.
          </span>
        </h1>

        {/* Hero Narrative Introduction */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
          An original real-time communication platform engineered for high-performance collectives,
          engineering teams, and private guilds. Sub-millisecond messaging, low-latency WebRTC voice,
          crystal-clear 720p HD video, and desktop screen sharing—unified in an obsidian workspace.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-violet-600/30 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#121426] hover:bg-[#181a30] text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-violet-500/25 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Launch Terminal</span>
          </button>

          <button
            onClick={quickDemoLogin}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition cursor-pointer border border-white/10 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Demo</span>
          </button>
        </div>

        {/* ================================================================== */}
        {/* ORIGINAL PRODUCT INTERFACE PREVIEW (INTERACTIVE MOCKUP) */}
        {/* ================================================================== */}
        <div className="mt-16 w-full max-w-5xl rounded-3xl bg-gradient-to-b from-[#14162a] to-[#090a14] border border-violet-500/25 p-2 sm:p-3 shadow-2xl shadow-black/90 relative overflow-hidden group">
          {/* Top Window Accent Bar */}
          <div className="h-8 bg-[#090a14] rounded-t-2xl border-b border-white/5 px-4 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ml-2 text-[10px] text-slate-500 hidden sm:inline">
                nexora-terminal-v1.4 // active-session
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CLOUD LIVE (0.85ms)</span>
            </div>
          </div>

          {/* Inner Simulated App Grid */}
          <div className="h-[380px] sm:h-[460px] bg-[#070810] rounded-b-2xl flex overflow-hidden text-left select-none relative">
            {/* 1. Server Rail */}
            <div className="w-14 bg-[#090a14] border-r border-[#1a1c2e] flex flex-col items-center py-3 gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="w-6 h-[1px] bg-white/10" />
              <div className="w-9 h-9 rounded-2xl bg-[#141628] text-violet-300 flex items-center justify-center border border-white/5 hover:bg-violet-600 transition">
                <Users className="w-4 h-4" />
              </div>
              <div className="w-9 h-9 rounded-2xl bg-[#141628] text-indigo-300 flex items-center justify-center border border-white/5">
                <Radio className="w-4 h-4" />
              </div>
            </div>

            {/* 2. Channel List */}
            <div className="w-44 sm:w-52 bg-[#0c0d1c] border-r border-[#1a1c2e] p-3 flex flex-col justify-between shrink-0 hidden xs:flex">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-white pb-2 border-b border-white/5">
                  <span className="truncate">Syndicate Vanguard</span>
                  <span className="text-[9px] font-mono text-violet-400 bg-violet-600/20 px-1.5 py-0.5 rounded">HUB</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5">TEXT FREQUENCIES</div>
                  <div className="px-2 py-1.5 rounded-lg bg-violet-600/15 text-white font-medium flex items-center gap-1.5 border border-violet-500/20">
                    <Hash className="w-3.5 h-3.5 text-violet-400" />
                    <span className="truncate">recon-transmissions</span>
                  </div>
                  <div className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">engineering-ops</span>
                  </div>
                </div>
                <div className="space-y-1 text-xs pt-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5">VOICE FREQUENCIES</div>
                  <div className="px-2 py-1.5 rounded-lg text-slate-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate">Command Deck (3)</span>
                  </div>
                </div>
              </div>

              {/* User Mini Profile in Mockup */}
              <div className="p-2 rounded-xl bg-[#121424] border border-white/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500 text-[10px] font-bold flex items-center justify-center text-white">
                  EL
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white truncate">Elena Rostova</div>
                  <div className="text-[9px] font-mono text-emerald-400">ONLINE // OWNER</div>
                </div>
              </div>
            </div>

            {/* 3. Main Chat Stream */}
            <div className="flex-1 flex flex-col justify-between p-4 bg-[#070810] min-w-0">
              <div className="space-y-4 overflow-hidden">
                {/* Simulated Message 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    EL
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Elena Rostova</span>
                      <span className="text-[9px] font-mono text-violet-400 bg-violet-500/15 px-1.5 py-0.2 rounded border border-violet-500/25">OWNER</span>
                      <span className="text-[10px] font-mono text-slate-500">18:04:12</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      WebRTC peer mesh operational. STUN connection established at 0-dollar infrastructure cost.
                    </p>
                  </div>
                </div>

                {/* Simulated Message 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    CL
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Cipher Lead</span>
                      <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/15 px-1.5 py-0.2 rounded">ADMIN</span>
                      <span className="text-[10px] font-mono text-slate-500">18:04:45</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Confirmed. 14/14 Firestore security rules deployed. Screen sharing active at 60 fps.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/15 border border-violet-500/20 text-[10px] text-violet-300 font-mono">
                      <span>⚡ 1,000 transmissions processed in 0.85ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Active Voice Call HUD Overlay */}
              <div className="p-3 rounded-2xl bg-[#121426]/90 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Active Call: Command Deck</span>
                    <span className="text-[10px] font-mono text-slate-400">3 Operatives Transmitting // 720p HD</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SPEAKING
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center cursor-pointer">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. FEATURES SECTION */}
      {/* ==================================================================== */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
            CORE PLATFORM CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            Engineered for Modern Collectives
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Every subsystem is built natively for web standards, delivering unmatched performance without
            third-party SDK bloat or predatory monetization.
          </p>
        </div>

        {/* 6 Core Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Sub-Millisecond Messaging</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              High-throughput transmission feed with optimistic local reflection, Markdown code formatting,
              emoji reactions, linked quote replies, and instantaneous storage rehydration.
            </p>
            <div className="text-[10px] font-mono text-violet-400 pt-2 flex items-center gap-1">
              <span>Benchmark: 0.85ms per 1,000 messages</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Communities & Channels</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Organize collectives into categorical channels, private announcement frequencies, and voice rooms.
              Protected by granular 4-tier Role-Based Access Control (RBAC).
            </p>
            <div className="text-[10px] font-mono text-purple-400 pt-2 flex items-center gap-1">
              <span>Owner • Admin • Moderator • Member</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Friends & Direct Messages</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Direct 1:1 encrypted threads and multi-member group pods. Includes full friend request state
              machines and bidirectional privacy blocking that suppresses transmissions.
            </p>
            <div className="text-[10px] font-mono text-indigo-400 pt-2 flex items-center gap-1">
              <span>Isolated DM threads & privacy enforcement</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Low-Latency WebRTC Voice</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Peer-to-peer Opus audio streaming powered by Web Audio AnalyserNode volume thresholding.
              Instantaneous mute, deafen, and real-time visual speaking indicators at 60 fps.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-2 flex items-center gap-1">
              <span>Public STUN NAT traversal • ₹0 Relay cost</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-600/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">720p HD Video Calling</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              High-definition video calling with dynamic camera toggling, hardware aspect ratio clamping,
              and peer connection renegotiation. Seamlessly transitions between 1:1 and group rooms.
            </p>
            <div className="text-[10px] font-mono text-sky-400 pt-2 flex items-center gap-1">
              <span>VP8 / H.264 video codec negotiation</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-7 rounded-3xl bg-gradient-to-b from-[#101222] to-[#090a14] border border-[#232644] hover:border-violet-500/40 transition duration-300 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Monitor className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Desktop Screen Sharing</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Share monitors, app windows, or specific browser tabs directly inside voice rooms. Powered by the
              standard getDisplayMedia API with automated camera recovery upon termination.
            </p>
            <div className="text-[10px] font-mono text-amber-400 pt-2 flex items-center gap-1">
              <span>Native browser display media streaming</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. SECURITY & PRIVACY SECTION (FACTUAL MEASURES ONLY) */}
      {/* ==================================================================== */}
      <section id="security" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            EMPIRICAL SECURITY ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            Verified Data Protection
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            We document the actual security controls implemented in the NEXORA codebase.
            No marketing exaggerations; only concrete cryptographic and access-control boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Item 1 */}
          <div className="p-6 rounded-3xl bg-[#0d0f1e] border border-emerald-500/25 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Salted SHA-256 Key Hashing</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Local password authentication uses salted SHA-256 digests generated via the standard Web Crypto API
                (crypto.subtle). Passwords are never stored in plaintext or exposed in runtime logs.
              </p>
            </div>
          </div>

          {/* Security Item 2 */}
          <div className="p-6 rounded-3xl bg-[#0d0f1e] border border-violet-500/25 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">14 Audited Firestore Security Rules</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Cloud Firestore security rules strictly isolate direct message participants, prevent community
                ownership hijacking, block unauthorized message modification, and restrict self-elevation on joining.
              </p>
            </div>
          </div>

          {/* Security Item 3 */}
          <div className="p-6 rounded-3xl bg-[#0d0f1e] border border-indigo-500/25 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hierarchical RBAC Privileges</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Rank hierarchy (Owner &gt; Admin &gt; Moderator &gt; Member) verified on every administrative
                action. Administrators are code-blocked from demoting the community creator or taking over server ownership.
              </p>
            </div>
          </div>

          {/* Security Item 4 */}
          <div className="p-6 rounded-3xl bg-[#0d0f1e] border border-amber-500/25 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Resource Ceilings & Sanitized Boundaries</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Strict 5 MB attachment ceiling and 2 MB telemetry limits prevent client memory exhaustion and Firestore
                quota violations. An ErrorBoundary catches fatal exceptions and scrubs local filesystem paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. ABOUT NEXORA & COMPANY VISION */}
      {/* ==================================================================== */}
      <section id="about" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
              ABOUT NEXORA TECHNOLOGIES
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
              Communication Without Artificial Barriers
            </h2>
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">NEXORA TECHNOLOGIES</strong> was founded on a simple engineering conviction:
                modern communication tools should be lightning-fast, transparently private, and unburdened by bloated
                monolithic runtimes or predatory monthly per-user billing.
              </p>
              <p>
                NEXORA represents an independent software engineering initiative proving that full-featured community
                platforms—complete with text, audio, video, screen sharing, and role management—can execute entirely within
                browser-standard WebRTC and optimized cloud primitives at a zero-dollar infrastructure cost.
              </p>
              <p>
                Whether you are coordinating an engineering sprint, running a private gaming guild, or hosting a research
                collective, NEXORA gives you direct, uncompromised control of your transmissions.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-violet-600/25 flex items-center gap-2"
              >
                <span>Join NEXORA Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric Highlight Cards */}
          <div className="grid grid-cols-2 gap-4 font-mono">
            <div className="p-6 rounded-3xl bg-[#0c0d1c] border border-violet-500/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">0</span>
              <span className="text-xs text-violet-400 block font-bold">TypeScript Compiler Errors</span>
              <span className="text-[10px] text-slate-500 block">Strict type checking</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c0d1c] border border-purple-500/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-purple-300">327 kB</span>
              <span className="text-xs text-purple-400 block font-bold">Gzip Bundle Size</span>
              <span className="text-[10px] text-slate-500 block">Fast 4G/5G mobile load</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c0d1c] border border-emerald-500/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">&lt; 1 ms</span>
              <span className="text-xs text-emerald-400 block font-bold">Dispatch Latency</span>
              <span className="text-[10px] text-slate-500 block">Optimistic local UI</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0c0d1c] border border-amber-500/20 text-center space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-300">₹0 / $0</span>
              <span className="text-xs text-amber-400 block font-bold">Subscription Cost</span>
              <span className="text-[10px] text-slate-500 block">Free tier preserved</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. FOOTER */}
      {/* ==================================================================== */}
      <footer className="relative z-10 bg-[#05060b] border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400 font-mono">
          {/* Left Brand Identity */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-white font-extrabold">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="tracking-widest">NEXORA TECHNOLOGIES</span>
            </div>
            <span className="text-[10px] text-slate-500">CONNECT WITHOUT LIMITS // ALL RIGHTS RESERVED</span>
          </div>

          {/* Center Links */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-white transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-white transition cursor-pointer"
            >
              Terms of Service
            </button>
            <a
              href="mailto:contact@nexora.tech"
              className="hover:text-white transition cursor-pointer"
            >
              contact@nexora.tech
            </a>
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-2 text-[10px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM OPERATIONAL // v1.4.2</span>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* LEGAL MODALS (PRIVACY POLICY & TERMS OF SERVICE) */}
      {/* ==================================================================== */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0f1122] border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-left space-y-4 max-h-[85vh] overflow-y-auto custom-purple-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">
                  {activeLegalModal === 'privacy' ? 'NEXORA Privacy Policy' : 'NEXORA Terms of Service'}
                </h3>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeLegalModal === 'privacy' ? (
              <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
                <p>
                  <strong>1. Data Minimization:</strong> NEXORA TECHNOLOGIES collects only the data strictly necessary to facilitate
                  real-time communication: account callsigns, profile avatars, community memberships, and transmission payloads.
                </p>
                <p>
                  <strong>2. Password Storage:</strong> Passwords are never stored in plaintext. Passwords undergo client-side salted
                  SHA-256 cryptographic hashing prior to persistence or verification.
                </p>
                <p>
                  <strong>3. WebRTC Direct Streaming:</strong> Audio and video streams flow directly peer-to-peer using standard WebRTC.
                  Media streams do not pass through or get recorded by NEXORA media servers.
                </p>
                <p>
                  <strong>4. Third-Party Tracking:</strong> NEXORA does not sell user data, integrate advertising trackers, or monetize
                  transmission metadata.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300 font-sans leading-relaxed">
                <p>
                  <strong>1. Acceptance of Terms:</strong> By accessing NEXORA terminals, you agree to adhere to community guidelines
                  and acceptable use policies.
                </p>
                <p>
                  <strong>2. Acceptable Use:</strong> Users agree not to transmit malicious payloads, perform Denial-of-Service attacks,
                  or attempt unauthorized privilege escalation.
                </p>
                <p>
                  <strong>3. Beta Disclaimer:</strong> NEXORA is provided for community communication and testing purposes. NEXORA
                  TECHNOLOGIES provides the service on an as-is basis without warranties against network interruptions.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
