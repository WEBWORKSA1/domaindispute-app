import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { SmartForm } from '@/components/smart-form';
import { ROLES } from '@/lib/content/programs';

export const metadata: Metadata = {
  title: 'Careers: work on DomainDispute.com',
  description: 'Join our talent pool: domain dispute researchers, legal writers, developers, partnership leads and video producers. Remote.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/careers', label: 'Careers' }]}
        title="Work with us"
        lede="We are building the most useful free resource on domain name disputes. All roles are remote and flexible. Join the talent pool and we contact you when a project fits."
      />
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <h2 className="font-serif text-2xl font-semibold">Open roles</h2>
          <ul className="mt-5 divide-y divide-bone-2 border-y border-bone-2">
            {ROLES.map((r) => (
              <li key={r.title} className="py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold">{r.title}</h3>
                  <span className="text-sm text-muted">{r.type}</span>
                </div>
                <p className="mt-1.5 text-[15px] text-ink-soft">{r.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            We welcome applicants from any country. Contract terms and rates are agreed per project. We do not charge applicants fees of any kind.
          </p>
        </section>
        <section className="rounded-xl border border-bone-2 p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">Join the talent pool</h2>
          <SmartForm
            className="mt-6"
            form="careers"
            submitLabel="Submit application"
            successTitle="Application received."
            successBody="Thank you. We review every application and contact you when a project matches your skills."
            fields={[
              { name: 'role', label: 'Role', type: 'select', required: true, options: [...ROLES.map((r) => r.title), 'Other'] },
              { name: 'name', label: 'Name', required: true, half: true },
              { name: 'email', label: 'Email', type: 'email', required: true, half: true },
              { name: 'location', label: 'Location and time zone', half: true },
              { name: 'availability', label: 'Availability', type: 'select', half: true, options: ['A few hours a week', 'Part-time', 'Full-time', 'Project-based'] },
              { name: 'portfolio', label: 'Portfolio, LinkedIn or GitHub', type: 'url', placeholder: 'https://' },
              { name: 'message', label: 'Why you, in a few lines', type: 'textarea', required: true, rows: 5 },
            ]}
            consentLabel="I agree that DomainDispute.com may keep my application for up to 12 months and contact me about opportunities."
          />
        </section>
      </div>
    </>
  );
}
