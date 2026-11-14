/**
 * Server-only form delivery. NEVER import this file from a client component.
 *
 * Every submission is (1) stored in Supabase `leads` and (2) forwarded by email
 * through FormSubmit's AJAX endpoint. The destination address lives only here
 * and in the CONTACT_FORWARD_EMAIL env var; it is never sent to the browser.
 */

import { SITE } from '@/lib/site';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Server-only. Encoded so the address never appears in plain text, even in the repo.
const FORWARD_TO = process.env.CONTACT_FORWARD_EMAIL || Buffer.from('d2Vid29ya3NhMUBnbWFpbC5jb20=', 'base64').toString('utf8');

export interface Submission {
  form: string;
  formLabel: string;
  email: string;
  name?: string;
  role?: string;
  page?: string;
  fields: Record<string, string | number | boolean>;
  utm?: { source?: string; medium?: string; campaign?: string };
  ip?: string;
  userAgent?: string;
}

async function storeLead(s: Submission): Promise<boolean> {
  const sb = createServiceRoleClient();
  if (!sb) return false;
  try {
    const { error } = await sb.from('leads').insert({
      email: s.email,
      source: s.utm?.source ? 'OTHER' : 'ORGANIC',
      user_role: s.role ?? s.form,
      case_facts_summary: {
        form: s.form,
        name: s.name ?? null,
        page: s.page ?? null,
        fields: s.fields,
        submitted_at: new Date().toISOString(),
        ua: s.userAgent?.slice(0, 200) ?? null,
      },
      utm_source: s.utm?.source ?? null,
      utm_medium: s.utm?.medium ?? null,
      utm_campaign: s.utm?.campaign ?? null,
      last_touch_at: new Date().toISOString(),
    });
    if (error) {
      console.error('lead insert failed', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('lead insert threw', e);
    return false;
  }
}

async function forwardEmail(s: Submission): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const body: Record<string, string> = {
      _subject: `[DomainsDispute] ${s.formLabel}: ${s.name || s.email}`,
      _template: 'table',
      _captcha: 'false',
      _replyto: s.email,
      form: s.formLabel,
      name: s.name ?? '',
      email: s.email,
      page: s.page ?? '',
    };
    for (const [k, v] of Object.entries(s.fields)) body[k] = String(v);
    if (s.utm?.source) body.utm = [s.utm.source, s.utm.medium, s.utm.campaign].filter(Boolean).join(' / ');

    const res = await fetch(`https://formsubmit.co/ajax/${FORWARD_TO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: SITE.url,
        Referer: `${SITE.url}${s.page ?? '/contact'}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = (await res.json().catch(() => ({}))) as { success?: string | boolean };
    return res.ok && String(json.success) !== 'false';
  } catch (e) {
    console.error('email forward failed', e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function deliver(s: Submission): Promise<{ stored: boolean; emailed: boolean }> {
  const [stored, emailed] = await Promise.all([storeLead(s), forwardEmail(s)]);
  return { stored, emailed };
}

// Best-effort in-memory rate limit (per serverless instance).
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max = 6, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
