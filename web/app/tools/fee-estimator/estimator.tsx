'use client';

import { useState } from 'react';

type Tier = { max: number; single: number | null; three: number | null };
const PROVIDERS: Array<{ id: string; name: string; currency: 'USD' | 'EUR'; tiers: Tier[]; note: string; url: string }> = [
  {
    id: 'wipo',
    name: 'WIPO',
    currency: 'USD',
    tiers: [
      { max: 5, single: 1500, three: 4000 },
      { max: 10, single: 2000, three: 5000 },
    ],
    note: 'More than 10 domains: fee set in consultation with WIPO. Expedited single-panel track for up to 5 domains: US$4,000.',
    url: 'https://www.wipo.int/en/web/amc/domain-name-disputes/fees',
  },
  {
    id: 'forum',
    name: 'Forum',
    currency: 'USD',
    tiers: [
      { max: 2, single: 1330, three: 2660 },
      { max: 5, single: 1480, three: 2960 },
      { max: 10, single: 1830, three: 3660 },
      { max: 15, single: 2280, three: 4560 },
    ],
    note: '16 or more domains, or multiple respondent aliases: quote from Forum.',
    url: 'https://www.adrforum.com/domain-dispute/udrp',
  },
  {
    id: 'cac',
    name: 'CAC',
    currency: 'EUR',
    tiers: [
      { max: 5, single: 800, three: 2600 },
      { max: 10, single: 1100, three: 3200 },
      { max: 20, single: 1450, three: 3800 },
      { max: 30, single: 1550, three: 4400 },
      { max: 40, single: 1900, three: 5000 },
      { max: 50, single: 2000, three: 5600 },
    ],
    note: '51 or more domains: fee set in consultation with CAC.',
    url: 'https://udrp.adr.eu/fees',
  },
];

function fee(tiers: Tier[], n: number, panel: 'single' | 'three') {
  const t = tiers.find((x) => n <= x.max);
  return t ? t[panel] : null;
}

export function FeeEstimator() {
  const [domains, setDomains] = useState(1);
  const [panel, setPanel] = useState<'single' | 'three'>('single');

  return (
    <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="n-domains" className="field-label">
            Number of domain names
          </label>
          <input
            id="n-domains"
            type="number"
            min={1}
            max={100}
            value={domains}
            onChange={(e) => setDomains(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            className="field max-w-[140px]"
          />
        </div>
        <fieldset>
          <legend className="field-label">Panel</legend>
          <div className="flex gap-2">
            {(['single', 'three'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={panel === p}
                onClick={() => setPanel(p)}
                className={`rounded-md border px-4 py-2.5 text-[15px] ${panel === p ? 'border-ink bg-ink text-white' : 'border-ink/20 hover:border-ink/50'}`}
              >
                {p === 'single' ? 'Single panelist' : 'Three-member panel'}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <table className="mt-7 w-full text-left text-[15px]" aria-live="polite">
        <caption className="sr-only">Estimated provider fees</caption>
        <thead>
          <tr className="border-b-2 border-ink">
            <th className="py-2 pr-4 font-semibold">Provider</th>
            <th className="py-2 pr-4 font-semibold">Filing fee</th>
            <th className="py-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {PROVIDERS.map((p) => {
            const v = fee(p.tiers, domains, panel);
            return (
              <tr key={p.id} className="border-b border-bone-2 align-top">
                <td className="py-3 pr-4 font-semibold">
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="link">
                    {p.name}
                  </a>
                </td>
                <td className="py-3 pr-4 font-serif text-xl font-semibold tabular-nums">
                  {v === null ? 'Quote' : `${p.currency === 'USD' ? 'US$' : 'EUR '}${v.toLocaleString('en-US')}`}
                </td>
                <td className="py-3 text-sm text-muted">{p.note}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">
        Provider fees only, from each provider&apos;s published schedule as of November 2026. Legal fees, translation and any refunds are separate. Confirm on the provider&apos;s site before filing.
      </p>
    </div>
  );
}
