import Link from 'next/link';
import type { Metadata } from 'next';
import { PATTERNS } from '@/lib/patterns/data';
import { HelpCta, PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Twelve common domain dispute patterns',
  description: 'Recurring UDRP and URS fact patterns, including typosquatting, famous brands, phishing, generic words, aged domains and reverse domain name hijacking.',
  alternates: { canonical: '/patterns' },
};

export default function PatternsIndexPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/patterns', label: 'Dispute patterns' }]}
        title="Twelve common dispute patterns"
        lede="Most domain disputes follow one of a handful of fact patterns. Find the one closest to yours, see how panels usually rule, and read the doctrine that applies."
      />
      <div className="wrap py-10">
        <ul className="grid gap-x-10 md:grid-cols-2">
          {PATTERNS.map((p) => (
            <li key={p.slug} className="border-t border-bone-2">
              <Link href={`/patterns/${p.slug}`} className="group block py-5">
                <span className="font-serif text-xl font-semibold text-ink group-hover:underline">{p.name}</span>
                <span className="mt-1.5 block text-[15px] leading-relaxed text-ink-soft">{p.lede}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12">
          <HelpCta />
        </div>
      </div>
    </>
  );
}
