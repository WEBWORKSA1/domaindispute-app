import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCta, PageHeader } from '@/components/ui';
import { getOutcomeCounts } from '@/lib/data/cases';
import { num } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About DomainsDispute.com',
  description: 'What DomainsDispute.com is, where the data comes from, how it updates, our editorial standards and how the site is funded.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const counts = await getOutcomeCounts();
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/about', label: 'About' }]}
        title="About DomainsDispute.com"
        lede="A free, independent resource for anyone involved in a domain name dispute: the registrant who just received a complaint, the brand owner deciding whether to file, and the researcher tracking how panels decide."
      />
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="prose-dd">
          <h2>What we do</h2>
          <p>
            Domain disputes move fast. A respondent usually has 20 days to answer a UDRP complaint, and the information needed to make good decisions is scattered across provider websites, PDFs and practitioner blogs. DomainsDispute.com brings it together in one place:
          </p>
          <ul>
            <li>A searchable library of {counts.total ? num(counts.total) : 'thousands of'} WIPO gTLD decisions, with an automated analysis of each disputed domain.</li>
            <li>A live docket of newly filed complaints with estimated response deadlines.</li>
            <li>Statistics, a daily brief, plain-English guides and free tools.</li>
            <li>A free case review service that helps people understand their options.</li>
          </ul>

          <h2>Where the data comes from</h2>
          <p>
            Case records come from the public decision and case lists published by the WIPO Arbitration and Mediation Center. An automated pipeline collects new filings several times a day and new decisions daily, and every page links back to the official record. We do not alter decisions; when the provider changes a record, our copy updates on the next refresh.
          </p>

          <h2>Editorial standards</h2>
          <ul>
            <li>Guides cite the UDRP Policy and Rules by paragraph so readers can check the source.</li>
            <li>Statistics are computed from our index, with the method explained on the <Link href="/stats">statistics page</Link>.</li>
            <li>Automated analysis is labelled as automated and never presented as a panel finding.</li>
            <li>Sponsors and advertisers have no influence over data or editorial content.</li>
            <li>Errors are corrected promptly; use the <Link href="/contact?topic=Data%20correction">correction form</Link>.</li>
          </ul>

          <h2>What we are not</h2>
          <p>
            DomainsDispute.com is not a law firm and is not affiliated with WIPO, ICANN, Forum or any other dispute resolution provider. Nothing on the site is legal advice. If you need advice about your situation, speak to a qualified lawyer; the case review can introduce you to one if you ask.
          </p>

          <h2>How the site is funded</h2>
          <p>
            The site is free to use. It is funded by display advertising served by Google AdSense, sponsorships, partnerships and voluntary <Link href="/support">reader support</Link>.
          </p>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h2 className="font-semibold">Get in touch</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li><Link href="/contact" className="link">Contact form</Link></li>
              <li><Link href="/advertise" className="link">Advertising and partnerships</Link></li>
              <li><Link href="/careers" className="link">Careers</Link></li>
            </ul>
          </div>
        </aside>
      </div>
      <section className="wrap pb-14">
        <HelpCta />
      </section>
    </>
  );
}
