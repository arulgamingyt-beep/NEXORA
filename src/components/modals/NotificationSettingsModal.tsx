import React from 'react';
import { useNexora } from '../../context/NexoraContext';
import { notificationService } from '../../services/notificationService';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Globe,
  MessageSquare,
  Shield,
  Volume1,
  Lock,
} from 'lucide-react';

export const NotificationSettingsModal: React.FC = () => {
  const {
    closeModal,
    notificationPreferences,
    updateNotificationPreferences,
    requestDesktopNotificationPermission,
    communities,
    dmConversations,
    toggleMuteCommunity,
    toggleMuteConversation,
  } = useNexora();

  const permissionStatus = notificationService.getBrowserPermissionStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none font-sans">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#0d0f1e] border border-[#232745] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0e1022] border-b border-[#1b1e36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Configure auditory cues, desktop alerts, and category routing
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs font-mono">
          {/* Section 1: Auditory & Desktop Toggles */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
              Delivery Channels
            </span>

            {/* Sound Effects Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#13162b] border border-[#222646] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-300 shrink-0">
                  {notificationPreferences.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-violet-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">Interface Audio Chimes</div>
                  <div className="text-[11px] text-slate-400">
                    Play synthesized harmonic sound FX when messages or calls arrive
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateNotificationPreferences({
                    soundEnabled: !notificationPreferences.soundEnabled,
                  })
                }
                className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${
                  notificationPreferences.soundEnabled ? 'bg-violet-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    notificationPreferences.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Desktop Notifications Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#13162b] border border-[#222646] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Browser &amp; Desktop Banners</div>
                    <div className="text-[11px] text-slate-400">
                      Display native OS notification popups when transmission arrives
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (permissionStatus !== 'granted') {
                      requestDesktopNotificationPermission();
                    } else {
                      updateNotificationPreferences({
                        desktopEnabled: !notificationPreferences.desktopEnabled,
                      });
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition p-1 cursor-pointer ${
                    notificationPreferences.desktopEnabled && permissionStatus === 'granted'
                      ? 'bg-cyan-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      notificationPreferences.desktopEnabled && permissionStatus === 'granted'
                        ? 'translate-x-6'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Permission Status Pill */}
              <div className="pt-2 border-t border-[#1b1e36] flex items-center justify-between">
                <span className="text-slate-400">OS Permission Status:</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      permissionStatus === 'granted'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : permissionStatus === 'denied'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {permissionStatus}
                  </span>

                  {permissionStatus !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestDesktopNotificationPermission}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold transition cursor-pointer"
                    >
                      REQUEST CONSENT
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Category Routing Switches */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
              Notification Categories
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  key: 'direct',
                  label: 'Direct Messages',
                  desc: '1-on-1 and group DMs',
                },
                {
                  key: 'mentions',
                  label: 'Mentions & Pings',
                  desc: '@callsign occurrences',
                },
                {
                  key: 'community',
                  label: 'Hub Announcements',
                  desc: 'Server-wide broadcast channels',
                },
                {
                  key: 'calls',
                  label: 'Voice & Video Calls',
                  desc: 'Incoming transmission links',
                },
                {
                  key: 'system',
                  label: 'Security & Moderation',
                  desc: 'Clearance & safety notices',
                },
              ].map((cat) => {
                const isEnabled =
                  notificationPreferences.categories[
                    cat.key as keyof typeof notificationPreferences.categories
                  ] ?? true;
                return (
                  <div
                    key={cat.key}
                    className="p-3 rounded-2xl bg-[#13162b] border border-[#222646] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{cat.label}</div>
                      <div className="text-[10px] text-slate-500">{cat.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateNotificationPreferences({
                          categories: {
                            ...notificationPreferences.categories,
                            [cat.key]: !isEnabled,
                          },
                        })
                      }
                      className={`w-10 h-5 rounded-full transition p-0.5 cursor-pointer ${
                        isEnabled ? 'bg-violet-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Muted Communities & Conversations */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
              Muted Hubs &amp; Direct Transmissions
            </span>

            {/* Muted Communities */}
            <div className="p-3.5 rounded-2xl bg-[#13162b] border border-[#222646] space-y-2">
              <span className="text-slate-400 font-bold block">Muted Community Hubs</span>
              {Object.keys(notificationPreferences.mutedCommunities).length > 0 ? (
                <div className="space-y-1.5">
                  {Object.keys(notificationPreferences.mutedCommunities).map((commId) => {
                    const comm = communities.find((c) => c.id === commId);
                    return (
                      <div
                        key={commId}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#0e1022] border border-[#1b1e36]"
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-white">{comm ? comm.name : commId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMuteCommunity(commId)}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition cursor-pointer"
                        >
                          UNMUTE
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No community hubs muted.</p>
              )}
            </div>

            {/* Muted Conversations */}
            <div className="p-3.5 rounded-2xl bg-[#13162b] border border-[#222646] space-y-2">
              <span className="text-slate-400 font-bold block">Muted Conversations</span>
              {Object.keys(notificationPreferences.mutedConversations).length > 0 ? (
                <div className="space-y-1.5">
                  {Object.keys(notificationPreferences.mutedConversations).map((convId) => {
                    const conv = dmConversations.find((d) => d.id === convId);
                    return (
                      <div
                        key={convId}
                        className="flex items-center justify-between p-2 rounded-xl bg-[#0e1022] border border-[#1b1e36]"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-white">
                            {conv ? conv.name || conv.id : convId}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMuteConversation(convId)}
                          className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] transition cursor-pointer"
                        >
                          UNMUTE
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No conversations muted.</p>
              )}
            </div>
          </div>

          {/* Privacy & Zero-Paid Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-violet-950/20 border border-violet-500/20 text-slate-400 text-[11px] leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-violet-300">NEXORA Zero-Tracker Architecture:</strong> All notifications are transmitted peer-to-peer and through Google Cloud Firestore. NEXORA does not sell device telemetry, charge for push alerts, or inject battery-draining third-party push networks.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0e1022] border-t border-[#1b1e36] flex justify-end shrink-0">
          <button
            type="button"
            onClick={closeModal}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
