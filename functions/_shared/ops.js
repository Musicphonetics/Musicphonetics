// Shared helpers for Cloudflare Pages Functions (server-side, service role).
// Files under functions/_shared/ are not routed (leading underscore).

export const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });

export const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

// Verify the caller's Supabase access token and return { ok, user } or an error.
export async function getUser(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing session" };
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
  });
  if (!res.ok) return { ok: false, status: 401, error: "Invalid session" };
  return { ok: true, user: await res.json() };
}

// Owner-gate: valid token AND profiles.role = 'owner'.
export async function assertOwner(env, token) {
  const u = await getUser(env, token);
  if (!u.ok) return u;
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${u.user.id}&select=role`, { headers: admin(env) });
  const rows = pRes.ok ? await pRes.json() : [];
  if (rows[0]?.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true, user: u.user };
}

export const bearer = (request) =>
  (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");

// Append an audit row (service role). Never include secrets in meta.
export async function audit(env, entry) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/audit_logs`, {
      method: "POST",
      headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({
        actor_id: entry.actor_id ?? null,
        actor_role: entry.actor_role ?? null,
        action: entry.action,
        entity_type: entry.entity_type ?? null,
        entity_id: entry.entity_id ?? null,
        student_id: entry.student_id ?? null,
        teacher_id: entry.teacher_id ?? null,
        summary: entry.summary ?? null,
        meta: entry.meta ?? null,
        source: "server", // authoritative server-side write
      }),
    });
  } catch {
    /* best-effort */
  }
}

// Tiny in-memory rate limiter (per isolate). Not global, but blunts bursts and
// simple abuse without extra infra. Keyed by ip+bucket.
const HITS = new Map();
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) {
    HITS.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (rec.count >= limit) return { ok: false, retryAfter: Math.ceil((rec.reset - now) / 1000) };
  rec.count += 1;
  return { ok: true, remaining: limit - rec.count };
}

export const clientIp = (request) =>
  request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";

// Optional same-origin guard. OFF by default (returns false = allow) so it can
// never block legitimate traffic or a future custom domain. Only enforces when
// ALLOWED_ORIGIN_HOSTS is configured; *.pages.dev and localhost stay allowed.
export function badOrigin(request, env) {
  const allow = (env.ALLOWED_ORIGIN_HOSTS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (allow.length === 0) return false; // not configured → never block
  const origin = request.headers.get("origin") || "";
  if (!origin) return false; // non-browser callers have no Origin
  try {
    const host = new URL(origin).host;
    const ok = host.endsWith(".pages.dev") || host.includes("localhost") || allow.includes(host);
    return !ok;
  } catch {
    return false;
  }
}
