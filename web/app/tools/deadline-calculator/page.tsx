import type { Metadata } from 'next';
import { DeadlineCalculator } from './calculator';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';

export const metadata: Metadata = {
  title: 'UDRP response deadline calculator',
  description: 'Calculate the UDRP response deadline (20 days from commencement), the four-day extension and the typical decision and implementation dates.',
  alternates: { canonical: '/tools/deadline-calculator' },
};

export default function Page() {
  return (
    <>
      <PageHeader
        crumbs={[
          { href: '/tools', label: 'Tools' },
          { href: '/tools/deadline-calculator', label: 'Deadline calculator' },
        ]}
        title="UDRP deadline calculator"
        lede="Enter the date the proceeding commenced, as stated in the provider's notification. The calculator applies the UDRP Rules; always confirm against the provider's notice."
      />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[1fr_320px]">
        <div>
          <DeadlineCalculator />
          <div className="prose-dd mt-12">
            <h2>How the dates are calculated</h2>
            <ul>
              <li><strong>Response due:</strong> 20 days after commencement (UDRP Rules paragraph 5(a)).</li>
              <li><strong>Automatic extension:</strong> 4 extra calendar days if the respondent asks (Rules 5(b)).</li>
              <li><strong>Panel appointed:</strong> usually within 5 calendar days after the response (Rules 6(b)).</li>
              <li><strong>Decision:</strong> the panel is asked to decide within 14 days of appointment (Rules 15(b)).</li>
              <li><strong>Implementation:</strong> a transfer waits 10 business days for a possible court filing (Policy 4(k)).</li>
            </ul>
            <p>Providers may count days differently around weekends and holidays, and panels can extend time in exceptional cases. Use these dates for planning only.</p>
          </div>
        </div>
        <aside className="space-y-6">
          <HelpCta tone="light" title="Short on time?" body="Get a free, confidential case review. Requests with near deadlines are prioritised." href="/get-help?situation=respondent" />
          <AdSlot name="sidebar" />
        </aside>
      </div>
    </>
  );
}
