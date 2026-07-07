// POST /api/send-invite  (OWNER ONLY)
// Sends a login invite to a provisioned teacher. Email → magic-link/invite;
// phone → OTP (requires an SMS provider configured in Supabase Auth).
// Service-role key server-side only.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing bearer token" };
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
  });
  if (!uRes.ok) return { ok: false, status: 401, error: "Invalid session" };
  const user = await uRes.json();
  const pRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
    { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
  );
  const rows = pRes.ok ? await pRes.json() : [];
  if (!rows[0] || rows[0].role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true };
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, error: "Server not configured" }, 503);
  }
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const guard = await assertOwner(env, token);
  if (!guard.ok) return json({ ok: false, error: guard.error }, guard.status);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad JSON" }, 400); }
  const { email, phone } = body || {};
  if (!email && !phone) return json({ ok: false, error: "email or phone required" }, 400);

  if (phone) {
    // Trigger a phone OTP (needs an SMS provider set in Supabase Auth settings).
    const r = await fetch(`${env.SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!r.ok) return json({ ok: false, error: "OTP send failed (check SMS provider)" }, 400);
    return json({ ok: true, channel: "sms" });
  }

  // Email: generate an invite link (Supabase emails it if SMTP is configured).
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/generate_link`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ type: "invite", email }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) return json({ ok: false, error: data.msg || "Invite failed" }, 400);
  return json({ ok: true, channel: "email", action_link: data.action_link || data.properties?.action_link });
}
