/**
 * Supabase clients for server code.
 *
 * - getPublicClient(): anon key, NO cookies. Safe for cached/ISR pages because it
 *   never touches request headers. All public reads go through this.
 * - createServiceRoleClient(): service key for writes from API routes only.
 *
 * v1 used a cookie-bound SSR client for every read, which made every page fully
 * dynamic and crashed statically rendered routes. There are no logged-in users,
 * so cookies are unnecessary.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let publicClient: SupabaseClient | null | undefined;

export function getPublicClient(): SupabaseClient | null {
  if (publicClient !== undefined) return publicClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    publicClient = null;
    return publicClient;
  }
  publicClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}

/** Back-compat alias for older imports. Throws when env is missing. */
export function createServerClient(): SupabaseClient {
  const client = getPublicClient();
  if (!client) throw new Error('Missing Supabase env vars');
  return client;
}

export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
