import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser Supabase client (anon key). RLS enforces per-teacher access - the
// anon key is safe to ship. Created lazily so `next build` (static export)
// never crashes when env vars are absent at build time.
let _client: SupabaseClient | null = null;
let _initError: string | null = null;

function rawUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
}
function rawKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
}
// Belt-and-suspenders: ensure an absolute https URL even if the build-time
// normalisation was bypassed.
function normalizedUrl(): string {
  let s = rawUrl().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  if (s && !/^https?:\/\//i.test(s)) s = "https://" + s;
  return s;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(rawUrl() && rawKey());
}

// Returns { client, error } and never throws - callers can show a friendly
// message instead of a white-screen "check console" crash.
export function getSupabaseSafe(): { client: SupabaseClient | null; error: string | null } {
  if (_client) return { client: _client, error: null };
  if (_initError) return { client: null, error: _initError };
  const url = normalizedUrl();
  const key = rawKey();
  if (!url || !key) {
    _initError = "Supabase keys are missing.";
    return { client: null, error: _initError };
  }
  try {
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return { client: _client, error: null };
  } catch (e) {
    _initError = e instanceof Error ? e.message : "Could not connect to Supabase.";
    return { client: null, error: _initError };
  }
}

// Convenience for call sites that assume config is valid.
export function getSupabase(): SupabaseClient {
  const { client, error } = getSupabaseSafe();
  if (!client) throw new Error(error || "Supabase not configured");
  return client;
}
