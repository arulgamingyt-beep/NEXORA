import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, Radio, Shield } from 'lucide-react';
import { useNexora } from '../../context/NexoraContext';
import { webrtcVoiceService } from '../../utils/webrtcVoice';

export const IncomingCallModal: React.FC = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useNexora();

  useEffect(() => {
    if (incomingCall) {
      webrtcVoiceService.startRingtone('incoming');
    } else {
      webrtcVoiceService.stopRingtone();
    }
    return () => {
      webrtcVoiceService.stopRingtone();
    };
  }, [incomingCall]);

  if (!incomingCall) return null;

  const isVideo = incomingCall.type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#14162a] to-[#0a0b16] border border-violet-500/40 p-6 shadow-2xl shadow-violet-600/30 text-center select-none overflow-hidden">
        {/* Cyberpunk Accent Glow */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Pulsing Caller Avatar */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-violet-600/30 animate-ping duration-1000" />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-violet-400 ring-4 ring-violet-500/20 shadow-xl shadow-violet-600/30">
            <img
              src={incomingCall.callerAvatar}
              alt={incomingCall.callerName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-violet-600 text-white shadow-md">
            {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Caller Info */}
        <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold block mb-1">
          INCOMING {incomingCall.type.toUpperCase()} TRANSMISSION
        </span>
        <h2 className="text-xl font-extrabold text-white mb-1">
          {incomingCall.callerName}
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          {incomingCall.scope === 'group'
            ? `Group: ${incomingCall.targetName || 'Operatives'}`
            : 'Point-to-Point Secure Uplink'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Decline */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={declineIncomingCall}
              className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 transition cursor-pointer"
              title="Decline Transmission"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={acceptIncomingCall}
              className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-105 transition cursor-pointer"
              title={`Accept ${isVideo ? 'Video' : 'Voice'} Call`}
            >
              {isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
};

