import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  NexoraNotification,
  NotificationCategory,
  NotificationType,
} from '../../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Settings,
  X,
  MessageSquare,
  UserPlus,
  Users,
  AtSign,
  PhoneCall,
  Video,
  ShieldAlert,
  Megaphone,
  Circle,
  ExternalLink,
  VolumeX,
} from 'lucide-react';

export const NotificationCenterPopover: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    openModal,
    navigateToNotificationTarget,
  } = useNexora();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  if (!isNotificationCenterOpen) return null;

  // Filter by category
  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'direct') return n.type === 'dm_message' || n.type === 'friend_request' || n.type === 'friend_accept';
    if (activeCategory === 'mentions') return n.type === 'mention';
    if (activeCategory === 'community') return n.type === 'community_invite' || n.type === 'announcement';
    if (activeCategory === 'calls') return n.type === 'call_voice' || n.type === 'call_video';
    if (activeCategory === 'system') return n.type === 'moderation_action';
    return true;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'dm_message':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
      case 'friend_request':
      case 'friend_accept':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-amber-400" />;
      case 'call_voice':
        return <PhoneCall className="w-4 h-4 text-cyan-400" />;
      case 'call_video':
        return <Video className="w-4 h-4 text-indigo-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-yellow-400" />;
      case 'community_invite':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'moderation_action':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-violet-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const then = new Date(isoString).getTime();
      const now = Date.now();
      const diffSec = Math.floor((now - then) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDays = Math.floor(diffHr / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      {/* Backdrop for closing when clicking outside */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setIsNotificationCenterOpen(false)}
      />

      <div className="fixed top-12 right-2 sm:right-6 w-[94vw] sm:w-96 max-w-md max-h-[85vh] bg-[#0c0e1c] border border-[#20243e] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 select-none font-sans">
        {/* Header */}
        <div className="p-4 bg-[#0e1022] border-b border-[#1b1e36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white font-mono">
                  Activity Center
                </h3>
                {unreadNotificationCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[10px] font-mono font-bold">
                    {unreadNotificationCount} unread
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadNotificationCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all notifications as read"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
              </button>
            )}

            <button
              onClick={() => {
                setIsNotificationCenterOpen(false);
                openModal('notification_settings');
              }}
              title="Notification Preferences"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsNotificationCenterOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="px-3 pt-2 bg-[#0c0e1c] border-b border-[#1b1e36] flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 text-xs font-mono">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'direct', label: 'Direct' },
              { id: 'mentions', label: 'Mentions' },
              { id: 'community', label: 'Hubs' },
              { id: 'calls', label: 'Calls' },
              { id: 'system', label: 'System' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-[11px] font-bold ${
                activeCategory === cat.id
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#15172b] p-2 space-y-1">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => navigateToNotificationTarget(n)}
              className={`p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 relative group ${
                n.isRead
                  ? 'bg-transparent hover:bg-white/5 opacity-80 hover:opacity-100'
                  : 'bg-violet-950/20 hover:bg-violet-900/30 border border-violet-500/20'
              }`}
            >
              {/* Type Icon Badge */}
              <div className="w-8 h-8 rounded-xl bg-[#14172b] border border-[#222646] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {getNotificationIcon(n.type)}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-xs truncate">
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0 shadow-sm shadow-violet-400/50" />
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {n.body}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                  <span>{formatRelativeTime(n.createdAt)}</span>
                  <span>•</span>
                  <span className="uppercase text-violet-400/80">{n.type.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Action Buttons (Visible on hover or mobile) */}
              <div
                className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                onClick={(e) => e.stopPropagation()}
              >
                {!n.isRead && (
                  <button
                    onClick={() => markNotificationAsRead(n.id)}
                    title="Mark as read"
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  title="Delete notification"
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-mono text-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-600">
                <Bell className="w-5 h-5" />
              </div>
              <p>No transmissions in this feed.</p>
              <p className="text-[10px] text-slate-600">
                Live notifications arrive automatically as operatives send direct transmissions, mentions, or calls.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2.5 bg-[#0e1022] border-t border-[#1b1e36] flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
            <span>{notifications.length} total event(s)</span>
            <button
              onClick={clearAllNotifications}
              className="text-slate-400 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
};

