import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GUIDES, getGuide } from '@/lib/content/guides';
import { Markdown } from '@/lib/content/markdown';
import { Breadcrumbs, HelpCta } from '@/components/ui';
import { JsonLd } from '@/components/json-ld';
import { AdSlot } from '@/components/ad-slot';
import { formatDate } from '@/lib/utils';
import { SITE } from '@/lib/site';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${g.slug}` },
    openGraph: { type: 'article', title: g.title, description: g.description, modifiedTime: g.updated },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const related = g.related.map(getGuide).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const words = g.body.split(/\s+/).length;

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: g.title,
            description: g.description,
            dateModified: g.updated,
            datePublished: g.updated,
            author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
            publisher: { '@type': 'Organization', name: SITE.name, logo: { '@type': 'ImageObject', url: `${SITE.url}/icon.svg` } },
            mainEntityOfPage: `${SITE.url}/guides/${g.slug}`,
          },
          ...(g.faqs?.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
                },
              ]
            : []),
        ]}
      />
      <div className="wrap grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article>
          <Breadcrumbs
            items={[
              { href: '/guides', label: 'Guides' },
              { href: `/guides/${g.slug}`, label: g.title },
            ]}
          />
          <p className="eyebrow">For {g.audience.toLowerCase()}</p>
          <h1 className="h-display mt-2 max-w-3xl text-display-md text-balance">{g.title}</h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-ink-soft">{g.description}</p>
          <p className="mt-3 text-sm text-muted">
            Updated {formatDate(g.updated)} · {Math.max(2, Math.round(words / 220))} min read · General information, not legal advice
          </p>

          <div className="prose-dd mt-8">
            <Markdown source={g.body} />
          </div>

          {g.faqs && g.faqs.length > 0 && (
            <section className="mt-12 max-w-prose">
              <h2 className="font-serif text-[28px] font-semibold">Questions people ask</h2>
              <dl className="mt-4 divide-y divide-bone-2 border-y border-bone-2">
                {g.faqs.map((f) => (
                  <div key={f.q} className="py-4">
                    <dt className="font-semibold text-ink">{f.q}</dt>
                    <dd className="mt-1.5 text-[16px] leading-relaxed text-ink-soft">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <AdSlot className="my-10" />

          <div className="mt-10">
            <HelpCta />
          </div>
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {related.length > 0 && (
            <div className="panel p-5">
              <h2 className="font-semibold">Related guides</h2>
              <ul className="mt-3 space-y-2.5 text-[15px]">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/guides/${r.slug}`} className="link">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="panel p-5">
            <h2 className="font-semibold">Check your own case</h2>
            <p className="mt-2 text-sm text-muted">Three questions, sixty seconds, no email required.</p>
            <Link href="/start" className="btn-dark mt-4 w-full">
              Run the free pre-check
            </Link>
          </div>
          <AdSlot name="sidebar" />
        </aside>
      </div>
    </>
  );
}
