/**
 * Pre-Check logic - server-side.
 * Mirrors the client-side fallback in app/start/page.tsx.
 */

import type { LeadSource } from '@/types/database';

export type UserRole = 'COMPLAINANT' | 'RESPONDENT' | 'COUNSEL';
export type Verdict = 'STRONG' | 'MODERATE' | 'WEAK' | 'WALK_AWAY';

export interface PreCheckInput {
  role: UserRole;
  domain: string;
  hasTrademark: boolean;
  domainOlderThanTM: boolean;
  hasOfferedToBuy: boolean;
  email?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface PreCheckResult {
  verdict: Verdict;
  headline: string;
  summary: string;
  flags: string[];
  recommendations: string[];
  similarPattern?: string;
}

export function runPreCheck(input: PreCheckInput): PreCheckResult {
  const { role, hasTrademark, domainOlderThanTM, hasOfferedToBuy } = input;

  if (role === 'COMPLAINANT' || role === 'COUNSEL') {
    if (!hasTrademark) {
      return {
        verdict: 'WALK_AWAY',
        headline: 'You may not have UDRP standing.',
        summary:
          'UDRP requires registered or strongly-documented common-law trademark rights. Without a registered TM and without documented use in commerce, panels typically dismiss for lack of standing.',
        flags: ['No registered trademark', 'No documented common-law rights'],
        recommendations: [
          'Register your trademark first if you intend to enforce it',
          'Document your common-law use (sales, advertising, press) for at least 6 months',
          'Reconsider whether UDRP is the right tool for your situation',
        ],
      };
    }

    if (domainOlderThanTM) {
      return {
        verdict: 'WALK_AWAY',
        headline: 'Filing may trigger RDNH against you.',
        summary:
          'When the domain was registered before your trademark existed, registration cannot be in bad faith. It is one of the most common reasons panels find reverse domain name hijacking.',
        flags: ['Chronological barrier - domain predates trademark', 'High RDNH risk'],
        recommendations: [
          'Do not file UDRP - RDNH risk is high',
          'Consider purchase negotiation instead',
          'Request a free case review for a second opinion',
        ],
        similarPattern: 'aged-domain',
      };
    }

    if (hasOfferedToBuy) {
      return {
        verdict: 'WEAK',
        headline: 'Plan-B abuse risk - proceed with caution.',
        summary:
          'Filing a UDRP after a failed purchase negotiation is a recognised RDNH pattern ("Plan B"). Panels see through it.',
        flags: ['Prior purchase offer made', 'Plan-B abuse pattern'],
        recommendations: [
          'Document why your case is independently strong on the merits',
          'Request a free case review to test your strongest framing',
          'Avoid referencing the purchase negotiation in your complaint',
          'Consider walking away if your underlying merits are thin',
        ],
        similarPattern: 'rdnh',
      };
    }

    return {
      verdict: 'STRONG',
      headline: 'Your case looks viable.',
      summary:
        'Based on these three answers, your case profile is consistent with successful complainant filings. The next step is a deeper analysis.',
      flags: [],
      recommendations: [
        'Search the case library for decisions with similar facts',
        'Preserve evidence now: screenshots, WHOIS history, MX records, archive.org snapshots',
        'Identify the right provider (WIPO for most; URS for clear-cut new gTLD typosquats)',
      ],
    };
  }

  // RESPONDENT path
  if (domainOlderThanTM) {
    return {
      verdict: 'STRONG',
      headline: 'Strong defense - you should respond.',
      summary:
        'Your domain registration predates the complainant trademark. This is the most reliable defense in UDRP and a frequent RDNH trigger against the complainant.',
      flags: [],
      recommendations: [
        'Do not default - file a response',
        'Document the domain registration date with WHOIS history',
        'Request a free case review to identify additional defenses',
        'Read the guide on responding to a UDRP complaint',
      ],
      similarPattern: 'aged-domain',
    };
  }

  if (hasOfferedToBuy) {
    return {
      verdict: 'STRONG',
      headline: 'Plan-B pattern likely - strong RDNH potential.',
      summary:
        'When a complainant offers to buy your domain and then files UDRP after the offer fails, panels increasingly find RDNH.',
      flags: [],
      recommendations: [
        'Do not default - file a response',
        'Preserve all communications about the purchase offer',
        'Search the case library for RDNH decisions on similar facts',
        'Ask the panel for an RDNH finding if the complainant ignored your earlier registration',
      ],
      similarPattern: 'rdnh',
    };
  }

  return {
    verdict: 'MODERATE',
    headline: 'Defense possible - needs full analysis.',
    summary:
      'Your situation requires deeper analysis to identify viable defenses. Common defenses include legitimate interest under section 4(c), generic-word use, and lack of targeting evidence.',
    flags: ['No clear chronological barrier'],
    recommendations: [
      'Request a free case review to identify your strongest defenses',
      'Document business records, registration date, and any independent use',
      'Do not default - even a brief response improves outcomes significantly',
    ],
  };
}

export function verdictToFunnelStage(verdict: Verdict): 'PRE_CHECK_DONE' | 'CHURNED' {
  return 'PRE_CHECK_DONE';
}

export function inferLeadSource(input: {
  utm_source?: string;
  utm_medium?: string;
}): LeadSource {
  const src = (input.utm_source ?? '').toLowerCase();
  const med = (input.utm_medium ?? '').toLowerCase();
  if (src === 'google' || med === 'cpc') return 'PAID_GOOGLE';
  if (src === 'linkedin') return 'PAID_LINKEDIN';
  if (src === 'outbound' || med === 'email') return 'OUTBOUND';
  if (src === 'newsletter' || med === 'email_magnet') return 'EMAIL_MAGNET';
  if (src) return 'REFERRAL';
  return 'ORGANIC';
}
