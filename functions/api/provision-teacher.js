// POST /api/provision-teacher  (OWNER ONLY)
// Creates a Supabase auth user + promotes/extends their profile to a teacher.
// Uses the SERVICE ROLE key - server-side only, never exposed to the client.
// Written with plain fetch (Supabase Admin/REST API) so it needs no bundler.
//
// Required env (Cloudflare Pages → Settings → Environment variables):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Auth: caller must send Authorization: Bearer <their supabase access token>,
// and that user must have role='owner'.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing bearer token" };
  // 1) Resolve the caller from their JWT.
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
  });
  if (!uRes.ok) return { ok: false, status: 401, error: "Invalid session" };
  const user = await uRes.json();
  // 2) Check their role via the service-role REST endpoint (bypasses RLS).
  const pRes = await fetch(
    `${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const rows = pRes.ok ? await pRes.json() : [];
  if (!rows[0] || rows[0].role !== "owner") {
    return { ok: false, status: 403, error: "Owner access required" };
  }
  return { ok: true, ownerId: user.id };
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

  const { email, phone, full_name } = body || {};
  if (!full_name || (!email && !phone)) {
    return json({ ok: false, error: "full_name and (email or phone) are required" }, 400);
  }

  // Create the auth user. The handle_new_user() trigger creates the profile;
  // role comes from user_metadata (defaults to 'teacher').
  const createRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...(email ? { email, email_confirm: true } : {}),
      ...(phone ? { phone, phone_confirm: true } : {}),
      user_metadata: { full_name, role: "teacher" },
    }),
  });
  const created = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    return json({ ok: false, error: created.msg || created.error_description || "Create failed" }, 400);
  }
  const newId = created.id || created.user?.id;

  // Extend the profile with any optional fields the owner supplied.
  const patch = {};
  for (const k of ["phone", "email", "instruments", "regions", "experience_years",
                   "qualifications", "preferred_modes", "bank_upi"]) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  patch.full_name = full_name;
  patch.role = "teacher";
  if (newId) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${newId}`, {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    });
  }

  return json({ ok: true, teacher_id: newId });
}
