// POST /api/approve-teacher  (OWNER ONLY)
// The owner reviews a teacher_applications row and approves it here. Only then
// is a Supabase login created and the profile filled from the application.
// Returns the login email + a temporary password for the owner to share, and
// the application data so the owner can print the Offer Letter.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Auth: Authorization: Bearer <owner access token>. Caller must be role='owner'.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

function tempPassword() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ", num = "23456789", low = "abcdefghijkmnpqrstuvwxyz";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Mp-${pick(abc, 2)}${pick(low, 3)}${pick(num, 3)}`;
}

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
  return { ok: true };
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
  if (app.status === "approved") return json({ ok: false, error: "Already approved" }, 409);

  const password = tempPassword();

  // 2) Create the auth login.
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin(env),
    body: JSON.stringify({
      email: app.email, password, email_confirm: true,
      user_metadata: { full_name: app.full_name, role: "teacher" },
    }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (!cRes.ok) {
    const msg = created.msg || created.error_description || created.error || "";
    if (/registered|exists|already/i.test(msg)) return json({ ok: false, error: "This email already has a login." }, 409);
    return json({ ok: false, error: "Could not create the login." }, 400);
  }
  const teacherId = created.id || created.user?.id;

  // 3) Fill the profile from the application.
  const bank = [
    app.bank_holder && `A/C name: ${app.bank_holder}`,
    app.bank_name && `Bank: ${app.bank_name}`,
    app.bank_account && `A/C: ${app.bank_account}`,
    app.bank_ifsc && `IFSC: ${app.bank_ifsc}`,
    app.bank_upi && `UPI: ${app.bank_upi}`,
  ].filter(Boolean).join(" · ") || null;

  if (teacherId) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}`, {
      method: "PATCH",
      headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({
        full_name: app.full_name, role: "teacher", phone: app.phone || null, email: app.email,
        instruments: app.instruments || null, regions: app.areas || null, preferred_modes: app.modes || null,
        experience_years: Number.isFinite(Number(app.years_teaching)) ? Number(app.years_teaching) : null,
        qualifications: app.qualification || null, bank_upi: bank,
      }),
    }).catch(() => {});
  }

  // 4) Mark the application approved.
  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}`, {
    method: "PATCH",
    headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ status: "approved", teacher_id: teacherId, approved_at: new Date().toISOString() }),
  }).catch(() => {});

  return json({ ok: true, teacher_id: teacherId, login_email: app.email, temp_password: password });
}
