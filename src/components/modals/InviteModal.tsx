import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  X,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export const InviteModal: React.FC = () => {
  const {
    activeModal,
    modalPayload,
    closeModal,
    activeCommunity,
    communities,
    communityInvites,
    createInvite,
    revokeInvite,
    allUsers,
    currentUser,
    showToast,
  } = useNexora();

  const targetCommunity =
    communities.find((c) => c.id === modalPayload?.communityId) || activeCommunity;

  const [activeTab, setActiveTab] = useState<'link' | 'direct' | 'active_invites'>('link');
  const [expiresAt, setExpiresAt] = useState<string>('7d');
  const [maxUses, setMaxUses] = useState<number>(0); // 0 = unlimited
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string>(
    targetCommunity?.inviteCode || ''
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  if (activeModal !== 'invite' || !targetCommunity) return null;

  // Invites created for this community
  const communityActiveInvites = communityInvites.filter(
    (inv) => inv.communityId === targetCommunity.id && inv.status !== 'revoked'
  );

  const handleGenerateNewLink = () => {
    const newInv = createInvite(targetCommunity.id, {
      expiresAt,
      maxUses,
    });
    setGeneratedInviteCode(newInv.code);
  };

  const handleCopyLink = () => {
    const fullUrl = `https://nexora.app/invite/${generatedInviteCode}`;
    navigator.clipboard?.writeText(fullUrl);
    setHasCopied(true);
    showToast(`Copied invite link: ${fullUrl}`, 'success');
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleSendDirectInvite = (userId: string) => {
    createInvite(targetCommunity.id, {
      expiresAt: '1d',
      maxUses: 1,
      directUserId: userId,
    });
  };

  // Filter users for direct invite
  const eligibleUsers = Object.values(allUsers).filter((u) => {
    if (u.id === currentUser.id) return false;
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.username.toLowerCase().includes(searchUser.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-md bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#20223d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8247ff] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-600/30">
              {targetCommunity.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight tracking-tight">
                Invite to {targetCommunity.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate unique links or send direct community invitations
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-3 flex gap-4 border-b border-[#20223d] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'link'
                ? 'border-[#8247ff] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Generate Link
          </button>

          <button
            onClick={() => setActiveTab('direct')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'direct'
                ? 'border-[#8247ff] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Send Direct Invite
          </button>

          <button
            onClick={() => setActiveTab('active_invites')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'active_invites'
                ? 'border-[#8247ff] text-white font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Active Invites</span>
            <span className="text-[10px] bg-violet-600/30 text-violet-300 px-1.5 py-0.2 rounded-full font-mono">
              {communityActiveInvites.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'link' ? (
            <>
              {/* Copyable Link Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Community Invitation Link
                </label>
                <div className="flex items-center gap-2 bg-[#121424] border border-[#20223a] rounded-2xl p-1.5 pr-2 focus-within:border-[#8247ff] transition">
                  <input
                    type="text"
                    readOnly
                    value={`https://nexora.app/invite/${generatedInviteCode}`}
                    className="flex-1 bg-transparent text-xs text-violet-200 px-2 py-1 focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      hasCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#8247ff] hover:bg-[#7236f0] text-white shadow-md shadow-purple-600/30'
                    }`}
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Your invite link is configured to expire in{' '}
                  <span className="text-violet-300 font-semibold">{expiresAt === 'never' ? 'never' : expiresAt}</span>.
                </p>
              </div>

              {/* Invitation Link Settings */}
              <div className="p-4 bg-[#121424] rounded-2xl border border-[#20223a] space-y-3">
                <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span>Customize Link Constraints</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Expire After
                    </label>
                    <select
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full bg-[#181a2e] border border-[#2c2f4e] rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="30m">30 Minutes</option>
                      <option value="6h">6 Hours</option>
                      <option value="1d">1 Day</option>
                      <option value="7d">7 Days</option>
                      <option value="never">Never (Permanent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Max Number of Uses
                    </label>
                    <select
                      value={maxUses}
                      onChange={(e) => setMaxUses(Number(e.target.value))}
                      className="w-full bg-[#181a2e] border border-[#2c2f4e] rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none cursor-pointer"
                    >
                      <option value={0}>No Limit (Unlimited)</option>
                      <option value={1}>1 Use Only</option>
                      <option value={5}>5 Uses</option>
                      <option value={10}>10 Uses</option>
                      <option value={50}>50 Uses</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateNewLink}
                  className="w-full py-2 bg-[#181a2e] hover:bg-[#20233b] text-slate-200 hover:text-white border border-[#2c2f4e] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Generate New Unique Link
                </button>
              </div>
            </>
          ) : activeTab === 'direct' ? (
            <>
              {/* Direct Invite User Picker */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Search user by name or tag..."
                  className="w-full bg-[#121424] border border-[#20223a] rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition"
                />

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-purple-scrollbar">
                  {eligibleUsers.map((u) => {
                    const isAlreadyMember = targetCommunity.members.some(
                      (m) => m.userId === u.id
                    );

                    const hasDirectInvitePending = communityInvites.some(
                      (inv) =>
                        inv.communityId === targetCommunity.id &&
                        inv.targetUserId === u.id &&
                        inv.status === 'pending'
                    );

                    return (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#121424] border border-[#20223a] hover:border-[#2d3154] transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {u.displayName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              @{u.username}
                            </p>
                          </div>
                        </div>

                        {isAlreadyMember ? (
                          <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-lg">
                            Joined
                          </span>
                        ) : hasDirectInvitePending ? (
                          <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-1 rounded-lg">
                            Invite Sent
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendDirectInvite(u.id)}
                            className="px-3 py-1 bg-[#8247ff] hover:bg-[#7236f0] text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-600/30 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Invite
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Active Invites List & Revoke Controls */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-purple-scrollbar">
                {communityActiveInvites.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No active invite codes for this community.
                  </p>
                ) : (
                  communityActiveInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-[#121424] border border-[#20223a] rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-white flex items-center gap-2">
                          <span className="text-violet-300">{inv.code}</span>
                          {inv.isDirectInvite && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-sans">
                              Direct to @{inv.targetUserName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Created by {inv.creatorName} • Used {inv.usesCount} /{' '}
                          {inv.maxUses === 0 ? '∞' : inv.maxUses} times • Expires in {inv.expiresAt}
                        </div>
                      </div>

                      <button
                        onClick={() => revokeInvite(inv.id)}
                        title="Revoke / Cancel Invite Code"
                        className="p-1.5 text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
