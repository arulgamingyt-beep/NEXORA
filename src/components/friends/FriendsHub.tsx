import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Users,
  UserPlus,
  MessageSquare,
  Search,
  Check,
  X,
  MoreVertical,
  ShieldAlert,
  Clock,
  Sparkles,
  UserMinus,
  Ban,
  Radio,
  Flame,
} from 'lucide-react';
import { FriendsTab, User } from '../../types';

export const FriendsHub: React.FC = () => {
  const {
    currentUser,
    friends,
    friendRequests,
    blockedUsers,
    friendsTab,
    setFriendsTab,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    openDMWithUser,
    allUsers,
    setSelectedUserForProfile,
  } = useNexora();

  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');
  const [addFriendFeedback, setAddFriendFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Active dropdown menu for friend actions
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Filter Friends
  const onlineFriends = friends.filter(
    (f) => f.friend.status === 'online' || f.friend.status === 'idle' || f.friend.status === 'dnd'
  );

  const incomingRequests = friendRequests.filter(
    (r) => r.receiverId === currentUser.id && r.status === 'pending'
  );
  const outgoingRequests = friendRequests.filter(
    (r) => r.senderId === currentUser.id && r.status === 'pending'
  );

  const displayedFriends = (friendsTab === 'online' ? onlineFriends : friends).filter((f) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      f.friend.displayName.toLowerCase().includes(q) ||
      f.friend.username.toLowerCase().includes(q) ||
      f.friend.tag.toLowerCase().includes(q)
    );
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setAddFriendFeedback(null);
    if (!addFriendInput.trim()) return;

    const res = sendFriendRequest(addFriendInput.trim());
    if (res.success) {
      setAddFriendFeedback({ type: 'success', text: res.message });
      setAddFriendInput('');
    } else {
      setAddFriendFeedback({ type: 'error', text: res.message });
    }
  };

  const getStatusBadge = (user: User) => {
    switch (user.status) {
      case 'online':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c0e1a]" />;
      case 'idle':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#0c0e1a]" />;
      case 'dnd':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-[#0c0e1a]" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-[#0c0e1a]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#0c0e1a] select-none">
      {/* Top Navigation Bar */}
      <header className="h-12 px-4 bg-[#090a14] border-b border-[#1a1c2e] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Friends Header Label */}
          <div className="flex items-center gap-2 text-white font-bold text-sm shrink-0 pr-2">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Friends</span>
          </div>

          <div className="h-4 w-[1px] bg-white/10 shrink-0" />

          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setFriendsTab('online');
                setAddFriendFeedback(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                friendsTab === 'online'
                  ? 'bg-violet-600/30 text-white border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Online</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#181a2e] text-slate-300 font-mono">
                {onlineFriends.length}
              </span>
            </button>

            <button
              onClick={() => {
                setFriendsTab('all');
                setAddFriendFeedback(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                friendsTab === 'all'
                  ? 'bg-violet-600/30 text-white border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#181a2e] text-slate-300 font-mono">
                {friends.length}
              </span>
            </button>

            <button
              onClick={() => {
                setFriendsTab('pending');
                setAddFriendFeedback(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                friendsTab === 'pending'
                  ? 'bg-violet-600/30 text-white border border-violet-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Pending</span>
              {incomingRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8247ff] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setFriendsTab('blocked');
                setAddFriendFeedback(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                friendsTab === 'blocked'
                  ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Blocked</span>
              {blockedUsers.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#181a2e] text-slate-300 font-mono">
                  {blockedUsers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setFriendsTab('add_friend');
                setAddFriendFeedback(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                friendsTab === 'add_friend'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Friends Pane Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0" onClick={() => setActiveMenuUserId(null)}>
        {/* ADD FRIEND TAB */}
        {friendsTab === 'add_friend' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>ADD OPERATIVE TO FRIENDS</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You can add friends with their NEXORA username, callsign, or tag (e.g.{' '}
                <span className="text-violet-300 font-mono">elena_r</span> or{' '}
                <span className="text-violet-300 font-mono">#4096</span>).
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendRequest} className="space-y-3">
              <div className="flex items-center gap-2 bg-[#121424] border border-[#20223d] focus-within:border-emerald-500 rounded-2xl p-1.5 pr-2 transition shadow-lg">
                <input
                  type="text"
                  value={addFriendInput}
                  onChange={(e) => {
                    setAddFriendInput(e.target.value);
                    setAddFriendFeedback(null);
                  }}
                  placeholder="You can add friends with their username or #tag..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!addFriendInput.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Send Friend Request</span>
                </button>
              </div>

              {addFriendFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
                    addFriendFeedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {addFriendFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{addFriendFeedback.text}</span>
                </div>
              )}
            </form>

            {/* Operatives Directory Quick Suggestions */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block">
                Suggested Operatives in Network
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.values(allUsers)
                  .filter(
                    (u) =>
                      u.id !== currentUser.id &&
                      !friends.some((f) => f.userIds.includes(u.id)) &&
                      !blockedUsers.some((b) => b.blockedId === u.id)
                  )
                  .slice(0, 6)
                  .map((user) => {
                    const isPending = friendRequests.some(
                      (r) =>
                        r.status === 'pending' &&
                        ((r.senderId === currentUser.id && r.receiverId === user.id) ||
                          (r.senderId === user.id && r.receiverId === currentUser.id))
                    );

                    return (
                      <div
                        key={user.id}
                        className="p-3 bg-[#131526] hover:bg-[#181a30] border border-[#20223d] rounded-2xl flex items-center justify-between transition group"
                      >
                        <div
                          onClick={() => setSelectedUserForProfile(user)}
                          className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-violet-500/30"
                            />
                            <span className="absolute bottom-0 right-0">
                              {getStatusBadge(user)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-white truncate">
                              {user.displayName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              @{user.username} {user.tag}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => sendFriendRequest(user.username)}
                          disabled={isPending}
                          className={`p-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                            isPending
                              ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                              : 'bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/30'
                          }`}
                          title={isPending ? 'Request Pending' : 'Send Friend Request'}
                        >
                          {isPending ? <Clock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* PENDING REQUESTS TAB */}
        {friendsTab === 'pending' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Incoming Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-violet-400 uppercase tracking-wider px-1">
                <span>Incoming Transmissions ({incomingRequests.length})</span>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-[#121424] rounded-2xl border border-white/5 font-mono">
                  NO PENDING INCOMING FRIEND TRANSMISSIONS.
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-[#131526] border border-[#20223d] hover:border-violet-500/40 rounded-2xl flex items-center justify-between transition shadow-md"
                  >
                    <div
                      onClick={() => setSelectedUserForProfile(req.sender)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={req.sender.avatar}
                          alt={req.sender.displayName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-violet-500/30"
                        />
                        <span className="absolute bottom-0 right-0">
                          {getStatusBadge(req.sender)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                          <span>{req.sender.displayName}</span>
                          <span className="text-xs text-violet-400 font-mono font-normal">
                            {req.sender.tag}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Incoming Friend Request • {req.createdAt}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => rejectFriendRequest(req.id)}
                        title="Decline Request"
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => acceptFriendRequest(req.id)}
                        title="Accept Request"
                        className="p-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">Accept</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Outgoing Requests */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Outgoing Transmissions ({outgoingRequests.length})</span>
              </div>

              {outgoingRequests.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-[#121424] rounded-2xl border border-white/5 font-mono">
                  NO OUTGOING TRANSMISSIONS PENDING.
                </div>
              ) : (
                outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 bg-[#131526] border border-[#20223d] rounded-2xl flex items-center justify-between transition"
                  >
                    <div
                      onClick={() => setSelectedUserForProfile(req.receiver)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                    >
                      <img
                        src={req.receiver.avatar}
                        alt={req.receiver.displayName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-violet-500/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-white truncate">
                          {req.receiver.displayName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          Outgoing Friend Request • {req.createdAt}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => cancelFriendRequest(req.id)}
                      title="Cancel Request"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-medium transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BLOCKED USERS TAB */}
        {friendsTab === 'blocked' && (
          <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Blocked Operatives ({blockedUsers.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Blocked operatives cannot send you transmissions, friend requests, or see your activity.
              </p>
            </div>

            {blockedUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#121424] rounded-2xl border border-white/5 font-mono">
                NO BLOCKED OPERATIVES. YOUR COMM LINE IS CLEAR.
              </div>
            ) : (
              blockedUsers.map((block) => (
                <div
                  key={block.id}
                  className="p-3.5 bg-[#131526] border border-rose-500/20 rounded-2xl flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={block.blockedUser.avatar}
                      alt={block.blockedUser.displayName}
                      className="w-10 h-10 rounded-full object-cover opacity-60 ring-1 ring-rose-500/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-200 truncate flex items-center gap-2">
                        <span>{block.blockedUser.displayName}</span>
                        <span className="text-xs text-rose-400 font-mono">
                          {block.blockedUser.tag}
                        </span>
                      </div>
                      <div className="text-[11px] text-rose-400/80 font-mono">
                        BLOCKED • Communication link severed
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => unblockUser(block.blockedId)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONLINE & ALL FRIENDS TABS */}
        {(friendsTab === 'online' || friendsTab === 'all') && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-[#121424] border border-[#20223d] focus:border-[#8247ff] rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>

            <div className="text-xs font-bold text-violet-400 uppercase tracking-wider px-1">
              <span>
                {friendsTab === 'online' ? 'Online Friends' : 'All Friends'} — {displayedFriends.length}
              </span>
            </div>

            {displayedFriends.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-[#121424] rounded-3xl border border-white/5 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-bold text-slate-300">
                  {friendsTab === 'online' ? 'No friends currently online' : 'No friends in directory'}
                </p>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {friendsTab === 'online'
                    ? 'None of your friends are currently active. Switch to "All" or add new operatives.'
                    : 'Start building your team network by using "Add Friend" above!'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {displayedFriends.map((f) => {
                  const isMenuOpen = activeMenuUserId === f.friend.id;

                  return (
                    <div
                      key={f.id}
                      className="p-3 bg-[#131526] hover:bg-[#181a30] border border-[#20223d] hover:border-violet-500/30 rounded-2xl flex items-center justify-between transition group relative"
                    >
                      <div
                        onClick={() => setSelectedUserForProfile(f.friend)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={f.friend.avatar}
                            alt={f.friend.displayName}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-violet-500/30"
                          />
                          <span className="absolute bottom-0 right-0">
                            {getStatusBadge(f.friend)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                            <span>{f.friend.displayName}</span>
                            <span className="text-xs text-slate-400 font-mono font-normal">
                              {f.friend.tag}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                            <span className="capitalize">{f.friend.status}</span>
                            {f.friend.customStatus && (
                              <>
                                <span>•</span>
                                <span className="text-violet-300 truncate">
                                  {f.friend.customStatus}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openDMWithUser(f.friend.id)}
                          title="Transmit Direct Message"
                          className="p-2 rounded-xl bg-[#1d2038] hover:bg-[#8247ff] text-violet-300 hover:text-white transition cursor-pointer shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuUserId(isMenuOpen ? null : f.friend.id);
                            }}
                            title="More Actions"
                            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Friend Options Dropdown */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-10 w-44 bg-[#181a2e] rounded-xl shadow-2xl border border-violet-500/20 p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                            >
                              <button
                                onClick={() => {
                                  openDMWithUser(f.friend.id);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                                <span>Message</span>
                              </button>
                              <button
                                onClick={() => {
                                  removeFriend(f.friend.id);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                                <span>Remove Friend</span>
                              </button>
                              <button
                                onClick={() => {
                                  blockUser(f.friend.id);
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block Operative</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
