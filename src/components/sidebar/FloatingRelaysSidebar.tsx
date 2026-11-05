import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Users,
  Search,
  Plus,
  Mic,
  MicOff,
  Headphones,
  Settings,
  MailCheck,
  Check,
  X,
  Radio,
  Share2,
} from 'lucide-react';

export const FloatingRelaysSidebar: React.FC = () => {
  const {
    currentUser,
    dmConversations,
    activeDMId,
    setActiveDM,
    communityInvites,
    acceptInvite,
    declineInvite,
    openModal,
    setSelectedUserForProfile,
    voiceState,
    toggleVoiceMute,
    toggleVoiceDeafen,
  } = useNexora();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'relays' | 'uplinks'>('relays');

  const pendingInvites = communityInvites.filter(
    (inv) =>
      inv.status === 'pending' &&
      (!inv.targetUserId || inv.targetUserId === currentUser.id)
  );

  const filteredDMs = dmConversations.filter((dm) => {
    const otherUser = dm.participants.find((p) => p.id !== currentUser.id);
    if (!otherUser) return true;
    return (
      otherUser.displayName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      otherUser.username.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <div className="w-72 p-3 flex flex-col h-full select-none shrink-0">
      <div className="cyber-glass rounded-3xl flex flex-col h-full overflow-hidden border border-violet-500/20 shadow-2xl relative">
        {/* Search Header */}
        <div className="p-3.5 border-b border-violet-500/15">
          <button
            onClick={() => openModal('search')}
            className="w-full bg-[#121424] hover:bg-[#181a30] text-slate-400 hover:text-slate-200 text-xs px-3 py-2 rounded-xl flex items-center justify-between border border-violet-500/20 transition group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-violet-400" />
              Find private relay...
            </span>
            <kbd className="bg-[#0b0c16] px-1.5 py-0.5 rounded text-[10px] text-violet-300 font-mono border border-violet-500/20">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-2 space-y-1">
          <button
            onClick={() => setActiveTab('relays')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'relays'
                ? 'bg-violet-600/25 text-violet-200 border border-violet-400/40 shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-violet-400" />
              <span>Active Operatives</span>
            </div>
            <span className="text-[10px] bg-violet-950/60 text-violet-300 font-mono px-2 py-0.5 rounded-full border border-violet-500/20">
              {filteredDMs.length}
            </span>
          </button>

          {/* Incoming Hub Uplinks Tab */}
          <button
            onClick={() => setActiveTab('uplinks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'uplinks'
                ? 'bg-purple-600/25 text-purple-200 border border-purple-400/40 shadow-sm'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-purple-400" />
              <span>Hub Uplinks</span>
            </div>
            {pendingInvites.length > 0 && (
              <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>

        <div className="px-3">
          <div className="h-[1px] bg-white/5 w-full" />
        </div>

        {/* Main Body */}
        {activeTab === 'uplinks' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-violet-400 uppercase tracking-widest px-1">
              <span>Pending Hub Uplinks</span>
              <button
                onClick={() => openModal('join_invite')}
                className="text-[10px] text-violet-300 hover:underline"
              >
                Enter Code
              </button>
            </div>

            {pendingInvites.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-[#121424]/60 rounded-2xl border border-violet-500/10">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-violet-500/40" />
                No pending Hub uplinks. Use "Enter Uplink Code" in the top bar to connect to any hub!
              </div>
            ) : (
              pendingInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 bg-[#131528] rounded-2xl border border-violet-500/20 space-y-2 shadow-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1 bg-violet-600/20 rounded-xl">{inv.communityIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate">
                        {inv.communityName}
                      </div>
                      <div className="text-[10px] text-violet-300 font-mono truncate">
                        From @{inv.creatorName}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    {inv.communityDescription}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-slate-400 font-mono">
                      Token: {inv.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => declineInvite(inv.id)}
                        title="Decline Uplink"
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => acceptInvite(inv.code)}
                        title="Accept & Link to Hub"
                        className="px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md shadow-violet-600/30 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10px] font-bold text-violet-400/80 uppercase tracking-widest">
              <span>Direct Comms</span>
              <button
                onClick={() => openModal('search')}
                title="Initialize Private Relay"
                className="text-violet-400 hover:text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {filteredDMs.map((dm) => {
              const otherUser = dm.participants.find((p) => p.id !== currentUser.id);
              if (!otherUser) return null;
              const isActive = activeDMId === dm.id;

              return (
                <button
                  key={dm.id}
                  onClick={() => setActiveDM(dm.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition group ${
                    isActive
                      ? 'bg-violet-600/25 text-white border border-violet-400/40 shadow-md'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* Hexagonal avatar */}
                  <div className="relative shrink-0 w-8 h-8 hex-clip bg-violet-600 p-0.5">
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.displayName}
                      className="w-full h-full object-cover hex-clip"
                    />
                  </div>

                  {/* Name and snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate">
                        {otherUser.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dm.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {dm.lastMessage || 'Private relay active'}
                    </p>
                  </div>

                  {dm.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                      {dm.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
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
              <div className="text-xs font-bold text-white truncate">
                {currentUser.displayName}
              </div>
              <div className="text-[10px] text-violet-400 font-mono truncate">
                {currentUser.tag}
              </div>
            </div>
          </div>

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
