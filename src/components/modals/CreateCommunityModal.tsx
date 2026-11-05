import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { X, Plus } from 'lucide-react';

export const CreateCommunityModal: React.FC = () => {
  const { activeModal, closeModal, createCommunity } = useNexora();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [isPublic, setIsPublic] = useState(true);

  if (activeModal !== 'create_community') return null;

  const icons = ['⚡', '🔮', '🚀', '🎧', '🎮', '💡', '🌐', '🛡️', '🧬', '🔥'];

  const templates = [
    { title: 'Tech & Engineering', icon: '💻', tag: 'Distributed systems & fullstack' },
    { title: 'Gaming & Hangout', icon: '🎮', tag: 'Squad lobbies & clips' },
    { title: 'Creative Studio', icon: '🎨', tag: 'Art, design & production' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCommunity(
      name.trim(),
      tagline.trim() || 'CONNECT WITHOUT LIMITS',
      description.trim() || `The official community for ${name}`,
      icon,
      isPublic
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-md bg-[#0b0c16] rounded-[28px] border border-[#20223d] shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="p-6 pb-4 border-b border-[#20223d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8247ff] flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-600/30">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-tight">Create Community</h3>
              <p className="text-xs text-slate-400 mt-0.5">Start a dedicated space for your team or creators</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick template suggestions */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Start with a template
            </label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map((tpl) => (
                <button
                  type="button"
                  key={tpl.title}
                  onClick={() => {
                    setName(tpl.title);
                    setTagline(tpl.tag);
                    setIcon(tpl.icon);
                  }}
                  className="p-2.5 bg-[#121424] border border-[#20223a] hover:border-[#8247ff] rounded-2xl text-left transition cursor-pointer"
                >
                  <span className="text-xl block mb-1">{tpl.icon}</span>
                  <p className="text-xs font-bold text-white truncate">{tpl.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Community Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                    icon === ic
                      ? 'bg-[#8247ff] text-white ring-2 ring-violet-400 shadow-md shadow-purple-600/30'
                      : 'bg-[#121424] border border-[#20223a] text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Community Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Community Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyber Security Syndicate"
              className="w-full bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition"
            />
          </div>

          {/* Tagline */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. CONNECT WITHOUT LIMITS"
              className="w-full bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition"
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
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
