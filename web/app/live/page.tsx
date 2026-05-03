import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { EmailSignup } from '@/components/email-signup';

export const revalidate = 300;

export const metadata = {
  title: 'Live Domain Dispute Feed - UDRP, URS, and ccTLD Filings',
  description: 'The only real-time feed of newly filed domain disputes from WIPO, Forum, CAC. Updated hourly.',
};

async function getRecentFilings() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('live_filings')
    .select('id, provider, case_number, filing_date, domains, complainant, status, scraped_at, filing_url')
    .order('scraped_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

async function getRecentDecisions() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('cases')
    .select('id, case_number, provider, decision_date, outcome, domains, complainant_name')
    .eq('is_published', true)
    .order('decision_date', { ascending: false, nullsFirst: false })
    .limit(20);
  return data ?? [];
}

export default async function LivePage() {
  const [filings, decisions] = await Promise.all([
    getRecentFilings(),
    getRecentDecisions(),
  ]);

  return (
    <>
      <section className="bg-ink text-bone border-b border-gold px-8 py-16 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto relative">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold-bright mb-5 inline-flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-bright animate-pulse-slow" />
            LIVE &middot; Auto-refreshes every 5 minutes
          </div>
          <h1 className="h-display text-display-lg text-bone mb-6">
            The <em className="text-gold-bright italic">only</em> live feed of
            <br />
            domain dispute filings.
          </h1>
          <p className="text-lg text-bone-2 max-w-3xl leading-snug mb-9">
            Every new UDRP, URS, and ccTLD case from WIPO, Forum, CAC, ADNDRC, and CIIDRC - surfaced within an hour of filing.
          </p>

          <EmailSignup variant="dark" />
          <p className="text-xs text-bone-2 mt-3 max-w-2xl">
            One email per day. Includes every new filing matching your watchlist. Unsubscribe in one click. Free forever.
          </p>
        </div>
      </section>

      <section className="bg-paper px-8 py-14 border-b border-ink">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex justify-between items-end mb-8 pb-6 border-b border-ink">
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-none">
              Just filed
            </h2>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              Last 50 filings &middot; scraped hourly
            </div>
          </div>

          {filings.length === 0 ? (
            <PlaceholderState
              title="No filings ingested yet."
              body="The live feed scraper runs hourly. The first batch will appear once Phase 1 Week 1 backfill completes."
            />
          ) : (
            <ul className="divide-y divide-ink/15">
              {filings.map((f) => (
                <li key={f.id} className="py-4 grid grid-cols-1 md:grid-cols-[100px_2fr_2fr_140px_120px] gap-3 md:gap-6 items-center">
                  <span className="font-mono text-[10px] tracking-wider uppercase font-semibold bg-ink text-bone px-2 py-1 inline-flex items-center justify-center">
                    {f.provider}
                  </span>
                  <span className="font-serif text-base font-semibold break-words">
                    {f.domains[0] ?? '-'}
                    {f.domains.length > 1 && (
                      <span className="text-muted text-sm font-normal"> +{f.domains.length - 1}</span>
                    )}
                  </span>
                  <span className="text-sm text-ink-soft italic truncate">
                    {f.complainant ?? 'Complainant pending'}
                  </span>
                  <span className="font-mono text-xs text-oxblood">
                    {f.case_number}
                  </span>
                  <span className="font-mono text-[10px] text-muted text-right">
                    {timeAgo(f.scraped_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-bone-2 px-8 py-14 border-b border-ink">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex justify-between items-end mb-8 pb-6 border-b border-ink">
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-none">
              Just decided
            </h2>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              Last 20 decisions
            </div>
          </div>

          {decisions.length === 0 ? (
            <PlaceholderState
              title="No published decisions yet."
              body="Decisions are added to the database as the WIPO scraper completes its daily run."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {decisions.map((d) => (
                <Link
                  key={d.id}
                  href={`/cases/${encodeURIComponent(d.case_number)}`}
                  className="bg-paper border border-ink p-5 no-underline text-ink hover:shadow-[4px_4px_0_var(--ink)] transition flex flex-col"
                >
                  <div className="font-mono text-[10px] tracking-wider uppercase text-oxblood mb-2 font-semibold">
                    {d.provider} &middot; {d.case_number}
                  </div>
                  <div className="font-serif text-lg font-semibold mb-1 break-words">
                    {d.domains[0] ?? '-'}
                  </div>
                  <div className="text-xs text-muted italic mb-3">
                    {d.complainant_name ?? '-'}
                  </div>
                  <div className="flex-1" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-mono text-[10px] text-muted">
                      {formatDate(d.decision_date, 'MMM d')}
                    </span>
                    {d.outcome && (
                      <span
                        className={cn(
                          'pill',
                          d.outcome === 'TRANSFER' ? 'bg-green text-bone'
                            : d.outcome === 'DENY' ? 'bg-gold text-ink'
                              : d.outcome === 'RDNH' ? 'bg-oxblood text-bone'
                                : 'bg-ink text-bone',
                        )}
                      >
                        {d.outcome}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-oxblood text-bone px-8 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="h-display text-display-md text-bone mb-5">
            Watching for <em className="text-gold-bright italic">your</em> brand?
          </h2>
          <p className="text-base opacity-90 mb-8">
            Set up a watchlist - get an email the moment a domain matching your brand keywords gets disputed at any provider.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2.5 bg-bone text-ink px-10 py-4 font-semibold text-sm tracking-wider uppercase border border-bone hover:bg-ink hover:text-bone hover:border-ink transition"
          >
            Set Up Watchlist &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}

function PlaceholderState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center py-16 max-w-xl mx-auto">
      <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}
