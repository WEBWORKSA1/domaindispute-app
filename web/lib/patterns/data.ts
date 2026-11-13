/**
 * Pattern definitions for the 12 SEO cluster landing pages.
 * One source of truth: this file. Routes consume this. Sitemap consumes this.
 * Slugs match cluster_tag values in the cases table.
 */

import type { ClusterTag } from '@/types/database';

export interface PatternKeyword {
  term: string;
  volume?: number;
}

export interface PatternFAQ {
  question: string;
  answer: string;
}

export interface PatternDefinition {
  slug: ClusterTag;
  name: string;
  headline: string;
  headlineEm: string;
  lede: string;
  metaTitle: string;
  metaDescription: string;
  keywords: PatternKeyword[];
  number: string;
  eyebrowSuffix: string;
  whatIsIt: string[];
  doctrine: {
    title: string;
    paragraphs: string[];
  };
  passChecklist: string[];
  failChecklist: string[];
  faqs: PatternFAQ[];
  anatomy?: Array<{ label: string; original: string; transformed: string; note: string }>;
}

const COMMON_FAQ_BUDGET: PatternFAQ = {
  question: 'How much does it cost to file?',
  answer:
    'Provider fees for a single-panelist UDRP start at EUR 800 (CAC, 1-5 domains), US$1,330 (Forum, 1-2 domains) and US$1,500 (WIPO, 1-5 domains). A URS costs around US$375 at Forum. Compare them in the fee estimator at /tools/fee-estimator.',
};

const COMMON_FAQ_TIMELINE: PatternFAQ = {
  question: 'How long does it take?',
  answer:
    'A standard UDRP completes in approximately 60 days from filing to decision. WIPO\'s expedited track, introduced in 2026, targets a decision within about a month at a higher fee. A URS usually resolves within a few weeks but provides only suspension, not transfer.',
};

const COMMON_FAQ_SELF_REP: PatternFAQ = {
  question: 'Can I really represent myself?',
  answer:
    'Yes. Representation is optional: the UDRP Rules only ask for details of "any representative authorized to act" for a party (paragraphs 3(b)(ii) and 5(c)(ii)), and providers such as WIPO publish model complaints and responses that parties can complete themselves.',
};

