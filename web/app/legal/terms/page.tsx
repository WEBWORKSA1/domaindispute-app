import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'The terms that apply to using DomainDispute.com, its data, tools and forms.',
  alternates: { canonical: '/legal/terms' },
};

const BODY = `
By using DomainDispute.com (the "site") you agree to these terms. If you do not agree, please do not use the site.

## 1. Information, not legal advice

The site provides general legal information, public case records and self-help tools. It is not a law firm, does not provide legal advice, and using the site, including the free case review, does not create an attorney-client relationship. Outcomes of past cases do not predict the outcome of yours. For advice about your situation, consult a qualified lawyer. See the [legal disclaimer](/legal/disclaimer).

## 2. Accuracy of data

Case records are collected automatically from public provider databases and may contain errors, omissions or delays. Deadlines shown on the site are estimates; always rely on the official notice from the dispute resolution provider. We correct errors promptly when notified.

## 3. Acceptable use

You agree not to:

- scrape, copy or redistribute substantial parts of the site or its database without written permission;
- use automated tools in a way that degrades the site for others;
- submit false, abusive or unlawful content through any form;
- use the site to harass any party to a dispute.

## 4. Intellectual property

The site's design, text, guides, compilations, statistics, analysis and code are protected by copyright and other laws. Decisions themselves are published by the relevant providers. Trademarks shown belong to their owners. See [trademark & copyright](/legal/copyright).

## 5. Third-party links and services

The site links to provider websites, YouTube videos and other resources we do not control. Advertising is served by Google AdSense. We are not responsible for third-party content or practices.

## 6. Donations, contests and referrals

Voluntary contributions are not tax-deductible and do not purchase any service. Contests are governed by the [official contest rules](/legal/contest-rules). Any lawyer we introduce you to is independent; your engagement with them is solely between you and them.

## 7. No warranty; limitation of liability

The site is provided "as is" without warranties of any kind. To the fullest extent permitted by law, DomainDispute.com is not liable for any indirect, incidental or consequential loss, or for any loss arising from reliance on information on the site, including missed deadlines.

## 8. Changes and termination

We may change these terms or the site at any time. Continued use after a change means you accept the updated terms.

## 9. Governing law

These terms are governed by the laws of the Province of Quebec and the federal laws of Canada applicable there, without regard to conflict-of-law rules, except where your local consumer law gives you mandatory rights.

## 10. Contact

Questions about these terms: use the [contact form](/contact).
`;

export default function TermsPage() {
  return <LegalPage title="Terms of use" slug="terms" updated="2026-11-13" body={BODY} />;
}
