import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client initialisation.
 *
 * Two flavours:
 *  - `getSupabaseBrowser()` -> anon key, safe to ship to the browser. Used for
 *    nothing that reads private data; every write still goes through an RLS
 *    "insert only" policy (see supabase/schema.sql).
 *  - `getSupabaseServer()`  -> used inside API routes. Prefers the service role
 *    key when it is present so analytics writes can never be blocked by RLS,
 *    and falls back to the anon key when it is not.
 *
 * Both return `null` when the env vars are missing. That is deliberate: a
 * fake-door landing page must never 500 or block a click because analytics is
 * misconfigured. The UI stays fully usable, the write is simply skipped.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}

let serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;
  if (!url || !key) return null;
  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}
