import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  MonitorOff,
  Headphones,
  PhoneOff,
  Settings,
  Shield,
  Maximize2,
  Minimize2,
  Users,
  Radio,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { VideoTile } from './VideoTile';
import { webrtcVoiceService } from '../../utils/webrtcVoice';
import { CallParticipant } from '../../types';

export const ActiveCallRoom: React.FC = () => {
  const {
    activeCall,
    currentUser,
    endActiveCall,
    toggleCamera,
    toggleScreenShare,
    voiceState,
    toggleVoiceMute,
    toggleVoiceDeafen,
  } = useNexora();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({ audioInputs: [], videoInputs: [], audioOutputs: [] });

  const [callDuration, setCallDuration] = useState(0);

  // Timer for call duration
  useEffect(() => {
    if (!activeCall) {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCall]);

  // Load devices
  useEffect(() => {
    webrtcVoiceService.enumerateDevices().then(setAvailableDevices);
  }, [showDeviceSettings]);

  if (!activeCall) return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert active users in voiceState to participant list
  const participants = voiceState.activeUsers;
  const isVideoCall = activeCall.type === 'video';

  // Check if someone is screen sharing
  const screenShareUser = participants.find((p) => p.isScreenSharing);
  const screenShareStream =
    screenShareUser?.userId === currentUser.id
      ? webrtcVoiceService.localScreenStream
      : screenShareUser
      ? webrtcVoiceService.remoteStreams.get(screenShareUser.userId) || null
      : null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#070810]/95 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-3 sm:p-6'
      }`}
    >
      {/* Top Header Bar */}
      <header className="h-14 px-4 bg-[#0c0e1a]/80 backdrop-blur-md border border-violet-500/20 rounded-2xl flex items-center justify-between shrink-0 select-none z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300">
            {isVideoCall ? <Video className="w-4 h-4 text-violet-400" /> : <Radio className="w-4 h-4 text-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:text-base">
                {activeCall.targetName || 'Direct Frequency'}
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-violet-600/30 text-violet-300 border border-violet-500/30 uppercase tracking-widest">
                {activeCall.scope} • {activeCall.type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CONNECTED • {formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Calling Stage */}
      <div className="flex-1 my-3 overflow-hidden flex flex-col relative">
        {/* Screen Share Spotlight Mode */}
        {screenShareStream && screenShareUser ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
            <div className="flex-1 rounded-3xl overflow-hidden bg-black border border-violet-500/40 relative flex items-center justify-center">
              <video
                ref={(el) => {
                  if (el && el.srcObject !== screenShareStream) {
                    el.srcObject = screenShareStream;
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-xs font-mono text-white flex items-center gap-2 border border-white/10">
                <MonitorUp className="w-4 h-4 text-violet-400" />
                <span>{screenShareUser.displayName}'s Screen</span>
              </div>
            </div>

            {/* Sidebar Tiles */}
            <div className="w-full lg:w-64 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0">
              {participants.map((p) => {
                const isLocal = p.userId === currentUser.id;
                const stream = isLocal
                  ? webrtcVoiceService.localStream
                  : webrtcVoiceService.remoteStreams.get(p.userId) || null;
                const participant: CallParticipant = {
                  userId: p.userId,
                  displayName: p.displayName,
                  avatar: p.avatar,
                  isSpeaking: p.isSpeaking,
                  isMuted: p.isMuted || false,
                  isCameraOn: p.isCameraOn || false,
                  isScreenSharing: p.isScreenSharing || false,
                };
                return (
                  <div key={p.userId} className="w-48 lg:w-full h-36 shrink-0">
                    <VideoTile participant={participant} stream={stream} isLocal={isLocal} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Standard Responsive Participant Grid */
          <div
            className={`w-full h-full grid gap-3.5 p-1 ${
              participants.length === 1
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : participants.length === 2
                ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                : participants.length <= 4
                ? 'grid-cols-1 sm:grid-cols-2'
                : participants.length <= 6
                ? 'grid-cols-2 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {participants.map((p) => {
              const isLocal = p.userId === currentUser.id;
              const stream = isLocal
                ? webrtcVoiceService.localStream
                : webrtcVoiceService.remoteStreams.get(p.userId) || null;
              const participant: CallParticipant = {
                userId: p.userId,
                displayName: p.displayName,
                avatar: p.avatar,
                isSpeaking: p.isSpeaking,
                isMuted: p.isMuted || false,
                isCameraOn: p.isCameraOn || false,
                isScreenSharing: p.isScreenSharing || false,
              };

              return (
                <div key={p.userId} className="w-full h-full min-h-[220px]">
                  <VideoTile participant={participant} stream={stream} isLocal={isLocal} />
                </div>
              );
            })}
          </div>
        )}

        {/* Device Settings Flyout */}
        {showDeviceSettings && (
          <div className="absolute bottom-4 right-4 w-80 bg-[#121424] border border-violet-500/30 rounded-2xl p-4 shadow-2xl z-40 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-bold text-violet-300 font-mono">
              <span>HARDWARE SETTINGS</span>
              <button
                onClick={() => setShowDeviceSettings(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Microphone
              </label>
              <select className="w-full bg-[#090b14] border border-[#232644] rounded-xl px-2.5 py-1.5 text-xs text-white">
                {availableDevices.audioInputs.length === 0 ? (
                  <option>Default System Microphone</option>
                ) : (
                  availableDevices.audioInputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone (${d.deviceId.slice(0, 5)})`}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Camera
              </label>
              <select className="w-full bg-[#090b14] border border-[#232644] rounded-xl px-2.5 py-1.5 text-xs text-white">
                {availableDevices.videoInputs.length === 0 ? (
                  <option>Default Camera</option>
                ) : (
                  availableDevices.videoInputs.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera (${d.deviceId.slice(0, 5)})`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Communications Dock */}
      <footer className="h-16 px-6 bg-[#0c0e1a]/90 backdrop-blur-xl border border-violet-500/25 rounded-2xl flex items-center justify-center gap-3 sm:gap-4 shrink-0 shadow-2xl z-20 self-center">
        {/* Mic Toggle */}
        <button
          onClick={toggleVoiceMute}
          title={voiceState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          className={`p-3 rounded-2xl font-bold transition shadow-lg cursor-pointer ${
            voiceState.isMuted
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-[#181a2e] hover:bg-[#20233d] text-white border border-white/10'
          }`}
        >
          {voiceState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          title={voiceState.isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          className={`p-3 rounded-2xl font-bold transition shadow-lg cursor-pointer ${
            voiceState.isCameraOn
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
              : 'bg-[#181a2e] hover:bg-[#20233d] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          {voiceState.isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          title={voiceState.isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
          className={`p-3 rounded-2xl font-bold transition shadow-lg cursor-pointer ${
            voiceState.isScreenSharing
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-[#181a2e] hover:bg-[#20233d] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          {voiceState.isScreenSharing ? (
            <MonitorOff className="w-5 h-5" />
          ) : (
            <MonitorUp className="w-5 h-5" />
          )}
        </button>

        {/* Deafen Toggle */}
        <button
          onClick={toggleVoiceDeafen}
          title={voiceState.isDeafened ? 'Undeafen' : 'Deafen'}
          className={`p-3 rounded-2xl font-bold transition shadow-lg cursor-pointer ${
            voiceState.isDeafened
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              : 'bg-[#181a2e] hover:bg-[#20233d] text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Headphones className="w-5 h-5" />
            {voiceState.isDeafened && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-5 h-0.5 bg-white -rotate-45 rounded-full" />
              </div>
            )}
          </div>
        </button>

        {/* Device Settings */}
        <button
          onClick={() => setShowDeviceSettings(!showDeviceSettings)}
          title="Audio & Video Settings"
          className="p-3 rounded-2xl bg-[#181a2e] hover:bg-[#20233d] text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* End Call Button */}
        <button
          onClick={endActiveCall}
          title="End Call"
          className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/40 transition cursor-pointer ml-2"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="hidden sm:inline text-xs uppercase tracking-wider">Disconnect</span>
        </button>
      </footer>
    </div>
  );
};
