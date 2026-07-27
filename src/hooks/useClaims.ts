import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Claim, ClaimFilters, ClaimStatus, ClaimUpdatePayload } from '@/types';
import { seedClaims } from '@/data/seedClaims';

const API_BASE = 'http://localhost:4000/api/claims';
const STORAGE_KEY = 'claimflow.claims.v1';

function loadLocalClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Claim[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return seedClaims;
}

function persistLocal(claims: Claim[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch {
    // ignore quota error
  }
}

export interface NewClaimInput {
  name: string;
  email: string;
  claimAmount: number;
  description: string;
  documentUrl: string | null;
}

interface ClaimsContextValue {
  claims: Claim[];
  loading: boolean;
  addClaim: (input: NewClaimInput) => Promise<Claim>;
  updateClaim: (id: string, patch: ClaimUpdatePayload) => Promise<void>;
  getClaim: (id: string) => Claim | undefined;
  refreshClaims: () => Promise<void>;
}

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export function ClaimsProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>(() => loadLocalClaims());
  const [loading, setLoading] = useState(true);

  // Fetch claims from Node.js Express API on mount
  const refreshClaims = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) {
        const data = (await res.json()) as Claim[];
        setClaims(data);
        persistLocal(data);
      }
    } catch {
      // If backend is unreachable, keep local claims
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshClaims();
  }, [refreshClaims]);

  const addClaim = useCallback(
    async (input: NewClaimInput): Promise<Claim> => {
      let createdClaim: Claim;
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          createdClaim = (await res.json()) as Claim;
        } else {
          throw new Error('API error');
        }
      } catch {
        // Fallback for offline mode
        createdClaim = {
          id: 'clm-' + Math.random().toString(36).slice(2, 8),
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
      }

      setClaims((prev) => {
        const next = [createdClaim, ...prev];
        persistLocal(next);
        return next;
      });
      return createdClaim;
    },
    [],
  );

  const updateClaim = useCallback(
    async (id: string, patch: ClaimUpdatePayload) => {
      try {
        await fetch(`${API_BASE}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
      } catch {
        // Fallback
      }

      setClaims((prev) => {
        const next = prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: patch.status,
                approvedAmount: patch.approvedAmount ?? c.approvedAmount,
                insurerComments: patch.insurerComments ?? c.insurerComments,
              }
            : c,
        );
        persistLocal(next);
        return next;
      });
    },
    [],
  );

  const getClaim = useCallback((id: string) => claims.find((c) => c.id === id), [claims]);

  const value = useMemo(
    () => ({ claims, loading, addClaim, updateClaim, getClaim, refreshClaims }),
    [claims, loading, addClaim, updateClaim, getClaim, refreshClaims],
  );

  return React.createElement(ClaimsContext.Provider, { value }, children);
}

export function useClaims(): ClaimsContextValue {
  const ctx = useContext(ClaimsContext);
  if (!ctx) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return ctx;
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