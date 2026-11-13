import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SmartForm } from '@/components/smart-form';
import { SPONSOR_PACKAGES } from '@/lib/content/programs';
import { SITE } from '@/lib/site';
import { getOutcomeCounts } from '@/lib/data/cases';
import { num } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Advertise, sponsor or partner with DomainDispute.com',
  description: 'Reach trademark owners, domain investors and IP practitioners. Sponsorships, advertising, referral partnerships, data licensing and acquisition inquiries.',
  alternates: { canonical: '/advertise' },
};

const AUDIENCE = [
  { title: 'Brand and trademark owners', body: 'In-house counsel and marketing teams chasing look-alike domains.' },
  { title: 'Domain owners and investors', body: 'Registrants who just received a complaint, or want to avoid one.' },
  { title: 'IP practitioners', body: 'Lawyers, paralegals and panelists following new filings and decisions.' },
  { title: 'Industry', body: 'Registrars, marketplaces and brand-protection providers.' },
];

export default async function AdvertisePage() {
  const counts = await getOutcomeCounts();
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/advertise', label: 'Advertise & sponsor' }]}
        title="Advertising, sponsorship and partnerships"
        lede={`Put your brand in front of people at the moment a domain dispute matters to them. The site indexes ${counts.total ? num(counts.total) : 'thousands of'} decisions and tracks every new WIPO filing.`}
      />
      <div className="wrap py-12">
        <section>
          <h2 className="font-serif text-2xl font-semibold">Who reads DomainDispute.com</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a) => (
              <div key={a.title} className="border-t-2 border-ink pt-3">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-1 text-[15px] text-ink-soft">{a.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold">Opportunities</h2>
          <ul className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {SPONSOR_PACKAGES.map((p) => (
              <li key={p.name}>
                <h3 className="font-serif text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-[15px] text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm text-muted">
            Sponsored content is always labelled. Sponsors and advertisers have no say over case data, statistics or editorial guides. Display advertising on the site is served by Google AdSense.
          </p>
        </section>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Start a conversation</h2>
            <p className="mt-2 max-w-md text-[15px] text-ink-soft">
              Tell us what you have in mind and we will reply with availability, audience details and pricing. For acquisition of the website or the domain name, you can also{' '}
              <a href={SITE.inquiryUrl} target="_blank" rel="noopener" className="link">contact the owner directly</a>.
            </p>
          </div>
          <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
            <SmartForm
              form="advertise"
              submitLabel="Send inquiry"
              successTitle="Inquiry received."
              successBody="Thank you. We will reply with options and pricing within two business days."
              fields={[
                { name: 'type', label: 'I am interested in', type: 'select', required: true, options: [...SPONSOR_PACKAGES.map((p) => p.name), 'Display advertising', 'Other'] },
                { name: 'name', label: 'Name', required: true, half: true },
                { name: 'email', label: 'Work email', type: 'email', required: true, half: true },
                { name: 'company', label: 'Company', half: true },
                { name: 'website', label: 'Company website', type: 'url', half: true, placeholder: 'https://' },
                { name: 'budget', label: 'Budget range', type: 'select', options: ['Under US$500', 'US$500 - 2,000', 'US$2,000 - 10,000', 'Over US$10,000', 'Not sure yet'] },
                { name: 'message', label: 'What would you like to achieve?', type: 'textarea', rows: 4 },
              ]}
            />
          </div>
        </section>
      </div>
    </>
  );
}
