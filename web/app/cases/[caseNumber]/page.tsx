import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { cn, formatDate, outcomeLabel } from '@/lib/utils';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ caseNumber: string }>;
}

type UnifiedCase = {
  id: string;
  provider: string;
  case_number: string;
  domains: string[];
  complainant: string | null;
  respondent: string | null;
  outcome: string | null;
  decision_date: string | null;
  filing_date: string | null;
  source_url: string | null;
  is_pending: boolean;
  cluster_tag: string[] | null;
};

async function getCase(caseNumber: string): Promise<UnifiedCase | null> {
  const supabase = createServerClient();
  const decoded = decodeURIComponent(caseNumber);

  // Try decided cases first
  const { data: caseRow } = await supabase
    .from('cases')
    .select('*')
    .eq('case_number', decoded)
    .eq('is_published', true)
    .maybeSingle();

  if (caseRow) {
    return {
      id: caseRow.id,
      provider: caseRow.provider,
      case_number: caseRow.case_number,
      domains: Array.isArray(caseRow.domains) ? caseRow.domains : [],
      complainant: caseRow.complainant_name ?? null,
      respondent: caseRow.respondent_name ?? null,
      outcome: caseRow.outcome ?? null,
      decision_date: caseRow.decision_date ?? null,
      filing_date: caseRow.filing_date ?? null,
      source_url: caseRow.decision_url ?? null,
      is_pending: false,
      cluster_tag: Array.isArray(caseRow.cluster_tag) ? caseRow.cluster_tag : null,
    };
  }

  // Fall back to live filings
  const { data: filing } = await supabase
    .from('live_filings')
    .select('*')
    .eq('case_number', decoded)
    .maybeSingle();

  if (filing) {
    return {
      id: filing.id,
      provider: filing.provider,
      case_number: filing.case_number,
      domains: Array.isArray(filing.domains) ? filing.domains : [],
      complainant: filing.complainant ?? null,
      respondent: null,
      outcome: null,
      decision_date: null,
      filing_date: filing.filing_date ?? filing.scraped_at ?? null,
      source_url: filing.filing_url ?? null,
      is_pending: true,
      cluster_tag: null,
    };
  }

  return null;
}

