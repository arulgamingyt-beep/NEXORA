import React, { useState, useEffect } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  PlatformRole,
  ExecutiveCategory,
  EXECUTIVE_ROLES,
  PlatformReport,
  ReportStatus,
  ModerationDecision,
  AdminAuditLog,
  PlatformDashboardMetrics,
  User,
  Community,
  BetaApplication,
} from '../../types';
import { adminService } from '../../services/adminService';
import { betaAccessService } from '../../services/betaAccessService';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  X,
  Users,
  MessageSquare,
  Globe,
  AlertTriangle,
  UserX,
  Activity,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Ban,
  FileText,
  Lock,
  ChevronRight,
  Eye,
  RefreshCw,
  Sliders,
  Check,
  HelpCircle,
  AlertOctagon,
  Sparkles,
  Crown,
  Briefcase,
  Building2,
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'communities' | 'reports' | 'beta' | 'audit' | 'matrix';

export const AdminControlPanelModal: React.FC = () => {
  const {
    closeModal,
    currentUser,
    platformRole,
    isSuperAdmin,
    isPlatformAdmin,
    isPlatformModerator,
    allUsers,
    communities,
    messages,
    suspendUser,
    reactivateUser,
    updateUserPlatformRole,
    suspendCommunity,
    unsuspendCommunity,
    resolveReport,
    dismissReport,
    revokeBetaAccess,
    reviewBetaApplication,
    showToast,
  } = useNexora();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Metrics state
  const [metrics, setMetrics] = useState<PlatformDashboardMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Search and filter queries
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [communitySearch, setCommunitySearch] = useState('');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [betaSearch, setBetaSearch] = useState('');
  const [betaFilter, setBetaFilter] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState('');

  // Live collections
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [betaApplications, setBetaApplications] = useState<BetaApplication[]>([]);

  // Dialog modals inside Admin
  const [suspendUserTarget, setSuspendUserTarget] = useState<User | null>(null);
  const [suspendUserReason, setSuspendUserReason] = useState('Terms of Service violation');
  const [suspendCommunityTarget, setSuspendCommunityTarget] = useState<Community | null>(null);
  const [suspendCommunityReason, setSuspendCommunityReason] = useState('Community Guidelines violation');
  const [selectedReportForAction, setSelectedReportForAction] = useState<PlatformReport | null>(null);
  const [moderationDecision, setModerationDecision] = useState<ModerationDecision>('warning_issued');
  const [moderationNotes, setModerationNotes] = useState('');
  const [revokeBetaTarget, setRevokeBetaTarget] = useState<BetaApplication | null>(null);
  const [revokeBetaReason, setRevokeBetaReason] = useState('Inactivity or beta conduct policy');
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);

  // Load metrics & live streams
  const reloadData = async () => {
    setIsLoadingMetrics(true);
    try {
      const data = await adminService.getDashboardMetrics(allUsers, communities, messages);
      setMetrics(data);
      if (isPlatformModerator) {
        const reps = await adminService.listReports(currentUser);
        setReports(reps);
        const audits = await adminService.listAuditLogs(currentUser);
        setAuditLogs(audits);
      }
      const betaList = await betaAccessService.listAllApplications(currentUser);
      setBetaApplications(betaList);
    } catch (err: any) {
      console.warn('Admin reload error:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    reloadData();
    if (!isPlatformModerator) return;
    const unsubAudits = adminService.listenToAuditLogs(currentUser, (logs) => {
      setAuditLogs(logs);
    });
    return () => unsubAudits();
  }, [currentUser, isPlatformModerator]);

  if (!isPlatformModerator) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="w-full max-w-md bg-[#0e101f] border border-rose-500/40 rounded-3xl p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Clearance Denied</h2>
          <p className="text-xs text-slate-300 font-mono">
            You do not possess the requisite Moderator or Administrator clearance to inspect the NEXORA Command Deck.
          </p>
          <button
            onClick={closeModal}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition"
          >
            DISMISS
          </button>
        </div>
      </div>
    );
  }

  // Filtered views
  const filteredUsers = Object.values(allUsers).filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      u.username.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.tag.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (userRoleFilter === 'all') return true;
    if (userRoleFilter === 'suspended') return u.isSuspended === true;
    const role = adminService.getEffectiveRole(u);
    return role === userRoleFilter;
  });

  const filteredCommunities = communities.filter((c) => {
    const q = communitySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.tagline && c.tagline.toLowerCase().includes(q));
  });

  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  const filteredBeta = betaApplications.filter((b) => {
    const q = betaSearch.toLowerCase();
    const matchesSearch =
      b.username.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.displayName && b.displayName.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (betaFilter === 'all') return true;
    return b.status === betaFilter;
  });

  const filteredAudits = auditLogs.filter((a) => {
    const q = auditSearch.toLowerCase();
    return (
      a.adminName.toLowerCase().includes(q) ||
      a.action.toLowerCase().includes(q) ||
      (a.targetName || '').toLowerCase().includes(q) ||
      a.details.toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleConfirmSuspendUser = async () => {
    if (!suspendUserTarget) return;
    await suspendUser(suspendUserTarget.id, suspendUserReason);
    setSuspendUserTarget(null);
    reloadData();
  };

  const handleConfirmReactivateUser = async (u: User) => {
    await reactivateUser(u.id);
    reloadData();
  };

  const handleConfirmSuspendCommunity = async () => {
    if (!suspendCommunityTarget) return;
    await suspendCommunity(suspendCommunityTarget.id, suspendCommunityReason);
    setSuspendCommunityTarget(null);
    reloadData();
  };

  const handleConfirmUnsuspendCommunity = async (c: Community) => {
    await unsuspendCommunity(c.id);
    reloadData();
  };

  const handleConfirmReportResolution = async () => {
    if (!selectedReportForAction) return;
    await resolveReport(selectedReportForAction.id, moderationDecision, moderationNotes);

    // Apply action automatically if user or community suspension was selected
    if (moderationDecision === 'account_suspended' && selectedReportForAction.targetType === 'user') {
      const u = allUsers[selectedReportForAction.targetId];
      if (u) {
        await suspendUser(u.id, moderationNotes || `Suspended per report ${selectedReportForAction.id}`);
      }
    } else if (moderationDecision === 'community_suspended' && selectedReportForAction.targetType === 'community') {
      const c = communities.find((cm) => cm.id === selectedReportForAction.targetId);
      if (c) {
        await suspendCommunity(c.id, moderationNotes || `Suspended per report ${selectedReportForAction.id}`);
      }
    }

    setSelectedReportForAction(null);
    setModerationNotes('');
    reloadData();
  };

  const handleConfirmRevokeBeta = async () => {
    if (!revokeBetaTarget) return;
    await revokeBetaAccess(revokeBetaTarget.id, revokeBetaReason);
    setRevokeBetaTarget(null);
    reloadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none font-sans">
      <div className="w-full max-w-7xl h-[92vh] bg-[#090a14] border border-[#232742] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Command Banner */}
        <div className="h-14 px-6 bg-[#0e101f] border-b border-[#1b1e36] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden ring-1 ring-violet-500/50 shadow-md shadow-violet-600/30 flex items-center justify-center shrink-0 bg-[#0d0f1d]">
              <img src="/nexora-logo.jpg" alt="NEXORA" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider text-white font-mono">
                  NEXORA TECHNOLOGIES
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase font-bold">
                  ADMIN CONTROL PANEL
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Operator Clearance Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#141628] border border-[#252945]">
              <span className="text-[11px] font-mono text-slate-400">CLEARANCE:</span>
              <span className="text-xs font-mono font-bold text-white">
                @{currentUser.username}
              </span>
              {currentUser.executiveCategory ? (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                    currentUser.executiveCategory === 'founder'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : currentUser.executiveCategory === 'ceo'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/10'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  }`}
                >
                  {currentUser.executiveCategory === 'founder' ? (
                    <Crown className="w-3 h-3 text-amber-400" />
                  ) : currentUser.executiveCategory === 'ceo' ? (
                    <Briefcase className="w-3 h-3 text-violet-400" />
                  ) : (
                    <Building2 className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>{currentUser.executiveTitle || EXECUTIVE_ROLES[currentUser.executiveCategory].title}</span>
                </span>
              ) : (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                    isSuperAdmin
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isPlatformAdmin
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {platformRole.replace('_', ' ')}
                </span>
              )}
            </div>

            <button
              onClick={reloadData}
              title="Refresh telemetry"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#252945] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingMetrics ? 'animate-spin text-violet-400' : ''}`} />
            </button>

            <button
              onClick={closeModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-[#252945] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body with Sidebar Navigation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-56 bg-[#0a0c18] border-r border-[#1b1e36] p-3 flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity className="w-4 h-4 text-violet-400" />
                DASHBOARD
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                USERS ({Object.keys(allUsers).length})
              </button>

              <button
                onClick={() => setActiveTab('communities')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'communities'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                COMMUNITIES ({communities.length})
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  REPORTS
                </div>
                {reports.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {reports.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('beta')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'beta'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  BETA PROGRAM
                </div>
                {betaApplications.filter((b) => b.status === 'pending').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                    {betaApplications.filter((b) => b.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                AUDIT LEDGER
              </button>
            </div>

            <div className="pt-3 border-t border-[#1b1e36]">
              <button
                onClick={() => setActiveTab('matrix')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-mono transition cursor-pointer ${
                  activeTab === 'matrix'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Clearance Matrix
              </button>
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#070810]">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">Platform Telemetry &amp; Metrics</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Live operational metrics derived directly from Firebase active user collections &amp; state.
                  </p>
                </div>

                {/* 6 Real Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Total Users</span>
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      {metrics ? metrics.totalUsers : Object.keys(allUsers).length}
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Verified accounts</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Online Users</span>
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {metrics ? metrics.onlineUsers : Object.values(allUsers).filter((u) => u.status === 'online').length}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">Active sockets</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Communities</span>
                      <Globe className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-2xl font-black text-cyan-400 font-mono">
                      {metrics ? metrics.totalCommunities : communities.length}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">Active hubs</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Transmissions</span>
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="text-2xl font-black text-violet-400 font-mono">
                      {metrics ? metrics.totalMessages : messages.length}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">Total messages</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Pending Reports</span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {reports.filter((r) => r.status === 'pending' || r.status === 'investigating').length}
                    </div>
                    <span className="text-[10px] font-mono text-amber-300/70 mt-1 block">Awaiting triage</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038]">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider">Suspended</span>
                      <UserX className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-2xl font-black text-rose-400 font-mono">
                      {Object.values(allUsers).filter((u) => u.isSuspended === true).length}
                    </div>
                    <span className="text-[10px] font-mono text-rose-300/70 mt-1 block">Enforced lockouts</span>
                  </div>
                </div>

                {/* Live Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Audit Actions Feed */}
                  <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0e101f] border border-[#1d2038] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b1e36]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          Latest Immutable Audit Entries
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {auditLogs.length} total events recorded
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-[#141628] border border-[#20223a] flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-violet-300">
                                {log.adminName}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-400 border border-violet-500/30">
                                {log.adminRole}
                              </span>
                              <span className="font-mono text-slate-400">performed</span>
                              <span className="font-mono font-semibold text-white">
                                {log.action}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                              Target: <span className="text-slate-200">{log.targetName}</span> — {log.details}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <p className="text-xs font-mono text-slate-500 text-center py-6">
                          No administrative actions logged yet in this session.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* System Integrity & Fast Actions Card */}
                  <div className="p-5 rounded-2xl bg-[#0e101f] border border-[#1d2038] space-y-4">
                    <div className="pb-3 border-b border-[#1b1e36]">
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        Clearance &amp; Security State
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Self-Elevation Lock</span>
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> SECURE (Rules enforced)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Audit Log Tamper Proof</span>
                        <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> IMMUTABLE (update: false)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Cloud Ledger Status</span>
                        <span className="text-violet-400 font-mono font-bold flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" /> SYNCHRONIZED
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#1b1e36] space-y-2">
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold transition flex items-center justify-between cursor-pointer"
                      >
                        <span>Review Pending Reports</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab('beta')}
                        className="w-full py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold transition flex items-center justify-between cursor-pointer"
                      >
                        <span>Manage Beta Applicants</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Operatives Directory</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Inspect accounts, enforce suspensions, and adjust platform clearance levels.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search callsign, email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white font-mono focus:outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="super_admin">Super Admins</option>
                      <option value="admin">Admins</option>
                      <option value="moderator">Moderators</option>
                      <option value="none">Members</option>
                      <option value="suspended">Suspended Only</option>
                    </select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-2xl bg-[#0e101f] border border-[#1d2038] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#121424] text-slate-400 border-b border-[#1d2038]">
                        <tr>
                          <th className="p-3">Operative</th>
                          <th className="p-3">Contact Email</th>
                          <th className="p-3">Role / Clearance</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Joined Date</th>
                          <th className="p-3 text-right">Administrative Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181a2e]">
                        {filteredUsers.map((u) => {
                          const effectiveRole = adminService.getEffectiveRole(u);
                          return (
                            <tr key={u.id} className="hover:bg-white/5 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={u.avatar}
                                    alt={u.displayName}
                                    className="w-7 h-7 rounded-full object-cover shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-white">{u.displayName}</div>
                                    <div className="text-[10px] text-slate-500">
                                      @{u.username} <span className="text-violet-400">{u.tag}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-slate-300">{u.email || 'N/A'}</td>

                              <td className="p-3">
                                {isSuperAdmin ? (
                                  <select
                                    value={effectiveRole}
                                    onChange={(e) =>
                                      updateUserPlatformRole(u.id, e.target.value as PlatformRole)
                                    }
                                    className="bg-[#141628] border border-[#252945] text-[11px] rounded-lg px-2 py-1 text-white focus:outline-none"
                                  >
                                    <option value="super_admin">SUPER ADMIN</option>
                                    <option value="admin">ADMIN</option>
                                    <option value="moderator">MODERATOR</option>
                                    <option value="none">MEMBER</option>
                                  </select>
                                ) : (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      effectiveRole === 'super_admin'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                        : effectiveRole === 'admin'
                                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                        : effectiveRole === 'moderator'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                    }`}
                                  >
                                    {effectiveRole}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                {u.isSuspended ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase">
                                    SUSPENDED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                                    {u.status || 'ACTIVE'}
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-slate-400 text-[11px]">
                                {u.joinedAt || 'November 2026'}
                              </td>

                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setInspectedUser(u)}
                                    title="View Profile Details"
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

                                  {isPlatformAdmin && (
                                    <>
                                      {u.isSuspended ? (
                                        <button
                                          onClick={() => handleConfirmReactivateUser(u)}
                                          title="Reactivate Account"
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                        >
                                          <RotateCcw className="w-3 h-3" />
                                          REACTIVATE
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSuspendUserTarget(u);
                                            setSuspendUserReason('Terms of Service violation');
                                          }}
                                          title="Suspend Account"
                                          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                                        >
                                          <Ban className="w-3 h-3" />
                                          SUSPEND
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: COMMUNITY MANAGEMENT */}
            {activeTab === 'communities' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Community Hubs Management</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Oversee community hubs, audit owner assignments, and enact platform suspensions.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search community name..."
                      value={communitySearch}
                      onChange={(e) => setCommunitySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0e101f] border border-[#1d2038] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#121424] text-slate-400 border-b border-[#1d2038]">
                        <tr>
                          <th className="p-3">Community Hub</th>
                          <th className="p-3">Owner Callsign</th>
                          <th className="p-3">Members</th>
                          <th className="p-3">Channels</th>
                          <th className="p-3">Privacy</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Moderation Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181a2e]">
                        {filteredCommunities.map((c) => {
                          const owner = allUsers[c.ownerId];
                          const channelCount = c.channels ? c.channels.length : 0;
                          return (
                            <tr key={c.id} className="hover:bg-white/5 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">
                                    {c.icon || '⚡'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">{c.name}</div>
                                    <div className="text-[10px] text-slate-500 truncate max-w-xs">
                                      {c.tagline || c.description}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 text-slate-300">
                                {owner ? `@${owner.username}` : c.ownerId}
                              </td>

                              <td className="p-3 text-slate-300">{c.members.length} operatives</td>

                              <td className="p-3 text-slate-300">{channelCount} channels</td>

                              <td className="p-3">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  {c.isPublic ? 'PUBLIC' : 'INVITE ONLY'}
                                </span>
                              </td>

                              <td className="p-3">
                                {c.isSuspended ? (
                                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase">
                                    SUSPENDED
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                                    ACTIVE
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-right">
                                {isPlatformAdmin && (
                                  <>
                                    {c.isSuspended ? (
                                      <button
                                        onClick={() => handleConfirmUnsuspendCommunity(c)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                        RESTORE
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setSuspendCommunityTarget(c);
                                          setSuspendCommunityReason('Community Guidelines violation');
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Ban className="w-3 h-3" />
                                        SUSPEND HUB
                                      </button>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REPORTS & MODERATION */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Abuse &amp; Safety Moderation Queue</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Investigate user reports, assign status, and enforce binding moderation verdicts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={reportFilter}
                      onChange={(e) => setReportFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white font-mono focus:outline-none"
                    >
                      <option value="all">All Reports</option>
                      <option value="pending">Pending Triage</option>
                      <option value="investigating">Under Investigation</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredReports.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-[#0e101f] border border-[#1d2038] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1b1e36]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              r.targetType === 'user'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : r.targetType === 'community'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            }`}
                          >
                            {r.targetType}
                          </span>
                          <span className="font-bold text-white text-sm">{r.targetName}</span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {r.targetId}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                              r.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : r.status === 'investigating'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : r.status === 'resolved'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {r.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block mb-1">Reason:</span>
                          <p className="text-rose-300 font-semibold">{r.reason}</p>
                          {r.details && (
                            <p className="text-slate-300 mt-1 text-[11px] bg-black/30 p-2 rounded-lg border border-[#1d2038]">
                              "{r.details}"
                            </p>
                          )}
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-1">Reported by:</span>
                          <p className="text-slate-200">{r.reporterName} ({r.reporterId})</p>
                          {r.decision && (
                            <div className="mt-1">
                              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                                Decision: {r.decision}
                              </span>
                              {r.moderatorNotes && (
                                <p className="text-[11px] text-slate-400 italic">"{r.moderatorNotes}"</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1b1e36]">
                        {r.status !== 'resolved' && r.status !== 'dismissed' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReportForAction(r);
                                setModerationDecision('warning_issued');
                                setModerationNotes('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition cursor-pointer"
                            >
                              TAKE ACTION
                            </button>
                            <button
                              onClick={() => dismissReport(r.id, 'Dismissed by moderator')}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition cursor-pointer"
                            >
                              DISMISS
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredReports.length === 0 && (
                    <div className="p-8 text-center rounded-2xl bg-[#0e101f] border border-[#1d2038] text-slate-500 font-mono text-xs">
                      No reports match the selected criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: BETA PROGRAM */}
            {activeTab === 'beta' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Private Beta Program</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Authorize beta participants, review application experience, or revoke testing clearance.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search applicant..."
                      value={betaSearch}
                      onChange={(e) => setBetaSearch(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                    />
                    <select
                      value={betaFilter}
                      onChange={(e) => setBetaFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white font-mono focus:outline-none"
                    >
                      <option value="all">All Applicants</option>
                      <option value="pending">Pending Approval</option>
                      <option value="approved">Approved Testers</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Exclusive Executive Approval Gate Notice */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-white font-bold">Exclusive Executive Authority: </span>
                      <span className="text-slate-300">
                        Only Chairman &amp; Founder, CEO, and Managing Director can approve or reject beta applicants.
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase shrink-0">
                    CLEARANCE ACTIVE
                  </span>
                </div>

                <div className="rounded-2xl bg-[#0e101f] border border-[#1d2038] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#121424] text-slate-400 border-b border-[#1d2038]">
                        <tr>
                          <th className="p-3">Applicant Callsign</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Testing Devices</th>
                          <th className="p-3">Experience</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Approval Decisions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181a2e]">
                        {filteredBeta.map((b) => (
                          <tr key={b.id} className="hover:bg-white/5 transition">
                            <td className="p-3">
                              <div className="font-bold text-white">{b.displayName || b.username}</div>
                              <div className="text-[10px] text-slate-500">@{b.username}</div>
                            </td>

                            <td className="p-3 text-slate-300">{b.email}</td>

                            <td className="p-3 text-slate-300">
                              {b.devices && b.devices.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {b.devices.map((d) => (
                                    <span key={d} className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[10px]">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                'Desktop Web'
                              )}
                            </td>

                            <td className="p-3 text-slate-400 max-w-xs truncate">
                              {b.experience || 'Standard Beta Operative'}
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  b.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : b.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {b.status}
                              </span>
                              {b.reviewedByTitle && (
                                <div className="text-[9px] text-amber-300/90 font-mono mt-1 flex items-center gap-1">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                                  <span>{b.reviewedByTitle}</span>
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === 'pending' ? (
                                  <>
                                    <button
                                      onClick={async () => {
                                        await reviewBetaApplication(b.id, 'approved');
                                        reloadData();
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer"
                                    >
                                      APPROVE
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await reviewBetaApplication(b.id, 'rejected');
                                        reloadData();
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer"
                                    >
                                      REJECT
                                    </button>
                                  </>
                                ) : b.status === 'approved' ? (
                                  <button
                                    onClick={() => {
                                      setRevokeBetaTarget(b);
                                      setRevokeBetaReason('Inactivity or beta conduct policy');
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition cursor-pointer"
                                  >
                                    REVOKE ACCESS
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      await reviewBetaApplication(b.id, 'approved');
                                      reloadData();
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-[10px] font-bold transition cursor-pointer"
                                  >
                                    RECONSIDER
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: AUDIT LEDGER (IMMUTABLE) */}
            {activeTab === 'audit' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      Immutable Administrative Ledger
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Cryptographically protected record of all administrative actions. Retroactive editing is blocked by security rules.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Filter audit actions..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-[#121424] border border-[#20223a] text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0e101f] border border-[#1d2038] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#121424] text-slate-400 border-b border-[#1d2038]">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Administrator</th>
                          <th className="p-3">Clearance</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Target</th>
                          <th className="p-3">Details / Diff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181a2e]">
                        {filteredAudits.map((a) => (
                          <tr key={a.id} className="hover:bg-white/5 transition">
                            <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                              {new Date(a.timestamp).toLocaleString()}
                            </td>

                            <td className="p-3 font-bold text-white">{a.adminName}</td>

                            <td className="p-3">
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                                {a.adminRole}
                              </span>
                            </td>

                            <td className="p-3 font-semibold text-violet-300">{a.action}</td>

                            <td className="p-3 text-slate-200">
                              <span className="text-[10px] text-slate-500 block uppercase font-mono">
                                {a.targetType}
                              </span>
                              {a.targetName}
                            </td>

                            <td className="p-3 text-slate-300">
                              <div>{a.details}</div>
                              {(a.previousValue || a.updatedValue) && (
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  <span className="text-rose-400">{a.previousValue || 'none'}</span>
                                  {' → '}
                                  <span className="text-emerald-400">{a.updatedValue || 'none'}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: PERMISSIONS & CLEARANCE MATRIX */}
            {activeTab === 'matrix' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Platform Authorization &amp; Executive Clearance Matrix
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Official hierarchy governing NEXORA TECHNOLOGIES executive approval powers and administrative privileges.
                  </p>
                </div>

                {/* 3 Executive Categories Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Executive Leadership Hierarchy (Exclusive Approval Tiers)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category 1: Chairman and Founder */}
                    <div className="p-5 rounded-2xl bg-[#0e101f] border border-amber-500/40 space-y-3 shadow-lg shadow-amber-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-amber-400" />
                          <h4 className="font-bold text-white text-sm font-mono">Chairman &amp; Founder</h4>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                          Full Access
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Platform Sovereign with unrestricted root authority. Exclusive power to appoint executives, approve all beta candidates, and enforce security policies.
                      </p>
                      <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                        <li className="flex items-center gap-2 text-amber-300">
                          <Check className="w-3.5 h-3.5" /> Approve &amp; revoke all beta applications
                        </li>
                        <li className="flex items-center gap-2 text-amber-300">
                          <Check className="w-3.5 h-3.5" /> Appoint or demote CEO &amp; MD
                        </li>
                        <li className="flex items-center gap-2 text-amber-300">
                          <Check className="w-3.5 h-3.5" /> Full root authority over communities
                        </li>
                        <li className="flex items-center gap-2 text-amber-300">
                          <Check className="w-3.5 h-3.5" /> Unrestricted access to audit ledger
                        </li>
                      </ul>
                    </div>

                    {/* Category 2: CEO */}
                    <div className="p-5 rounded-2xl bg-[#0e101f] border border-violet-500/40 space-y-3 shadow-lg shadow-violet-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-violet-400" />
                          <h4 className="font-bold text-white text-sm font-mono">CEO</h4>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase">
                          Strategic
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Chief Executive Officer directing platform operations, strategic partnerships, beta approvals, and global infrastructure.
                      </p>
                      <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                        <li className="flex items-center gap-2 text-violet-300">
                          <Check className="w-3.5 h-3.5" /> Approve &amp; review beta access candidates
                        </li>
                        <li className="flex items-center gap-2 text-violet-300">
                          <Check className="w-3.5 h-3.5" /> Certify verified partner communities
                        </li>
                        <li className="flex items-center gap-2 text-violet-300">
                          <Check className="w-3.5 h-3.5" /> Direct platform operations &amp; suspensions
                        </li>
                        <li className="flex items-center gap-2 text-slate-500">
                          <X className="w-3.5 h-3.5" /> Cannot demote Chairman &amp; Founder
                        </li>
                      </ul>
                    </div>

                    {/* Category 3: Managing Director */}
                    <div className="p-5 rounded-2xl bg-[#0e101f] border border-cyan-500/40 space-y-3 shadow-lg shadow-cyan-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-cyan-400" />
                          <h4 className="font-bold text-white text-sm font-mono">Managing Director</h4>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          Operational
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Managing Director supervising platform safety, community standards, beta tester onboarding, and dispute moderation.
                      </p>
                      <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                        <li className="flex items-center gap-2 text-cyan-300">
                          <Check className="w-3.5 h-3.5" /> Approve &amp; onboard beta applicants
                        </li>
                        <li className="flex items-center gap-2 text-cyan-300">
                          <Check className="w-3.5 h-3.5" /> Adjudicate moderation appeals &amp; reports
                        </li>
                        <li className="flex items-center gap-2 text-cyan-300">
                          <Check className="w-3.5 h-3.5" /> Supervise community warnings &amp; strikes
                        </li>
                        <li className="flex items-center gap-2 text-slate-500">
                          <X className="w-3.5 h-3.5" /> Cannot demote Chairman or CEO
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Super Admin */}
                  <div className="p-5 rounded-2xl bg-[#0e101f] border border-rose-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <h4 className="font-bold text-white text-sm font-mono">Super Administrator</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      Highest tier platform authority. Manages operative platform roles, executive security overrides, and system-wide configuration.
                    </p>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                      <li className="flex items-center gap-2 text-rose-300">
                        <Check className="w-3.5 h-3.5" /> Assign Super Admin &amp; Admin roles
                      </li>
                      <li className="flex items-center gap-2 text-rose-300">
                        <Check className="w-3.5 h-3.5" /> Suspend &amp; reactivate any account
                      </li>
                      <li className="flex items-center gap-2 text-rose-300">
                        <Check className="w-3.5 h-3.5" /> Community hub emergency shutdown
                      </li>
                      <li className="flex items-center gap-2 text-rose-300">
                        <Check className="w-3.5 h-3.5" /> Inspect full audit log &amp; reports
                      </li>
                    </ul>
                  </div>

                  {/* Administrator */}
                  <div className="p-5 rounded-2xl bg-[#0e101f] border border-violet-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-violet-400" />
                      <h4 className="font-bold text-white text-sm font-mono">Administrator</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      Operations authority. Manages account suspensions, community health, and beta tester clearance.
                    </p>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                      <li className="flex items-center gap-2 text-violet-300">
                        <Check className="w-3.5 h-3.5" /> Suspend &amp; reactivate member accounts
                      </li>
                      <li className="flex items-center gap-2 text-violet-300">
                        <Check className="w-3.5 h-3.5" /> Suspend community hubs
                      </li>
                      <li className="flex items-center gap-2 text-violet-300">
                        <Check className="w-3.5 h-3.5" /> Approve &amp; revoke beta clearance
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5" /> Cannot modify Super Admin status
                      </li>
                    </ul>
                  </div>

                  {/* Moderator */}
                  <div className="p-5 rounded-2xl bg-[#0e101f] border border-amber-500/30 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-white text-sm font-mono">Moderator</h4>
                    </div>
                    <p className="text-xs text-slate-300 font-mono">
                      Safety &amp; triage specialist. Evaluates user reports, issues warnings, and records moderation decisions.
                    </p>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5 pt-2 border-t border-[#1b1e36]">
                      <li className="flex items-center gap-2 text-amber-300">
                        <Check className="w-3.5 h-3.5" /> Review safety moderation queue
                      </li>
                      <li className="flex items-center gap-2 text-amber-300">
                        <Check className="w-3.5 h-3.5" /> Issue official warnings &amp; notes
                      </li>
                      <li className="flex items-center gap-2 text-amber-300">
                        <Check className="w-3.5 h-3.5" /> Inspect read-only audit log
                      </li>
                      <li className="flex items-center gap-2 text-slate-500">
                        <X className="w-3.5 h-3.5" /> Cannot modify platform user roles
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0e101f] border border-[#1b1e36] text-xs font-mono text-slate-400 leading-relaxed">
                  <span className="text-white font-bold block mb-1">Defense-In-Depth Enforcement:</span>
                  All administrative mutations are subject to Firebase Security Rules validation. Any malicious payload attempting to modify <code className="text-violet-300">platformRole</code>, <code className="text-violet-300">isSuspended</code>, or overwrite entries in <code className="text-violet-300">/admin_audit_logs</code> without adequate privilege is automatically rejected with <code className="text-rose-400">PERMISSION_DENIED</code>.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIALOG 1: Suspend User Confirmation Modal */}
      {suspendUserTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#0e101f] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Suspend Operative</h4>
                <p className="text-xs text-slate-400 font-mono">@{suspendUserTarget.username}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Reason for Account Suspension:
              </label>
              <textarea
                value={suspendUserReason}
                onChange={(e) => setSuspendUserReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#141628] border border-[#20223a] text-xs text-white font-mono focus:outline-none focus:border-rose-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendUserTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspendUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                CONFIRM SUSPENSION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 2: Suspend Community Confirmation Modal */}
      {suspendCommunityTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#0e101f] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Suspend Community Hub</h4>
                <p className="text-xs text-slate-400 font-mono">{suspendCommunityTarget.name}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Reason for Hub Suspension:
              </label>
              <textarea
                value={suspendCommunityReason}
                onChange={(e) => setSuspendCommunityReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#141628] border border-[#20223a] text-xs text-white font-mono focus:outline-none focus:border-rose-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSuspendCommunityTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSuspendCommunity}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                SUSPEND COMMUNITY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 3: Report Action Modal */}
      {selectedReportForAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg bg-[#0e101f] border border-violet-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Record Moderation Decision</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Report: {selectedReportForAction.targetName} ({selectedReportForAction.targetType})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Action / Verdict:</label>
              <select
                value={moderationDecision}
                onChange={(e) => setModerationDecision(e.target.value as ModerationDecision)}
                className="w-full p-2.5 rounded-xl bg-[#141628] border border-[#20223a] text-xs text-white font-mono focus:outline-none"
              >
                <option value="warning_issued">Issue Official Warning</option>
                <option value="account_suspended">Enact Account Suspension</option>
                <option value="community_suspended">Enact Community Hub Suspension</option>
                <option value="message_purged">Purge Violating Transmission</option>
                <option value="no_violation">No Violation (Dismiss)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Moderation Notes &amp; Rationale:
              </label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                placeholder="Required rationale recorded in the immutable audit log..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#141628] border border-[#20223a] text-xs text-white font-mono focus:outline-none focus:border-violet-500/50 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReportForAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReportResolution}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                SUBMIT VERDICT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 4: Revoke Beta Target Modal */}
      {revokeBetaTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-[#0e101f] border border-rose-500/40 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Revoke Beta Access</h4>
                <p className="text-xs text-slate-400 font-mono">@{revokeBetaTarget.username}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Reason for Revocation:</label>
              <input
                type="text"
                value={revokeBetaReason}
                onChange={(e) => setRevokeBetaReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#141628] border border-[#20223a] text-xs text-white font-mono focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeBetaTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevokeBeta}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                REVOKE BETA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG 5: Inspected User Drawer */}
      {inspectedUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-lg bg-[#0e101f] border border-[#232742] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b1e36]">
              <div className="flex items-center gap-3">
                <img
                  src={inspectedUser.avatar}
                  alt={inspectedUser.displayName}
                  className="w-12 h-12 rounded-full object-cover border border-violet-500/40"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{inspectedUser.displayName}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    @{inspectedUser.username} <span className="text-violet-400">{inspectedUser.tag}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#141628] border border-[#20223a]">
                <span className="text-[10px] text-slate-500 block uppercase">Operative ID</span>
                <span className="text-slate-200">{inspectedUser.id}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141628] border border-[#20223a]">
                <span className="text-[10px] text-slate-500 block uppercase">Email</span>
                <span className="text-slate-200">{inspectedUser.email || 'None'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#141628] border border-[#20223a]">
                <span className="text-[10px] text-slate-500 block uppercase">Platform Role</span>
                <span className="text-violet-300 font-bold uppercase">
                  {adminService.getEffectiveRole(inspectedUser)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#141628] border border-[#20223a]">
                <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                <span
                  className={
                    inspectedUser.isSuspended
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {inspectedUser.isSuspended ? 'SUSPENDED' : inspectedUser.status || 'ACTIVE'}
                </span>
              </div>
            </div>

            {inspectedUser.isSuspended && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs font-mono text-rose-200">
                <span className="font-bold text-rose-300 block mb-0.5">Suspension Record:</span>
                "{inspectedUser.suspendedReason || 'Policy Violation'}"
                {inspectedUser.suspendedAt && (
                  <div className="text-[10px] text-slate-400 mt-1">
                    Enacted: {new Date(inspectedUser.suspendedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
