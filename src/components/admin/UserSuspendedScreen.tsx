import React from 'react';
import { useNexora } from '../../context/NexoraContext';
import { ShieldAlert, LogOut, Mail, FileText, AlertOctagon } from 'lucide-react';

export const UserSuspendedScreen: React.FC = () => {
  const { currentUser, logout, showToast } = useNexora();

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('appeals@nexora.tech');
    showToast('Appeals desk email copied to clipboard: appeals@nexora.tech', 'info');
  };

  return (
    <div className="min-h-screen w-screen bg-[#070810] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14162810_1px,transparent_1px),linear-gradient(to_bottom,#14162810_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-xl bg-[#0d0f1d] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1b1e36]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CLEARANCE REVOKED
                </span>
                <span className="text-xs font-mono text-slate-500">CODE: SEC_SUSPEND_403</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Account Suspended
              </h1>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-2xl bg-[#121424] border border-[#20223a] flex items-center gap-4 mb-6">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-rose-500/40 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm sm:text-base truncate">
                {currentUser.displayName}
              </span>
              <span className="text-xs font-mono text-slate-400">@{currentUser.username}</span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{currentUser.email}</p>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold uppercase">
            Suspended
          </div>
        </div>

        {/* Suspension Reason Box */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-mono font-bold uppercase">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Administrative Reason Given
            </div>
            <p className="text-sm text-rose-100 font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-rose-900/40 font-mono">
              "{currentUser.suspendedReason || 'Violation of NEXORA Community Guidelines and Terms of Service.'}"
            </p>
            {currentUser.suspendedAt && (
              <p className="text-[11px] text-slate-400 font-mono">
                Suspension Enforced: {new Date(currentUser.suspendedAt).toLocaleString()}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All outbound transmission streams, community hub participation, voice/video mesh nodes, and direct messaging channels have been locked. If you believe this action was made in error or wish to appeal this decision, our Trust &amp; Safety team can review your case.
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1b1e36]">
          <button
            onClick={handleCopyEmail}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-200 border border-violet-500/40 text-xs font-mono font-bold transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-violet-400" />
            APPEAL (appeals@nexora.tech)
          </button>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 text-xs font-mono font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            SIGN OUT ACCOUNT
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-500 font-mono">
            NEXORA TECHNOLOGIES Security &amp; Safety Enforcement Ledger
          </span>
        </div>
      </div>
    </div>
  );
};

