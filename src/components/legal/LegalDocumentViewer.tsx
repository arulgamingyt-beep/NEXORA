import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  FileText,
  Users,
  Trash2,
  X,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Mail,
  ChevronRight,
} from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'guidelines' | 'deletion';

interface LegalDocumentViewerProps {
  initialDoc?: LegalDocType;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const LegalDocumentViewer: React.FC<LegalDocumentViewerProps> = ({
  initialDoc = 'privacy',
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#131528] to-[#0a0b16] border border-[#2b2d4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#20223c] flex items-center justify-between shrink-0 bg-[#0d0e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
                  NEXORA TECHNOLOGIES
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  LEGAL v1.0 (DRAFT)
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">Legal & Compliance Documentation</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legal Counsel Review Disclaimer Alert */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300 font-mono shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            OPERATIONAL NOTICE: These pages are engineering beta drafts and do not constitute proof of legal compliance. Have an Indian technology/privacy lawyer review all policies under applicable laws (including DPDP Act 2023 & IT Act 2000) prior to launching publicly.
          </span>
        </div>

        {/* Document Navigation Tabs */}
        <div className="flex border-b border-[#20223c] bg-[#090a14] px-4 pt-2 overflow-x-auto shrink-0 custom-purple-scrollbar">
          <button
            onClick={() => setActiveDoc('privacy')}
            className={`pb-3 px-4 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeDoc === 'privacy'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            onClick={() => setActiveDoc('terms')}
            className={`pb-3 px-4 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeDoc === 'terms'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveDoc('guidelines')}
            className={`pb-3 px-4 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeDoc === 'guidelines'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Guidelines</span>
          </button>

          <button
            onClick={() => setActiveDoc('deletion')}
            className={`pb-3 px-4 text-xs font-mono font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeDoc === 'deletion'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Account Deletion & Data Rights</span>
          </button>
        </div>

        {/* Document Content Body */}
        <div className="p-6 overflow-y-auto custom-purple-scrollbar flex-1 space-y-6 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
          {/* ================================================================ */}
          {/* 1. PRIVACY POLICY */}
          {/* ================================================================ */}
          {activeDoc === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">NEXORA Privacy Policy</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Effective Date: November 5, 2026 | Version: 1.0 (Beta Draft) | Controller: NEXORA TECHNOLOGIES INC.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">1. Scope and Core Commitment</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NEXORA TECHNOLOGIES ("we", "us", or "our") develops and operates the NEXORA communication platform.
                  This Privacy Policy transparently governs the collection, processing, local caching, and retention of
                  personal data when you access or interact with the NEXORA application.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Information Collected During Registration</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                  <li><strong>Account Credentials:</strong> Operative callsign/username, electronic mail address, profile display name, and avatar preference.</li>
                  <li><strong>Cryptographic Password Digests:</strong> Passwords undergo client-side salted SHA-256 cryptographic hashing via the Web Crypto API (<code>crypto.subtle</code>) prior to transmission. Raw plaintext passwords are never collected, stored, or held on our servers.</li>
                  <li><strong>Identity Tokens:</strong> Optional Google Authentication OAuth tokens when registering via Google Sign-In.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">3. Transmissions, Messages and Community Content</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  We process messages, emoji reactions, channel creations, and media attachments uploaded by operatives.
                  Transmissions are cached locally in your browser's <code>localStorage</code> (<code>nexora_active_session_v1</code>)
                  for sub-millisecond offline rehydration and synchronized to Cloud Firestore to enable multi-device communication.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">4. Voice and Video Communication Streams</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NEXORA uses standard WebRTC for peer-to-peer audio and video transmission.
                  Audio and video media streams flow directly between participating operatives' browsers and are <strong>never recorded, stored, or processed on NEXORA media servers</strong>.
                  Ephemeral signaling metadata (caller IDs, callee IDs, status transitions) is temporarily written to Firestore (<code>/calls</code>) to ring endpoints and establish handshakes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">5. Cloud Storage Infrastructure</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NEXORA uses Google Cloud Firestore for database persistence and public Google STUN servers (<code>stun:stun.l.google.com:19302</code>)
                  for peer-to-peer NAT traversal. When establishing WebRTC connections, candidate IP addresses are exchanged directly between calling peers.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">6. Security Practices and Known Limitations</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                  <li><strong>Enforced Controls:</strong> 14 verified Firestore security rules, 4-tier RBAC authorization, 5 MB file upload limits, and 2 MB telemetry ceilings.</li>
                  <li><strong>Limitations Disclosed:</strong> This is a public beta preview. Stored message history in Cloud Firestore is not currently end-to-end encrypted at rest; WebRTC peer-to-peer media paths expose direct IP addresses to participating call peers.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">7. User Rights and Data Deletion</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Operatives retain full rights to access, rectify, export, and delete their accounts. Account deletion permanently
                  purges your user profile, local vault credentials, and private direct message records (see Account Deletion tab).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-sm">8. Privacy Contact Point & Grievance Redressal (DPDP Act)</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  For privacy queries, Data Principal rights under India's Digital Personal Data Protection Act (DPDP Act 2023), or grievance redressal, contact the designated Grievance Officer at:{' '}
                  <a href="mailto:privacy@nexora.tech" className="text-violet-400 hover:underline font-mono">
                    privacy@nexora.tech
                  </a>
                  . Note: Formal appointment and escalation timelines are subject to legal counsel review.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 2. TERMS OF SERVICE */}
          {/* ================================================================ */}
          {activeDoc === 'terms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">NEXORA Terms of Service</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Effective Date: November 5, 2026 | Version: 1.0 (Beta Draft) | Publisher: NEXORA TECHNOLOGIES INC.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">1. Acceptance of Terms</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  By accessing the NEXORA terminal, registering an operative profile, or participating in communities,
                  you enter into a legally binding agreement with NEXORA TECHNOLOGIES INC. If you do not agree to these terms,
                  you are prohibited from accessing NEXORA services.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Account Registration and Responsibilities</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You must provide accurate callsign information during registration. You are solely responsible for maintaining
                  the confidentiality of your credentials and for all transmissions dispatched from your account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">3. Acceptable Use and Prohibited Activities</h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-2">
                  You agree to use NEXORA exclusively for lawful communication. The following actions are strictly prohibited and result in immediate termination:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                  <li>Dispatching malicious code, exploit vectors, phishing links, or malware payloads.</li>
                  <li>Performing Denial-of-Service attacks, automated spam broadcasting, or bypassing upload size ceilings (5 MB).</li>
                  <li>Attempting unauthorized privilege self-elevation (modifying RBAC roles, bypassing channel ACLs, unseating community owners).</li>
                  <li>Impersonating other operatives, community leaders, or NEXORA staff.</li>
                  <li>Engaging in harassment, hate speech, stalking, threats, or unauthorized surveillance.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">4. Community Owner and Administrator Responsibilities</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Community creators (Owners) and designated Administrators possess authority over channels, permissions, and membership moderation.
                  Administrators must enforce community standards and address reported violations promptly.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">5. Intellectual Property</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  You retain ownership of user-generated content and messages you author. The NEXORA platform, user interface designs,
                  logos, trademarks, and underlying architecture are the exclusive intellectual property of NEXORA TECHNOLOGIES INC.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">6. Service Availability and "As-Is" Beta Disclaimer</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NEXORA is provided on an "AS IS" and "AS AVAILABLE" beta preview basis. NEXORA TECHNOLOGIES disclaims all warranties,
                  express or implied, including merchantability, fitness for particular purposes, and uninterrupted service availability.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-sm">7. Legal Point of Contact & Jurisdiction Review Notice</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Direct legal notices and inquiries to:{' '}
                  <a href="mailto:legal@nexora.tech" className="text-violet-400 hover:underline font-mono">
                    legal@nexora.tech
                  </a>
                  . Governing law and arbitration clauses are engineering placeholders subject to formal structuring by Indian legal counsel.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 3. COMMUNITY GUIDELINES */}
          {/* ================================================================ */}
          {activeDoc === 'guidelines' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">NEXORA Community Guidelines</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Core Standards for Respectful Collective Communication | Version 1.0 (Beta Draft)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">1. Respectful Communication</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  NEXORA is engineered for high-performance collectives. We expect all operatives to communicate with professional
                  courtesy. Debates and technical disagreements are welcomed; personal attacks and harassment are not.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">2. Zero Tolerance for Harassment and Threats</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Do not threaten violence, encourage self-harm, or harass any individual. Targeted harassment campaigns,
                  doxxing (sharing private personal information without consent), and extortion will trigger immediate global termination.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">3. No Spam, Advertising or Malicious Links</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Do not broadcast repetitive copy-pasted spam, unsolicited marketing promotions, or shortened URLs that obfuscate
                  malicious destinations. Excessive automated messaging will trigger automated rate limits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">4. No Impersonation</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Do not create callsigns or profiles intended to impersonate other operatives, community leaders, organizations,
                  or NEXORA staff members. Verified tags and roles are non-transferable.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">5. Reporting Violations & Moderation Pipeline</h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-2">
                  Operatives can report violations via the Beta Feedback & Abuse reporter in the top header. Community moderators enforce guidelines using the progressive response matrix:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[11px] pt-1">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-300">1. Warning Notice</div>
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">2. Message Purge</div>
                  <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300">3. Hub Expulsion</div>
                  <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">4. Account Ban</div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* 4. ACCOUNT DELETION & DATA RIGHTS */}
          {/* ================================================================ */}
          {activeDoc === 'deletion' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-white">Account Deletion & Data Purge Policy</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Self-Service Erasure Architecture & Backend Data Deletion Procedures
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">1. How to Delete Your NEXORA Account</h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-2">
                  Account deletion is self-service and executed immediately by the application backend without requiring support tickets:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-slate-300 text-xs">
                  <li>Click your profile settings (Gear icon) in the bottom-left panel or top header.</li>
                  <li>Under the <strong>My Account</strong> tab, scroll down to the <strong>Danger Zone</strong>.</li>
                  <li>Click <strong>Expunge Operative Account</strong>.</li>
                  <li>Type your confirmation callsign and click <strong>Permanently Expunge Account</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-sm">2. What Data Is Actually Deleted by the Backend</h4>
                <p className="text-slate-300 text-xs leading-relaxed mb-2">
                  When account deletion is confirmed, the NEXORA backend executes the following operations:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                  <li><strong>User Profile Document:</strong> The record in Cloud Firestore (<code>/users/{'{userId}'}</code>) is permanently deleted.</li>
                  <li><strong>Cryptographic Vault Credentials:</strong> Your salted password hash and encrypted keys are erased from the local vault (<code>nexora_accounts_vault_v1</code>).</li>
                  <li><strong>Session Tokens:</strong> Active authentication tokens and local browser caches (<code>nexora_active_session_v1</code>) are immediately expunged.</li>
                  <li><strong>Friendships & Direct Message Pointers:</strong> Private friend records in <code>/friendships</code> and pending requests in <code>/friend_requests</code> involving your user ID are deleted.</li>
                  <li><strong>Community Memberships:</strong> Your membership record in every community you joined is removed.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm">3. Shared Channel Messages Transparency Notice</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  To preserve communication continuity for remaining members in multi-user channels, transmissions already sent to public community channels are disassociated from your personal identity and permanently anonymized (displayed as <code>@deleted-operative</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090a14] border border-white/5 space-y-1">
                <h4 className="font-bold text-white text-sm">4. Verification of Deletion</h4>
                <p className="text-slate-300 text-xs">
                  Deletion takes effect within seconds. Once purged, credentials cannot be restored. For questions regarding data erasure, contact:{' '}
                  <a href="mailto:privacy@nexora.tech" className="text-violet-400 hover:underline font-mono">
                    privacy@nexora.tech
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#20223c] bg-[#0d0e1c] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Viewing Document:</span>
            <span className="text-white font-bold uppercase">{activeDoc}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer border border-white/10"
            >
              Close
            </button>

            {showAcceptButton && onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>I Understand & Accept Terms</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

