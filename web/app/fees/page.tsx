import Link from 'next/link';
import type { Metadata } from 'next';
import { HelpCta, PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'UDRP and URS provider fees (2026)',
  description: 'Current filing fees at WIPO, Forum and CAC for UDRP cases, plus URS costs, by number of domains and panel size.',
  alternates: { canonical: '/fees' },
};

const TABLES = [
  {
    name: 'WIPO',
    url: 'https://www.wipo.int/en/web/amc/domain-name-disputes/fees',
    currency: 'US$',
    rows: [
      ['1-5 domains', '1,500', '4,000'],
      ['6-10 domains', '2,000', '5,000'],
      ['More than 10', 'By consultation', 'By consultation'],
    ],
    note: 'Expedited single-panel track for up to 5 domains: US$4,000, decision targeted within one month of commencement.',
  },
  {
    name: 'Forum',
    url: 'https://www.adrforum.com/domain-dispute/udrp',
    currency: 'US$',
    rows: [
      ['1-2 domains', '1,330', '2,660'],
      ['3-5 domains', '1,480', '2,960'],
      ['6-10 domains', '1,830', '3,660'],
      ['11-15 domains', '2,280', '4,560'],
      ['16 or more', 'Quote', 'Quote'],
    ],
    note: 'Multiple respondent aliases increase the fee proportionally.',
  },
  {
    name: 'CAC (Czech Arbitration Court)',
    url: 'https://udrp.adr.eu/fees',
    currency: 'EUR',
    rows: [
      ['1-5 domains', '800', '2,600'],
      ['6-10 domains', '1,100', '3,200'],
      ['11-20 domains', '1,450', '3,800'],
      ['21-30 domains', '1,550', '4,400'],
      ['31-40 domains', '1,900', '5,000'],
      ['41-50 domains', '2,000', '5,600'],
    ],
    note: '51 or more domains: by consultation with CAC.',
  },
];

export default function FeesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ href: '/fees', label: 'Provider fees' }]}
        title="Provider fees"
        lede="What the main dispute resolution providers charge to file a UDRP complaint, from their published schedules as of November 2026. The complainant pays; a respondent pays only if it requests a three-member panel."
      >
        <Link href="/tools/fee-estimator" className="btn-dark mt-6">
          Open the fee estimator
        </Link>
      </PageHeader>
      <div className="wrap grid gap-10 py-10 lg:grid-cols-3">
        {TABLES.map((t) => (
          <section key={t.name}>
            <h2 className="font-serif text-xl font-semibold">
              <a href={t.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {t.name}
              </a>
            </h2>
            <table className="mt-3 w-full text-left text-[15px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <th className="py-2 pr-3 font-semibold">Domains</th>
                  <th className="py-2 pr-3 font-semibold">1 panelist</th>
                  <th className="py-2 font-semibold">3 panelists</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map(([a, b, c]) => (
                  <tr key={a} className="border-b border-bone-2">
                    <td className="py-2 pr-3">{a}</td>
                    <td className="py-2 pr-3 tabular-nums">{/\d/.test(b ?? '') ? `${t.currency} ${b}` : b}</td>
                    <td className="py-2 tabular-nums">{/\d/.test(c ?? '') ? `${t.currency} ${c}` : c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-sm text-muted">{t.note}</p>
          </section>
        ))}
      </div>
      <div className="wrap pb-12">
        <div className="prose-dd">
          <h2>URS fees</h2>
          <p>
            A Uniform Rapid Suspension complaint costs around US$375 at Forum for a small number of domains. The URS applies to new gTLDs and several legacy extensions such as .org, .info and .biz, but not .com or .net. See <Link href="/procedures/urs">the URS procedure</Link>.
          </p>
          <p>Fees change. Always confirm on the provider&apos;s website on the day you file.</p>
        </div>
        <div className="mt-10">
          <HelpCta tone="light" />
        </div>
      </div>
    </>
  );
}
