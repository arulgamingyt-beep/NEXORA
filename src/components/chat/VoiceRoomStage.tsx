import React from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Headphones,
  PhoneOff,
  Radio,
  Users,
  Shield,
  Zap,
} from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { VideoTile } from '../calling/VideoTile';
import { webrtcVoiceService } from '../../utils/webrtcVoice';

export const VoiceRoomStage: React.FC = () => {
  const {
    activeCommunity,
    activeChannel,
    voiceState,
    connectVoice,
    disconnectVoice,
    toggleVoiceMute,
    toggleVoiceDeafen,
    currentUser,
  } = useNexora();

  if (!activeCommunity || !activeChannel || activeChannel.type !== 'voice') {
    return null;
  }

  const isConnectedHere =
    voiceState.isConnected && voiceState.channelId === activeChannel.id;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0c18] relative overflow-hidden select-none">
      {/* Background Cyberpunk Accents */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="p-6 border-b border-[#1c1f36] bg-[#0c0e1a]/80 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white">
                #{activeChannel.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-widest">
                VOICE FREQUENCY
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {activeChannel.topic || '48kHz Ultra-Low Latency Peer-to-Peer Mesh'}
            </p>
          </div>
        </div>

        {/* Connection Action */}
        <div>
          {isConnectedHere ? (
            <button
              onClick={disconnectVoice}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={() =>
                connectVoice(activeChannel.id, activeChannel.name, activeCommunity.id)
              }
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-600/40 hover:scale-105 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Connect to Voice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Operative Roster Stage */}
      <div className="flex-1 p-6 overflow-y-auto z-10 flex flex-col justify-center">
        {isConnectedHere && voiceState.activeUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto w-full">
            {voiceState.activeUsers.map((u) => {
              const isLocal = u.userId === currentUser.id;
              const stream = isLocal
                ? webrtcVoiceService.localStream
                : webrtcVoiceService.remoteStreams.get(u.userId) || null;

              return (
                <div key={u.userId} className="h-56">
                  <VideoTile
                    participant={{
                      userId: u.userId,
                      displayName: u.displayName,
                      avatar: u.avatar,
                      isSpeaking: u.isSpeaking,
                      isMuted: u.isMuted || false,
                      isCameraOn: u.isCameraOn || false,
                      isScreenSharing: u.isScreenSharing || false,
                    }}
                    stream={stream}
                    isLocal={isLocal}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-xl shadow-emerald-500/10">
              <Volume2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Voice Channel Open</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Connect to this channel to speak with other operatives using zero-latency WebRTC mesh with automatic speech detection.
            </p>
            <button
              onClick={() =>
                connectVoice(activeChannel.id, activeChannel.name, activeCommunity.id)
              }
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-violet-600/30 hover:scale-105 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-300" />
              <span>Connect Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Connected Audio Controls */}
      {isConnectedHere && (
        <div className="p-4 bg-[#0c0e1a]/90 border-t border-[#1c1f36] flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>RTC 48kHz HD • STUN Traversal Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleVoiceMute}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                voiceState.isMuted
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : 'bg-[#181a2e] text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {voiceState.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{voiceState.isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={toggleVoiceDeafen}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                voiceState.isDeafened
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                  : 'bg-[#181a2e] text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>{voiceState.isDeafened ? 'Deafened' : 'Deafen'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

