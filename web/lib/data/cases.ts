/**
 * Read-only data access for public pages. Every function degrades to empty
 * results when Supabase is unreachable, so a page never 500s on missing data.
 */

import { getPublicClient } from '@/lib/supabase/server';

export type Outcome = 'TRANSFER' | 'DENY' | 'RDNH' | 'SUSPEND' | 'WITHDRAWN' | 'PENDING' | 'OTHER';

export interface CaseRow {
  id: string;
  provider: string;
  case_number: string;
  decision_url: string | null;
  complainant_name: string | null;
  respondent_name: string | null;
  domains: string[];
  outcome: Outcome | null;
  decision_date: string | null;
  filing_date: string | null;
  created_at: string | null;
  cluster_tag: string[] | null;
}

export interface FilingRow {
  id: string;
  provider: string;
  case_number: string;
  filing_date: string | null;
  domains: string[];
  complainant: string | null;
  status: 'FILED' | 'PENDING' | 'DECIDED';
  filing_url: string | null;
  scraped_at: string | null;
}

const CASE_COLS =
  'id, provider, case_number, decision_url, complainant_name, respondent_name, domains, outcome, decision_date, filing_date, created_at, cluster_tag';
const FILING_COLS =
  'id, provider, case_number, filing_date, domains, complainant, status, filing_url, scraped_at';

function normCase(r: Record<string, unknown>): CaseRow {
  return {
    id: String(r.id),
    provider: String(r.provider ?? 'WIPO'),
    case_number: String(r.case_number),
    decision_url: (r.decision_url as string) ?? null,
    complainant_name: (r.complainant_name as string) ?? null,
    respondent_name: (r.respondent_name as string) ?? null,
    domains: Array.isArray(r.domains) ? (r.domains as unknown[]).map(String) : [],
    outcome: (r.outcome as Outcome) ?? null,
    decision_date: (r.decision_date as string) ?? null,
    filing_date: (r.filing_date as string) ?? null,
    created_at: (r.created_at as string) ?? null,
    cluster_tag: Array.isArray(r.cluster_tag) ? (r.cluster_tag as string[]) : null,
  };
}

function normFiling(r: Record<string, unknown>): FilingRow {
  return {
    id: String(r.id),
    provider: String(r.provider ?? 'WIPO'),
    case_number: String(r.case_number),
    filing_date: (r.filing_date as string) ?? null,
    domains: Array.isArray(r.domains) ? (r.domains as unknown[]).map(String) : [],
    complainant: (r.complainant as string) ?? null,
    status: ((r.status as string) ?? 'FILED') as FilingRow['status'],
    filing_url: (r.filing_url as string) ?? null,
    scraped_at: (r.scraped_at as string) ?? null,
  };
}

