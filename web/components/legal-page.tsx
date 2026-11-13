import { PageHeader } from '@/components/ui';
import { Markdown } from '@/lib/content/markdown';
import { formatDate } from '@/lib/utils';

export function LegalPage({ title, slug, updated, body }: { title: string; slug: string; updated: string; body: string }) {
  return (
    <>
      <PageHeader crumbs={[{ href: `/legal/${slug}`, label: title }]} title={title} lede={`Last updated ${formatDate(updated, 'MMMM d, yyyy')}`} />
      <div className="wrap py-10">
        <div className="prose-dd">
          <Markdown source={body} />
        </div>
      </div>
    </>
  );
}
