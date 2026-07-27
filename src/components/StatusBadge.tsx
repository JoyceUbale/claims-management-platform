import type { ClaimStatus } from '@/types';
import { statusStyles } from '@/lib/utils';

export function StatusBadge({ status, size = 'md' }: { status: ClaimStatus; size?: 'sm' | 'md' }) {
  const s = statusStyles[status];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${s.badge} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
