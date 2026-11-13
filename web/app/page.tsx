import Link from 'next/link';
import { complainantWinRate, getOutcomeCounts, latestDecisions, latestFilings } from '@/lib/data/cases';
import { GUIDES } from '@/lib/content/guides';
import { VIDEOS } from '@/lib/content/videos';
import { CaseList, FilingList, HelpCta, SectionHeading } from '@/components/ui';
import { SearchBox } from '@/components/search-box';
import { EmailSignup } from '@/components/email-signup';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { AdSlot } from '@/components/ad-slot';
import { num, pct } from '@/lib/utils';

export const revalidate = 900;

const TOOLS = [
  { href: '/tools/deadline-calculator', title: 'Deadline calculator', body: 'Work out when a response is due from the commencement date.' },
  { href: '/tools/domain-lookup', title: 'Domain lookup', body: 'See a domain\'s creation date, registrar and status from RDAP.' },
  { href: '/tools/typo-scanner', title: 'Typo-variant scanner', body: 'Find look-alike domains of your brand and check which are taken.' },
  { href: '/tools/fee-estimator', title: 'Fee estimator', body: 'Compare 2026 WIPO, Forum and CAC fees for your case.' },
];

export default async function HomePage() {
  const [counts, filings, decisions] = await Promise.all([
    getOutcomeCounts(),
    latestFilings({ limit: 7 }),
    latestDecisions(8),
  ]);
  const winRate = complainantWinRate(counts);
  const featuredGuides = GUIDES.slice(0, 6);

  return (
    <>
      {/* Hero: the docket itself */}
      <section className="border-b border-bone-2 bg-bone/50">
        <div className="wrap grid gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <h1 className="h-display text-display-lg text-ink text-balance">Every domain dispute, from filing to decision.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
              Search {counts.total ? num(counts.total) : 'thousands of'} UDRP decisions and the live docket of {counts.openFilings ? `${num(counts.openFilings)} pending` : 'pending'} WIPO complaints. Free, plain-English, and updated automatically every day.
            </p>
            <SearchBox size="lg" className="mt-7 max-w-xl" placeholder="Domain, brand or case number, e.g. D2026-4998" />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
              <Link href="/get-help?situation=respondent" className="link">I received a complaint</Link>
              <Link href="/get-help?situation=brand" className="link">A domain copies my brand</Link>
              <Link href="/start" className="link">Check my case in 60 seconds</Link>
            </div>
          </div>

          <div className="rounded-xl border border-bone-2 bg-paper p-4 shadow-[0_1px_0_#d9e1ea] sm:p-6">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold">
                <span className="mr-2 inline-block h-2 w-2 -translate-y-0.5 rounded-full bg-oxblood animate-pulse-slow" aria-hidden="true" />
                Newest filings
              </h2>
              <Link href="/live" className="link text-sm">
                Open the live docket
              </Link>
            </div>
            {filings.length > 0 ? (
              <FilingList rows={filings} />
            ) : (
              <p className="py-8 text-center text-[15px] text-muted">The docket refreshes several times a day. New filings will appear here shortly.</p>
            )}
            <p className="mt-3 text-xs text-muted">Response dates are estimates: 20 days from commencement under UDRP Rules 5(a).</p>
          </div>
        </div>
      </section>

      {/* Figures */}
      <section className="border-b border-bone-2">
        <dl className="wrap grid grid-cols-2 gap-y-6 py-8 sm:grid-cols-4">
          <Figure value={num(counts.total)} label="decisions indexed" />
          <Figure value={pct(winRate)} label="won by complainants (decided cases)" />
          <Figure value={num(counts.DENY + counts.RDNH)} label="complaints denied" />
          <Figure value={num(counts.RDNH)} label="reverse hijacking findings" />
        </dl>
      </section>

      {/* Paths */}
      <section className="wrap py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <Path
            title="You received a complaint"
            body="You normally have 20 days to respond. Find your case, calculate the deadline and learn what panels need to see."
            links={[
              { href: '/guides/how-to-respond-to-a-udrp-complaint', label: 'How to respond' },
              { href: '/tools/deadline-calculator', label: 'Deadline calculator' },
              { href: '/get-help?situation=respondent', label: 'Free case review' },
            ]}
          />
          <Path
            title="Someone copied your brand"
            body="Check whether a look-alike domain is worth a complaint, compare providers and see how similar cases ended."
            links={[
              { href: '/guides/how-to-file-a-udrp-complaint', label: 'How to file' },
              { href: '/tools/typo-scanner', label: 'Typo-variant scanner' },
              { href: '/get-help?situation=brand', label: 'Free case review' },
            ]}
          />
          <Path
            title="You are researching"
            body="Browse decisions by outcome and year, follow new filings, and read the numbers behind the UDRP."
            links={[
              { href: '/cases', label: 'Case library' },
              { href: '/stats', label: 'Statistics' },
              { href: '/brief', label: 'Daily brief' },
            ]}
          />
        </div>
      </section>

      <AdSlot className="wrap mb-10" />

      {/* Latest decisions */}
      <section className="wrap pb-14">
        <SectionHeading title="Latest decisions" href="/cases" linkLabel="Browse the case library">
          Newest published outcomes, highest case numbers first.
        </SectionHeading>
        <CaseList rows={decisions} />
      </section>

      {/* Guides + tools */}
      <section className="border-y border-bone-2 bg-bone/50">
        <div className="wrap grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading title="Guides" href="/guides" linkLabel="All guides" />
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {featuredGuides.map((g) => (
                <li key={g.slug} className="border-t border-bone-2 py-4">
                  <Link href={`/guides/${g.slug}`} className="group block">
                    <span className="text-xs font-semibold text-gold">{g.audience}</span>
                    <span className="mt-1 block font-serif text-lg font-semibold leading-snug text-ink group-hover:underline">{g.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title="Free tools" href="/tools" linkLabel="All tools" />
            <ul className="space-y-3">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="block rounded-lg border border-bone-2 bg-paper p-4 hover:border-ink/40">
                    <span className="font-semibold text-ink">{t.title}</span>
                    <span className="mt-1 block text-sm text-muted">{t.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="wrap grid items-center gap-10 py-14 lg:grid-cols-2">
        <YouTubeEmbed id={VIDEOS[1]?.id ?? 'XL1Da82l9ow'} title={VIDEOS[1]?.title ?? 'What is the UDRP?'} />
        <div>
          <h2 className="font-serif text-[28px] font-semibold leading-tight">Learn the UDRP in short videos</h2>
          <p className="mt-3 max-w-lg text-[17px] leading-relaxed text-ink-soft">
            Fifteen expert videos cover what the UDRP is, how long it takes, what it costs and how panels judge each element.
          </p>
          <Link href="/videos" className="btn-outline mt-6">
            Watch the video library
          </Link>
        </div>
      </section>

      <section className="wrap pb-14">
        <HelpCta />
      </section>

      {/* Get involved */}
      <section className="border-t border-bone-2 bg-bone/50">
        <div className="wrap grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Involve href="/support" title="Support the project" body="Donations keep the data free and fund new research." />
          <Involve href="/contests" title="Contests and prizes" body="Predict outcomes of pending cases and win recognition and prizes." />
          <Involve href="/careers" title="Work with us" body="Researchers, writers, developers and partners wanted." />
          <Involve href="/advertise" title="Advertise or sponsor" body="Reach brand owners, domain investors and practitioners." />
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-ink text-white">
        <div className="wrap grid items-center gap-8 py-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-[28px] font-semibold">The daily brief, in your inbox</h2>
            <p className="mt-2 max-w-lg text-white/75">New filings, new decisions and notable denials, once a day. Add brands to watch and we flag them.</p>
          </div>
          <EmailSignup variant="dark" watchField cta="Get the brief" />
        </div>
      </section>
    </>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="pr-4">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-serif text-[34px] font-semibold leading-none text-ink tabular-nums">{value}</span>
        <span className="mt-1.5 block text-sm text-muted">{label}</span>
      </dd>
    </div>
  );
}

function Path({ title, body, links }: { title: string; body: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div className="border-l-2 border-oxblood pl-5">
      <h2 className="font-serif text-[22px] font-semibold leading-snug">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{body}</p>
      <ul className="mt-4 space-y-1.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link text-[15px]">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Involve({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="group block">
      <h3 className="font-serif text-xl font-semibold text-ink group-hover:underline">{title}</h3>
      <p className="mt-1.5 text-[15px] text-muted">{body}</p>
    </Link>
  );
}
