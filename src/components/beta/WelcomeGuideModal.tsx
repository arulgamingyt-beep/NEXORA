import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Users,
  MessageSquare,
  Phone,
  Video,
  Monitor,
  Bug,
  Compass,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  KeyRound,
  X,
  Layers,
  Zap,
} from 'lucide-react';

interface WelcomeGuideModalProps {
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const WelcomeGuideModal: React.FC<WelcomeGuideModalProps> = ({
  onClose,
  isEmbedded = false,
}) => {
  const { closeModal, openModal, currentUser } = useNexora();
  const [activeTab, setActiveTab] = useState<'overview' | 'account' | 'communities' | 'messages' | 'calls' | 'feedback'>('overview');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  const content = (
    <div className={`relative bg-gradient-to-b from-[#131528] to-[#0a0b16] border border-[#2b2d4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${isEmbedded ? 'w-full' : 'w-full max-w-4xl max-h-[92vh]'}`}>
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-[#20223c] flex items-center justify-between shrink-0 bg-[#0d0e1c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
            <Compass className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
                NEXORA OPERATIVE MANUAL
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                BETA v1.0
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white">Welcome & Onboarding Experience</h2>
          </div>
        </div>

        {!isEmbedded && (
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#20223c] bg-[#090a14] px-4 pt-2 overflow-x-auto shrink-0 custom-purple-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1. What is NEXORA</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'account'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>2. Account Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('communities')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'communities'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. Communities</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>4. Messaging</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'calls'
              ? 'border-violet-500 text-violet-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>5. Voice & Video</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 px-3 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'border-amber-500 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>6. Report Bugs</span>
        </button>
      </div>

      {/* Guide Content Body */}
      <div className="p-6 overflow-y-auto custom-purple-scrollbar flex-1 space-y-6 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
        {/* ============================================================== */}
        {/* 1. WHAT IS NEXORA */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-500/20">
              <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-bold">
                PLATFORM INTRODUCTION
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">What is NEXORA?</h3>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                NEXORA is a high-performance community and real-time communication platform engineered by{' '}
                <strong className="text-white">NEXORA TECHNOLOGIES</strong>. Designed for decentralized squads, developer collectives, and security-conscious teams, NEXORA pairs Discord-grade ergonomics with peer-to-peer WebRTC streaming and verifiable data sovereignty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-violet-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero Plaintext Storage</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Client-side salted SHA-256 Web Crypto hashing protects credentials before leaving your device.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  <span>Direct Peer Mesh</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Voice, 720p HD video, and screen sharing flow directly between browsers without central media recording.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>₹0 Cost Architecture</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Runs smoothly on free-tier infrastructure (Vercel/Netlify + Cloud Firestore) with sub-millisecond local caching.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. HOW TO CREATE AN ACCOUNT */}
        {/* ============================================================== */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">How to Create an Account</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Three simple steps to initialize your cryptographic operative profile.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">Choose Your Callsign and Display Name</h4>
                  <p className="text-[11px] text-slate-300">
                    Enter an alphanumeric callsign (e.g. <code>@cypher_lead</code>) and your preferred display name. Callsigns are unique identifiers across the NEXORA network.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">Enter Electronic Mail & Security Key</h4>
                  <p className="text-[11px] text-slate-300">
                    Provide your electronic mail and a password with at least 6 characters. Your password is immediately hashed via <code>crypto.subtle.digest('SHA-256')</code> with an individual cryptographic salt.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-3">
                <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-xs">Review & Accept Legal Terms</h4>
                  <p className="text-[11px] text-slate-300">
                    Review the Privacy Policy, Terms of Service, and Community Guidelines (v1.0). Check the acceptance box to register and submit your beta application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. HOW TO CREATE OR JOIN A COMMUNITY */}
        {/* ============================================================== */}
        {activeTab === 'communities' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">How to Create or Join a Community</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Communities (Hubs) are private or public collectives with customized channels and role hierarchies.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-violet-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Creating a New Community</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>Click the <strong>+</strong> icon on the left hexagonal server rail.</li>
                  <li>Enter your community name, tagline, description, and base64 banner icon.</li>
                  <li>Default categories (<code>#TEXT CHANNELS</code> and <code>#VOICE CHANNELS</code>) are automatically provisioned.</li>
                  <li>As the Creator, you are assigned the permanent <strong>Owner</strong> role.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Joining via Invite Code or Link</span>
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>Click the Compass icon or press <code>Ctrl+K</code> to open the Quick Switcher.</li>
                  <li>Click <strong>Join via Invite Code</strong> and paste a code (e.g. <code>NXR-SYN-7700</code>).</li>
                  <li>Or navigate directly to a shareable link formatted as <code>?invite=CODE</code>.</li>
                  <li>New members join with the <code>Member</code> role and immediate channel access.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. HOW TO SEND MESSAGES */}
        {/* ============================================================== */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">How to Send Transmissions & DMs</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Real-time sub-millisecond messaging across community channels and direct conversations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090a14] border border-white/5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Rich Markdown Support</h4>
                  <p className="text-slate-300 text-[11px]">
                    Format messages using <code>**bold**</code>, <code>*italic*</code>, <code>`inline code`</code>, and multi-line fenced code blocks with language highlighting.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white">File & Image Attachments</h4>
                  <p className="text-slate-300 text-[11px]">
                    Click the Paperclip icon to attach documents or images (strictly capped at 5 MB to prevent memory exhaustion).
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white">Emoji Reactions & Thread Replies</h4>
                  <p className="text-slate-300 text-[11px]">
                    Hover over any message to react with quick emojis or quote-reply to maintain conversational context.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white">Direct Messages (DMs) & Groups</h4>
                  <p className="text-slate-300 text-[11px]">
                    Click the Direct Messages icon on the top-left rail to chat 1-on-1 with friends or create multi-user group chats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. HOW TO USE VOICE & VIDEO CALLS */}
        {/* ============================================================== */}
        {activeTab === 'calls' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">How to Use Voice & Video Calls</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Browser-standard peer-to-peer WebRTC media mesh without intermediate servers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-violet-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>Voice Channels</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click any Voice Channel (e.g. <code>🔊 general-voice</code>) in the channel list to connect. Audio is encoded with the high-fidelity Opus codec.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  <span>720p HD Video</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click the Video Camera icon to toggle your webcam. Plays inline smoothly on both desktop and mobile iOS Safari.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Monitor className="w-4 h-4" />
                  <span>Screen Sharing</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Click the Screen Share button in the call controls bar to broadcast your entire screen, window, or browser tab.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-violet-600/10 border border-violet-500/20 text-xs text-violet-300">
              💡 <strong>Direct DM Calling:</strong> To call a friend directly, open their DM conversation and click the Phone or Video icon in the top header.
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 6. HOW TO REPORT BUGS */}
        {/* ============================================================== */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-white">How to Report Bugs & Send Feedback</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Help us refine NEXORA during the Private Beta. Your bug reports directly inform production updates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090a14] border border-amber-500/25 space-y-3">
              <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-300">
                <li>
                  Click the amber <strong className="text-amber-300">FEEDBACK</strong> button in the top navigation header (or the Report Bug button below).
                </li>
                <li>
                  Select the appropriate category (<code>Voice & Video</code>, <code>Messaging</code>, <code>Communities</code>, <code>Auth</code>, <code>Performance</code>, <code>UI/UX</code>, or <code>Other</code>).
                </li>
                <li>
                  Choose the issue severity (<code>Low</code>, <code>Medium</code>, <code>High</code>, or <code>Critical</code>).
                </li>
                <li>
                  Describe what happened, the steps to reproduce, and attach an optional screenshot (&lt; 2 MB).
                </li>
                <li>
                  Click <strong>Transmit Telemetry</strong>. You will receive an immediate Ticket Reference ID for tracking.
                </li>
              </ol>

              <div className="pt-2 flex justify-start">
                <button
                  onClick={() => {
                    handleClose();
                    openModal('beta_feedback');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Open Bug Reporter Now</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 sm:p-5 border-t border-[#20223c] bg-[#0d0e1c] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Operative:</span>
          <span className="text-white font-bold">@{currentUser.username}</span>
          <span className="text-slate-600">|</span>
          <span className="text-violet-400 font-bold uppercase">{activeTab}</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isEmbedded && (
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Launch NEXORA Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {content}
    </div>
  );
};
