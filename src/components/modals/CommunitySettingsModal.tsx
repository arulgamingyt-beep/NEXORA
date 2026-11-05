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
  Upload,
  AlertTriangle,
  Edit3,
  Globe,
  Lock,
  Search,
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
    deleteCommunity,
    deleteChannel,
    updateChannel,
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
  const [isPublic, setIsPublic] = useState(targetCommunity?.isPublic ?? true);
  const [confirmDeleteCommunity, setConfirmDeleteCommunity] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Channel Editing State
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelTopic, setEditChannelTopic] = useState('');
  const [editChannelPrivate, setEditChannelPrivate] = useState(false);

  // Logo file input ref
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Role dropdown open state
  const [openRoleMenuUserId, setOpenRoleMenuUserId] = useState<string | null>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetCommunity) {
      setName(targetCommunity.name);
      setTagline(targetCommunity.tagline);
      setDescription(targetCommunity.description);
      setIcon(targetCommunity.icon);
      setIsPublic(targetCommunity.isPublic ?? true);
    }
  }, [targetCommunity]);

  const isOwner = targetCommunity?.ownerId === currentUser.id;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo image must be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIcon(event.target.result as string);
          showToast('Custom logo uploaded', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
      isPublic,
    });
    showToast('Community details updated', 'success');
  };

  const handleSaveChannelEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    const cleanName = editChannelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!cleanName) {
      showToast('Channel name cannot be empty', 'warning');
      return;
    }
    updateChannel(targetCommunity.id, editingChannel.id, {
      name: cleanName,
      topic: editChannelTopic.trim(),
      isPrivate: editChannelPrivate,
      allowedRoles: editChannelPrivate ? ['owner', 'admin', 'moderator'] : undefined,
    });
    setEditingChannel(null);
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
              <div className="shrink-0 mb-3">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Members & Role Permissions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage member privileges across Owner, Admin, Mod, and Member ({targetCommunity.members.length})
                </p>
              </div>

              {/* Member Search Bar */}
              <div className="relative mb-3 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Filter operatives by callsign or handle..."
                  className="w-full bg-[#121424] border border-[#20223a] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition"
                />
              </div>

              {/* Members List Deck */}
              <div
                ref={roleDropdownRef}
                className="flex-1 overflow-y-auto space-y-2.5 pr-2.5 custom-purple-scrollbar"
              >
                {targetCommunity.members
                  .filter((member) => {
                    if (!memberSearchQuery.trim()) return true;
                    const u = allUsers[member.userId] || member.user;
                    const q = memberSearchQuery.toLowerCase();
                    return (
                      u?.displayName?.toLowerCase().includes(q) ||
                      u?.username?.toLowerCase().includes(q) ||
                      member.role.toLowerCase().includes(q)
                    );
                  })
                  .map((member) => {
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Community Logo / Icon Badge
                    </label>
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs text-[#a855f7] hover:text-white flex items-center gap-1 font-semibold cursor-pointer transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Logo</span>
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#121424] border border-[#20223a] flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner">
                      {icon.startsWith('data:') || icon.startsWith('http') ? (
                        <img src={icon} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span>{icon}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 flex-1">
                      {['⚡', '🔮', '🚀', '🎧', '🎮', '💡', '🌐', '🛡️', '🧬', '🔥'].map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => setIcon(emoji)}
                          className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition cursor-pointer ${
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
                </div>

                {/* Public vs Private toggle */}
                <div className="flex items-center justify-between p-3.5 bg-[#121424] border border-[#20223a] rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    {isPublic ? (
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isPublic ? 'Public Space' : 'Private Space (Invite Only)'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {isPublic
                          ? 'Visible to all operatives; open community.'
                          : 'Hidden from server discovery; accessible by invitation link only.'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      isPublic ? 'bg-[#8247ff]' : 'bg-[#252840]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        isPublic ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#8247ff] hover:bg-[#7236f0] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Danger Zone: Dissolve Community (Owner Only) */}
                {isOwner && (
                  <div className="pt-4 border-t border-rose-500/20">
                    <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Danger Zone: Dissolve Community</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Permanently delete this community, all channels, and associated transmissions. This action cannot be undone.
                      </p>

                      {confirmDeleteCommunity ? (
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => deleteCommunity(targetCommunity.id)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
                          >
                            Confirm Dissolve Space
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCommunity(false)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCommunity(true)}
                          className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Delete Community
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

              {/* Channel Edit Sub-Form Modal */}
              {editingChannel && (
                <div className="mb-4 p-4 bg-[#121424] border border-[#8247ff]/40 rounded-2xl shadow-xl space-y-3 animate-in fade-in duration-100">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-[#a855f7]" />
                      Edit Channel: #{editingChannel.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingChannel(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveChannelEdit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                        Channel Name
                      </label>
                      <input
                        type="text"
                        value={editChannelName}
                        onChange={(e) => setEditChannelName(e.target.value)}
                        required
                        className="w-full bg-[#0b0c16] border border-[#20223a] focus:border-[#8247ff] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                        Channel Topic / Description
                      </label>
                      <input
                        type="text"
                        value={editChannelTopic}
                        onChange={(e) => setEditChannelTopic(e.target.value)}
                        placeholder="What is this channel about?"
                        className="w-full bg-[#0b0c16] border border-[#20223a] focus:border-[#8247ff] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#0b0c16] border border-[#20223a] rounded-xl">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-white block">Private Channel</span>
                          <span className="text-[10px] text-slate-400">Only authorized roles can access</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditChannelPrivate(!editChannelPrivate)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          editChannelPrivate ? 'bg-[#8247ff]' : 'bg-[#252840]'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            editChannelPrivate ? 'left-5' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingChannel(null)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#8247ff] hover:bg-[#7236f0] text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30 cursor-pointer"
                      >
                        Save Channel
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                        ) : ch.isPrivate ? (
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Hash className="w-4 h-4 text-violet-400/80 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                            <span>#{ch.name}</span>
                            {ch.isPrivate && (
                              <span className="text-[10px] text-amber-400 font-mono font-semibold px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/20 rounded">
                                PRIVATE
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate font-normal">
                            {ch.topic || (category ? category.name : 'General Channel')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-lg bg-[#17192d] border border-[#2c2f4e] text-slate-400">
                          {ch.type}
                        </span>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChannel(ch);
                            setEditChannelName(ch.name);
                            setEditChannelTopic(ch.topic || '');
                            setEditChannelPrivate(!!ch.isPrivate);
                          }}
                          title="Edit Channel"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
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
