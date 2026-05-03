import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';

// ISR - revalidate every 5 minutes
export const revalidate = 300;

interface HomeStats {
  totalCases: number;
  recentDays: number;
  rdnhCount2025: number;
  livePending: number;
}

async function getHomeStats(): Promise<HomeStats> {
  const supabase = createServerClient();

  const { count: totalCases } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: recentDays } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .gte('scraped_at', thirtyDaysAgo);

  const { count: rdnhCount2025 } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('outcome', 'RDNH')
    .gte('decision_date', '2025-01-01')
    .lte('decision_date', '2025-12-31');

  const { count: livePending } = await supabase
    .from('live_filings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'FILED');

  return {
    totalCases: totalCases ?? 0,
    recentDays: recentDays ?? 0,
    rdnhCount2025: rdnhCount2025 ?? 0,
    livePending: livePending ?? 0,
  };
}

export default async function HomePage() {
  const stats = await getHomeStats();

  return (
    <>
      {/* HERO */}
      <section className="relative bg-paper border-b border-ink overflow-hidden bg-rules px-8 py-20 md:py-24">
        <div className="max-w-[1320px] mx-auto relative z-10 grid lg:grid-cols-[1.4fr_1fr] gap-16 items-start">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood inline-flex items-center gap-3.5 mb-8 border border-oxblood px-3.5 py-2 bg-bone">
              <span className="w-[18px] h-[18px] rounded-full border border-oxblood inline-flex items-center justify-center text-[10px] font-bold">
                §
              </span>
              ICANN UDRP / URS / ACPA &middot; Self-help platform &middot; Est. 2026
            </div>

            <h1 className="h-display text-display-lg mb-9">
              Cybersquatters lose <em>83%</em> of the time.
              <br />
              <span className="border-b-[3px] border-gold pb-0.5">Skip the $7,000</span> in legal fees.
            </h1>

            <p className="text-xl leading-snug text-ink-soft max-w-2xl mb-11">
              DomainDispute.com is a <strong className="font-semibold text-ink">self-help platform for domain dispute self-representation</strong>. Every party to a UDRP, URS, or ccTLD proceeding has the right to represent themselves - codified in <strong className="font-semibold text-ink">UDRP Rules section 4(b)</strong>. We give you the case research, AI-assisted analysis, and prepared filing templates that normally cost $4,000-$7,000 in attorney fees.
            </p>

            <div className="flex flex-wrap gap-4 mb-14">
              <Link
                href="/start"
                className="bg-ink text-bone px-8 py-4.5 font-semibold text-[15px] border border-ink hover:bg-oxblood hover:border-oxblood transition inline-flex items-center gap-2.5"
              >
                Free Pre-Check
                <span>&rarr;</span>
              </Link>
              <Link
                href="/three-element-test"
                className="bg-transparent text-ink px-8 py-4.5 font-semibold text-[15px] border border-ink hover:bg-ink hover:text-bone transition"
              >
                Read the Three-Element Test
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-9 pt-9 border-t border-ink max-w-2xl">
              <Stat num={stats.totalCases.toLocaleString()} label="Decisions in our database" />
              <Stat num={stats.rdnhCount2025.toString()} label="RDNH findings in 2025" />
              <Stat num="4(b)" label="UDRP self-rep right" />
            </div>
          </div>

          {/* Pre-Check intake card */}
          <div id="consult" className="bg-bone border border-ink shadow-[8px_8px_0_var(--oxblood)]">
            <div className="bg-ink text-bone px-6 py-4.5 flex justify-between items-center font-mono text-[11px] tracking-[0.16em] uppercase">
              <span>Free Pre-Check &middot; Form A-0</span>
              <span className="bg-oxblood px-2.5 py-1 rounded-sm">Confidential</span>
            </div>
            <div className="p-7">
              <h3 className="font-serif text-[22px] font-semibold leading-tight mb-4.5">
                Free 60-second Pre-Check.
                <br />
                <span className="text-oxblood italic">Find out if your case is worth filing.</span>
              </h3>
              <p className="text-sm text-ink-soft mb-5 leading-relaxed">
                Three quick questions. No obligation, no email required up front.
              </p>
              <Link
                href="/start"
                className="block text-center bg-oxblood text-bone py-3.5 px-4 text-sm font-semibold tracking-wider uppercase hover:bg-oxblood-deep transition"
              >
                Start My Pre-Check &rarr;
              </Link>
            </div>
            <div className="bg-legal-pad border-t border-dashed border-ink px-6 py-3.5 text-xs text-ink-soft">
              Confidential intake. SSL encrypted. <strong>Not a law firm.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SELF-REP */}
      <section className="bg-ink text-bone border-b border-gold px-8 py-24 relative overflow-hidden">
        <div className="max-w-[1320px] mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-end mb-14">
            <div>
              <div className="font-mono text-xs tracking-[0.22em] uppercase text-gold-bright mb-4.5">
                The right you already have
              </div>
              <h2 className="h-display text-display-md text-bone">
                Why <em className="text-gold-bright">represent yourself</em> in a UDRP?
              </h2>
            </div>
            <p className="text-lg text-bone-2 leading-relaxed">
              The UDRP was designed for self-represented parties. Every ICANN-approved provider publishes step-by-step guides for non-lawyers. So why does the legal industry treat self-representation like a last resort? Because charging $4,000-$7,000 to fill in a structured form is a profitable business model.
            </p>
          </div>

          <div className="bg-bone/[0.04] border border-gold border-l-4 px-9 py-8 mb-12 relative">
            <div className="absolute -top-3 left-6 bg-gold text-ink font-mono text-[10px] tracking-[0.18em] px-3 py-1 font-bold">
              UDRP RULES SECTION 4(B)
            </div>
            <p className="font-serif italic text-[22px] leading-snug text-bone">
              &ldquo;Each party may, but is not required to, be represented by a lawyer or other authorized representative in connection with any proceeding under the UDRP.&rdquo;
            </p>
          </div>

          <div className="grid md:grid-cols-3 border border-gold">
            <ReasonCell num="01" title="It's your right." border>
              UDRP Rules section 4(b) and the supplemental rules of every ICANN-approved provider expressly permit self-representation. WIPO publishes a Guide for Filing a Complaint specifically for non-represented parties.
            </ReasonCell>
            <ReasonCell num="02" title="The math is simple." border>
              A UDRP filing is a structured form, a three-element analysis, and an exhibit list. Self-representation saves $4,000-$7,000 - money better spent on the next domain.
            </ReasonCell>
            <ReasonCell num="03" title="Panels reward clarity.">
              WIPO Overview 3.0 section 4.16 holds represented complainants to a higher standard. The {stats.rdnhCount2025} RDNH findings of 2025 were almost all against represented parties.
            </ReasonCell>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-oxblood text-bone px-8 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="h-display text-display-md text-bone mb-6">
            Don't pay <em className="text-gold-bright italic">$7,000</em> for form-filling.
          </h2>
          <p className="text-lg opacity-90 mb-10 leading-snug">
            Three tiers. You stay in control. Start with the free Pre-Check.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2.5 bg-bone text-ink px-12 py-5 text-base font-semibold border border-bone hover:bg-ink hover:text-bone hover:border-ink transition"
          >
            Start Free Pre-Check &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-[42px] font-semibold leading-none text-oxblood">
        {num}
      </div>
      <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted mt-1.5 font-medium">
        {label}
      </div>
    </div>
  );
}

function ReasonCell({
  num,
  title,
  children,
  border = false,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
  border?: boolean;
}) {
  return (
    <div className={`px-8 py-9 ${border ? 'md:border-r border-gold' : ''}`}>
      <div className="font-serif text-[54px] font-semibold leading-none text-gold-bright mb-4">
        {num}
      </div>
      <h3 className="font-serif text-[22px] font-semibold leading-tight mb-3 text-bone">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-bone-2">{children}</p>
    </div>
  );
}
