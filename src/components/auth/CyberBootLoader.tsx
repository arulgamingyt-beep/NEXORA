import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const CyberBootLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-[#070810] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Background cyber radial glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

      {/* Cyber Hex Core Animation */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glowing pulsing ring */}
        <div className="absolute w-28 h-28 rounded-full border border-violet-500/30 animate-ping pointer-events-none" />

        {/* Middle rotating dashed ring */}
        <div className="w-24 h-24 rounded-full border border-violet-400/40 border-dashed animate-spin duration-1000 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-purple-500/30 border-t-violet-400 animate-spin duration-700" />
        </div>

        {/* Inner Logo */}
        <div className="absolute w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-violet-400/80 shadow-2xl shadow-violet-600/70 p-0.5 bg-[#0d0f1c]">
          <img src="/nexora-logo.jpg" alt="NEXORA" className="w-full h-full object-cover rounded-xl" />
        </div>
      </div>

      {/* Brand Title */}
      <div className="text-center space-y-2 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <span className="font-black text-2xl tracking-[0.25em] bg-gradient-to-r from-white via-violet-200 to-violet-400 bg-clip-text text-transparent">
            NEXORA
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
            CORE v2.5
          </span>
        </div>

        <p className="text-xs font-mono text-slate-400 tracking-widest flex items-center justify-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-violet-400 animate-spin" />
          <span>INITIALIZING QUANTUM ENCRYPTED SESSION</span>
        </p>

        {/* Progress scan bar */}
        <div className="w-48 h-1 bg-violet-950/60 rounded-full overflow-hidden mx-auto mt-4 border border-violet-500/20">
          <div className="w-full h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-400 animate-pulse" />
        </div>
      </div>

      {/* Security badge at bottom */}
      <div className="absolute bottom-6 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
        <Shield className="w-3 h-3 text-violet-500" />
        <span>ZERO-KNOWLEDGE AUTHENTICATION PROTOCOL</span>
      </div>
    </div>
  );
};

