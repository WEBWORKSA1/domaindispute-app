import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Official contest rules',
  description: 'Official rules for DomainDispute.com contests: eligibility, how to enter, judging, prizes and privacy.',
  alternates: { canonical: '/legal/contest-rules' },
};

const BODY = `
These rules apply to every contest listed on the [contests page](/contests) unless a contest page states otherwise.

## 1. No purchase necessary

No purchase, payment or donation is required to enter or win. A purchase or donation does not improve your chance of winning.

## 2. Organiser

Contests are organised by DomainDispute.com ("the organiser").

## 3. Eligibility

Open to individuals who are 18 or older (or the age of majority where they live) at the time of entry. Employees and contractors of the organiser and of any prize sponsor, and their immediate families, are not eligible. Void where prohibited or restricted by law. Residents of jurisdictions where the contest would require registration, bonding or other formalities the organiser has not completed are not eligible for prizes.

## 4. How to enter

Enter using the form on the contests page during the entry period shown. One entry per person per contest. Entries must be your own original work and must not infringe anyone's rights. Incomplete, late or automated entries are void.

## 5. Judging

- **Prediction challenges** are scored objectively against the outcomes published by the dispute resolution provider. A case terminated without a decision is removed from scoring. Ties are broken by the earliest complete entry.
- **Creative awards** are judged by the organiser on accuracy (50%), clarity (40%) and originality (10%).

The organiser's decisions are final.

## 6. Prizes

Prizes are described on each contest page and announced before the round opens. Prizes are non-transferable and no cash alternative is offered unless stated. Sponsor-provided prizes are supplied and fulfilled by the named sponsor. If a prize becomes unavailable, the organiser may substitute one of equal or greater value.

## 7. Winners

Winners are notified by email within 14 days of the end of the contest and must reply within 14 days or an alternate winner may be chosen. Canadian residents must correctly answer a time-limited, mathematical skill-testing question before receiving a prize. Winners may be required to sign a declaration of eligibility and release.

## 8. Publicity

Unless you opt out, winners agree to have their name, country and winning entry published on the site.

## 9. Privacy

Entry information is used to run the contest and contact entrants, as described in our [privacy policy](/legal/privacy).

## 10. Changes and cancellation

The organiser may modify, suspend or cancel a contest if fraud, technical failure or any other factor beyond its control impairs its integrity, subject to applicable law.

## 11. Disputes

These rules are governed by the laws of the Province of Quebec and the federal laws of Canada applicable there. For Quebec residents: any litigation respecting the conduct or organisation of a publicity contest may be submitted to the Regie des alcools, des courses et des jeux for a ruling.
`;

export default function ContestRulesPage() {
  return <LegalPage title="Official contest rules" slug="contest-rules" updated="2026-11-13" body={BODY} />;
}
