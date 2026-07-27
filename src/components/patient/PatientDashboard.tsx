import { useMemo, useState } from 'react';
import { FileText, Inbox, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClaims } from '@/hooks/useClaims';
import type { Claim, ClaimStatus } from '@/types';
import { formatCurrency, formatDate, relativeTime } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';

type StatusFilter = ClaimStatus | 'All';
const statusTabs: StatusFilter[] = ['All', 'Pending', 'Approved', 'Rejected'];

export function PatientDashboard({ onNewClaim }: { onNewClaim: () => void }) {
  const { user } = useAuth();
  const { claims } = useClaims();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [query, setQuery] = useState('');

  const myClaims = useMemo(() => claims.filter((c) => c.email === user.email), [claims, user.email]);

  const filtered = useMemo(() => {
    let result = myClaims;
    if (statusFilter !== 'All') result = result.filter((c) => c.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) => c.description.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
      );
    }
    return [...result].sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  }, [myClaims, statusFilter, query]);

  const counts = useMemo(() => {
    const c = { All: myClaims.length, Pending: 0, Approved: 0, Rejected: 0 };
    for (const cl of myClaims) c[cl.status] += 1;
    return c;
  }, [myClaims]);

  const totalClaimed = useMemo(() => myClaims.reduce((s, c) => s + c.claimAmount, 0), [myClaims]);
  const totalApproved = useMemo(
    () => myClaims.filter((c) => c.status === 'Approved').reduce((s, c) => s + (c.approvedAmount ?? 0), 0),
    [myClaims],
  );

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">My Claims</h1>
          <p className="mt-1 text-sm text-slate-500">Track the status of claims you've submitted.</p>
        </div>
        <button onClick={onNewClaim} className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          New Claim
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Claims" value={String(counts.All)} accent="brand" />
        <StatCard label="Pending" value={String(counts.Pending)} accent="amber" />
        <StatCard label="Total Claimed" value={formatCurrency(totalClaimed)} accent="slate" />
        <StatCard label="Total Approved" value={formatCurrency(totalApproved)} accent="emerald" />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
          {statusTabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === t ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t}
              {t !== 'All' && counts[t] > 0 && (
                <span className={`ml-1.5 ${statusFilter === t ? 'text-brand-100' : 'text-slate-400'}`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search claims..."
            className="input-base pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState onNewClaim={onNewClaim} hasClaims={myClaims.length > 0} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-pop">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {claim.id.slice(0, 12)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Submitted {relativeTime(claim.submissionDate)}</p>
        </div>
        <StatusBadge status={claim.status} size="sm" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-3">
        <p className="line-clamp-2 text-sm text-slate-600">{claim.description}</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-px bg-slate-100">
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Claim Amount</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800">{formatCurrency(claim.claimAmount)}</p>
        </div>
        <div className="bg-white px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Approved Amount</p>
          <p
            className={`mt-0.5 text-sm font-bold ${
              claim.approvedAmount != null ? 'text-emerald-600' : 'text-slate-300'
            }`}
          >
            {formatCurrency(claim.approvedAmount)}
          </p>
        </div>
      </div>

      {claim.insurerComments && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Insurer Comments</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{claim.insurerComments}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <span className="text-xs text-slate-500">{formatDate(claim.submissionDate)}</span>
        {claim.documentUrl ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600">
            <FileText className="h-3.5 w-3.5" />
            Document attached
          </span>
        ) : (
          <span className="text-xs text-slate-400">No document</span>
        )}
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'brand' | 'amber' | 'emerald' | 'slate';
}) {
  const accents = {
    brand: 'text-brand-700',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    slate: 'text-slate-800',
  };
  return (
    <div className="card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${accents[accent]}`}>{value}</p>
    </div>
  );
}

function EmptyState({ onNewClaim, hasClaims }: { onNewClaim: () => void; hasClaims: boolean }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Inbox className="h-7 w-7" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-700">
        {hasClaims ? 'No claims match your filters' : 'No claims yet'}
      </p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasClaims
          ? 'Try adjusting the status filter or search query.'
          : 'Submit your first claim to get started — it only takes a minute.'}
      </p>
      {!hasClaims && (
        <button onClick={onNewClaim} className="btn-primary mt-5">
          <Plus className="h-4 w-4" />
          Submit a Claim
        </button>
      )}
    </div>
  );
}
