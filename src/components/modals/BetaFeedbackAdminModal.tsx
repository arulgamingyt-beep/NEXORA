import React, { useState, useEffect } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  betaFeedbackService,
  VALID_STATUSES,
} from '../../services/betaFeedbackService';
import {
  BetaFeedbackItem,
  BetaFeedbackStatus,
  BetaFeedbackSeverity,
  BetaFeedbackCategory,
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
} from 'lucide-react';

export const BetaFeedbackAdminModal: React.FC = () => {
  const { closeModal, currentUser, showToast } = useNexora();

  // Admin clearance check
  const isAdmin =
    currentUser.role === 'admin' ||
    currentUser.role === 'owner' ||
    currentUser.email === 'admin@nexora.io' ||
    (currentUser as any).isAdmin === true;

  const [feedbackList, setFeedbackList] = useState<BetaFeedbackItem[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Editing state for notes
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdmin) return;

    const unsub = betaFeedbackService.listenToFeedback(
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

    return () => unsub();
  }, [currentUser.id, isAdmin]);

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

  // Filter and search computation
  const filteredList = feedbackList.filter((item) => {
    if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) return false;
    if (selectedSeverityFilter !== 'all' && item.severity !== selectedSeverityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTester = item.testerName.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTester && !matchCat) return false;
    }
    return true;
  });

  // Metrics computation
  const metrics = {
    total: feedbackList.length,
    new: feedbackList.filter((i) => i.status === 'new').length,
    reviewing: feedbackList.filter((i) => i.status === 'reviewing').length,
    in_progress: feedbackList.filter((i) => i.status === 'in_progress').length,
    fixed: feedbackList.filter((i) => i.status === 'fixed').length,
    closed: feedbackList.filter((i) => i.status === 'closed').length,
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
              <h2 className="text-base font-extrabold text-white">Private Beta Feedback Telemetry</h2>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-4 bg-[#090a14] border-b border-[#20223c] shrink-0 text-center font-mono">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase block">Total</span>
            <span className="text-base font-bold text-white">{metrics.total}</span>
          </div>
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-[10px] text-cyan-400 uppercase block">New</span>
            <span className="text-base font-bold text-cyan-300">{metrics.new}</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] text-amber-400 uppercase block">Reviewing</span>
            <span className="text-base font-bold text-amber-300">{metrics.reviewing}</span>
          </div>
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <span className="text-[10px] text-violet-400 uppercase block">In Progress</span>
            <span className="text-base font-bold text-violet-300">{metrics.in_progress}</span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 uppercase block">Fixed</span>
            <span className="text-base font-bold text-emerald-300">{metrics.fixed}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
            <span className="text-[10px] text-slate-400 uppercase block">Closed</span>
            <span className="text-base font-bold text-slate-300">{metrics.closed}</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-[#0c0d1a] border-b border-[#20223c] shrink-0 flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
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

            {/* Severity Filter */}
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
        </div>

        {/* Feedback List Body */}
        <div className="p-6 overflow-y-auto custom-purple-scrollbar flex-1 space-y-4">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs">
              <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-50" />
              <p>No feedback matching current filter parameters.</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Telemetry streams update in real-time as beta testers submit reports.
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#090a14] border border-[#232640] space-y-3 transition hover:border-violet-500/40"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.testerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={item.testerName}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.testerName}</span>
                        {item.testerTag && (
                          <span className="text-[10px] font-mono text-slate-400">{item.testerTag}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Reported on {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10 uppercase">
                      {item.category.replace('_', ' ')}
                    </span>

                    {/* Severity Pill */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        item.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : item.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {item.severity}
                    </span>

                    {/* Delete Report Button */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer"
                      title="Permanently Delete Telemetry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line bg-black/30 p-3 rounded-xl border border-white/5">
                    {item.description}
                  </p>
                </div>

                {/* Device Diagnostics & Screenshot Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.browserAndDevice}</span>
                  </div>

                  {item.screenshot && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.screenshot || null)}
                      className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-mono cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Inspect Screenshot</span>
                    </button>
                  )}
                </div>

                {/* Admin Management Controls */}
                <div className="pt-3 border-t border-white/5 bg-[#0e101f]/70 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                        Lifecycle Status:
                      </span>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as BetaFeedbackStatus)
                        }
                        disabled={isUpdating[item.id]}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer focus:outline-none border ${
                          item.status === 'fixed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : item.status === 'in_progress'
                            ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                            : item.status === 'reviewing'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : item.status === 'closed'
                            ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        <option value="new">Status: NEW</option>
                        <option value="reviewing">Status: REVIEWING</option>
                        <option value="in_progress">Status: IN PROGRESS</option>
                        <option value="fixed">Status: FIXED</option>
                        <option value="closed">Status: CLOSED</option>
                      </select>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      ID: {item.id}
                    </span>
                  </div>

                  {/* Resolution Notes */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingNotes[item.id] ?? ''}
                      onChange={(e) =>
                        setEditingNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="Add developer resolution notes or tester communication..."
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
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
