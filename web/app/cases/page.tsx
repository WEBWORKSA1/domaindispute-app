import Link from 'next/link';
import type { Metadata } from 'next';
import { searchCases, sanitizeQuery } from '@/lib/data/cases';
import { CaseList, EmptyState, HelpCta, PageHeader } from '@/components/ui';
import { SearchBox } from '@/components/search-box';
import { AdSlot } from '@/components/ad-slot';
import { cn, num, outcomeLabel } from '@/lib/utils';

export const revalidate = 900;

type SP = { q?: string; outcome?: string; year?: string; page?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const p = await searchParams;
  const q = sanitizeQuery(p.q);
  const filtered = Boolean(q || p.outcome || p.year || p.page);
  return {
    title: q ? `UDRP decisions matching "${q}"` : 'UDRP case library: search every WIPO decision',
    description:
      'Search and filter thousands of UDRP domain name decisions by domain, brand, party, outcome and year. Updated automatically every day.',
    alternates: { canonical: '/cases' },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

// No RDNH chip: WIPO's public list marks RDNH cases as plain denials, so the filter would always be empty.
const OUTCOME_FILTERS = ['TRANSFER', 'DENY', 'OTHER', 'WITHDRAWN'];
const YEARS = ['2026', '2025', '2024'];
const PAGE_SIZE = 30;

function href(base: SP, patch: Partial<SP>) {
  const merged = { ...base, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, String(v));
  const s = qs.toString();
  return s ? `/cases?${s}` : '/cases';
}

export default async function CasesIndexPage({ searchParams }: { searchParams: Promise<SP> }) {
  const p = await searchParams;
  const page = Math.max(1, parseInt(p.page ?? '1', 10) || 1);
  const q = sanitizeQuery(p.q);
  const { rows, total } = await searchCases({ q, outcome: p.outcome, year: p.year, page, pageSize: PAGE_SIZE });
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base: SP = { q: q || undefined, outcome: p.outcome, year: p.year };

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/cases', label: 'Case library' }]}
        title="UDRP case library"
        lede="Every WIPO gTLD decision we have indexed, newest first. Search by domain, brand, complainant, respondent or case number."
      >
        <SearchBox defaultValue={q} className="mt-6 max-w-2xl" hidden={{ outcome: p.outcome, year: p.year }} />
      </PageHeader>

      <section className="border-b border-bone-2">
        <div className="wrap flex flex-wrap items-center gap-2 py-4 text-sm">
          <span className="mr-1 font-semibold text-ink">Outcome</span>
          <Chip href={href(base, { outcome: undefined, page: undefined })} active={!p.outcome} label="All" />
          {OUTCOME_FILTERS.map((o) => (
            <Chip key={o} href={href(base, { outcome: o, page: undefined })} active={p.outcome === o} label={outcomeLabel(o)} />
          ))}
          <span className="ml-3 mr-1 font-semibold text-ink">Year</span>
          <Chip href={href(base, { year: undefined, page: undefined })} active={!p.year} label="All" />
          {YEARS.map((y) => (
            <Chip key={y} href={href(base, { year: y, page: undefined })} active={p.year === y} label={y} />
          ))}
        </div>
      </section>

      <section className="wrap py-8">
        <p className="mb-4 text-[15px] text-muted" aria-live="polite">
          {num(total)} {total === 1 ? 'decision' : 'decisions'}
          {q ? ` matching "${q}"` : ''}
          {pages > 1 ? ` - page ${page} of ${num(pages)}` : ''}
        </p>

        {rows.length === 0 ? (
          <EmptyState
            title="No decisions match"
            body={q ? 'Try the brand name alone, the full domain with its extension (example.com), or a case number like D2025-1234.' : 'Clear the filters to see every decision.'}
          >
            <Link href={`/live${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="btn-outline">
              Search pending filings instead
            </Link>
          </EmptyState>
        ) : (
          <CaseList rows={rows} showRespondent />
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link href={href(base, { page: String(page - 1) })} className="btn-outline px-4 py-2" rel="prev">
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted">
              Page {page} of {num(pages)}
            </span>
            {page < pages ? (
              <Link href={href(base, { page: String(page + 1) })} className="btn-outline px-4 py-2" rel="next">
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>

      <AdSlot className="wrap mb-10" />

      <section className="wrap pb-14">
        <HelpCta
          title="Your domain is in a case like these?"
          body="Get a free, confidential review of your situation and a plain-English explanation of your options."
        />
      </section>
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'rounded-full border px-3 py-1.5',
        active ? 'border-ink bg-ink text-white' : 'border-bone-2 bg-paper text-ink-soft hover:border-ink/40',
      )}
    >
      {label}
    </Link>
  );
}
