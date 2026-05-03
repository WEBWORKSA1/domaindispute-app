import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { formatDate, outcomeLabel, outcomeColor, clusterLabel } from '@/lib/utils';

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ caseNumber: string }>;
}): Promise<Metadata> {
  const { caseNumber } = await params;
  return {
    title: `${caseNumber} - Domain Dispute Decision`,
    description: `Curated analysis of UDRP/URS case ${caseNumber}.`,
  };
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseNumber: string }>;
}) {
  const { caseNumber } = await params;
  const supabase = createServerClient();

  const { data: caseRow } = await supabase
    .from('cases')
    .select('*')
    .eq('case_number', caseNumber)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle();

  if (!caseRow) notFound();

  return (
    <>
      <section className="bg-paper border-b border-ink px-8 py-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Link href="/cases" className="font-mono text-xs tracking-[0.14em] uppercase text-muted hover:text-oxblood">
              &larr; Case Library
            </Link>
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood font-semibold">
              {caseRow.provider} &middot; {caseRow.case_number}
            </span>
            {caseRow.outcome && (
              <span className={`pill ${outcomeColor(caseRow.outcome)}`}>
                {outcomeLabel(caseRow.outcome)}
              </span>
            )}
          </div>

          <h1 className="h-display text-display-md mb-6">
            {caseRow.domains?.[0] ?? '-'}
            {caseRow.domains && caseRow.domains.length > 1 && (
              <span className="text-muted text-2xl font-normal"> +{caseRow.domains.length - 1}</span>
            )}
          </h1>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <Field label="Complainant" value={caseRow.complainant_name} />
            <Field label="Respondent" value={caseRow.respondent_name} />
            <Field label="Decision Date" value={formatDate(caseRow.decision_date)} />
          </div>
        </div>
      </section>

      <section className="bg-paper px-8 py-12">
        <div className="max-w-[1100px] mx-auto">
          {caseRow.cluster_tag && caseRow.cluster_tag.length > 0 && (
            <div className="mb-8">
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mb-3">Patterns</div>
              <div className="flex flex-wrap gap-2">
                {caseRow.cluster_tag.map((tag) => (
                  <Link
                    key={tag}
                    href={`/patterns/${tag}`}
                    className="pill bg-bone-2 text-ink hover:bg-ink hover:text-bone transition"
                  >
                    {clusterLabel(tag)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {caseRow.analysis_text && (
            <div className="prose prose-lg max-w-none">
              <h2 className="font-serif text-2xl font-semibold mb-4">Analysis</h2>
              <div className="text-base leading-relaxed text-ink-soft whitespace-pre-wrap">
                {caseRow.analysis_text}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-ink/20">
            <a
              href={caseRow.decision_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-bone px-6 py-3 font-semibold text-sm tracking-wider uppercase hover:bg-oxblood transition"
            >
              Read Full Decision &uarr;
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted mb-1">
        {label}
      </div>
      <div className="text-ink font-medium">{value ?? '-'}</div>
    </div>
  );
}
