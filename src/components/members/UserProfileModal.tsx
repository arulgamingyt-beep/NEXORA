import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { toNumericUID } from '../../utils/authVault';
import {
  X,
  MessageSquare,
  Shield,
  Crown,
  Zap,
  UserX,
  Ban,
  Terminal,
  Copy,
  Check,
  Edit3,
  KeyRound,
  LogOut,
  Mail,
  Fingerprint,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { UserRole, UserStatus } from '../../types';

export const UserProfileModal: React.FC = () => {
  const {
    selectedUserForProfile,
    setSelectedUserForProfile,
    currentUser,
    activeCommunity,
    openDMWithUser,
    updateMemberRole,
    kickMember,
    banMember,
    getCurrentUserRoleInActiveCommunity,
    updateUserStatus,
    openModal,
    resetPassword,
    logout,
    showToast,
  } = useNexora();

  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [kickReason, setKickReason] = useState('');
  const [isConfirmingKick, setIsConfirmingKick] = useState(false);
  const [hasCopiedId, setHasCopiedId] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isEditingCustomStatus, setIsEditingCustomStatus] = useState(false);
  const [customStatusInput, setCustomStatusInput] = useState('');

  if (!selectedUserForProfile) return null;

  const user = selectedUserForProfile;
  const isSelf = user.id === currentUser.id;
  const currentRole = getCurrentUserRoleInActiveCommunity();
  const canModerate = (currentRole === 'owner' || currentRole === 'admin') && !isSelf;

  const renderStatusBadge = (status: UserStatus, size = 'w-6 h-6', borderSize = 'border-[3.5px]') => {
    switch (status) {
      case 'online':
        return (
          <span
            title="Online"
            className={`${size} rounded-full bg-emerald-500 ${borderSize} border-[#0e101f] block shadow-md shrink-0`}
          />
        );
      case 'idle':
        return (
          <span
            title="Idle"
            className={`${size} rounded-full bg-amber-400 ${borderSize} border-[#0e101f] block shadow-md shrink-0`}
          />
        );
      case 'dnd':
        return (
          <span
            title="Do Not Disturb"
            className={`${size} rounded-full bg-rose-500 ${borderSize} border-[#0e101f] flex items-center justify-center shadow-md shrink-0`}
          >
            <span className="w-2.5 h-[2px] bg-white rounded-full" />
          </span>
        );
      case 'offline':
      default:
        return (
          <span
            title="Invisible"
            className={`${size} rounded-full bg-[#0e101f] ${borderSize} border-slate-400 block shadow-md shrink-0`}
          />
        );
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Invisible';
      default:
        return 'Online';
    }
  };

  const memberRecord = activeCommunity?.members.find((m) => m.userId === user.id);
  const targetRole = memberRecord?.role || user.role || 'member';

  const handleStartDM = () => {
    setSelectedUserForProfile(null);
    openDMWithUser(user.id);
  };

  const handleRoleChange = (newRole: UserRole) => {
    if (activeCommunity) {
      updateMemberRole(activeCommunity.id, user.id, newRole);
      setShowRoleSelect(false);
    }
  };

  const handleKick = () => {
    if (activeCommunity) {
      kickMember(activeCommunity.id, user.id, kickReason);
      setSelectedUserForProfile(null);
    }
  };

  const handleBan = () => {
    if (activeCommunity) {
      banMember(activeCommunity.id, user.id, kickReason);
      setSelectedUserForProfile(null);
    }
  };

  const numericUID = toNumericUID(user.id);

  const copyOperativeId = () => {
    navigator.clipboard.writeText(numericUID);
    setHasCopiedId(true);
    showToast(`Copied Operative ID: ${numericUID}`, 'info');
    setTimeout(() => setHasCopiedId(false), 2000);
  };

  const handleResetPassword = async () => {
    if (!currentUser.email) {
      showToast('No electronic mail address linked to this operative profile.', 'warning');
      return;
    }
    setIsResettingPassword(true);
    try {
      await resetPassword(currentUser.email);
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset link', 'warning');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSelfLogout = async () => {
    setSelectedUserForProfile(null);
    await logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={() => setSelectedUserForProfile(null)} />

      <div className="relative w-full max-w-sm cyber-glass-elevated rounded-3xl border border-violet-500/35 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Banner with Cyber Neon Gradients */}
        <div
          className={`h-28 bg-gradient-to-r ${
            user.bannerColor || 'from-violet-800 via-purple-900 to-indigo-950'
          } relative border-b border-violet-500/20`}
        >
          <div className="absolute top-2 left-3 text-[9px] font-mono font-bold text-violet-300/80 uppercase tracking-widest flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            OPERATIVE PROFILE {isSelf && '• SELF'}
          </div>

          <button
            onClick={() => setSelectedUserForProfile(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition border border-white/10 z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-5 pb-5 pt-0 relative">
          {/* Avatar + Speech Bubble Row (Discord-style) */}
          <div className="flex items-end justify-between -mt-12 mb-3">
            {/* Circular Avatar with Overlapping Status Indicator */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-1 bg-[#0e101f] shadow-2xl">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover rounded-full ring-2 ring-violet-500/30"
                />
              </div>
              {/* Status Badge overlapping bottom right of circular avatar */}
              <div className="absolute bottom-0 right-0">
                {renderStatusBadge(user.status, 'w-6 h-6', 'border-[3.5px]')}
              </div>
            </div>

            {/* Custom Status Speech Bubble beside Avatar */}
            <div className="flex-1 min-w-0 pl-3 pb-1">
              {isEditingCustomStatus ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateUserStatus(currentUser.status, customStatusInput.trim());
                    setIsEditingCustomStatus(false);
                  }}
                  className="w-full"
                >
                  <input
                    type="text"
                    autoFocus
                    value={customStatusInput}
                    onChange={(e) => setCustomStatusInput(e.target.value)}
                    onBlur={() => {
                      updateUserStatus(currentUser.status, customStatusInput.trim());
                      setIsEditingCustomStatus(false);
                    }}
                    placeholder="What's on your mind?"
                    className="w-full bg-[#181928] text-xs text-white placeholder-slate-400 rounded-2xl px-3 py-2 border border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-400"
                  />
                </form>
              ) : (
                <div
                  onClick={() => {
                    if (isSelf) {
                      setCustomStatusInput(user.customStatus || '');
                      setIsEditingCustomStatus(true);
                    }
                  }}
                  className={`relative bg-[#181928] border border-white/10 rounded-2xl px-3 py-2 text-xs shadow-lg ${
                    isSelf ? 'cursor-pointer hover:border-violet-500/40 hover:bg-[#202235] transition group' : ''
                  }`}
                >
                  {/* Speech bubble pointer notch pointing to avatar */}
                  <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#181928] border-l border-b border-white/10 rotate-45" />

                  <div className="relative z-10 truncate flex items-center gap-1.5">
                    {user.customStatus ? (
                      <span className="text-slate-200 text-xs font-medium truncate">{user.customStatus}</span>
                    ) : isSelf ? (
                      <span className="text-slate-400 italic text-[11px] flex items-center gap-1.5 group-hover:text-slate-300">
                        <span className="text-sm font-bold leading-none text-violet-400">+</span>
                        <span>What's on your mind?</span>
                      </span>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Names & Discord-Style Badges */}
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5">
              <span>{user.displayName}</span>
              <span className="text-xs text-violet-400">⚡</span>
            </h3>

            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-mono text-xs">
                @{user.username}
              </span>

              {/* Badges Pill Row */}
              <div className="flex items-center gap-1">
                {targetRole === 'owner' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    OWNER
                  </span>
                )}
                {targetRole === 'admin' && (
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    ADMIN
                  </span>
                )}
                {targetRole === 'moderator' && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold font-mono flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    MOD
                  </span>
                )}
                {targetRole === 'member' && (
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-[10px] font-bold font-mono flex items-center gap-1">
                    🗡️ OPERATIVE
                  </span>
                )}
                <span className="px-1.5 py-0.5 rounded-md bg-violet-950/40 text-violet-400 border border-violet-500/20 text-[10px] font-mono">
                  🎮
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-violet-950/40 text-violet-400 border border-violet-500/20 text-[10px] font-mono">
                  ⚔️
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-violet-950/40 text-violet-400 border border-violet-500/20 text-[10px] font-mono">
                  🔮
                </span>
              </div>
            </div>
          </div>

          {/* Action Card: Edit Profile & Discord-Style Status Selector */}
          <div className="mt-4 bg-[#0a0c18] rounded-2xl p-1.5 border border-white/5 space-y-1">
            {isSelf ? (
              <>
                {/* Edit Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForProfile(null);
                    openModal('user_settings');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition group"
                >
                  <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition" />
                  <span>Edit Profile</span>
                </button>

                <div className="h-[1px] bg-white/5 mx-2" />

                {/* Discord Status Item (replaces the old PRESENCE TELEMETRY label) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusDropdown((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-3">
                      {renderStatusBadge(currentUser.status, 'w-4 h-4', 'border-[2px]')}
                      <span className="text-white">{getStatusLabel(currentUser.status)}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        showStatusDropdown ? 'rotate-90 text-violet-400' : 'group-hover:text-slate-200'
                      }`}
                    />
                  </button>

                  {/* Discord-style status submenu dropdown */}
                  {showStatusDropdown && (
                    <div className="mt-1 p-1 bg-[#121424] rounded-xl border border-violet-500/25 shadow-xl space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        {
                          status: 'online' as UserStatus,
                          label: 'Online',
                          desc: '',
                        },
                        {
                          status: 'idle' as UserStatus,
                          label: 'Idle',
                          desc: '',
                        },
                        {
                          status: 'dnd' as UserStatus,
                          label: 'Do Not Disturb',
                          desc: 'You will not receive any desktop notifications',
                        },
                        {
                          status: 'offline' as UserStatus,
                          label: 'Invisible',
                          desc: 'You will not appear online, but will have full access',
                        },
                      ].map((item) => (
                        <button
                          key={item.status}
                          type="button"
                          onClick={() => {
                            updateUserStatus(item.status);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition ${
                            currentUser.status === item.status
                              ? 'bg-violet-600/25 text-white border border-violet-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {renderStatusBadge(item.status, 'w-3.5 h-3.5', 'border-[2px]')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold leading-tight">{item.label}</div>
                            {item.desc && (
                              <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                {item.desc}
                              </div>
                            )}
                          </div>
                          {currentUser.status === item.status && (
                            <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 self-center" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* For another user: Send Message / Relay + Report */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartDM}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/30 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserForProfile(null);
                    openModal('report_abuse', {
                      targetType: 'user',
                      targetId: user.id,
                      targetName: `@${user.username} (${user.displayName})`,
                    });
                  }}
                  title="Report User to Administration"
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl transition cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="h-[1px] bg-white/10 my-3" />

          {/* Dossier Specifications */}
          <div className="space-y-3 text-xs">
            {/* Unique Operative ID */}
            <div>
              <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" />
                  Operative UID
                </span>
                <button
                  type="button"
                  onClick={copyOperativeId}
                  className="text-[10px] text-violet-300 hover:text-white flex items-center gap-1 transition lowercase"
                >
                  {hasCopiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{hasCopiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </span>
              <div className="font-mono text-[11px] text-slate-300 bg-[#090b16] px-2 py-1 rounded-lg border border-violet-500/15 mt-1 truncate select-all tracking-wide">
                {numericUID}
              </div>
            </div>

            {/* Email Address (Protected for self) */}
            {isSelf && user.email && (
              <div>
                <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Electronic Mail (Private)
                </span>
                <p className="text-slate-300 font-mono text-xs mt-0.5">{user.email}</p>
              </div>
            )}

            <div>
              <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest">
                Node Specification
              </span>
              <p className="text-slate-300 mt-0.5 leading-relaxed text-xs">
                {user.bio || 'Active node operative connected without limits on NEXORA.'}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest block">
                  Uplink Since
                </span>
                <span className="text-slate-300 font-mono text-[11px]">{user.joinedAt}</span>
              </div>

              {activeCommunity && (
                <div className="text-right">
                  <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest block">
                    Access Level
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      targetRole === 'owner'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : targetRole === 'admin'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : targetRole === 'moderator'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-white/5 text-slate-300 border border-white/10'
                    }`}
                  >
                    {targetRole === 'owner'
                      ? 'ARCHITECT'
                      : targetRole === 'admin'
                      ? 'LEAD'
                      : targetRole === 'moderator'
                      ? 'OVERSEER'
                      : 'OPERATIVE'}
                  </span>
                </div>
              )}
            </div>

            {/* Self Actions: Password Reset & Logout */}
            {isSelf && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                  <span>{isResettingPassword ? 'Sending reset email...' : 'Send Password Reset Email'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSelfLogout}
                  className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Disconnect Terminal Session</span>
                </button>
              </div>
            )}

            {/* Access Level Switcher for Leads/Architects */}
            {canModerate && activeCommunity && (
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[9px] font-mono text-violet-400 uppercase tracking-widest">
                    Modify Access Privileges
                  </span>
                  <button
                    onClick={() => setShowRoleSelect((prev) => !prev)}
                    className="text-[10px] text-violet-300 hover:underline flex items-center gap-1 font-mono"
                  >
                    Set Level
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {showRoleSelect && (
                  <div className="mt-2 p-1.5 bg-[#0a0c18] rounded-xl border border-violet-500/30 space-y-1">
                    {(['admin', 'moderator', 'member'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold uppercase transition ${
                          targetRole === r
                            ? 'bg-violet-600 text-white'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {r === 'admin' ? 'Lead' : r === 'moderator' ? 'Overseer' : 'Operative'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Administration for Moderators */}
          {canModerate && activeCommunity && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="font-bold text-[9px] font-mono text-rose-400 uppercase tracking-widest block mb-2">
                Security Administration
              </span>

              {isConfirmingKick ? (
                <div className="p-2.5 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-2">
                  <p className="text-xs text-rose-200">
                    Sever uplink or permanently ban operative {user.displayName}?
                  </p>
                  <input
                    type="text"
                    value={kickReason}
                    onChange={(e) => setKickReason(e.target.value)}
                    placeholder="Reason for protocol action..."
                    className="w-full bg-[#0a0c18] border border-rose-500/30 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsConfirmingKick(false)}
                      className="px-2 py-1 bg-white/5 text-slate-300 rounded text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleKick}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs"
                    >
                      Sever Uplink
                    </button>
                    <button
                      onClick={handleBan}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs"
                    >
                      Permanently Ban
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsConfirmingKick(true)}
                    className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Sever Uplink
                  </button>
                  <button
                    onClick={() => setIsConfirmingKick(true)}
                    className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Ban Node
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
