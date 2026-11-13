import Link from 'next/link';
import type { Metadata } from 'next';
import { getSlimCases, type SlimCase } from '@/lib/data/cases';
import { tldOf } from '@/lib/analysis';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';
import { num, pct } from '@/lib/utils';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'UDRP statistics: outcomes, extensions and top complainants',
  description:
    'Live statistics computed from every UDRP decision in our index: complainant success rate, denials, reverse hijacking findings, top domain extensions and most active complainants.',
  alternates: { canonical: '/stats' },
};

type Bucket = 'win' | 'deny' | 'term';
const SERIES: Array<{ key: Bucket; label: string; color: string; text: string }> = [
  { key: 'win', label: 'Transferred or cancelled', color: '#2a78d6', text: '#ffffff' },
  { key: 'deny', label: 'Denied (incl. RDNH)', color: '#eb6834', text: '#12233b' },
  { key: 'term', label: 'Terminated', color: '#1baf7a', text: '#12233b' },
];

function bucket(o: SlimCase['outcome']): Bucket | null {
  if (o === 'TRANSFER' || o === 'OTHER' || o === 'SUSPEND') return 'win';
  if (o === 'DENY' || o === 'RDNH') return 'deny';
  if (o === 'WITHDRAWN') return 'term';
  return null;
}

