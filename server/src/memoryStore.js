import { seedClaims } from './seedData.js';

// In-memory fallback used when MongoDB is not connected. Mirrors the Mongoose
// schema shape and the `id` virtual so API responses stay consistent.
let memoryStore = [];
let memoryId = 1;

function toResponse(item) {
  return {
    id: item._id,
    name: item.name,
    email: item.email,
    claimAmount: item.claimAmount,
    description: item.description,
    documentUrl: item.documentUrl ?? null,
    status: item.status,
    submissionDate: item.submissionDate,
    approvedAmount: item.approvedAmount ?? null,
    insurerComments: item.insurerComments ?? null,
  };
}

export function seedMemory() {
  memoryStore = seedClaims.map((c) => ({
    _id: `mem-${String(memoryId++).padStart(3, '0')}`,
    submissionDate: new Date().toISOString(),
    approvedAmount: null,
    insurerComments: null,
    documentUrl: null,
    ...c,
  }));
}

export function listMemory({ status, min, max, sort }) {
  let result = [...memoryStore];
  if (status && status !== 'All') result = result.filter((c) => c.status === status);
  if (min) result = result.filter((c) => c.claimAmount >= Number(min));
  if (max) result = result.filter((c) => c.claimAmount <= Number(max));
  const sorters = {
    newest: (a, b) => new Date(b.submissionDate) - new Date(a.submissionDate),
    oldest: (a, b) => new Date(a.submissionDate) - new Date(b.submissionDate),
    'amount-high': (a, b) => b.claimAmount - a.claimAmount,
    'amount-low': (a, b) => a.claimAmount - b.claimAmount,
  };
  result.sort(sorters[sort] ?? sorters.newest);
  return result.map(toResponse);
}

export function getMemory(id) {
  const item = memoryStore.find((c) => c._id === id);
  return item ? toResponse(item) : null;
}

export function createMemory(data) {
  const item = {
    _id: `mem-${String(memoryId++).padStart(3, '0')}`,
    submissionDate: new Date().toISOString(),
    approvedAmount: null,
    insurerComments: null,
    documentUrl: null,
    status: 'Pending',
    ...data,
  };
  memoryStore.unshift(item);
  return toResponse(item);
}

export function updateMemory(id, patch) {
  const item = memoryStore.find((c) => c._id === id);
  if (!item) return null;
  Object.assign(item, patch);
  return toResponse(item);
}
