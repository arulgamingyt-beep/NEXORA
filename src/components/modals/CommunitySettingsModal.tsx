import React, { useState, useEffect, useRef } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Settings,
  Hash,
  Volume2,
  Zap,
  Trash2,
  Crown,
  UserX,
  ChevronDown,
  Check,
  Plus,
  Link,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserRole, Channel } from '../../types';

export const CommunitySettingsModal: React.FC = () => {
  const {
    activeModal,
    modalPayload,
    closeModal,
    activeCommunity,
    communities,
    updateCommunity,
    deleteChannel,
    communityInvites,
    revokeInvite,
    createInvite,
    updateMemberRole,
    kickMember,
    auditLogs,
    currentUser,
    allUsers,
    openModal,
    showToast,
  } = useNexora();

  const targetCommunity =
    communities.find((c) => c.id === modalPayload?.communityId) || activeCommunity;

  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'roles' | 'invites' | 'logs'>('roles');
  const [name, setName] = useState(targetCommunity?.name || '');
  const [tagline, setTagline] = useState(targetCommunity?.tagline || '');
  const [description, setDescription] = useState(targetCommunity?.description || '');
  const [icon, setIcon] = useState(targetCommunity?.icon || '⚡');

  // Role dropdown open state
  const [openRoleMenuUserId, setOpenRoleMenuUserId] = useState<string | null>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetCommunity) {
      setName(targetCommunity.name);
      setTagline(targetCommunity.tagline);
      setDescription(targetCommunity.description);
      setIcon(targetCommunity.icon);
    }
  }, [targetCommunity]);

  // Close role dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenRoleMenuUserId(null);
      }
    };
    if (openRoleMenuUserId) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openRoleMenuUserId]);

  if (activeModal !== 'community_settings' || !targetCommunity) return null;

  const communityInvitesList = communityInvites.filter(
    (inv) => inv.communityId === targetCommunity.id && inv.status !== 'revoked'
  );

  const communityAuditLogs = auditLogs.filter(
    (log) => log.communityId === targetCommunity.id
  );

  const handleSaveOverview = (e: React.FormEvent) => {
    e.preventDefault();
    updateCommunity(targetCommunity.id, {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      icon: icon.trim(),
    });
    showToast('Community details updated', 'success');
  };

  const availableRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'ADMIN', desc: 'Manage channels, members & moderation' },
    { role: 'moderator', label: 'MODERATOR', desc: 'Manage messages & member presence' },
    { role: 'member', label: 'MEMBER', desc: 'Standard participation privileges' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      {/* Background click to dismiss */}
      <div className="fixed inset-0" onClick={closeModal} />

      {/* Main Admin Modal Window - Sleek Obsidian & Violet Accent Geometry */}
      <div className="relative w-full max-w-[820px] h-[580px] bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-row animate-in zoom-in-95 duration-150">
        
        {/* Left Settings Navigation Sidebar */}
        <div className="w-[210px] shrink-0 bg-[#0b0c16] p-6 flex flex-col justify-between">
          <div>
            {/* Sidebar Title */}
            <div className="flex items-center gap-2 mb-6 px-1">
              <Settings className="w-4 h-4 text-[#a855f7]" />
              <span className="font-bold text-xs uppercase tracking-wider text-[#a855f7]">
                COMMUNITY ADMIN
              </span>
            </div>

            {/* Menu Items */}
            <div className="space-y-1.5">
              {/* Overview */}
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setOpenRoleMenuUserId(null);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'bg-[#8247ff] text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Overview
              </button>

              {/* Channels */}
              <button
                onClick={() => {
                  setActiveTab('channels');
                  setOpenRoleMenuUserId(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm font-medium ${
                  activeTab === 'channels'
                    ? 'bg-[#8247ff] text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Channels</span>
                <span
                  className={`text-xs ${
                    activeTab === 'channels' ? 'text-white/95 font-semibold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {targetCommunity.channels.length}
                </span>
              </button>

              {/* Roles & Members (Vibrant purple pill when active) */}
              <button
                onClick={() => {
                  setActiveTab('roles');
                  setOpenRoleMenuUserId(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm font-medium ${
                  activeTab === 'roles'
                    ? 'bg-[#8247ff] text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Roles & Members</span>
                <span
                  className={`text-xs ${
                    activeTab === 'roles' ? 'text-white/95 font-semibold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {targetCommunity.members.length}
                </span>
              </button>

              {/* Invitations */}
              <button
                onClick={() => {
                  setActiveTab('invites');
                  setOpenRoleMenuUserId(null);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm font-medium ${
                  activeTab === 'invites'
                    ? 'bg-[#8247ff] text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Invitations</span>
                <span
                  className={`text-xs ${
                    activeTab === 'invites' ? 'text-white/95 font-semibold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {communityInvitesList.length}
                </span>
              </button>

              {/* Audit Logs */}
              <button
                onClick={() => {
                  setActiveTab('logs');
                  setOpenRoleMenuUserId(null);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-2xl transition cursor-pointer text-sm font-medium ${
                  activeTab === 'logs'
                    ? 'bg-[#8247ff] text-white shadow-lg shadow-purple-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Audit Logs
              </button>
            </div>
          </div>

          {/* Bottom Close Button */}
          <div className="pt-4">
            <button
              onClick={closeModal}
              className="w-full py-3 bg-[#151728] hover:bg-[#1e2038] text-slate-300 hover:text-white font-semibold text-sm rounded-2xl transition border border-[#232644] text-center cursor-pointer shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Right Settings Content Deck */}
        <div className="flex-1 bg-[#0b0c16] px-7 py-6 flex flex-col min-h-0 overflow-hidden">
          
          {/* TAB 1: ROLES & MEMBERS (Exact Reference Match) */}
          {activeTab === 'roles' && (
            <div className="flex flex-col h-full min-h-0">
              {/* Header */}
              <div className="shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Members & Role Permissions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage member privileges across Owner, Admin, Mod, and Member
                </p>
              </div>

              {/* Members List Deck */}
              <div
                ref={roleDropdownRef}
                className="flex-1 overflow-y-auto space-y-3 pr-2.5 custom-purple-scrollbar"
              >
                {targetCommunity.members.map((member) => {
                  const u = allUsers[member.userId] || member.user;
                  const isOwner = member.role === 'owner';
                  const isSelf = member.userId === currentUser.id;
                  const isDropdownOpen = openRoleMenuUserId === member.userId;

                  const displayName = u?.displayName || 'Unknown Member';
                  const username = u?.username || 'member';
                  const avatarUrl =
                    u?.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={member.userId}
                      className="bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-3 flex items-center justify-between transition hover:border-[#2d3154] relative"
                    >
                      {/* Left: Avatar & Identity */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                            <span className="truncate">{displayName}</span>
                            {isOwner && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                            @{username}
                          </div>
                        </div>
                      </div>

                      {/* Right: Role Selector Dropdown & Kick Action */}
                      <div className="flex items-center gap-2.5 shrink-0 relative">
                        {/* Role Selector Pill */}
                        {isOwner ? (
                          <div className="bg-[#17192d] border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                            <span>OWNER</span>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenRoleMenuUserId(
                                  isDropdownOpen ? null : member.userId
                                )
                              }
                              className="bg-[#17192d] border border-[#2c2f4e] hover:border-violet-500/50 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider transition cursor-pointer"
                            >
                              <span>{member.role.toUpperCase()}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Floating Role Menu */}
                            {isDropdownOpen && (
                              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#181a2e] border border-violet-500/30 rounded-xl shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                                {availableRoles.map((r) => {
                                  const isSelected = member.role === r.role;
                                  return (
                                    <button
                                      key={r.role}
                                      type="button"
                                      onClick={() => {
                                        updateMemberRole(
                                          targetCommunity.id,
                                          member.userId,
                                          r.role
                                        );
                                        setOpenRoleMenuUserId(null);
                                        showToast(
                                          `Updated role of ${displayName} to ${r.label}`,
                                          'info'
                                        );
                                      }}
                                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition ${
                                        isSelected
                                          ? 'bg-violet-600/25 text-violet-200 font-bold'
                                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                      }`}
                                    >
                                      <div>
                                        <div className="font-bold">{r.label}</div>
                                        <div className="text-[10px] text-slate-400 font-normal">
                                          {r.desc}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Kick / Remove Member Action */}
                        {!isOwner && !isSelf && (
                          <button
                            type="button"
                            onClick={() => {
                              kickMember(targetCommunity.id, member.userId);
                              showToast(`Removed ${displayName} from community`, 'info');
                            }}
                            title={`Kick ${displayName}`}
                            className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Community Overview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update identity, branding, and details
                </p>
              </div>

              <form onSubmit={handleSaveOverview} className="flex-1 overflow-y-auto space-y-4 pr-2.5 custom-purple-scrollbar">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#121424] border border-[#20223a] focus:border-[#8247ff] rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Short catchphrase"
                    className="w-full bg-[#121424] border border-[#20223a] focus:border-[#8247ff] rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your community is all about..."
                    className="w-full bg-[#121424] border border-[#20223a] focus:border-[#8247ff] rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Community Icon Badge
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['⚡', '🔮', '🚀', '🎧', '🎮', '💡', '🌐', '🛡️', '🧬', '🔥'].map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setIcon(emoji)}
                        className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                          icon === emoji
                            ? 'bg-[#8247ff] text-white ring-2 ring-violet-400 shadow-lg shadow-purple-600/30'
                            : 'bg-[#121424] border border-[#20223a] text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#8247ff] hover:bg-[#7236f0] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="shrink-0 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Manage Channels
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    View, manage, or delete community channels ({targetCommunity.channels.length})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('create_channel', { communityId: targetCommunity.id })}
                  className="px-4 py-2 bg-[#17192d] hover:bg-[#20233b] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-[#2c2f4e] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-violet-400" />
                  <span>Create Channel</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2.5 custom-purple-scrollbar">
                {targetCommunity.channels.map((ch: Channel) => {
                  const category = targetCommunity.categories?.find((c) => c.id === ch.categoryId);
                  return (
                    <div
                      key={ch.id}
                      className="bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-3 flex items-center justify-between transition hover:border-[#2d3154]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {ch.type === 'voice' ? (
                          <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : ch.type === 'announcement' ? (
                          <Zap className="w-4 h-4 text-violet-400 shrink-0" />
                        ) : (
                          <Hash className="w-4 h-4 text-violet-400/80 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">
                            #{ch.name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                            {ch.topic || (category ? category.name : 'General Channel')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-lg bg-[#17192d] border border-[#2c2f4e] text-slate-400">
                          {ch.type}
                        </span>
                        {targetCommunity.channels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              deleteChannel(targetCommunity.id, ch.id);
                              showToast(`Channel #${ch.name} deleted`, 'info');
                            }}
                            title="Delete Channel"
                            className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: INVITATIONS */}
          {activeTab === 'invites' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="shrink-0 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Active Invitations
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Inspect and revoke active invite codes ({communityInvitesList.length})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openModal('invite', { communityId: targetCommunity.id })}
                  className="px-4 py-2 bg-[#17192d] hover:bg-[#20233b] text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-[#2c2f4e] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-violet-400" />
                  <span>Generate Link</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2.5 custom-purple-scrollbar">
                {communityInvitesList.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-slate-400">No active invitation links.</p>
                    <button
                      onClick={() => openModal('invite', { communityId: targetCommunity.id })}
                      className="mt-3 text-xs font-bold text-violet-400 hover:underline"
                    >
                      Create your first invite link
                    </button>
                  </div>
                ) : (
                  communityInvitesList.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-3 flex items-center justify-between transition hover:border-[#2d3154]"
                    >
                      <div>
                        <div className="font-mono font-bold text-sm text-violet-300">
                          {inv.code}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Uses: {inv.usesCount} / {inv.maxUses === 0 ? '∞' : inv.maxUses} • Expires: {inv.expiresAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = `https://nexora.app/invite/${inv.code}`;
                            navigator.clipboard?.writeText(url);
                            showToast(`Copied invite: ${url}`, 'success');
                          }}
                          className="px-3 py-1.5 bg-[#17192d] border border-[#2c2f4e] text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            revokeInvite(inv.id);
                            showToast('Invite link revoked', 'info');
                          }}
                          title="Revoke Invite"
                          className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Community Audit Log
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chronological security and moderation event history
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-2.5 custom-purple-scrollbar">
                {communityAuditLogs.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400">
                    No administrative events logged yet.
                  </div>
                ) : (
                  communityAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-3 space-y-1 transition hover:border-[#2d3154]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-violet-300">
                          {log.actorName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{log.details}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
