import Link from 'next/link';
import type { Metadata } from 'next';
import { BULK_IMPORT_THRESHOLD, getBriefIndex } from '@/lib/data/cases';
import { EmptyState, HelpCta, PageHeader } from '@/components/ui';
import { EmailSignup } from '@/components/email-signup';
import { formatDate, num } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Daily brief: new UDRP filings and decisions',
  description: 'A daily, automatically compiled record of new domain dispute filings and newly published decisions.',
  alternates: { canonical: '/brief' },
};

export default async function BriefIndexPage() {
  const days = await getBriefIndex(21);
  const withActivity = days.filter((d) => d.decisions + d.filings > 0);

  return (
    <>
      <PageHeader
        crumbs={[{ href: '/brief', label: 'Daily brief' }]}
        title="The daily brief"
        lede="Each day's new filings (by commencement date) and newly indexed decisions, compiled automatically from provider records."
      >
        <div className="mt-6 max-w-xl">
          <EmailSignup watchField cta="Email me the brief" />
        </div>
      </PageHeader>

      <section className="wrap py-10">
        {withActivity.length === 0 ? (
          <EmptyState title="No activity recorded in the last three weeks" body="The brief fills in as the daily refresh collects new filings and decisions." />
        ) : (
          <ul className="divide-y divide-bone-2 border-y border-bone-2">
            {withActivity.map((d) => (
              <li key={d.day}>
                <Link href={`/brief/${d.day}`} className="flex flex-wrap items-baseline justify-between gap-3 px-1 py-4 hover:bg-bone/60">
                  <span className="font-serif text-lg font-semibold text-ink">{formatDate(d.day, 'EEEE, MMMM d, yyyy')}</span>
                  <span className="text-[15px] text-muted">
                    {num(d.filings)} new {d.filings === 1 ? 'filing' : 'filings'} ·{' '}
                    {d.decisions > BULK_IMPORT_THRESHOLD
                      ? `${num(d.decisions)} earlier decisions imported`
                      : `${num(d.decisions)} ${d.decisions === 1 ? 'decision' : 'decisions'} indexed`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wrap pb-14">
        <HelpCta tone="light" />
      </section>
    </>
  );
}
