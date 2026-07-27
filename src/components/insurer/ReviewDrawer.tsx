import { useEffect, useState } from 'react';
import { Check, FileImage, Mail, User, X, Clock, DollarSign, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import type { Claim, ClaimStatus } from '@/types';
import { useClaims } from '@/hooks/useClaims';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';

export function ReviewDrawer({ claim, onClose }: { claim: Claim | null; onClose: () => void }) {
  const { updateClaim } = useClaims();
  const [decision, setDecision] = useState<ClaimStatus | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (claim) {
      setDecision(claim.status === 'Pending' ? null : claim.status);
      setApprovedAmount(claim.approvedAmount != null ? String(claim.approvedAmount) : '');
      setComments(claim.insurerComments ?? '');
      setError(null);
    }
  }, [claim]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (claim) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [claim, onClose]);

  if (!claim) return null;

  function handleSave() {
    if (!claim) return;
    if (!decision) {
      setError('Please choose Approve or Reject before saving.');
      return;
    }
    if (decision === 'Approved') {
      const amt = parseFloat(approvedAmount);
      if (approvedAmount.trim() === '' || Number.isNaN(amt) || amt < 0) {
        setError('Enter a valid approved amount.');
        return;
      }
    }
    setSaving(true);
    setError(null);
    setTimeout(() => {
      updateClaim(claim!.id, {
        status: decision!,
        approvedAmount: decision === 'Approved' ? parseFloat(approvedAmount) : null,
        insurerComments: comments.trim() || null,
      });
      setSaving(false);
      onClose();
    }, 500);
  }

  const isPending = claim.status === 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-pop animate-slide-in sm:max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase text-slate-400">{claim.id}</span>
              <StatusBadge status={claim.status} size="sm" />
            </div>
            <h2 className="mt-1 font-display text-lg font-bold text-slate-900">Claim Review</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Patient */}
          <section className="mb-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient</h3>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {claim.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {claim.name}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {claim.email}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Details */}
          <section className="mb-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Claim Details</h3>
            <div className="card divide-y divide-slate-100">
              <DetailRow icon={DollarSign} label="Claim Amount" value={formatCurrency(claim.claimAmount)} strong />
              <DetailRow icon={Clock} label="Submitted" value={formatDateTime(claim.submissionDate)} />
              {claim.approvedAmount != null && (
                <DetailRow icon={CheckCircle2} label="Approved Amount" value={formatCurrency(claim.approvedAmount)} accent="emerald" />
              )}
              {claim.insurerComments && (
                <div className="px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Previous Comments
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{claim.insurerComments}</p>
                </div>
              )}
              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">{claim.description}</p>
              </div>
            </div>
          </section>

          {/* Document */}
          <section className="mb-5">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Supporting Document</h3>
            {claim.documentUrl ? (
              <div className="card overflow-hidden">
                <div className="relative">
                  <img src={claim.documentUrl} alt="Document" className="max-h-72 w-full object-contain bg-slate-50" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs text-slate-500">
                  <FileImage className="h-3.5 w-3.5 text-brand-600" />
                  <span className="truncate">Receipt / prescription preview</span>
                </div>
              </div>
            ) : (
              <div className="card flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                <FileImage className="h-4 w-4" />
                No document uploaded for this claim.
              </div>
            )}
          </section>

          {/* Action form */}
          {isPending && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Review Action</h3>
              <div className="card p-4">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDecision('Approved')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      decision === 'Approved'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => setDecision('Rejected')}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      decision === 'Rejected'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-200 text-slate-600 hover:border-rose-300'
                    }`}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>

                {decision === 'Approved' && (
                  <div className="mb-3 animate-fade-in">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Approved Amount</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(e.target.value)}
                        placeholder={String(claim.claimAmount)}
                        className="input-base pl-7"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Insurer Comments</label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add notes for the patient about this decision..."
                    className="input-base resize-none"
                  />
                </div>

                {error && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
                )}
              </div>
            </section>
          )}

          {!isPending && claim.insurerComments && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Decision Notes</h3>
              <div className="card p-4">
                <p className="text-sm text-slate-600">{claim.insurerComments}</p>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        {isPending && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
            <button onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !decision} className={decision === 'Rejected' ? 'btn-danger' : 'btn-success'}>
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {decision === 'Rejected' ? 'Confirm Rejection' : 'Confirm Approval'}
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  strong,
  accent,
}: {
  icon: typeof User;
  label: string;
  value: string;
  strong?: boolean;
  accent?: 'emerald';
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span
        className={`text-sm ${strong ? 'font-bold' : 'font-medium'} ${
          accent === 'emerald' ? 'text-emerald-600' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
