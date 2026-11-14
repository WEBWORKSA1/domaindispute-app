import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Legal disclaimer',
  description: 'DomainsDispute.com provides legal information and public data, not legal advice.',
  alternates: { canonical: '/legal/disclaimer' },
};

const BODY = `
## Not legal advice

DomainsDispute.com publishes general information about domain name disputes, public case records and self-help tools. This information is not legal advice and may not apply to your circumstances. Laws, rules, fees and provider practices change; we update the site regularly but cannot guarantee that every page reflects the latest position.

## No attorney-client relationship

DomainsDispute.com is not a law firm. Reading the site, using the tools, contacting us or requesting a free case review does not create an attorney-client relationship, and communications with us are not protected by legal privilege.

## Automated analysis and estimates

Domain analysis on case pages, statistics and deadline estimates are generated automatically from public data. They are not findings of any panel and may be wrong. Always rely on the official decision and the provider's notices, and confirm deadlines directly with the provider.

## Past results

Statistics and past decisions describe what happened in other cases. They do not predict the outcome of any particular dispute.

## Independence

DomainsDispute.com is independent and is not affiliated with, endorsed by or sponsored by WIPO, ICANN, Forum, the Czech Arbitration Court or any other dispute resolution provider, registrar or registry.

## Referrals

If you ask us to introduce you to a lawyer, that lawyer is independent. We do not supervise their work and are not responsible for their advice or fees.
`;

export default function DisclaimerPage() {
  return <LegalPage title="Legal disclaimer" slug="disclaimer" updated="2026-11-13" body={BODY} />;
}
