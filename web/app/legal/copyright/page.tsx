import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Trademark and copyright disclosure',
  description: 'Ownership of DomainsDispute.com content and marks, third-party trademarks, use of public case data, and how to report infringement.',
  alternates: { canonical: '/legal/copyright' },
};

const BODY = `
## Copyright

Copyright (c) 2026 DomainsDispute.com. All rights reserved. The text, guides, glossary, statistics, compilations, automated analyses, page designs, graphics, logo and software on this website are owned by DomainsDispute.com or its licensors and are protected by copyright and database laws in Canada and internationally.

You may quote short excerpts with attribution and a link to the source page. Any other reproduction, republication or systematic extraction, including scraping the case database, requires prior written permission. To ask, use the [contact form](/contact?topic=Partnership).

## Our trademarks

"DomainsDispute", "DomainsDispute.com" and the DomainsDispute.com logo are trademarks of their owner. The domain name domainsdispute.com is privately owned. Inquiries about the website or domain name can be made through the link at the top of every page.

## Third-party trademarks

WIPO, ICANN, Forum (formerly the National Arbitration Forum), the Czech Arbitration Court, ADNDRC, CIIDRC, Nominet, CIRA, YouTube, Google and every company and brand name that appears in case records are trademarks or trade names of their respective owners. They are used only to identify those organisations and the parties to public proceedings. Their appearance does not imply any affiliation with, or endorsement of or by, DomainsDispute.com.

## Public case records

Case numbers, party names, domain names and outcomes are drawn from public lists published by dispute resolution providers. Full decisions remain on the providers' websites, where we link to them; we do not republish decision texts. Party names appear exactly as published by the provider.

## Embedded media

Videos on the site are embedded from YouTube with credit to their creators, who retain all rights.

## Reporting infringement or errors

If you believe material on this site infringes your copyright or trademark, or a case record about you is inaccurate, send a notice through the [contact form](/contact?topic=Data%20correction) including: your contact details, the material concerned and its URL, the basis of your claim, and a statement that the information in your notice is accurate. We review every notice promptly and remove or correct material where appropriate.
`;

export default function CopyrightPage() {
  return <LegalPage title="Trademark and copyright disclosure" slug="copyright" updated="2026-11-13" body={BODY} />;
}
