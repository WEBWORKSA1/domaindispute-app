import type { Metadata } from 'next';
import { DomainLookup } from './lookup';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';

export const metadata: Metadata = {
  title: 'Domain lookup: registration date, registrar and status (RDAP)',
  description: 'Free RDAP lookup for any domain: creation date, expiry, registrar, status codes and name servers. Useful evidence in a domain dispute.',
  alternates: { canonical: '/tools/domain-lookup' },
};

export default function Page() {
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/tools', label: 'Tools' },
          { href: '/tools/domain-lookup', label: 'Domain lookup' },
        ]}
        title="Domain lookup"
        lede="Official registration data from the registry's RDAP service, the successor to WHOIS. Personal details are usually redacted for privacy."
      />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <DomainLookup />
          <div className="prose-dd mt-12">
            <h2>Why the creation date matters</h2>
            <p>
              In a UDRP case, the date a domain was registered is compared with the date the complainant&apos;s trademark rights began. A domain registered before the mark existed generally cannot have been registered in bad faith. Panels look at when the current owner acquired the domain, which may be later than the creation date shown here.
            </p>
            <h2>What the status codes mean</h2>
            <ul>
              <li><strong>client transfer prohibited</strong> - the registrar lock most registrations carry by default.</li>
              <li><strong>server hold / client hold</strong> - the domain does not resolve, often after a suspension.</li>
              <li><strong>redemption period / pending delete</strong> - the domain has expired and may soon become available.</li>
            </ul>
          </div>
        </div>
        <aside className="space-y-6">
          <HelpCta tone="light" />
          <AdSlot name="sidebar" />
        </aside>
      </div>
    </>
  );
}
