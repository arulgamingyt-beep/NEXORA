import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Shield,
  Menu,
  ChevronDown,
  Circle,
  LogOut,
  Settings,
  Bell,
  Radio,
  Bug,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { UserStatus } from '../../types';

export const TopHubHeader: React.FC = () => {
  const {
    activeCommunity,
    activeChannel,
    openModal,
    currentUser,
    switchUser,
    allUsers,
    voiceState,
    soundEnabled,
    toggleSound,
    toggleMobileSidebar,
    communityInvites,
    setSelectedUserForProfile,
    updateUserStatus,
    showToast,
    logout,
    isFirestoreConnected,
    isCloudSyncing,
    isPlatformModerator,
  } = useNexora();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const pendingInvitesCount = communityInvites.filter(
    (inv) => inv.status === 'pending' && (!inv.targetUserId || inv.targetUserId === currentUser.id)
  ).length;

  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'owner' ||
    currentUser.email === 'admin@nexora.io' ||
    (currentUser as any).isAdmin === true;

  return (
    <header className="h-10 px-3 bg-[#070810] border-b border-[#1a1c2e] flex items-center justify-between z-30 select-none shrink-0 shadow-sm relative">
      {/* 1. Left: Mobile Toggle & NEXORA Brand Signature */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Mobile menu button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1 rounded-lg bg-violet-600/15 text-violet-400 hover:text-white transition cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* NEXORA Hex Brand Emblem */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 hex-clip bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 shadow-md shadow-violet-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d0f1d] hex-clip flex items-center justify-center text-violet-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-widest text-white font-mono">
              NEXORA
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold hidden sm:inline">
              CORE v2.6
            </span>
          </div>
        </div>

        {/* Active Context Breadcrumb */}
        {activeCommunity && (
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-2 border-l border-[#20223d]">
            <span className="font-semibold text-slate-200">{activeCommunity.name}</span>
            {activeChannel && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-violet-400 font-mono">#{activeChannel.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* 2. Center: Global Fast Switcher Search Bar (Ctrl+K) */}
      <div className="flex-1 max-w-sm sm:max-w-md mx-3">
        <button
          type="button"
          onClick={() => openModal('search')}
          className="w-full bg-[#121424] hover:bg-[#181a2e] border border-[#20223a] hover:border-[#8247ff] text-slate-400 hover:text-slate-200 text-xs px-3 py-1 rounded-xl flex items-center justify-between transition cursor-pointer group shadow-inner"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300" />
            <span className="truncate">Search channels, operatives, hubs...</span>
          </span>
          <kbd className="hidden sm:inline bg-[#090b16] px-1.5 py-0.5 rounded text-[10px] text-violet-300 font-mono border border-[#20223d]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 3. Right: Security Telemetry, Audio FX & Profile Pill */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Realtime Security Telemetry */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121424] border border-[#20223a] text-[10px] font-mono text-slate-300">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCloudSyncing
                ? 'bg-amber-400 animate-ping'
                : isFirestoreConnected
                ? 'bg-emerald-400'
                : 'bg-rose-500'
            }`}
          />
          <span className="text-slate-400">STATUS:</span>
          <span className="text-emerald-400 font-semibold">
            {isCloudSyncing ? 'SYNCING' : 'CLOUD LIVE'}
          </span>
        </div>

        {/* Voice Frequency Active Indicator if Connected */}
        {voiceState.isConnected && (
          <div
            title={`Active Audio Frequency: ${voiceState.channelName}`}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-[10px] font-mono font-semibold animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="hidden sm:inline">{voiceState.channelName}</span>
          </div>
        )}

        {/* Audio FX Synth Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Interface Sound FX' : 'Enable Interface Sound FX'}
          className={`p-1.5 rounded-lg border transition cursor-pointer ${
            soundEnabled
              ? 'bg-[#121424] text-violet-300 border-[#20223a] hover:bg-[#181a2e]'
              : 'bg-white/5 text-slate-500 border-transparent'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Welcome Manual Button */}
        <button
          onClick={() => openModal('welcome')}
          title="Open NEXORA Welcome Guide & Manual"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/20 text-xs font-mono font-bold transition cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden xl:inline">MANUAL</span>
        </button>

        {/* Private Beta Feedback Button */}
        <button
          onClick={() => openModal('beta_feedback')}
          title="Report Bug or Beta Feedback"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition cursor-pointer"
        >
          <Bug className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">FEEDBACK</span>
        </button>

        {/* Admin Feedback Dashboard Button (Admin Only) */}
        {(isAdmin || isPlatformModerator) && (
          <button
            onClick={() => openModal('admin_panel')}
            title="NEXORA Technologies Administration Control Panel"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold transition cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden lg:inline">ADMIN HUD</span>
          </button>
        )}

        {/* Pending Invites Alert */}
        {pendingInvitesCount > 0 && (
          <button
            onClick={() => openModal('invite')}
            title={`${pendingInvitesCount} pending invitation(s)`}
            className="relative p-1.5 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {pendingInvitesCount}
            </span>
          </button>
        )}

        {/* Fast User Persona / Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu((prev) => !prev)}
            className="flex items-center gap-1.5 p-1 pl-1.5 bg-[#121424] hover:bg-[#181a2e] border border-[#20223a] hover:border-[#8247ff] rounded-xl transition cursor-pointer"
          >
            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-full h-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full border border-black ${
                  currentUser.status === 'online'
                    ? 'bg-emerald-500'
                    : currentUser.status === 'idle'
                    ? 'bg-amber-400'
                    : currentUser.status === 'dnd'
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>

            <span className="hidden sm:inline text-xs font-bold text-white truncate max-w-[80px]">
              {currentUser.displayName}
            </span>

            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Persona Dropdown Menu */}
          {showPersonaMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPersonaMenu(false)} />
              <div className="absolute right-0 top-10 w-64 bg-[#0e101f] rounded-2xl shadow-2xl border border-[#20223d] p-3 z-50 backdrop-blur-xl animate-in zoom-in-95 duration-150 space-y-2.5">
                {/* User Identity Card */}
                <div className="p-2.5 rounded-xl bg-[#121424] border border-[#20223a] flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        @{currentUser.username} • {currentUser.tag}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowPersonaMenu(false);
                      openModal('user_settings');
                    }}
                    title="User Settings"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Status Selector */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                    Set Presence Status
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(['online', 'idle', 'dnd', 'offline'] as UserStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          updateUserStatus(st);
                          showToast(`Status updated to ${st.toUpperCase()}`, 'info');
                        }}
                        className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition cursor-pointer ${
                          currentUser.status === st
                            ? 'bg-[#8247ff]/20 text-white font-bold border border-[#8247ff]/40'
                            : 'bg-[#121424] text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <Circle
                          className={`w-2 h-2 fill-current ${
                            st === 'online'
                              ? 'text-emerald-400'
                              : st === 'idle'
                              ? 'text-amber-400'
                              : st === 'dnd'
                              ? 'text-rose-500'
                              : 'text-slate-500'
                          }`}
                        />
                        <span className="capitalize">{st}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Persona Switcher for Live Testing */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
                    Fast Switch Persona (Testing)
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto custom-purple-scrollbar pr-1">
                    {Object.values(allUsers).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowPersonaMenu(false);
                          showToast(`Switched persona to ${u.displayName}`, 'info');
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition cursor-pointer ${
                          currentUser.id === u.id
                            ? 'bg-[#8247ff]/20 text-white font-bold border border-[#8247ff]/40'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.displayName}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                          <span className="truncate">{u.displayName}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {u.role || 'Member'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout Button */}
                <div className="pt-2 border-t border-[#20223d]">
                  <button
                    onClick={async () => {
                      setShowPersonaMenu(false);
                      await logout();
                    }}
                    className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect Session</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
