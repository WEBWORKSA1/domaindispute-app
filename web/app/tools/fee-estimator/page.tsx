import Link from 'next/link';
import type { Metadata } from 'next';
import { FeeEstimator } from './estimator';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';

export const metadata: Metadata = {
  title: 'UDRP fee estimator: WIPO, Forum and CAC fees compared',
  description: 'Compare current UDRP filing fees at WIPO, Forum and CAC by number of domain names and panel size.',
  alternates: { canonical: '/tools/fee-estimator' },
};

export default function Page() {
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/tools', label: 'Tools' },
          { href: '/tools/fee-estimator', label: 'Fee estimator' },
        ]}
        title="UDRP fee estimator"
        lede="What the three largest providers charge to file a UDRP complaint, side by side."
      />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <FeeEstimator />
          <div className="prose-dd mt-12">
            <h2>Who pays?</h2>
            <p>
              The complainant pays the filing fee. A respondent pays nothing to respond, unless it asks for a three-member panel when the complainant chose a single panelist; it then pays half of the three-member fee.
            </p>
            <h2>Choosing on more than price</h2>
            <p>
              Language, panelist pool and precedent matter as much as cost. Read <Link href="/guides/choosing-a-dispute-provider">choosing a dispute provider</Link> before you file.
            </p>
          </div>
        </div>
        <aside className="space-y-6">
          <HelpCta tone="light" title="Not sure the fee is worth it?" body="Get a free review of whether your case is strong enough to file." href="/get-help?situation=brand" />
          <AdSlot name="sidebar" />
        </aside>
      </div>
    </>
  );
}
