import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Hash,
  Volume2,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  Settings,
  Bell,
  LogOut,
  Shield,
  Mic,
  MicOff,
  Headphones,
  PhoneOff,
  Signal,
  Lock,
  Zap,
  Flame,
  TrendingUp,
  PlusCircle,
  FolderPlus,
  Calendar,
  MessageSquare,
  LayoutGrid,
  Eye,
  EyeOff,
  Pencil,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { Channel } from '../../types';

export const ChannelSidebar: React.FC = () => {
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
    showToast,
  } = useNexora();

  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [showAllChannels, setShowAllChannels] = useState(true);
  const [hideMutedChannels, setHideMutedChannels] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  if (!activeCommunity) return null;

  const currentRole = getCurrentUserRoleInActiveCommunity();
  const canManage = currentRole === 'owner' || currentRole === 'admin';
  const canModerate = canManage || currentRole === 'moderator';

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const getChannelIcon = (channel: Channel) => {
    if (channel.isPrivate) return <Lock className="w-4 h-4 text-amber-400" />;
    switch (channel.type) {
      case 'voice':
        return <Volume2 className="w-4 h-4 text-emerald-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-violet-400" />;
      default:
        return <Hash className="w-4 h-4 text-violet-400/80" />;
    }
  };

  const handleChannelClick = (channel: Channel) => {
    if (channel.type === 'voice') {
      connectVoice(channel.id, channel.name, activeCommunity.id);
    } else {
      setActiveChannel(channel.id);
    }
  };

  return (
    <div className="w-60 bg-[#0c0e1a] flex flex-col h-full border-r border-[#1a1c2e] select-none shrink-0 relative">
      {/* Community Header & Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
          className="w-full h-12 px-4 flex items-center justify-between font-bold text-white hover:bg-white/5 transition border-b border-[#1a1c2e] cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            {activeCommunity.icon?.startsWith('data:') || activeCommunity.icon?.startsWith('http') ? (
              <img
                src={activeCommunity.icon}
                alt=""
                className="w-5 h-5 rounded-md object-cover shrink-0"
              />
            ) : (
              <span className="text-lg">{activeCommunity.icon}</span>
            )}
            <span className="truncate text-sm">{activeCommunity.name}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-violet-300 transition-transform duration-200 ${
              isHeaderMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isHeaderMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsHeaderMenuOpen(false)}
            />
            <div className="absolute top-14 left-2 right-2 max-h-[82vh] overflow-y-auto bg-[#111214] rounded-xl shadow-2xl border border-white/10 p-1.5 z-50 space-y-0.5 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 custom-scrollbar">
              {/* 1. Server Boost */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'boost' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-pink-400 hover:bg-pink-600 hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-pink-400 group-hover:text-white" />
                  <span>Server Boost</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold group-hover:bg-white/20 group-hover:text-white">
                  Lvl {activeCommunity.boostLevel ?? 1}
                </span>
              </button>

              {/* 2. Server Tag */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'tag' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-600/30 border border-violet-500/30 text-[10px] font-bold text-violet-300 group-hover:bg-white/20 group-hover:text-white">
                    <Flame className="w-3 h-3 text-violet-400 group-hover:text-white" />
                    <span>{activeCommunity.serverTag || 'NXR'}</span>
                  </div>
                  <span>Server Tag</span>
                </div>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* 3. Invite to Server */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('invite', { communityId: activeCommunity.id });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition group"
              >
                <span>Invite to Server</span>
                <UserPlus className="w-4 h-4 text-indigo-400 group-hover:text-white" />
              </button>

              {/* 4. Server Settings */}
              {canManage && (
                <button
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'profile' });
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
                >
                  <span>Server Settings</span>
                  <Settings className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              )}

              {/* 5. Server Insights */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'insights' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>Server Insights</span>
                <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* 6. Create Channel */}
              {canModerate && (
                <button
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    openModal('create_channel', { communityId: activeCommunity.id });
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
                >
                  <span>Create Channel</span>
                  <PlusCircle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              )}

              {/* 7. Create Category */}
              {canModerate && (
                <button
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    const catName = prompt('Enter new category name:');
                    if (catName && catName.trim()) {
                      showToast(`Category "${catName.trim()}" created successfully`, 'success');
                    }
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
                >
                  <span>Create Category</span>
                  <FolderPlus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </button>
              )}

              {/* 8. Create Event */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  showToast('Server events calendar is currently a v2 preview feature.', 'info');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <span>Create Event</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">v2</span>
                </span>
                <Calendar className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* 9. Active Threads */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  showToast('Active Threads inspector is currently a v2 preview feature.', 'info');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <span>Active Threads</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">v2</span>
                </span>
                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* 10. App Directory */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'app_directory' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>App Directory</span>
                <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* 11. Show All Channels */}
              <button
                onClick={() => {
                  setShowAllChannels((prev) => !prev);
                  showToast(!showAllChannels ? 'Showing all channels' : 'Filtered channels view', 'info');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>Show All Channels</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition ${
                    showAllChannels
                      ? 'bg-violet-600 text-white'
                      : 'border border-white/30 bg-black/30'
                  }`}
                >
                  {showAllChannels && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              {/* 12. Notification Settings */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('notification_settings', { communityId: activeCommunity.id });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>Notification Settings</span>
                <Bell className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* 13. Privacy Settings */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'safety' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>Privacy Settings</span>
                <Shield className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* 14. Edit Per-server Profile */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'profile' });
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>Edit Per-server Profile</span>
                <Pencil className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* 15. Hide Muted Channels */}
              <button
                onClick={() => {
                  setHideMutedChannels((prev) => !prev);
                  showToast(!hideMutedChannels ? 'Hiding muted channels' : 'Showing muted channels', 'info');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>Hide Muted Channels</span>
                </div>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition ${
                    hideMutedChannels
                      ? 'bg-violet-600 text-white'
                      : 'border border-white/30 bg-black/30'
                  }`}
                >
                  {hideMutedChannels && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* 16. Security Actions */}
              {canManage && (
                <button
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    openModal('community_settings', { communityId: activeCommunity.id, initialTab: 'safety' });
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition group"
                >
                  <span>Security Actions</span>
                  <Lock className="w-4 h-4 text-rose-400" />
                </button>
              )}

              {/* 17. Report Raid */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  showToast('Raid Report logged into community audit stream. Automated lockdown available in v2.', 'warning');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition group"
              >
                <span className="flex items-center gap-1.5">
                  <span>Report Raid</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">Preview</span>
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              {/* 18. Copy Server ID */}
              <button
                onClick={() => {
                  setIsHeaderMenuOpen(false);
                  navigator.clipboard.writeText(activeCommunity.id);
                  showToast(`Server ID (${activeCommunity.id}) copied to clipboard`, 'info');
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-violet-600 hover:text-white transition group"
              >
                <span>Copy Server ID</span>
                <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>

              {/* Leave Community */}
              {activeCommunity.ownerId !== currentUser.id && (
                <button
                  onClick={() => {
                    setIsHeaderMenuOpen(false);
                    leaveCommunity(activeCommunity.id);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                >
                  <span>Leave Community</span>
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Quick Invite Button Bar */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => openModal('invite', { communityId: activeCommunity.id })}
          className="w-full py-2 px-3 bg-gradient-to-r from-violet-600/30 to-purple-600/30 hover:from-violet-600/50 hover:to-purple-600/50 border border-violet-500/30 rounded-xl text-xs font-semibold text-violet-200 flex items-center justify-center gap-2 transition shadow-sm group"
        >
          <UserPlus className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
          <span>Invite Friends & Generate Link</span>
        </button>
      </div>

      {/* Channels List organized by Category */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        {activeCommunity.categories.map((category) => {
          const channelsInCat = activeCommunity.channels.filter(
            (c) => c.categoryId === category.id
          );
          const isCollapsed = collapsedCategories[category.id];

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-violet-400/80 uppercase tracking-wider group">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center gap-1 hover:text-white transition"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-violet-400" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-violet-400" />
                  )}
                  <span>{category.name}</span>
                </button>

                {canModerate && (
                  <button
                    onClick={() =>
                      openModal('create_channel', {
                        communityId: activeCommunity.id,
                        categoryId: category.id,
                      })
                    }
                    title="Add Channel to Category"
                    className="opacity-0 group-hover:opacity-100 text-violet-400 hover:text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Channels */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {channelsInCat.map((channel) => {
                    const isActive = activeChannelId === channel.id;
                    const isVoiceChannel = channel.type === 'voice';
                    const isVoiceConnectedHere =
                      voiceState.isConnected && voiceState.channelId === channel.id;

                    return (
                      <div key={channel.id}>
                        <button
                          onClick={() => handleChannelClick(channel)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition group ${
                            isActive && !isVoiceChannel
                              ? 'bg-violet-600/30 text-white font-semibold border border-violet-500/30 shadow-sm'
                              : isVoiceConnectedHere
                              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="shrink-0">{getChannelIcon(channel)}</span>
                            <span className="truncate">{channel.name}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {channel.unreadCount && channel.unreadCount > 0 ? (
                              <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {channel.unreadCount}
                              </span>
                            ) : null}

                            {isVoiceConnectedHere && (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            )}
                          </div>
                        </button>

                        {/* If voice channel and active, show users inside */}
                        {isVoiceChannel && isVoiceConnectedHere && (
                          <div className="ml-6 my-1 space-y-1">
                            {voiceState.activeUsers.map((u) => (
                              <div
                                key={u.userId}
                                className="flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-slate-300"
                              >
                                <div className="relative">
                                  <img
                                    src={u.avatar}
                                    alt={u.displayName}
                                    className={`w-4 h-4 rounded-full ${
                                      u.isSpeaking
                                        ? 'ring-2 ring-emerald-400 animate-pulse'
                                        : ''
                                    }`}
                                  />
                                </div>
                                <span className="truncate">{u.displayName}</span>
                                {u.isSpeaking && (
                                  <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
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

      {/* Connected Voice Channel Status Bar */}
      {voiceState.isConnected && (
        <div className="bg-[#0b0c14] border-t border-emerald-500/20 p-2.5 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <div className="font-bold text-emerald-400 text-[11px] flex items-center gap-1">
                Voice Connected
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {voiceState.channelName} / 18ms
              </div>
            </div>
          </div>

          <button
            onClick={disconnectVoice}
            title="Disconnect Voice"
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition border border-rose-500/30"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
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
            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
              <span>{currentUser.displayName}</span>
              {currentRole === 'owner' && <span title="Owner">👑</span>}
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
            <div className="relative flex items-center justify-center">
              <Headphones className="w-4 h-4" />
              {voiceState.isDeafened && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-0.5 bg-rose-400 -rotate-45 rounded-full" />
                </div>
              )}
            </div>
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
