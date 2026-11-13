import Link from 'next/link';
import type { Metadata } from 'next';
import { getOutcomeCounts, latestDecisions, latestFilings, sanitizeQuery } from '@/lib/data/cases';
import { CaseList, EmptyState, FilingList, HelpCta, PageHeader, SectionHeading } from '@/components/ui';
import { SearchBox } from '@/components/search-box';
import { EmailSignup } from '@/components/email-signup';
import { AdSlot } from '@/components/ad-slot';
import { num } from '@/lib/utils';

export const revalidate = 900;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: 'Live UDRP docket: newly filed domain disputes',
    description:
      'Newly filed WIPO domain name complaints with commencement dates and estimated response deadlines, refreshed several times a day.',
    alternates: { canonical: '/live' },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function LivePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = sanitizeQuery(raw);
  const [filings, decisions, counts] = await Promise.all([
    latestFilings({ limit: q ? 100 : 80, q }),
    q ? Promise.resolve([]) : latestDecisions(15),
    getOutcomeCounts(),
  ]);

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/live', label: 'Live docket' }]}
        title="Live docket of pending domain disputes"
        lede={`${num(counts.openFilings)} WIPO complaints are currently open. Each entry shows when the proceeding commenced and when a response is roughly due. The docket refreshes several times a day.`}
      >
        <SearchBox action="/live" defaultValue={q} className="mt-6 max-w-2xl" placeholder="Search pending filings by domain or complainant" />
      </PageHeader>

      <section className="wrap py-10">
        <SectionHeading title={q ? `Pending filings matching "${q}"` : 'Newest filings'}>
          Response dates are estimates (commencement + 20 days, UDRP Rules 5(a)). Always confirm with the provider&apos;s notice.
        </SectionHeading>
        {filings.length > 0 ? (
          <FilingList rows={filings} />
        ) : (
          <EmptyState
            title={q ? 'No pending filing matches' : 'The docket is refreshing'}
            body={q ? 'No open complaint names that domain or complainant right now. Search decided cases instead, or subscribe to be alerted if one is filed.' : 'New filings appear here as soon as the provider lists them.'}
          >
            {q && (
              <Link href={`/cases?q=${encodeURIComponent(q)}`} className="btn-outline">
                Search decided cases
              </Link>
            )}
          </EmptyState>
        )}
      </section>

      <section className="border-y border-bone-2 bg-bone/50">
        <div className="wrap grid items-center gap-8 py-10 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-[26px] font-semibold">Get alerted when a brand or domain is named</h2>
            <p className="mt-2 max-w-lg text-[15px] text-ink-soft">
              Add the brands or domains you care about. The daily brief flags any new filing or decision that mentions them.
            </p>
          </div>
          <EmailSignup watchField cta="Set up alerts" />
        </div>
      </section>

      <AdSlot className="wrap my-10" />

      {decisions.length > 0 && (
        <section className="wrap py-10">
          <SectionHeading title="Latest decisions" href="/cases" linkLabel="Case library" />
          <CaseList rows={decisions} />
        </section>
      )}

      <section className="wrap pb-14">
        <HelpCta
          title="Your domain is on the docket?"
          body="A UDRP response is usually due 20 days after commencement. Get a free, confidential case review and a plain-English plan."
          href="/get-help?situation=respondent"
        />
      </section>
    </>
  );
}
