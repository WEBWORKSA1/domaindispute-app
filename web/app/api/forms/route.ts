/**
 * POST /api/forms - single endpoint for every form on the site.
 * Validates, filters spam, stores the lead and forwards it by email server-side.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { FORM_TYPES, isFormType } from '@/lib/forms';
import { deliver, rateLimited } from '@/lib/server/notify';

const Value = z.union([z.string().max(4000), z.number(), z.boolean()]);

const Schema = z.object({
  form: z.string(),
  email: z.string().trim().email().max(200),
  name: z.string().trim().max(120).optional(),
  role: z.string().trim().max(60).optional(),
  page: z.string().max(300).optional(),
  fields: z.record(z.string().max(60), Value).default({}),
  consent: z.boolean().optional(),
  website: z.string().max(500).optional(), // honeypot - must stay empty
  startedAt: z.number().optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many submissions. Wait a minute and try again.' }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'The form could not be read. Refresh the page and try again.' }, { status: 400 });
  }

  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const emailIssue = parsed.error.issues.some((i) => i.path[0] === 'email');
    return NextResponse.json(
      { ok: false, error: emailIssue ? 'Enter a valid email address.' : 'Some fields are missing or too long.' },
      { status: 400 },
    );
  }
  const d = parsed.data;
  if (!isFormType(d.form)) {
    return NextResponse.json({ ok: false, error: 'Unknown form.' }, { status: 400 });
  }

  // Bots: filled honeypot or submitted faster than a human could.
  if (d.website || (d.startedAt && Date.now() - d.startedAt < 2500)) {
    return NextResponse.json({ ok: true });
  }

  const { stored, emailed } = await deliver({
    form: d.form,
    formLabel: FORM_TYPES[d.form],
    email: d.email,
    name: d.name,
    role: d.role,
    page: d.page,
    fields: { ...d.fields, consent: d.consent ?? false },
    utm: { source: d.utm_source, medium: d.utm_medium, campaign: d.utm_campaign },
    ip,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  if (!stored && !emailed) {
    return NextResponse.json(
      { ok: false, error: 'We could not deliver your message right now. Please try again in a few minutes.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
