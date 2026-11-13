import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { casesByComplainant, getCaseByNumber, type CaseLookup } from '@/lib/data/cases';
import { domainAnatomy, outcomeExplainer, patternSentence, responseDeadline } from '@/lib/analysis';
import { Breadcrumbs, CaseList, DomainList, HelpCta, OutcomeBadge } from '@/components/ui';
import { JsonLd } from '@/components/json-ld';
import { AdSlot } from '@/components/ad-slot';
import { formatDate, num, outcomeLabel } from '@/lib/utils';
import { SITE } from '@/lib/site';

// Rendered on first request, then cached and refreshed every 6 hours.
export const revalidate = 21600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ caseNumber: string }>;
}

interface View {
  caseNumber: string;
  provider: string;
  domains: string[];
  complainant: string | null;
  respondent: string | null;
  outcome: string | null;
  pending: boolean;
  filingStatus: string | null;
  commenced: string | null;
  indexed: string | null;
  decisionUrl: string | null;
  caseUrl: string | null;
}

function toView(r: NonNullable<CaseLookup>): View {
  if (r.kind === 'decided') {
    const c = r.data;
    return {
      caseNumber: c.case_number,
      provider: c.provider,
      domains: c.domains,
      complainant: c.complainant_name,
      respondent: c.respondent_name && c.respondent_name !== '-' ? c.respondent_name : null,
      outcome: c.outcome,
      pending: false,
      filingStatus: null,
      commenced: r.filing?.filing_date ?? c.filing_date,
      indexed: c.created_at,
      decisionUrl: c.outcome && c.outcome !== 'WITHDRAWN' ? c.decision_url : null,
      caseUrl: r.filing?.filing_url ?? null,
    };
  }
  const f = r.data;
  return {
    caseNumber: f.case_number,
    provider: f.provider,
    domains: f.domains,
    complainant: f.complainant,
    respondent: null,
    outcome: f.status === 'DECIDED' ? 'DECIDED' : null,
    pending: f.status !== 'DECIDED',
    filingStatus: f.status,
    commenced: f.filing_date,
    indexed: f.scraped_at,
    decisionUrl: null,
    caseUrl: f.filing_url,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { caseNumber } = await params;
  const r = await getCaseByNumber(caseNumber);
  if (!r) return { title: 'Case not found', robots: { index: false } };
  const v = toView(r);
  const domain = v.domains[0] ?? v.caseNumber;
  const status = v.pending ? 'pending' : outcomeLabel(v.outcome).toLowerCase();
  return {
    title: `${v.caseNumber}: ${domain} (${status})`,
    description: `${v.provider} UDRP case ${v.caseNumber} over ${domain}${v.domains.length > 1 ? ` and ${v.domains.length - 1} more` : ''}. Complainant: ${v.complainant ?? 'not listed'}${v.respondent ? `. Respondent: ${v.respondent}` : ''}. Status: ${status}.`,
    alternates: { canonical: `/cases/${v.caseNumber}` },
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseNumber } = await params;
  const r = await getCaseByNumber(caseNumber);
  if (!r) notFound();
  const v = toView(r);

  const primary = v.domains[0] ?? v.caseNumber;
  const anatomy = v.domains.slice(0, 6).map((d) => domainAnatomy(d, v.complainant));
  const explainer = outcomeExplainer(v.pending ? null : v.outcome);
  const deadline = v.pending ? responseDeadline(v.commenced) : null;
  const history = v.complainant ? await casesByComplainant(v.complainant, v.caseNumber, 6) : { rows: [], total: 0 };
  const helpHref = `/get-help?situation=${v.pending ? 'respondent' : 'other'}&domain=${encodeURIComponent(primary)}&case=${v.caseNumber}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${v.caseNumber}: ${primary}`,
          url: `${SITE.url}/cases/${v.caseNumber}`,
          description: `Domain name dispute ${v.caseNumber} over ${primary}.`,
          isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
          about: v.domains.map((d) => ({ '@type': 'Thing', name: d })),
        }}
      />

      <section className="border-b border-bone-2 bg-bone/50">
        <div className="wrap py-10">
          <Breadcrumbs
            items={[
              v.pending ? { href: '/live', label: 'Live docket' } : { href: '/cases', label: 'Case library' },
              { href: `/cases/${v.caseNumber}`, label: v.caseNumber },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="docket-no text-[15px] font-medium text-gold">
              {v.provider} {v.caseNumber}
            </span>
            {v.pending ? <OutcomeBadge outcome={null} /> : <OutcomeBadge outcome={v.outcome} />}
          </div>
          <h1 className="h-display mt-3 break-all text-display-md text-ink">{primary}</h1>
          {v.domains.length > 1 && <p className="mt-2 text-[15px] text-muted">and {v.domains.length - 1} more disputed domain{v.domains.length > 2 ? 's' : ''}</p>}
          <p className="mt-4 max-w-3xl text-lg text-ink-soft">
            {v.complainant ?? 'Complainant not yet listed'}
            {v.respondent ? <span className="text-muted"> v. {v.respondent}</span> : null}
          </p>
        </div>
      </section>

      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          {v.pending && (
            <div className="mb-8 rounded-lg border border-amber/40 bg-legal-pad p-5">
              <h2 className="font-serif text-xl font-semibold">This complaint is pending</h2>
              {deadline ? (
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  The proceeding commenced on <strong>{formatDate(v.commenced)}</strong>. Under UDRP Rules 5(a) a response is due within 20 days, so around{' '}
                  <strong>{formatDate(deadline.due)}</strong>, or <strong>{formatDate(deadline.extended)}</strong> with the automatic four-day extension. Confirm the exact date in the provider&apos;s notice.
                </p>
              ) : (
                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                  The provider is still reviewing the complaint for formal compliance. The 20-day response period starts once the proceeding formally commences.
                </p>
              )}
              <Link href={helpHref} className="btn-primary mt-4">
                Is this your domain? Get a free case review
              </Link>
            </div>
          )}

          <section aria-labelledby="facts">
            <h2 id="facts" className="font-serif text-2xl font-semibold">Case record</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 border-t border-bone-2 pt-4 sm:grid-cols-2">
              <Fact label="Provider" value={v.provider} />
              <Fact label="Case number" value={<span className="docket-no">{v.caseNumber}</span>} />
              <Fact label="Complainant" value={v.complainant ?? '-'} />
              <Fact label="Respondent" value={v.respondent ?? (v.pending ? 'Published with the decision' : '-')} />
              <Fact label="Status" value={v.pending ? 'Pending' : outcomeLabel(v.outcome)} />
              <Fact label="Commenced" value={formatDate(v.commenced)} />
              <Fact label={`Disputed domain${v.domains.length > 1 ? 's' : ''} (${v.domains.length})`} value={<DomainList domains={v.domains} max={20} />} wide />
            </dl>
          </section>

          <section className="mt-10" aria-labelledby="outcome">
            <h2 id="outcome" className="font-serif text-2xl font-semibold">{explainer.title}</h2>
            <p className="mt-3 max-w-prose text-[17px] leading-relaxed text-ink-soft">{explainer.body}</p>
          </section>

          {anatomy.length > 0 && (
            <section className="mt-10" aria-labelledby="anatomy">
              <h2 id="anatomy" className="font-serif text-2xl font-semibold">Domain analysis</h2>
              <p className="mt-3 max-w-prose text-[17px] leading-relaxed text-ink-soft">{anatomy[0] ? patternSentence(anatomy[0].pattern) : null}</p>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-[15px]">
                  <caption className="sr-only">Structure of each disputed domain</caption>
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="py-2 pr-4 font-semibold">Domain</th>
                      <th className="py-2 pr-4 font-semibold">Extension</th>
                      <th className="py-2 pr-4 font-semibold">Length</th>
                      <th className="py-2 pr-4 font-semibold">Relation to complainant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anatomy.map((a) => (
                      <tr key={a.domain} className="border-b border-bone-2 align-top">
                        <td className="break-all py-2.5 pr-4 font-medium">{a.domain}</td>
                        <td className="py-2.5 pr-4">.{a.tld} <span className="text-muted">({a.tldKind})</span></td>
                        <td className="py-2.5 pr-4 tabular-nums">{a.length}{a.hyphens ? `, ${a.hyphens} hyphen${a.hyphens > 1 ? 's' : ''}` : ''}</td>
                        <td className="py-2.5 pr-4">
                          {a.pattern.kind === 'exact' && 'Exact match'}
                          {a.pattern.kind === 'brand-plus' && `Name + "${a.pattern.extra}"`}
                          {a.pattern.kind === 'typo' && `One-character variant ("${a.pattern.variant}")`}
                          {a.pattern.kind === 'unrelated' && <span className="text-muted">No literal match</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-muted">Automated comparison of the domain with the complainant&apos;s name. The panel compares the domain with the trademark actually relied on, which may differ.</p>
            </section>
          )}

          <section className="mt-10" aria-labelledby="source">
            <h2 id="source" className="font-serif text-2xl font-semibold">Official record</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {v.decisionUrl ? (
                <li>
                  <a href={v.decisionUrl} target="_blank" rel="noopener noreferrer" className="link">
                    Read the full decision on the {v.provider} website
                  </a>
                </li>
              ) : (
                <li className="text-muted">
                  {v.pending ? 'No decision yet.' : 'No decision was published for this case.'}
                </li>
              )}
              {v.caseUrl && (
                <li>
                  <a href={v.caseUrl} target="_blank" rel="noopener noreferrer" className="link">
                    {v.provider} case status page
                  </a>
                </li>
              )}
              <li>
                <Link href={`/live?q=${encodeURIComponent(primary)}`} className="link">
                  Check for other filings over {primary}
                </Link>
              </li>
            </ul>
          </section>

          <AdSlot className="my-10" />

          {history.total > 0 && v.complainant && (
            <section className="mt-10" aria-labelledby="history">
              <h2 id="history" className="font-serif text-2xl font-semibold">Other cases by this complainant</h2>
              <p className="mt-2 text-[15px] text-muted">
                {v.complainant} appears in {num(history.total)} other indexed {history.total === 1 ? 'decision' : 'decisions'}.
              </p>
              <div className="mt-4">
                <CaseList rows={history.rows} />
              </div>
              {history.total > history.rows.length && (
                <Link href={`/cases?q=${encodeURIComponent(v.complainant)}`} className="link mt-3 inline-block text-[15px]">
                  See all {num(history.total + 1)} cases
                </Link>
              )}
            </section>
          )}

          <div className="mt-12">
            <HelpCta
              title={v.pending ? 'Respond before the deadline' : 'Facing a similar dispute?'}
              body={
                v.pending
                  ? 'If this is your domain, the response window is short. Tell us what happened and get a free, confidential review of your options.'
                  : 'Tell us about your domain and get a free, confidential review with similar outcomes from our library.'
              }
              href={helpHref}
            />
          </div>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h2 className="font-semibold">Learn more</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li><Link href="/three-element-test" className="link">The three-element test</Link></li>
              <li><Link href="/guides/how-to-respond-to-a-udrp-complaint" className="link">How to respond to a complaint</Link></li>
              <li><Link href="/guides/bad-faith-under-the-udrp" className="link">What counts as bad faith</Link></li>
              <li><Link href="/guides/udrp-timeline-and-deadlines" className="link">UDRP timeline</Link></li>
            </ul>
          </div>
          <div className="panel p-5">
            <h2 className="font-semibold">Tools</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li><Link href={`/tools/domain-lookup?domain=${encodeURIComponent(primary)}`} className="link">Look up {primary}</Link></li>
              <li><Link href="/tools/deadline-calculator" className="link">Deadline calculator</Link></li>
              <li><Link href="/tools/fee-estimator" className="link">Fee estimator</Link></li>
            </ul>
          </div>
          <AdSlot name="sidebar" />
          <p className="text-xs leading-relaxed text-muted">
            Data from the provider&apos;s public records{v.indexed ? `, first indexed ${formatDate(v.indexed)}` : ''}. Spotted an error?{' '}
            <Link href={`/contact?topic=Data%20correction&case=${v.caseNumber}`} className="underline">Request a correction</Link>.
          </p>
        </aside>
      </div>
    </>
  );
}

function Fact({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
