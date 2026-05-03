import Link from 'next/link';
import type { Metadata } from 'next';
import { PATTERNS } from '@/lib/patterns/data';

export const metadata: Metadata = {
  title: 'Domain Dispute Pattern Library - 12 UDRP Fact Patterns',
  description: 'Twelve recurring UDRP/URS fact patterns: typosquatting, famous brand, RDNH, aged domain, generic word, and more.',
};

export default function PatternsIndexPage() {
  return (
    <>
      <section className="bg-paper border-b border-ink px-8 py-16">
        <div className="max-w-[1320px] mx-auto">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood mb-6">
            Pattern Library
          </div>
          <h1 className="h-display text-display-lg mb-6">
            Twelve <em>recurring</em> patterns.
          </h1>
          <p className="text-xl text-ink-soft max-w-3xl">
            Most domain disputes fall into one of twelve recognizable fact patterns. Identify yours, see what panels typically rule, and read the doctrine that applies.
          </p>
        </div>
      </section>

      <section className="bg-paper px-8 py-12">
        <div className="max-w-[1320px] mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATTERNS.map((p) => (
            <Link
              key={p.slug}
              href={`/patterns/${p.slug}`}
              className="block p-7 border border-ink bg-paper hover:bg-bone transition group"
            >
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-oxblood mb-3">
                Pattern {p.number}
              </div>
              <h2 className="font-serif text-2xl font-semibold mb-3 leading-tight">
                {p.name}
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                {p.lede.slice(0, 180)}...
              </p>
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted group-hover:text-oxblood transition">
                Read pattern &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
