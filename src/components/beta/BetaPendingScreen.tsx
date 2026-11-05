import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { WelcomeGuideModal } from './WelcomeGuideModal';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  Clock,
  XCircle,
  RefreshCw,
  Bug,
  Zap,
  LogOut,
  CheckCircle,
  Mail,
  User as UserIcon,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export const BetaPendingScreen: React.FC = () => {
  const {
    currentUser,
    refreshBetaStatus,
    openModal,
    quickDemoLogin,
    logout,
    showToast,
  } = useNexora();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isRejected = currentUser.betaStatus === 'rejected';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBetaStatus();
    } catch (err: any) {
      showToast(err?.message || 'Failed to refresh status.', 'warning');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#070810] text-slate-100 flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto custom-purple-scrollbar">
      {/* Top Header Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#1a1c2e]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-violet-500/50 shadow-md shadow-violet-600/30 shrink-0 bg-[#0d0f1d]">
            <img src="/nexora-logo.jpg" alt="NEXORA" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-widest text-white font-mono">
                NEXORA
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                PRIVATE BETA GATE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Access Clearance Verification Node</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">{showGuide ? 'Hide Guide' : 'Read Welcome Manual'}</span>
          </button>

          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 text-xs font-mono transition cursor-pointer flex items-center gap-1.5"
            title="Disconnect Terminal Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 space-y-6">
        {/* Status Verification Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#131528] to-[#0a0b16] border border-[#2b2d4a] shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#20223c]">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                  isRejected
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/20'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/20'
                }`}
              >
                {isRejected ? <XCircle className="w-7 h-7" /> : <Clock className="w-7 h-7 animate-pulse" />}
              </div>

              <div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold border ${
                    isRejected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {isRejected ? 'APPLICATION NOT APPROVED' : 'APPLICATION UNDER REVIEW'}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {isRejected
                    ? 'Beta Access Request Not Cleared'
                    : 'Welcome to NEXORA Private Beta'}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Ticket Reference ID: <span className="text-violet-300">{currentUser.id}</span>
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Check Approval Status</span>
            </button>
          </div>

          {/* Applicant Credentials Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3.5 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">APPLICANT CALLSIGN</span>
              <div className="text-white font-bold text-sm truncate">@{currentUser.username}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser.displayName}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">ELECTRONIC MAIL</span>
              <div className="text-white font-bold text-sm truncate">{currentUser.email || 'Registered User'}</div>
              <div className="text-[11px] text-emerald-400">Identity Cryptographically Vaulted</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">ACCESS CLEARANCE</span>
              <div className="text-amber-300 font-bold text-sm">
                {isRejected ? 'Declined' : 'Pending Review'}
              </div>
              <div className="text-[11px] text-slate-400">Tier: Beta Applicant</div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="p-4 rounded-2xl bg-[#0d0e1d] border border-white/5 space-y-2 text-xs leading-relaxed text-slate-300 font-sans">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>Administrator Approval System Active</span>
            </h4>
            <p>
              To protect early network integrity and verify peer-to-peer performance, all new NEXORA operatives undergo administrator clearance before live community and voice/video frequencies are unlocked.
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              ⚡ <strong>Reactive Verification Node:</strong> You do not need to refresh this page repeatedly. The application listens for real-time administrator approval; once cleared, your workspace will unlock automatically.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => openModal('beta_feedback')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Bug className="w-3.5 h-3.5" />
                <span>Submit Feedback or Question</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={quickDemoLogin}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Try Sandbox Demo (Instant Access)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Embedded Welcome Manual if toggled */}
        {showGuide && (
          <div className="animate-in fade-in duration-200">
            <WelcomeGuideModal isEmbedded onClose={() => setShowGuide(false)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center pt-6 border-t border-[#1a1c2e] text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>NEXORA TECHNOLOGIES INC. — CONNECT WITHOUT LIMITS</span>
        <span>Secure Terminal Port 3000 // Verified Cryptographic Vault</span>
      </footer>
    </div>
  );
};

