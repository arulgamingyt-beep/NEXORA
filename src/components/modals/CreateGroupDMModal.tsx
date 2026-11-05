import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { X, Users, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

export const CreateGroupDMModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    friends,
    createGroupDM,
    showToast,
    currentUser,
  } = useNexora();

  const [groupName, setGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [groupAvatar, setGroupAvatar] = useState('');

  if (activeModal !== 'create_group_dm') return null;

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      showToast('Select at least one friend to create a group transmission', 'warning');
      return;
    }

    createGroupDM(groupName.trim(), selectedUserIds, groupAvatar.trim() || undefined);
  };

  const filteredFriends = friends.filter((f) => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      f.friend.displayName.toLowerCase().includes(q) ||
      f.friend.username.toLowerCase().includes(q) ||
      f.friend.tag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-md bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#20223d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8247ff] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-600/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight tracking-tight">
                Create Group Transmission
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add up to 9 friends to a private group channel
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

        {/* Form Body */}
        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
          {/* Group Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Group Name (Optional)
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Cyber Recon Squad"
              className="w-full bg-[#121424] border border-[#20223a] focus:border-[#8247ff] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-sans"
            />
          </div>

          {/* Search Friends */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Select Friends</span>
              <span className="text-[11px] text-violet-400 font-mono">
                {selectedUserIds.length} / 9 SELECTED
              </span>
            </div>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search friends by name or #tag..."
              className="w-full bg-[#121424] border border-[#20223a] focus:border-[#8247ff] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Friends Selection List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 border border-white/5 rounded-2xl p-1 bg-[#090a14]">
            {filteredFriends.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-mono">
                No friends found. Add friends first from the Friends Hub!
              </div>
            ) : (
              filteredFriends.map((f) => {
                const isSelected = selectedUserIds.includes(f.friend.id);

                return (
                  <div
                    key={f.friend.id}
                    onClick={() => toggleSelectUser(f.friend.id)}
                    className={`flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500/30'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={f.friend.avatar}
                        alt={f.friend.displayName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {f.friend.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          @{f.friend.username} {f.friend.tag}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ${
                        isSelected
                          ? 'bg-[#8247ff] border-[#8247ff] text-white'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#20223d]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedUserIds.length === 0}
              className="px-5 py-2.5 bg-[#8247ff] hover:bg-[#7236f0] disabled:opacity-40 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