async function getSimilarCases(caseId: string, clusterTags: string[] | null) {
  if (!clusterTags || clusterTags.length === 0) return [];

  const supabase = createServerClient();
  try {
    const { data } = await supabase
      .from('cases')
      .select('id, case_number, provider, decision_date, outcome, domains, complainant_name')
      .eq('is_published', true)
      .neq('id', caseId)
      .overlaps('cluster_tag', clusterTags)
      .order('decision_date', { ascending: false, nullsFirst: false })
      .limit(6);
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { caseNumber } = await params;
  const c = await getCase(caseNumber);
  if (!c) return { title: 'Case not found' };

  const domain = c.domains[0] ?? c.case_number;
  const outcome = c.is_pending ? 'Pending' : outcomeLabel(c.outcome);

  return {
    title: `${c.case_number} - ${domain} (${outcome})`,
    description: `${c.provider} domain dispute: ${c.complainant ?? 'Complainant'}${c.respondent ? ' v. ' + c.respondent : ''}. Outcome: ${outcome}.`,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseNumber } = await params;
  const c = await getCase(caseNumber);
  if (!c) notFound();

  const similar = c.is_pending ? [] : await getSimilarCases(c.id, c.cluster_tag);
  const outcomeDisplay = c.is_pending ? 'PENDING' : (c.outcome ?? 'PENDING');

  return (
    <>
      <div className="bg-paper border-b border-bone-2 px-8 py-4">
        <div className="max-w-[1100px] mx-auto font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
          <Link href="/" className="hover:text-oxblood">Home</Link>
          <span className="text-gold mx-2.5">&rsaquo;</span>
          {c.is_pending ? (
            <Link href="/live" className="hover:text-oxblood">Live Feed</Link>
          ) : (
            <Link href="/cases" className="hover:text-oxblood">Case Library</Link>
          )}
          <span className="text-gold mx-2.5">&rsaquo;</span>
          <span className="text-ink">{c.case_number}</span>
        </div>
      </div>

      <article className="bg-paper px-8 py-12">
        <div className="max-w-[1100px] mx-auto">
          {c.is_pending && (
            <div className="mb-8 p-5 bg-gold-bright/10 border-l-4 border-gold-bright">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-gold-deep mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gold-bright animate-pulse-slow mr-2" />
                Pending decision
              </div>
              <p className="text-sm text-ink-soft">
                This case has been filed but the panel has not issued a decision yet. The full decision will be added once published by {c.provider}.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_300px] gap-12">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-mono text-[10px] tracking-wider uppercase font-semibold bg-ink text-bone px-2 py-1">
                  {c.provider}
                </span>
                <span className="font-mono text-xs text-oxblood">{c.case_number}</span>
                <span className={cn(
                  'pill text-xs',
                  outcomeDisplay === 'TRANSFER' && 'bg-green-bright/20 text-green-deep',
                  outcomeDisplay === 'DENY' && 'bg-oxblood/20 text-oxblood',
                  outcomeDisplay === 'PENDING' && 'bg-gold-bright/20 text-gold-deep',
                  outcomeDisplay === 'WITHDRAWN' && 'bg-muted/20 text-muted',
                )}>
                  {outcomeLabel(outcomeDisplay)}
                </span>
              </div>

              <h1 className="font-serif font-black text-[40px] leading-tight mb-6 break-words">
                {c.domains[0] ?? c.case_number}
                {c.domains.length > 1 && (
                  <span className="text-muted text-2xl font-normal block mt-1">
                    + {c.domains.length - 1} other domain{c.domains.length > 2 ? 's' : ''}
                  </span>
                )}
              </h1>

              <dl className="space-y-4 mb-10">
                {c.complainant && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Complainant</dt>
                    <dd className="text-base mt-1">{c.complainant}</dd>
                  </div>
                )}
                {c.respondent && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Respondent</dt>
                    <dd className="text-base mt-1">{c.respondent}</dd>
                  </div>
                )}
                {c.filing_date && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Filed</dt>
                    <dd className="text-base mt-1">{formatDate(c.filing_date)}</dd>
                  </div>
                )}
                {c.decision_date && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Decided</dt>
                    <dd className="text-base mt-1">{formatDate(c.decision_date)}</dd>
                  </div>
                )}
                {c.domains.length > 1 && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">All disputed domains</dt>
                    <dd className="text-sm mt-1 font-mono break-words">
                      {c.domains.join(', ')}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="border-t border-bone-2 pt-8">
                <h2 className="font-serif text-2xl font-medium mb-4">View on {c.provider}</h2>
                <p className="text-muted mb-6">
                  Read the {c.is_pending ? 'filing' : 'full panel decision'} at the source. Note: terminated/withdrawn cases sometimes do not have a published PDF.
                </p>
                <div className="flex flex-wrap gap-3 items-center">
                  {c.source_url && (
                    <a
                      href={c.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-oxblood text-bone px-5 py-3 font-semibold text-sm hover:bg-oxblood-deep transition"
                    >
                      View original &rarr;
                    </a>
                  )}
                  {c.provider === 'WIPO' && (
                    <a
                      href={`https://www.wipo.int/amc/en/domains/search/text.jsp?case=${encodeURIComponent(c.case_number)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-oxblood underline hover:text-oxblood-deep"
                    >
                      Search WIPO database
                    </a>
                  )}
                </div>
              </div>
            </div>

            <aside>
              <div className="bg-paper-warm p-6 border border-ink">
                <h3 className="font-mono text-[10px] tracking-[0.18em] uppercase mb-4">About this case</h3>
                <p className="text-sm text-muted mb-4">
                  Domain disputes follow a standardized process. Use our free Pre-Check to assess your case strength.
                </p>
                <Link
                  href="/start"
                  className="block text-center bg-oxblood text-bone px-4 py-2.5 font-semibold text-sm hover:bg-oxblood-deep transition"
                >
                  Start Free Pre-Check
                </Link>
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <div className="mt-16 pt-10 border-t border-bone-2">
              <h2 className="font-serif text-2xl font-medium mb-6">Similar decisions</h2>
              <ul className="divide-y divide-ink/15">
                {similar.map((s: any) => (
                  <li key={s.id}>
                    <Link
                      href={`/cases/${s.case_number}`}
                      className="py-3 grid grid-cols-1 md:grid-cols-[100px_2fr_2fr_100px] gap-4 items-center hover:bg-paper-warm transition no-underline text-ink"
                    >
                      <span className="font-mono text-[10px] uppercase font-semibold bg-ink text-bone px-2 py-1 inline-flex items-center justify-center">
                        {s.provider}
                      </span>
                      <span className="font-serif font-semibold">{s.domains?.[0] ?? s.case_number}</span>
                      <span className="text-sm text-ink-soft truncate">{s.complainant_name}</span>
                      <span className="font-mono text-xs text-oxblood text-right">{s.case_number}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
