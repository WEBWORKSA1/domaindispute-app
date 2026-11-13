'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const KEYS: Record<string, string> = {
  q: 'wa', w: 'qes', e: 'wrd', r: 'etf', t: 'ryg', y: 'tuh', u: 'yij', i: 'uok', o: 'ipl', p: 'ol',
  a: 'qsz', s: 'adw', d: 'sfe', f: 'dgr', g: 'fht', h: 'gjy', j: 'hku', k: 'jli', l: 'ko',
  z: 'xa', x: 'zcs', c: 'xvd', v: 'cbf', b: 'vng', n: 'bmh', m: 'nj',
};
const GLYPHS: Array<[string, string]> = [['o', '0'], ['l', '1'], ['i', '1'], ['i', 'l'], ['l', 'i'], ['e', '3'], ['a', '4'], ['s', '5'], ['m', 'rn'], ['rn', 'm'], ['w', 'vv'], ['vv', 'w']];
const WORDS = ['login', 'support', 'shop', 'official', 'online', 'app', 'secure', 'help', 'store', 'account'];
const TLDS = ['com', 'net', 'org', 'co', 'shop', 'online', 'site', 'store', 'app', 'xyz', 'info'];

type Variant = { domain: string; technique: string };

function generate(brand: string, tld: string): Variant[] {
  const b = brand.toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (b.length < 3) return [];
  const out = new Map<string, string>();
  const add = (sld: string, technique: string, t = tld) => {
    if (sld.length < 2 || sld === b && t === tld) return;
    const d = `${sld}.${t}`;
    if (!out.has(d)) out.set(d, technique);
  };
  for (let i = 0; i < b.length; i++) add(b.slice(0, i) + b.slice(i + 1), 'Missing letter');
  for (let i = 0; i < b.length; i++) add(b.slice(0, i + 1) + b[i] + b.slice(i + 1), 'Doubled letter');
  for (let i = 0; i < b.length - 1; i++) add(b.slice(0, i) + b[i + 1] + b[i] + b.slice(i + 2), 'Swapped letters');
  for (let i = 0; i < b.length; i++) for (const k of KEYS[b[i] ?? ''] ?? '') add(b.slice(0, i) + k + b.slice(i + 1), 'Neighbouring key');
  for (const [from, to] of GLYPHS) {
    let idx = b.indexOf(from);
    while (idx !== -1) {
      add(b.slice(0, idx) + to + b.slice(idx + from.length), 'Look-alike character');
      idx = b.indexOf(from, idx + 1);
    }
  }
  for (let i = 1; i < b.length; i++) add(`${b.slice(0, i)}-${b.slice(i)}`, 'Hyphen inserted');
  for (const w of WORDS) {
    add(`${b}${w}`, 'Brand + word');
    add(`${b}-${w}`, 'Brand + word');
    add(`${w}${b}`, 'Word + brand');
  }
  for (const t of TLDS) if (t !== tld) add(b, 'Other extension', t);
  return [...out.entries()].map(([domain, technique]) => ({ domain, technique }));
}

type Status = 'unknown' | 'checking' | 'taken' | 'free' | 'error';

export function TypoScanner() {
  const [brand, setBrand] = useState('');
  const [tld, setTld] = useState('com');
  const [submitted, setSubmitted] = useState('');
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [busy, setBusy] = useState(false);

  const variants = useMemo(() => generate(submitted, tld), [submitted, tld]);
  const groups = useMemo(() => {
    const m = new Map<string, Variant[]>();
    for (const v of variants) m.set(v.technique, [...(m.get(v.technique) ?? []), v]);
    return [...m.entries()];
  }, [variants]);

  async function checkTop() {
    setBusy(true);
    // Prioritise the patterns cybersquatters use most.
    const order = ['Other extension', 'Missing letter', 'Brand + word', 'Swapped letters', 'Doubled letter', 'Look-alike character'];
    const queue = [...variants].sort((a, b) => order.indexOf(a.technique) - order.indexOf(b.technique) || 0).filter((v) => order.includes(v.technique)).slice(0, 30);
    let i = 0;
    const worker = async () => {
      while (i < queue.length) {
        const v = queue[i++];
        if (!v) break;
        setStatus((s) => ({ ...s, [v.domain]: 'checking' }));
        try {
          const res = await fetch(`/api/rdap?domain=${encodeURIComponent(v.domain)}`);
          const j = await res.json();
          setStatus((s) => ({ ...s, [v.domain]: j.error ? 'error' : j.registered ? 'taken' : 'free' }));
        } catch {
          setStatus((s) => ({ ...s, [v.domain]: 'error' }));
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setBusy(false);
  }

  const taken = Object.entries(status).filter(([, s]) => s === 'taken').map(([d]) => d);

  return (
    <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setStatus({});
          setSubmitted(brand.trim());
        }}
        className="grid gap-3 sm:grid-cols-[1fr_140px_auto]"
      >
        <div>
          <label htmlFor="brand" className="field-label">Brand or domain name (without extension)</label>
          <input id="brand" className="field" placeholder="yourbrand" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <label htmlFor="tld" className="field-label">Main extension</label>
          <select id="tld" className="field" value={tld} onChange={(e) => setTld(e.target.value)}>
            {TLDS.map((t) => (
              <option key={t} value={t}>.{t}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-dark self-end">Generate</button>
      </form>

      {submitted && variants.length === 0 && <p className="mt-5 text-[15px] text-oxblood">Enter at least three letters.</p>}

      {variants.length > 0 && (
        <div className="mt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px]">
              <strong>{variants.length}</strong> look-alike domains for <strong>{submitted}.{tld}</strong>
            </p>
            <button type="button" onClick={checkTop} disabled={busy} className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
              {busy ? 'Checking…' : 'Check the 30 riskiest'}
            </button>
          </div>
          {taken.length > 0 && (
            <div className="mt-4 rounded-lg bg-[#fdebe4] p-4 text-[15px]">
              <strong>{taken.length} variant{taken.length > 1 ? 's are' : ' is'} already registered.</strong> Not every registration is abusive. Check how each one is used before acting.{' '}
              <Link href={`/get-help?situation=brand&domain=${encodeURIComponent(taken.slice(0, 10).join(', '))}`} className="link">
                Get a free review of these domains
              </Link>
            </div>
          )}
          <div className="mt-6 space-y-6">
            {groups.map(([tech, list]) => (
              <section key={tech}>
                <h3 className="text-sm font-semibold text-ink">{tech} <span className="font-normal text-muted">({list.length})</span></h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {list.map((v) => {
                    const s = status[v.domain] ?? 'unknown';
                    return (
                      <li
                        key={v.domain}
                        className={`rounded border px-2 py-1 font-mono text-[13px] ${
                          s === 'taken' ? 'border-oxblood/40 bg-[#fdebe4] text-oxblood' : s === 'free' ? 'border-green/30 bg-[#eef8f2] text-green' : 'border-bone-2 text-ink-soft'
                        }`}
                      >
                        {v.domain}
                        {s === 'checking' && ' …'}
                        {s === 'taken' && ' · registered'}
                        {s === 'free' && ' · available'}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
