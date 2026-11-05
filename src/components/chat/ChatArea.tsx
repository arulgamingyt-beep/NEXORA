import React, { useRef, useEffect, useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { MessageItem } from './MessageItem';
import { MessageComposer } from './MessageComposer';
import { FriendsHub } from '../friends/FriendsHub';
import {
  Hash,
  Volume2,
  Zap,
  Users,
  Pin,
  Bell,
  BellOff,
  Search,
  Share2,
  X,
  Lock,
  Radio,
  LogOut,
  Ban,
} from 'lucide-react';

export const ChatArea: React.FC = () => {
  const {
    activeCommunity,
    activeChannel,
    activeDM,
    messages,
    isMemberListOpen,
    toggleMemberList,
    currentUser,
    openModal,
    showToast,
    channelMutes,
    toggleChannelMute,
    isFirestoreConnected,
    isCloudSyncing,
    connectionError,
    canUserAccessChannel,
    leaveGroupDM,
    isUserBlocked,
    unblockUser,
    typingUsers,
  } = useNexora();

  const [showPinnedDrawer, setShowPinnedDrawer] = useState(false);
  const [searchInFrequency, setSearchInFrequency] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // If in Home / DMs mode without an active conversation, show the Friends Hub
  if (!activeCommunity && !activeDM) {
    return <FriendsHub />;
  }

  const otherDMUser = activeDM
    ? activeDM.participants.find((p) => p.id !== currentUser.id)
    : null;

  const isGroupDM = Boolean(activeDM?.isGroup);
  const isTargetBlocked = otherDMUser ? isUserBlocked(otherDMUser.id) : false;

  const headerTitle = activeCommunity
    ? activeChannel?.name || 'frequency'
    : isGroupDM
    ? activeDM?.name || 'Group Transmission'
    : otherDMUser?.displayName || 'Private Relay';

  const headerTopic = activeCommunity
    ? activeChannel?.topic || `Frequency dedicated to #${activeChannel?.name}`
    : isGroupDM
    ? `${activeDM?.participants.length} operatives: ${activeDM?.participants
        .map((p) => p.displayName)
        .join(', ')}`
    : `Direct encrypted relay with @${otherDMUser?.username} (${otherDMUser?.tag})`;

  const pinnedMessages = messages.filter((m) => m.pinned);

  const isChannelRestricted = Boolean(
    activeCommunity && activeChannel && !canUserAccessChannel(activeChannel)
  );

  const currentFeedKey = activeCommunity ? activeChannel?.id : activeDM?.id;
  const activeTypingNames = (currentFeedKey && typingUsers[currentFeedKey]) || [];

  const filteredMessages = searchInFrequency.trim()
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchInFrequency.toLowerCase()) ||
        m.authorName.toLowerCase().includes(searchInFrequency.toLowerCase())
      )
    : messages;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#0f1122] relative">
      {/* Frequency Status Deck Header */}
      <header className="h-12 px-4 bg-[#0c0e1a] border-b border-[#1a1c2e] flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3 min-w-0 mr-2">
          <div className="flex items-center gap-2 min-w-0">
            {activeCommunity ? (
              <div className="p-1.5 bg-violet-600/20 rounded-xl border border-violet-500/30 text-violet-300">
                {activeChannel?.type === 'voice' ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : activeChannel?.type === 'announcement' ? (
                  <Zap className="w-4 h-4 text-violet-400" />
                ) : activeChannel?.isPrivate ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Hash className="w-4 h-4 text-violet-400" />
                )}
              </div>
            ) : isGroupDM ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-violet-600/30 shrink-0">
                {activeDM?.avatar ? (
                  <img
                    src={activeDM.avatar}
                    alt={activeDM.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </div>
            ) : (
              <div className="w-7 h-7 hex-clip bg-violet-600 p-0.5 shrink-0">
                <img
                  src={otherDMUser?.avatar}
                  alt={otherDMUser?.displayName}
                  className="w-full h-full object-cover hex-clip"
                />
              </div>
            )}

            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                {activeCommunity && (
                  <span className="text-violet-400/80 font-mono text-[10px] hidden sm:inline">
                    {activeCommunity.name} /
                  </span>
                )}
                <span>{headerTitle}</span>
              </h1>
              <div className="flex items-center gap-2">
                <p className="hidden md:block text-[10px] text-slate-400 truncate max-w-sm lg:max-w-md">
                  {headerTopic}
                </p>
                {/* Realtime persistent database status indicator */}
                <div
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                    isFirestoreConnected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : connectionError
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                  title={
                    connectionError
                      ? `Firestore notice: ${connectionError}`
                      : isCloudSyncing
                      ? 'Syncing packets to Firestore...'
                      : 'Persistent Firestore sync active'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCloudSyncing
                        ? 'bg-amber-400 animate-ping'
                        : isFirestoreConnected
                        ? 'bg-emerald-400'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {isCloudSyncing ? 'SYNCING' : isFirestoreConnected ? 'CLOUD PERSISTENT' : 'LOCAL CACHE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action HUD */}
        <div className="flex items-center gap-1.5 text-slate-400">
          {/* Group DM Leave Button */}
          {isGroupDM && (
            <button
              onClick={() => leaveGroupDM(activeDM!.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition"
              title="Leave Group Transmission"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave Group</span>
            </button>
          )}

          {/* Quick Uplink Shortcut for Communities */}
          {activeCommunity && (
            <button
              onClick={() => openModal('invite', { communityId: activeCommunity.id })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/35 text-violet-300 border border-violet-500/30 text-xs font-semibold transition"
              title="Generate Hub Uplink Code"
            >
              <Share2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Uplink</span>
            </button>
          )}

          {/* Filter / Search within Frequency */}
          {showSearchInput ? (
            <div className="flex items-center bg-[#181a2e] border border-violet-500/30 rounded-xl px-2 py-1 text-xs text-white">
              <Search className="w-3.5 h-3.5 text-violet-400 mr-1.5" />
              <input
                type="text"
                value={searchInFrequency}
                onChange={(e) => setSearchInFrequency(e.target.value)}
                placeholder="Search frequency..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-28 sm:w-36 font-mono"
                autoFocus
              />
              <button
                onClick={() => {
                  setShowSearchInput(false);
                  setSearchInFrequency('');
                }}
                className="text-slate-400 hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearchInput(true)}
              title="Search this frequency"
              className="p-2 rounded-xl hover:bg-white/5 hover:text-white transition"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Locked / Pinned Transmissions Flyout Toggle */}
          <button
            onClick={() => setShowPinnedDrawer((prev) => !prev)}
            title="Pinned Transmissions"
            className={`p-2 rounded-xl hover:bg-white/5 transition relative ${
              showPinnedDrawer ? 'text-amber-400 bg-white/5' : 'hover:text-white'
            }`}
          >
            <Pin className="w-4 h-4" />
            {pinnedMessages.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Frequency Bell Toggle */}
          {(() => {
            const currentFrequencyKey = activeCommunity ? (activeChannel?.id || '') : (activeDM?.id || '');
            const isMuted = !!channelMutes[currentFrequencyKey];
            return (
              <button
                onClick={() => {
                  if (currentFrequencyKey) {
                    toggleChannelMute(currentFrequencyKey);
                  }
                }}
                title={isMuted ? 'Unmute Alerts for this frequency' : 'Mute Alerts for this frequency'}
                className={`p-2 rounded-xl hover:bg-white/5 transition ${
                  isMuted ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white'
                }`}
              >
                {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              </button>
            );
          })()}

          {/* Toggle Operatives List */}
          {activeCommunity && (
            <button
              onClick={toggleMemberList}
              title={isMemberListOpen ? 'Hide Operatives' : 'Show Operatives'}
              className={`p-2 rounded-xl hover:bg-white/5 transition ${
                isMemberListOpen ? 'text-violet-400 bg-white/5' : 'hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Pinned Transmissions Flyout */}
      {showPinnedDrawer && (
        <div className="absolute right-4 top-16 w-80 max-h-96 bg-[#16182c] border border-violet-500/30 rounded-2xl shadow-2xl p-3 z-30 backdrop-blur-xl flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-amber-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5" />
              <span>LOCKED TRANSMISSIONS ({pinnedMessages.length})</span>
            </div>
            <button onClick={() => setShowPinnedDrawer(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No locked transmissions on this frequency.
              </p>
            ) : (
              pinnedMessages.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 bg-[#0e101f] rounded-xl border border-violet-500/10 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-300">{m.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.timestamp}</span>
                  </div>
                  <p className="text-slate-200 line-clamp-3">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Transmission Stream Feed or Locked Access Screen */}
      {isChannelRestricted ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-[#0a0b16]">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Restricted Transmission Channel</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-4">
            You do not possess the required security clearance to access{' '}
            <span className="text-violet-300 font-mono font-semibold">#{activeChannel?.name}</span>.
            This frequency is restricted to authorized roles (Administrator / Owner).
          </p>
          <div className="px-3.5 py-1.5 rounded-xl bg-[#16182c] border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>ACCESS DENIED • INSUFFICIENT OPERATIVE ROLE</span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
            {/* Cyberpunk Frequency Welcome Banner */}
            <div className="py-5 px-5 bg-gradient-to-r from-violet-950/40 via-purple-950/20 to-indigo-950/30 rounded-3xl border border-violet-500/25 mb-4 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 hex-clip bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-600/40 overflow-hidden">
                  {activeCommunity?.icon?.startsWith('data:') || activeCommunity?.icon?.startsWith('http') ? (
                    <img src={activeCommunity.icon} alt="" className="w-full h-full object-cover" />
                  ) : (
                    activeCommunity ? activeCommunity.icon : '⚡'
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block">
                    FREQUENCY INITIALIZED
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    {activeCommunity
                      ? `#${activeChannel?.name}`
                      : isGroupDM
                      ? activeDM?.name
                      : `@${otherDMUser?.displayName}`}
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {activeCommunity
                  ? `Transmitting on #${activeChannel?.name}. Real-time protocol active with cryptographic token verification.`
                  : isGroupDM
                  ? `Group encrypted frequency active. ${activeDM?.participants.length} operatives securely connected.`
                  : `Encrypted point-to-point relay established with @${otherDMUser?.username}.`}
              </p>
            </div>

            {searchInFrequency && (
              <div className="px-3 py-1.5 bg-violet-600/20 border border-violet-500/30 rounded-xl text-xs text-violet-300 flex items-center justify-between font-mono">
                <span>Matching: {filteredMessages.length} transmissions for "{searchInFrequency}"</span>
                <button onClick={() => setSearchInFrequency('')} className="underline hover:text-white">
                  Clear
                </button>
              </div>
            )}

            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                NO TRANSMISSIONS LOGGED. TRANSMIT THE FIRST PACKET BELOW.
              </div>
            ) : (
              filteredMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {activeTypingNames.length > 0 && (
            <div className="px-4 py-1.5 flex items-center gap-2 text-xs text-violet-300 font-mono animate-pulse bg-[#0c0e1a]/80 border-t border-violet-500/10">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.3s]" />
              </span>
              <span>
                {activeTypingNames.join(', ')} {activeTypingNames.length > 1 ? 'are' : 'is'} transmitting...
              </span>
            </div>
          )}

          {/* Blocked Barrier or Transmission Composer */}
          {isTargetBlocked ? (
            <div className="p-4 mx-4 my-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300 shadow-lg">
              <div className="flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                <span>You have blocked this operative. Unblock them to resume transmissions.</span>
              </div>
              <button
                onClick={() => unblockUser(otherDMUser!.id)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-md"
              >
                Unblock
              </button>
            </div>
          ) : (
            <MessageComposer
              placeholder={
                activeCommunity
                  ? `Message #${activeChannel?.name || 'frequency'}...`
                  : isGroupDM
                  ? `Message ${activeDM?.name || 'group'}...`
                  : `Message @${otherDMUser?.displayName || 'operative'}...`
              }
            />
          )}
        </>
      )}
    </div>
  );
};
