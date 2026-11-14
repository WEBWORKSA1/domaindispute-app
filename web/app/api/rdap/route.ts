/**
 * GET /api/rdap?domain=example.com
 * Looks the domain up on its registry's RDAP server (found through IANA's
 * bootstrap file) and returns a compact summary. rdap.org is only a fallback:
 * it rate-limits shared cloud IPs, which broke lookups in production.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { rateLimited } from '@/lib/server/notify';

export const dynamic = 'force-dynamic';

const DOMAIN_RE = /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/;
const BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';

type RdapEntity = { roles?: string[]; vcardArray?: [string, Array<[string, unknown, string, unknown]>] };
type RdapEvent = { eventAction?: string; eventDate?: string };
type RdapDomain = {
  events?: RdapEvent[];
  entities?: RdapEntity[];
  status?: string[];
  nameservers?: Array<{ ldhName?: string }>;
};

// Module-level cache of the IANA bootstrap map (TLD -> RDAP base URL).
let bootstrap: { at: number; map: Map<string, string> } | null = null;

async function rdapBaseFor(tld: string): Promise<string | null> {
  if (!bootstrap || Date.now() - bootstrap.at > 86_400_000) {
    try {
      const res = await fetch(BOOTSTRAP_URL, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = (await res.json()) as { services?: Array<[string[], string[]]> };
        const map = new Map<string, string>();
        for (const [tlds, urls] of json.services ?? []) {
          const url = urls.find((u) => u.startsWith('https://')) ?? urls[0];
          if (!url) continue;
          for (const t of tlds) map.set(t.toLowerCase(), url.endsWith('/') ? url : `${url}/`);
        }
        if (map.size > 0) bootstrap = { at: Date.now(), map };
      }
    } catch {
      /* fall through to rdap.org */
    }
  }
  return bootstrap?.map.get(tld) ?? null;
}

function vcardName(e: RdapEntity): string | null {
  const card = e.vcardArray?.[1];
  const fn = card?.find((x) => x[0] === 'fn');
  // vcard entries are [name, params, type, value]
  return fn ? String(fn[3]) : null;
}

type Attempt = { kind: 'found'; data: RdapDomain } | { kind: 'missing' } | { kind: 'failed'; status: number };

async function query(url: string): Promise<Attempt> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/rdap+json, application/json' },
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    });
    if (res.status === 404) return { kind: 'missing' };
    if (!res.ok) return { kind: 'failed', status: res.status };
    return { kind: 'found', data: (await res.json()) as RdapDomain };
  } catch {
    return { kind: 'failed', status: 0 };
  }
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`rdap:${ip}`, 40)) {
    return NextResponse.json({ error: 'Too many lookups. Wait a minute.' }, { status: 429 });
  }

  const raw = (request.nextUrl.searchParams.get('domain') ?? '').trim().toLowerCase();
  const domain = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? '';
  if (!DOMAIN_RE.test(domain)) {
    return NextResponse.json({ error: 'Enter a full domain name such as example.com.' }, { status: 400 });
  }
  const tld = domain.split('.').pop() ?? '';

  const base = await rdapBaseFor(tld);
  let result: Attempt = { kind: 'failed', status: 0 };
  if (base) result = await query(`${base}domain/${encodeURIComponent(domain)}`);
  if (result.kind === 'failed') result = await query(`https://rdap.org/domain/${encodeURIComponent(domain)}`);

  if (result.kind === 'missing') {
    return NextResponse.json({ domain, registered: false }, { headers: { 'Cache-Control': 'public, s-maxage=600' } });
  }
  if (result.kind === 'failed') {
    const msg = base
      ? 'The registry did not answer. Try again in a minute.'
      : `The .${tld} registry does not publish RDAP data, so this extension cannot be looked up here.`;
    return NextResponse.json({ domain, error: msg }, { status: 502 });
  }

  const data = result.data;
  const ev = (a: string) => data.events?.find((e) => e.eventAction === a)?.eventDate ?? null;
  const registrar = data.entities?.find((e) => e.roles?.includes('registrar'));
  return NextResponse.json(
    {
      domain,
      registered: true,
      created: ev('registration'),
      updated: ev('last changed'),
      expires: ev('expiration'),
      registrar: registrar ? vcardName(registrar) : null,
      status: data.status ?? [],
      nameservers: (data.nameservers ?? []).map((n) => n.ldhName?.toLowerCase() ?? '').filter(Boolean),
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600' } },
  );
}
