import React from 'react';
import { useNexora } from '../../context/NexoraContext';
import { Crown, Shield, Zap, Radio } from 'lucide-react';
import { CommunityMember } from '../../types';

export const MemberList: React.FC = () => {
  const {
    activeCommunity,
    isMemberListOpen,
    setSelectedUserForProfile,
    allUsers,
  } = useNexora();

  if (!isMemberListOpen || !activeCommunity) return null;

  const members = activeCommunity.members.map((m) => {
    const liveUser = allUsers[m.userId] || m.user;
    return { ...m, user: liveUser };
  });

  const architects = members.filter((m) => m.role === 'owner');
  const leads = members.filter((m) => m.role === 'admin');
  const overseers = members.filter((m) => m.role === 'moderator');
  const operatives = members.filter((m) => m.role === 'member' && m.user.status !== 'offline');
  const standbyOperatives = members.filter((m) => m.user.status === 'offline');

  const renderGroup = (
    title: string,
    count: number,
    groupMembers: CommunityMember[],
    roleColor: string,
    badgeBg: string
  ) => {
    if (groupMembers.length === 0) return null;

    return (
      <div className="mb-4">
        <div
          className={`px-2 mb-1.5 text-[10px] font-mono font-bold uppercase tracking-widest ${roleColor} flex items-center justify-between`}
        >
          <span>{title}</span>
          <span className="text-[9px] opacity-80 font-mono">[{count}]</span>
        </div>

        <div className="space-y-1">
          {groupMembers.map((member) => {
            const { user, role } = member;
            return (
              <button
                key={member.userId}
                onClick={() => setSelectedUserForProfile(user)}
                className="w-full flex items-center gap-2.5 p-2 rounded-2xl hover:bg-white/5 transition text-left group"
              >
                {/* Hexagonal Operative Avatar */}
                <div className="relative shrink-0 w-8 h-8 hex-clip bg-gradient-to-tr from-violet-600 to-purple-600 p-0.5 group-hover:scale-105 transition-transform">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-full h-full object-cover hex-clip"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${
                      user.status === 'online'
                        ? 'bg-emerald-400'
                        : user.status === 'idle'
                        ? 'bg-amber-400'
                        : user.status === 'dnd'
                        ? 'bg-rose-500'
                        : 'bg-slate-500'
                    }`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        role === 'owner'
                          ? 'text-amber-300'
                          : role === 'admin'
                          ? 'text-violet-300'
                          : role === 'moderator'
                          ? 'text-cyan-300'
                          : 'text-slate-200'
                      }`}
                    >
                      {user.displayName}
                    </span>

                    {role === 'owner' && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    {role === 'admin' && <Shield className="w-3 h-3 text-violet-400 shrink-0" />}
                    {role === 'moderator' && <Zap className="w-3 h-3 text-cyan-400 shrink-0" />}
                  </div>

                  {user.customStatus && (
                    <p className="text-[10px] text-slate-400 truncate leading-tight font-mono">
                      {user.customStatus}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-60 bg-[#090b16] border-l border-[#1a1c2e] flex flex-col h-full select-none shrink-0 p-3 overflow-y-auto custom-purple-scrollbar hidden lg:flex">
      <div className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold mb-3 px-1 flex items-center justify-between border-b border-[#1a1c2e] pb-2">
        <span>MEMBERS</span>
        <span className="text-[9px] text-emerald-400 font-bold">ONLINE</span>
      </div>

      {renderGroup('Owner', architects.length, architects, 'text-amber-400', 'bg-amber-500/15')}
      {renderGroup('Admin', leads.length, leads, 'text-violet-400', 'bg-violet-500/15')}
      {renderGroup('Moderators', overseers.length, overseers, 'text-cyan-400', 'bg-cyan-500/15')}
      {renderGroup('Members', operatives.length, operatives, 'text-slate-300', 'bg-white/5')}
      {renderGroup('Offline', standbyOperatives.length, standbyOperatives, 'text-slate-500', 'bg-white/5')}
    </aside>
  );
};
