/**
 * Editable programme data: contests, careers, sponsorship packages, donation tiers.
 * Change values here; pages update on the next deploy.
 */

export const CONTESTS = [
  {
    slug: 'udrp-prediction-challenge',
    title: 'UDRP Prediction Challenge',
    status: 'Registration open',
    starts: '2026-12-01',
    ends: '2026-12-31',
    summary:
      'Each round we pick ten pending WIPO cases from the live docket. Predict the outcome of each (transfer, denial or termination) before the decisions are published. Highest score wins; ties go to the earliest complete entry.',
    prizes: ['Winner spotlight on DomainDispute.com', 'Sponsor-provided prizes announced at round launch', 'Digital certificate for the top three'],
    howTo: ['Register with the form below', 'We email the ten cases when the round opens', 'Submit your predictions before each decision appears', 'Results are scored against published decisions'],
  },
  {
    slug: 'best-plain-english-explainer',
    title: 'Plain-English Explainer Award',
    status: 'Accepting submissions',
    starts: '2026-11-15',
    ends: '2027-01-31',
    summary:
      'Write or record the clearest 300-word or 3-minute explanation of one UDRP concept for someone who just received a complaint. The best entries are published with credit.',
    prizes: ['Published with author credit and link', 'Sponsor-provided prizes announced at judging', 'Invitation to join the contributor programme'],
    howTo: ['Pick a concept from the glossary', 'Send a link to your text or video with the form below', 'Entries are judged on accuracy and clarity'],
  },
] as const;

export const ROLES = [
  {
    title: 'Domain dispute researcher',
    type: 'Contract, remote',
    body: 'Summarise notable decisions, tag cases by pattern and help verify data quality. Ideal for law students, paralegals and UDRP practitioners.',
  },
  {
    title: 'Legal content writer',
    type: 'Freelance, remote',
    body: 'Write accurate, plain-English guides on trademarks, domains and dispute procedure. Legal or IP background preferred.',
  },
  {
    title: 'Full-stack developer (Next.js / Python)',
    type: 'Contract, remote',
    body: 'Extend the data pipeline, search and interactive tools. Experience with Supabase, scraping and TypeScript is a plus.',
  },
  {
    title: 'Partnerships and sponsorship lead',
    type: 'Commission-based, remote',
    body: 'Build relationships with registrars, marketplaces, brand-protection firms and law firms.',
  },
  {
    title: 'Video producer',
    type: 'Freelance, remote',
    body: 'Turn guides and notable cases into short explainer videos for YouTube and social.',
  },
] as const;

export const SPONSOR_PACKAGES = [
  {
    name: 'Docket sponsor',
    body: 'Brand the live docket and daily brief, seen by trademark owners, respondents and practitioners checking new filings.',
  },
  {
    name: 'Guide sponsor',
    body: 'Sponsor a guide category (for example, responding to complaints or brand protection) with a clearly labelled sponsor block.',
  },
  {
    name: 'Contest prize sponsor',
    body: 'Fund a contest prize and get named in the contest page, rules and winner announcements.',
  },
  {
    name: 'Directory and referral partner',
    body: 'For law firms and brand-protection providers: receive qualified, consented case-review referrals in your jurisdiction.',
  },
  {
    name: 'Data and API partnership',
    body: 'Licensed access to structured case and docket data for research, monitoring or product integration.',
  },
  {
    name: 'Website or domain acquisition',
    body: 'DomainDispute.com and the platform are open to acquisition and joint-venture conversations.',
  },
] as const;

export const DONATION_TIERS = [
  { amount: 'US$5 / month', name: 'Supporter', body: 'Covers a day of automated data collection.' },
  { amount: 'US$25 / month', name: 'Sustainer', body: 'Funds hosting, search and the daily brief.' },
  { amount: 'US$100 / month', name: 'Patron', body: 'Pays for researcher hours, new guides and contest prizes.' },
  { amount: 'Any amount', name: 'One-time gift', body: 'Every contribution goes into operations and growth.' },
] as const;

/** Optional payment links. Set in Vercel env to enable instant checkout buttons. */
export const PAYMENT_LINKS = [
  { label: 'Donate by card', href: process.env.NEXT_PUBLIC_DONATE_CARD_URL },
  { label: 'Donate with PayPal', href: process.env.NEXT_PUBLIC_DONATE_PAYPAL_URL },
  { label: 'Buy us a coffee', href: process.env.NEXT_PUBLIC_DONATE_COFFEE_URL },
].filter((l): l is { label: string; href: string } => Boolean(l.href));
