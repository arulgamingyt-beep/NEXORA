import React from 'react';
import { useNexora } from '../../context/NexoraContext';
import { Bell } from 'lucide-react';

export const NotificationBell: React.FC = () => {
  const {
    unreadNotificationCount,
    isNotificationCenterOpen,
    toggleNotificationCenter,
  } = useNexora();

  return (
    <div className="relative">
      <button
        onClick={toggleNotificationCenter}
        title={
          unreadNotificationCount > 0
            ? `${unreadNotificationCount} unread notification(s) — Click to open Activity Center`
            : 'Notification & Activity Center'
        }
        className={`relative p-1.5 rounded-lg border transition cursor-pointer ${
          isNotificationCenterOpen
            ? 'bg-violet-600/30 text-violet-200 border-violet-500/50 shadow-md shadow-violet-500/20'
            : unreadNotificationCount > 0
            ? 'bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30'
            : 'bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10'
        }`}
      >
        <Bell className="w-3.5 h-3.5" />

        {/* Unread Indicator Badge */}
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#070810] shadow-sm animate-in zoom-in duration-150">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>
    </div>
  );
};

