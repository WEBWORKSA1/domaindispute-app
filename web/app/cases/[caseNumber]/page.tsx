import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { cn, formatDate, outcomeLabel, outcomeColor, clusterLabel } from '@/lib/utils';

// ISR - case detail rarely changes once published
export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ caseNumber: string }>;
}

// Try cases table first, then live_filings as fallback
async function getCase(caseNumber: string) {
  const supabase = createServerClient();
  const decoded = decodeURIComponent(caseNumber);

  // Look in decided cases first
  const { data: caseData } = await supabase
    .from('cases')
    .select('*')
    .eq('case_number', decoded)
    .eq('is_published', true)
    .maybeSingle();

  if (caseData) {
    return { type: 'decided' as const, data: caseData };
  }

  // Fall back to pending live filing
  const { data: filingData } = await supabase
    .from('live_filings')
    .select('*')
    .eq('case_number', decoded)
    .maybeSingle();

  if (filingData) {
    return { type: 'pending' as const, data: filingData };
  }

  return null;
}

async function getSimilarCases(caseId: string, clusterTags: string[] | null | undefined) {
  // Guard against missing cluster tags - many cases don't have them yet
  if (!clusterTags || !Array.isArray(clusterTags) || clusterTags.length === 0) {
    return [];
  }

  const supabase = createServerClient();
  try {
    const { data } = await supabase
      .from('cases')
      .select('id, case_number, provider, decision_date, outcome, domains, complainant_name, respondent_name')
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
  const result = await getCase(caseNumber);
  if (!result) return { title: 'Case not found' };

  const { data } = result;
  const domain = data.domains?.[0] ?? data.case_number;
  const outcome = result.type === 'pending' ? 'Pending' : outcomeLabel(data.outcome);

  const compName = result.type === 'pending' ? data.complainant : data.complainant_name;
  const respName = result.type === 'pending' ? null : data.respondent_name;

  return {
    title: `${data.case_number} - ${domain} (${outcome})`,
    description: `${data.provider} domain dispute: ${compName ?? 'Complainant'}${respName ? ' v. ' + respName : ''}. Outcome: ${outcome}.`,
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseNumber } = await params;
  const result = await getCase(caseNumber);
  if (!result) notFound();

  const isPending = result.type === 'pending';
  const caseData: any = result.data;

  const similar = isPending
    ? []
    : await getSimilarCases(caseData.id, caseData.cluster_tag);

  // Unify field names between cases and live_filings
  const complainantName = isPending ? caseData.complainant : caseData.complainant_name;
  const respondentName = isPending ? null : caseData.respondent_name;
  const decisionDate = isPending ? null : caseData.decision_date;
  const filingDate = isPending ? caseData.scraped_at : caseData.filing_date;
  const outcomeValue = isPending ? 'PENDING' : caseData.outcome;

  return (
    <>
      <div className="bg-paper border-b border-bone-2 px-8 py-4">
        <div className="max-w-[1100px] mx-auto font-mono text-[11px] tracking-[0.12em] uppercase text-muted">
          <Link href="/" className="hover:text-oxblood">Home</Link>
          <span className="text-gold mx-2.5">&rsaquo;</span>
          {isPending ? (
            <Link href="/live" className="hover:text-oxblood">Live Feed</Link>
          ) : (
            <Link href="/cases" className="hover:text-oxblood">Case Library</Link>
          )}
          <span className="text-gold mx-2.5">&rsaquo;</span>
          <span className="text-ink">{caseData.case_number}</span>
        </div>
      </div>

      <article className="bg-paper px-8 py-12">
        <div className="max-w-[1100px] mx-auto">
          {isPending && (
            <div className="mb-8 p-5 bg-gold-bright/10 border-l-4 border-gold-bright">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-gold-deep mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gold-bright animate-pulse-slow mr-2" />
                Pending decision
              </div>
              <p className="text-sm text-ink-soft">
                This case has been filed but the panel has not issued a decision yet. The full decision will be added once published by {caseData.provider}.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-[1fr_300px] gap-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] tracking-wider uppercase font-semibold bg-ink text-bone px-2 py-1">
                  {caseData.provider}
                </span>
                <span className="font-mono text-xs text-oxblood">{caseData.case_number}</span>
                <span className={cn(
                  'pill text-xs',
                  outcomeValue === 'TRANSFER' && 'bg-green-bright/20 text-green-deep',
                  outcomeValue === 'DENY' && 'bg-oxblood/20 text-oxblood',
                  outcomeValue === 'PENDING' && 'bg-gold-bright/20 text-gold-deep',
                  outcomeValue === 'WITHDRAWN' && 'bg-muted/20 text-muted',
                )}>
                  {outcomeLabel(outcomeValue)}
                </span>
              </div>

              <h1 className="font-serif font-black text-[40px] leading-tight mb-6 break-words">
                {caseData.domains?.[0] ?? caseData.case_number}
                {caseData.domains?.length > 1 && (
                  <span className="text-muted text-2xl font-normal block mt-1">
                    + {caseData.domains.length - 1} other domain{caseData.domains.length > 2 ? 's' : ''}
                  </span>
                )}
              </h1>

              <dl className="space-y-4 mb-10">
                {complainantName && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Complainant</dt>
                    <dd className="text-base mt-1">{complainantName}</dd>
                  </div>
                )}
                {respondentName && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Respondent</dt>
                    <dd className="text-base mt-1">{respondentName}</dd>
                  </div>
                )}
                {filingDate && !isPending && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Filed</dt>
                    <dd className="text-base mt-1">{formatDate(filingDate)}</dd>
                  </div>
                )}
                {decisionDate && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">Decided</dt>
                    <dd className="text-base mt-1">{formatDate(decisionDate)}</dd>
                  </div>
                )}
                {caseData.domains?.length > 1 && (
                  <div className="flex flex-col">
                    <dt className="font-mono text-[10px] tracking-wider uppercase text-muted">All disputed domains</dt>
                    <dd className="text-sm mt-1 font-mono break-words">
                      {caseData.domains.join(', ')}
                    </dd>
                  </div>
                )}
              </dl>

              {caseData.decision_url || caseData.filing_url ? (
                <div className="border-t border-bone-2 pt-8">
                  <h2 className="font-serif text-2xl font-medium mb-4">View original</h2>
                  <p className="text-muted mb-6">
                    Read the {isPending ? 'filing' : 'full panel decision'} at the source. Some terminated/withdrawn cases may not have a published PDF on {caseData.provider}.
                  </p>
                  <a
                    href={caseData.decision_url ?? caseData.filing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-oxblood text-bone px-5 py-3 font-semibold text-sm hover:bg-oxblood-deep transition"
                  >
                    View on {caseData.provider} &rarr;
                  </a>
                  <a
                    href={`https://www.wipo.int/amc/en/domains/search/text.jsp?case=${caseData.case_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block ml-3 text-sm text-oxblood underline hover:text-oxblood-deep"
                  >
                    Or search on WIPO
                  </a>
                </div>
              ) : null}
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
