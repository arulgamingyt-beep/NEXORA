import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  searchService,
  SearchCategory,
  SearchResultItem,
  SearchResponse,
} from '../../services/searchService';
import {
  Search,
  X,
  Hash,
  Volume2,
  Users,
  MessageSquare,
  Sparkles,
  Clock,
  Trash2,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    currentUser,
    communities,
    messages,
    allUsers,
    dmConversations,
    blockedUsers,
    setActiveCommunity,
    setActiveChannel,
    openDMWithUser,
  } = useNexora();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeModal === 'search';

  // Load search history on modal open
  useEffect(() => {
    if (isOpen) {
      setHistory(searchService.getSearchHistory(currentUser?.id));
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen, currentUser?.id]);

  // Execute permission-aware search
  const searchResponse: SearchResponse = useMemo(() => {
    if (!isOpen || !query.trim()) {
      return {
        results: [],
        totalCount: 0,
        categoryCounts: { all: 0, messages: 0, channels: 0, communities: 0, users: 0 },
        page: 1,
        pageSize: 30,
        hasMore: false,
      };
    }

    return searchService.executeSearch({
      query,
      currentUser,
      communities,
      allMessages: messages,
      allUsers,
      conversations: dmConversations,
      blockedUserIds: blockedUsers.map((b) => b.blockedId),
      options: {
        category: selectedCategory,
        pageSize: 40,
      },
    });
  }, [
    isOpen,
    query,
    selectedCategory,
    currentUser,
    communities,
    messages,
    allUsers,
    dmConversations,
    blockedUsers,
  ]);

  const suggestions = useMemo(() => {
    return searchService.getSearchSuggestions(query, currentUser?.id);
  }, [query, currentUser?.id]);

  // Handle result selection
  const handleSelectResult = (item: SearchResultItem) => {
    searchService.recordSearchQuery(query, currentUser?.id);
    closeModal();

    if (item.type === 'community' && item.metadata.communityId) {
      setActiveCommunity(item.metadata.communityId);
    } else if (item.type === 'channel') {
      if (item.metadata.communityId) {
        setActiveCommunity(item.metadata.communityId);
      }
      if (item.metadata.channelId) {
        setActiveChannel(item.metadata.channelId);
      }
    } else if (item.type === 'user' && item.metadata.userId) {
      openDMWithUser(item.metadata.userId);
    } else if (item.type === 'message') {
      if (item.metadata.communityId && item.metadata.channelId) {
        setActiveCommunity(item.metadata.communityId);
        setActiveChannel(item.metadata.channelId);
      } else if (item.metadata.conversationId) {
        setActiveCommunity(null);
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResponse.results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResponse.results[selectedIndex]) {
        handleSelectResult(searchResponse.results[selectedIndex]);
      } else if (query.trim()) {
        searchService.recordSearchQuery(query, currentUser?.id);
        setHistory(searchService.getSearchHistory(currentUser?.id));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={closeModal} />

      <div className="relative w-full max-w-2xl bg-[#0b0c16] rounded-3xl border border-[#20223d] shadow-2xl shadow-black/95 overflow-hidden z-10 flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150">
        {/* Top Search Input Bar */}
        <div className="p-4 px-5 border-b border-[#1f2139] flex items-center gap-3 bg-[#0e101d]">
          <Search className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search messages, channels, communities, or operatives... (Esc to exit)"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#17192a] text-slate-400 border border-[#2b2d49]">
            ESC
          </span>
        </div>

        {/* Category Filter Tabs */}
        {query.trim().length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#1c1e33] bg-[#0c0d18] overflow-x-auto custom-purple-scrollbar">
            {(
              [
                { id: 'all', label: 'All', count: searchResponse.categoryCounts.all },
                { id: 'messages', label: 'Messages', count: searchResponse.categoryCounts.messages },
                { id: 'channels', label: 'Channels', count: searchResponse.categoryCounts.channels },
                { id: 'communities', label: 'Communities', count: searchResponse.categoryCounts.communities },
                { id: 'users', label: 'Operatives', count: searchResponse.categoryCounts.users },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#161829]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    selectedCategory === tab.id
                      ? 'bg-violet-800 text-white'
                      : 'bg-[#1b1e33] text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-purple-scrollbar space-y-4">
          {/* A. If Query is Empty: Show Search History & Suggestions */}
          {!query.trim() && (
            <div className="space-y-5 py-2">
              {/* Search History */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={() => {
                        searchService.clearSearchHistory(currentUser?.id);
                        setHistory([]);
                      }}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 px-1">
                    {history.map((term, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-2 px-3 py-1.5 bg-[#131526] hover:bg-[#1a1d35] border border-[#20233d] hover:border-violet-500/40 rounded-xl transition cursor-pointer"
                        onClick={() => setQuery(term)}
                      >
                        <span className="text-xs text-slate-200 group-hover:text-white">
                          {term}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            searchService.removeSearchHistoryItem(term, currentUser?.id);
                            setHistory(searchService.getSearchHistory(currentUser?.id));
                          }}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Popular Discovery Topics</span>
                </div>
                <div className="flex flex-wrap gap-2 px-1">
                  {suggestions.map((sugg, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(sugg)}
                      className="px-3 py-1.5 bg-[#121424] hover:bg-violet-950/40 border border-[#1f223a] hover:border-violet-500/50 rounded-xl text-xs text-violet-300 transition cursor-pointer"
                    >
                      #{sugg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Help */}
              <div className="p-3 bg-[#0d0f1c] border border-[#1c1e33] rounded-2xl flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Permission-aware: Only authorized messages & frequencies are shown.</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">NEXORA Search v1.0</span>
              </div>
            </div>
          )}

          {/* B. If Query is Present and Results Exist */}
          {query.trim() && searchResponse.results.length > 0 && (
            <div className="space-y-1.5">
              {searchResponse.results.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-start gap-3.5 p-3 rounded-2xl border text-left transition cursor-pointer group ${
                      isSelected
                        ? 'bg-[#181b30] border-violet-500/60 shadow-lg shadow-violet-900/20'
                        : 'bg-[#111322] border-[#1d2038] hover:border-[#2b2f52]'
                    }`}
                  >
                    {/* Item Type Icon */}
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'message' && (
                        <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === 'channel' && (
                        <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                          <Hash className="w-4 h-4" />
                        </div>
                      )}
                      {item.type === 'community' && (
                        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                          {item.metadata.icon ? <span>{item.metadata.icon}</span> : <Layers className="w-4 h-4" />}
                        </div>
                      )}
                      {item.type === 'user' && (
                        <img
                          src={item.metadata.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={item.title}
                          className="w-8 h-8 rounded-xl object-cover border border-[#2b2d49]"
                        />
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm text-slate-100 group-hover:text-white truncate">
                          {item.title}
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1d2038] text-slate-400 shrink-0">
                          {item.type}
                        </span>
                      </div>

                      {item.subtitle && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}

                      {item.snippet && item.type === 'message' && (
                        <div className="mt-1.5 p-2 rounded-xl bg-[#090a14] border border-[#191b2e] text-xs text-slate-300 font-sans break-words line-clamp-2">
                          {item.snippet}
                        </div>
                      )}
                    </div>

                    {/* Arrow / Jump indicator */}
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition text-violet-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* C. If Query is Present but Zero Results Found */}
          {query.trim() && searchResponse.results.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-200">
                No matching results found for "{query}"
              </div>
              <p className="text-xs text-slate-500 max-w-sm">
                We checked authorized frequencies, messages, communities, and known operatives. Private and unauthorized conversations are strictly excluded from search index.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 px-5 border-t border-[#1c1e33] bg-[#0a0b14] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><strong className="text-slate-400">↑↓</strong> Navigate</span>
            <span><strong className="text-slate-400">↵</strong> Select</span>
            <span><strong className="text-slate-400">ESC</strong> Close</span>
          </div>
          <span>NEXORA Global Intelligence</span>
        </div>
      </div>
    </div>
  );
};
