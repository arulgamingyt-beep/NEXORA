import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Users,
  MessageSquare,
  Search,
  Plus,
  Mic,
  MicOff,
  Headphones,
  Settings,
  MailCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export const DirectMessagesSidebar: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'dms' | 'invites'>('dms');

  // Filter pending direct invites for current user
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
    <div className="w-60 bg-[#0c0e1a] flex flex-col h-full border-r border-[#1a1c2e] select-none shrink-0">
      {/* Search Header */}
      <div className="h-12 px-3 flex items-center border-b border-[#1a1c2e]">
        <button
          onClick={() => openModal('search')}
          className="w-full bg-[#181a2e] hover:bg-[#1f223d] text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-[#232644] transition group cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-violet-400" />
            Find or start a conversation
          </span>
          <kbd className="bg-[#121324] px-1.5 py-0.5 rounded text-[10px] text-violet-300 font-mono border border-violet-500/20">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Tabs / Quick Nav */}
      <div className="p-2 space-y-1">
        <button
          onClick={() => setActiveTab('dms')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'dms'
              ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Friends</span>
          </div>
          <span className="text-xs bg-violet-950/60 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/20">
            Online (4)
          </span>
        </button>

        {/* Community Invitations Tab */}
        <button
          onClick={() => setActiveTab('invites')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'invites'
              ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <MailCheck className="w-4 h-4 text-purple-400" />
            <span>Community Invites</span>
          </div>
          {pendingInvites.length > 0 && (
            <span className="text-xs bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
              {pendingInvites.length}
            </span>
          )}
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="h-[1px] bg-white/5 w-full" />
      </div>

      {/* Main Tab Content */}
      {activeTab === 'invites' ? (
        <div className="flex-1 overflow-y-auto px-3 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-violet-400 uppercase tracking-wider px-1">
            <span>Pending Invitations</span>
            <button
              onClick={() => openModal('join_invite')}
              className="text-[10px] text-violet-300 hover:underline flex items-center gap-1"
            >
              Enter Code
            </button>
          </div>

          {pendingInvites.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-[#16182c]/40 rounded-xl border border-violet-500/10">
              <MailCheck className="w-8 h-8 mx-auto mb-2 text-violet-500/40" />
              No pending community invites. Use "Join via Invite Code" to enter an invite code!
            </div>
          ) : (
            pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="p-3 bg-[#16182c] rounded-xl border border-violet-500/20 space-y-2 shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{inv.communityIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white truncate">
                      {inv.communityName}
                    </div>
                    <div className="text-[11px] text-violet-300 truncate">
                      From {inv.creatorName}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2">
                  {inv.communityDescription}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Code: {inv.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => declineInvite(inv.id)}
                      title="Decline Invitation"
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => acceptInvite(inv.code)}
                      title="Accept & Join Community"
                      className="px-2.5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-md shadow-violet-600/30 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Join
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {/* Direct Messages Section Header */}
          <div className="flex items-center justify-between px-2 pt-2 pb-1 text-xs font-bold text-violet-400/80 uppercase tracking-wider">
            <span>Direct Messages</span>
            <button
              onClick={() => openModal('search')}
              title="Create Direct Message"
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
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left transition group ${
                  isActive
                    ? 'bg-violet-600/25 text-white border border-violet-500/30 shadow-md'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* User Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.displayName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500/30"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#11121e] ${
                      otherUser.status === 'online'
                        ? 'bg-emerald-500'
                        : otherUser.status === 'idle'
                        ? 'bg-amber-400'
                        : otherUser.status === 'dnd'
                        ? 'bg-rose-500'
                        : 'bg-slate-400'
                    }`}
                  />
                </div>

                {/* Name & Snippet */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate">
                      {otherUser.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {dm.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {dm.lastMessage || 'Start a conversation'}
                  </p>
                </div>

                {/* Unread badge */}
                {dm.unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {dm.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* User Mini Bar */}
      <div className="h-14 bg-[#080914] px-2.5 flex items-center justify-between border-t border-[#1a1c2e] shrink-0">
        <div
          onClick={() => setSelectedUserForProfile(currentUser)}
          className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg hover:bg-white/5 transition flex-1 min-w-0 mr-1"
        >
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500/40"
            />
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0d0e17] ${
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
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">
              {currentUser.displayName}
            </div>
            <div className="text-[10px] text-violet-300 font-mono truncate">
              {currentUser.tag}
            </div>
          </div>
        </div>

        {/* Audio / Settings Quick Actions */}
        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            onClick={toggleVoiceMute}
            title={voiceState.isMuted ? 'Unmute Mic' : 'Mute Mic'}
            className={`p-1.5 rounded-lg transition ${
              voiceState.isMuted
                ? 'text-rose-400 hover:bg-rose-500/10'
                : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleVoiceDeafen}
            title={voiceState.isDeafened ? 'Undeafen' : 'Deafen'}
            className={`p-1.5 rounded-lg transition ${
              voiceState.isDeafened
                ? 'text-rose-400 hover:bg-rose-500/10'
                : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
          </button>

          <button
            onClick={() => openModal('user_settings')}
            title="User Settings"
            className="p-1.5 rounded-lg hover:bg-white/5 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
