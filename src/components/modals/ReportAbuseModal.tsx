import React, { useState } from 'react';
import { useNexora } from '../../context/NexoraContext';
import { ReportTargetType } from '../../types';
import { ShieldAlert, X, AlertTriangle, Send } from 'lucide-react';

const VIOLATION_REASONS = [
  'Harassment or Cyberbullying',
  'Hate Speech or Discrimination',
  'Spam, Phishing, or Malicious Links',
  'Impersonation or Identity Fraud',
  'Prohibited or Illegal Content',
  'Platform Exploitation or Botting',
  'Terms of Service Violation',
  'Other Safety Concern',
];

export const ReportAbuseModal: React.FC = () => {
  const { closeModal, modalPayload, submitReport, showToast } = useNexora();

  const targetType: ReportTargetType = modalPayload?.targetType || 'user';
  const targetId: string = modalPayload?.targetId || '';
  const targetName: string = modalPayload?.targetName || targetId || 'Unknown Target';

  const [reason, setReason] = useState(VIOLATION_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      showToast('Please select a violation category.', 'warning');
      return;
    }
    if (!targetId) {
      showToast('Invalid target reference for report.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitReport(targetType, targetId, reason, details);
      if (res.success) {
        closeModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0e101f] border border-rose-500/30 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#20223d] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Report Safety Violation</h2>
              <p className="text-xs text-slate-400 font-mono">Submit confidential transmission to NEXORA Trust &amp; Safety</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Badge */}
        <div className="p-3 rounded-2xl bg-[#141628] border border-[#20223a] mb-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Reported Target</span>
            <span className="text-sm font-bold text-white truncate block">{targetName}</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase font-semibold">
            {targetType}
          </span>
        </div>

        {/* Report Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reason Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#121424] border border-[#20223a] rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500/50"
            >
              {VIOLATION_REASONS.map((r) => (
                <option key={r} value={r} className="bg-[#121424] text-white">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Details / Evidence (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific message quotes, context, or details that will assist administrators in investigating..."
              rows={4}
              maxLength={1500}
              className="w-full bg-[#121424] border border-[#20223a] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/50 resize-none font-mono"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1">
              <span>Encrypted &amp; logged directly to the admin moderation queue</span>
              <span>{details.length}/1500</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-amber-200">
              False reporting and misuse of safety channels may result in administrative warnings or suspension of reporting privileges.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20223d]">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Submitting...' : 'SUBMIT REPORT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
