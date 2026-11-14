import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BULK_IMPORT_THRESHOLD, getBriefDay } from '@/lib/data/cases';
import { CaseList, EmptyState, FilingList, HelpCta, PageHeader, SectionHeading } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';
import { formatDate, num, outcomeLabel } from '@/lib/utils';

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

interface Props {
  params: Promise<{ date: string }>;
}

function valid(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return !Number.isNaN(t) && t <= Date.now() + 86400000 && t >= Date.parse('2026-01-01T00:00:00Z');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  if (!valid(date)) return { title: 'Brief not found', robots: { index: false } };
  const { decisions, filings } = await getBriefDay(date);
  const empty = decisions.length === 0 && filings.length === 0;
  return {
    title: `Domain dispute brief for ${formatDate(date, 'MMMM d, yyyy')}`,
    description: `New UDRP filings and newly indexed decisions for ${formatDate(date, 'MMMM d, yyyy')}.`,
    alternates: { canonical: `/brief/${date}` },
    // Quiet days have no content worth indexing.
    robots: empty ? { index: false, follow: true } : undefined,
  };
}

export default async function BriefDayPage({ params }: Props) {
  const { date } = await params;
  if (!valid(date)) notFound();
  const { decisions, decisionTotal, filings } = await getBriefDay(date);
  const empty = decisions.length === 0 && filings.length === 0;
  const bulk = decisionTotal > BULK_IMPORT_THRESHOLD;
  const complete = decisionTotal <= decisions.length;

  const tally = decisions.reduce<Record<string, number>>((acc, c) => {
    const k = c.outcome ?? 'PENDING';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const notable = bulk ? [] : decisions.filter((c) => c.outcome === 'DENY' || c.outcome === 'RDNH');
  const commenced = `${num(filings.length)} ${filings.length === 1 ? 'complaint' : 'complaints'} commenced`;

  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/brief', label: 'Daily brief' },
          { href: `/brief/${date}`, label: formatDate(date) },
        ]}
        title={`Brief for ${formatDate(date, 'EEEE, MMMM d, yyyy')}`}
        lede={
          empty
            ? 'No new filings or decisions were recorded on this day.'
            : bulk
              ? `${commenced}. This day also includes a one-time import of ${num(decisionTotal)} earlier decisions into the case library.`
              : `${commenced} and ${num(decisionTotal)} ${decisionTotal === 1 ? 'decision was' : 'decisions were'} indexed.${
                  complete && decisions.length > 0
                    ? ` ${Object.entries(tally)
                        .map(([k, n]) => `${num(n)} ${outcomeLabel(k).toLowerCase()}`)
                        .join(', ')}.`
                    : ''
                }`
        }
      />

      <div className="wrap py-10">
        {empty && (
          <EmptyState title="Nothing recorded" body="Weekends and holidays are often quiet.">
            <Link href="/brief" className="btn-outline">
              Back to the brief archive
            </Link>
          </EmptyState>
        )}

        {notable.length > 0 && (
          <section className="mb-12">
            <SectionHeading title="Notable: complaints denied">Cases where the respondent kept the domain.</SectionHeading>
            <CaseList rows={notable} showRespondent />
          </section>
        )}

        {filings.length > 0 && (
          <section className="mb-12">
            <SectionHeading title="New filings">Proceedings that commenced on this date.</SectionHeading>
            <FilingList rows={filings} />
          </section>
        )}

        <AdSlot className="mb-12" />

        {decisions.length > 0 && (
          <section className="mb-12">
            <SectionHeading title={bulk ? 'Decisions imported' : 'Decisions indexed'}>
              {decisionTotal > decisions.length ? (
                <>
                  Showing the newest {num(decisions.length)} of {num(decisionTotal)}. The rest are in the{' '}
                  <Link href="/cases" className="link">
                    case library
                  </Link>
                  .
                </>
              ) : null}
            </SectionHeading>
            <CaseList rows={decisions} showRespondent />
          </section>
        )}

        <HelpCta tone="light" />
      </div>
    </>
  );
}
