/**
 * POST /api/subscribe
 * Email subscription for daily case alert.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { inferLeadSource } from '@/lib/precheck/logic';

const SubscribeSchema = z.object({
  email: z.string().email(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = SubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { email, ...utm } = parsed.data;
  const supabase = createServiceRoleClient();

  try {
    const { error: subError } = await supabase
      .from('email_subscribers')
      .insert({
        email,
        source: inferLeadSource(utm),
      });

    if (subError && !subError.message.includes('duplicate key')) {
      throw subError;
    }

    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (!existingLead) {
      await supabase.from('leads').insert({
        email,
        source: 'EMAIL_MAGNET',
        funnel_stage: 'EMAIL_CAPTURED',
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
        last_touch_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Subscribe failed:', e);
    return NextResponse.json({ error: 'Subscribe failed' }, { status: 500 });
  }
}