function compute(rows: SlimCase[]) {
  const years = new Map<string, Record<Bucket, number>>();
  const tlds = new Map<string, number>();
  const complainants = new Map<string, { name: string; n: number; wins: number }>();
  let multi = 0;
  let rdnh = 0;
  const totals: Record<Bucket, number> = { win: 0, deny: 0, term: 0 };

  for (const r of rows) {
    const y = r.case_number.slice(1, 5);
    const b = bucket(r.outcome);
    if (r.outcome === 'RDNH') rdnh++;
    if (b) {
      totals[b]++;
      const yr = years.get(y) ?? { win: 0, deny: 0, term: 0 };
      yr[b]++;
      years.set(y, yr);
    }
    if (r.domains.length > 1) multi++;
    const t = r.domains[0] ? tldOf(r.domains[0]) : '';
    if (t) tlds.set(t, (tlds.get(t) ?? 0) + 1);
    if (r.complainant_name) {
      const key = r.complainant_name.trim().toLowerCase();
      const c = complainants.get(key) ?? { name: r.complainant_name.trim(), n: 0, wins: 0 };
      c.n++;
      if (b === 'win') c.wins++;
      complainants.set(key, c);
    }
  }

  const decided = totals.win + totals.deny;
  return {
    total: rows.length,
    totals,
    rdnh,
    multi,
    winRate: decided ? totals.win / decided : null,
    years: [...years.entries()].sort((a, b) => b[0].localeCompare(a[0])),
    tlds: [...tlds.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
    tldCount: tlds.size,
    complainants: [...complainants.values()].sort((a, b) => b.n - a.n).slice(0, 15),
  };
}

export default async function StatsPage() {
  const rows = await getSlimCases();
  const s = compute(rows);
  const tldMax = s.tlds[0]?.[1] ?? 1;
  const compMax = s.complainants[0]?.n ?? 1;

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/stats', label: 'Statistics' }]}
        title="UDRP statistics"
        lede={`Computed from all ${num(s.total)} WIPO gTLD decisions in our index and recalculated automatically as new decisions arrive.`}
      />

      <section className="wrap py-10">
        <dl className="grid grid-cols-2 gap-6 border-b border-bone-2 pb-10 md:grid-cols-4">
          <Stat value={pct(s.winRate)} label="Complainant success rate (decided cases)" />
          <Stat value={num(s.totals.deny)} label="Complaints denied" />
          <Stat value={num(s.rdnh)} label="Reverse hijacking findings" />
          <Stat value={pct(s.total ? s.totals.term / s.total : null)} label="Cases terminated without decision" />
        </dl>
      </section>

      {/* Outcomes by year: 100% stacked bars */}
      <section className="wrap pb-12" aria-labelledby="by-year">
        <h2 id="by-year" className="font-serif text-2xl font-semibold">Outcomes by year</h2>
        <p className="mt-1 text-[15px] text-muted">Share of each year&apos;s indexed cases by result. Hover or focus a segment for exact counts.</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Legend">
          {SERIES.map((x) => (
            <li key={x.key} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: x.color }} aria-hidden="true" />
              {x.label}
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-4">
          {s.years.map(([year, b]) => {
            const total = b.win + b.deny + b.term;
            return (
              <div key={year} className="grid grid-cols-[48px_1fr] items-center gap-3">
                <span className="font-mono text-sm tabular-nums">{year}</span>
                <div className="flex h-8 gap-[2px] overflow-hidden rounded" role="img" aria-label={`${year}: ${b.win} transferred or cancelled, ${b.deny} denied, ${b.term} terminated`}>
                  {SERIES.map((x) => {
                    const v = b[x.key];
                    const w = total ? (v / total) * 100 : 0;
                    if (w === 0) return null;
                    return (
                      <div
                        key={x.key}
                        tabIndex={0}
                        className="group relative flex items-center justify-start px-2 text-xs font-semibold outline-none first:rounded-l last:rounded-r focus-visible:ring-2 focus-visible:ring-ink"
                        style={{ width: `${w}%`, background: x.color, color: x.text }}
                      >
                        {w > 9 && <span>{Math.round(w)}%</span>}
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs font-normal text-white group-hover:block group-focus:block">
                          {x.label}: {num(v)} ({w.toFixed(1)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer font-medium text-gold">Show as table</summary>
          <table className="mt-3 w-full max-w-xl text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th className="py-1.5 pr-4">Year</th>
                {SERIES.map((x) => (
                  <th key={x.key} className="py-1.5 pr-4">{x.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.years.map(([year, b]) => (
                <tr key={year} className="border-b border-bone-2">
                  <td className="py-1.5 pr-4 font-mono">{year}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{num(b.win)}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{num(b.deny)}</td>
                  <td className="py-1.5 pr-4 tabular-nums">{num(b.term)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </section>

      <AdSlot className="wrap mb-12" />

      <section className="border-y border-bone-2 bg-bone/50">
        <div className="wrap grid gap-12 py-12 lg:grid-cols-2">
          <div aria-labelledby="tlds">
            <h2 id="tlds" className="font-serif text-2xl font-semibold">Most disputed extensions</h2>
            <p className="mt-1 text-[15px] text-muted">
              By first disputed domain in each case. {num(s.tldCount)} different extensions appear; {num(s.multi)} cases involve more than one domain.
            </p>
            <BarList items={s.tlds.map(([t, n]) => ({ label: `.${t}`, value: n, max: tldMax, total: s.total }))} />
          </div>
          <div aria-labelledby="complainants">
            <h2 id="complainants" className="font-serif text-2xl font-semibold">Most active complainants</h2>
            <p className="mt-1 text-[15px] text-muted">Number of indexed cases filed under the same complainant name.</p>
            <BarList
              items={s.complainants.map((c) => ({
                label: c.name,
                value: c.n,
                max: compMax,
                href: `/cases?q=${encodeURIComponent(c.name)}`,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="wrap py-12">
        <h2 className="font-serif text-2xl font-semibold">How these numbers are calculated</h2>
        <div className="prose-dd mt-3">
          <p>
            We index the WIPO decisions list for gTLD cases (prefix D) and classify each case by the result the provider publishes. &ldquo;Success rate&rdquo; counts transfers and cancellations against all decided cases, excluding terminations, which mostly reflect settlements. Statistics refresh every six hours. Other providers and ccTLD cases are not yet included, so figures describe WIPO gTLD cases only.
          </p>
          <p>
            Want the raw data for research? See <Link href="/advertise">data partnerships</Link>.
          </p>
        </div>
        <div className="mt-10">
          <HelpCta tone="light" />
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-[34px] font-semibold leading-none tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function BarList({ items }: { items: Array<{ label: string; value: number; max: number; total?: number; href?: string }> }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((it) => {
        const w = Math.max(2, (it.value / it.max) * 100);
        const content = (
          <>
            <span className="flex justify-between gap-3 text-sm">
              <span className="truncate font-medium text-ink">{it.label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {num(it.value)}
                {it.total ? ` (${((it.value / it.total) * 100).toFixed(1)}%)` : ''}
              </span>
            </span>
            <span className="mt-1 block h-2 rounded-r bg-bone-2">
              <span className="block h-2 rounded-r" style={{ width: `${w}%`, background: '#2a78d6' }} />
            </span>
          </>
        );
        return (
          <li key={it.label}>
            {it.href ? (
              <Link href={it.href} className="block hover:opacity-80">
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  );
}
