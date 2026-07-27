import { useMemo, useState } from 'react';
import { ArrowDownUp, Filter, Inbox, Search, SlidersHorizontal } from 'lucide-react';
import { useClaims, useFilteredClaims, statusCounts } from '@/hooks/useClaims';
import type { Claim, ClaimFilters, ClaimStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';
import { ReviewDrawer } from '@/components/insurer/ReviewDrawer';

const statusOptions: (ClaimStatus | 'All')[] = ['All', 'Pending', 'Approved', 'Rejected'];
const sortOptions: { value: ClaimFilters['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'amount-high', label: 'Amount: High to Low' },
  { value: 'amount-low', label: 'Amount: Low to High' },
];

export function InsurerDashboard() {
  const { claims } = useClaims();
  const [filters, setFilters] = useState<ClaimFilters>({
    status: 'All',
    sort: 'newest',
  });
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useFilteredClaims(claims, filters);
  const counts = useMemo(() => statusCounts(claims), [claims]);

  const visible = useMemo(() => {
    if (!query.trim()) return filtered;
    const q = query.toLowerCase();
    return filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [filtered, query]);

  const selected = useMemo(() => claims.find((c) => c.id === selectedId) ?? null, [claims, selectedId]);

  const pendingReview = counts.Pending;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Claims Review Queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and act on all submitted claims. {pendingReview > 0 && (
              <span className="font-semibold text-amber-600">{pendingReview} pending review.</span>
            )}
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total Claims" value={counts.All} tone="brand" />
        <SummaryCard label="Pending" value={counts.Pending} tone="amber" />
        <SummaryCard label="Approved" value={counts.Approved} tone="emerald" />
        <SummaryCard label="Rejected" value={counts.Rejected} tone="rose" />
      </div>

      {/* Filter bar */}
      <div className="card mb-5 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, status: s }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filters.status === s ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="number"
                min="0"
                placeholder="Min $"
                value={filters.amountMin ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, amountMin: e.target.value === '' ? undefined : parseFloat(e.target.value) }))
                }
                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
              <span className="text-slate-300">—</span>
              <input
                type="number"
                min="0"
                placeholder="Max $"
                value={filters.amountMax ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, amountMax: e.target.value === '' ? undefined : parseFloat(e.target.value) }))
                }
                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, ID..."
                className="input-base pl-9"
              />
            </div>
            <div className="relative">
              <ArrowDownUp className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value as ClaimFilters['sort'] }))}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(filters.amountMin != null || filters.amountMax != null || filters.status !== 'All') && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>
              Showing {visible.length} of {claims.length} claims
            </span>
            <button
              onClick={() => setFilters({ status: 'All', sort: 'newest' })}
              className="ml-auto font-semibold text-brand-600 hover:text-brand-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {visible.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox className="h-7 w-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">No claims match your filters</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting the status, amount range, or search query.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Claim ID</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((claim) => (
                  <tr key={claim.id} className="group transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-slate-500">{claim.id.slice(0, 12)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {claim.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{claim.name}</p>
                          <p className="truncate text-xs text-slate-400">{claim.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-800">{formatCurrency(claim.claimAmount)}</span>
                      {claim.approvedAmount != null && (
                        <p className="text-xs text-emerald-600">Approved: {formatCurrency(claim.approvedAmount)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{formatDate(claim.submissionDate)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedId(claim.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          claim.status === 'Pending'
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {claim.status === 'Pending' ? 'Review' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {visible.map((claim) => (
              <MobileRow key={claim.id} claim={claim} onReview={() => setSelectedId(claim.id)} />
            ))}
          </div>
        </div>
      )}

      <ReviewDrawer claim={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function MobileRow({ claim, onReview }: { claim: Claim; onReview: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-semibold uppercase text-slate-400">{claim.id.slice(0, 12)}</span>
          <p className="mt-0.5 truncate font-semibold text-slate-800">{claim.name}</p>
          <p className="truncate text-xs text-slate-400">{claim.email}</p>
        </div>
        <StatusBadge status={claim.status} size="sm" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase text-slate-400">Amount</p>
          <p className="font-bold text-slate-800">{formatCurrency(claim.claimAmount)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase text-slate-400">Submitted</p>
          <p className="text-xs text-slate-500">{formatDate(claim.submissionDate)}</p>
        </div>
        <button
          onClick={onReview}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            claim.status === 'Pending' ? 'bg-brand-600 text-white' : 'border border-slate-200 text-slate-600'
          }`}
        >
          {claim.status === 'Pending' ? 'Review' : 'View'}
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: 'brand' | 'amber' | 'emerald' | 'rose' }) {
  const tones = {
    brand: 'from-brand-500 to-brand-700',
    amber: 'from-amber-400 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-700',
    rose: 'from-rose-500 to-rose-700',
  };
  return (
    <div className="card relative overflow-hidden p-4">
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${tones[tone]} opacity-10`} />
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
