import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCta, PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Free domain dispute tools',
  description: 'Free tools for domain disputes: UDRP deadline calculator, fee estimator, RDAP domain lookup, typo-variant scanner and case pre-check.',
  alternates: { canonical: '/tools' },
};

const TOOLS = [
  { href: '/start', title: 'Case pre-check', body: 'Answer three questions and see how a UDRP case is likely to look from your side, with the next steps to take.' },
  { href: '/tools/deadline-calculator', title: 'Deadline calculator', body: 'Enter the commencement date to get the response deadline, the extended deadline and the typical decision window.' },
  { href: '/tools/fee-estimator', title: 'Fee estimator', body: 'Compare current WIPO, Forum and CAC filing fees by panel size and number of domains.' },
  { href: '/tools/domain-lookup', title: 'Domain lookup (RDAP)', body: 'Check any domain\'s creation date, registrar, status and name servers from official registration data.' },
  { href: '/tools/typo-scanner', title: 'Typo-variant scanner', body: 'Generate the look-alike domains a cybersquatter would register and check which of them are already taken.' },
  { href: '/cases', title: 'Case search', body: 'Search every indexed decision by domain, brand, party or case number.' },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader crumbs={[{ href: '/tools', label: 'Tools' }]} title="Free tools" lede="Practical tools for people filing, answering or preventing a domain dispute. No sign-up needed." />
      <div className="wrap grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="group rounded-lg border border-bone-2 p-6 hover:border-ink/40">
            <h2 className="font-serif text-xl font-semibold text-ink group-hover:underline">{t.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{t.body}</p>
          </Link>
        ))}
      </div>
      <section className="wrap pb-14">
        <HelpCta />
      </section>
    </>
  );
}
