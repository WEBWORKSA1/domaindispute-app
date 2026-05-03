/**
 * Shared utility helpers used across components.
 */

import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null, fmt = 'MMMM d, yyyy'): string {
  if (!iso) return '-';
  try {
    return format(parseISO(iso), fmt);
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string | null): string {
  if (!iso) return '-';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function outcomeLabel(outcome: string | null): string {
  if (!outcome) return 'Pending';
  const map: Record<string, string> = {
    TRANSFER: 'Transfer',
    DENY: 'Denied',
    RDNH: 'RDNH',
    SUSPEND: 'Suspended',
    WITHDRAWN: 'Withdrawn',
    PENDING: 'Pending',
    OTHER: 'Other',
  };
  return map[outcome] ?? outcome;
}

export function outcomeColor(outcome: string | null): string {
  switch (outcome) {
    case 'TRANSFER':
      return 'bg-green text-bone';
    case 'DENY':
      return 'bg-gold text-ink';
    case 'RDNH':
      return 'bg-oxblood text-bone';
    case 'SUSPEND':
      return 'bg-ink text-bone';
    default:
      return 'bg-muted text-bone';
  }
}

export function clusterLabel(tag: string): string {
  const map: Record<string, string> = {
    'typosquatting': 'Typosquatting',
    'famous-brand': 'Famous Brand',
    'phishing': 'Phishing & Fraud',
    'celebrity': 'Celebrity',
    'ai-cctld': 'AI / .AI',
    'generic-word': 'Generic Word',
    'acronym': 'Acronym / Short',
    'rdnh': 'RDNH',
    'foundational': 'Foundational',
    'urs': 'URS',
    'cctld': 'ccTLD',
    'aged-domain': 'Aged Domain',
  };
  return map[tag] ?? tag;
}
