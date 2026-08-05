// POST /api/approve-teacher  (OWNER ONLY)
// The owner reviews a teacher_applications row and approves it here. Only then
// is a Supabase login created and the profile filled from the application.
// Returns the login email + a temporary password for the owner to share, and
// the application data so the owner can print the Offer Letter.
//
// Approval creates the login only; it does NOT email the teacher. Onboarding
// documents are sent from the staged flow (POST /api/send-offer): the owner sends
// the Offer letter → the teacher accepts → the owner sends the Joining agreement
// + login. This keeps offer and joining as deliberate, separate steps.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Auth: Authorization: Bearer <owner access token>. Caller must be role='owner'.

import { provisionFromApplication } from "./_provision.js";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing session" };
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
  });
  if (!uRes.ok) return { ok: false, status: 401, error: "Invalid session" };
  const user = await uRes.json();
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`, { headers: admin(env) });
  const rows = pRes.ok ? await pRes.json() : [];
  if (rows[0]?.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true, user };
}

async function audit(env, entry) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/audit_logs`, {
      method: "POST", headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({ ...entry, source: "server" }),
    });
  } catch { /* best-effort */ }
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured" }, 503);

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const guard = await assertOwner(env, token);
  if (!guard.ok) return json({ ok: false, error: guard.error }, guard.status);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const appId = String(body.application_id || "");
  if (!appId) return json({ ok: false, error: "application_id is required" }, 400);

  // 1) Load the application.
  const aRes = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}&select=*`, { headers: admin(env) });
  const apps = aRes.ok ? await aRes.json() : [];
  const app = apps[0];
  if (!app) return json({ ok: false, error: "Application not found" }, 404);
  if (app.status === "approved" && app.teacher_id) return json({ ok: false, error: "Already approved" }, 409);

  // 2) Provision the login + profile (shared with the accept-offer flow).
  const prov = await provisionFromApplication(env, app);
  if (!prov.ok) return json({ ok: false, error: prov.error }, prov.status || 400);

  // 3) Audit (never include the password). No email here — the owner sends the
  //    offer and joining documents from the staged flow (/api/send-offer).
  await audit(env, {
    actor_id: guard.user?.id ?? null, actor_role: "owner",
    action: "teacher_application_approved", entity_type: "teacher", entity_id: prov.teacherId, teacher_id: prov.teacherId,
    summary: `Approved teacher application for ${app.full_name}`,
  });

  return json({
    ok: true,
    teacher_id: prov.teacherId,
    login_email: app.email,
    temp_password: prov.password,
  });
}
