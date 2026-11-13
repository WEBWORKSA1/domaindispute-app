/**
 * Site-wide configuration. Public values only - nothing here may contain
 * the private contact address (see lib/server/notify.ts).
 */

export const SITE = {
  name: 'DomainDispute.com',
  shortName: 'DomainDispute',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://domaindispute.com').replace(/\/$/, ''),
  tagline: 'Domain dispute research, live UDRP docket, and free guidance',
  description:
    'Search 10,000+ UDRP decisions, track newly filed domain disputes, check response deadlines, and get free guidance before you file or respond.',
  adsenseClient: 'ca-pub-6620975821265271',
  /** Top-of-page inquiry link (acquisition, sponsorship, advertising, partnership). */
  inquiryUrl: 'https://web.works/contact',
  foundedYear: 2026,
  locale: 'en',
} as const;

export const NAV = [
  { href: '/cases', label: 'Case library' },
  { href: '/live', label: 'Live docket' },
  { href: '/stats', label: 'Statistics' },
  { href: '/guides', label: 'Guides' },
  { href: '/tools', label: 'Tools' },
  { href: '/videos', label: 'Videos' },
] as const;

export const FOOTER_GROUPS = [
  {
    title: 'Research',
    links: [
      { href: '/cases', label: 'Case library' },
      { href: '/live', label: 'Live docket' },
      { href: '/stats', label: 'Statistics' },
      { href: '/brief', label: 'Daily brief' },
      { href: '/patterns', label: 'Dispute patterns' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/guides', label: 'Guides' },
      { href: '/procedures/udrp', label: 'UDRP procedure' },
      { href: '/procedures/urs', label: 'URS procedure' },
      { href: '/three-element-test', label: 'Three-element test' },
      { href: '/glossary', label: 'Glossary' },
      { href: '/videos', label: 'Videos' },
      { href: '/faq', label: 'FAQ' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/start', label: 'Free pre-check' },
      { href: '/tools/deadline-calculator', label: 'Deadline calculator' },
      { href: '/tools/fee-estimator', label: 'Fee estimator' },
      { href: '/tools/domain-lookup', label: 'Domain lookup' },
      { href: '/tools/typo-scanner', label: 'Typo-variant scanner' },
      { href: '/fees', label: 'Provider fees' },
    ],
  },
  {
    title: 'Get involved',
    links: [
      { href: '/get-help', label: 'Free case review' },
      { href: '/support', label: 'Support the project' },
      { href: '/contests', label: 'Contests & prizes' },
      { href: '/careers', label: 'Careers' },
      { href: '/advertise', label: 'Advertise & sponsor' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
      { href: '/legal/privacy', label: 'Privacy policy' },
      { href: '/legal/terms', label: 'Terms of use' },
      { href: '/legal/cookies', label: 'Cookie policy' },
      { href: '/legal/disclaimer', label: 'Legal disclaimer' },
      { href: '/legal/copyright', label: 'Trademark & copyright' },
    ],
  },
] as const;
