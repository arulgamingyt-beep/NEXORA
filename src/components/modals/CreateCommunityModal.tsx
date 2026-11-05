import React, { useState, useRef } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { X, Plus, Upload, Image, Shield, Globe, Lock } from 'lucide-react';

export const CreateCommunityModal: React.FC = () => {
  const { activeModal, closeModal, createCommunity } = useNexora();

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (activeModal !== 'create_community') return null;

  const icons = ['⚡', '🔮', '🚀', '🎧', '🎮', '💡', '🌐', '🛡️', '🧬', '🔥'];

  const templates = [
    { title: 'Tech & Engineering', icon: '💻', tag: 'Distributed systems & fullstack' },
    { title: 'Gaming & Hangout', icon: '🎮', tag: 'Squad lobbies & clips' },
    { title: 'Creative Studio', icon: '🎨', tag: 'Art, design & production' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIcon(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

          {/* Logo / Icon Selector & Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Community Icon / Logo
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#a855f7] hover:text-white flex items-center gap-1 font-semibold cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Logo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="w-12 h-12 rounded-2xl bg-[#121424] border border-[#20223a] flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-inner">
                {icon.startsWith('data:') || icon.startsWith('http') ? (
                  <img src={icon} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span>{icon}</span>
                )}
              </div>

              {/* Emoji Icons list */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {icons.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition cursor-pointer ${
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

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your community mission and guidelines..."
              className="w-full bg-[#121424] border border-[#20223a] rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8247ff] transition resize-none"
            />
          </div>

          {/* Public / Private Access Switch */}
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
                    ? 'Visible on server lists; anyone can browse and join.'
                    : 'Hidden from discovery; accessible via invite link only.'}
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
