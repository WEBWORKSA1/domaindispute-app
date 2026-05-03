import Link from 'next/link';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { formatDate, outcomeLabel, outcomeColor, clusterLabel } from '@/lib/utils';

export const revalidate = 600;

export const metadata: Metadata = {
  title: 'Case Library - 100+ Recent UDRP, URS, and ccTLD Decisions',
  description: 'Browse recent domain dispute decisions with curated analysis. Filter by provider, outcome, and pattern.',
};

type SearchParams = { provider?: string; outcome?: string; cluster?: string; q?: string };

export default async function CasesIndexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = createServerClient();

  let query = supabase
    .from('cases')
    .select('id, provider, case_number, decision_date, outcome, domains, complainant_name, cluster_tag, decision_url, is_curated')
    .eq('is_published', true)
    .order('decision_date', { ascending: false, nullsFirst: false })
    .limit(50);

  if (params.provider) query = query.eq('provider', params.provider);
  if (params.outcome) query = query.eq('outcome', params.outcome);
  if (params.cluster) query = query.contains('cluster_tag', [params.cluster]);

  const { data: cases } = await query;

  return (
    <>
      <section className="bg-paper border-b border-ink px-8 py-16">
        <div className="max-w-[1320px] mx-auto">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood mb-6">
            Case Library
          </div>
          <h1 className="h-display text-display-lg mb-6">
            Browse <em>recent</em> decisions.
          </h1>
          <p className="text-xl text-ink-soft max-w-3xl">
            {(cases?.length ?? 0).toLocaleString()} published decisions. Filter by provider, outcome, or pattern.
          </p>
        </div>
      </section>

      <section className="bg-bone border-b border-ink px-8 py-6">
        <div className="max-w-[1320px] mx-auto flex flex-wrap gap-3 text-sm">
          <FilterLink href="/cases" label="All" active={!params.provider && !params.outcome && !params.cluster} />
          <FilterLink href="/cases?provider=WIPO" label="WIPO" active={params.provider === 'WIPO'} />
          <FilterLink href="/cases?provider=FORUM" label="Forum" active={params.provider === 'FORUM'} />
          <FilterLink href="/cases?outcome=TRANSFER" label="Transferred" active={params.outcome === 'TRANSFER'} />
          <FilterLink href="/cases?outcome=DENY" label="Denied" active={params.outcome === 'DENY'} />
          <FilterLink href="/cases?outcome=RDNH" label="RDNH" active={params.outcome === 'RDNH'} />
        </div>
      </section>

      <section className="bg-paper px-8 py-12">
        <div className="max-w-[1320px] mx-auto">
          {!cases || cases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-ink-soft">No cases match these filters yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-ink/10">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.case_number}`}
                  className="block py-6 hover:bg-bone/40 transition px-4 -mx-4"
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-oxblood font-semibold">
                      {c.provider} &middot; {c.case_number}
                    </span>
                    {c.outcome && (
                      <span className={`pill ${outcomeColor(c.outcome)}`}>
                        {outcomeLabel(c.outcome)}
                      </span>
                    )}
                    {c.cluster_tag?.map((tag) => (
                      <span key={tag} className="pill bg-bone-2 text-ink">
                        {clusterLabel(tag)}
                      </span>
                    ))}
                  </div>
                  <div className="font-serif text-xl font-semibold text-ink mb-1">
                    {c.domains?.[0] ?? '-'}
                    {c.domains && c.domains.length > 1 && (
                      <span className="text-muted text-base font-normal"> +{c.domains.length - 1}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted">
                    {c.complainant_name ?? '-'} &middot; {formatDate(c.decision_date)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 border ${
        active
          ? 'bg-ink text-bone border-ink'
          : 'bg-paper text-ink border-ink/30 hover:border-ink'
      } transition`}
    >
      {label}
    </Link>
  );
}
