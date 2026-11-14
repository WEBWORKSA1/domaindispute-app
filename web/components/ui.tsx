import Link from 'next/link';
import type { CaseRow, FilingRow } from '@/lib/data/cases';
import { cn, formatDate, outcomeColor, outcomeLabel } from '@/lib/utils';
import { deadlinePhase, responseDeadline } from '@/lib/analysis';
import { JsonLd } from '@/components/json-ld';
import { SITE } from '@/lib/site';

export function PageHeader({
  kicker,
  title,
  lede,
  children,
  crumbs,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  crumbs?: Array<{ href: string; label: string }>;
}) {
  return (
    <section className="border-b border-bone-2 bg-bone/60">
      <div className="wrap py-10 sm:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        {kicker && <p className="eyebrow mb-3">{kicker}</p>}
        <h1 className="h-display max-w-4xl text-display-md text-ink text-balance">{title}</h1>
        {lede && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{lede}</p>}
        {children}
      </div>
    </section>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ href: string; label: string }> }) {
  const all = [{ href: '/', label: 'Home' }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-ink hover:underline">
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            item: `${SITE.url}${c.href === '/' ? '' : c.href}`,
          })),
        }}
      />
    </>
  );
}

export function OutcomeBadge({ outcome, className }: { outcome: string | null | undefined; className?: string }) {
  return <span className={cn('pill whitespace-nowrap', outcomeColor(outcome), className)}>{outcomeLabel(outcome)}</span>;
}

export function DomainList({ domains, max = 1 }: { domains: string[]; max?: number }) {
  if (domains.length === 0) return <span className="text-muted">-</span>;
  const shown = domains.slice(0, max);
  return (
    <span className="break-all">
      {shown.join(', ')}
      {domains.length > max && <span className="font-normal text-muted"> +{domains.length - max} more</span>}
    </span>
  );
}

/** Ledger-style list of decided cases. */
export function CaseList({ rows, showRespondent = false }: { rows: CaseRow[]; showRespondent?: boolean }) {
  if (rows.length === 0) return null;
  return (
    <ul className="divide-y divide-bone-2 border-y border-bone-2">
      {rows.map((c) => (
        <li key={c.id}>
          <Link
            href={`/cases/${c.case_number}`}
            className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-1 py-3.5 hover:bg-bone/60 sm:grid-cols-[120px_1fr_1fr_auto]"
          >
            <span className="docket-no order-2 text-sm text-gold sm:order-none">{c.case_number}</span>
            <span className="col-span-1 font-semibold text-ink sm:col-span-1">
              <DomainList domains={c.domains} />
            </span>
            <span className="order-3 col-span-2 truncate text-sm text-muted sm:order-none sm:col-span-1">
              {c.complainant_name ?? '-'}
              {showRespondent && c.respondent_name && c.respondent_name !== '-' ? ` v. ${c.respondent_name}` : ''}
            </span>
            <span className="row-start-1 justify-self-end sm:row-auto">
              <OutcomeBadge outcome={c.outcome} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Docket of filed (pending) cases with estimated response deadlines. */
export function FilingList({ rows, showDeadline = true }: { rows: FilingRow[]; showDeadline?: boolean }) {
  if (rows.length === 0) return null;
  return (
    <ul className="divide-y divide-bone-2 border-y border-bone-2">
      {rows.map((f) => {
        const dl = responseDeadline(f.filing_date);
        const phase = dl ? deadlinePhase(dl) : null;
        return (
          <li key={f.id}>
            <Link
              href={`/cases/${f.case_number}`}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-1 py-3.5 hover:bg-bone/60 sm:grid-cols-[120px_1fr_1fr_150px]"
            >
              <span className="docket-no order-2 text-sm text-gold sm:order-none">{f.case_number}</span>
              <span className="font-semibold text-ink">
                <DomainList domains={f.domains} />
              </span>
              <span className="order-3 col-span-2 truncate text-sm text-muted sm:order-none sm:col-span-1">{f.complainant ?? 'Complainant not yet listed'}</span>
              <span className="row-start-1 justify-self-end text-right text-xs leading-tight text-muted sm:row-auto">
                {f.filing_date ? (
                  <>
                    <span className="block">Filed {formatDate(f.filing_date)}</span>
                    {showDeadline && dl && phase === 'open' && <span className="block font-semibold text-ink">Reply by ~{formatDate(dl.due)}</span>}
                    {showDeadline && dl && phase === 'extension' && <span className="block font-semibold text-ink">Extended reply by ~{formatDate(dl.extended)}</span>}
                    {showDeadline && phase === 'closed' && <span className="block">Awaiting decision</span>}
                  </>
                ) : (
                  <span className="pill bg-legal-pad text-[#7a5410]">Compliance review</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Inline lead-generation block used across content pages. */
export function HelpCta({
  title = 'Facing a domain dispute?',
  body = 'Tell us what happened and get a free, confidential case review. We reply by email, usually within one business day.',
  href = '/get-help',
  label = 'Get a free case review',
  tone = 'dark',
}: {
  title?: string;
  body?: string;
  href?: string;
  label?: string;
  tone?: 'dark' | 'light';
}) {
  const dark = tone === 'dark';
  return (
    <aside
      className={cn(
        'rounded-xl p-6 sm:p-8',
        dark ? 'bg-ink text-white' : 'border border-bone-2 bg-bone',
      )}
    >
      <h2 className={cn('font-serif text-2xl font-semibold', dark ? 'text-white' : 'text-ink')}>{title}</h2>
      <p className={cn('mt-2 max-w-2xl text-[15px] leading-relaxed', dark ? 'text-white/80' : 'text-ink-soft')}>{body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={href} className="btn-primary">
          {label}
        </Link>
        <Link href="/start" className={dark ? 'btn-light' : 'btn-outline'}>
          Run the free pre-check
        </Link>
      </div>
    </aside>
  );
}

export function SectionHeading({ title, href, linkLabel, children }: { title: string; href?: string; linkLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-serif text-[28px] font-semibold leading-tight text-ink">{title}</h2>
        {children && <div className="mt-1 text-[15px] text-muted">{children}</div>}
      </div>
      {href && (
        <Link href={href} className="link text-[15px]">
          {linkLabel ?? 'See all'}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-bone-2 px-6 py-12 text-center">
      <p className="font-serif text-xl font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-muted">{body}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
