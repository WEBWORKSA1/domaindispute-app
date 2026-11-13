import Link from 'next/link';
import type { Metadata } from 'next';
import { GUIDES } from '@/lib/content/guides';
import { HelpCta, PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Domain dispute guides: UDRP, URS and brand protection',
  description:
    'Plain-English guides to responding to and filing UDRP complaints, the three elements, deadlines, providers, evidence and brand protection.',
  alternates: { canonical: '/guides' },
};

const PROCEDURES = [
  { href: '/procedures/udrp', title: 'The UDRP procedure' },
  { href: '/procedures/urs', title: 'Uniform Rapid Suspension (URS)' },
  { href: '/procedures/acpa', title: 'ACPA litigation in the US' },
  { href: '/procedures/rdnh-defense', title: 'Reverse domain name hijacking' },
  { href: '/procedures/cctld', title: 'Country-code domain disputes' },
  { href: '/three-element-test', title: 'The three-element test' },
  { href: '/resources/self-representation-guide', title: 'Representing yourself' },
  { href: '/patterns', title: 'Twelve common dispute patterns' },
];

export default function GuidesPage() {
  const groups = Array.from(new Set(GUIDES.map((g) => g.audience)));
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/guides', label: 'Guides' }]}
        title="Guides to domain name disputes"
        lede="Written for the people actually involved: domain owners who just received a complaint, brand owners deciding whether to file, and investors buying names."
      />
      <div className="wrap grid gap-12 py-12 lg:grid-cols-[1fr_300px]">
        <div className="space-y-12">
          {groups.map((aud) => (
            <section key={aud}>
              <h2 className="font-serif text-2xl font-semibold">For {aud.toLowerCase()}</h2>
              <ul className="mt-4 divide-y divide-bone-2 border-y border-bone-2">
                {GUIDES.filter((g) => g.audience === aud).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="group block px-1 py-4">
                      <span className="font-serif text-lg font-semibold text-ink group-hover:underline">{g.title}</span>
                      <span className="mt-1 block max-w-2xl text-[15px] text-muted">{g.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="panel p-5">
            <h2 className="font-semibold">Procedures and doctrine</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              {PROCEDURES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="link">
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/glossary" className="link">
                  Glossary of terms
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
      <section className="wrap pb-14">
        <HelpCta />
      </section>
    </>
  );
}
