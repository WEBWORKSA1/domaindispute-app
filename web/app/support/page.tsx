import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SmartForm } from '@/components/smart-form';
import { DONATION_TIERS, PAYMENT_LINKS } from '@/lib/content/programs';

export const metadata: Metadata = {
  title: 'Support DomainDispute.com',
  description: 'Help keep the UDRP case library, live docket and guides free. Donations fund operations, research, promotion, hiring and contest prizes.',
  alternates: { canonical: '/support' },
};

const USES = [
  { title: 'Operations', body: 'Hosting, database, search and the automated daily data collection.' },
  { title: 'Research', body: 'Researcher hours to summarise notable decisions and verify data.' },
  { title: 'Promotion and marketing', body: 'Reaching domain owners who need help before their deadline passes.' },
  { title: 'Hiring talent', body: 'Writers, developers and video producers to expand the platform.' },
  { title: 'Contests and prizes', body: 'Prize funds for the prediction challenge and explainer awards.' },
];

export default function SupportPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/support', label: 'Support the project' }]}
        title="Keep domain dispute research free"
        lede="DomainDispute.com is free to use. Contributions from readers and practitioners pay for the data pipeline, new guides, promotion, new hires and contest prizes."
      />

      <section className="wrap grid gap-12 py-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Ways to give</h2>
          <ul className="mt-5 divide-y divide-bone-2 border-y border-bone-2">
            {DONATION_TIERS.map((t) => (
              <li key={t.name} className="flex items-baseline justify-between gap-4 py-4">
                <span>
                  <span className="block font-semibold">{t.name}</span>
                  <span className="block text-[15px] text-muted">{t.body}</span>
                </span>
                <span className="shrink-0 font-serif text-lg font-semibold tabular-nums">{t.amount}</span>
              </li>
            ))}
          </ul>

          {PAYMENT_LINKS.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {PAYMENT_LINKS.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  {l.label}
                </a>
              ))}
            </div>
          )}

          <h2 className="mt-12 font-serif text-2xl font-semibold">Where the money goes</h2>
          <ul className="mt-4 space-y-3">
            {USES.map((u) => (
              <li key={u.title} className="border-l-2 border-gold pl-4">
                <span className="font-semibold">{u.title}.</span> <span className="text-ink-soft">{u.body}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            DomainDispute.com is a privately operated website, not a registered charity, so contributions are not tax-deductible. Supporters who opt in are thanked by name on the site. Contributions are voluntary and do not buy legal services, advertising or editorial influence.
          </p>
        </div>

        <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">Pledge your support</h2>
          <p className="mt-2 text-[15px] text-ink-soft">
            Tell us how you would like to contribute. We reply with a secure payment link for your chosen amount and frequency, or details for invoices and sponsorship.
          </p>
          <SmartForm
            className="mt-6"
            form="donation"
            submitLabel="Send my pledge"
            successTitle="Thank you for your pledge."
            successBody="We will email you a secure payment link within one business day. Nothing is charged until you complete it."
            fields={[
              { name: 'name', label: 'Name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'amount', label: 'Amount (US$)', type: 'number', required: true, half: true, placeholder: '25' },
              { name: 'frequency', label: 'Frequency', type: 'select', required: true, half: true, options: ['One-time', 'Monthly', 'Yearly'] },
              { name: 'purpose', label: 'Direct my gift to', type: 'select', options: ['Where it is needed most', 'Operations', 'Research', 'Promotion and marketing', 'Hiring talent', 'Contests and prizes'] },
              { name: 'recognition', label: 'Public thanks', type: 'radio', options: ['Thank me by name', 'Keep me anonymous'], defaultValue: 'Keep me anonymous' },
              { name: 'message', label: 'Message (optional)', type: 'textarea', rows: 3 },
            ]}
            consentLabel="I agree that DomainDispute.com may contact me about my pledge."
          />
        </div>
      </section>
    </>
  );
}