/** Keep only characters that are safe inside a PostgREST or() filter. */
export function sanitizeQuery(q: string | undefined | null): string {
  return (q ?? '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} .&'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

export const CASE_NUMBER_RE = /^D[A-Z]*\d{4}-\d{4}$/;

// ---------------------------------------------------------------------------
// Single case
// ---------------------------------------------------------------------------

export type CaseLookup =
  | { kind: 'decided'; data: CaseRow; filing: FilingRow | null }
  | { kind: 'filing'; data: FilingRow }
  | null;

export async function getCaseByNumber(caseNumber: string): Promise<CaseLookup> {
  const sb = getPublicClient();
  if (!sb) return null;
  const decoded = decodeURIComponent(caseNumber).trim().toUpperCase();
  if (!CASE_NUMBER_RE.test(decoded) && !/^FA\d{5,}$/.test(decoded)) return null;

  try {
    const [{ data: c }, { data: f }] = await Promise.all([
      sb.from('cases').select(CASE_COLS).eq('case_number', decoded).eq('is_published', true).limit(1).maybeSingle(),
      sb.from('live_filings').select(FILING_COLS).eq('case_number', decoded).limit(1).maybeSingle(),
    ]);
    if (c) return { kind: 'decided', data: normCase(c), filing: f ? normFiling(f) : null };
    if (f) return { kind: 'filing', data: normFiling(f) };
  } catch (e) {
    console.error('getCaseByNumber failed', e);
  }
  return null;
}

export async function casesByComplainant(name: string, excludeCase: string, limit = 8): Promise<{ rows: CaseRow[]; total: number }> {
  const sb = getPublicClient();
  if (!sb || !name) return { rows: [], total: 0 };
  try {
    const { data, count } = await sb
      .from('cases')
      .select(CASE_COLS, { count: 'exact' })
      .eq('is_published', true)
      .eq('complainant_name', name)
      .neq('case_number', excludeCase)
      .order('case_number', { ascending: false })
      .limit(limit);
    return { rows: (data ?? []).map(normCase), total: count ?? 0 };
  } catch {
    return { rows: [], total: 0 };
  }
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export interface CaseSearch {
  q?: string;
  outcome?: string;
  year?: string;
  provider?: string;
  page?: number;
  pageSize?: number;
}

const OUTCOMES = new Set(['TRANSFER', 'DENY', 'RDNH', 'SUSPEND', 'WITHDRAWN', 'OTHER']);

export async function searchCases(params: CaseSearch): Promise<{ rows: CaseRow[]; total: number }> {
  const sb = getPublicClient();
  if (!sb) return { rows: [], total: 0 };
  const pageSize = Math.min(Math.max(params.pageSize ?? 30, 1), 100);
  const page = Math.max(params.page ?? 1, 1);
  const from = (page - 1) * pageSize;

  try {
    let query = sb
      .from('cases')
      .select(CASE_COLS, { count: 'exact' })
      .eq('is_published', true)
      .order('case_number', { ascending: false })
      .range(from, from + pageSize - 1);

    if (params.outcome && OUTCOMES.has(params.outcome)) query = query.eq('outcome', params.outcome);
    if (params.provider && /^[A-Z]{2,8}$/.test(params.provider)) query = query.eq('provider', params.provider);
    if (params.year && /^\d{4}$/.test(params.year)) query = query.like('case_number', `D${params.year}-%`);

    const q = sanitizeQuery(params.q);
    if (q) {
      const upper = q.toUpperCase();
      if (CASE_NUMBER_RE.test(upper)) {
        query = query.eq('case_number', upper);
      } else {
        const lower = q.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
        const ors = [
          `complainant_name.ilike.*${q}*`,
          `respondent_name.ilike.*${q}*`,
        ];
        if (!q.includes(' ')) {
          if (lower.includes('.')) ors.push(`domains.cs.{${lower}}`);
          else ors.push(`domains.cs.{${lower}.com}`);
        }
        query = query.or(ors.join(','));
      }
    }

    const { data, count } = await query;
    return { rows: (data ?? []).map(normCase), total: count ?? 0 };
  } catch (e) {
    console.error('searchCases failed', e);
    return { rows: [], total: 0 };
  }
}

export async function latestDecisions(limit = 12): Promise<CaseRow[]> {
  const sb = getPublicClient();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from('cases')
      .select(CASE_COLS)
      .eq('is_published', true)
      .neq('outcome', 'WITHDRAWN')
      .order('case_number', { ascending: false })
      .limit(limit);
    return (data ?? []).map(normCase);
  } catch {
    return [];
  }
}

export async function latestFilings(opts: { limit?: number; q?: string; onlyOpen?: boolean } = {}): Promise<FilingRow[]> {
  const sb = getPublicClient();
  if (!sb) return [];
  try {
    let query = sb
      .from('live_filings')
      .select(FILING_COLS)
      .order('case_number', { ascending: false })
      .limit(Math.min(opts.limit ?? 50, 200));
    if (opts.onlyOpen !== false) query = query.in('status', ['FILED', 'PENDING']);
    const q = sanitizeQuery(opts.q);
    if (q) {
      const lower = q.toLowerCase();
      const ors = [`complainant.ilike.*${q}*`];
      if (!q.includes(' ')) ors.push(lower.includes('.') ? `domains.cs.{${lower}}` : `domains.cs.{${lower}.com}`);
      query = query.or(ors.join(','));
    }
    const { data } = await query;
    return (data ?? []).map(normFiling);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

export interface OutcomeCounts {
  total: number;
  TRANSFER: number;
  DENY: number;
  RDNH: number;
  SUSPEND: number;
  WITHDRAWN: number;
  OTHER: number;
  openFilings: number;
}

export async function getOutcomeCounts(year?: string): Promise<OutcomeCounts> {
  const empty: OutcomeCounts = { total: 0, TRANSFER: 0, DENY: 0, RDNH: 0, SUSPEND: 0, WITHDRAWN: 0, OTHER: 0, openFilings: 0 };
  const sb = getPublicClient();
  if (!sb) return empty;

  const base = () => {
    let q = sb.from('cases').select('id', { count: 'exact', head: true }).eq('is_published', true);
    if (year) q = q.like('case_number', `D${year}-%`);
    return q;
  };

  try {
    const keys = ['TRANSFER', 'DENY', 'RDNH', 'SUSPEND', 'WITHDRAWN', 'OTHER'] as const;
    const [total, ...rest] = await Promise.all([
      base(),
      ...keys.map((k) => base().eq('outcome', k)),
    ]);
    const open = await sb
      .from('live_filings')
      .select('id', { count: 'exact', head: true })
      .in('status', ['FILED', 'PENDING']);
    const out = { ...empty, total: total.count ?? 0, openFilings: open.count ?? 0 };
    keys.forEach((k, i) => {
      out[k] = rest[i]?.count ?? 0;
    });
    return out;
  } catch {
    return empty;
  }
}

/** Share of decided cases (terminations excluded) where the complainant prevailed. */
export function complainantWinRate(c: OutcomeCounts): number | null {
  const wins = c.TRANSFER + c.OTHER + c.SUSPEND;
  const decided = wins + c.DENY + c.RDNH;
  if (decided === 0) return null;
  return wins / decided;
}

// ---------------------------------------------------------------------------
// Bulk (stats + sitemap)
// ---------------------------------------------------------------------------

export interface SlimCase {
  case_number: string;
  outcome: Outcome | null;
  domains: string[];
  complainant_name: string | null;
}

async function pageThrough<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: unknown[] | null }>,
  max = 60000,
): Promise<T[]> {
  const out: T[] = [];
  const size = 1000;
  for (let from = 0; from < max; from += size) {
    const { data } = await fetchPage(from, from + size - 1);
    if (!data || data.length === 0) break;
    out.push(...(data as T[]));
    if (data.length < size) break;
  }
  return out;
}

export async function getSlimCases(): Promise<SlimCase[]> {
  const sb = getPublicClient();
  if (!sb) return [];
  try {
    const rows = await pageThrough<Record<string, unknown>>((from, to) =>
      sb
        .from('cases')
        .select('case_number, outcome, domains, complainant_name')
        .eq('is_published', true)
        .order('case_number', { ascending: true })
        .range(from, to),
    );
    return rows.map((r) => ({
      case_number: String(r.case_number),
      outcome: (r.outcome as Outcome) ?? null,
      domains: Array.isArray(r.domains) ? (r.domains as unknown[]).map(String) : [],
      complainant_name: (r.complainant_name as string) ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getAllFilingNumbers(): Promise<string[]> {
  const sb = getPublicClient();
  if (!sb) return [];
  try {
    const rows = await pageThrough<{ case_number: string }>((from, to) =>
      sb.from('live_filings').select('case_number').in('status', ['FILED', 'PENDING']).order('case_number').range(from, to),
    );
    return rows.map((r) => r.case_number);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Daily brief
// ---------------------------------------------------------------------------

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getBriefIndex(days = 14): Promise<Array<{ day: string; decisions: number; filings: number }>> {
  const sb = getPublicClient();
  if (!sb) return [];
  const today = new Date();
  const list: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    list.push(isoDay(d));
  }
  try {
    return await Promise.all(
      list.map(async (day) => {
        const next = isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + 86400000));
        const [dec, fil] = await Promise.all([
          sb
            .from('cases')
            .select('id', { count: 'exact', head: true })
            .eq('is_published', true)
            .gte('created_at', `${day}T00:00:00Z`)
            .lt('created_at', `${next}T00:00:00Z`),
          sb.from('live_filings').select('id', { count: 'exact', head: true }).eq('filing_date', day),
        ]);
        return { day, decisions: dec.count ?? 0, filings: fil.count ?? 0 };
      }),
    );
  } catch {
    return [];
  }
}

export async function getBriefDay(day: string): Promise<{ decisions: CaseRow[]; decisionTotal: number; filings: FilingRow[] }> {
  const sb = getPublicClient();
  const empty = { decisions: [], decisionTotal: 0, filings: [] };
  if (!sb || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return empty;
  const next = isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + 86400000));
  try {
    const [dec, fil] = await Promise.all([
      sb
        .from('cases')
        .select(CASE_COLS, { count: 'exact' })
        .eq('is_published', true)
        .gte('created_at', `${day}T00:00:00Z`)
        .lt('created_at', `${next}T00:00:00Z`)
        .order('case_number', { ascending: false })
        .limit(120),
      sb.from('live_filings').select(FILING_COLS).eq('filing_date', day).order('case_number', { ascending: false }).limit(200),
    ]);
    return {
      decisions: (dec.data ?? []).map(normCase),
      decisionTotal: dec.count ?? 0,
      filings: (fil.data ?? []).map(normFiling),
    };
  } catch {
    return empty;
  }
}
