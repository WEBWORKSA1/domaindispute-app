import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { GUIDES } from '@/lib/content/guides';
import { PATTERNS } from '@/lib/patterns/data';
import { getAllFilingNumbers, getSlimCases, isoDay } from '@/lib/data/cases';

export const revalidate = 86400;

const STATIC: Array<[string, number, MetadataRoute.Sitemap[number]['changeFrequency']]> = [
  ['/', 1, 'daily'],
  ['/cases', 0.9, 'daily'],
  ['/live', 0.9, 'hourly'],
  ['/stats', 0.8, 'daily'],
  ['/brief', 0.7, 'daily'],
  ['/guides', 0.8, 'weekly'],
  ['/tools', 0.7, 'monthly'],
  ['/tools/deadline-calculator', 0.7, 'monthly'],
  ['/tools/fee-estimator', 0.6, 'monthly'],
  ['/tools/domain-lookup', 0.6, 'monthly'],
  ['/tools/typo-scanner', 0.6, 'monthly'],
  ['/start', 0.7, 'monthly'],
  ['/get-help', 0.8, 'monthly'],
  ['/videos', 0.6, 'monthly'],
  ['/glossary', 0.6, 'monthly'],
  ['/patterns', 0.7, 'monthly'],
  ['/procedures/udrp', 0.7, 'monthly'],
  ['/procedures/urs', 0.6, 'monthly'],
  ['/procedures/acpa', 0.5, 'monthly'],
  ['/procedures/rdnh-defense', 0.6, 'monthly'],
  ['/procedures/cctld', 0.5, 'monthly'],
  ['/three-element-test', 0.7, 'monthly'],
  ['/resources/self-representation-guide', 0.6, 'monthly'],
  ['/fees', 0.6, 'monthly'],
  ['/faq', 0.6, 'monthly'],
  ['/about', 0.5, 'yearly'],
  ['/contact', 0.5, 'yearly'],
  ['/support', 0.5, 'monthly'],
  ['/contests', 0.5, 'monthly'],
  ['/careers', 0.4, 'monthly'],
  ['/advertise', 0.5, 'monthly'],
  ['/legal/privacy', 0.2, 'yearly'],
  ['/legal/terms', 0.2, 'yearly'],
  ['/legal/cookies', 0.2, 'yearly'],
  ['/legal/disclaimer', 0.2, 'yearly'],
  ['/legal/copyright', 0.2, 'yearly'],
  ['/legal/contest-rules', 0.2, 'yearly'],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const out: MetadataRoute.Sitemap = STATIC.map(([path, priority, changeFrequency]) => ({
    url: `${SITE.url}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const g of GUIDES) out.push({ url: `${SITE.url}/guides/${g.slug}`, lastModified: new Date(g.updated), changeFrequency: 'monthly', priority: 0.8 });
  for (const p of PATTERNS) out.push({ url: `${SITE.url}/patterns/${p.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  for (let i = 0; i < 14; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push({ url: `${SITE.url}/brief/${isoDay(d)}`, changeFrequency: 'daily', priority: 0.4 });
  }

  const [cases, filings] = await Promise.all([getSlimCases(), getAllFilingNumbers()]);
  const seen = new Set<string>();
  for (const c of cases) {
    seen.add(c.case_number);
    out.push({ url: `${SITE.url}/cases/${c.case_number}`, changeFrequency: 'monthly', priority: 0.5 });
  }
  for (const n of filings) {
    if (!seen.has(n)) out.push({ url: `${SITE.url}/cases/${n}`, changeFrequency: 'daily', priority: 0.5 });
  }
  return out.slice(0, 49000);
}
