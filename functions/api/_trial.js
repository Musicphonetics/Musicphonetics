// Shared helpers for the /api/trial/* endpoints. Every call uses the service
// role server-side; the browser only ever holds the row's secret token.

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

export const clean = (v, n = 300) => (v == null ? null : String(v).trim().slice(0, n) || null);

export function configured(env) {
  return !!(env && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

// Call a SECURITY DEFINER RPC with the service role. Returns parsed JSON.
export async function callRpc(env, fn, body) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body || {}),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error(`rpc ${fn} failed`, res.status, text.slice(0, 300));
    throw new Error(`rpc ${fn} ${res.status}`);
  }
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

// Basic per-isolate rate limit (mirrors /api/lead).
const HITS = new Map();
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isToken = (t) => typeof t === "string" && UUID_RE.test(t);
