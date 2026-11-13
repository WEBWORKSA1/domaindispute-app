import Link from 'next/link';
import type { Metadata } from 'next';
import { LeadForm } from '@/components/lead-form';
import { Breadcrumbs } from '@/components/ui';
import { complainantWinRate, getOutcomeCounts } from '@/lib/data/cases';
import { num, pct } from '@/lib/utils';
import { JsonLd } from '@/components/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Free domain dispute case review',
  description:
    'Received a UDRP complaint, or found a domain copying your brand? Get a free, confidential case review and a plain-English plan, usually within one business day.',
  alternates: { canonical: '/get-help' },
};

const FAQS = [
  { q: 'Is the review really free?', a: 'Yes. We review your summary and reply with general information about your options at no cost and with no obligation.' },
  { q: 'Are you a law firm?', a: 'No. DomainDispute.com is an information service. If you ask for a referral, we can introduce you to an independent lawyer, but only after you approve it.' },
  { q: 'How fast will I hear back?', a: 'Usually within one business day. If you tell us a response deadline is close, we prioritise your request.' },
  { q: 'Who sees my information?', a: 'Only our team. We never sell or publish it. See the privacy policy for details.' },
];

export default async function GetHelpPage() {
  const counts = await getOutcomeCounts();
  const rate = complainantWinRate(counts);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <section className="border-b border-bone-2 bg-bone/50">
        <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_1.15fr] lg:py-14">
          <div>
            <Breadcrumbs items={[{ href: '/get-help', label: 'Free case review' }]} />
            <h1 className="h-display text-display-md text-balance">Get a free review of your domain dispute</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
              Tell us what happened in four short steps. We reply with a plain-English assessment of your position, the deadlines that apply and your realistic options, usually within one business day.
            </p>
            <ul className="mt-7 space-y-3 text-[15px]">
              <Check>Free and confidential; no obligation</Check>
              <Check>Requests with close deadlines are prioritised</Check>
              <Check>Grounded in {counts.total ? num(counts.total) : 'thousands of'} real decisions</Check>
              <Check>Referral to an independent lawyer only if you ask for one</Check>
            </ul>
            <div className="mt-8 rounded-lg border border-bone-2 bg-paper p-5">
              <p className="text-sm text-muted">Why timing matters</p>
              <p className="mt-1 text-[15px] leading-relaxed text-ink">
                {rate !== null ? `Complainants won ${pct(rate)} of decided cases in our index, and most undefended cases are lost. ` : 'Most undefended cases are lost. '}A respondent normally has only <strong>20 days</strong> from commencement to answer.
              </p>
            </div>
          </div>
          <div>
            <LeadForm />
          </div>
        </div>
      </section>

      <section className="wrap grid gap-12 py-14 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold">How it works</h2>
          <ol className="mt-5 space-y-5">
            <Step n={1} title="Tell us the situation">Who you are in the dispute, the domain and any deadline.</Step>
            <Step n={2} title="We review it against real outcomes">We compare your facts with similar decisions and the three UDRP elements.</Step>
            <Step n={3} title="You get a written plan">Options, deadlines and next steps by email. You decide what to do.</Step>
          </ol>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold">Questions</h2>
          <dl className="mt-4 divide-y divide-bone-2 border-y border-bone-2">
            {FAQS.map((f) => (
              <div key={f.q} className="py-4">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-[15px] text-ink-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-muted">
            Prefer to research first? Try the <Link href="/start" className="link">60-second pre-check</Link> or the <Link href="/tools/deadline-calculator" className="link">deadline calculator</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-green" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.8 3.8 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">{n}</span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-[15px] text-ink-soft">{children}</span>
      </span>
    </li>
  );
}
