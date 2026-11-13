/**
 * GET /api/rdap?domain=example.com
 * Proxies the public RDAP bootstrap (rdap.org) and returns a compact summary.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { rateLimited } from '@/lib/server/notify';

const DOMAIN_RE = /^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/;

type RdapEntity = { roles?: string[]; vcardArray?: [string, Array<[string, unknown, string, unknown]>] };
type RdapEvent = { eventAction?: string; eventDate?: string };

function vcardName(e: RdapEntity): string | null {
  const card = e.vcardArray?.[1];
  const fn = card?.find((x) => x[0] === 'fn');
  // vcard entries are [name, params, type, value]
  return fn ? String(fn[3]) : null;
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      headers: { Accept: 'application/rdap+json, application/json' },
      redirect: 'follow',
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (res.status === 404) {
      return NextResponse.json({ domain, registered: false });
    }
    if (!res.ok) {
      return NextResponse.json({ domain, error: `The registry did not answer (HTTP ${res.status}). Try again later.` }, { status: 502 });
    }
    const data = (await res.json()) as {
      events?: RdapEvent[];
      entities?: RdapEntity[];
      status?: string[];
      nameservers?: Array<{ ldhName?: string }>;
    };
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
  } catch {
    return NextResponse.json({ domain, error: 'Lookup timed out. Some registries do not support RDAP yet.' }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
