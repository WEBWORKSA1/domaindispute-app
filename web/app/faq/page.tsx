import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCta, PageHeader } from '@/components/ui';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Domain dispute FAQ',
  description: 'Answers to common questions about UDRP complaints, deadlines, costs, self-representation and how DomainDispute.com works.',
  alternates: { canonical: '/faq' },
};

const FAQS: Array<{ q: string; a: string; link?: { href: string; label: string } }> = [
  { q: 'Is DomainDispute.com a law firm?', a: 'No. We publish legal information, public case records and free tools. We do not give legal advice, and using the site does not create an attorney-client relationship.' },
  { q: 'Do I need a lawyer for a UDRP case?', a: 'No. Representation is optional: the UDRP Rules only ask for details of "any representative authorized to act" for a party, and providers publish model complaint and response forms for parties filing themselves. Consider a lawyer when the domain is valuable or the facts are complex.', link: { href: '/resources/self-representation-guide', label: 'Representing yourself' } },
  { q: 'How long do I have to respond to a complaint?', a: 'Twenty days from the date the proceeding commenced (Rules 5(a)). You can request four extra calendar days, which providers grant automatically on a first request.', link: { href: '/tools/deadline-calculator', label: 'Deadline calculator' } },
  { q: 'How much does a UDRP cost?', a: 'Provider fees for a single panelist start at EUR 800 at CAC (1-5 domains), US$1,330 at Forum (1-2 domains) and US$1,500 at WIPO (1-5 domains). The complainant pays; the respondent pays nothing unless it requests a three-member panel.', link: { href: '/tools/fee-estimator', label: 'Fee estimator' } },
  { q: 'What does the complainant have to prove?', a: 'That the domain is identical or confusingly similar to its trademark, that the respondent has no rights or legitimate interests in it, and that it was registered and is being used in bad faith (Policy 4(a)).', link: { href: '/three-element-test', label: 'The three-element test' } },
  { q: 'Can I get money through the UDRP?', a: 'No. The only remedies are transfer or cancellation of the domain. Damages require a court action, for example under the US ACPA.' },
  { q: 'Where does your case data come from?', a: 'From the public case and decision lists published by the WIPO Arbitration and Mediation Center. An automated pipeline refreshes filings several times a day and decisions daily.', link: { href: '/about', label: 'About our data' } },
  { q: 'How accurate are the response deadlines on case pages?', a: 'They are estimates: commencement date plus 20 days. Always rely on the date in the provider\'s official notice.' },
  { q: 'Can you remove or correct a case listing?', a: 'Case records mirror the provider\'s public data. If something is wrong, send a correction request with the case number and we fix it promptly.', link: { href: '/contact?topic=Data%20correction', label: 'Request a correction' } },
  { q: 'Is the case review really free?', a: 'Yes. We reply with general information about your options at no cost and with no obligation. If you ask, we can introduce you to an independent lawyer.', link: { href: '/get-help', label: 'Free case review' } },
  { q: 'How is the site funded?', a: 'By display advertising from Google AdSense, sponsorships, partnerships and voluntary reader support. Funders have no influence over data or guides.', link: { href: '/support', label: 'Support the project' } },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <PageHeader crumbs={[{ href: '/faq', label: 'FAQ' }]} title="Frequently asked questions" />
      <div className="wrap py-10">
        <dl className="max-w-3xl divide-y divide-bone-2 border-y border-bone-2">
          {FAQS.map((f) => (
            <div key={f.q} className="py-5">
              <dt className="font-serif text-xl font-semibold text-ink">{f.q}</dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                {f.a}{' '}
                {f.link && (
                  <Link href={f.link.href} className="link">
                    {f.link.label}
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-12">
          <HelpCta />
        </div>
      </div>
    </>
  );
}
