import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How DomainDispute.com collects, uses and protects personal information, including cookies and Google advertising.',
  alternates: { canonical: '/legal/privacy' },
};

const BODY = `
This policy explains what personal information DomainDispute.com ("we", "us") collects, why, and the choices you have. It applies to the website at domaindispute.com and its subdomains.

## Information you give us

When you use a form on the site (case review, contact, newsletter, donation pledge, contest entry, careers or advertising inquiry) we collect what you enter: typically your name, email address and the details of your request. Some forms ask for optional information such as a phone number, country, domain names or budget.

We use this information only to answer your request, deliver the service you asked for (for example the daily brief), administer contests, process pledges and applications, and keep records of our correspondence. If you ask us for a referral to a lawyer, we share your summary with that lawyer only after you approve it.

## Information collected automatically

Like most websites, our hosting provider records technical information such as your IP address, browser type, pages visited and timestamps, to operate and secure the site. We use this in aggregate to understand which pages are useful.

## Advertising and cookies

We use **Google AdSense** to show advertising. Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.

- You can opt out of personalised advertising by visiting [Google Ads Settings](https://adssettings.google.com).
- You can opt out of some third-party vendors' use of cookies for personalised advertising at [aboutads.info](https://www.aboutads.info/choices) and, in the EU, [youronlinechoices.eu](https://www.youronlinechoices.eu).
- Learn how Google uses information from sites that use its services at [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

Visitors in the European Economic Area, the UK and Switzerland are shown a consent message before personalised ads are served. You can choose non-personalised ads in our cookie notice at any time by clearing your browser storage. See the [cookie policy](/legal/cookies) for details.

## Embedded content

Video pages embed YouTube players using YouTube's privacy-enhanced mode. The player loads only when you press play; YouTube may then set cookies under its own privacy policy.

## Where data is stored

Form submissions are stored in our database hosted by Supabase and delivered to our team by email through a form-forwarding service. The site is hosted by Vercel. These providers process data on our behalf under their own security commitments and may store it outside your country.

## How long we keep it

We keep inquiries and case review requests for up to 24 months, career applications for up to 12 months, and newsletter subscriptions until you unsubscribe. We delete data sooner on request unless we must keep it for legal reasons.

## Your rights

Depending on where you live (including under the GDPR, the UK GDPR, Canada's PIPEDA, Quebec's Law 25 and US state privacy laws such as the CCPA), you may have the right to access, correct, delete or port your personal information, to object to or restrict processing, and to withdraw consent. We do not sell personal information and do not share it for cross-context behavioural advertising other than through Google advertising cookies described above.

To exercise a right, use the [contact form](/contact?topic=Privacy%20request) and choose "Privacy request". We respond within 30 days. You may also complain to your local data protection authority.

## Children

The site is intended for adults. We do not knowingly collect information from children under 16.

## Changes

We may update this policy. The date at the top shows the latest revision. Material changes are announced on this page.

## Contact

Questions about this policy: use the [contact form](/contact?topic=Privacy%20request).
`;

export default function PrivacyPage() {
  return <LegalPage title="Privacy policy" slug="privacy" updated="2026-11-13" body={BODY} />;
}
