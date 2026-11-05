import React, { useState, useMemo } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Compass,
  X,
  Search,
  Users,
  Shield,
  Sparkles,
  ArrowRight,
  Check,
  Lock,
  Globe,
  Radio,
  Gamepad2,
  Cpu,
  Palette,
  Music,
  GraduationCap,
  Layers,
} from 'lucide-react';

type DiscoveryCategory =
  | 'all'
  | 'technology'
  | 'gaming'
  | 'cybersec'
  | 'creative'
  | 'music'
  | 'education';

export const CommunityDiscoveryModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    communities,
    currentUser,
    acceptInvite,
    setActiveCommunity,
    showToast,
  } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DiscoveryCategory>('all');
  const [customInviteCode, setCustomInviteCode] = useState('');

  if (activeModal !== 'community_discovery') return null;

  // Filter communities by category and search query
  const filteredCommunities = communities.filter((comm) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      comm.name.toLowerCase().includes(query) ||
      comm.tagline?.toLowerCase().includes(query) ||
      comm.description?.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (selectedCategory === 'all') return true;

    const desc = (comm.description + ' ' + comm.tagline + ' ' + comm.name).toLowerCase();
    if (selectedCategory === 'technology') {
      return desc.includes('tech') || desc.includes('code') || desc.includes('telemetry') || desc.includes('vanguard');
    }
    if (selectedCategory === 'gaming') {
      return desc.includes('game') || desc.includes('esports') || desc.includes('play') || desc.includes('pvp');
    }
    if (selectedCategory === 'cybersec') {
      return desc.includes('security') || desc.includes('crypto') || desc.includes('recon') || desc.includes('cyber');
    }
    if (selectedCategory === 'creative') {
      return desc.includes('art') || desc.includes('design') || desc.includes('creative') || desc.includes('media');
    }
    if (selectedCategory === 'music') {
      return desc.includes('audio') || desc.includes('sound') || desc.includes('beat') || desc.includes('music');
    }
    if (selectedCategory === 'education') {
      return desc.includes('learn') || desc.includes('study') || desc.includes('research') || desc.includes('academy');
    }

    return true;
  });

  const categories = [
    { id: 'all', label: 'All Communities', icon: Layers },
    { id: 'technology', label: 'Technology', icon: Cpu },
    { id: 'gaming', label: 'Gaming & Guilds', icon: Gamepad2 },
    { id: 'cybersec', label: 'Cybersecurity', icon: Shield },
    { id: 'creative', label: 'Creative & Media', icon: Palette },
    { id: 'music', label: 'Audio & Music', icon: Music },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ] as const;

  const handleJoinOrVisit = (commId: string, inviteCode: string, isMember: boolean) => {
    if (isMember) {
      setActiveCommunity(commId);
      closeModal();
      showToast('Switched to active community frequency', 'info');
    } else {
      const success = acceptInvite(inviteCode);
      if (success) {
        setActiveCommunity(commId);
        closeModal();
      }
    }
  };

  const handleCustomInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInviteCode.trim()) return;
    const success = acceptInvite(customInviteCode.trim());
    if (success) {
      closeModal();
    } else {
      showToast('Invalid or expired invitation link.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-4xl bg-[#090b14] rounded-3xl border border-[#1e2138] shadow-2xl shadow-black/95 overflow-hidden z-10 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#1b1e33] flex items-center justify-between bg-[#0e101f]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Discover Public Communities</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  DIRECTORY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Find guilds, intelligence networks, and creators across the NEXORA collective.
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className="p-4 sm:px-6 border-b border-[#181a2e] bg-[#0c0d18] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community name, mission, or keywords..."
              className="w-full bg-[#131627] border border-[#20233d] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Direct Code Join Form */}
          <form onSubmit={handleCustomInviteSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={customInviteCode}
              onChange={(e) => setCustomInviteCode(e.target.value)}
              placeholder="Enter invite code..."
              className="w-36 sm:w-44 bg-[#131627] border border-[#20233d] rounded-2xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono transition"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 shadow-md shadow-violet-600/30"
            >
              Join
            </button>
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#151726] bg-[#0a0c16] overflow-x-auto custom-purple-scrollbar">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as DiscoveryCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141629]'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Directory Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-purple-scrollbar">
          {filteredCommunities.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Compass className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-200">
                No communities found matching your criteria
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                Try searching with different terms or select "All Communities" to explore the directory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCommunities.map((comm) => {
                const isMember = comm.members.some((m) => m.userId === currentUser.id);
                const isOwner = comm.ownerId === currentUser.id;

                return (
                  <div
                    key={comm.id}
                    className="p-4 rounded-2xl bg-[#111322] border border-[#1e2138] hover:border-violet-500/40 transition flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-black/50"
                  >
                    <div>
                      {/* Community Top Card */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#171a2e] border border-violet-500/20 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden">
                          {comm.icon?.startsWith('data:') || comm.icon?.startsWith('http') ? (
                            <img
                              src={comm.icon}
                              alt={comm.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{comm.icon}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="font-bold text-sm text-white truncate group-hover:text-violet-300 transition">
                              {comm.name}
                            </h3>
                            {comm.isPublic ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Globe className="w-2.5 h-2.5" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Lock className="w-2.5 h-2.5" />
                                Private
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {comm.tagline || 'NEXORA Network Guild'}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                        {comm.description || 'Welcome to our frequency collective on NEXORA.'}
                      </p>
                    </div>

                    {/* Footer Info & Action */}
                    <div className="pt-3 border-t border-[#1a1d30] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        <span>{comm.members.length} Operatives</span>
                      </div>

                      <button
                        onClick={() => handleJoinOrVisit(comm.id, comm.inviteCode, isMember)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isOwner
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                            : isMember
                            ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                            : 'bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30'
                        }`}
                      >
                        {isOwner ? (
                          <>
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>Owner</span>
                          </>
                        ) : isMember ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Entered</span>
                          </>
                        ) : (
                          <>
                            <span>Join Hub</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 px-6 border-t border-[#181a2e] bg-[#0a0b14] flex items-center justify-between text-xs text-slate-500">
          <span>Community Directory • {filteredCommunities.length} Hubs Available</span>
          <span className="font-mono text-[11px]">NEXORA Discovery Protocol</span>
        </div>
      </div>
    </div>
  );
};
