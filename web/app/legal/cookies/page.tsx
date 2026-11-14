import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Cookie policy',
  description: 'Which cookies and similar technologies DomainsDispute.com uses, including Google AdSense, and how to control them.',
  alternates: { canonical: '/legal/cookies' },
};

const BODY = `
Cookies are small files a website stores in your browser. Similar technologies include local storage and pixels. This policy explains how DomainsDispute.com uses them.

## Cookies we use

| Type | Provider | Purpose | Can you refuse? |
| --- | --- | --- | --- |
| Strictly necessary | DomainsDispute.com | Remembers your cookie choice and whether you closed a banner (browser local storage) | No, but they hold no personal data |
| Advertising | Google AdSense and its partners | Serve and measure ads, limit repetition, and personalise ads where permitted | Yes |
| Embedded video | YouTube (privacy-enhanced mode) | Set only after you press play on a video | Yes, by not playing videos |

## Advertising cookies

Google and its partners use cookies to serve ads based on your visits to this and other websites. You can:

- turn off personalised ads at [Google Ads Settings](https://adssettings.google.com);
- choose "Non-personalised ads only" in our cookie notice;
- use [aboutads.info](https://www.aboutads.info/choices) or [youronlinechoices.eu](https://www.youronlinechoices.eu) to opt out of many vendors.

Visitors in the EEA, the UK and Switzerland see a consent message before personalised advertising cookies are used.

## Controlling cookies in your browser

All modern browsers let you block or delete cookies in their settings. Blocking all cookies may affect how some pages work. Clearing your browser storage also resets your choice in our cookie notice so you can choose again.

## Changes

We update this policy when the cookies we use change. See also the [privacy policy](/legal/privacy).
`;

export default function CookiesPage() {
  return <LegalPage title="Cookie policy" slug="cookies" updated="2026-11-13" body={BODY} />;
}
