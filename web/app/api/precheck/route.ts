/**
 * POST /api/precheck
 * Pre-Check intake endpoint. Validates input, runs the heuristic, and captures lead.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { runPreCheck, inferLeadSource, verdictToFunnelStage } from '@/lib/precheck/logic';
import { createServiceRoleClient } from '@/lib/supabase/server';

const PreCheckSchema = z.object({
  role: z.enum(['COMPLAINANT', 'RESPONDENT', 'COUNSEL']),
  domain: z.string().min(4).max(253),
  hasTrademark: z.boolean(),
  domainOlderThanTM: z.boolean(),
  hasOfferedToBuy: z.boolean(),
  email: z.string().email().optional().or(z.literal('')),
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

  const parsed = PreCheckSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const result = runPreCheck(input);

  if (input.email) {
    try {
      const supabase = createServiceRoleClient();
      await supabase.from('leads').insert({
        email: input.email,
        source: inferLeadSource(input),
        case_facts_summary: {
          role: input.role,
          domain: input.domain,
          hasTrademark: input.hasTrademark,
          domainOlderThanTM: input.domainOlderThanTM,
          hasOfferedToBuy: input.hasOfferedToBuy,
          verdict: result.verdict,
        },
        user_role: input.role,
        funnel_stage: verdictToFunnelStage(result.verdict),
        utm_source: input.utm_source,
        utm_medium: input.utm_medium,
        utm_campaign: input.utm_campaign,
        last_touch_at: new Date().toISOString(),
      });

      await supabase
        .from('email_subscribers')
        .insert({
          email: input.email,
          source: inferLeadSource(input),
          jurisdiction: null,
        })
        .select()
        .then(() => {});
    } catch (e) {
      console.error('Lead capture failed:', e);
    }
  }

  return NextResponse.json({ result });
}
