import React, { useRef, useEffect } from 'react';
import { MicOff, MonitorUp, Shield, Volume2 } from 'lucide-react';
import { CallParticipant } from '../../types';

interface VideoTileProps {
  participant: CallParticipant;
  stream: MediaStream | null;
  isLocal?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideoTrack = Boolean(
    stream && stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
  );

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, hasVideoTrack]);

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-[#0a0c18] border transition-all duration-300 flex items-center justify-center min-h-[200px] h-full ${
        participant.isSpeaking
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40'
          : 'border-[#1e2238] hover:border-violet-500/40'
      }`}
    >
      {/* Video Stream Element */}
      {hasVideoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video preview to prevent audio feedback
          className={`w-full h-full object-cover rounded-3xl ${
            isLocal && !participant.isScreenSharing ? '-scale-x-100' : ''
          }`}
        />
      ) : (
        /* Avatar Placeholder when Camera is Off */
        <div className="flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative mb-3">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                participant.isSpeaking
                  ? 'border-emerald-400 ring-4 ring-emerald-400/30 shadow-lg shadow-emerald-400/30'
                  : 'border-violet-500/30'
              }`}
            >
              <img
                src={participant.avatar}
                alt={participant.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {participant.isSpeaking && (
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-black">
                <Volume2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            {participant.displayName} {isLocal && '(You)'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {participant.isSpeaking ? 'TRANSMITTING VOICE' : 'IDLE'}
          </span>
        </div>
      )}

      {/* Top Status Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        {participant.isScreenSharing && (
          <span className="px-2 py-0.5 rounded-lg bg-violet-600/80 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1 border border-violet-400/30 shadow-md">
            <MonitorUp className="w-3 h-3 text-violet-200" />
            SCREEN
          </span>
        )}
        {isLocal && (
          <span className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-mono text-violet-300 border border-white/10">
            LOCAL
          </span>
        )}
      </div>

      {/* Bottom Name & Mute HUD */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-xs font-semibold text-white/90 truncate max-w-[70%] border border-white/10">
          {participant.displayName}
        </span>
        <div className="flex items-center gap-1.5">
          {participant.isMuted && (
            <span className="p-1.5 rounded-xl bg-rose-600/90 text-white shadow-md">
              <MicOff className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

