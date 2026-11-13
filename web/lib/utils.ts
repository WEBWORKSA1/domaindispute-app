/**
 * Shared helpers.
 */

import { type ClassValue, clsx } from 'clsx';
import { addDays, format, formatDistanceToNow, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!iso) return '-';
  try {
    return format(parseISO(iso), fmt);
  } catch {
    return iso;
  }
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '-';
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function addDaysIso(iso: string, days: number): string {
  return format(addDays(parseISO(iso), days), 'yyyy-MM-dd');
}

export function outcomeLabel(outcome: string | null | undefined): string {
  if (!outcome) return 'Pending';
  const map: Record<string, string> = {
    TRANSFER: 'Transferred',
    DENY: 'Complaint denied',
    RDNH: 'Denied (RDNH)',
    SUSPEND: 'Suspended',
    WITHDRAWN: 'Terminated',
    PENDING: 'Pending',
    OTHER: 'Cancelled',
    FILED: 'Filed',
    DECIDED: 'Closed',
  };
  return map[outcome] ?? outcome;
}

/** Badge classes. Colour is never the only signal - the label always shows. */
export function outcomeColor(outcome: string | null | undefined): string {
  switch (outcome) {
    case 'TRANSFER':
      return 'bg-[#e3eefb] text-[#174a8a]';
    case 'OTHER':
    case 'SUSPEND':
      return 'bg-[#e6f4ee] text-[#155c3c]';
    case 'DENY':
      return 'bg-[#fdebe4] text-[#9a3412]';
    case 'RDNH':
      return 'bg-oxblood text-white';
    case 'WITHDRAWN':
    case 'DECIDED':
      return 'bg-bone text-muted';
    default:
      return 'bg-legal-pad text-[#7a5410]';
  }
}

export function clusterLabel(tag: string): string {
  const map: Record<string, string> = {
    typosquatting: 'Typosquatting',
    'famous-brand': 'Famous brand',
    phishing: 'Phishing & fraud',
    celebrity: 'Celebrity',
    'ai-cctld': 'AI / .ai',
    'generic-word': 'Generic word',
    acronym: 'Acronym / short',
    rdnh: 'RDNH',
    foundational: 'Foundational',
    urs: 'URS',
    cctld: 'ccTLD',
    'aged-domain': 'Aged domain',
  };
  return map[tag] ?? tag;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 80);
}

export function pct(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '-';
  return `${(n * 100).toFixed(digits)}%`;
}

export function num(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('en-US');
}
