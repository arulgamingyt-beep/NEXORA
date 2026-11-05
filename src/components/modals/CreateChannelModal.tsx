import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { X, Hash, Volume2, Megaphone, Lock } from 'lucide-react';
import { ChannelType } from '../../types';

export const CreateChannelModal: React.FC = () => {
  const { activeModal, modalPayload, closeModal, createChannel, activeCommunity } = useNexora();

  const communityId = modalPayload?.communityId || activeCommunity?.id;
  const categoryId = modalPayload?.categoryId;

  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ChannelType>('text');
  const [isPrivate, setIsPrivate] = useState(false);

  if (activeModal !== 'create_channel') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !communityId) return;
    createChannel(communityId, name.trim(), type, topic.trim(), categoryId, isPrivate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-md bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="p-6 pb-4 border-b border-[#20223d] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Create Channel</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              in {activeCommunity?.name} {categoryId ? '• specific category' : ''}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Channel Type */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Channel Type
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  type === 'text'
                    ? 'bg-[#8247ff]/20 border-[#8247ff] text-white shadow-sm'
                    : 'bg-[#121424] border-[#20223a] text-slate-300 hover:border-[#2d3154]'
                }`}
              >
                <Hash className="w-5 h-5 text-violet-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Text Channel</p>
                  <p className="text-[11px] text-slate-400">Post messages, images, code, and react</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('voice')}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  type === 'voice'
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                    : 'bg-[#121424] border-[#20223a] text-slate-300 hover:border-[#2d3154]'
                }`}
              >
                <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Voice Channel</p>
                  <p className="text-[11px] text-slate-400">Low-latency live voice communication</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('announcement')}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  type === 'announcement'
                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-sm'
                    : 'bg-[#121424] border-[#20223a] text-slate-300 hover:border-[#2d3154]'
                }`}
              >
                <Megaphone className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Announcement Channel</p>
                  <p className="text-[11px] text-slate-400">Broadcast important news and updates</p>
                </div>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Channel Name *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 text-xs font-mono">#</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-channel"
                className="w-full bg-[#121424] border border-[#20223a] rounded-2xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] font-mono transition"
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Topic (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What will be discussed here?"
              className="w-full bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition"
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-[#121424] rounded-2xl border border-[#20223a]">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Private Channel</p>
                <p className="text-[10px] text-slate-400">Only authorized roles can view</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 cursor-pointer accent-[#8247ff]"
            />
          </div>

          <div className="pt-2 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 bg-[#8247ff] hover:bg-[#7236f0] disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
