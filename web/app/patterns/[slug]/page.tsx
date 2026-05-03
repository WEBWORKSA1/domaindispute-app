import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPattern, PATTERNS, allPatternSlugs } from '@/lib/patterns/data';

export function generateStaticParams() {
  return allPatternSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) return { title: 'Pattern not found' };
  return {
    title: pattern.metaTitle,
    description: pattern.metaDescription,
    keywords: pattern.keywords.map((k) => k.term),
  };
}

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  if (!pattern) notFound();

  return (
    <>
      <section className="bg-paper border-b border-ink px-8 py-16">
        <div className="max-w-[1100px] mx-auto">
          <Link href="/patterns" className="font-mono text-xs tracking-[0.14em] uppercase text-muted hover:text-oxblood">
            &larr; Pattern Library
          </Link>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-oxblood mt-6 mb-4">
            Pattern {pattern.number} &middot; {pattern.eyebrowSuffix}
          </div>
          <h1 className="h-display text-display-lg mb-6">
            {pattern.headline}{' '}
            <em>{pattern.headlineEm}</em>
          </h1>
          <p className="text-xl text-ink-soft leading-relaxed">{pattern.lede}</p>
        </div>
      </section>

      <section className="bg-paper px-8 py-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-4">What is it?</h2>
            {pattern.whatIsIt.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-ink-soft mb-4">{para}</p>
            ))}
          </div>

          <div className="mb-12 bg-bone border border-ink p-8">
            <h2 className="font-serif text-2xl font-semibold mb-4">{pattern.doctrine.title}</h2>
            {pattern.doctrine.paragraphs.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-ink-soft mb-4" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="border border-green p-6">
              <h3 className="font-serif text-xl font-semibold mb-4 text-green">Pass checklist</h3>
              <ul className="space-y-2 text-sm">
                {pattern.passChecklist.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-green">&check;</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="border border-oxblood p-6">
              <h3 className="font-serif text-xl font-semibold mb-4 text-oxblood">Fail checklist</h3>
              <ul className="space-y-2 text-sm">
                {pattern.failChecklist.map((item, i) => (
                  <li key={i} className="flex gap-2"><span className="text-oxblood">&times;</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-6">Frequently asked</h2>
            <div className="divide-y divide-ink/10">
              {pattern.faqs.map((faq, i) => (
                <details key={i} className="py-4 group">
                  <summary className="font-semibold cursor-pointer flex justify-between items-center">
                    {faq.question}
                    <span className="text-oxblood group-open:rotate-45 transition">+</span>
                  </summary>
                  <p className="text-base text-ink-soft mt-3 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-oxblood text-bone p-12 text-center">
            <h3 className="font-serif text-2xl font-semibold mb-4">Run the Pre-Check for free</h3>
            <p className="mb-6 opacity-90">Three questions, sixty seconds. Find out if your case is worth filing.</p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-bone text-ink px-8 py-4 font-semibold text-sm tracking-wider uppercase hover:bg-gold-bright transition"
            >
              Start Free Pre-Check &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
