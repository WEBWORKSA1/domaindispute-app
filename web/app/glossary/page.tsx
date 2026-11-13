import Link from 'next/link';
import type { Metadata } from 'next';
import { GLOSSARY } from '@/lib/content/glossary';
import { HelpCta, PageHeader } from '@/components/ui';
import { JsonLd } from '@/components/json-ld';
import { SITE } from '@/lib/site';
import { slugify } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Domain dispute glossary: UDRP, URS and cybersquatting terms',
  description: 'Plain-English definitions of the terms used in UDRP, URS and domain name dispute proceedings.',
  alternates: { canonical: '/glossary' },
};

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
  const letters = Array.from(new Set(sorted.map((g) => (g.term[0] ?? '').toUpperCase())));
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          name: 'Domain dispute glossary',
          url: `${SITE.url}/glossary`,
          hasDefinedTerm: sorted.map((g) => ({ '@type': 'DefinedTerm', name: g.term, description: g.def })),
        }}
      />
      <PageHeader
        crumbs={[{ href: '/glossary', label: 'Glossary' }]}
        title="Glossary"
        lede={`${GLOSSARY.length} terms you will meet in a domain name dispute, defined in plain English.`}
      >
        <nav aria-label="Letters" className="mt-6 flex flex-wrap gap-1.5">
          {letters.map((l) => (
            <a key={l} href={`#letter-${l}`} className="rounded border border-bone-2 bg-paper px-2.5 py-1 text-sm font-semibold hover:border-ink">
              {l}
            </a>
          ))}
        </nav>
      </PageHeader>
      <div className="wrap py-10">
        {letters.map((l) => (
          <section key={l} id={`letter-${l}`} className="scroll-mt-24 border-b border-bone-2 py-6">
            <h2 className="font-serif text-2xl font-semibold text-gold">{l}</h2>
            <dl className="mt-3 grid gap-x-10 gap-y-5 md:grid-cols-2">
              {sorted
                .filter((g) => (g.term[0] ?? '').toUpperCase() === l)
                .map((g) => (
                  <div key={g.term} id={slugify(g.term)} className="scroll-mt-24">
                    <dt className="font-semibold text-ink">{g.term}</dt>
                    <dd className="mt-1 text-[15px] leading-relaxed text-ink-soft">
                      {g.def}{' '}
                      {g.link && (
                        <Link href={g.link} className="link">
                          Learn more
                        </Link>
                      )}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
        <div className="mt-12">
          <HelpCta tone="light" />
        </div>
      </div>
    </>
  );
}
