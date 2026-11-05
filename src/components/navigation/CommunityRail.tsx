import React from 'react';
import { useNexora } from '../../context/NexoraContext';
import { Plus, Compass, KeyRound, Sparkles, Volume2 } from 'lucide-react';

export const CommunityRail: React.FC = () => {
  const {
    communities,
    activeCommunityId,
    setActiveCommunity,
    openModal,
    voiceState,
  } = useNexora();

  const isHomeActive = activeCommunityId === null;

  return (
    <aside className="w-[72px] bg-[#070810] flex flex-col items-center py-3 select-none z-30 shrink-0 border-r border-[#1a1c2e] h-full">
      {/* Nexora Brand / DM Home Button (Discord Direct Messages) */}
      <div className="w-full flex items-center justify-center relative group mb-2">
        {/* Discord-style Left Edge White Indicator Pill */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200 ${
            isHomeActive
              ? 'h-10 opacity-100'
              : 'h-0 opacity-0 group-hover:h-5 group-hover:opacity-100'
          }`}
        />

        <button
          onClick={() => setActiveCommunity(null)}
          title="Direct Messages & Friends"
          className={`w-12 h-12 flex items-center justify-center transition-all duration-200 relative cursor-pointer ${
            isHomeActive
              ? 'bg-[#8247ff] text-white rounded-2xl shadow-lg shadow-purple-600/40'
              : 'bg-[#131526] text-[#a855f7] hover:bg-[#8247ff] hover:text-white hover:rounded-2xl rounded-3xl'
          }`}
        >
          <Sparkles className="w-6 h-6 animate-pulse" />

          {/* Discord Hover Tooltip */}
          <div className="absolute left-20 px-3 py-1.5 bg-[#181a2e] text-white text-xs font-semibold rounded-xl shadow-2xl border border-violet-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
            Direct Messages & Friends
          </div>
        </button>
      </div>

      {/* Discord Separator Line */}
      <div className="w-8 h-[2px] bg-[#20223d] rounded-full my-1.5" />

      {/* Community Servers List */}
      <div className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto custom-purple-scrollbar py-1">
        {communities.map((community) => {
          const isActive = activeCommunityId === community.id;
          const hasUnreads = community.channels.some((c) => (c.unreadCount || 0) > 0);

          return (
            <div key={community.id} className="w-full flex items-center justify-center relative group">
              {/* Discord-style Indicator Pill */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200 ${
                  isActive
                    ? 'h-10 opacity-100'
                    : hasUnreads
                    ? 'h-2 opacity-100'
                    : 'h-0 opacity-0 group-hover:h-5 group-hover:opacity-100'
                }`}
              />

              <button
                onClick={() => setActiveCommunity(community.id)}
                className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-all duration-200 relative cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-[#8247ff] text-white rounded-2xl shadow-lg shadow-purple-600/40 ring-2 ring-violet-400/30'
                    : 'bg-[#131526] text-purple-200 hover:bg-[#8247ff] hover:text-white hover:rounded-2xl rounded-3xl'
                }`}
              >
                {community.icon?.startsWith('data:') || community.icon?.startsWith('http') ? (
                  <img
                    src={community.icon}
                    alt={community.name}
                    className="w-full h-full object-cover rounded-[inherit]"
                  />
                ) : (
                  <span>{community.icon}</span>
                )}

                {/* Unread badge dot */}
                {hasUnreads && !isActive && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8247ff] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#070810]">
                    !
                  </span>
                )}

                {/* Discord Hover Tooltip */}
                <div className="absolute left-20 px-3 py-1.5 bg-[#181a2e] text-white text-xs font-semibold rounded-xl shadow-2xl border border-violet-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                  <div className="font-bold">{community.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{community.tagline}</div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Add Community Button */}
        <div className="w-full flex items-center justify-center relative group mt-1">
          <button
            onClick={() => openModal('create_community')}
            title="Create a Community"
            className="w-12 h-12 rounded-3xl bg-[#131526] text-emerald-400 hover:bg-emerald-600 hover:text-white hover:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-6 h-6" />
          </button>
          <div className="absolute left-20 px-3 py-1.5 bg-[#181a2e] text-white text-xs font-semibold rounded-xl shadow-2xl border border-violet-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
            Create a Community
          </div>
        </div>

        {/* Join by Invite Code */}
        <div className="w-full flex items-center justify-center relative group">
          <button
            onClick={() => openModal('join_invite')}
            title="Join with Invite Code"
            className="w-12 h-12 rounded-3xl bg-[#131526] text-[#a855f7] hover:bg-[#8247ff] hover:text-white hover:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <KeyRound className="w-5 h-5" />
          </button>
          <div className="absolute left-20 px-3 py-1.5 bg-[#181a2e] text-white text-xs font-semibold rounded-xl shadow-2xl border border-violet-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
            Join via Invite Code
          </div>
        </div>

        {/* Explore Communities */}
        <div className="w-full flex items-center justify-center relative group">
          <button
            onClick={() => openModal('community_discovery')}
            title="Discover Communities"
            className="w-12 h-12 rounded-3xl bg-[#131526] text-sky-400 hover:bg-sky-600 hover:text-white hover:rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
          </button>
          <div className="absolute left-20 px-3 py-1.5 bg-[#181a2e] text-white text-xs font-semibold rounded-xl shadow-2xl border border-violet-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
            Explore Communities
          </div>
        </div>
      </div>

      {/* Voice Status Pill if Connected */}
      {voiceState.isConnected && (
        <div
          title={`Connected to ${voiceState.channelName}`}
          className="mt-auto mb-2 p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 animate-pulse flex items-center justify-center cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
        </div>
      )}
    </aside>
  );
};
