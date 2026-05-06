import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { cn, formatDate, timeAgo } from '@/lib/utils';
import { EmailSignup } from '@/components/email-signup';

// Refresh every 5 minutes - the live feed is the freshness asset
export const revalidate = 300;

export const metadata = {
  title: 'Live Domain Dispute Feed - UDRP, URS, and ccTLD Filings',
  description:
    'The only real-time feed of newly filed domain disputes from WIPO, Forum, CAC, and other ICANN-approved providers. Updated hourly. Free email alerts.',
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
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0, transparent 31px, rgba(168,122,60,0.07) 31px, rgba(168,122,60,0.07) 32px)',
          }}
        />
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
            Every new UDRP, URS, and ccTLD case from WIPO, Forum, CAC, ADNDRC, and CIIDRC &mdash; surfaced within an hour of filing. If your brand is being targeted, you&apos;ll know before your in-house counsel does.
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
                <li key={f.id}>
                  <Link
                    href={`/cases/${f.case_number}`}
                    className="py-4 grid grid-cols-1 md:grid-cols-[100px_2fr_2fr_140px_120px] gap-3 md:gap-6 items-center hover:bg-paper-warm transition cursor-pointer no-underline text-ink"
                  >
                    <span className="font-mono text-[10px] tracking-wider uppercase font-semibold bg-ink text-bone px-2 py-1 inline-flex items-center justify-center">
                      {f.provider}
                    </span>
                    <span className="font-serif text-base font-semibold break-words">
                      {f.domains[0] ?? '\u2014'}
                      {f.domains.length > 1 && (
                        <span className="text-muted text-sm font-normal">
                          {' '}+{f.domains.length - 1}
                        </span>
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-paper-warm px-8 py-14 border-b border-ink">
        <div className="max-w-[1320px] mx-auto">
          <div className="flex justify-between items-end mb-8 pb-6 border-b border-ink">
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-none">
              Just decided
            </h2>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              Latest 20 decisions
            </div>
          </div>

          {decisions.length === 0 ? (
            <PlaceholderState
              title="No decisions yet."
              body="Recent panel decisions will appear here once cases are decided."
            />
          ) : (
            <ul className="divide-y divide-ink/15">
              {decisions.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/cases/${d.case_number}`}
                    className="py-4 grid grid-cols-1 md:grid-cols-[100px_2fr_2fr_140px_120px] gap-3 md:gap-6 items-center hover:bg-paper transition cursor-pointer no-underline text-ink"
                  >
                    <span className="font-mono text-[10px] tracking-wider uppercase font-semibold bg-ink text-bone px-2 py-1 inline-flex items-center justify-center">
                      {d.provider}
                    </span>
                    <span className="font-serif text-base font-semibold break-words">
                      {d.domains?.[0] ?? '\u2014'}
                      {(d.domains?.length ?? 0) > 1 && (
                        <span className="text-muted text-sm font-normal">
                          {' '}+{(d.domains?.length ?? 0) - 1}
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-ink-soft italic truncate">
                      {d.complainant_name ?? 'Complainant'}
                    </span>
                    <span className="font-mono text-xs text-oxblood">
                      {d.case_number}
                    </span>
                    <span className={cn(
                      'pill text-center',
                      d.outcome === 'TRANSFER' && 'bg-green-bright/20 text-green-deep',
                      d.outcome === 'DENY' && 'bg-oxblood/20 text-oxblood',
                      d.outcome === 'WITHDRAWN' && 'bg-muted/20 text-muted',
                    )}>
                      {d.outcome ?? 'PENDING'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function PlaceholderState({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <h3 className="font-serif text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted max-w-md mx-auto">{body}</p>
    </div>
  );
}
