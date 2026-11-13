/**
 * POST /api/subscribe - daily brief / docket alert signup.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { deliver, rateLimited } from '@/lib/server/notify';

const SubscribeSchema = z.object({
  email: z.string().trim().email().max(200),
  watch: z.string().max(200).optional(),
  page: z.string().max(300).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(`sub:${ip}`, 4)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  const { email, watch, page, ...utm } = parsed.data;

  let stored = false;
  const sb = createServiceRoleClient();
  if (sb) {
    const { error } = await sb.from('email_subscribers').insert({ email, source: utm.utm_source ?? 'site' });
    stored = !error || error.message.includes('duplicate');
  }

  const { emailed } = await deliver({
    form: 'newsletter',
    formLabel: 'Newsletter signup',
    email,
    page,
    fields: { watchlist: watch ?? '' },
    utm: { source: utm.utm_source, medium: utm.utm_medium, campaign: utm.utm_campaign },
  });

  if (!stored && !emailed) {
    return NextResponse.json({ error: 'Signup is temporarily unavailable. Try again shortly.' }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
