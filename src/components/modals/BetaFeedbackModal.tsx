import React, { useState, useEffect, useRef } from 'react';
import { useNexora } from '../../context/NexoraContext';
import {
  betaFeedbackService,
  VALID_CATEGORIES,
  MAX_SCREENSHOT_BYTES,
} from '../../services/betaFeedbackService';
import {
  BetaFeedbackCategory,
  BetaFeedbackSeverity,
  BetaFeedbackItem,
  BetaFeedbackStatus,
} from '../../types';
import {
  Bug,
  X,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Laptop,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';

export const BetaFeedbackModal: React.FC = () => {
  const { closeModal, currentUser, showToast } = useNexora();

  const [activeTab, setActiveTab] = useState<'report' | 'my_reports'>('report');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BetaFeedbackCategory>('voice_video');
  const [severity, setSeverity] = useState<BetaFeedbackSeverity>('medium');
  const [browserAndDevice, setBrowserAndDevice] = useState('');
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mySubmissions, setMySubmissions] = useState<BetaFeedbackItem[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect browser and device telemetry
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      let browser = 'Unknown Browser';
      if (ua.includes('Firefox/')) browser = 'Firefox';
      else if (ua.includes('Edg/')) browser = 'Edge';
      else if (ua.includes('Chrome/')) browser = 'Chrome';
      else if (ua.includes('Safari/')) browser = 'Safari';

      let os = 'Unknown OS';
      if (ua.includes('Win')) os = 'Windows 11/10';
      else if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS Safari';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('Linux')) os = 'Linux';

      setBrowserAndDevice(`${browser} on ${os} (${window.innerWidth}x${window.innerHeight})`);
    }
  }, []);

  // Subscribe to tester's own submissions
  useEffect(() => {
    const unsub = betaFeedbackService.listenToFeedback(
      currentUser.id,
      false,
      (items) => {
        setMySubmissions(items);
      }
    );
    return () => unsub();
  }, [currentUser.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Only image files (PNG, JPG, WebP) are accepted for screenshots.');
      return;
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(`Screenshot file size (${sizeMb} MB) exceeds maximum allowed limit of 2.00 MB.`);
      return;
    }

    setErrorMessage(null);
    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(undefined);
    setScreenshotName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const validation = betaFeedbackService.validateSubmission({
      title,
      description,
      category,
      severity,
      browserAndDevice,
      screenshot,
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please correct the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await betaFeedbackService.submitFeedback({
        title,
        description,
        category,
        severity,
        browserAndDevice,
        screenshot,
        testerId: currentUser.id,
        testerName: currentUser.displayName,
        testerTag: currentUser.tag,
        testerAvatar: currentUser.avatar,
      });

      setSuccessMessage('Feedback transmission successfully logged into NEXORA Beta telemetry.');
      showToast('Bug report filed successfully! Thank you for testing NEXORA.', 'success');

      // Reset form
      setTitle('');
      setDescription('');
      handleRemoveScreenshot();
      setActiveTab('my_reports');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit feedback transmission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BetaFeedbackStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">NEW</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">REVIEWING</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">IN PROGRESS</span>;
      case 'fixed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">FIXED</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">CLOSED</span>;
    }
  };

  const getSeverityBadge = (sev: BetaFeedbackSeverity) => {
    switch (sev) {
      case 'critical':
        return <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">CRITICAL</span>;
      case 'high':
        return <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">HIGH</span>;
      case 'medium':
        return <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">MEDIUM</span>;
      case 'low':
        return <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">LOW</span>;
    }
  };

  const getCategoryLabel = (cat: BetaFeedbackCategory) => {
    switch (cat) {
      case 'voice_video': return 'Voice & Video';
      case 'messaging': return 'Messaging & DMs';
      case 'communities': return 'Communities & RBAC';
      case 'auth': return 'Authentication';
      case 'performance': return 'Performance';
      case 'ui_ux': return 'UI / Polish';
      case 'other': return 'General Issue';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#131528] to-[#0a0b16] border border-[#2b2d4a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#20223c] flex items-center justify-between shrink-0 bg-[#0d0e1c]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                  BETA TELEMETRY
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-600/30 text-violet-300 border border-violet-500/30">
                  TESTER CLEARANCE
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">Report Bug / Feedback</h2>
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
        <div className="flex border-b border-[#20223c] bg-[#090a14] px-5 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 px-4 text-xs font-bold font-mono transition border-b-2 cursor-pointer ${
              activeTab === 'report'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            File Issue Report
          </button>
          <button
            onClick={() => setActiveTab('my_reports')}
            className={`pb-3 px-4 text-xs font-bold font-mono transition border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'my_reports'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>My Feedback</span>
            {mySubmissions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-violet-600/30 text-violet-200 font-mono">
                {mySubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-purple-scrollbar flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 font-mono">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'report' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Title */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Issue Title <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Remote video freezes when switching between Wi-Fi and Cellular"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090a14] border border-[#232640] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
              </div>

              {/* Category & Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Subsystem Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BetaFeedbackCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#090a14] border border-[#232640] text-xs text-white focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  >
                    <option value="voice_video">🎙️ Voice & Video Communication</option>
                    <option value="messaging">💬 Messaging, DMs & Threads</option>
                    <option value="communities">🛡️ Communities & Permissions</option>
                    <option value="auth">🔑 Authentication & Account</option>
                    <option value="performance">⚡ Performance & Memory</option>
                    <option value="ui_ux">🎨 UI / UX Glitches</option>
                    <option value="other">⚙️ Other Anomalies</option>
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Severity Impact <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['low', 'medium', 'high', 'critical'] as BetaFeedbackSeverity[]).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`py-2 rounded-lg text-[10px] font-mono font-bold capitalize transition border cursor-pointer ${
                          severity === sev
                            ? sev === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                              : sev === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                              : sev === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                            : 'bg-[#090a14] text-slate-400 border-[#232640] hover:bg-white/5'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Browser & Device Info */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Browser & Operating Device <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={browserAndDevice}
                    onChange={(e) => setBrowserAndDevice(e.target.value)}
                    maxLength={200}
                    placeholder="e.g. Chrome 124 on Windows 11 Desktop"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#090a14] border border-[#232640] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <Laptop className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Anomaly Description & Reproduction Steps <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{description.length}/2000</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="1. Navigate to voice channel.&#10;2. Click screen share.&#10;3. Observed behavior: Screen shares for 3 seconds then drops.&#10;4. Expected behavior: Screen share streams continuously."
                  className="w-full p-3.5 rounded-xl bg-[#090a14] border border-[#232640] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans leading-relaxed resize-none"
                  required
                />
              </div>

              {/* Optional Screenshot Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Optional Screenshot Proof (Max 2MB)
                </label>

                {!screenshot ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-[#282a44] hover:border-amber-400/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#090a14]/60 transition"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-300 font-medium">Click to upload diagnostic image</span>
                    <span className="text-[10px] font-mono text-slate-500">PNG, JPG, WebP up to 2.00 MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#090a14] border border-amber-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshot}
                        alt="Screenshot Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{screenshotName || 'Attached Screenshot'}</span>
                        <span className="text-[10px] font-mono text-emerald-400">Validated under 2MB ceiling</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 transition cursor-pointer"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  <Bug className="w-4 h-4" />
                  <span>{isSubmitting ? 'Transmitting Telemetry...' : 'Transmit Feedback Report'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* My Submissions Tab */
            <div className="space-y-3">
              {mySubmissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs">
                  <Bug className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p>No feedback reports filed yet.</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    When you report bugs, their live review status and developer notes will appear here.
                  </p>
                </div>
              ) : (
                mySubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#090a14] border border-[#20223c] space-y-2.5 transition hover:border-violet-500/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(item.status)}
                          {getSeverityBadge(item.severity)}
                          <span className="text-[10px] font-mono text-slate-500">
                            {getCategoryLabel(item.category)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
                      <Laptop className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{item.browserAndDevice}</span>
                    </div>

                    {item.screenshot && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(item.screenshot || null)}
                          className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 cursor-pointer font-mono"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>View Attached Screenshot</span>
                        </button>
                      </div>
                    )}

                    {item.adminNotes && (
                      <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs">
                        <span className="text-[10px] font-mono font-bold text-violet-400 uppercase block mb-0.5">
                          Developer Resolution Note
                        </span>
                        <p className="text-violet-200 font-sans">{item.adminNotes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
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

