import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Hash,
  Volume2,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  Share2,
  Settings,
  LogOut,
  Mic,
  MicOff,
  Headphones,
  PhoneOff,
  Radio,
  Lock,
  Layers,
} from 'lucide-react';
import { Channel } from '../../types';

export const FloatingPodsSidebar: React.FC = () => {
  const {
    activeCommunity,
    activeChannelId,
    setActiveChannel,
    openModal,
    currentUser,
    getCurrentUserRoleInActiveCommunity,
    leaveCommunity,
    voiceState,
    connectVoice,
    disconnectVoice,
    toggleVoiceMute,
    toggleVoiceDeafen,
    setSelectedUserForProfile,
  } = useNexora();

  const [isHubMenuOpen, setIsHubMenuOpen] = useState(false);
  const [collapsedPods, setCollapsedPods] = useState<Record<string, boolean>>({});

  if (!activeCommunity) return null;

  const currentRole = getCurrentUserRoleInActiveCommunity();
  const canManage = currentRole === 'owner' || currentRole === 'admin';
  const canModerate = canManage || currentRole === 'moderator';

  const togglePod = (podId: string) => {
    setCollapsedPods((prev) => ({
      ...prev,
      [podId]: !prev[podId],
    }));
  };

  const getFrequencyIcon = (frequency: Channel) => {
    if (frequency.isPrivate) return <Lock className="w-3.5 h-3.5 text-amber-400" />;
    switch (frequency.type) {
      case 'voice':
        return <Volume2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'announcement':
        return <Zap className="w-3.5 h-3.5 text-violet-400" />;
      default:
        return <Hash className="w-3.5 h-3.5 text-violet-400/80" />;
    }
  };

  const handleFrequencyClick = (frequency: Channel) => {
    if (frequency.type === 'voice') {
      connectVoice(frequency.id, frequency.name, activeCommunity.id);
    } else {
      setActiveChannel(frequency.id);
    }
  };

  return (
    <div className="w-72 p-3 flex flex-col h-full select-none shrink-0">
      <div className="cyber-glass rounded-3xl flex flex-col h-full overflow-hidden border border-violet-500/20 shadow-2xl relative">
        {/* Hub Header & Dropdown */}
        <div className="relative border-b border-violet-500/15 p-3.5">
          <button
            onClick={() => setIsHubMenuOpen((prev) => !prev)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-2xl p-1 bg-violet-600/20 rounded-xl border border-violet-500/30">
                {activeCommunity.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm text-white truncate group-hover:text-violet-200 transition">
                  {activeCommunity.name}
                </h2>
                <p className="text-[10px] text-violet-400 font-mono uppercase tracking-wider truncate">
                  {activeCommunity.tagline}
                </p>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-violet-400 transition-transform duration-200 shrink-0 ${
                isHubMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Hub Action Dropdown */}
          {isHubMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsHubMenuOpen(false)} />
              <div className="absolute top-16 left-3 right-3 bg-[#15172b] rounded-2xl shadow-2xl border border-violet-500/30 p-1.5 z-50 space-y-1 backdrop-blur-xl animate-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsHubMenuOpen(false);
                    openModal('invite', { communityId: activeCommunity.id });
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-violet-300 hover:bg-violet-600 hover:text-white transition"
                >
                  <span>Generate Uplink Code</span>
                  <Share2 className="w-4 h-4" />
                </button>

                {canManage && (
                  <button
                    onClick={() => {
                      setIsHubMenuOpen(false);
                      openModal('community_settings', { communityId: activeCommunity.id });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>Hub Security & Config</span>
                    <Settings className="w-4 h-4" />
                  </button>
                )}

                {canModerate && (
                  <button
                    onClick={() => {
                      setIsHubMenuOpen(false);
                      openModal('create_channel', { communityId: activeCommunity.id });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>New Frequency</span>
                    <Plus className="w-4 h-4" />
                  </button>
                )}

                {activeCommunity.ownerId !== currentUser.id && (
                  <button
                    onClick={() => {
                      setIsHubMenuOpen(false);
                      leaveCommunity(activeCommunity.id);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    <span>Disconnect from Hub</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Quick Uplink Generator Button */}
        <div className="p-3 pb-1">
          <button
            onClick={() => openModal('invite', { communityId: activeCommunity.id })}
            className="w-full py-2 px-3 bg-gradient-to-r from-violet-600/20 to-purple-600/20 hover:from-violet-600/40 hover:to-purple-600/40 border border-violet-500/30 rounded-xl text-xs font-semibold text-violet-200 flex items-center justify-center gap-2 transition shadow-sm group"
          >
            <Share2 className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-12 transition-transform" />
            <span>Generate Hub Uplink</span>
          </button>
        </div>

        {/* Pods & Frequencies List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {activeCommunity.categories.map((pod) => {
            const frequenciesInPod = activeCommunity.channels.filter(
              (c) => c.categoryId === pod.id
            );
            const isCollapsed = collapsedPods[pod.id];

            return (
              <div key={pod.id} className="space-y-1">
                {/* Pod Category Header */}
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold text-violet-400/80 uppercase tracking-widest group">
                  <button
                    onClick={() => togglePod(pod.id)}
                    className="flex items-center gap-1.5 hover:text-white transition font-mono"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3 text-violet-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-violet-400" />
                    )}
                    <span>POD: {pod.name}</span>
                  </button>

                  {canModerate && (
                    <button
                      onClick={() =>
                        openModal('create_channel', {
                          communityId: activeCommunity.id,
                          categoryId: pod.id,
                        })
                      }
                      title="Add Frequency to Pod"
                      className="opacity-0 group-hover:opacity-100 text-violet-400 hover:text-white transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Frequencies inside Pod */}
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {frequenciesInPod.map((freq) => {
                      const isActive = activeChannelId === freq.id;
                      const isVoice = freq.type === 'voice';
                      const isConnectedVoice =
                        voiceState.isConnected && voiceState.channelId === freq.id;

                      return (
                        <div key={freq.id}>
                          <button
                            onClick={() => handleFrequencyClick(freq)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                              isActive && !isVoice
                                ? 'bg-gradient-to-r from-violet-600/35 to-purple-600/25 text-white border border-violet-400/40 shadow-sm'
                                : isConnectedVoice
                                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="shrink-0">{getFrequencyIcon(freq)}</span>
                              <span className="truncate">{freq.name}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {freq.unreadCount && freq.unreadCount > 0 ? (
                                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                                  {freq.unreadCount}
                                </span>
                              ) : null}

                              {isConnectedVoice && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              )}
                            </div>
                          </button>

                          {/* Voice room active operatives inside frequency */}
                          {isVoice && isConnectedVoice && (
                            <div className="ml-5 my-1.5 space-y-1 border-l border-emerald-500/30 pl-2">
                              {voiceState.activeUsers.map((u) => (
                                <div
                                  key={u.userId}
                                  className="flex items-center gap-2 py-1 text-[11px] text-slate-300"
                                >
                                  <img
                                    src={u.avatar}
                                    alt={u.displayName}
                                    className={`w-4 h-4 hex-clip ${
                                      u.isSpeaking ? 'ring-2 ring-emerald-400' : ''
                                    }`}
                                  />
                                  <span className="truncate">{u.displayName}</span>
                                  {u.isSpeaking && (
                                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse ml-auto" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Audio Frequency Connected Strip */}
        {voiceState.isConnected && (
          <div className="bg-[#0b0d1a] border-t border-emerald-500/30 p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="font-bold text-emerald-400 text-[10px] font-mono">
                  AUDIO FREQUENCY LOCKED
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                  {voiceState.channelName} / HD RTC
                </div>
              </div>
            </div>

            <button
              onClick={disconnectVoice}
              title="Cut Audio Link"
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/30"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Operative Node Console */}
        <div className="h-14 bg-[#0a0c18] px-3 flex items-center justify-between border-t border-violet-500/15 shrink-0">
          <div
            onClick={() => setSelectedUserForProfile(currentUser)}
            className="flex items-center gap-2.5 cursor-pointer p-1 rounded-xl hover:bg-white/5 transition flex-1 min-w-0 mr-1"
          >
            <div className="relative shrink-0 w-8 h-8 hex-clip bg-violet-600 p-0.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-full h-full object-cover hex-clip"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{currentUser.displayName}</span>
              </div>
              <div className="text-[10px] text-violet-400 font-mono truncate">
                {currentUser.tag}
              </div>
            </div>
          </div>

          {/* Quick Audio Controls */}
          <div className="flex items-center gap-0.5 text-slate-400">
            <button
              onClick={toggleVoiceMute}
              title={voiceState.isMuted ? 'Unmute Mic' : 'Mute Mic'}
              className={`p-1.5 rounded-lg transition ${
                voiceState.isMuted
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {voiceState.isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={toggleVoiceDeafen}
              title={voiceState.isDeafened ? 'Undeafen' : 'Deafen'}
              className={`p-1.5 rounded-lg transition ${
                voiceState.isDeafened
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5" />
                {voiceState.isDeafened && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3.5 h-0.5 bg-rose-400 -rotate-45 rounded-full" />
                  </div>
                )}
              </div>
            </button>

            <button
              onClick={() => openModal('user_settings')}
              title="Operative Console Settings"
              className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
