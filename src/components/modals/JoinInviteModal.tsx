import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { X, KeyRound, Users, ArrowRight } from 'lucide-react';

export const JoinInviteModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    acceptInvite,
    communities,
    communityInvites,
    currentUser,
  } = useNexora();

  const [inviteInput, setInviteInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (activeModal !== 'join_invite') return null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!inviteInput.trim()) {
      setErrorMsg('Please enter an invite code or link.');
      return;
    }
    const success = acceptInvite(inviteInput.trim());
    if (!success) {
      setErrorMsg('Invalid or expired invitation link. Please verify the code.');
    }
  };

  // Preview match if typed
  const matchedInvite = communityInvites.find(
    (inv) =>
      inv.code.toLowerCase() === inviteInput.trim().toLowerCase() ||
      inv.code.toLowerCase() ===
        inviteInput.trim().toLowerCase().replace('https://nexora.app/invite/', '')
  );

  const matchedCommunity =
    communities.find(
      (c) =>
        c.inviteCode.toLowerCase() === inviteInput.trim().toLowerCase() ||
        c.id === matchedInvite?.communityId
    ) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-lg bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#20223d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8247ff] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-600/30">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight tracking-tight">
                Join a Community
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter an invitation code or explore popular communities
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

        <div className="p-6 space-y-4">
          {/* Invite Code Input Form */}
          <form onSubmit={handleJoin} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Invite Code or Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inviteInput}
                  onChange={(e) => {
                    setInviteInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="e.g. NXR-HQ-8821 or https://nexora.app/invite/NXR-HQ-8821"
                  className="flex-1 bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] font-mono transition"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8247ff] hover:bg-[#7236f0] text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-400 mt-1.5 font-semibold">{errorMsg}</p>
              )}
            </div>

            {/* Quick helper code links */}
            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span>Quick test codes:</span>
              <button
                type="button"
                onClick={() => setInviteInput('NXR-HQ-8821')}
                className="text-violet-300 hover:underline font-mono bg-[#121424] border border-[#20223a] px-2 py-0.5 rounded-lg cursor-pointer"
              >
                NXR-HQ-8821
              </button>
              <button
                type="button"
                onClick={() => setInviteInput('CYBER-LAB-990')}
                className="text-violet-300 hover:underline font-mono bg-[#121424] border border-[#20223a] px-2 py-0.5 rounded-lg cursor-pointer"
              >
                CYBER-LAB-990
              </button>
              <button
                type="button"
                onClick={() => setInviteInput('SYNTH-BEATS-404')}
                className="text-violet-300 hover:underline font-mono bg-[#121424] border border-[#20223a] px-2 py-0.5 rounded-lg cursor-pointer"
              >
                SYNTH-BEATS-404
              </button>
            </div>
          </form>

          {/* If preview matches */}
          {matchedCommunity && (
            <div className="p-3.5 bg-[#121424] rounded-2xl border border-[#8247ff]/40 space-y-2 animate-in fade-in">
              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                Community Preview Found
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{matchedCommunity.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-sm">
                    {matchedCommunity.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {matchedCommunity.tagline}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => acceptInvite(matchedCommunity.inviteCode)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
                >
                  Join Now
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 py-1">
            <div className="h-[1px] bg-[#20223d] flex-1" />
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Or Explore Public Hubs
            </span>
            <div className="h-[1px] bg-[#20223d] flex-1" />
          </div>

          {/* Public Communities Discovery */}
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1 custom-purple-scrollbar">
            {communities.map((comm) => {
              const isMember = comm.members.some((m) => m.userId === currentUser.id);

              return (
                <div
                  key={comm.id}
                  className="p-3 bg-[#121424] rounded-2xl border border-[#20223a] flex items-center justify-between hover:border-[#2d3154] transition"
                >
                  <div className="flex items-center gap-3 min-w-0 mr-2">
                    <span className="text-2xl">{comm.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate">
                        {comm.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {comm.description}
                      </div>
                      <div className="text-[10px] text-violet-400 font-mono mt-0.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{comm.members.length} members</span>
                      </div>
                    </div>
                  </div>

                  {isMember ? (
                    <span className="px-2.5 py-1 rounded-xl bg-white/5 text-slate-400 text-xs font-semibold shrink-0">
                      Member
                    </span>
                  ) : (
                    <button
                      onClick={() => acceptInvite(comm.inviteCode)}
                      className="px-3.5 py-1.5 bg-[#8247ff] hover:bg-[#7236f0] text-white rounded-xl text-xs font-semibold shrink-0 shadow-md shadow-purple-600/30 transition cursor-pointer"
                    >
                      Join
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
