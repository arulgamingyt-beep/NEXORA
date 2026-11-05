import React, { useState, useEffect } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  betaFeedbackService,
  VALID_STATUSES,
} from '../../services/betaFeedbackService';
import { betaAccessService } from '../../services/betaAccessService';
import {
  BetaFeedbackItem,
  BetaFeedbackStatus,
  BetaFeedbackSeverity,
  BetaFeedbackCategory,
  BetaApplication,
} from '../../types';
import {
  ShieldAlert,
  X,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Laptop,
  Image as ImageIcon,
  Save,
  Trash2,
  RefreshCw,
  Eye,
  Sliders,
  ShieldCheck,
  Check,
  Users,
  CheckCircle2,
  XCircle,
  Bug,
  Mail,
  User as UserIcon,
} from 'lucide-react';

export const BetaFeedbackAdminModal: React.FC = () => {
  const { closeModal, currentUser, showToast } = useNexora();

  // Admin clearance check
  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'owner' ||
    currentUser.email === 'admin@nexora.io' ||
    (currentUser as any).isAdmin === true;

  const [activeTab, setActiveTab] = useState<'applicants' | 'feedback'>('applicants');

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<BetaFeedbackItem[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Applicants State
  const [applications, setApplications] = useState<BetaApplication[]>([]);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [isReviewingApp, setIsReviewingApp] = useState<Record<string, boolean>>({});

  // Listen to Feedback and Applicants
  useEffect(() => {
    if (!isAdmin) return;

    const unsubFeedback = betaFeedbackService.listenToFeedback(
      currentUser.id,
      true,
      (items) => {
        setFeedbackList(items);
        const notesMap: Record<string, string> = {};
        items.forEach((item) => {
          notesMap[item.id] = item.adminNotes || '';
        });
        setEditingNotes(notesMap);
      }
    );

    const unsubApps = betaAccessService.listenToAllApplications(
      currentUser,
      (apps) => {
        setApplications(apps);
      }
    );

    return () => {
      unsubFeedback();
      unsubApps();
    };
  }, [currentUser, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="max-w-md w-full bg-[#121424] border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
            SECURITY CLEARANCE RESTRICTION
          </span>
          <h2 className="text-xl font-bold text-white">Access Prohibited</h2>
          <p className="text-xs text-slate-400 font-mono">
            This dashboard is restricted to authorized NEXORA system administrators.
            Your current operative role (<span className="text-rose-300">{currentUser.role || 'Member'}</span>) lacks administrative clearance.
          </p>
          <button
            onClick={closeModal}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Dismiss Terminal
          </button>
        </div>
      </div>
    );
  }

  // Handle Feedback Operations
  const handleStatusChange = async (feedbackId: string, newStatus: BetaFeedbackStatus) => {
    setIsUpdating((prev) => ({ ...prev, [feedbackId]: true }));
    try {
      await betaFeedbackService.updateFeedbackStatus(
        feedbackId,
        newStatus,
        editingNotes[feedbackId],
        true
      );
      showToast(`Status updated to "${newStatus.toUpperCase()}"`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'warning');
    } finally {
      setIsUpdating((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handleSaveNotes = async (feedbackId: string) => {
    const item = feedbackList.find((f) => f.id === feedbackId);
    if (!item) return;

    setIsUpdating((prev) => ({ ...prev, [feedbackId]: true }));
    try {
      await betaFeedbackService.updateFeedbackStatus(
        feedbackId,
        item.status,
        editingNotes[feedbackId],
        true
      );
      showToast('Resolution notes updated', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save notes', 'warning');
    } finally {
      setIsUpdating((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  const handleDelete = async (feedbackId: string) => {
    if (!window.confirm('Are you sure you want to delete this telemetry report permanently?')) return;
    try {
      await betaFeedbackService.deleteFeedback(feedbackId, true);
      showToast('Feedback report removed', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete report', 'warning');
    }
  };

  // Handle Applicant Approval / Rejection
  const handleApproveApplicant = async (appId: string) => {
    setIsReviewingApp((prev) => ({ ...prev, [appId]: true }));
    try {
      await betaAccessService.reviewApplication(currentUser, appId, 'approved');
      showToast('Applicant approved for Beta Access Wave 1.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to approve applicant', 'warning');
    } finally {
      setIsReviewingApp((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const handleRejectApplicant = async (appId: string) => {
    setIsReviewingApp((prev) => ({ ...prev, [appId]: true }));
    try {
      await betaAccessService.reviewApplication(currentUser, appId, 'rejected');
      showToast('Applicant status updated to rejected.', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Failed to reject applicant', 'warning');
    } finally {
      setIsReviewingApp((prev) => ({ ...prev, [appId]: false }));
    }
  };

  // Filtered lists
  const filteredFeedback = feedbackList.filter((item) => {
    if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) return false;
    if (selectedSeverityFilter !== 'all' && item.severity !== selectedSeverityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTester = item.testerName.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTester && !matchCat) return false;
    }
    return true;
  });

  const filteredApplications = applications.filter((app) => {
    if (appStatusFilter !== 'all' && app.status !== appStatusFilter) return false;
    if (appSearchQuery.trim()) {
      const q = appSearchQuery.toLowerCase().trim();
      const matchName = app.displayName.toLowerCase().includes(q);
      const matchUsername = app.username.toLowerCase().includes(q);
      const matchEmail = app.email.toLowerCase().includes(q);
      if (!matchName && !matchUsername && !matchEmail) return false;
    }
    return true;
  });

  // Metrics
  const feedbackMetrics = {
    total: feedbackList.length,
    new: feedbackList.filter((i) => i.status === 'new').length,
    reviewing: feedbackList.filter((i) => i.status === 'reviewing').length,
    in_progress: feedbackList.filter((i) => i.status === 'in_progress').length,
    fixed: feedbackList.filter((i) => i.status === 'fixed').length,
    closed: feedbackList.filter((i) => i.status === 'closed').length,
  };

  const appMetrics = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#131528] to-[#0a0b16] border border-[#2b2d4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#20223c] flex items-center justify-between shrink-0 bg-[#0d0e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-violet-400 uppercase">
                  NEXORA MISSION CONTROL
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ADMINISTRATOR HUD
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">Private Beta Access & Feedback Dashboard</h2>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#20223c] bg-[#090a14] px-5 pt-2 gap-4 shrink-0 font-mono text-xs">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`pb-3 px-2 font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'applicants'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Beta Access Applicants</span>
            {appMetrics.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                {appMetrics.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-3 px-2 font-bold transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Bug Reports & Telemetry</span>
            {feedbackMetrics.new > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px]">
                {feedbackMetrics.new}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: BETA APPLICANTS & ACCESS CONTROL */}
        {/* ============================================================== */}
        {activeTab === 'applicants' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Applicant Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[#090a14] border-b border-[#20223c] shrink-0 text-center font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Total Applicants</span>
                <span className="text-base font-bold text-white">{appMetrics.total}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase block">Pending Review</span>
                <span className="text-base font-bold text-amber-300">{appMetrics.pending}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 uppercase block">Approved</span>
                <span className="text-base font-bold text-emerald-300">{appMetrics.approved}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="text-[10px] text-rose-400 uppercase block">Rejected</span>
                <span className="text-base font-bold text-rose-300">{appMetrics.rejected}</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-[#0c0d1a] border-b border-[#20223c] shrink-0 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  placeholder="Search applicants by name, callsign, or email..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#090a14] border border-[#232640] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#090a14] border border-[#232640] text-xs font-mono text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">All Applicants ({applications.length})</option>
                <option value="pending">Status: Pending Review</option>
                <option value="approved">Status: Approved</option>
                <option value="rejected">Status: Rejected</option>
              </select>
            </div>

            {/* Applicants List */}
            <div className="p-4 overflow-y-auto custom-purple-scrollbar flex-1 space-y-3">
              {filteredApplications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs border border-dashed border-[#232640] rounded-2xl">
                  No beta applicants found matching the selected filter.
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-[#0e1022] border border-[#20223c] hover:border-violet-500/30 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-violet-300">
                          @{app.username}
                        </span>
                        <span className="text-xs font-bold text-white">
                          ({app.displayName})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold border ${
                            app.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : app.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {app.status === 'approved' ? 'Approved' : app.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Email: <strong className="text-slate-200">{app.email}</strong></span>
                        <span>•</span>
                        <span>Env: <strong className="text-slate-200">{(app.devices && app.devices[0]) || 'Web'}</strong></span>
                        <span>•</span>
                        <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {app.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveApplicant(app.id)}
                          disabled={isReviewingApp[app.id]}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </button>
                      )}

                      {app.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectApplicant(app.id)}
                          disabled={isReviewingApp[app.id]}
                          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BUG REPORTS & TELEMETRY */}
        {/* ============================================================== */}
        {activeTab === 'feedback' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Feedback Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-4 bg-[#090a14] border-b border-[#20223c] shrink-0 text-center font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                <span className="text-base font-bold text-white">{feedbackMetrics.total}</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 uppercase block">New</span>
                <span className="text-base font-bold text-cyan-300">{feedbackMetrics.new}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 uppercase block">Reviewing</span>
                <span className="text-base font-bold text-amber-300">{feedbackMetrics.reviewing}</span>
              </div>
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <span className="text-[10px] text-violet-400 uppercase block">In Progress</span>
                <span className="text-base font-bold text-violet-300">{feedbackMetrics.in_progress}</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 uppercase block">Fixed</span>
                <span className="text-base font-bold text-emerald-300">{feedbackMetrics.fixed}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
                <span className="text-[10px] text-slate-400 uppercase block">Closed</span>
                <span className="text-base font-bold text-slate-300">{feedbackMetrics.closed}</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-[#0c0d1a] border-b border-[#20223c] shrink-0 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports by title, keyword, or tester..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#090a14] border border-[#232640] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#090a14] border border-[#232640] text-xs font-mono text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">All Statuses ({feedbackList.length})</option>
                <option value="new">Status: New</option>
                <option value="reviewing">Status: Reviewing</option>
                <option value="in_progress">Status: In Progress</option>
                <option value="fixed">Status: Fixed</option>
                <option value="closed">Status: Closed</option>
              </select>

              <select
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#090a14] border border-[#232640] text-xs font-mono text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Feedback Items List */}
            <div className="p-4 overflow-y-auto custom-purple-scrollbar flex-1 space-y-4">
              {filteredFeedback.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs border border-dashed border-[#232640] rounded-2xl">
                  No bug reports found matching the selected filters.
                </div>
              ) : (
                filteredFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#0e1022] border border-[#20223c] space-y-4 hover:border-violet-500/30 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b1d33] pb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold border ${
                            item.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : item.severity === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : item.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {item.severity}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-violet-600/20 text-violet-300 border border-violet-500/30">
                          {item.category.replace('_', ' ')}
                        </span>

                        <h3 className="text-sm font-bold text-white truncate max-w-md">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Expunge telemetry report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>

                    {item.screenshot && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(item.screenshot || null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-violet-300 border border-violet-500/30 transition cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                          <span>View Attached Screenshot</span>
                        </button>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#1b1d33] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Operative:</span>
                        <strong className="text-white">@{item.testerName}</strong>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-500">Status:</label>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as BetaFeedbackStatus)
                          }
                          disabled={isUpdating[item.id]}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer focus:outline-none border bg-black/40 text-white"
                        >
                          <option value="new">Status: NEW</option>
                          <option value="reviewing">Status: REVIEWING</option>
                          <option value="in_progress">Status: IN PROGRESS</option>
                          <option value="fixed">Status: FIXED</option>
                          <option value="closed">Status: CLOSED</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingNotes[item.id] ?? ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Add developer resolution notes..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#070810] border border-[#232640] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNotes(item.id)}
                        disabled={isUpdating[item.id]}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20">
            <img src={previewImage} alt="Expanded Screenshot" className="max-w-full max-h-[90vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