export const PATTERNS: PatternDefinition[] = [
  {
    slug: 'famous-brand',
    name: 'Famous Brand Enforcement',
    headline: 'Defend a famous mark against',
    headlineEm: 'unauthorized use.',
    lede: 'Globally famous trademarks enjoy a near-presumption of bad faith when registered without authorization. Michelin, Hershey, WhatsApp, Intel, CVS - all have moved swiftly through UDRP. Success rate approaches 99% for clear-cut cases.',
    metaTitle: 'Famous Brand UDRP - Recover Domains Targeting Your Brand',
    metaDescription: 'How globally famous brands defend against unauthorized domain use. Real recent cases including Michelin, WhatsApp, Intel, CVS. Self-representation guide and pre-check.',
    keywords: [
      { term: 'famous brand UDRP', volume: 320 },
      { term: 'recover trademark domain', volume: 480 },
      { term: 'cybersquatting attorney', volume: 1900 },
      { term: 'brand impersonation domain', volume: 210 },
    ],
    number: '01',
    eyebrowSuffix: 'Famous Brand Enforcement',
    whatIsIt: [
      'Famous brand enforcement is the largest single category of UDRP filings worldwide. When a globally recognized trademark - Michelin, Coca-Cola, WhatsApp, SAP - appears in a domain registered without authorization, panels apply a near-presumption of bad faith.',
      'The reason is structural: the famous mark is so widely known that the respondent cannot plausibly claim independent adoption.',
    ],
    doctrine: {
      title: 'How panels analyze famous-brand cases',
      paragraphs: [
        'The three-element test (UDRP section 4(a)) applies as it does to all UDRP cases, but each element gets specific treatment when the trademark is famous.',
        '**Element 1 - Identity/Similarity.** Disregard the TLD; compare the dominant element to the famous mark. Almost always satisfied.',
        '**Element 2 - Legitimate interest.** The complainant makes a prima facie showing easily; the respondent then bears the burden. Reseller defenses fail unless the Oki Data test is met.',
        '**Element 3 - Bad faith.** The "famous mark" doctrine effectively presumes registration in bad faith because actual or constructive notice of the famous trademark is deemed established.',
      ],
    },
    passChecklist: [
      'Your trademark is registered in the relevant jurisdictions and the domain registration date postdates your registration',
      'The disputed domain incorporates the dominant element of your mark with no independent meaning',
      'The respondent’s site shows PPC parking, redirect to competitors, phishing, or sale listing',
      'You have not previously offered to purchase the domain',
      'The respondent is not commonly known by the disputed string',
      'You have screenshots, archive.org snapshots, and MX records preserved as exhibits',
    ],
    failChecklist: [
      'The domain registration predates your trademark rights (chronological barrier - RDNH risk)',
      'Your trademark is still a pending application',
      'You made a purchase offer that was refused (Plan-B abuse pattern - RDNH risk)',
      'The respondent operates a documented independent business under the disputed name',
      'Your common-law rights are thin (no documented sales, advertising, or press coverage)',
    ],
    faqs: [
      {
        question: 'Does my trademark need to be registered worldwide?',
        answer: 'No. UDRP recognizes trademark rights in any jurisdiction. A US registration alone is enough to establish standing.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_TIMELINE,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'typosquatting',
    name: 'Typosquatting',
    headline: 'One letter off,',
    headlineEm: 'same outcome.',
    lede: 'Typosquatting is one of the most common UDRP fact patterns - and one of the most reliably won by complainants. Single-character substitution, prefix/suffix typos, homoglyph attacks fall to UDRP panels with predictable consistency.',
    metaTitle: 'Typosquatting UDRP - How to File a Complaint Yourself',
    metaDescription: 'Recover a typosquatted domain via UDRP. Real 2024-2026 cases. Pass/fail checklist. Self-representation guide.',
    keywords: [
      { term: 'typosquatting UDRP', volume: 890 },
      { term: 'file UDRP for typosquat', volume: 170 },
      { term: 'homoglyph domain dispute', volume: 110 },
      { term: 'recover typosquatted domain', volume: 320 },
    ],
    number: '02',
    eyebrowSuffix: 'Typosquatting',
    whatIsIt: [
      'Typosquatting is the registration of a domain name that exploits common typographical errors - single-character substitution, deletion, transposition, or addition of letters/digits.',
      'Panels routinely treat typosquatting itself as evidence of bad-faith registration under UDRP Paragraph 4(b)(iv).',
      'A typosquat domain has no independent meaning. It exists only as a near-miss for the trademark.',
    ],
    doctrine: {
      title: 'How panels analyze typosquats',
      paragraphs: [
        '**Element 1 - Confusing similarity.** A single-character difference virtually always satisfies this element.',
        '**Element 2 - No legitimate interest.** Typosquats are particularly vulnerable here. The domain has no dictionary meaning to support an independent adoption defense.',
        '**Element 3 - Bad faith.** Essentially self-proving. Registering a one-character variant of a known mark demonstrates targeting.',
      ],
    },
    passChecklist: [
      'Your trademark was registered before the disputed domain registration date',
      'The disputed domain incorporates the dominant element of your mark with no independent meaning',
      'The respondent’s website shows PPC parking, redirect, phishing, or sale listing',
      'You have not previously offered to purchase the domain',
      'The respondent is not commonly known by the disputed string',
      'You have evidence preserved (screenshots, MX records, archive.org snapshots)',
    ],
    failChecklist: [
      'The domain registration predates your trademark rights',
      'Your trademark is still a pending application',
      'You made a purchase offer that was refused',
      'The respondent operates a documented independent business under the name',
      'The "typo" is actually a dictionary word with independent meaning',
    ],
    anatomy: [
      { label: 'Substitution', original: 'intel.com', transformed: 'lntel.com', note: 'capital I -> lowercase L' },
      { label: 'Deletion', original: 'amazon.com', transformed: 'amzon.com', note: 'missing letter' },
      { label: 'Transposition', original: 'google.com', transformed: 'gogole.com', note: 'swapped letters' },
      { label: 'Addition', original: 'whatsapp.com', transformed: 'whatsappp.com', note: 'extra letter' },
      { label: 'Prefix/Suffix', original: 'instagram', transformed: 'ssinsta.app', note: 'prefix attached' },
      { label: 'Dot-omission', original: 'my.hr.hersheys', transformed: 'myhrhersheys.com', note: 'removes period' },
    ],
    faqs: [
      {
        question: 'What if the respondent claims they registered the typo by accident?',
        answer: 'Panels rarely accept "accidental" typo registration as a defense. The pattern of registering near-misses for valuable brands is itself evidence of intent.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_TIMELINE,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'phishing',
    name: 'Phishing & Active Fraud',
    headline: 'When the domain itself is',
    headlineEm: 'the weapon.',
    lede: 'The fastest-moving UDRP category. Panels routinely transfer where evidence shows phishing, malware delivery, fake login portals, or impersonation. Bad faith is rarely contestable.',
    metaTitle: 'Phishing Domain UDRP - Take Down a Fraud Site Fast',
    metaDescription: 'Recover a domain being used for phishing, fake logins, or fraud. UDRP for active phishing campaigns moves fast.',
    keywords: [
      { term: 'phishing domain takedown', volume: 480 },
      { term: 'UDRP phishing case', volume: 140 },
      { term: 'fake login domain', volume: 190 },
      { term: 'employee portal impersonation', volume: 90 },
    ],
    number: '03',
    eyebrowSuffix: 'Phishing & Active Fraud',
    whatIsIt: [
      'Phishing cases are the easiest UDRP fact pattern to win on the merits and the most urgent to file.',
      'The 2024-2025 trend has been increasingly sophisticated: dot-omission attacks, employee-portal impersonation, modified-app distribution domains.',
    ],
    doctrine: {
      title: 'How panels analyze phishing cases',
      paragraphs: [
        'Phishing fact patterns are essentially self-proving on bad faith. The challenge is procedural urgency, not legal complexity.',
        '**Critical step:** preserve the evidence before the domain goes dormant. Capture archive.org snapshots, MX records, screenshots of login forms, and any abuse reports filed with the registrar.',
        'Panels accept abuse-report screenshots, MX-record disclosure of phishing-style mail patterns, and registrar acknowledgments as evidence.',
      ],
    },
    passChecklist: [
      'You have screenshots of the fraudulent site or login form before the operator took it down',
      'You can demonstrate the brand is actively being impersonated',
      'You have preserved MX records showing phishing-pattern mail infrastructure if relevant',
      'The trademark predates the domain registration',
      'Your brand-protection team or counsel has filed abuse reports with the registrar',
    ],
    failChecklist: [
      'The fraudulent content has been entirely removed and you have no captured evidence',
      'The domain is dormant and was never demonstrably used for fraud',
      'You cannot prove the connection to your brand',
    ],
    faqs: [
      {
        question: 'Should I file a criminal complaint instead?',
        answer: 'You can do both. UDRP recovers the domain. Criminal complaint addresses the fraud itself.',
      },
      {
        question: 'How fast can a phishing UDRP be resolved?',
        answer: 'WIPO’s expedited service can resolve a single-domain UDRP in roughly 30 days for $4,000. Many registrars suspend within hours of credible evidence.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'celebrity',
    name: 'Celebrity & Personal Name',
    headline: 'Common-law rights in',
    headlineEm: 'a person’s name.',
    lede: 'Personal names without registered trademarks can still ground UDRP rights - but only on proof of acquired distinctiveness in commerce.',
    metaTitle: 'Celebrity Name UDRP - Recover a Domain Using Your Name',
    metaDescription: 'How to recover a domain using a personal name. Real cases including Madonna, Snoop Dogg, the foundational Sting denial.',
    keywords: [
      { term: 'celebrity name domain UDRP', volume: 110 },
      { term: 'common law trademark personal name', volume: 230 },
      { term: 'recover personal domain', volume: 90 },
    ],
    number: '04',
    eyebrowSuffix: 'Celebrity & Personal Name',
    whatIsIt: [
      'UDRP protects trademark rights - including unregistered common-law rights - but does not automatically protect every personal name. The mark must function as a trademark in commerce.',
      'Madonna won her case (madonna.com) because her name had been used as a registered trademark. Sting lost his (sting.com) because "sting" is a dictionary word.',
    ],
    doctrine: {
      title: 'How panels analyze celebrity-name cases',
      paragraphs: [
        '**Element 1 - Standing.** The threshold question is whether the personal name has acquired secondary meaning in commerce sufficient to function as a trademark.',
        '**Element 2 - Legitimate interests.** Personal names that are also dictionary words, surnames, or political identifiers face uphill battles when respondent shows independent legitimate use.',
        '**Element 3 - Bad faith.** Established when the registrant clearly targeted the celebrity’s persona rather than the underlying word.',
      ],
    },
    passChecklist: [
      'Your name has registered trademark protection in at least one jurisdiction',
      'You have documented commercial use of your name (merchandise, licensing, sustained press)',
      'The disputed domain targets your persona rather than a coincidental dictionary word',
      'The respondent’s use shows targeting',
    ],
    failChecklist: [
      'Your name is a common dictionary word with independent meaning',
      'You don’t have documented commercial use of your name as a brand',
      'The respondent’s use is non-commercial and not targeting',
      'Your fame is purely non-commercial',
    ],
    faqs: [
      {
        question: 'What if my name is also a common word?',
        answer: 'Sting v. Urvan (D2000-0596) established that famous performers using dictionary-word stage names cannot automatically claim the matching domain.',
      },
      {
        question: 'I’m a creator/influencer, not a "celebrity" - does this still apply?',
        answer: 'Often, yes. Panels accept unregistered rights in a personal name when it is used as a distinctive identifier of commercial goods or services, so creators with documented commercial use can qualify. Evidence of revenue, sponsorships and audience reach matters.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'ai-cctld',
    name: 'AI / .AI ccTLD',
    headline: 'The fastest-growing',
    headlineEm: 'dispute frontier.',
    lede: 'WIPO administered 80+ .AI cases in 2024 alone. The .AI ccTLD has become a high-pressure battleground.',
    metaTitle: '.AI Domain Dispute - UDRP for AI Brand Names',
    metaDescription: 'How UDRP applies to .AI domains. Recent decisions including SAP.AI, the new TLD-as-mark-element doctrine.',
    keywords: [
      { term: '.AI domain dispute', volume: 290 },
      { term: 'UDRP AI ccTLD', volume: 70 },
      { term: 'AI brand name protection', volume: 410 },
    ],
    number: '05',
    eyebrowSuffix: 'AI & the .AI ccTLD',
    whatIsIt: [
      'The .AI ccTLD (administered by NIC.AI in Anguilla) adopted UDRP via WIPO and has become the fastest-growing dispute frontier.',
      'Recent doctrine: the TLD itself can "tip the balance" in finding bad-faith targeting when the .AI suffix forms part of the complainant’s mark.',
    ],
    doctrine: {
      title: 'How panels analyze .AI cases',
      paragraphs: [
        '**The TLD-as-mark-element doctrine.** When complainant’s trademark itself includes "AI" as a meaningful component, panels increasingly treat the choice of .AI TLD as evidence of targeting.',
        '**Knowledge vs. targeting.** The barracudaai.com line of cases established that mere knowledge of the complainant’s existence is not enough.',
        '**Lapsed renewal.** The SAP.AI case (DAI2024-0053) confirms that letting a domain lapse does not extinguish trademark rights against later acquirers.',
      ],
    },
    passChecklist: [
      'Your trademark predates the disputed domain registration',
      'Your mark itself contains "AI" as a meaningful element',
      'The respondent shows clear targeting evidence',
      'The respondent is using the domain commercially in your specific market segment',
    ],
    failChecklist: [
      'Your rights are "nascent" - recent corporate formation, marketing rollout, or trademark filing',
      'The respondent has documented independent use as an AI product/service',
      'The respondent’s knowledge of you cannot be elevated to targeting evidence',
      'You acquired the trademark after the domain registration',
    ],
    faqs: [
      {
        question: 'How is .AI different from .com for UDRP purposes?',
        answer: 'Procedurally identical - both use UDRP via WIPO. Doctrinally, the TLD itself can become evidence in .AI cases when the AI element is part of your mark.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'generic-word',
    name: 'Generic / Dictionary Word',
    headline: 'When the word',
    headlineEm: 'came first.',
    lede: 'Trademark rights in a dictionary word do not give an absolute claim to the matching domain. Panels routinely deny transfer where the term has independent meaning.',
    metaTitle: 'Generic Word Domain - When UDRP Fails (and When It Succeeds)',
    metaDescription: 'How panels handle UDRP cases involving dictionary-word domains. The Sting precedent, Reliance Wood, the Booking.com doctrine.',
    keywords: [
      { term: 'generic word domain UDRP', volume: 90 },
      { term: 'dictionary word trademark dispute', volume: 110 },
      { term: 'descriptive trademark domain', volume: 220 },
    ],
    number: '06',
    eyebrowSuffix: 'Generic / Dictionary Word',
    whatIsIt: [
      'When a trademark consists of (or includes) a dictionary word, the trademark holder does not gain exclusive rights to that word in domain name space.',
      'This is the area where the most RDNH findings emerge - complainants overestimate their rights to dictionary-word domains.',
    ],
    doctrine: {
      title: 'How panels analyze generic-word cases',
      paragraphs: [
        '**The Sting precedent (D2000-0596).** Foundational case. Sting was denied transfer of sting.com because "sting" is a dictionary word.',
        '**Long, independent use.** Panels regularly deny complaints where a respondent has used a dictionary-word domain for its ordinary meaning for many years, however large the complainant.',
        '**Booking.com doctrine extended.** Registration of the compound does not confer exclusive rights to the underlying generic component.',
      ],
    },
    passChecklist: [
      'Your trademark is highly distinctive (not merely descriptive)',
      'The respondent has no documented independent use of the dictionary meaning',
      'The respondent is using the domain to target your specific market',
      'You have evidence of bad-faith conduct',
    ],
    failChecklist: [
      'Your trademark is purely descriptive of the goods/services',
      'The respondent has documented independent use of the dictionary meaning',
      'The respondent’s domain registration predates your trademark rights',
      'The respondent operates an unrelated legitimate business',
    ],
    faqs: [
      {
        question: 'My brand is a dictionary word - is UDRP still possible?',
        answer: 'Yes, but the bar is higher. You need acquired distinctiveness and clear targeting evidence.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_TIMELINE,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'acronym',
    name: 'Acronyms & Short Domains',
    headline: 'Three letters.',
    headlineEm: 'Many claimants.',
    lede: 'Two-, three-, and four-letter .com domains are extraordinarily valuable precisely because they correspond to many possible acronyms. Panels are increasingly skeptical of single-claimant assertions.',
    metaTitle: '3-Letter Domain Dispute - Why Most UDRP Fail at This Length',
    metaDescription: 'How UDRP applies to 2/3/4-letter domain disputes. Why panels favor incumbent registrants. Real RDNH cases.',
    keywords: [
      { term: 'short domain UDRP', volume: 70 },
      { term: 'three letter domain dispute', volume: 90 },
      { term: 'acronym trademark domain', volume: 130 },
    ],
    number: '07',
    eyebrowSuffix: 'Acronyms & Short Domains',
    whatIsIt: [
      'The shortest .com domains command premium prices precisely because they map to thousands of possible acronyms.',
      'The Mira Holdings line of cases establishes that sophisticated domain investors with documented portfolios consistently defeat UDRP overreach.',
    ],
    doctrine: {
      title: 'How panels analyze acronym cases',
      paragraphs: [
        '**The four-letter standard.** Panels treat 4-letter .coms as inherently valuable and inherently multi-meaning.',
        '**Pending TM applications.** The Gabler case (CAC-UDRP-107921) confirmed pending trademark applications cannot ground UDRP standing.',
        '**The Mira Holdings precedent.** Domain investors with documented business portfolios receive significant deference.',
      ],
    },
    passChecklist: [
      'Your trademark predates the disputed domain registration',
      'The respondent’s use targets your specific industry',
      'You have direct evidence of bad-faith conduct toward you specifically',
      'The acronym is highly distinctive in your industry context',
    ],
    failChecklist: [
      'The domain registration predates your existence',
      'You’ve made a purchase offer that was refused',
      'The acronym maps to many other possible companies',
      'The respondent is a documented domain investor with a portfolio',
      'Your trademark is still pending',
    ],
    faqs: [
      {
        question: 'Why do panels seem to favor domain investors?',
        answer: 'Domain investors with documented businesses have legitimate interests in their portfolio that satisfy section 4(c).',
      },
      {
        question: 'Should I just buy the domain instead of filing UDRP?',
        answer: 'Often yes, especially for 4-letter acronyms. Filing UDRP after a failed purchase negotiation is the most reliable RDNH trigger.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'rdnh',
    name: 'Reverse Domain Name Hijacking',
    headline: 'When the trademark owner',
    headlineEm: 'becomes the bad actor.',
    lede: 'RDNH findings at WIPO and Forum rose from 47 in 2022 to 86 in 2025, according to UDRP.tools data reported by Domain Name Wire. A common pattern: a failed purchase negotiation followed by a UDRP filed as a "Plan B".',
    metaTitle: 'Reverse Domain Name Hijacking (RDNH) - When UDRP Backfires',
    metaDescription: 'RDNH defense and the patterns that trigger it. 86 RDNH findings in 2025. How to defend, when to file.',
    keywords: [
      { term: 'reverse domain name hijacking', volume: 720 },
      { term: 'RDNH defense', volume: 140 },
      { term: 'UDRP RDNH cases', volume: 90 },
      { term: 'plan-b abuse UDRP', volume: 50 },
    ],
    number: '08',
    eyebrowSuffix: 'Reverse Domain Name Hijacking',
    whatIsIt: [
      'Reverse Domain Name Hijacking (RDNH) is a finding by the panel that the complainant brought the UDRP in bad faith.',
      'RDNH does not award damages, but it creates a documented record useful in subsequent ACPA litigation.',
      'The most common RDNH triggers: filing against a domain registered before the trademark existed, filing after a failed purchase negotiation, relying on pending trademark applications.',
    ],
    doctrine: {
      title: 'The most reliable RDNH triggers',
      paragraphs: [
        '**Plan-B abuse.** A complainant tries to buy the domain, is refused, and then files a UDRP it cannot win on the facts. Panels frequently treat this sequence as evidence of bad faith.',
        '**Chronological barrier.** Domain registration predates trademark rights. Cannot be bad faith if the trademark didn’t exist when the domain was registered.',
        '**Pending trademark applications.** WIPO Overview 3.0 section 1.1: pending applications do not ground UDRP rights.',
        '**Represented counsel higher standard.** Reckless filings by counsel trigger RDNH more readily than pro se filings.',
      ],
    },
    passChecklist: [
      'You can document that your domain registration predates the complainant’s trademark rights',
      'You have records of any prior purchase negotiation',
      'You have documented legitimate use',
      'You can show the complainant’s rights are thin or pending',
    ],
    failChecklist: [
      'You acquired the domain after the complainant’s clear trademark rights',
      'You have used the domain to target the complainant specifically',
      'You have multiple typosquats of well-known marks in your portfolio',
    ],
    faqs: [
      {
        question: 'Does RDNH come with money damages?',
        answer: 'No. RDNH evidence is highly useful in subsequent ACPA federal court litigation, where statutory damages are available.',
      },
      {
        question: 'I’m a respondent - should I respond, or default and try for RDNH?',
        answer: 'Respond. Even modern RDNH findings against defaulted respondents require strong factual records.',
      },
      {
        question: 'Can I file ACPA based on an RDNH finding?',
        answer: 'Yes - ACPA section 1114(2)(D) provides remedies. RDNH findings are strong but not conclusive evidence.',
      },
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'foundational',
    name: 'Foundational Doctrine',
    headline: 'The cases panels',
    headlineEm: 'still cite.',
    lede: 'Twenty-five years of UDRP doctrine rests on a small set of foundational decisions. Reading them is the highest-leverage 90 minutes in domain dispute preparation.',
    metaTitle: 'Foundational UDRP Cases - Every Dispute Counsel Should Read',
    metaDescription: 'WWF v. Bosman, Telstra/Nuclear Marshmallows, Oki Data, Madonna, Sting - the cases panels still cite.',
    keywords: [
      { term: 'foundational UDRP cases', volume: 70 },
      { term: 'WWF Bosman UDRP', volume: 90 },
      { term: 'Telstra UDRP passive holding', volume: 110 },
      { term: 'Oki Data test UDRP', volume: 220 },
    ],
    number: '09',
    eyebrowSuffix: 'Foundational Doctrine',
    whatIsIt: [
      'A small set of decisions from 1999-2003 established the doctrines that govern every modern UDRP case.',
      'Reading these cases - and the WIPO Jurisprudential Overview 3.0 - is the single highest-leverage preparation any party can do.',
    ],
    doctrine: {
      title: 'The cases that shaped UDRP',
      paragraphs: [
        '**WWF v. Bosman, D1999-0001.** The first UDRP decision. Established the conjunctive bad-faith standard.',
        '**Telstra v. Nuclear Marshmallows, D2000-0003.** The most-cited UDRP case ever. Created the passive holding doctrine.',
        '**Oki Data Americas v. ASD, D2001-0903.** Established the four-factor reseller test.',
        '**Madonna v. Parisi, D2000-0847.** Established that personal-name registered marks are protectable.',
        '**Sting v. Urvan, D2000-0596.** Foundational denial. Famous performer, dictionary-word stage name.',
      ],
    },
    passChecklist: [
      'You have read UDRP Policy and Rules cover-to-cover',
      'You have read WIPO Overview 3.0 sections relevant to your fact pattern',
      'You can articulate which foundational case maps to your situation',
      'You have identified 3-5 recent cases with similar fact patterns',
    ],
    failChecklist: [
      'You haven’t read the actual UDRP Policy text',
      'You’re relying on second-hand summaries of doctrine',
      'You haven’t reviewed cases from the past 12 months',
    ],
    faqs: [
      {
        question: 'Where can I read the actual UDRP Policy and Rules?',
        answer: 'Both are free at icann.org/udrp. The Policy is roughly 2,200 words; the Rules are roughly 5,800 words.',
      },
      COMMON_FAQ_BUDGET,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'urs',
    name: 'URS - Uniform Rapid Suspension',
    headline: '$375 and',
    headlineEm: 'seventeen days.',
    lede: 'URS is the lighter, faster cousin of UDRP - but only for new gTLDs and only for the clearest infringement.',
    metaTitle: 'URS Filing Guide - Uniform Rapid Suspension for $375',
    metaDescription: 'How URS works. When to use it instead of UDRP. The 14-domain consolidation rule.',
    keywords: [
      { term: 'URS uniform rapid suspension', volume: 290 },
      { term: 'file URS new gTLD', volume: 50 },
      { term: 'URS vs UDRP', volume: 410 },
    ],
    number: '10',
    eyebrowSuffix: 'URS - Uniform Rapid Suspension',
    whatIsIt: [
      'URS was created in 2013 alongside the new gTLD program. It applies to new gTLDs and to several legacy TLDs, such as .org, .info and .biz, but not .com or .net.',
      'URS is cheaper ($375 vs $1,500) and quicker (~17 days vs ~60), but the remedy is narrower (suspension only, no transfer) and the burden is higher (clear and convincing evidence).',
    ],
    doctrine: {
      title: 'When URS makes sense',
      paragraphs: [
        '**Use URS when:** the cybersquatting is clear-cut, you want fast suspension to stop active fraud, or you have many infringing domains under common ownership.',
        '**Use UDRP when:** you want transfer (not just suspension), the domain is a legacy gTLD, or the case has any genuine factual complexity.',
        '**Best-fit pattern:** pure typosquat + pure brand-imitation page + new gTLD = URS dream case.',
      ],
    },
    passChecklist: [
      'The disputed domain is in a new gTLD or another URS-covered TLD',
      'The case is clear-cut cybersquatting',
      'You can meet "clear and convincing evidence"',
      'You only need suspension, not transfer',
      'The domain is being actively used',
    ],
    failChecklist: [
      'The domain is a .com or .net (not covered by the URS)',
      'The case has factual complexity',
      'You need transfer rather than suspension',
      'The domain is short (3-letter URS cases have been rejected for ambiguity)',
    ],
    faqs: [
      {
        question: 'What’s the difference between URS and UDRP?',
        answer: 'URS: $375, ~17 days, suspension only, "clear and convincing evidence", new gTLDs and some legacy TLDs (not .com/.net). UDRP: $1,500+, ~60 days, transfer, "preponderance of evidence", all gTLDs.',
      },
      {
        question: 'Can I file both URS and UDRP for the same domain?',
        answer: 'Not for the same domain at the same time. But after a successful URS suspension, you can later pursue UDRP for transfer.',
      },
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'cctld',
    name: 'ccTLD Disputes',
    headline: 'Country-code domains.',
    headlineEm: 'Local rules.',
    lede: 'Many ccTLDs adopt UDRP or a local variant; some run their own dispute systems entirely. WIPO administers cases in 87+ ccTLDs.',
    metaTitle: 'ccTLD Domain Dispute - UDRP for Country-Code Domains',
    metaDescription: 'How country-code domain disputes work. Which ccTLDs adopt UDRP. INDRP, CDRP, SGOA, .UA, .NL, .DE local variants.',
    keywords: [
      { term: 'ccTLD domain dispute', volume: 110 },
      { term: 'INDRP india domain', volume: 320 },
      { term: 'ccTLD UDRP equivalent', volume: 70 },
    ],
    number: '11',
    eyebrowSuffix: 'ccTLD Disputes',
    whatIsIt: [
      'ccTLDs operate under various dispute resolution policies. Some adopt UDRP wholesale (.tv, .nu, .me). Some run entirely separate national systems (.uk, .in, .de).',
      'WIPO administered record .AE, .AI, and .BR filings in 2024.',
    ],
    doctrine: {
      title: 'Choosing the right path for your ccTLD',
      paragraphs: [
        '**UDRP-adopting ccTLDs (most common path).** Your dispute is administered just like a .com case but applied to the ccTLD.',
        '**Independent national systems.** .UK uses Nominet DRS. .IN uses INDRP. .DE uses national civil court. .CN uses CIETAC arbitration.',
        '**Hybrid.** Some ccTLDs (.es, .ca) use UDRP via local providers (CIIDRC for .CA).',
      ],
    },
    passChecklist: [
      'You have identified whether your ccTLD adopts UDRP or runs an independent system',
      'Your trademark is registered in the relevant national jurisdiction',
      'You have evidence consistent with the ccTLD’s local supplemental rules',
      'You can file in the language of the registration agreement',
    ],
    failChecklist: [
      'The ccTLD runs an independent court-based system requiring local litigation',
      'Your trademark is not registered in the relevant jurisdiction',
      'The local rules require evidence you don’t have',
    ],
    faqs: [
      {
        question: 'Does UDRP apply to .UK domains?',
        answer: 'No. .UK uses Nominet’s Dispute Resolution Service (DRS), which is a separate procedure with different criteria.',
      },
      {
        question: 'My trademark is in the US but the ccTLD is .DE - what now?',
        answer: 'Germany’s .DE does not have a UDRP-equivalent procedure. Disputes go to civil court in Germany.',
      },
      COMMON_FAQ_TIMELINE,
      COMMON_FAQ_SELF_REP,
    ],
  },

  {
    slug: 'aged-domain',
    name: 'Aged Domains & Predating Rights',
    headline: 'The chronological',
    headlineEm: 'barrier.',
    lede: 'If the domain was registered before the complainant’s trademark rights existed, registration cannot be in bad faith. Period. The single most reliable defense in UDRP.',
    metaTitle: 'Aged Domain UDRP Defense - The Chronological Barrier',
    metaDescription: 'How to defend a UDRP when your domain registration predates the complainant’s trademark. When the chronological barrier applies and how panels treat aged and re-acquired domains.',
    keywords: [
      { term: 'aged domain UDRP defense', volume: 90 },
      { term: 'domain predates trademark', volume: 110 },
      { term: 'chronological defense UDRP', volume: 50 },
    ],
    number: '12',
    eyebrowSuffix: 'Aged Domains & Predating Rights',
    whatIsIt: [
      'The chronological barrier is UDRP’s most absolute defense. Bad faith requires intent to target the complainant’s mark; if the mark didn’t exist when the domain was registered, no such intent is possible.',
      'Many recent RDNH findings involve this defense: the domain had been registered for a decade or more before the complainant\'s trademark existed.',
    ],
    doctrine: {
      title: 'The strongest defense in UDRP',
      paragraphs: [
        '**The rule.** Bad faith registration requires actual or constructive knowledge of the trademark.',
        '**The exception.** If the registrant has subsequently transferred the domain to a new acquirer, some panels evaluate bad faith from the date of acquisition.',
        '**Recent pattern.** Where a domain was registered years or decades before the mark and the complainant ignored that fact, panels increasingly issue RDNH findings.',
      ],
    },
    passChecklist: [
      'You can document the original registration date via WHOIS history',
      'Your registration date predates the complainant’s trademark filing',
      'You have evidence of continuous independent ownership',
      'You have any business records showing legitimate use during the intervening period',
    ],
    failChecklist: [
      'Your domain has been transferred to a new acquirer post-trademark',
      'You can’t document the original registration date',
      'Your registration was around the same time as the trademark',
    ],
    faqs: [
      {
        question: 'How do I prove my domain registration date?',
        answer: 'Use WHOIS history tools: DomainTools or Whoisology, together with Wayback Machine captures and your registrar receipt.',
      },
      {
        question: 'What if the trademark dates back further than my domain?',
        answer: 'Then the chronological barrier doesn’t apply. Look at legitimate-interest defenses, dictionary-word defense, lack of targeting evidence.',
      },
      {
        question: 'I bought this aged domain at auction - does that affect the chronology?',
        answer: 'Maybe. Some panels evaluate bad faith from the acquisition date rather than original registration.',
      },
      COMMON_FAQ_SELF_REP,
    ],
  },
];

export function getPattern(slug: string): PatternDefinition | undefined {
  return PATTERNS.find((p) => p.slug === slug);
}

export function allPatternSlugs(): string[] {
  return PATTERNS.map((p) => p.slug);
}
