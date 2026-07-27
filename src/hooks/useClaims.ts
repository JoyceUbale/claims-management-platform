import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Claim, ClaimFilters, ClaimStatus, ClaimUpdatePayload } from '@/types';
import { seedClaims } from '@/data/seedClaims';

const STORAGE_KEY = 'claimflow.claims.v1';

function loadClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Claim[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore corrupted storage
  }
  return seedClaims;
}

function persist(claims: Claim[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch {
    // ignore quota errors
  }
}

function genId(): string {
  return 'clm-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export interface NewClaimInput {
  name: string;
  email: string;
  claimAmount: number;
  description: string;
  documentUrl: string | null;
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>(() => loadClaims());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    persist(claims);
    setLoading(false);
  }, [claims]);

  const addClaim = useCallback((input: NewClaimInput): Claim => {
    const claim: Claim = {
      id: genId(),
      name: input.name,
      email: input.email,
      claimAmount: input.claimAmount,
      description: input.description,
      documentUrl: input.documentUrl,
      status: 'Pending',
      submissionDate: new Date().toISOString(),
      approvedAmount: null,
      insurerComments: null,
    };
    setClaims((prev) => [claim, ...prev]);
    return claim;
  }, []);

  const updateClaim = useCallback((id: string, patch: ClaimUpdatePayload) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: patch.status,
              approvedAmount: patch.approvedAmount ?? c.approvedAmount,
              insurerComments: patch.insurerComments ?? c.insurerComments,
            }
          : c,
      ),
    );
  }, []);

  const getClaim = useCallback((id: string): Claim | undefined => claims.find((c) => c.id === id), [claims]);

  return { claims, loading, addClaim, updateClaim, getClaim };
}

export function filterAndSortClaims(claims: Claim[], filters: ClaimFilters): Claim[] {
  let result = [...claims];

  if (filters.status !== 'All') {
    result = result.filter((c) => c.status === filters.status);
  }
  if (typeof filters.amountMin === 'number' && !Number.isNaN(filters.amountMin)) {
    result = result.filter((c) => c.claimAmount >= filters.amountMin!);
  }
  if (typeof filters.amountMax === 'number' && !Number.isNaN(filters.amountMax)) {
    result = result.filter((c) => c.claimAmount <= filters.amountMax!);
  }

  result.sort((a, b) => {
    switch (filters.sort) {
      case 'newest':
        return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
      case 'oldest':
        return new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      case 'amount-high':
        return b.claimAmount - a.claimAmount;
      case 'amount-low':
        return a.claimAmount - b.claimAmount;
      default:
        return 0;
    }
  });

  return result;
}

export function statusCounts(claims: Claim[]): Record<ClaimStatus | 'All', number> {
  const counts: Record<ClaimStatus | 'All', number> = {
    All: claims.length,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  };
  for (const c of claims) counts[c.status] += 1;
  return counts;
}

export function useFilteredClaims(claims: Claim[], filters: ClaimFilters) {
  return useMemo(() => filterAndSortClaims(claims, filters), [claims, filters]);
}
