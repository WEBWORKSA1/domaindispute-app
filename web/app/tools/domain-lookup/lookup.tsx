'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Result {
  domain: string;
  registered?: boolean;
  created?: string | null;
  updated?: string | null;
  expires?: string | null;
  registrar?: string | null;
  status?: string[];
  nameservers?: string[];
  error?: string;
}

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '-';

function age(iso?: string | null) {
  if (!iso) return null;
  const years = (Date.now() - Date.parse(iso)) / (365.25 * 86400000);
  return years >= 1 ? `${years.toFixed(1)} years old` : `${Math.max(1, Math.round(years * 12))} months old`;
}

export function DomainLookup() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(d: string) {
    if (!d) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/rdap?domain=${encodeURIComponent(d)}`);
      setResult(await res.json());
    } catch {
      setResult({ domain: d, error: 'Lookup failed. Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get('domain');
    if (d) {
      setDomain(d);
      run(d);
    }
  }, []);

  return (
    <div className="rounded-xl border border-bone-2 p-5 sm:p-7">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(domain.trim());
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label htmlFor="rdap-domain" className="sr-only">
          Domain name
        </label>
        <input id="rdap-domain" className="field flex-1" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
        <button type="submit" className="btn-dark" disabled={loading}>
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      <div aria-live="polite">
        {result?.error && <p className="mt-5 text-[15px] font-medium text-oxblood">{result.error}</p>}
        {result && !result.error && result.registered === false && (
          <p className="mt-5 text-[15px]">
            <strong>{result.domain}</strong> does not appear to be registered.
          </p>
        )}
        {result && !result.error && result.registered && (
          <dl className="mt-6 divide-y divide-bone-2 border-y border-bone-2 text-[15px]">
            <Row label="Domain" value={result.domain} />
            <Row label="Created" value={`${fmt(result.created)}${age(result.created) ? ` (${age(result.created)})` : ''}`} />
            <Row label="Last changed" value={fmt(result.updated)} />
            <Row label="Expires" value={fmt(result.expires)} />
            <Row label="Registrar" value={result.registrar ?? '-'} />
            <Row label="Status" value={result.status?.length ? result.status.join(', ') : '-'} />
            <Row label="Name servers" value={result.nameservers?.length ? result.nameservers.join(', ') : '-'} />
          </dl>
        )}
        {result && !result.error && result.registered && (
          <p className="mt-4 text-sm text-muted">
            A creation date after the complainant&apos;s trademark matters for bad faith, but a transfer to a new owner usually counts as a new registration.{' '}
            <Link href={`/cases?q=${encodeURIComponent(result.domain)}`} className="link">
              Search disputes over {result.domain}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
      <dt className="text-muted">{label}</dt>
      <dd className="break-words font-medium text-ink">{value}</dd>
    </div>
  );
}
