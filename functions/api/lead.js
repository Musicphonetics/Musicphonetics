// POST /api/lead  (PUBLIC) — the single DB-first capture endpoint for every
// website enquiry. THE DATABASE SAVE IS THE PRIMARY ACTION. It is atomic and
// dedupe-aware (mp_intake_lead), so a burst of 1,000 submissions is each safely
// stored regardless of email. Owner/teacher notification + email happen later
// (in-app immediately when a lead is assigned; email via the outbox worker).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (required — service role bypasses
// RLS to write the lead). No secret ever reaches the browser.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const clean = (v, n = 400) => (v == null ? null : String(v).trim().slice(0, n) || null);

// Per-isolate rate limit: generous, so a real stage event (many IPs) is never
// blocked, but a single abusive IP is throttled.
const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}

// Canonical lead fields accepted from any form.
const FIELDS = [
  "student_name", "parent_name", "email", "phone", "alternate_phone", "student_age",
  "instrument_interest", "preferred_mode", "preferred_area", "city", "preferred_days",
  "preferred_time", "experience_level", "learning_goal", "message", "preferred_program",
  "coupon_code", "source", "campaign", "utm_source", "utm_medium", "utm_campaign",
  "utm_content", "utm_term", "landing_page", "referrer",
];

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, error: "Server not configured." }, 503);
  }
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`lead:${ip}`, 30, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const raw = await request.text();
  if (raw.length > 8000) return json({ ok: false, error: "Bad request" }, 400);
  let b;
  try { b = JSON.parse(raw); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  // Honeypot — silently accept so bots think they succeeded.
  if (clean(b.botcheck, 50)) return json({ ok: true, ref: "ignored" });

  const payload = {};
  for (const k of FIELDS) if (b[k] != null) payload[k] = clean(b[k], k === "message" || k === "learning_goal" ? 1000 : 200);

  // Must have at least a name and a way to reach them.
  const hasContact = (payload.phone && payload.phone.replace(/\D/g, "").length >= 8) || (payload.email && /^\S+@\S+\.\S+$/.test(payload.email));
  if (!hasContact) return json({ ok: false, error: "Please share a phone number or email so we can reach you." }, 400);
  payload.referrer = payload.referrer || clean(request.headers.get("referer"), 300);

  // PRIMARY ACTION — atomic DB save (+ dedupe + activity) via the intake RPC.
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/mp_intake_lead`, {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p: payload }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("mp_intake_lead failed", res.status, t.slice(0, 300));
      return json({ ok: false, error: "Could not save your enquiry. Please try again." }, 502);
    }
    const rows = await res.json().catch(() => []);
    const row = Array.isArray(rows) ? rows[0] : rows;
    return json({ ok: true, lead_code: row?.lead_code ?? null, repeat: !!row?.is_repeat });
  } catch (e) {
    console.error("lead intake error", String(e).slice(0, 300));
    return json({ ok: false, error: "Could not reach the server. Please try again." }, 502);
  }
}
