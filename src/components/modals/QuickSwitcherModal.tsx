import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { Search, Hash, Volume2, X } from 'lucide-react';

export const QuickSwitcherModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    communities,
    setActiveCommunity,
    setActiveChannel,
    allUsers,
    openDMWithUser,
    currentUser,
  } = useNexora();

  const [query, setQuery] = useState('');

  if (activeModal !== 'search') return null;

  // Flatten all channels
  const allChannels = communities.flatMap((c) =>
    c.channels.map((ch) => ({
      ...ch,
      communityName: c.name,
      communityIcon: c.icon,
    }))
  );

  const filteredChannels = query.trim()
    ? allChannels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(query.toLowerCase()) ||
          ch.communityName.toLowerCase().includes(query.toLowerCase())
      )
    : allChannels.slice(0, 5);

  const filteredUsers = query.trim()
    ? Object.values(allUsers).filter(
        (u) =>
          u.id !== currentUser.id &&
          (u.displayName.toLowerCase().includes(query.toLowerCase()) ||
            u.username.toLowerCase().includes(query.toLowerCase()))
      )
    : Object.values(allUsers)
        .filter((u) => u.id !== currentUser.id)
        .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-lg bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="p-4 px-5 border-b border-[#20223d] flex items-center gap-3">
          <Search className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where would you like to go? (channels, users, hubs)"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            autoFocus
          />
          <button
            onClick={closeModal}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto space-y-4 custom-purple-scrollbar">
          {/* Channels */}
          <div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider px-2 mb-1.5">
              Channels
            </div>
            <div className="space-y-1">
              {filteredChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveCommunity(ch.communityId);
                    setActiveChannel(ch.id);
                    closeModal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#121424] border border-[#20223a] hover:border-[#8247ff] text-left transition group text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-slate-200 group-hover:text-white">
                    {ch.type === 'voice' ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Hash className="w-4 h-4 text-violet-400" />
                    )}
                    <span className="font-semibold">#{ch.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {ch.communityIcon} {ch.communityName}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Users */}
          <div>
            <div className="text-[10px] font-bold text-violet-400 uppercase tracking-wider px-2 mb-1.5">
              Users & Direct Messages
            </div>
            <div className="space-y-1">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    openDMWithUser(u.id);
                    closeModal();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#121424] border border-[#20223a] hover:border-[#8247ff] text-left transition group text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      {u.displayName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      @{u.username}
                    </span>
                  </div>
                  <span className="text-[10px] text-violet-400 font-semibold">
                    Message
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
