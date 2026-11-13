import Link from 'next/link';
import type { Metadata } from 'next';
import { TypoScanner } from './scanner';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';

export const metadata: Metadata = {
  title: 'Typo-variant scanner: find look-alike domains of your brand',
  description: 'Generate typosquatting variants of your brand (missing letters, swapped letters, look-alike characters, other extensions) and check which are registered.',
  alternates: { canonical: '/tools/typo-scanner' },
};

export default function Page() {
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/tools', label: 'Tools' },
          { href: '/tools/typo-scanner', label: 'Typo-variant scanner' },
        ]}
        title="Typo-variant scanner"
        lede="See your brand the way a cybersquatter does. Generate the look-alike domains most often used for phishing and traffic diversion, then check which are already registered."
      />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <TypoScanner />
          <div className="prose-dd mt-12">
            <h2>What to do with the results</h2>
            <ol>
              <li>Look at how each registered variant is used: a phishing page or fake shop is urgent; a parked page is less so.</li>
              <li>Compare its creation date with your trademark using the <Link href="/tools/domain-lookup">domain lookup</Link>.</li>
              <li>Read <Link href="/guides/protecting-your-brand-from-cybersquatting">protecting your brand</Link> to choose between monitoring, a URS or a UDRP.</li>
            </ol>
          </div>
        </div>
        <aside className="space-y-6">
          <HelpCta tone="light" title="Found infringing domains?" body="Send us the list for a free review of which are worth pursuing and how." href="/get-help?situation=brand" />
          <AdSlot name="sidebar" />
        </aside>
      </div>
    </>
  );
}
