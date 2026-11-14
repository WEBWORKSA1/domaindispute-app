import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SmartForm } from '@/components/smart-form';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact DomainsDispute.com',
  description: 'Send a question, data correction, press, partnership, advertising or acquisition inquiry to DomainsDispute.com.',
  alternates: { canonical: '/contact' },
};

const TOPICS = [
  'General question',
  'Help with a dispute',
  'Data correction',
  'Advertising',
  'Sponsorship',
  'Partnership',
  'Website / domain acquisition',
  'Press or media',
  'Video submission',
  'Contest question',
  'Careers',
  'Donations',
  'Privacy request',
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/contact', label: 'Contact' }]}
        title="Contact us"
        lede="Use the form and we reply by email, usually within one business day. We are not a law firm and cannot give legal advice by email."
      />
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-xl border border-bone-2 p-5 sm:p-7">
          <SmartForm
            form="contact"
            submitLabel="Send message"
            successTitle="Message sent."
            successBody="Thank you. We usually reply within one business day."
            fields={[
              { name: 'topic', label: 'Topic', type: 'select', required: true, options: TOPICS },
              { name: 'name', label: 'Name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'case', label: 'Case number, domain or page (optional)' },
              { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 6 },
            ]}
          />
        </section>
        <aside className="space-y-8">
          <div>
            <h2 className="font-serif text-xl font-semibold">Have a domain dispute?</h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              The <Link href="/get-help" className="link">free case review</Link> asks the right questions up front, so we can answer faster.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold">Buying the website or domain</h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              For acquisition, sponsorship, advertising or partnership, choose the matching topic, or{' '}
              <a href={SITE.inquiryUrl} target="_blank" rel="noopener" className="link">contact the owner directly</a>.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold">Corrections and removals</h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              Case records mirror the provider&apos;s public data. If something is wrong or you are a party asking about a listing, choose &ldquo;Data correction&rdquo; and include the case number.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
