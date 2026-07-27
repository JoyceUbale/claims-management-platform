export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Claim {
  id: string;
  name: string;
  email: string;
  claimAmount: number;
  description: string;
  documentUrl: string | null;
  status: ClaimStatus;
  submissionDate: string;
  approvedAmount: number | null;
  insurerComments: string | null;
}

export type ViewRole = 'patient' | 'insurer';

export interface MockUser {
  role: ViewRole;
  name: string;
  email: string;
  title: string;
}

export interface ClaimFilters {
  status: ClaimStatus | 'All';
  amountMin?: number;
  amountMax?: number;
  sort: 'newest' | 'oldest' | 'amount-high' | 'amount-low';
}

export interface ClaimUpdatePayload {
  status: ClaimStatus;
  approvedAmount?: number | null;
  insurerComments?: string | null;
}
