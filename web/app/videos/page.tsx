import type { Metadata } from 'next';
import { VIDEOS } from '@/lib/content/videos';
import { YouTubeEmbed } from '@/components/youtube-embed';
import { HelpCta, PageHeader } from '@/components/ui';
import { AdSlot } from '@/components/ad-slot';

export const metadata: Metadata = {
  title: 'UDRP video library: domain disputes explained',
  description: 'Expert videos explaining the UDRP, URS, the three elements, costs, timelines and policy reform.',
  alternates: { canonical: '/videos' },
};

const TOPICS = ['Basics', 'The three elements', 'Procedure', 'Policy & reform'] as const;

export default function VideosPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/videos', label: 'Videos' }]}
        title="Video library"
        lede="Short, expert explanations of how domain name disputes work. Videos load only when you press play."
      />
      <div className="wrap py-10">
        {TOPICS.map((t, i) => {
          const list = VIDEOS.filter((v) => v.topic === t);
          if (list.length === 0) return null;
          return (
            <section key={t} className="mb-14">
              <h2 className="font-serif text-2xl font-semibold">{t}</h2>
              <div className="mt-5 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((v) => (
                  <figure key={v.id}>
                    <YouTubeEmbed id={v.id} title={v.title} />
                    <figcaption className="mt-3">
                      <span className="block font-semibold text-ink">{v.title}</span>
                      <span className="mt-1 block text-sm text-ink-soft">{v.summary}</span>
                      <a href={v.source} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-muted underline">
                        {v.creator}
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
              {i === 0 && <AdSlot className="mt-12" />}
            </section>
          );
        })}
        <p className="max-w-3xl text-sm text-muted">
          Videos are embedded from YouTube and remain the property of their creators. DomainDispute.com is not affiliated with the creators and does not endorse any service they offer. Want your video featured? <a className="link" href="/contact?topic=Video%20submission">Send it to us</a>.
        </p>
        <div className="mt-12">
          <HelpCta tone="light" />
        </div>
      </div>
    </>
  );
}
