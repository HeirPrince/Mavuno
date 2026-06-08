import type { ProduceListing } from '@/lib/types';

const STORAGE_PREFIX = 'mavuno_listings';

export type StoredProduceListing = ProduceListing & {
  unit: 'kg' | 'tons' | 'bags';
  createdAt: string;
};

function storageKey(farmerId: string) {
  return `${STORAGE_PREFIX}:${farmerId}`;
}

export function readListings(farmerId: string): StoredProduceListing[] {
  try {
    const raw = localStorage.getItem(storageKey(farmerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredProduceListing[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeListings(farmerId: string, listings: StoredProduceListing[]) {
  localStorage.setItem(storageKey(farmerId), JSON.stringify(listings));
}

export function createListingId() {
  return crypto.randomUUID();
}
