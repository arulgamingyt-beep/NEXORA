import React, { useState, useEffect, useRef } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Settings,
  Hash,
  Volume2,
  Zap,
  Trash2,
  Crown,
  UserX,
  ChevronDown,
  Check,
  Plus,
  Link,
  Shield,
  Clock,
  Sparkles,
  Upload,
  AlertTriangle,
  Edit3,
  Globe,
  Lock,
  Search,
  X,
  Flame,
  TrendingUp,
  FolderPlus,
  Calendar,
  MessageSquare,
  LayoutGrid,
  Smile,
  VolumeX,
  Users,
  ShieldAlert,
  ExternalLink,
  Tag,
  Copy,
  BarChart2,
  Share2,
  Music,
  Bot,
  Radio,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { UserRole, Channel } from '../../types';

export type SettingsTab =
  | 'profile'
  | 'tag'
  | 'engagement'
  | 'boost'
  | 'emoji'
  | 'stickers'
  | 'soundboard'
  | 'members'
  | 'roles'
  | 'invites'
  | 'access'
  | 'integrations'
  | 'app_directory'
  | 'safety'
  | 'audit_log'
  | 'bans'
  | 'onboarding'
  | 'insights'
  | 'template'
  | 'delete'
  | 'overview'
  | 'channels'
  | 'logs';

// 10 vibrant gradient presets matching Discord Server Profile color palette
const BANNER_PALETTES = [
  { id: 'obsidian-purple', name: 'Obsidian Deep', class: 'bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#0f172a]' },
  { id: 'magenta-pink', name: 'Cyber Magenta', class: 'bg-gradient-to-br from-[#ec4899] via-[#f43f5e] to-[#be185d]' },
  { id: 'crimson-red', name: 'Crimson Flame', class: 'bg-gradient-to-br from-[#ef4444] via-[#dc2626] to-[#991b1b]' },
  { id: 'sunset-orange', name: 'Solar Orange', class: 'bg-gradient-to-br from-[#f97316] via-[#ea580c] to-[#c2410c]' },
  { id: 'golden-yellow', name: 'Golden Sun', class: 'bg-gradient-to-br from-[#eab308] via-[#ca8a04] to-[#a16207]' },
  { id: 'lavender-violet', name: 'Violet Nebula', class: 'bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]' },
  { id: 'azure-sky', name: 'Azure Depths', class: 'bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#075985]' },
  { id: 'aqua-mint', name: 'Aqua Matrix', class: 'bg-gradient-to-br from-[#06b6d4] via-[#0891b2] to-[#0e7490]' },
  { id: 'emerald-green', name: 'Emerald Grove', class: 'bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d]' },
  { id: 'charcoal-dark', name: 'Charcoal Steel', class: 'bg-gradient-to-br from-[#4b5563] via-[#374151] to-[#1f2937]' },
];

