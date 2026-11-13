import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SmartForm } from '@/components/smart-form';
import { CONTESTS } from '@/lib/content/programs';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contests and prizes',
  description: 'Test your UDRP knowledge: predict outcomes of pending domain disputes or write the clearest explainer. Free to enter.',
  alternates: { canonical: '/contests' },
};

export default function ContestsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/contests', label: 'Contests' }]}
        title="Contests and prizes"
        lede="Free-to-enter challenges for students, practitioners, investors and anyone curious about domain disputes. No purchase necessary."
      />

      <div className="wrap py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {CONTESTS.map((c) => (
            <article key={c.slug} id={c.slug} className="scroll-mt-24 rounded-xl border border-bone-2 p-6 sm:p-7">
              <p className="text-sm font-semibold text-green">{c.status}</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold">{c.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {formatDate(c.starts)} to {formatDate(c.ends)}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{c.summary}</p>
              <h3 className="mt-5 font-semibold">How to take part</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px] text-ink-soft">
                {c.howTo.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <h3 className="mt-5 font-semibold">Prizes</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-ink-soft">
                {c.prizes.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Enter or register</h2>
            <p className="mt-2 max-w-md text-[15px] text-ink-soft">
              Choose a contest and leave your details. For the explainer award, include a link to your entry. By entering you agree to the{' '}
              <Link href="/legal/contest-rules" className="link">official rules</Link>.
            </p>
            <div className="mt-8 rounded-lg bg-bone p-5">
              <h3 className="font-semibold">Sponsor a prize</h3>
              <p className="mt-1 text-[15px] text-ink-soft">
                Registrars, marketplaces, law firms and brand-protection companies can fund prizes and be credited on every contest page.
              </p>
              <Link href="/advertise?type=Contest%20prize%20sponsor" className="link mt-2 inline-block">
                Become a prize sponsor
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
            <SmartForm
              form="contest"
              submitLabel="Enter the contest"
              successTitle="You are entered."
              successBody="We will email you the contest details and any next steps before the round opens."
              fields={[
                { name: 'contest', label: 'Contest', type: 'select', required: true, options: CONTESTS.map((c) => c.title) },
                { name: 'name', label: 'Name', required: true, half: true },
                { name: 'email', label: 'Email', type: 'email', required: true, half: true },
                { name: 'country', label: 'Country of residence', required: true, half: true },
                { name: 'age_confirmed', label: 'Are you 18 or older?', type: 'radio', required: true, options: ['Yes', 'No'], half: true },
                { name: 'entry_link', label: 'Entry link (explainer award only)', type: 'url', placeholder: 'https://' },
              ]}
              consentLabel="I have read and agree to the official contest rules, and agree to be contacted about the contest."
            />
          </div>
        </section>
      </div>
    </>
  );
}