export const CommunitySettingsModal: React.FC = () => {
  const {
    activeModal,
    modalPayload,
    closeModal,
    activeCommunity,
    communities,
    updateCommunity,
    deleteCommunity,
    deleteChannel,
    updateChannel,
    communityInvites,
    revokeInvite,
    createInvite,
    updateMemberRole,
    kickMember,
    auditLogs,
    currentUser,
    allUsers,
    openModal,
    showToast,
  } = useNexora();

  const targetCommunity =
    communities.find((c) => c.id === modalPayload?.communityId) || activeCommunity;

  // Active navigation tab
  const initialTab = (modalPayload?.initialTab as SettingsTab) || 'profile';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // Profile Form state
  const [name, setName] = useState(targetCommunity?.name || '');
  const [tagline, setTagline] = useState(targetCommunity?.tagline || '');
  const [description, setDescription] = useState(targetCommunity?.description || '');
  const [icon, setIcon] = useState(targetCommunity?.icon || '⚡');
  const [isPublic, setIsPublic] = useState(targetCommunity?.isPublic ?? true);
  const [serverTag, setServerTag] = useState(targetCommunity?.serverTag || 'ERP²');
  const [selectedBanner, setSelectedBanner] = useState(
    targetCommunity?.customBanner || BANNER_PALETTES[0].class
  );
  const [traits, setTraits] = useState<string[]>(
    targetCommunity?.traits && targetCommunity.traits.length > 0
      ? targetCommunity.traits
      : ['💜 ETERNITY', '✨ TAMIL', '🎭 ROLEPLAY', '🤝 TRUST']
  );
  const [newTraitInput, setNewTraitInput] = useState('');

  // Moderation & Access state
  const [verificationLevel, setVerificationLevel] = useState<'none' | 'low' | 'medium' | 'high'>(
    targetCommunity?.verificationLevel || 'low'
  );
  const [raidProtection, setRaidProtection] = useState(false);
  const [autoModEnabled, setAutoModEnabled] = useState(true);
  const [dmFilterEnabled, setDmFilterEnabled] = useState(true);

  // Boost state
  const [boostCount, setBoostCount] = useState(targetCommunity?.boostCount ?? 7);

  // Emojis state
  const [customEmojis, setCustomEmojis] = useState(
    targetCommunity?.customEmojis ?? [
      { id: '1', name: 'nexora_fire', url: '🔥' },
      { id: '2', name: 'purple_heart', url: '💜' },
      { id: '3', name: 'sparkles_gem', url: '✨' },
      { id: '4', name: 'rocket_boost', url: '🚀' },
    ]
  );
  const [newEmojiName, setNewEmojiName] = useState('');
  const [newEmojiIcon, setNewEmojiIcon] = useState('');

  // Bans state
  const [bannedUsers, setBannedUsers] = useState<
    { id: string; name: string; tag: string; reason: string; date: string }[]
  >([
    {
      id: 'ban-1',
      name: 'RaidBot_99',
      tag: '#9999',
      reason: 'Automated spam transmission & raid attempt',
      date: 'May 02, 2026',
    },
    {
      id: 'ban-2',
      name: 'MaliciousLinker',
      tag: '#1337',
      reason: 'Phishing domain link posting',
      date: 'April 28, 2026',
    },
  ]);

  // Channel Editing State
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelTopic, setEditChannelTopic] = useState('');
  const [editChannelPrivate, setEditChannelPrivate] = useState(false);

  // Member search & role menu
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [openRoleMenuUserId, setOpenRoleMenuUserId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // File upload refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  // Sync initial tab when payload updates
  useEffect(() => {
    if (modalPayload?.initialTab) {
      setActiveTab(modalPayload.initialTab);
    }
  }, [modalPayload?.initialTab]);

  // Sync target community values
  useEffect(() => {
    if (targetCommunity) {
      setName(targetCommunity.name);
      setTagline(targetCommunity.tagline);
      setDescription(targetCommunity.description);
      setIcon(targetCommunity.icon);
      setIsPublic(targetCommunity.isPublic ?? true);
      setServerTag(targetCommunity.serverTag || 'ERP²');
      setSelectedBanner(targetCommunity.customBanner || BANNER_PALETTES[0].class);
      if (targetCommunity.traits && targetCommunity.traits.length > 0) {
        setTraits(targetCommunity.traits);
      }
    }
  }, [targetCommunity]);

  if (activeModal !== 'community_settings' || !targetCommunity) return null;

  const isOwner = targetCommunity.ownerId === currentUser.id;

  // Detect unsaved changes for floating save bar
  const hasUnsavedChanges =
    name !== targetCommunity.name ||
    tagline !== targetCommunity.tagline ||
    description !== targetCommunity.description ||
    icon !== targetCommunity.icon ||
    serverTag !== (targetCommunity.serverTag || 'ERP²') ||
    selectedBanner !== (targetCommunity.customBanner || BANNER_PALETTES[0].class) ||
    JSON.stringify(traits) !== JSON.stringify(targetCommunity.traits || ['💜 ETERNITY', '✨ TAMIL', '🎭 ROLEPLAY', '🤝 TRUST']);

  const handleSaveChanges = () => {
    updateCommunity(targetCommunity.id, {
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      icon: icon.trim(),
      serverTag: serverTag.trim(),
      customBanner: selectedBanner,
      traits: traits,
      isPublic,
      verificationLevel,
      boostCount,
    });
    showToast('Server profile and settings saved successfully', 'success');
  };

  const handleResetChanges = () => {
    setName(targetCommunity.name);
    setTagline(targetCommunity.tagline);
    setDescription(targetCommunity.description);
    setIcon(targetCommunity.icon);
    setServerTag(targetCommunity.serverTag || 'ERP²');
    setSelectedBanner(targetCommunity.customBanner || BANNER_PALETTES[0].class);
    setTraits(targetCommunity.traits || ['💜 ETERNITY', '✨ TAMIL', '🎭 ROLEPLAY', '🤝 TRUST']);
    showToast('Changes discarded', 'info');
  };

  const handleAddTrait = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTraitInput.trim();
    if (!clean) return;
    if (traits.length >= 5) {
      showToast('Maximum 5 traits allowed', 'warning');
      return;
    }
    const formatted = clean.startsWith('#') ? clean : `#${clean.toUpperCase()}`;
    if (traits.includes(formatted)) {
      showToast('Trait already added', 'warning');
      return;
    }
    setTraits([...traits, formatted]);
    setNewTraitInput('');
  };

  const handleRemoveTrait = (traitToRemove: string) => {
    setTraits(traits.filter((t) => t !== traitToRemove));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo image must be under 2MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIcon(event.target.result as string);
          showToast('Server logo updated', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('Banner image must be under 4MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedBanner(event.target.result as string);
          showToast('Custom banner uploaded', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChannelEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChannel) return;
    const cleanName = editChannelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!cleanName) {
      showToast('Channel name cannot be empty', 'warning');
      return;
    }
    updateChannel(targetCommunity.id, editingChannel.id, {
      name: cleanName,
      topic: editChannelTopic.trim(),
      isPrivate: editChannelPrivate,
      allowedRoles: editChannelPrivate ? ['owner', 'admin', 'moderator'] : undefined,
    });
    setEditingChannel(null);
    showToast('Channel updated successfully', 'success');
  };

  const availableRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'ADMIN', desc: 'Manage channels, members & moderation' },
    { role: 'moderator', label: 'MODERATOR', desc: 'Manage messages & member presence' },
    { role: 'member', label: 'MEMBER', desc: 'Standard participation privileges' },
  ];

  const communityInvitesList = communityInvites.filter(
    (inv) => inv.communityId === targetCommunity.id && inv.status !== 'revoked'
  );

  const communityAuditLogs = auditLogs.filter(
    (log) => log.communityId === targetCommunity.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1015] flex text-slate-200 overflow-hidden select-none animate-in fade-in duration-150">
      
      {/* LEFT SIDEBAR NAVIGATION (Matching Discord Full Settings Layout) */}
      <div className="w-60 shrink-0 bg-[#0d0e12] flex flex-col py-8 pl-8 pr-3 overflow-y-auto border-r border-white/5 custom-scrollbar">
        {/* Server Name Header */}
        <div className="px-3 pb-3 truncate">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {targetCommunity.name}
          </div>
        </div>

        {/* Top Direct Items */}
        <div className="space-y-0.5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
              activeTab === 'profile' || activeTab === 'overview'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>Server Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('tag')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
              activeTab === 'tag'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>Server Tag</span>
          </button>

          <button
            onClick={() => setActiveTab('engagement')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
              activeTab === 'engagement'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>Engagement</span>
          </button>

          <button
            onClick={() => setActiveTab('boost')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
              activeTab === 'boost'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>Boost Perks</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold">
              Lvl {boostCount >= 14 ? 3 : boostCount >= 7 ? 2 : 1}
            </span>
          </button>
        </div>

        {/* SECTION: EXPRESSION */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1 tracking-wider">
            Expression
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('emoji')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'emoji'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Emoji</span>
              <span className="text-[10px] text-slate-500">{customEmojis.length}/50</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'stickers'
                  ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Stickers</span>
            </button>

            <button
              onClick={() => setActiveTab('soundboard')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'soundboard'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Soundboard</span>
            </button>
          </div>
        </div>

        {/* SECTION: PEOPLE */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1 tracking-wider">
            People
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('members')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'members'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Members</span>
              <span className="text-[10px] text-slate-500">{targetCommunity.members.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('roles')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'roles'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('invites')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'invites'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Invites</span>
              <span className="text-[10px] text-slate-500">{communityInvitesList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('access')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'access'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Access</span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'channels'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Channels</span>
              <span className="text-[10px] text-slate-500">{targetCommunity.channels.length}</span>
            </button>
          </div>
        </div>

        {/* SECTION: APPS */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1 tracking-wider">
            Apps
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('integrations')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'integrations'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Integrations</span>
            </button>

            <button
              onClick={() => setActiveTab('app_directory')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'app_directory'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>App Directory</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        {/* SECTION: MODERATION */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1 tracking-wider">
            Moderation
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('safety')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'safety'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Safety Setup</span>
            </button>

            <button
              onClick={() => setActiveTab('audit_log')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'audit_log' || activeTab === 'logs'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Audit Log</span>
              <span className="text-[10px] text-slate-500">{communityAuditLogs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('bans')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'bans'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Bans</span>
              <span className="text-[10px] text-slate-500">{bannedUsers.length}</span>
            </button>
          </div>
        </div>

        {/* SECTION: COMMUNITY OVERVIEW */}
        <div className="pt-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-3 pb-1 tracking-wider">
            Community Overview
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => setActiveTab('onboarding')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'onboarding'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Onboarding</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                activeTab === 'insights'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Server Insights</span>
              <TrendingUp className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 my-3 mx-1" />

        {/* BOTTOM UTILITIES */}
        <div className="space-y-0.5 pb-8">
          <button
            onClick={() => setActiveTab('template')}
            className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex items-center justify-between ${
              activeTab === 'template'
                ? 'bg-white/10 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span>Server Template</span>
            <span className="w-2 h-2 rounded-full bg-violet-500" />
          </button>

          {isOwner && (
            <button
              onClick={() => setActiveTab('delete')}
              className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                activeTab === 'delete'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
              }`}
            >
              <span>Delete Server</span>
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* TOP RIGHT ESC CLOSE BUTTON (Signature Discord Circle Control) */}
      <div className="absolute top-8 right-12 z-40 flex flex-col items-center">
        <button
          onClick={closeModal}
          className="w-9 h-9 rounded-full border-2 border-slate-400 hover:border-white text-slate-400 hover:text-white flex items-center justify-center transition-all duration-150 hover:bg-white/10 group cursor-pointer"
          title="Close (ESC)"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
          ESC
        </span>
      </div>

      {/* MAIN CONTENT PANE */}
      <div className="flex-1 h-full overflow-y-auto px-10 py-10 custom-scrollbar flex justify-start">
        <div className="max-w-4xl w-full">

          {/* ========================================================================= */}
          {/* TAB: SERVER PROFILE (Exact Pixel Match to Screenshot 2) */}
          {/* ========================================================================= */}
          {(activeTab === 'profile' || activeTab === 'overview') && (
            <div className="flex gap-10 items-start">
              {/* Left Column: Form Controls */}
              <div className="flex-1 max-w-[500px] space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Server Profile</h1>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Customize how your server appears in invite links and, if enabled, in Server Discovery and Announcement Channel messages
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-violet-500 transition"
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block mb-1">
                    Icon
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    We recommend an image of at least 512x512.
                  </p>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer shadow transition"
                    >
                      Change Server Icon
                    </button>
                    <button
                      type="button"
                      onClick={() => setIcon('⚡')}
                      className="bg-[#2b2d31] hover:bg-[#35373c] text-slate-300 px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition"
                    >
                      Remove Icon
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 my-4" />

                {/* Banner Palette Selector (10 Swatches matching Screenshot 2) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block">
                      Banner
                    </label>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="text-xs text-violet-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer transition"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Custom Image</span>
                    </button>
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </div>

                  {/* 10 Swatches Grid (2 rows x 5 columns) */}
                  <div className="grid grid-cols-5 gap-2.5 pt-2">
                    {BANNER_PALETTES.map((palette) => {
                      const isSelected = selectedBanner === palette.class;
                      return (
                        <button
                          key={palette.id}
                          type="button"
                          onClick={() => setSelectedBanner(palette.class)}
                          title={palette.name}
                          className={`h-12 rounded-lg cursor-pointer transition-all ${palette.class} relative ${
                            isSelected
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f1015] scale-102 shadow-lg'
                              : 'opacity-90 hover:opacity-100 hover:scale-102 border border-white/10'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 my-4" />

                {/* Traits (Matching Screenshot 2) */}
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block mb-1">
                    Traits
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    Add up to 5 traits to show off your server's interests and personality.
                  </p>

                  {/* Trait Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {traits.map((trait) => (
                      <div
                        key={trait}
                        className="bg-[#2b2d31] border border-white/5 px-2.5 py-1 rounded-md flex items-center gap-1.5 text-xs font-semibold text-slate-200"
                      >
                        <span>{trait}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTrait(trait)}
                          className="text-slate-400 hover:text-white cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Trait Input */}
                  {traits.length < 5 && (
                    <form onSubmit={handleAddTrait} className="flex gap-2">
                      <input
                        type="text"
                        value={newTraitInput}
                        onChange={(e) => setNewTraitInput(e.target.value)}
                        placeholder="Add trait (e.g. #GAMING, #TAMIL, #DEVELOPERS)..."
                        className="flex-1 bg-[#1e1f22] border border-[#2b2d31] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition"
                      >
                        Add
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Right Column: Live Interactive Preview Card (Exact Match to Screenshot 2) */}
              <div className="w-[310px] shrink-0 bg-[#111214] rounded-2xl border border-white/10 shadow-2xl overflow-hidden self-start sticky top-2">
                {/* Banner Container */}
                <div className={`h-32 w-full relative transition-all duration-200 overflow-hidden ${
                  selectedBanner.startsWith('data:') || selectedBanner.startsWith('http')
                    ? 'bg-cover bg-center'
                    : selectedBanner
                }`}
                style={
                  selectedBanner.startsWith('data:') || selectedBanner.startsWith('http')
                    ? { backgroundImage: `url(${selectedBanner})` }
                    : {}
                }
                >
                  {/* Server Logo (Overlaps lower edge of banner) */}
                  <div className="w-20 h-20 rounded-2xl bg-[#1e1f22] p-1 border-4 border-[#111214] absolute -bottom-10 left-4 shadow-xl flex items-center justify-center overflow-hidden">
                    {icon.startsWith('data:') || icon.startsWith('http') ? (
                      <img src={icon} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl">{icon}</span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="pt-12 px-4 pb-4 space-y-3">
                  {/* Server Title & Tag Badge */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-white text-base leading-tight truncate">
                      {name || 'Eternity Roleplay : The Ri...'}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0 inline" />
                    <div className="px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-700 to-indigo-700 text-[10px] font-extrabold text-white flex items-center gap-1 shadow-sm shrink-0">
                      <Flame className="w-2.5 h-2.5 text-violet-300" />
                      <span>{serverTag || 'ERP²'}</span>
                    </div>
                  </div>

                  {/* Online & Member Counts */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-slate-300">337 Online</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                      <span>{targetCommunity.members.length > 5 ? targetCommunity.members.length : 985} Members</span>
                    </div>
                  </div>

                  {/* Established Date */}
                  <div className="text-[11px] text-slate-500">
                    Est. May 2026
                  </div>

                  {/* Emblems / Badges */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-slate-400 text-xs">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                      🛡️ VERIFIED
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                      🎮 ACTIVE
                    </span>
                  </div>

                  {/* Trait Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {traits.map((t) => (
                      <div
                        key={t}
                        className="px-2.5 py-1 rounded-md bg-[#2b2d31]/80 hover:bg-[#35373c] text-slate-200 text-xs font-semibold flex items-center gap-1 border border-white/5"
                      >
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SERVER TAG */}
          {/* ========================================================================= */}
          {activeTab === 'tag' && (
            <div className="max-w-[560px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Server Tag</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Your server tag is a prestigious, custom shorthand badge displayed next to your server title and member names.
                </p>
              </div>

              <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block mb-2">
                    Custom Tag (2-5 Characters)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={serverTag}
                      onChange={(e) => setServerTag(e.target.value.toUpperCase())}
                      placeholder="e.g. ERP², NXR, PRO"
                      className="w-36 bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-sm font-bold text-white uppercase focus:outline-none focus:border-violet-500 font-mono"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-700/50 to-indigo-700/50 border border-purple-500/30 rounded-md">
                      <Flame className="w-4 h-4 text-violet-400" />
                      <span className="font-extrabold text-sm text-white">{serverTag || 'NXR'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-slate-400">
                  <div className="font-semibold text-slate-300">Tag Requirements:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Server Boost Level 1 or higher unlocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Alphanumeric characters & superscripts permitted</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: BOOST PERKS */}
          {/* ========================================================================= */}
          {activeTab === 'boost' && (
            <div className="max-w-[650px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Boost Perks</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Power up your community with premium audio quality, expanded emoji libraries, and enhanced upload allowances.
                </p>
              </div>

              {/* Boost Status Header */}
              <div className="p-6 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#111214] border border-pink-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-pink-400 fill-pink-400" />
                    <span className="text-lg font-bold text-white">
                      Level {boostCount >= 14 ? 3 : boostCount >= 7 ? 2 : 1}
                    </span>
                    <span className="text-xs text-pink-300 font-semibold px-2 py-0.5 rounded-full bg-pink-500/20">
                      {boostCount} Boosts Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {boostCount >= 14
                      ? 'Maximum community tier reached! All perks unlocked.'
                      : `${14 - boostCount} more boosts to unlock Level 3!`}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setBoostCount((prev) => prev + 1);
                    showToast('🎉 Thank you for boosting this server!', 'success');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-600/30 cursor-pointer transition flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Boost This Server</span>
                </button>
              </div>

              {/* Levels Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${boostCount >= 2 ? 'bg-[#1e1f22] border-pink-500/40' : 'bg-[#111214] border-white/5 opacity-60'}`}>
                  <div className="font-bold text-sm text-white mb-1">Level 1 (2 Boosts)</div>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li>✓ 50 Custom Emojis</li>
                    <li>✓ 128 Kbps Audio Quality</li>
                    <li>✓ Custom Server Invite Background</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${boostCount >= 7 ? 'bg-[#1e1f22] border-pink-500/40 ring-1 ring-pink-500/30' : 'bg-[#111214] border-white/5 opacity-60'}`}>
                  <div className="font-bold text-sm text-pink-400 mb-1">Level 2 (7 Boosts) ★ ACTIVE</div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>✓ 100 Custom Emojis</li>
                    <li>✓ 256 Kbps Audio Quality</li>
                    <li>✓ Server Banner & Server Tag</li>
                    <li>✓ 50MB Upload Limit for all members</li>
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${boostCount >= 14 ? 'bg-[#1e1f22] border-pink-500/40' : 'bg-[#111214] border-white/5'}`}>
                  <div className="font-bold text-sm text-white mb-1">Level 3 (14 Boosts)</div>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li>✓ 250 Custom Emojis</li>
                    <li>✓ 384 Kbps High-Fidelity Audio</li>
                    <li>✓ Vanity Invite URL (.gg/name)</li>
                    <li>✓ 100MB Upload Limit</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: EMOJI */}
          {/* ========================================================================= */}
          {activeTab === 'emoji' && (
            <div className="max-w-[650px] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Emoji Library</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload custom emojis that any member can use across community channels. ({customEmojis.length}/50 available slots)
                  </p>
                </div>
              </div>

              {/* Add Emoji Row */}
              <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center gap-3">
                <input
                  type="text"
                  value={newEmojiIcon}
                  onChange={(e) => setNewEmojiIcon(e.target.value)}
                  placeholder="Emoji (e.g. 🚀 or paste image URL)"
                  className="w-48 bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <input
                  type="text"
                  value={newEmojiName}
                  onChange={(e) => setNewEmojiName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="name (e.g. rocket_burst)"
                  className="flex-1 bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() => {
                    if (!newEmojiIcon || !newEmojiName) {
                      showToast('Please provide both emoji and name', 'warning');
                      return;
                    }
                    setCustomEmojis([...customEmojis, { id: Date.now().toString(), name: newEmojiName, url: newEmojiIcon }]);
                    setNewEmojiName('');
                    setNewEmojiIcon('');
                    showToast('Custom emoji added to community', 'success');
                  }}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition"
                >
                  Upload Emoji
                </button>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-4 gap-3">
                {customEmojis.map((em) => (
                  <div
                    key={em.id}
                    className="p-3 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between hover:border-violet-500/40 transition"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-2xl">{em.url}</span>
                      <span className="text-xs font-mono text-slate-300 truncate">:{em.name}:</span>
                    </div>
                    <button
                      onClick={() => {
                        setCustomEmojis(customEmojis.filter((e) => e.id !== em.id));
                        showToast(`Removed :${em.name}:`, 'info');
                      }}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SOUNDBOARD */}
          {activeTab === 'soundboard' && (
            <div className="max-w-[650px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Soundboard</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Play short audio reactions in voice channels to react in real-time.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Airhorn', emoji: '📢', length: '1.2s' },
                  { name: 'Victory Fanfare', emoji: '🎺', length: '2.5s' },
                  { name: 'Crickets', emoji: '🦗', length: '3.0s' },
                  { name: 'Ba-Dum-Tss', emoji: '🥁', length: '1.8s' },
                  { name: 'Applause', emoji: '👏', length: '2.2s' },
                  { name: 'Sad Trombone', emoji: '📉', length: '2.1s' },
                ].map((sound) => (
                  <div
                    key={sound.name}
                    className="p-3 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between hover:border-violet-500/40 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sound.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{sound.name}</div>
                        <div className="text-[10px] text-slate-400">{sound.length}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Playing sound: ${sound.name}`, 'info')}
                      className="p-1.5 bg-violet-600/30 text-violet-300 hover:bg-violet-600 hover:text-white rounded-lg text-xs cursor-pointer"
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: MEMBERS */}
          {activeTab === 'members' && (
            <div className="max-w-[700px] space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Server Members</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage members, assign roles, or remove users ({targetCommunity.members.length} members)
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="Search members by name or role..."
                  className="w-full bg-[#1e1f22] border border-[#2b2d31] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* List */}
              <div className="space-y-2">
                {targetCommunity.members
                  .filter((member) => {
                    if (!memberSearchQuery.trim()) return true;
                    const u = allUsers[member.userId] || member.user;
                    const q = memberSearchQuery.toLowerCase();
                    return (
                      u?.displayName?.toLowerCase().includes(q) ||
                      u?.username?.toLowerCase().includes(q) ||
                      member.role.toLowerCase().includes(q)
                    );
                  })
                  .map((member) => {
                    const u = allUsers[member.userId] || member.user;
                    const isMemOwner = member.role === 'owner';
                    const isSelf = member.userId === currentUser.id;
                    const displayName = u?.displayName || 'Unknown Member';
                    const username = u?.username || 'member';
                    const avatarUrl =
                      u?.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

                    return (
                      <div
                        key={member.userId}
                        className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-white flex items-center gap-1.5 truncate">
                              <span>{displayName}</span>
                              {isMemOwner && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </div>
                            <div className="text-xs text-slate-400 font-normal">@{username}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-md bg-[#2b2d31] text-[11px] font-bold uppercase text-slate-300">
                            {member.role}
                          </span>
                          {!isMemOwner && !isSelf && (
                            <button
                              onClick={() => {
                                kickMember(targetCommunity.id, member.userId);
                                showToast(`Removed ${displayName} from server`, 'info');
                              }}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                              title="Kick member"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: ROLES */}
          {activeTab === 'roles' && (
            <div className="max-w-[700px] space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Roles & Permissions</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Use roles to group your server members and assign permissions.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Owner', color: 'border-amber-500/40 text-amber-300', count: 1, desc: 'Full administrative ownership & dissolution authority' },
                  { name: 'Admin', color: 'border-violet-500/40 text-violet-300', count: targetCommunity.members.filter(m => m.role === 'admin').length, desc: 'Manage channels, kicks, roles, and safety policies' },
                  { name: 'Moderator', color: 'border-blue-500/40 text-blue-300', count: targetCommunity.members.filter(m => m.role === 'moderator').length, desc: 'Moderate transmissions, manage threads, and mute disruptive accounts' },
                  { name: '@everyone', color: 'border-slate-500/40 text-slate-300', count: targetCommunity.members.length, desc: 'Default permissions applied to all verified participants' },
                ].map((role) => (
                  <div key={role.name} className={`p-4 bg-[#1e1f22] border ${role.color} rounded-xl flex items-center justify-between`}>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-current inline-block" />
                        <span>{role.name}</span>
                        <span className="text-xs font-normal text-slate-400 font-mono">({role.count} members)</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{role.desc}</p>
                    </div>
                    <button
                      onClick={() => showToast(`Role settings for ${role.name} loaded`, 'info')}
                      className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] text-xs font-semibold text-slate-200 rounded-md cursor-pointer transition"
                    >
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: INVITES */}
          {activeTab === 'invites' && (
            <div className="max-w-[700px] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Active Invites</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage all shareable invitation links to this server.
                  </p>
                </div>
                <button
                  onClick={() => openModal('invite', { communityId: targetCommunity.id })}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Invite</span>
                </button>
              </div>

              <div className="space-y-2">
                {communityInvitesList.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono font-bold text-sm text-violet-300">
                        nexora.app/invite/{inv.code}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Uses: {inv.usesCount} / {inv.maxUses === 0 ? '∞' : inv.maxUses} • Expires: {inv.expiresAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://nexora.app/invite/${inv.code}`);
                          showToast(`Copied invite code ${inv.code}`, 'success');
                        }}
                        className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] text-xs font-medium text-slate-200 rounded-md cursor-pointer"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          revokeInvite(inv.id);
                          showToast('Invite revoked', 'info');
                        }}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: CHANNELS */}
          {activeTab === 'channels' && (
            <div className="max-w-[700px] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Channels Management</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Organize text, voice, and announcement channels ({targetCommunity.channels.length})
                  </p>
                </div>
                <button
                  onClick={() => openModal('create_channel', { communityId: targetCommunity.id })}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-md text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Channel</span>
                </button>
              </div>

              {editingChannel && (
                <div className="p-4 bg-[#1e1f22] border border-violet-500/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Edit Channel: #{editingChannel.name}</span>
                    <button onClick={() => setEditingChannel(null)} className="text-slate-400 hover:text-white text-xs">
                      Cancel
                    </button>
                  </div>
                  <form onSubmit={handleSaveChannelEdit} className="space-y-3">
                    <input
                      type="text"
                      value={editChannelName}
                      onChange={(e) => setEditChannelName(e.target.value)}
                      className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-1.5 text-xs text-white"
                      placeholder="Channel Name"
                    />
                    <input
                      type="text"
                      value={editChannelTopic}
                      onChange={(e) => setEditChannelTopic(e.target.value)}
                      className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-1.5 text-xs text-white"
                      placeholder="Channel Topic"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-md text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-2">
                {targetCommunity.channels.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      {ch.type === 'voice' ? (
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Hash className="w-4 h-4 text-violet-400" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>#{ch.name}</span>
                          {ch.isPrivate && (
                            <span className="text-[10px] text-amber-400 font-mono px-1 py-0.2 bg-amber-500/10 rounded">
                              PRIVATE
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-normal">{ch.topic || 'General Channel'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingChannel(ch);
                          setEditChannelName(ch.name);
                          setEditChannelTopic(ch.topic || '');
                          setEditChannelPrivate(!!ch.isPrivate);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {targetCommunity.channels.length > 1 && (
                        <button
                          onClick={() => {
                            deleteChannel(targetCommunity.id, ch.id);
                            showToast(`Channel #${ch.name} deleted`, 'info');
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SAFETY SETUP */}
          {activeTab === 'safety' && (
            <div className="max-w-[650px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Safety Setup & Raid Protection</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Configure proactive defensive filters, spam shields, and automated moderation rules.
                </p>
              </div>

              <div className="space-y-4">
                {/* AutoMod */}
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">AutoMod Anti-Spam Engine</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Automatically detects and quarantines repeated spam transmissions and phishing links.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAutoModEnabled(!autoModEnabled);
                      showToast(`AutoMod ${!autoModEnabled ? 'enabled' : 'disabled'}`, 'info');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      autoModEnabled ? 'bg-violet-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        autoModEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Raid Protection */}
                <div className="p-4 bg-[#1e1f22] border border-rose-500/30 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Defensive Raid Lockdown</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Temporarily pause incoming invitations and require strict account verification.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRaidProtection(!raidProtection);
                      showToast(
                        !raidProtection
                          ? 'Raid Lockdown activated! Community protected.'
                          : 'Raid Lockdown deactivated',
                        !raidProtection ? 'warning' : 'info'
                      );
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      raidProtection ? 'bg-rose-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        raidProtection ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* DM Safety */}
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">Direct Message Safety Filter</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Scan member DMs for suspicious attachments and prevent mass-DM bot scraping.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDmFilterEnabled(!dmFilterEnabled);
                      showToast(`DM Safety ${!dmFilterEnabled ? 'enabled' : 'disabled'}`, 'info');
                    }}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      dmFilterEnabled ? 'bg-violet-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        dmFilterEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: AUDIT LOG */}
          {(activeTab === 'audit_log' || activeTab === 'logs') && (
            <div className="max-w-[700px] space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Audit Log</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Chronological log of administrative actions taken on this server.
                </p>
              </div>

              <div className="space-y-2">
                {communityAuditLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No moderation events logged yet.
                  </div>
                ) : (
                  communityAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-violet-300">{log.actorName}</div>
                        <div className="text-xs text-slate-300">{log.details}</div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: BANS */}
          {activeTab === 'bans' && (
            <div className="max-w-[700px] space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Bans</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Bans are by IP and account. ({bannedUsers.length} banned operatives)
                </p>
              </div>

              <div className="space-y-2">
                {bannedUsers.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 bg-[#1e1f22] border border-[#2b2d31] rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{b.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{b.tag}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Reason: {b.reason} • {b.date}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setBannedUsers(bannedUsers.filter((u) => u.id !== b.id));
                        showToast(`Revoked ban for ${b.name}`, 'info');
                      }}
                      className="px-3 py-1.5 bg-[#2b2d31] hover:bg-emerald-600 hover:text-white text-xs font-medium text-slate-200 rounded-md cursor-pointer transition"
                    >
                      Revoke Ban
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SERVER INSIGHTS */}
          {activeTab === 'insights' && (
            <div className="max-w-[700px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Server Insights</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Review audience reach, transmission density, and member retention metrics.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl">
                  <div className="text-xs text-slate-400">Total Transmissions</div>
                  <div className="text-xl font-bold text-white mt-1">4,820</div>
                  <div className="text-[10px] text-emerald-400 mt-1">↑ 14.2% this week</div>
                </div>
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl">
                  <div className="text-xs text-slate-400">Active Communicators</div>
                  <div className="text-xl font-bold text-white mt-1">412</div>
                  <div className="text-[10px] text-emerald-400 mt-1">↑ 8.6% this week</div>
                </div>
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl">
                  <div className="text-xs text-slate-400">Voice Minutes</div>
                  <div className="text-xl font-bold text-white mt-1">12,850m</div>
                  <div className="text-[10px] text-emerald-400 mt-1">↑ 22.1% this week</div>
                </div>
                <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl">
                  <div className="text-xs text-slate-400">Retention Rate</div>
                  <div className="text-xl font-bold text-white mt-1">94.2%</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Top 5% server tier</div>
                </div>
              </div>

              <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl space-y-3">
                <div className="text-xs font-bold text-white">Weekly Message Activity (Mon - Sun)</div>
                <div className="h-28 flex items-end gap-3 pt-4 px-2">
                  {[45, 60, 85, 70, 95, 120, 110].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md transition-all hover:brightness-125"
                        style={{ height: `${val}px` }}
                      />
                      <span className="text-[10px] text-slate-400">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: APP DIRECTORY */}
          {activeTab === 'app_directory' && (
            <div className="max-w-[700px] space-y-4">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">App Directory</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Discover bots and interactive tools to extend your server.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Nexora Guard Bot', desc: 'AI-assisted anti-raid moderation and spam filtering', icon: '🛡️' },
                  { name: 'Rhythm Streamer', desc: 'High-fidelity audio streaming in voice rooms', icon: '🎵' },
                  { name: 'GitHub Bridge', desc: 'Stream commits, PRs, and issues directly to dev channels', icon: '🐙' },
                  { name: 'Poll Master', desc: 'Create interactive polls with instant tally graphs', icon: '📊' },
                ].map((app) => (
                  <div key={app.name} className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{app.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{app.name}</div>
                        <div className="text-xs text-slate-400">{app.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Added ${app.name} to server`, 'success')}
                      className="w-full mt-2 py-1.5 bg-[#2b2d31] hover:bg-violet-600 text-xs font-semibold text-slate-200 hover:text-white rounded-md transition"
                    >
                      Add to Server
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: ONBOARDING */}
          {activeTab === 'onboarding' && (
            <div className="max-w-[650px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Community Onboarding</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Provide newly arrived members with a guided introduction, rules prompt, and default channels.
                </p>
              </div>

              <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-white">New Member Welcome Card</div>
                  <span className="text-xs text-emerald-400 font-semibold">Active</span>
                </div>
                <p className="text-xs text-slate-400">
                  New members will be greeted with welcome transmissions and prompted to review Community Guidelines before their first transmission.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: SERVER TEMPLATE */}
          {activeTab === 'template' && (
            <div className="max-w-[650px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Server Template</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Create a shareable template containing this server's channels, categories, and role configurations.
                </p>
              </div>

              <div className="p-4 bg-[#1e1f22] border border-[#2b2d31] rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-300">Shareable Template Link</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://nexora.app/template/${targetCommunity.id}`}
                    className="flex-1 bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-1.5 text-xs text-slate-300 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nexora.app/template/${targetCommunity.id}`);
                      showToast('Template link copied to clipboard', 'success');
                    }}
                    className="px-3 py-1.5 bg-violet-600 text-white rounded-md text-xs font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: DELETE SERVER */}
          {activeTab === 'delete' && isOwner && (
            <div className="max-w-[550px] space-y-6">
              <div>
                <h1 className="text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span>Delete Server</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Permanently dissolve <span className="font-bold text-white">"{targetCommunity.name}"</span>. All channels, transmissions, and attachments will be deleted forever. This action is irreversible.
                </p>
              </div>

              <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-300 tracking-wider block mb-2">
                    Enter Server Name to Confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={(e) => setDeleteConfirmName(e.target.value)}
                    placeholder={targetCommunity.name}
                    className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="button"
                  disabled={deleteConfirmName.trim() !== targetCommunity.name.trim()}
                  onClick={() => {
                    deleteCommunity(targetCommunity.id);
                    closeModal();
                    showToast(`Community "${targetCommunity.name}" dissolved`, 'info');
                  }}
                  className={`w-full py-2.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-2 ${
                    deleteConfirmName.trim() === targetCommunity.name.trim()
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-600/30'
                      : 'bg-rose-900/30 text-rose-400/50 cursor-not-allowed border border-rose-500/10'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Server</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* DISCORD-STYLE FLOATING BOTTOM SAVE BAR (When Changes are Detected) */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111214] border border-[#2b2d31] rounded-xl px-5 py-3 shadow-2xl flex items-center justify-between gap-8 min-w-[500px] animate-in slide-in-from-bottom-5 duration-200">
          <span className="text-xs text-white font-medium">
            Careful — you have unsaved changes!
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetChanges}
              className="text-xs text-slate-300 hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              className="bg-[#23a55a] hover:bg-[#1f9350] text-white px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer shadow transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
